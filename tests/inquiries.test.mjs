import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { closeDb, getDb } from '../server/db.mjs';
import { createInquiriesRouter, initializeInquiries, processInquiryOutbox, startInquiryWorker, inquiryOutboxSummary } from '../server/inquiries.mjs';
import { defaultPricing } from '../shared/catalog.ts';

const mailEnvironment = () => ({ RESEND_API_KEY: 're_private_test_key', RESEND_FROM: 'Studio test <studio@example.test>', INQUIRY_TO: 'operator@example.test' });
const configuredRequest = (extra = {}) => ({ name: 'Client test', email: 'client@example.test', company: 'Atelier test', phone: '+33 1 23 45 67 89', inspiration: 'https://example.test/reference', configuration: { offerId: 'vitrine', mobile: true, deployment: true, maintenance: true, extras: ['booking'] }, requestId: randomUUID(), website: '', ...extra });
const legacyRequest = () => ({ name: 'Client test', email: 'client@example.test', subject: 'Création de site', message: 'Un site pour présenter notre activité.' });
const acceptedResponse = () => new Response(JSON.stringify({ id: 'resend-test-provider-id' }), { status: 200 });

async function fixture(t, { env = {}, limit = 1000 } = {}) {
  const oldDirectory = process.env.DATA_DIR;
  const directory = await mkdtemp(path.join(os.tmpdir(), 'studio-inquiries-'));
  process.env.DATA_DIR = directory;
  initializeInquiries();
  const app = express();
  app.use(express.json({ limit: '128kb' }));
  app.use('/api/inquiries', createInquiriesRouter({ env, limit }));
  app.use((_error, _req, res, _next) => res.status(500).json({ error: 'Erreur de test.' }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    closeDb();
    if (oldDirectory === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = oldDirectory;
    await rm(directory, { recursive: true, force: true });
  });
  return { env, async post(body, origin = base) {
    const response = await fetch(`${base}/api/inquiries`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  } };
}
const outbox = id => getDb().prepare('SELECT * FROM inquiry_outbox WHERE inquiry_id=?').get(id);
const inquiryCount = () => getDb().prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;

test('anonymous historical contact is durable without email configuration or account', async t => {
  const f = await fixture(t);
  const result = await f.post(legacyRequest());
  assert.equal(result.status, 201);
  assert.deepEqual(Object.keys(result.body).sort(), ['id', 'notification', 'ok']);
  assert.equal(result.body.notification, 'unavailable');
  assert.equal(JSON.stringify(result.body).includes('client@example.test'), false);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM users').get().count, 0);
  assert.equal(outbox(result.body.id).attempts, 0);
  closeDb();
  assert.equal(inquiryCount(), 1);
  assert.equal(outbox(result.body.id).status, 'unavailable');
});

test('configured request normalizes included features and stores its own immutable server quote', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const request = configuredRequest({ configuration: { offerId: 'connecte', mobile: false, managedContent: false, extras: ['booking'] } });
  const first = await f.post(request);
  assert.equal(first.status, 201); assert.equal(first.body.notification, 'queued');
  const detail = getDb().prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(first.body.id);
  const configuration = JSON.parse(detail.configuration_snapshot), quote = JSON.parse(detail.quote_snapshot);
  assert.equal(configuration.mobile, true); assert.equal(configuration.managedContent, true);
  assert.ok(configuration.extras.includes('user-accounts'));
  assert.equal(quote.lines.find(line => line.key === 'managed-content').included, true);
  assert.equal(quote.lines.find(line => line.key === 'user-accounts').included, true);
  assert.equal(quote.totalCents, null);
  const pricing = { ...defaultPricing, version: 'test-updated', base: { ...defaultPricing.base, connecte: 170000 } };
  getDb().prepare("INSERT INTO studio_settings(key,value,updated_at) VALUES('pricing',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(pricing), new Date().toISOString());
  const retry = await f.post(request);
  assert.equal(retry.status, 200); assert.equal(retry.body.id, first.body.id); assert.equal(inquiryCount(), 1);
  assert.deepEqual(getDb().prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(first.body.id), detail);
  const changed = await f.post({ ...request, phone: '+33 9 00 00 00 00' });
  assert.equal(changed.status, 409); assert.equal(changed.body.code, 'REQUEST_CONFLICT'); assert.equal(inquiryCount(), 1);
});

test('prices, unknown configuration, invalid fields and missing request references are refused', async t => {
  const f = await fixture(t);
  for (const extra of [{ quote: { totalCents: 1 } }, { to: 'victim@example.test' }, { configuration: { offerId: 'vitrine', totalCents: 1 } }, { configuration: { offerId: 'vitrine', mobile: 'false' } }, { configuration: { offerId: 'vitrine', extras: ['invented-option'] } }, { configuration: [] }, { requestId: 'invalid-id' }, { requestId: undefined }, { name: '' }, { email: 'client@example.test\r\nBcc: victim@example.test' }, { message: 'x'.repeat(10001) }, { company: 'x'.repeat(161) }, { subject: 'x'.repeat(161) }, { website: {} }]) {
    assert.equal((await f.post(configuredRequest(extra))).status, 400);
  }
  assert.equal((await f.post({ ...legacyRequest(), message: 'court' })).status, 400);
  assert.equal(inquiryCount(), 0);
});

test('honeypot and foreign origins never create notifications or requests', async t => {
  const f = await fixture(t);
  const bot = await f.post(configuredRequest({ website: 'https://spam.example' }));
  assert.equal(bot.status, 200); assert.equal(bot.body.ok, true); assert.equal(inquiryCount(), 0);
  assert.equal((await f.post(configuredRequest(), 'https://foreign.example')).status, 403);
  assert.equal(inquiryCount(), 0);
});

test('anonymous requests have a per-address limit', async t => {
  const f = await fixture(t, { limit: 1 });
  assert.equal((await f.post(legacyRequest())).status, 201);
  assert.equal((await f.post(legacyRequest())).status, 429);
  assert.equal(inquiryCount(), 1);
});

test('worker sends only to the configured studio, with stable key and text, then reports accepted', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const input = configuredRequest({ message: '<img src=x onerror=alert(1)>\nUn texte client.' });
  const saved = await f.post(input);
  const calls = [];
  const result = await processInquiryOutbox({ env: f.env, fetchImpl: async (url, options) => { calls.push({ url, options }); return acceptedResponse(); } });
  assert.equal(result.accepted, 1); assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].options.headers['Idempotency-Key'], `studio-inquiry/${saved.body.id}`);
  const body = JSON.parse(calls[0].options.body);
  assert.deepEqual(body.to, ['operator@example.test']); assert.equal(body.from, f.env.RESEND_FROM);
  assert.equal(body.reply_to, input.email); assert.equal('html' in body, false); assert.ok(body.text.includes('<img src=x'));
  assert.equal(outbox(saved.body.id).provider_id, 'resend-test-provider-id');
  const duplicate = await f.post(input);
  assert.equal(duplicate.status, 200); assert.equal(duplicate.body.notification, 'accepted');
  assert.equal((await processInquiryOutbox({ env: f.env, fetchImpl: async () => { throw new Error('must not send'); } })).processed, 0);
  assert.ok(inquiryOutboxSummary().some(row => row.status === 'accepted' && row.count === 1));
});

