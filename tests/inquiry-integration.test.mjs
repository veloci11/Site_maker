import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { mkdtempSync, readdirSync, realpathSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createApp } from '../server/app.mjs';
import { createAdminUser } from '../server/auth.mjs';
import { closeDb, dataDirectory, getDb } from '../server/db.mjs';
import { initializeInquiries } from '../server/inquiries.mjs';
import { normalizeConfiguration, quoteConfiguration } from '../shared/catalog.ts';
import { summarizeBrief, validateBrief } from '../shared/brief.ts';
import { getPricing } from '../server/orders.mjs';
import { validInquiry } from './helpers/inquiry-fixture.mjs';

const password = 'inquiry-integration-password-2026';
const MiB = 1024 * 1024;

// Use the actual app composition and session login. Every database and image is
// disposable; no worker or network email transport is started by createApp().
async function fixture(t, env = {}) {
  const directory = mkdtempSync(path.join(tmpdir(), 'studio-inquiry-integrated-'));
  const overrides = {
    DATA_DIR: path.join(directory, '.private-data'), NODE_ENV: 'test',
    APP_ORIGIN: undefined, PUBLIC_APP_URL: undefined, TRUST_PROXY: undefined,
    RESEND_API_KEY: undefined, RESEND_FROM: undefined, INQUIRY_TO: undefined,
    INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES: undefined, ...env,
  };
  const previous = Object.fromEntries(Object.keys(overrides).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  closeDb();
  const server = createApp().listen(0, '127.0.0.1');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    closeDb();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  });
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  process.env.APP_ORIGIN = base;
  const db = initializeInquiries();
  const actualFile = db.prepare('PRAGMA database_list').all().find(row => row.name === 'main').file;
  assert.equal(realpathSync(path.dirname(actualFile)), realpathSync(overrides.DATA_DIR));

  async function request(route, { method = 'GET', body, rawBody, cookie, origin = base, headers = {}, signal } = {}) {
    const response = await fetch(base + route, {
      method, signal,
      headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...headers },
      ...(rawBody !== undefined ? { body: rawBody } : body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      status: response.status, headers: response.headers, bytes,
      body: response.headers.get('content-type')?.includes('application/json') ? JSON.parse(bytes.toString('utf8')) : null,
      cookie: response.headers.get('set-cookie')?.split(';')[0],
    };
  }
  function post(body, options = {}) { return request('/api/inquiries', { method: 'POST', body, ...options }); }
  function upload(payload, files = [], options = {}) {
    const form = new FormData();
    form.append('payload', JSON.stringify(payload));
    for (const { bytes, name = 'référence.png', mime = 'image/png' } of files) form.append('files', new Blob([bytes], { type: mime }), name);
    return post(form, options);
  }
  async function adminSession() {
    await createAdminUser({ name: 'Studio test', email: 'admin-inquiry@example.test', password });
    const response = await request('/api/auth/login', { method: 'POST', body: { email: 'admin-inquiry@example.test', password } });
    assert.equal(response.status, 200);
    assert.equal(response.body.user.role, 'admin');
    assert.match(response.headers.get('set-cookie'), /HttpOnly/);
    return response.cookie;
  }
  return { base, directory, server, db, request, post, upload, adminSession };
}

async function png() {
  return sharp({ create: { width: 12, height: 9, channels: 3, background: '#b56576' } }).png().toBuffer();
}

function counts(db) {
  return Object.fromEntries(['inquiries', 'inquiry_details', 'inquiry_briefs', 'inquiry_attachments', 'inquiry_outbox', 'users', 'projects', 'files', 'orders'].map(table => [table, db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count]));
}

async function waitFor(predicate) {
  const deadline = Date.now() + 3000;
  while (!predicate()) {
    assert.ok(Date.now() < deadline, 'the expected asynchronous request stage must complete');
    await new Promise(resolve => setImmediate(resolve));
  }
}

