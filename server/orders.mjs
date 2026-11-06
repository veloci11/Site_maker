import { Router } from 'express';
import { isDeepStrictEqual } from 'node:util';
import { defaultPricing, OFFER_IDS, optionDefinitions, normalizeConfiguration, quoteConfiguration } from '../shared/catalog.ts';
import { getDb, getOwnedProject, newId, now, parseJson, projectDto, transaction } from './db.mjs';
import { requireAuth as signedIn, requireAdmin } from './auth.mjs';
import { fileDto } from './files.mjs';

const optionKeys = optionDefinitions.map(option => option.id);
const legacyOptionKeys = ['language-en', 'managed-content', 'scene-3d', 'deployment', 'maintenance-monthly'];
class InputError extends Error {}
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function keys(value, allowed) {
  if (!record(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new InputError('Vérifiez les informations envoyées.');
}
function guard(handler) { return (req, res, next) => { try { handler(req, res, next); } catch (error) { if (error instanceof InputError) return res.status(400).json({ error: error.message, code: 'INVALID_INPUT' }); next(error); } }; }
function initialize() {
  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS studio_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL CHECK(json_valid(value)), updated_at TEXT NOT NULL) STRICT;
    CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,subject TEXT NOT NULL,message TEXT NOT NULL,created_at TEXT NOT NULL) STRICT;
    CREATE TABLE IF NOT EXISTS inquiry_status (inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,status TEXT NOT NULL,updated_at TEXT NOT NULL) STRICT;`);
  return db;
}

/** Prices are server-owned cents. Published defaults replace only the unpriced launch catalogue. */
export function getPricing() {
  const row = initialize().prepare("SELECT value FROM studio_settings WHERE key = 'pricing'").get();
  const candidate = row ? parseJson(row.value, {}) : {};
  const stored = record(candidate) ? candidate : {};
  const unpublishedDraft = /^draft-v\d+$/.test(stored.version ?? '') &&
    (!stored.currency || stored.currency === 'EUR') &&
    [...Object.values(stored.base ?? {}), ...Object.values(stored.options ?? {})].every(value => value === null);
  if (!row || unpublishedDraft) return structuredClone(defaultPricing);
  const amount = value => value === null || (Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000) ? value : null;
  return {
    version: typeof stored.version === 'string' && stored.version ? stored.version : defaultPricing.version,
    currency: ['EUR', 'CHF'].includes(stored.currency) ? stored.currency : defaultPricing.currency,
    base: Object.fromEntries(OFFER_IDS.map(key => [key, key === 'sur-mesure' ? null : amount(stored.base?.[key] ?? null)])),
    options: Object.fromEntries(optionKeys.map(key => [key, amount(stored.options?.[key] ?? null)])),
  };
}

/** No payment adapter is enabled in this release. Never treat a saved draft as a paid order. */
export function getPaymentAvailability() {
  return { enabled: false, reason: 'Les paiements ne sont pas encore ouverts. Vous pouvez préparer et enregistrer votre dossier.' };
}

function validatePricing(input) {
  keys(input, ['currency', 'base', 'options']);
  if (!['EUR', 'CHF'].includes(input.currency)) throw new InputError('Choisissez EUR ou CHF.');
  for (const [value, allowed, required] of [[input.base, OFFER_IDS, OFFER_IDS], [input.options, optionKeys, legacyOptionKeys]]) {
    keys(value, allowed);
    if (required.some(key => !Object.hasOwn(value, key))) throw new InputError('Renseignez chaque tarif, ou laissez-le en attente.');
    for (const amount of Object.values(value)) if (amount !== null && (!Number.isSafeInteger(amount) || amount < 0 || amount > 1_000_000_000)) throw new InputError('Un tarif doit être un montant positif en centimes, ou null.');
  }
  if (input.base['sur-mesure'] !== null) throw new InputError('Le forfait Sur mesure reste sur devis.');
  // Older admin clients still submit the original five keys. A new service that
  // they do not know about remains unpriced, rather than becoming a free option.
  return { version: newId(), currency: input.currency, base: { ...input.base }, options: Object.fromEntries(optionKeys.map(key => [key, Object.hasOwn(input.options, key) ? input.options[key] : null])) };
}

function validateBilling(input) {
  const allowed = ['fullName', 'company', 'email', 'address', 'postalCode', 'city', 'country', 'vatNumber'];
  keys(input, allowed);
  const limits = { fullName: 120, company: 160, email: 254, address: 240, postalCode: 20, city: 120, country: 2, vatNumber: 40 };
  const fields = {};
  for (const key of allowed) {
    const value = input[key] ?? '';
    if (typeof value !== 'string' || value.length > limits[key] || /[\u0000-\u001f\u007f]/.test(value)) throw new InputError('Les coordonnées contiennent un champ invalide.');
    fields[key] = value.trim();
  }
  for (const key of ['fullName', 'email', 'address', 'postalCode', 'city', 'country']) if (!fields[key]) throw new InputError('Complétez votre nom, votre e-mail et votre adresse.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) throw new InputError('Indiquez une adresse e-mail valide.');
  fields.email = fields.email.toLowerCase();
  fields.country = fields.country.toUpperCase();
  if (!/^[A-Z]{2}$/.test(fields.country)) throw new InputError('Indiquez un pays avec son code à deux lettres.');
  return fields;
}

function snapshotFor(project, pricing) {
  const configuration = normalizeConfiguration(parseJson(project.configuration));
  return { projectName: project.name, configuration, quote: quoteConfiguration(configuration, pricing) };
}
function orderDto(row) {
  if (!row) return null;
  const snapshot = parseJson(row.configuration_snapshot);
  const monthlyTotalCents = snapshot.quote?.monthlyTotalCents === undefined ? 0 : snapshot.quote.monthlyTotalCents;
  return { id: row.id, projectId: row.project_id, status: row.status, snapshot, billing: parseJson(row.billing), totalCents: row.total_cents, monthlyTotalCents, currency: row.currency, createdAt: row.created_at, updatedAt: row.updated_at };
}
/** Read older snapshots without rewriting their saved bytes or pretending their selection changed. */
function snapshotIsCurrent(serialized, current) {
  const saved = parseJson(serialized);
  if (!saved.configuration || !Array.isArray(saved.quote?.lines)) return false;
  try {
    const compareEstimates = Object.hasOwn(saved.quote, 'maximumTotalCents');
    const commercialLines = (lines, includedAdditions = []) => {
      const values = new Map();
      for (const line of lines) {
        const billing = line?.billing ?? 'once';
        if (!record(line) || typeof line.key !== 'string' || !line.key || values.has(line.key)
          || (line.amountCents !== null && (!Number.isSafeInteger(line.amountCents) || line.amountCents < 0))
          || typeof line.included !== 'boolean' || !['once', 'monthly'].includes(billing)) throw new Error('Invalid snapshot line');
        const maximumCents = line.maximumCents === undefined ? line.amountCents : line.maximumCents;
        if (compareEstimates && ((maximumCents !== null && (!Number.isSafeInteger(maximumCents) || maximumCents < (line.amountCents ?? 0)))
          || (line.estimated !== undefined && typeof line.estimated !== 'boolean'))) throw new Error('Invalid snapshot estimate');
        values.set(line.key, { key: line.key, amountCents: line.amountCents, billing, included: line.included,
          ...(compareEstimates ? { maximumCents, estimated: line.estimated ?? false } : {}),
        });
      }
      for (const line of includedAdditions) {
        if (line.included && line.amountCents === 0 && !values.has(line.key)) values.set(line.key, line);
      }
      return [...values.values()].sort((a, b) => a.key.localeCompare(b.key));
    };
    const currentLines = commercialLines(current.quote.lines);
    const comparable = (snapshot, lines) => ({ projectName: snapshot.projectName, configuration: normalizeConfiguration(snapshot.configuration), quote: {
      currency: snapshot.quote.currency, lines,
      totalCents: snapshot.quote.totalCents, monthlyTotalCents: snapshot.quote.monthlyTotalCents === undefined ? 0 : snapshot.quote.monthlyTotalCents,
      checkoutReady: snapshot.quote.checkoutReady, requiresQuote: snapshot.quote.requiresQuote,
      ...(compareEstimates ? { maximumTotalCents: snapshot.quote.maximumTotalCents, estimated: snapshot.quote.estimated ?? false } : {}),
    } });
    // Labels, display order and catalogue-version metadata do not change a
    // commercial selection. New free package inclusions also preserve a legacy
    // snapshot; actual prices, billing frequencies and chosen features must match.
    // Old snapshots have no range metadata and stay byte-identical. Once bounds
    // are saved, a later change to either bound requires a new commercial draft.
    return isDeepStrictEqual(comparable(saved, commercialLines(saved.quote.lines, currentLines)), comparable(current, currentLines));
  } catch { return false; }
}
function latestOrder(projectId, db = getDb()) { return db.prepare('SELECT * FROM orders WHERE project_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1').get(projectId); }
function orderResponse(project, db = getDb()) {
  const pricing = getPricing();
  const snapshot = snapshotFor(project, pricing);
  const row = latestOrder(project.id, db);
  return { order: orderDto(row), quote: snapshot.quote, isCurrent: !!row && snapshotIsCurrent(row.configuration_snapshot, snapshot), payment: getPaymentAvailability() };
}

/** Mount at /api after session and CSRF middleware. Customer routes remain owner-only. */
export function createOrdersRouter({ requireAuth = signedIn } = {}) {
  const router = Router();
  router.use(requireAuth);
  function owner(req, res, next) {
    const project = getOwnedProject(req.params.projectId, req.user.id);
    if (!project) return res.status(404).json({ error: 'Ce projet est introuvable.' });
    req.orderProject = project; next();
  }
  router.get('/projects/:projectId/order', owner, guard((req, res) => res.json(orderResponse(req.orderProject))));
  router.put('/projects/:projectId/order', owner, guard((req, res) => {
    keys(req.body, ['billing']);
    const billing = validateBilling(req.body.billing);
    const db = initialize();
    const snapshot = snapshotFor(req.orderProject, getPricing());
    const serialized = JSON.stringify(snapshot);
    const previous = latestOrder(req.orderProject.id, db);
    const timestamp = now();
    transaction(() => {
      if (previous?.status === 'draft' && snapshotIsCurrent(previous.configuration_snapshot, snapshot)) {
        db.prepare('UPDATE orders SET billing = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(billing), timestamp, previous.id);
      } else {
        if (previous?.status === 'draft') db.prepare("UPDATE orders SET status = 'superseded', updated_at = ? WHERE id = ?").run(timestamp, previous.id);
        db.prepare(`INSERT INTO orders(id,project_id,user_id,status,configuration_snapshot,billing,total_cents,currency,created_at,updated_at)
          VALUES (?,?,?,'draft',?,?,?,?,?,?)`).run(newId(), req.orderProject.id, req.user.id, serialized, JSON.stringify(billing), snapshot.quote.totalCents, snapshot.quote.currency, timestamp, timestamp);
      }
    });
    res.json({ ...orderResponse(req.orderProject, db), message: 'Votre dossier est enregistré. Aucun paiement n’a été effectué.' });
  }));
  router.post('/projects/:projectId/checkout', owner, guard((req, res) => {
    keys(req.body ?? {}, ['orderId']);
    const response = orderResponse(req.orderProject);
    if (!response.quote.checkoutReady) return res.status(409).json({ error: response.quote.requiresQuote ? 'Ce projet nécessite un devis avant tout engagement.' : 'Le prix de ce projet doit être précisé avant toute commande.', code: 'PRICE_UNAVAILABLE' });
    if (!response.order || req.body?.orderId !== response.order.id || !response.isCurrent) return res.status(409).json({ error: 'Enregistrez votre dossier avec la configuration actuelle.', code: 'ORDER_STALE' });
    return res.status(503).json({ error: getPaymentAvailability().reason, code: 'PAYMENT_UNAVAILABLE' });
  }));

  router.use('/admin', requireAdmin);
  router.get('/admin/pricing', guard((_req, res) => res.json({ pricing: getPricing(), payment: getPaymentAvailability() })));
  router.put('/admin/pricing', guard((req, res) => {
    const pricing = validatePricing(req.body);
    initialize().prepare(`INSERT INTO studio_settings(key,value,updated_at) VALUES ('pricing',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).run(JSON.stringify(pricing), now());
    res.json({ pricing, payment: getPaymentAvailability() });
  }));
  router.get('/admin/projects', guard((_req, res) => {
    const projects = initialize().prepare(`SELECT p.*,u.name AS customer_name,u.email AS customer_email FROM projects p JOIN users u ON u.id=p.user_id ORDER BY p.updated_at DESC,p.rowid DESC LIMIT 200`).all()
      .map(row => ({ ...projectDto(row), customer: { name: row.customer_name, email: row.customer_email } }));
    res.json({ projects });
  }));
  router.get('/admin/projects/:projectId', guard((req, res) => {
    const db = initialize();
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.projectId);
    if (!row) return res.status(404).json({ error: 'Ce projet est introuvable.' });
    const customer = db.prepare('SELECT id,name,email FROM users WHERE id = ?').get(row.user_id);
    const contents = db.prepare('SELECT * FROM contents WHERE project_id = ? ORDER BY page_key').all(row.id).map(item => ({ pageKey: item.page_key, title: item.title, data: parseJson(item.data), updatedAt: item.updated_at }));
    const files = db.prepare('SELECT * FROM files WHERE project_id = ? AND deleted_at IS NULL ORDER BY created_at DESC').all(row.id).map(fileDto);
    const orders = db.prepare('SELECT * FROM orders WHERE project_id = ? ORDER BY created_at DESC,rowid DESC LIMIT 30').all(row.id).map(orderDto);
    res.json({ project: projectDto(row), customer, contents, files, orders, ...orderResponse(row, db) });
  }));
  router.get('/admin/inquiries', guard((_req, res) => {
    const inquiries = initialize().prepare(`SELECT i.*,COALESCE(s.status,'new') AS status FROM inquiries i LEFT JOIN inquiry_status s ON s.inquiry_id=i.id ORDER BY i.created_at DESC,i.rowid DESC LIMIT 200`).all()
      .map(row => ({ id: row.id, name: row.name, email: row.email, subject: row.subject, message: row.message, createdAt: row.created_at, status: row.status }));
    res.json({ inquiries });
  }));
  router.patch('/admin/inquiries/:inquiryId', guard((req, res) => {
    keys(req.body, ['status']);
    if (!['new', 'reviewed'].includes(req.body.status)) throw new InputError('Choisissez un état valide.');
    const db = initialize();
    if (!db.prepare('SELECT id FROM inquiries WHERE id = ?').get(req.params.inquiryId)) return res.status(404).json({ error: 'Cette demande est introuvable.' });
    db.prepare('INSERT INTO inquiry_status(inquiry_id,status,updated_at) VALUES (?,?,?) ON CONFLICT(inquiry_id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at').run(req.params.inquiryId, req.body.status, now());
    res.json({ ok: true, status: req.body.status });
  }));
  return router;
}
