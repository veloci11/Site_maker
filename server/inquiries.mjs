import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createHash } from 'node:crypto';
import { getDb, newId, now, transaction } from './db.mjs';
import { csrfProtection } from './auth.mjs';
import { getPricing } from './orders.mjs';
import { getOffer, normalizeConfiguration, quoteConfiguration, formatMoney } from '../shared/catalog.ts';
import { validateInquiryContact } from '../shared/inquiry-contact.ts';
import { isRequestType, requestTypeLabels, summarizeBrief, validateBrief } from '../shared/brief.ts';
import { getUnavailableOptions } from '../shared/offer-options.ts';
import { InquiryImageError, parseInquiryTransport, validateInquiryImages } from './inquiry-images.mjs';

const RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const oneLineControls = /[\u0000-\u001f\u007f]/;
const DEFAULT_STORAGE_LIMIT_BYTES = 512 * 1024 * 1024;
const creationTypes = ['vitrine', 'connecte', 'immersif', 'sur-mesure'];
const payloadKeys = ['schemaVersion', 'requestId', 'requestType', 'firstName', 'lastName', 'email', 'phone', 'company', 'configuration', 'brief', 'website'];
const configurationKeys = ['offerId', 'language', 'mobile', 'managedContent', 'scene3d', 'deployment', 'maintenance', 'extras'];

class InputError extends Error {
  constructor(fields) {
    super('Vérifiez les informations de votre demande.');
    this.fields = fields;
  }
}
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value)); }
function hasOnlyKeys(value, allowed) { return record(value) && Reflect.ownKeys(value).every(key => allowed.includes(key)); }
function email(value) { return typeof value === 'string' && value.length <= 254 && !oneLineControls.test(value) && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value); }

/** Tables extend, rather than replace, the historical administration inbox. */
export function initializeInquiries(db = getDb()) {
  db.exec(`CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,subject TEXT NOT NULL,message TEXT NOT NULL,created_at TEXT NOT NULL) STRICT;
    CREATE TABLE IF NOT EXISTS inquiry_details (
      inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,
      request_id TEXT UNIQUE, payload_hash TEXT NOT NULL,
      phone TEXT NOT NULL, company TEXT NOT NULL, inspiration TEXT NOT NULL,
      configuration_snapshot TEXT NOT NULL CHECK(json_valid(configuration_snapshot)),
      quote_snapshot TEXT NOT NULL CHECK(json_valid(quote_snapshot))
    ) STRICT;
    CREATE TABLE IF NOT EXISTS inquiry_briefs (
      inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,
      schema_version INTEGER NOT NULL CHECK(schema_version = 2),
      request_type TEXT NOT NULL CHECK(request_type IN ('vitrine','connecte','immersif','sur-mesure','evolution','refonte','contact')),
      first_name TEXT NOT NULL CHECK(length(trim(first_name)) BETWEEN 1 AND 80),
      last_name TEXT NOT NULL CHECK(length(trim(last_name)) BETWEEN 1 AND 80),
      brief_snapshot TEXT NOT NULL CHECK(json_valid(brief_snapshot) AND json_type(brief_snapshot) = 'object')
    ) STRICT;
    CREATE TABLE IF NOT EXISTS inquiry_attachments (
      id TEXT PRIMARY KEY,
      inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
      position INTEGER NOT NULL CHECK(position BETWEEN 0 AND 5),
      original_name TEXT NOT NULL CHECK(length(original_name) BETWEEN 1 AND 120),
      mime TEXT NOT NULL CHECK(mime IN ('image/jpeg','image/png','image/webp')),
      size INTEGER NOT NULL CHECK(size BETWEEN 1 AND 5242880),
      sha256 TEXT NOT NULL CHECK(length(sha256) = 64 AND sha256 NOT GLOB '*[^0-9a-f]*'),
      width INTEGER NOT NULL CHECK(width > 0),
      height INTEGER NOT NULL CHECK(height > 0 AND width * height <= 16000000),
      bytes BLOB NOT NULL CHECK(length(bytes) = size),
      created_at TEXT NOT NULL,
      UNIQUE(inquiry_id, position)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS inquiry_outbox (
      inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK(status IN ('pending','unavailable','processing','retry','accepted','failed','expired')),
      attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts >= 0),
      next_attempt_at TEXT NOT NULL, lease_until TEXT, lease_token TEXT,
      first_attempt_at TEXT, deadline_at TEXT,
      payload TEXT CHECK(payload IS NULL OR json_valid(payload)),
      provider_id TEXT, last_error_code TEXT, updated_at TEXT NOT NULL
    ) STRICT;
    CREATE INDEX IF NOT EXISTS inquiry_outbox_due ON inquiry_outbox(status,next_attempt_at);
  `);
  return db;
}