test('all seven V2 contexts cross the real anonymous API and create only private inquiry records', async t => {
  const f = await fixture(t);
  for (const requestType of ['vitrine', 'connecte', 'immersif', 'sur-mesure', 'evolution', 'refonte', 'contact']) {
    const payload = validInquiry(requestType);
    const response = await f.post(payload);
    assert.equal(response.status, 201, requestType);
    assert.equal(response.body.notification, 'unavailable');
    assert.equal('sent' in response.body, false);
    const row = f.db.prepare('SELECT * FROM inquiries WHERE id=?').get(response.body.id);
    const brief = f.db.prepare('SELECT * FROM inquiry_briefs WHERE inquiry_id=?').get(response.body.id);
    const details = f.db.prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(response.body.id);
    assert.equal(row.name, 'Client Test');
    assert.equal(brief.request_type, requestType);
    assert.equal(brief.schema_version, 2);
    assert.deepEqual(JSON.parse(brief.brief_snapshot), validateBrief(requestType, payload.brief).answers);
    assert.equal(details.phone, payload.phone);
    if (payload.configuration) {
      const normalized = normalizeConfiguration(payload.configuration);
      assert.deepEqual(JSON.parse(details.configuration_snapshot), normalized);
      assert.deepEqual(JSON.parse(details.quote_snapshot), quoteConfiguration(normalized, getPricing()));
    } else {
      assert.equal(details.configuration_snapshot, 'null');
      assert.equal(details.quote_snapshot, 'null');
    }
  }
  assert.deepEqual(counts(f.db), { inquiries: 7, inquiry_details: 7, inquiry_briefs: 7, inquiry_attachments: 0, inquiry_outbox: 7, users: 0, projects: 0, files: 0, orders: 0 });
  assert.equal(f.db.prepare('SELECT SUM(attempts) AS attempts FROM inquiry_outbox').get().attempts, 0);
  assert.equal(statSync(dataDirectory()).mode & 0o777, 0o700);
  assert.equal(statSync(path.join(dataDirectory(), 'studio.sqlite')).mode & 0o777, 0o600);
  assert.ok(readdirSync(dataDirectory()).every(name => /^studio\.sqlite(?:-wal|-shm)?$/.test(name)), 'images must not create upload files or an email spool');
  closeDb();
  const reopened = await f.request('/api/catalogue');
  assert.equal(reopened.status, 200);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM inquiry_briefs').get().count, 7);
});

test('visitor tools and translated/local pages persist with each creation request and its admin summary', async t => {
  const f = await fixture(t);
  for (const requestType of ['vitrine', 'connecte', 'immersif', 'sur-mesure']) {
    const payload = validInquiry(requestType, {
      configuration: { offerId: requestType, extras: ['newsletter', 'analytics', 'additional-language', 'local-seo'] },
    });
    Object.assign(payload.brief, {
      newsletterDetails: 'Outil existant, une liste et textes préparés par notre équipe.',
      analyticsDetails: 'Compter les demandes de contact confirmées.',
      languageDetails: 'Cinq pages en espagnol ; traductions fournies.',
      localSeoDetails: 'Un établissement à Nantes.',
    });
    const response = await f.post(payload);
    assert.equal(response.status, 201, requestType);
    assert.equal(response.body.notification, 'unavailable');
    const stored = f.db.prepare('SELECT brief_snapshot FROM inquiry_briefs WHERE inquiry_id=?').get(response.body.id);
    const configuration = JSON.parse(f.db.prepare('SELECT configuration_snapshot FROM inquiry_details WHERE inquiry_id=?').get(response.body.id).configuration_snapshot);
    assert.deepEqual(configuration, normalizeConfiguration(payload.configuration));
    assert.deepEqual(JSON.parse(stored.brief_snapshot), validateBrief(requestType, payload.brief, configuration).answers);
    const sections = summarizeBrief(requestType, JSON.parse(stored.brief_snapshot), { configuration });
    for (const key of ['newsletterDetails', 'analyticsDetails', 'languageDetails', 'localSeoDetails']) {
      assert.ok(sections.flatMap(section => section.items).some(item => item.value === payload.brief[key]), `${requestType}/${key}`);
    }
  }
  assert.equal(f.db.prepare('SELECT SUM(attempts) AS total FROM inquiry_outbox').get().total, 0);
  const stale = validInquiry('vitrine');
  stale.brief.analyticsDetails = 'Une ancienne réponse, option retirée.';
  const response = await f.post(stale);
  assert.equal(response.status, 400);
  assert.ok(response.body.fields.analyticsDetails);
  assert.equal(counts(f.db).inquiries, 4, 'a hidden stale answer never becomes an accepted request');
});

