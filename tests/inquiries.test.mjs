import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { closeDb, getDb } from '../server/db.mjs';
import { createInquiriesRouter, initializeInquiries, processInquiryOutbox, startInquiryWorker, inquiryOutboxSummary } from '../server/inquiries.mjs';
import { defaultPricing } from '../shared/catalog.ts';
import { validInquiry } from './helpers/inquiry-fixture.mjs';
import { validateInquiryContact } from '../shared/inquiry-contact.ts';
import { requestTypes, validateBrief } from '../shared/brief.ts';
import sharp from 'sharp';

const mailEnvironment = () => ({ RESEND_API_KEY: 're_private_test_key', RESEND_FROM: 'Studio test <studio@example.test>', INQUIRY_TO: 'operator@example.test' });
const configuredRequest = (extra = {}) => {
  const requestType = extra.requestType ?? extra.configuration?.offerId ?? 'vitrine';
  return validInquiry(requestType, { configuration: { offerId: requestType, mobile: true, deployment: true, maintenance: true, extras: [] }, ...extra });
};
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
  }, async upload(body, files = []) {
    const form = new FormData();
    form.set('payload', JSON.stringify(body));
    for (const file of files) form.append('files', new Blob([file.bytes], { type: file.mime ?? 'image/png' }), file.name ?? 'reference.png');
    const response = await fetch(`${base}/api/inquiries`, { method: 'POST', headers: { Origin: base }, body: form });
    return { status: response.status, body: await response.json() };
  } };
}
const outbox = id => getDb().prepare('SELECT * FROM inquiry_outbox WHERE inquiry_id=?').get(id);
const inquiryCount = () => getDb().prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
const image = (background = '#fc4903') => sharp({ create: { width: 2, height: 3, channels: 3, background } }).png().toBuffer();

function assertEmptyRequestTables() {
  for (const table of ['inquiries', 'inquiry_details', 'inquiry_briefs', 'inquiry_attachments', 'inquiry_outbox']) {
    assert.equal(getDb().prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count, 0, table);
  }
}