test('temporary provider failure waits and reuses exactly the same payload across environment changes', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const saved = await f.post(configuredRequest());
  let timestamp = Date.now() + 1000;
  const bodies = [], keys = [];
  const fetchImpl = async (_url, options) => { bodies.push(options.body); keys.push(options.headers['Idempotency-Key']); return bodies.length === 1 ? new Response('unavailable', { status: 503, headers: { 'Retry-After': '60' } }) : acceptedResponse(); };
  assert.equal((await processInquiryOutbox({ env: f.env, clock: () => timestamp, fetchImpl })).retry, 1);
  assert.equal(outbox(saved.body.id).last_error_code, 'HTTP_503');
  timestamp += 59000;
  assert.equal((await processInquiryOutbox({ env: f.env, clock: () => timestamp, fetchImpl })).processed, 0);
  timestamp += 2000;
  const changedEnv = { ...f.env, RESEND_FROM: 'Changed <changed@example.test>', INQUIRY_TO: 'new-operator@example.test' };
  assert.equal((await processInquiryOutbox({ env: changedEnv, clock: () => timestamp, fetchImpl })).accepted, 1);
  assert.equal(bodies.length, 2); assert.equal(bodies[0], bodies[1]); assert.equal(keys[0], keys[1]);
  assert.equal(outbox(saved.body.id).attempts, 2);
});

test('unconfigured worker does not lose data and can resume after configuration and restart', async t => {
  const f = await fixture(t);
  const saved = await f.post(configuredRequest());
  let calls = 0;
  const fetchImpl = async () => { calls++; return acceptedResponse(); };
  await processInquiryOutbox({ env: {}, fetchImpl });
  assert.equal(calls, 0); assert.equal(outbox(saved.body.id).status, 'unavailable');
  closeDb();
  assert.equal((await processInquiryOutbox({ env: mailEnvironment(), fetchImpl })).accepted, 1);
  assert.equal(calls, 1); assert.equal(inquiryCount(), 1);
});

for (const status of [401, 403, 422]) test(`permanent provider error ${status} preserves the request without leaking response data`, async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const saved = await f.post(configuredRequest());
  const secret = 'provider-response-with-secret-and-personal-data';
  const result = await processInquiryOutbox({ env: f.env, fetchImpl: async () => new Response(secret, { status }) });
  assert.equal(result.failed, 1); assert.equal(outbox(saved.body.id).status, 'failed');
  assert.equal(outbox(saved.body.id).last_error_code, `HTTP_${status}`);
  const serialized = JSON.stringify(outbox(saved.body.id));
  assert.equal(serialized.includes(secret), false); assert.equal(serialized.includes(f.env.RESEND_API_KEY), false);
  assert.equal(inquiryCount(), 1);
  assert.equal((await processInquiryOutbox({ env: f.env, fetchImpl: async () => { throw new Error('must not retry'); } })).processed, 0);
});