test('V2 required contacts and the 64 KiB inquiry JSON limit survive the app-wide JSON middleware', async t => {
  const f = await fixture(t);
  for (const field of ['firstName', 'lastName', 'email', 'phone']) {
    const payload = validInquiry('contact');
    delete payload[field];
    const response = await f.post(payload);
    assert.equal(response.status, 400, field);
    assert.equal(response.body.code, 'INVALID_INPUT');
    assert.equal(typeof response.body.fields[field], 'string');
  }
  const old = await f.post({ schemaVersion: 1, requestId: randomUUID(), name: 'Ancien nom complet', email: 'old@example.test', subject: 'Contact', message: 'Ancien format de demande.' });
  assert.equal(old.status, 400);
  assert.equal(old.body.code, 'INVALID_INPUT');
  const payload = JSON.stringify(validInquiry('contact'));
  const exact = payload + ' '.repeat(64 * 1024 - Buffer.byteLength(payload));
  assert.equal((await f.post(undefined, { rawBody: exact })).status, 201);
  assert.equal((await f.post(undefined, { rawBody: exact + ' ' })).status, 413);
  const quote = JSON.stringify({ configuration: { offerId: 'vitrine' } });
  assert.equal((await f.request('/api/quote', { method: 'POST', rawBody: quote + ' '.repeat(70 * 1024) })).status, 200, 'the smaller body limit belongs to inquiries only');
  assert.equal(counts(f.db).inquiries, 1);
});

test('multipart retries use original image bytes, including different bytes of the same filename and size', async t => {
  const f = await fixture(t);
  const jpeg = await sharp(await png()).jpeg().toBuffer();
  const comment = text => Buffer.concat([jpeg.subarray(0, 2), Buffer.from([255, 254, 0, 10]), Buffer.from(text), jpeg.subarray(2)]);
  const firstBytes = comment('variantA');
  const changedBytes = comment('variantB');
  assert.equal(firstBytes.length, changedBytes.length);
  assert.equal((await sharp(firstBytes).metadata()).format, 'jpeg');
  const payload = validInquiry();
  const files = [{ bytes: firstBytes, name: 'inspiration privée.jpg', mime: 'image/jpeg' }];
  const first = await f.upload(payload, files);
  assert.equal(first.status, 201);
  const stored = f.db.prepare('SELECT * FROM inquiry_attachments WHERE inquiry_id=?').get(first.body.id);
  assert.deepEqual(Buffer.from(stored.bytes), firstBytes);
  assert.equal(stored.sha256, createHash('sha256').update(firstBytes).digest('hex'));
  const duplicate = await f.upload(payload, files);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.id, first.body.id);
  for (const bytes of [changedBytes, jpeg]) {
    const conflict = await f.upload(payload, [{ ...files[0], bytes }]);
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.code, 'REQUEST_CONFLICT');
  }
  const wrongType = await f.upload(validInquiry(), [{ bytes: await png(), name: 'image.jpg', mime: 'image/jpeg' }]);
  assert.equal(wrongType.status, 415);
  assert.equal(wrongType.body.code, 'INQUIRY_IMAGE_TYPE');
  const broken = await f.upload(validInquiry(), [{ bytes: (await png()).subarray(0, 40) }]);
  assert.equal(broken.status, 400);
  assert.equal(broken.body.code, 'INQUIRY_IMAGE_INVALID');
  const tooLarge = await f.upload(validInquiry(), [{ bytes: Buffer.alloc(5 * MiB + 1) }]);
  assert.equal(tooLarge.status, 413);
  assert.deepEqual(counts(f.db), { inquiries: 1, inquiry_details: 1, inquiry_briefs: 1, inquiry_attachments: 1, inquiry_outbox: 1, users: 0, projects: 0, files: 0, orders: 0 });
  assert.deepEqual(f.db.prepare('SELECT * FROM inquiry_attachments WHERE inquiry_id=?').get(first.body.id), stored);
});