test('anonymous V2 contact is durable without email configuration or account', async t => {
  const f = await fixture(t);
  const result = await f.post(validInquiry('contact'));
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

test('all seven V2 request types preserve contact and normalized shared answers', async t => {
  const f = await fixture(t);
  for (const requestType of requestTypes) {
    const request = validInquiry(requestType);
    const result = await f.post(request);
    assert.equal(result.status, 201, requestType);
    const row = getDb().prepare('SELECT * FROM inquiries WHERE id=?').get(result.body.id);
    const brief = getDb().prepare('SELECT * FROM inquiry_briefs WHERE inquiry_id=?').get(row.id);
    const details = getDb().prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(row.id);
    assert.equal(brief.schema_version, 2); assert.equal(brief.request_type, requestType);
    assert.equal(brief.first_name, request.firstName); assert.equal(brief.last_name, request.lastName);
    assert.equal(row.name, `${request.firstName} ${request.lastName}`);
    assert.deepEqual(JSON.parse(brief.brief_snapshot), validateBrief(requestType, request.brief).answers);
    assert.ok(row.message.includes('Téléphone : +33 1 23 45 67 89'));
    if (request.configuration) assert.equal(JSON.parse(details.configuration_snapshot).offerId, requestType);
    else { assert.equal(details.configuration_snapshot, 'null'); assert.equal(details.quote_snapshot, 'null'); }
  }
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM users').get().count, 0);
});

test('all four contact fields are mandatory, with shared flat field errors and strict phones', async t => {
  const f = await fixture(t);
  for (const field of ['firstName', 'lastName', 'email', 'phone']) {
    const request = validInquiry('contact', { [field]: undefined });
    const response = await f.post(request);
    assert.equal(response.status, 400, field);
    assert.equal(response.body.code, 'INVALID_INPUT');
    const { firstName, lastName, email, phone, company } = request;
    assert.deepEqual(response.body.fields, validateInquiryContact({ firstName, lastName, email, phone, company }).fields);
  }
  for (const phone of ['', '123456', '1234567890123456', 'appelez-moi', '+33\t123456789', '++33 123456789', '33/123456789', '33\n123456789', 33123456789, null]) {
    const response = await f.post(validInquiry('contact', { phone }));
    assert.equal(response.status, 400, String(phone)); assert.equal(typeof response.body.fields.phone, 'string');
  }
  assertEmptyRequestTables();
  const accepted = await f.post(validInquiry('contact', { firstName: '  Élise  ', lastName: '  D’Arcy  ', email: '  CLIENT@example.test  ', phone: ' +33 (0)1 23-45.67.89 ' }));
  assert.equal(accepted.status, 201);
  const row = getDb().prepare('SELECT * FROM inquiries WHERE id=?').get(accepted.body.id);
  assert.equal(row.name, 'Élise D’Arcy'); assert.equal(row.email, 'client@example.test');
});

test('only V2 envelopes, UUID references and configurations matching their request type are accepted', async t => {
  const f = await fixture(t);
  for (const extra of [
    { schemaVersion: undefined }, { schemaVersion: 1 }, { schemaVersion: '2' },
    { requestType: 'projet' }, { requestType: undefined }, { requestId: null },
    { name: 'Invented name' }, { subject: 'Invented subject' }, { message: 'Invented message' },
    { quote: {} }, { summary: 'Invented summary' }, { inspiration: 'https://example.test/' },
    { configuration: null }, { configuration: { offerId: 'connecte' } }, { configuration: { offerId: 'vitrine', extras: ['member-roles'] } },
  ]) {
    const response = await f.post(validInquiry('vitrine', extra));
    assert.equal(response.status, 400, JSON.stringify(extra)); assert.equal(response.body.code, 'INVALID_INPUT');
  }
  for (const requestType of ['evolution', 'refonte', 'contact']) {
    for (const extra of [{ configuration: undefined }, { configuration: {} }, { configuration: { offerId: 'vitrine' } }, { requestId: undefined }, { requestId: 'invalid' }]) {
      assert.equal((await f.post(validInquiry(requestType, extra))).status, 400, `${requestType} ${JSON.stringify(extra)}`);
    }
  }
  assert.equal((await f.post(legacyRequest())).status, 400);
  assertEmptyRequestTables();
});

test('brief validation rejects unknown, missing, invalid-choice and out-of-context answers using shared ids', async t => {
  const f = await fixture(t);
  const requests = [
    validInquiry('vitrine', { brief: {} }),
    validInquiry('vitrine', { brief: { ...validInquiry().brief, inventedQuestion: 'A forged answer.' } }),
    validInquiry('vitrine', { brief: { ...validInquiry().brief, contentReady: 'invented-choice' } }),
    validInquiry('vitrine', { brief: { ...validInquiry().brief, hostingDetails: 'A hidden answer.' } }),
    validInquiry('evolution', { brief: { ...validInquiry('evolution').brief, currentUrl: 'https://user:secret@example.test/' } }),
    validInquiry('refonte', { brief: { ...validInquiry('refonte').brief, dataTools: 'yes' } }),
    validInquiry('immersif', { brief: { ...validInquiry('immersif').brief, modelStatus: 'to-create', modelDetails: 'An answer for an unavailable model.' } }),
  ];
  for (const request of requests) {
    const response = await f.post(request);
    assert.equal(response.status, 400, request.requestType);
    assert.deepEqual(response.body.fields, validateBrief(request.requestType, request.brief).fields);
  }
  const request = validInquiry('refonte', { firstName: '', brief: { ...validInquiry('refonte').brief, dataTools: 'yes' } });
  const response = await f.post(request);
  assert.equal(typeof response.body.fields.firstName, 'string'); assert.equal(typeof response.body.fields.dataDetails, 'string');
  assert.ok(Object.keys(response.body.fields).every(key => !key.includes('.')));
  assertEmptyRequestTables();
});

test('normalization makes repeated equivalent V2 payloads idempotent', async t => {
  const f = await fixture(t);
  const request = validInquiry('contact');
  const first = await f.post(request);
  const retried = await f.post({ ...request, requestId: request.requestId.toUpperCase(), firstName: ` ${request.firstName} `, lastName: ` ${request.lastName} `, email: request.email.toUpperCase(), company: ` ${request.company} `, brief: { ...request.brief, message: ` ${request.brief.message}\r\n `, deadline: '' } });
  assert.equal(first.status, 201); assert.equal(retried.status, 200); assert.equal(retried.body.id, first.body.id);
  assert.equal(inquiryCount(), 1);
});

test('configured request normalizes included features and stores its own immutable server quote', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const request = configuredRequest({ configuration: { offerId: 'connecte', mobile: false, managedContent: false, extras: ['analytics'] } });
  const first = await f.post(request);
  assert.equal(first.status, 201); assert.equal(first.body.notification, 'queued');
  const detail = getDb().prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(first.body.id);
  const configuration = JSON.parse(detail.configuration_snapshot), quote = JSON.parse(detail.quote_snapshot);
  assert.equal(configuration.mobile, true); assert.equal(configuration.managedContent, true);
  assert.equal(configuration.extras.includes('user-accounts'), false, 'Business does not add accounts without a selected option');
  assert.equal(quote.lines.find(line => line.key === 'managed-content').included, true);
  assert.equal(quote.lines.find(line => line.key === 'analytics').included, true);
  assert.equal(quote.lines.some(line => ['booking', 'advanced-forms'].includes(line.key)), false);
  assert.equal(quote.lines.some(line => line.key === 'user-accounts'), false);
  assert.equal(quote.totalCents, 149000);
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
  for (const extra of [{ quote: { totalCents: 1 } }, { to: 'victim@example.test' }, { configuration: { offerId: 'vitrine', totalCents: 1 } }, { configuration: { offerId: 'vitrine', mobile: 'false' } }, { configuration: { offerId: 'vitrine', extras: ['invented-option'] } }, { configuration: [] }, { requestId: 'invalid-id' }, { requestId: undefined }, { firstName: '' }, { email: 'client@example.test\r\nBcc: victim@example.test' }, { message: 'x'.repeat(10001) }, { company: 'x'.repeat(161) }, { subject: 'x'.repeat(161) }, { website: {} }]) {
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
  assert.equal((await f.post(validInquiry('contact'))).status, 201);
  assert.equal((await f.post(validInquiry('contact'))).status, 429);
  assert.equal(inquiryCount(), 1);
});

test('images, details, brief and notification commit together with content-based idempotency', async t => {
  const f = await fixture(t);
  const bytes = await image(), otherBytes = await image('#0044ff');
  const files = [{ bytes, name: 'première référence.png' }, { bytes: otherBytes, name: 'seconde.png' }];
  const request = validInquiry();
  const saved = await f.upload(request, files);
  assert.equal(saved.status, 201);
  const rows = getDb().prepare('SELECT * FROM inquiry_attachments WHERE inquiry_id=? ORDER BY position').all(saved.body.id);
  assert.equal(rows.length, 2);
  for (const [position, row] of rows.entries()) {
    assert.match(row.id, /^[0-9a-f-]{36}$/); assert.equal(row.position, position);
    assert.equal(row.original_name, files[position].name); assert.equal(row.mime, 'image/png');
    assert.equal(row.width, 2); assert.equal(row.height, 3); assert.equal(row.size, files[position].bytes.length);
    assert.equal(row.sha256, createHash('sha256').update(files[position].bytes).digest('hex'));
    assert.deepEqual(Buffer.from(row.bytes), files[position].bytes);
  }
  const identical = await f.upload(request, files);
  assert.equal(identical.status, 200); assert.equal(identical.body.id, saved.body.id);
  for (const changed of [
    [{ ...files[0], name: 'renommée.png' }, files[1]],
    [{ ...files[0], bytes: otherBytes }, files[1]],
    [files[1], files[0]],
    [files[0]],
    [],
  ]) {
    const response = await f.upload(request, changed);
    assert.equal(response.status, 409); assert.equal(response.body.code, 'REQUEST_CONFLICT');
  }
  assert.equal(inquiryCount(), 1);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM inquiry_attachments').get().count, 2);
  assert.deepEqual(getDb().prepare('SELECT * FROM inquiry_attachments WHERE inquiry_id=? ORDER BY position').all(saved.body.id), rows);
});

test('an error at the last transaction step leaves no inquiry, brief, image or outbox orphan', async t => {
  const f = await fixture(t);
  const request = validInquiry(), files = [{ bytes: await image() }];
  getDb().exec("CREATE TRIGGER reject_test_notification BEFORE INSERT ON inquiry_outbox BEGIN SELECT RAISE(ABORT, 'test failure'); END");
  assert.equal((await f.upload(request, files)).status, 500);
  assertEmptyRequestTables();
  getDb().exec('DROP TRIGGER reject_test_notification');
  assert.equal((await f.upload(request, files)).status, 201);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM inquiry_attachments').get().count, 1);
});

test('unreadable images are rejected before any transactional write, including multipart without files', async t => {
  const f = await fixture(t);
  const invalid = await f.upload(validInquiry(), [{ bytes: Buffer.from('not an image') }]);
  assert.equal(invalid.status, 415);
  assertEmptyRequestTables();
  assert.equal((await f.upload(validInquiry('contact'))).status, 201);
});

test('storage quota blocks only new images and is checked after an identical retry and before pricing', async t => {
  const bytes = await image();
  const env = { ...mailEnvironment(), INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES: String(bytes.length) };
  const f = await fixture(t, { env });
  const request = validInquiry(), files = [{ bytes }];
  const saved = await f.upload(request, files);
  assert.equal(saved.status, 201);
  const detail = getDb().prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(saved.body.id);
  env.INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES = '1';
  const pricing = { ...defaultPricing, version: 'after-upload', base: { ...defaultPricing.base, vitrine: 987600 } };
  getDb().prepare("INSERT INTO studio_settings(key,value,updated_at) VALUES('pricing',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(pricing), new Date().toISOString());
  const retried = await f.upload(request, files);
  assert.equal(retried.status, 200); assert.equal(retried.body.id, saved.body.id);
  assert.deepEqual(getDb().prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(saved.body.id), detail);
  const newRequest = validInquiry('contact');
  const overflow = await f.upload(newRequest, files);
  assert.equal(overflow.status, 503); assert.equal(overflow.body.code, 'STORAGE_LIMIT');
  assert.ok(overflow.body.error.includes('sans image'));
  assert.equal(inquiryCount(), 1);
  assert.equal((await f.post(newRequest)).status, 201);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM inquiry_attachments').get().count, 1);
});

test('the default 512 MiB storage ceiling remains active for invalid environment values', async t => {
  const env = {};
  const f = await fixture(t, { env });
  const saved = await f.post(validInquiry('contact'));
  const bytes = await image();
  // Model a full historical store without allocating a 512 MiB test fixture.
  const db = getDb();
  db.exec('PRAGMA ignore_check_constraints=ON');
  try {
    db.prepare('INSERT INTO inquiry_attachments(id,inquiry_id,position,original_name,mime,size,sha256,width,height,bytes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
      .run(randomUUID(), saved.body.id, 0, 'existing.png', 'image/png', 512 * 1024 * 1024, '0'.repeat(64), 2, 3, bytes, new Date().toISOString());
  } finally { db.exec('PRAGMA ignore_check_constraints=OFF'); }
  for (const invalid of [undefined, '', '0', '-1', '1.5', '1e9', 'Infinity', 'not-a-number', '9007199254740992']) {
    env.INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES = invalid;
    const result = await f.upload(validInquiry(), [{ bytes }]);
    assert.equal(result.status, 503, String(invalid)); assert.equal(result.body.code, 'STORAGE_LIMIT');
  }
  assert.equal((await f.post(validInquiry('contact'))).status, 201);
  assert.equal(inquiryCount(), 2);
});

test('new SQLite tables enforce strict types, foreign keys, versions and attachment integrity', async t => {
  const f = await fixture(t);
  const saved = await f.post(validInquiry('contact'));
  const db = getDb();
  for (const name of ['inquiry_briefs', 'inquiry_attachments']) assert.equal(db.prepare('PRAGMA table_list').all().find(table => table.name === name).strict, 1);
  const insertBrief = db.prepare('INSERT INTO inquiry_briefs(inquiry_id,schema_version,request_type,first_name,last_name,brief_snapshot) VALUES(?,?,?,?,?,?)');
  assert.throws(() => insertBrief.run(randomUUID(), 2, 'contact', 'Client', 'Test', '{}'), /FOREIGN KEY/);
  assert.throws(() => db.prepare('UPDATE inquiry_briefs SET schema_version=1 WHERE inquiry_id=?').run(saved.body.id), /constraint/);
  assert.throws(() => db.prepare('UPDATE inquiry_briefs SET schema_version=? WHERE inquiry_id=?').run('version-two', saved.body.id), /INTEGER/);
  assert.throws(() => db.prepare('UPDATE inquiry_briefs SET brief_snapshot=? WHERE inquiry_id=?').run('[]', saved.body.id), /constraint/);
  const bytes = await image();
  const insertImage = db.prepare('INSERT INTO inquiry_attachments(id,inquiry_id,position,original_name,mime,size,sha256,width,height,bytes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  const params = () => [randomUUID(), saved.body.id, 0, 'reference.png', 'image/png', bytes.length, createHash('sha256').update(bytes).digest('hex'), 2, 3, bytes, new Date().toISOString()];
  for (const [index, invalid] of [[1, randomUUID()], [2, 6], [4, 'image/gif'], [5, bytes.length + 1], [6, 'invalid-hash'], [7, 0], [8, 9_000_000], [9, 'not-a-blob']]) {
    const values = params(); values[index] = invalid;
    assert.throws(() => insertImage.run(...values), /constraint|BLOB/i, String(index));
  }
  insertImage.run(...params());
  assert.throws(() => insertImage.run(...params()), /UNIQUE/);
  db.prepare('DELETE FROM inquiries WHERE id=?').run(saved.body.id);
  assertEmptyRequestTables();
});

test('legacy rows remain untouched and an already frozen historical email payload is reused verbatim', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const db = getDb(), id = randomUUID(), timestamp = new Date().toISOString();
  const original = { id, name: 'Le nom complet historique sans découpage', email: 'historic@example.test', subject: 'Sujet historique', message: 'Message historique conservé mot pour mot.\nTéléphone ancien en texte.', created_at: timestamp };
  db.prepare('INSERT INTO inquiries(id,name,email,subject,message,created_at) VALUES(?,?,?,?,?,?)').run(...Object.values(original));
  const payload = JSON.stringify({ from: 'Archive <archive@example.test>', to: ['historic-operator@example.test'], reply_to: original.email, subject: original.subject, text: original.message });
  db.prepare('INSERT INTO inquiry_outbox(inquiry_id,status,next_attempt_at,payload,updated_at) VALUES(?,?,?,?,?)').run(id, 'pending', timestamp, payload, timestamp);
  initializeInquiries(); initializeInquiries();
  assert.deepEqual(db.prepare('SELECT * FROM inquiries WHERE id=?').get(id), Object.assign(Object.create(null), original));
  assert.equal(db.prepare('SELECT * FROM inquiry_briefs WHERE inquiry_id=?').get(id), undefined);
  let sent;
  const result = await processInquiryOutbox({ env: f.env, fetchImpl: async (_url, options) => { sent = options.body; return acceptedResponse(); } });
  assert.equal(result.accepted, 1); assert.equal(sent, payload); assert.equal(outbox(id).payload, payload);
  assert.deepEqual(db.prepare('SELECT * FROM inquiries WHERE id=?').get(id), Object.assign(Object.create(null), original));
  assert.equal((await f.post(legacyRequest())).status, 400);
  assert.equal(inquiryCount(), 1);
});

test('server-built human recaps and email list private images with a safe admin link and no image bytes', async t => {
  const env = { ...mailEnvironment(), APP_ORIGIN: 'https://studio.example.test/configured/path?ignored=yes' };
  const f = await fixture(t, { env });
  const bytes = await image();
  const request = validInquiry('vitrine');
  const saved = await f.upload(request, [{ bytes, name: 'inspiration privée.png' }]);
  assert.equal(saved.status, 201);
  const message = getDb().prepare('SELECT message FROM inquiries WHERE id=?').get(saved.body.id).message;
  for (const text of ['Prénom : Client', 'Nom : Test', 'E-mail : client@example.test', 'Téléphone : +33 1 23 45 67 89', 'Entreprise : Atelier test', 'Votre activité et vos visiteurs', 'Quelle est votre activité ?', 'Forfait : Vitrine', 'Création :', 'inspiration privée.png', `https://studio.example.test/admin?onglet=demandes&demande=${saved.body.id}`]) assert.ok(message.includes(text), text);
  let mail;
  await processInquiryOutbox({ env, fetchImpl: async (_url, options) => { mail = JSON.parse(options.body); return acceptedResponse(); } });
  assert.deepEqual(Object.keys(mail).sort(), ['from', 'reply_to', 'subject', 'text', 'to']);
  assert.ok(mail.text.includes(message)); assert.equal(JSON.stringify(mail).includes(bytes.toString('base64')), false);
  for (const invalidOrigin of ['javascript:alert(1)', 'https://user:password@example.test/', 'https://example.test\\@untrusted.test/', 'https://@example.test/', 'not a URL']) {
    env.APP_ORIGIN = invalidOrigin;
    const result = await f.post(validInquiry('contact'));
    assert.equal(result.status, 201);
    const stored = getDb().prepare('SELECT message FROM inquiries WHERE id=?').get(result.body.id).message;
    assert.ok(stored.includes(`https://gilmathis.com/admin?onglet=demandes&demande=${result.body.id}`));
  }
});

test('worker sends only to the configured studio, with stable key and text, then reports accepted', async t => {
  const f = await fixture(t, { env: mailEnvironment() });
  const input = configuredRequest();
  input.brief.constraints = '<img src=x onerror=alert(1)>\nUn texte client.';
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