test('timeout is bounded even when fetch ignores its abort signal, and leaves a durable retry', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const saved = await f.post(configuredRequest());
  let signal;
  const result = await processInquiryOutbox({ env: f.env, timeoutMs: 15, fetchImpl: (_url, options) => { signal = options.signal; return new Promise(() => {}); } });
  assert.equal(result.retry, 1); assert.equal(signal.aborted, true);
  assert.equal(outbox(saved.body.id).last_error_code, 'TIMEOUT'); assert.equal(inquiryCount(), 1);
});

test('provider rate limits and in-progress idempotent requests retry, while payload conflicts stop', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const first = await f.post(configuredRequest());
  await processInquiryOutbox({ env: f.env, fetchImpl: async () => new Response('rate limited', { status: 429 }) });
  assert.equal(outbox(first.body.id).status, 'retry'); assert.equal(outbox(first.body.id).last_error_code, 'HTTP_429');
  const second = await f.post(configuredRequest());
  await processInquiryOutbox({ env: f.env, fetchImpl: async () => new Response(JSON.stringify({ name: 'concurrent_idempotent_requests', message: 'not stored' }), { status: 409 }) });
  assert.equal(outbox(second.body.id).status, 'retry'); assert.equal(outbox(second.body.id).last_error_code, 'IDEMPOTENCY_BUSY');
  const third = await f.post(configuredRequest());
  await processInquiryOutbox({ env: f.env, fetchImpl: async () => new Response(JSON.stringify({ name: 'invalid_idempotent_request' }), { status: 409 }) });
  assert.equal(outbox(third.body.id).status, 'failed'); assert.equal(outbox(third.body.id).last_error_code, 'IDEMPOTENCY_CONFLICT');
});

test('network errors, attempt exhaustion and the 23-hour deadline cannot send indefinitely', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const saved = await f.post(configuredRequest());
  let timestamp = Date.now() + 1000;
  const fetchImpl = async () => { throw new Error(f.env.RESEND_API_KEY); };
  assert.equal((await processInquiryOutbox({ env: f.env, clock: () => timestamp, fetchImpl })).retry, 1);
  assert.equal(outbox(saved.body.id).last_error_code, 'NETWORK_ERROR');
  getDb().prepare('UPDATE inquiry_outbox SET attempts=7,next_attempt_at=? WHERE inquiry_id=?').run(new Date(timestamp).toISOString(), saved.body.id);
  assert.equal((await processInquiryOutbox({ env: f.env, clock: () => timestamp, fetchImpl })).failed, 1);
  assert.equal(outbox(saved.body.id).attempts, 8); assert.equal(outbox(saved.body.id).status, 'failed');
  const another = await f.post(configuredRequest());
  await processInquiryOutbox({ env: f.env, clock: () => timestamp, fetchImpl });
  timestamp += 23 * 60 * 60 * 1000 + 1;
  let afterDeadlineCalls = 0;
  await processInquiryOutbox({ env: f.env, clock: () => timestamp, fetchImpl: async () => { afterDeadlineCalls++; return acceptedResponse(); } });
  assert.equal(afterDeadlineCalls, 0); assert.equal(outbox(another.body.id).status, 'expired');
});

test('a concurrent worker cannot claim an in-flight notification and an expired lease is recoverable', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const saved = await f.post(configuredRequest());
  let release;
  const first = processInquiryOutbox({ env: f.env, fetchImpl: () => new Promise(resolve => { release = resolve; }) });
  assert.equal(outbox(saved.body.id).status, 'processing');
  assert.equal((await processInquiryOutbox({ env: f.env, fetchImpl: async () => { throw new Error('double send'); } })).processed, 0);
  release(acceptedResponse()); assert.equal((await first).accepted, 1);
  const other = await f.post(configuredRequest());
  await processInquiryOutbox({ env: f.env, fetchImpl: async () => { throw new Error('network'); } });
  const original = outbox(other.body.id);
  getDb().prepare("UPDATE inquiry_outbox SET status='processing',lease_until=?,lease_token='crashed-process' WHERE inquiry_id=?").run(new Date(Date.now() - 1000).toISOString(), other.body.id);
  closeDb();
  let payload;
  assert.equal((await processInquiryOutbox({ env: f.env, fetchImpl: async (_url, options) => { payload = options.body; return acceptedResponse(); } })).accepted, 1);
  assert.equal(payload, original.payload);
});

test('stopping the index worker aborts in-flight work and preserves it for restart', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const saved = await f.post(configuredRequest());
  let started;
  const sending = new Promise(resolve => { started = resolve; });
  const worker = startInquiryWorker({ env: f.env, intervalMs: 5, fetchImpl: () => { started(); return new Promise(() => {}); } });
  t.after(() => worker.stop());
  await sending;
  await worker.stop();
  assert.equal(outbox(saved.body.id).status, 'retry'); assert.equal(outbox(saved.body.id).last_error_code, 'CANCELLED');
});