test('real admin login protects detail and original image responses, with saved choices and inquiry ownership', async t => {
  const f = await fixture(t);
  const payload = validInquiry('vitrine', { configuration: { offerId: 'vitrine', mobile: false, managedContent: false, deployment: true, maintenance: true, extras: [] } });
  payload.brief.contentManagement = 'team';
  const bytes = await png();
  const saved = await f.upload(payload, [{ bytes, name: 'référence atelier.png' }]);
  assert.equal(saved.status, 201);
  const second = await f.post(validInquiry('contact'));
  assert.equal(second.status, 201);
  const admin = await f.adminSession();
  const customerLogin = await f.request('/api/auth/register', { method: 'POST', body: { name: 'Client privé', email: 'customer-inquiry@example.test', password } });
  assert.equal(customerLogin.status, 201);
  assert.equal(customerLogin.body.user.role, 'customer');
  const customer = customerLogin.cookie;
  const route = `/api/admin/inquiries/${saved.body.id}`;
  const detail = await f.request(route, { cookie: admin });
  assert.equal(detail.status, 200);
  const inquiry = detail.body.inquiry;
  assert.equal(inquiry.firstName, payload.firstName);
  assert.equal(inquiry.lastName, payload.lastName);
  assert.equal(inquiry.phone, payload.phone);
  assert.equal(inquiry.company, payload.company);
  assert.equal(inquiry.schemaVersion, 2);
  assert.equal(inquiry.requestType, 'vitrine');
  assert.deepEqual(inquiry.brief, validateBrief('vitrine', payload.brief).answers);
  assert.deepEqual(inquiry.sections, summarizeBrief('vitrine', inquiry.brief));
  assert.equal(inquiry.configuration.managedContent, false, 'brief preferences must not add a paid option');
  assert.equal(inquiry.configuration.mobile, false);
  assert.equal(inquiry.configuration.deployment, true);
  assert.equal(inquiry.configuration.maintenance, true);
  assert.deepEqual(inquiry.configuration.extras, []);
  assert.deepEqual(inquiry.quote, JSON.parse(f.db.prepare('SELECT quote_snapshot FROM inquiry_details WHERE inquiry_id=?').get(saved.body.id).quote_snapshot));
  assert.equal(inquiry.files.length, 1);
  const image = inquiry.files[0];
  assert.deepEqual({ name: image.originalName, mime: image.mime, size: image.size, width: image.width, height: image.height }, { name: 'référence atelier.png', mime: 'image/png', size: bytes.length, width: 12, height: 9 });
  for (const forbidden of ['bytes', 'buffer', 'storageName', 'storage_path', 'sha256']) assert.equal(Object.hasOwn(image, forbidden), false);
  for (const protectedRoute of ['/api/admin/inquiries', route, image.previewUrl, image.downloadUrl]) {
    assert.equal((await f.request(protectedRoute)).status, 401, protectedRoute);
    assert.equal((await f.request(protectedRoute, { cookie: customer })).status, 403, protectedRoute);
  }
  for (const [mode, disposition] of [['preview', 'inline'], ['download', 'attachment']]) {
    const response = await f.request(image[`${mode}Url`], { cookie: admin });
    assert.equal(response.status, 200);
    assert.deepEqual(response.bytes, bytes);
    assert.match(response.headers.get('content-type'), /^image\/png/);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('content-security-policy'), "sandbox; default-src 'none'");
    assert.match(response.headers.get('content-disposition'), new RegExp(`^${disposition};`));
    assert.equal((await f.request(`/api/admin/inquiries/${second.body.id}/files/${image.id}/${mode}`, { cookie: admin })).status, 404);
  }
  assert.equal((await f.request(`/api/admin/inquiries/${randomUUID()}`, { cookie: admin })).status, 404);
  closeDb();
  assert.deepEqual((await f.request(route, { cookie: admin })).body.inquiry, inquiry, 'session, choices and image metadata remain durable after DB reopening');
  for (const table of ['projects', 'orders', 'files']) assert.equal(getDb().prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count, 0);
});