function deliveryConfiguration(env) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.RESEND_FROM?.trim();
  const to = env.INQUIRY_TO?.trim();
  const address = from?.includes('<') ? from.match(/^[^<>\r\n]{1,120}<([^<>]+)>$/)?.[1]?.trim() : from;
  if (!apiKey || apiKey.length > 256 || /\s/.test(apiKey) || !from || oneLineControls.test(from) || !email(address) || !email(to)) return null;
  return { apiKey, from, to };
}

function validate(input) {
  if (!hasOnlyKeys(input, payloadKeys)) throw new InputError({ form: 'Les informations de cette demande ne correspondent pas au formulaire.' });
  const fields = {};
  if (input.schemaVersion !== 2) fields.form = 'Rechargez le formulaire avant d’envoyer votre demande.';
  const requestId = typeof input.requestId === 'string' ? input.requestId.trim().toLowerCase() : '';
  if (!UUID.test(requestId)) fields.requestId = 'La référence de votre demande n’est pas valide. Rechargez le formulaire.';
  if (!isRequestType(input.requestType)) fields.requestType = 'Choisissez un type de demande valide.';
  if (input.website !== undefined && (typeof input.website !== 'string' || input.website.length > 400 || oneLineControls.test(input.website))) fields.form = 'Les informations de cette demande ne sont pas valides.';
  const contactResult = validateInquiryContact(Object.fromEntries(['firstName', 'lastName', 'email', 'phone', 'company'].filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]])));
  Object.assign(fields, contactResult.fields);
  let configuration = null;
  if (creationTypes.includes(input.requestType)) {
    if (!hasOnlyKeys(input.configuration, configurationKeys) || input.configuration.offerId !== input.requestType) fields.configuration = 'Choisissez la configuration correspondant à votre forfait.';
    else {
      try {
        configuration = normalizeConfiguration(input.configuration);
        if (getUnavailableOptions(configuration).length) fields.configuration = 'Certaines options ne correspondent pas à ce forfait. Vérifiez votre configuration.';
      } catch { fields.configuration = 'Vérifiez le forfait et les options choisies.'; }
    }
  } else if (input.configuration !== null) {
    fields.configuration = 'Cette demande doit être envoyée sans configuration de forfait.';
  }
  const briefResult = validateBrief(input.requestType, input.brief, configuration);
  const briefFields = Object.fromEntries(Object.entries(briefResult.fields).map(([key, value]) => [key === '_form' ? 'form' : key, value]));
  const errors = { ...fields, ...briefFields };
  if (Object.keys(errors).length) throw new InputError(errors);
  return { schemaVersion: 2, requestId, requestType: input.requestType, ...contactResult.contact, configuration, brief: briefResult.answers };
}

function summary(configuration, quote) {
  if (!configuration) return '';
  return [`Forfait : ${getOffer(configuration.offerId).title}`, ...quote.lines.map(line => `${line.label} : ${line.included ? 'compris dans le forfait' : line.amountCents === null ? 'à préciser' : formatMoney(line.amountCents, quote.currency)}${line.billing === 'monthly' ? ' / mois' : ''}`),
    `Création : ${quote.totalCents === null ? 'à préciser' : formatMoney(quote.totalCents, quote.currency)}`,
    `Mensuel : ${quote.monthlyTotalCents === null ? 'à préciser' : formatMoney(quote.monthlyTotalCents, quote.currency)} / mois`,
    'Estimation de préparation ; aucun paiement ni engagement commercial enregistré.'].join('\n');
}

function storageLimit(env) {
  const configured = env.INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES;
  if (typeof configured !== 'string' || !/^[0-9]+$/.test(configured)) return DEFAULT_STORAGE_LIMIT_BYTES;
  const bytes = Number(configured);
  return Number.isSafeInteger(bytes) && bytes > 0 ? bytes : DEFAULT_STORAGE_LIMIT_BYTES;
}

