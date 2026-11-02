import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createHash } from 'node:crypto';
import { getDb, newId, now, transaction } from './db.mjs';
import { csrfProtection } from './auth.mjs';
import { getPricing } from './orders.mjs';
import { getOffer, normalizeConfiguration, quoteConfiguration, formatMoney } from '../shared/catalog.ts';

const RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const oneLineControls = /[\u0000-\u001f\u007f]/;
const messageControls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

class InputError extends Error {}
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function keys(value, allowed) { if (!record(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new InputError('Vérifiez les informations de votre demande.'); }
function text(value, maximum, required = false, multiline = false) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > maximum || (multiline ? messageControls : oneLineControls).test(value)) throw new InputError('Un champ de votre demande n’est pas valide.');
  const result = value.replace(/\r\n/g, '\n').trim();
  if (required && !result) throw new InputError('Indiquez votre nom et une adresse e-mail valide.');
  return result;
}
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
  keys(input, ['name', 'email', 'subject', 'message', 'phone', 'company', 'inspiration', 'configuration', 'requestId', 'website']);
  const name = text(input.name, 120, true);
  const address = text(input.email, 254, true).toLowerCase();
  if (!email(address)) throw new InputError('Indiquez une adresse e-mail valide.');
  const configured = Object.hasOwn(input, 'configuration');
  const requestId = input.requestId === undefined ? null : text(input.requestId, 36, true).toLowerCase();
  if ((requestId !== null && !UUID.test(requestId)) || (configured && !requestId)) throw new InputError('La référence de votre demande n’est pas valide. Rechargez le formulaire.');
  let configuration = null;
  if (configured) {
    keys(input.configuration, ['offerId', 'language', 'mobile', 'managedContent', 'scene3d', 'deployment', 'maintenance', 'extras']);
    if (typeof input.configuration.offerId !== 'string') throw new InputError('Choisissez un forfait valide.');
    try { configuration = normalizeConfiguration(input.configuration); } catch { throw new InputError('Vérifiez le forfait et les options choisies.'); }
  }
  const message = text(input.message, 10_000, !configured, true);
  if (!configured && message.length < 10) throw new InputError('Décrivez votre projet en 10 caractères minimum.');
  const requestedSubject = text(input.subject ?? undefined, 160);
  return { requestId, name, email: address, phone: text(input.phone, 40), company: text(input.company, 160),
    subject: configured ? `Projet ${getOffer(configuration.offerId).title}` : requestedSubject || 'Projet',
    message, inspiration: text(input.inspiration, 2048), configuration };
}

function summary(configuration, quote) {
  if (!configuration) return '';
  return [`Forfait : ${getOffer(configuration.offerId).title}`, ...quote.lines.map(line => `${line.label} : ${line.included ? 'compris dans le forfait' : line.amountCents === null ? 'à préciser' : formatMoney(line.amountCents, quote.currency)}${line.billing === 'monthly' ? ' / mois' : ''}`),
    `Création : ${quote.totalCents === null ? 'à préciser' : formatMoney(quote.totalCents, quote.currency)}`,
    `Mensuel : ${quote.monthlyTotalCents === null ? 'à préciser' : formatMoney(quote.monthlyTotalCents, quote.currency)} / mois`,
    'Estimation de préparation ; aucun paiement ni engagement commercial enregistré.'].join('\n');
}

function notification(status, configured) {
  return status === 'accepted' ? 'accepted' : configured && ['pending', 'retry', 'processing', 'unavailable'].includes(status) ? 'queued' : 'unavailable';
}

/** Anonymous endpoint; stores and queues only. No network send occurs in a request. */
export function createInquiriesRouter({ env = process.env, limit = 8, windowMs = 15 * 60 * 1000 } = {}) {
  const router = Router();
  router.use(csrfProtection);
  router.post('/', rateLimit({ windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Plusieurs demandes ont déjà été enregistrées. Réessayez un peu plus tard.', code: 'RATE_LIMITED' } }), (req, res, next) => {
    try {
      // A filled trap receives a neutral response but never creates mail or data.
      if (record(req.body) && typeof req.body.website === 'string' && req.body.website.trim()) return res.status(200).json({ ok: true, id: newId(), notification: 'unavailable' });
      if (req.body?.website !== undefined) text(req.body.website, 400);
      const value = validate(req.body);
      const fingerprint = createHash('sha256').update(JSON.stringify(value)).digest('hex');
      const configured = !!deliveryConfiguration(env);
      const result = transaction(db => {
        initializeInquiries(db);
        if (value.requestId) {
          const existing = db.prepare('SELECT d.inquiry_id,d.payload_hash,o.status FROM inquiry_details d JOIN inquiry_outbox o ON o.inquiry_id=d.inquiry_id WHERE d.request_id = ?').get(value.requestId);
          if (existing) return existing.payload_hash === fingerprint ? { id: existing.inquiry_id, status: existing.status, duplicate: true } : { conflict: true };
        }
        const quote = value.configuration ? quoteConfiguration(value.configuration, getPricing()) : null;
        const id = newId(), timestamp = now();
        const message = [value.message, value.phone && `Téléphone : ${value.phone}`, value.company && `Entreprise : ${value.company}`, value.inspiration && `Inspiration : ${value.inspiration}`, summary(value.configuration, quote)].filter(Boolean).join('\n\n');
        db.prepare('INSERT INTO inquiries(id,name,email,subject,message,created_at) VALUES(?,?,?,?,?,?)').run(id, value.name, value.email, value.subject, message, timestamp);
        db.prepare('INSERT INTO inquiry_details(inquiry_id,request_id,payload_hash,phone,company,inspiration,configuration_snapshot,quote_snapshot) VALUES(?,?,?,?,?,?,?,?)').run(id, value.requestId, fingerprint, value.phone, value.company, value.inspiration, JSON.stringify(value.configuration), JSON.stringify(quote));
        const status = configured ? 'pending' : 'unavailable';
        db.prepare('INSERT INTO inquiry_outbox(inquiry_id,status,next_attempt_at,last_error_code,updated_at) VALUES(?,?,?,?,?)').run(id, status, timestamp, configured ? null : 'CONFIG_MISSING', timestamp);
        return { id, status, duplicate: false };
      });
      if (result.conflict) return res.status(409).json({ error: 'Cette référence correspond déjà à une autre demande. Utilisez une nouvelle référence après avoir modifié le formulaire.', code: 'REQUEST_CONFLICT' });
      return res.status(result.duplicate ? 200 : 201).json({ ok: true, id: result.id, notification: notification(result.status, configured) });
    } catch (error) {
      if (error instanceof InputError) return res.status(400).json({ error: error.message, code: 'INVALID_INPUT' });
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