test('admin details preserve both bare historical rows and older saved snapshots without inventing V2 names', async t => {
  const f = await fixture(t);
  const admin = await f.adminSession();
  const original = { id: randomUUID(), name: 'Nom complet historique sans découpage', email: 'historic@example.test', subject: 'Sujet original', message: 'Message original\nConservé intégralement.', created_at: '2025-06-01T12:00:00.000Z' };
  const insert = f.db.prepare('INSERT INTO inquiries(id,name,email,subject,message,created_at) VALUES(?,?,?,?,?,?)');
  insert.run(...Object.values(original));
  const bareId = randomUUID();
  insert.run(bareId, 'Autre nom historique', 'bare@example.test', 'Contact ancien', 'Message sans détail.', original.created_at);
  const configuration = JSON.stringify({ offerId: 'vitrine', language: 'fr', managedContent: false });
  const quote = JSON.stringify({ totalCents: 50000, lines: [{ key: 'vitrine', label: 'Ancien forfait', amountCents: 50000, included: false }] });
  f.db.prepare('INSERT INTO inquiry_details(inquiry_id,request_id,payload_hash,phone,company,inspiration,configuration_snapshot,quote_snapshot) VALUES(?,?,?,?,?,?,?,?)').run(original.id, null, 'legacy', 'Téléphone historique', 'Entreprise originale', 'https://example.test/ancien', configuration, quote);
  const before = f.db.prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(original.id);
  const detail = (await f.request(`/api/admin/inquiries/${original.id}`, { cookie: admin })).body.inquiry;
  assert.equal(detail.name, original.name);
  assert.equal(detail.message, original.message);
  assert.equal(detail.subject, original.subject);
  assert.equal(detail.createdAt, original.created_at);
  for (const key of ['schemaVersion', 'requestType', 'firstName', 'lastName', 'brief', 'notification']) assert.equal(detail[key], null, key);
  assert.deepEqual(detail.sections, []);
  assert.deepEqual(detail.files, []);
  assert.deepEqual(detail.configuration, JSON.parse(configuration));
  assert.deepEqual(detail.quote, JSON.parse(quote));
  const bare = (await f.request(`/api/admin/inquiries/${bareId}`, { cookie: admin })).body.inquiry;
  for (const key of ['phone', 'company', 'configuration', 'quote', 'firstName', 'lastName']) assert.equal(bare[key], null, key);
  assert.deepEqual({ ...f.db.prepare('SELECT * FROM inquiries WHERE id=?').get(original.id) }, original);
  assert.deepEqual(f.db.prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(original.id), before);
});

test('closing upload sockets cannot free native decode capacity or persist an aborted inquiry', async t => {
  const f = await fixture(t);
  const bytes = await png();
  const originalStats = sharp.prototype.stats;
  const gates = [];
  let running = 0, maximum = 0, completed = 0, closed = 0;
  let releaseImmediately = false;
  sharp.prototype.stats = async function (...args) {
    running++;
    maximum = Math.max(maximum, running);
    try {
      if (!releaseImmediately) await new Promise(resolve => gates.push(resolve));
      return await originalStats.apply(this, args);
    } finally { running--; completed++; }
  };
  f.server.prependListener('request', (_req, res) => res.once('close', () => { closed++; }));
  const controllers = [new AbortController(), new AbortController()];
  const pending = controllers.map(controller => f.upload(validInquiry(), [{ bytes }, { bytes }], { signal: controller.signal }).catch(error => ({ error })));
  let third;
  try {
    await waitFor(() => gates.length === 2);
    controllers.forEach(controller => controller.abort());
    await Promise.all(pending);
    await waitFor(() => closed >= 2);
    third = f.upload(validInquiry(), [{ bytes }]);
    let result;
    third.then(value => { result = value; });
    await waitFor(() => result || gates.length > 2);
    // Release native work even when this assertion detects a regression.
    assert.equal(gates.length, 2, 'an aborted response must retain its decode permit until stats settles');
    assert.equal(result.status, 429);
    assert.equal(result.body.code, 'INQUIRY_UPLOAD_BUSY');
    assert.equal((await f.post(validInquiry('contact'))).status, 201, 'JSON requests remain available while image decoding is busy');
  } finally {
    releaseImmediately = true;
    gates.forEach(release => release());
    await Promise.all(pending);
    if (third) await third;
    await waitFor(() => running === 0);
    await new Promise(resolve => setImmediate(resolve));
    sharp.prototype.stats = originalStats;
  }
  assert.equal(maximum, 2);
  assert.equal(completed, 2, 'cancellation must stop the second image in each abandoned batch');
  assert.equal(counts(f.db).inquiries, 1, 'only the independent JSON request may be persisted');
  assert.equal(counts(f.db).inquiry_attachments, 0);
  assert.equal((await f.upload(validInquiry(), [{ bytes }])).status, 201, 'both permits are reusable after validation settles');
});