function adminUrl(env, id) {
  let origin = 'https://gilmathis.com';
  if (typeof env.APP_ORIGIN === 'string' && /^https?:\/\//i.test(env.APP_ORIGIN) && !/[\s\\]/u.test(env.APP_ORIGIN)) {
    try {
      const url = new URL(env.APP_ORIGIN);
      if (['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password && !env.APP_ORIGIN.match(/^https?:\/\/([^/?#]*)/i)?.[1]?.includes('@')) origin = url.origin;
    } catch { /* Keep the known public origin when configuration is invalid. */ }
  }
  return `${origin}/admin?onglet=demandes&demande=${encodeURIComponent(id)}`;
}

function humanMessage(value, quote, images, env, id) {
  const sections = summarizeBrief(value.requestType, value.brief, { configuration: value.configuration }).map(section => [section.title, ...section.items.map(item => `${item.label}\n${item.value}`)].join('\n\n'));
  return [
    `Demande : ${requestTypeLabels[value.requestType]}`,
    [`Prénom : ${value.firstName}`, `Nom : ${value.lastName}`, `E-mail : ${value.email}`, `Téléphone : ${value.phone}`, value.company && `Entreprise : ${value.company}`].filter(Boolean).join('\n'),
    ...sections,
    summary(value.configuration, quote),
    images.length ? ['Images jointes :', ...images.map((image, index) => `${index + 1}. ${image.originalName} — ${image.mime}, ${image.size} octets (${image.width} × ${image.height})`)].join('\n') : 'Images jointes : aucune.',
    `Consulter la demande dans l’administration : ${adminUrl(env, id)}`,
  ].filter(Boolean).join('\n\n');
}

function notification(status, configured) {
  return status === 'accepted' ? 'accepted' : configured && ['pending', 'retry', 'processing', 'unavailable'].includes(status) ? 'queued' : 'unavailable';
}

/** Anonymous endpoint; stores and queues only. No network send occurs in a request. */
export function createInquiriesRouter({ env = process.env, limit = 8, windowMs = 15 * 60 * 1000 } = {}) {
  const router = Router();
  router.use(csrfProtection);
  router.post('/', rateLimit({ windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Plusieurs demandes ont déjà été enregistrées. Réessayez un peu plus tard.', code: 'RATE_LIMITED' } }), parseInquiryTransport, async (req, res, next) => {
    try {
      // A filled trap receives a neutral response but never creates mail or data.
      if (record(req.body) && typeof req.body.website === 'string' && req.body.website.trim()) return res.status(200).json({ ok: true, id: newId(), notification: 'unavailable' });
      const value = validate(req.body);
      const images = await validateInquiryImages(req.files);
      const fingerprint = createHash('sha256').update(JSON.stringify({ ...value, images: images.map((image, position) => ({ position, originalName: image.originalName, mime: image.mime, size: image.size, sha256: image.sha256 })) })).digest('hex');
      const configured = !!deliveryConfiguration(env);
      const result = transaction(db => {
        initializeInquiries(db);
        const existing = db.prepare('SELECT d.inquiry_id,d.payload_hash,o.status FROM inquiry_details d LEFT JOIN inquiry_outbox o ON o.inquiry_id=d.inquiry_id WHERE d.request_id = ?').get(value.requestId);
        if (existing) return existing.payload_hash === fingerprint ? { id: existing.inquiry_id, status: existing.status || 'unavailable', duplicate: true } : { conflict: true };
        if (images.length) {
          const occupied = db.prepare('SELECT COALESCE(SUM(size),0) AS bytes FROM inquiry_attachments').get().bytes;
          if (occupied + images.reduce((total, image) => total + image.size, 0) > storageLimit(env)) return { storageLimit: true };
        }
        const quote = value.configuration ? quoteConfiguration(value.configuration, getPricing()) : null;
        const id = newId(), timestamp = now();
        const message = humanMessage(value, quote, images, env, id);
        const subject = value.configuration ? `Projet ${requestTypeLabels[value.requestType]}` : requestTypeLabels[value.requestType];
        db.prepare('INSERT INTO inquiries(id,name,email,subject,message,created_at) VALUES(?,?,?,?,?,?)').run(id, `${value.firstName} ${value.lastName}`, value.email, subject, message, timestamp);
        db.prepare('INSERT INTO inquiry_details(inquiry_id,request_id,payload_hash,phone,company,inspiration,configuration_snapshot,quote_snapshot) VALUES(?,?,?,?,?,?,?,?)').run(id, value.requestId, fingerprint, value.phone, value.company, '', JSON.stringify(value.configuration), JSON.stringify(quote));
        db.prepare('INSERT INTO inquiry_briefs(inquiry_id,schema_version,request_type,first_name,last_name,brief_snapshot) VALUES(?,?,?,?,?,?)').run(id, 2, value.requestType, value.firstName, value.lastName, JSON.stringify(value.brief));
        const insertImage = db.prepare('INSERT INTO inquiry_attachments(id,inquiry_id,position,original_name,mime,size,sha256,width,height,bytes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
        images.forEach((image, position) => insertImage.run(newId(), id, position, image.originalName, image.mime, image.size, image.sha256, image.width, image.height, image.bytes, timestamp));
        const status = configured ? 'pending' : 'unavailable';
        db.prepare('INSERT INTO inquiry_outbox(inquiry_id,status,next_attempt_at,last_error_code,updated_at) VALUES(?,?,?,?,?)').run(id, status, timestamp, configured ? null : 'CONFIG_MISSING', timestamp);
        return { id, status, duplicate: false };
      });
      if (result.conflict) return res.status(409).json({ error: 'Cette référence correspond déjà à une autre demande. Utilisez une nouvelle référence après avoir modifié le formulaire.', code: 'REQUEST_CONFLICT' });
      if (result.storageLimit) return res.status(503).json({ error: 'Le stockage des images est temporairement plein. Vous pouvez envoyer votre demande sans image.', code: 'STORAGE_LIMIT' });
      return res.status(result.duplicate ? 200 : 201).json({ ok: true, id: result.id, notification: notification(result.status, configured) });
    } catch (error) {
      if (error instanceof InputError) return res.status(400).json({ error: error.message, code: 'INVALID_INPUT', fields: error.fields });
      if (error instanceof InquiryImageError) {
        if (error.status === 429) res.set('Retry-After', '5');
        return res.status(error.status).json({ error: error.message, code: error.code });
      }
      return next(error);
    }
  });
  return router;
}

function buildMail(db, id, configuration) {
  const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
  return { from: configuration.from, to: [configuration.to], reply_to: inquiry.email,
    subject: `Demande studio — ${inquiry.subject}`,
    text: [`Nouvelle demande de site — ${inquiry.id}`, `Date : ${inquiry.created_at}`, `Nom : ${inquiry.name}`, `E-mail : ${inquiry.email}`, '', inquiry.message].join('\n') };
}

function claimNext({ configuration, clock, timeoutMs }) {
  return transaction(db => {
    initializeInquiries(db);
    const timestamp = new Date(clock()).toISOString();
    db.prepare("UPDATE inquiry_outbox SET status='expired',last_error_code='RETRY_WINDOW_EXPIRED',lease_until=NULL,lease_token=NULL,updated_at=? WHERE status NOT IN ('accepted','failed','expired') AND deadline_at <= ?").run(timestamp, timestamp);
    if (!configuration) {
      db.prepare("UPDATE inquiry_outbox SET status='unavailable',last_error_code='CONFIG_MISSING',updated_at=? WHERE status IN ('pending','retry')").run(timestamp);
      return null;
    }
    const row = db.prepare(`SELECT * FROM inquiry_outbox WHERE ((status IN ('pending','retry','unavailable') AND next_attempt_at <= ?) OR (status='processing' AND lease_until <= ?)) ORDER BY next_attempt_at,inquiry_id LIMIT 1`).get(timestamp, timestamp);
    if (!row) return null;
    if (row.attempts >= MAX_ATTEMPTS) {
      db.prepare("UPDATE inquiry_outbox SET status='failed',last_error_code='RETRY_EXHAUSTED',lease_until=NULL,lease_token=NULL,updated_at=? WHERE inquiry_id=?").run(timestamp, row.inquiry_id);
      return { skipped: true };
    }
    const firstAttempt = row.first_attempt_at || timestamp;
    const deadline = row.deadline_at || new Date(clock() + RETRY_WINDOW_MS).toISOString();
    const payload = row.payload || JSON.stringify(buildMail(db, row.inquiry_id, configuration));
    const token = newId();
    db.prepare("UPDATE inquiry_outbox SET status='processing',attempts=attempts+1,first_attempt_at=?,deadline_at=?,payload=?,lease_token=?,lease_until=?,updated_at=? WHERE inquiry_id=?")
      .run(firstAttempt, deadline, payload, token, new Date(clock() + timeoutMs + 30_000).toISOString(), timestamp, row.inquiry_id);
    return { ...row, payload, lease_token: token, attempts: row.attempts + 1, deadline_at: deadline };
  });
}

function retryAfterMs(response, clock) {
  const value = response.headers?.get?.('retry-after');
  if (!value) return 0;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(value) - clock()) || 0;
  return Math.min(delay, RETRY_WINDOW_MS);
}

async function send(row, { configuration, fetchImpl, clock, timeoutMs, signal }) {
  const controller = new AbortController();
  let timer, abort;
  const interrupted = new Promise((_, reject) => {
    abort = () => { controller.abort(); reject(Object.assign(new Error(), { safeCode: 'CANCELLED' })); };
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) return abort();
    timer = setTimeout(() => { controller.abort(); reject(Object.assign(new Error(), { safeCode: 'TIMEOUT' })); }, timeoutMs);
    timer.unref?.();
  });
  try {
    return await Promise.race([interrupted, (async () => {
      const response = await fetchImpl('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${configuration.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `studio-inquiry/${row.inquiry_id}` }, body: row.payload, signal: controller.signal });
      if (response.ok) {
        let body;
        try { body = await response.json(); } catch { return { retry: true, code: 'PROVIDER_INVALID_RESPONSE' }; }
        return typeof body.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(body.id) ? { accepted: true, providerId: body.id } : { retry: true, code: 'PROVIDER_INVALID_RESPONSE' };
      }
      // Resend distinguishes an in-progress identical request from a changed
      // payload. Only its documented, allowlisted error name is inspected.
      if (response.status === 409) {
        let name;
        try { name = (await response.json()).name; } catch { /* Unknown conflict is permanent. */ }
        return name === 'concurrent_idempotent_requests' ? { retry: true, code: 'IDEMPOTENCY_BUSY' } : { retry: false, code: 'IDEMPOTENCY_CONFLICT' };
      }
      // Never store or log provider error bodies: these may contain addresses or secrets.
      try { await response.body?.cancel?.(); } catch { /* Discarding an error body must not change its classification. */ }
      const transient = response.status === 408 || response.status === 429 || response.status >= 500;
      return { retry: transient, code: `HTTP_${Number(response.status) || 0}`, retryAfter: transient ? retryAfterMs(response, clock) : 0 };
    })()]);
  } catch (error) { return { retry: true, code: error.safeCode || (controller.signal.aborted ? 'TIMEOUT' : 'NETWORK_ERROR') }; }
  finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}

/** Bounded durable delivery; injectable fetch/clock make tests entirely offline. */
export async function processInquiryOutbox({ fetchImpl = globalThis.fetch, env = process.env, clock = Date.now, timeoutMs = 5000, batchSize = 4, signal } = {}) {
  const configuration = deliveryConfiguration(env);
  const result = { processed: 0, accepted: 0, retry: 0, failed: 0 };
  for (let index = 0; index < Math.min(Math.max(batchSize, 1), 20) && !signal?.aborted; index++) {
    const row = claimNext({ configuration, clock, timeoutMs });
    if (!row) break;
    if (row.skipped) { result.failed++; continue; }
    const outcome = await send(row, { configuration, fetchImpl, clock, timeoutMs, signal });
    const timestamp = new Date(clock()).toISOString();
    const delay = Math.max(30_000 * 2 ** (row.attempts - 1), outcome.retryAfter || 0);
    const next = new Date(clock() + delay).toISOString();
    const retry = outcome.retry && row.attempts < MAX_ATTEMPTS && next < row.deadline_at;
    const status = outcome.accepted ? 'accepted' : retry ? 'retry' : 'failed';
    const changed = initializeInquiries().prepare('UPDATE inquiry_outbox SET status=?,provider_id=?,last_error_code=?,next_attempt_at=?,lease_until=NULL,lease_token=NULL,updated_at=? WHERE inquiry_id=? AND lease_token=?')
      .run(status, outcome.providerId || null, outcome.accepted ? null : outcome.code, retry ? next : timestamp, timestamp, row.inquiry_id, row.lease_token).changes;
    if (changed) { result.processed++; result[status === 'accepted' ? 'accepted' : status === 'retry' ? 'retry' : 'failed']++; }
  }
  return result;
}

/** Only index.mjs starts this worker; importing the app never sends an email. */
export function startInquiryWorker({ intervalMs = 5000, onError = () => console.error('[studio outbox] WORKER_ERROR'), ...options } = {}) {
  let timer, running, stopped = false;
  const controller = new AbortController();
  const run = async () => {
    if (stopped) return;
    running = processInquiryOutbox({ ...options, signal: controller.signal }).catch(() => onError());
    await running;
    if (!stopped) { timer = setTimeout(run, intervalMs); timer.unref?.(); }
  };
  timer = setTimeout(run, 0); timer.unref?.();
  return { async stop() { stopped = true; clearTimeout(timer); controller.abort(); await running; } };
}

export function inquiryOutboxSummary() {
  return initializeInquiries().prepare('SELECT status,COUNT(*) AS count,MIN(updated_at) AS oldestUpdate FROM inquiry_outbox GROUP BY status').all();
}
