import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createApp } from '../server/app.mjs';
import { createAdminUser } from '../server/auth.mjs';
import { closeDb, dataDirectory, getDb } from '../server/db.mjs';
import { initializeInquiries, processInquiryOutbox } from '../server/inquiries.mjs';
import { createBackup } from '../scripts/backup.mjs';
import { normalizeConfiguration } from '../shared/catalog.ts';
import { requestTypes } from '../shared/brief.ts';
import { validInquiry } from './helpers/inquiry-fixture.mjs';

const transferUrl = 'https://files.example.test/dossier?token=exemple-non-secret';
const transferDetails = 'Logo et documents du projet. Expiration à confirmer.';
const password = 'local-transfer-test-password-2026';
const mailEnvironment = {
  RESEND_API_KEY: 're_test_not_a_real_key',
  RESEND_FROM: 'Studio test <studio@example.test>',
  INQUIRY_TO: 'operator@example.test',
};

async function fixture(t, env = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'studio-inquiry-transfer-'));
  const overrides = {
    DATA_DIR: path.join(directory, 'private'), NODE_ENV: 'test',
    APP_ORIGIN: undefined, PUBLIC_APP_URL: undefined, TRUST_PROXY: undefined,
    RESEND_API_KEY: undefined, RESEND_FROM: undefined, INQUIRY_TO: undefined,
    INQUIRY_UPLOAD_STORAGE_LIMIT_BYTES: undefined, ...env,
  };
  const previous = Object.fromEntries(Object.keys(overrides).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  closeDb();
  const nativeFetch = globalThis.fetch;
  const server = createApp().listen(0, '127.0.0.1');
  t.after(async () => {
    globalThis.fetch = nativeFetch;
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    closeDb();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    await rm(directory, { recursive: true, force: true });
  });
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  process.env.APP_ORIGIN = base;
  initializeInquiries();
  // A submitted transfer reference must never trigger a server-side fetch.
  // Only requests to this disposable HTTP application can use the real transport.
  globalThis.fetch = (input, options) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    assert.equal(url.origin, base, 'the application must not retrieve external transfer links');
    return nativeFetch(input, options);
  };
  async function request(route, { method = 'GET', body, cookie } = {}) {
    const response = await fetch(base + route, {
      method,
      headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}), ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
    });
    return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  const post = body => request('/api/inquiries', { method: 'POST', body });
  async function adminSession() {
    await createAdminUser({ name: 'Studio test', email: 'admin-transfer@example.test', password });
    const response = await request('/api/auth/login', { method: 'POST', body: { email: 'admin-transfer@example.test', password } });
    assert.equal(response.status, 200);
    return response.cookie;
  }
  return { directory, request, post, adminSession };
}

const items = inquiry => inquiry.sections.flatMap(section => section.items);
const withTransfer = type => {
  const payload = validInquiry(type);
  payload.brief.transferUrl = transferUrl;
  payload.brief.transferDetails = transferDetails;
  return payload;
};

test('all seven request contexts persist an optional transfer reference privately through the real API', async t => {
  const f = await fixture(t);
  const admin = await f.adminSession();
  for (const type of requestTypes) {
    const payload = withTransfer(type);
    const saved = await f.post(payload);
    assert.equal(saved.status, 201, type);
    assert.equal(saved.body.notification, 'unavailable');
    assert.equal(JSON.stringify(saved.body).includes(transferUrl), false, 'public confirmation contains no private reference');
    const row = getDb().prepare('SELECT brief_snapshot FROM inquiry_briefs WHERE inquiry_id=?').get(saved.body.id);
    assert.equal(JSON.parse(row.brief_snapshot).transferUrl, transferUrl);
    assert.equal(JSON.parse(row.brief_snapshot).transferDetails, transferDetails);
    const route = `/api/admin/inquiries/${saved.body.id}`;
    assert.equal((await f.request(route)).status, 401);
    const detail = await f.request(route, { cookie: admin });
    assert.equal(detail.status, 200);
    const reference = items(detail.body.inquiry).find(item => item.url === transferUrl);
    assert.equal(reference?.value, transferUrl);
    assert.ok(items(detail.body.inquiry).some(item => item.value === transferDetails));
    assert.deepEqual(detail.body.inquiry.files, [], 'an external reference is not a downloaded attachment');
    assert.ok(detail.body.inquiry.message.includes(transferUrl));
    assert.equal(detail.body.inquiry.notification.attempts, 0);
  }
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM inquiry_attachments').get().count, 0);
  const withoutTransfer = await f.post(validInquiry('contact'));
  assert.equal(withoutTransfer.status, 201, 'a transfer link never becomes mandatory');
});

test('transfer references participate in idempotence across JSON and multipart without downloading their files', async t => {
  const f = await fixture(t);
  const payload = withTransfer('contact');
  const first = await f.post(payload);
  assert.equal(first.status, 201);
  const multipart = new FormData();
  multipart.append('payload', JSON.stringify(payload));
  const duplicate = await f.post(multipart);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.id, first.body.id);
  for (const changed of [{ transferUrl: 'https://other.example.test/dossier' }, { transferDetails: 'Autre contenu à reprendre.' }]) {
    const conflict = await f.post({ ...payload, brief: { ...payload.brief, ...changed } });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.code, 'REQUEST_CONFLICT');
  }
  const bytes = await sharp({ create: { width: 2, height: 3, channels: 3, background: '#b8b0df' } }).png().toBuffer();
  const withImage = new FormData();
  withImage.append('payload', JSON.stringify({ ...payload, requestId: randomUUID() }));
  withImage.append('files', new Blob([bytes], { type: 'image/png' }), 'logo.png');
  const uploaded = await f.post(withImage);
  assert.equal(uploaded.status, 201);
  assert.equal(JSON.parse(getDb().prepare('SELECT brief_snapshot FROM inquiry_briefs WHERE inquiry_id=?').get(uploaded.body.id).brief_snapshot).transferUrl, transferUrl);
  assert.deepEqual(Buffer.from(getDb().prepare('SELECT bytes FROM inquiry_attachments WHERE inquiry_id=?').get(uploaded.body.id).bytes), bytes);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM inquiries').get().count, 2);
});

test('the API validates option-specific questions against the normalized submitted configuration', async t => {
  const f = await fixture(t);
  const admin = await f.adminSession();
  for (const [type, option, field, answer] of [
    ['vitrine', 'newsletter', 'newsletterDetails', 'Inscription à notre liste de nouvelles.'],
    ['connecte', 'online-store', 'storeDetails', 'Vendre trois produits avec retrait en boutique.'],
  ]) {
    const payload = validInquiry(type, { configuration: { offerId: type, extras: [option] } });
    payload.brief[field] = answer;
    const saved = await f.post(payload);
    assert.equal(saved.status, 201, field);
    const detail = await f.request(`/api/admin/inquiries/${saved.body.id}`, { cookie: admin });
    assert.ok(items(detail.body.inquiry).some(item => item.value === answer));
    assert.ok(detail.body.inquiry.message.includes(answer));
    assert.deepEqual(detail.body.inquiry.configuration, normalizeConfiguration(payload.configuration));
    const unsupported = await f.post({ ...payload, requestId: randomUUID(), configuration: { offerId: type, extras: [] } });
    assert.equal(unsupported.status, 400, 'a hidden question cannot be injected without its option');
    assert.equal(typeof unsupported.body.fields[field], 'string');
  }
});

test('the real notification pipeline includes transfer and selected-option answers using an injected email transport', async t => {
  const f = await fixture(t, mailEnvironment);
  const payload = withTransfer('vitrine');
  payload.configuration.extras = ['newsletter'];
  payload.brief.newsletterDetails = 'Un formulaire pour rejoindre la liste de nouvelles.';
  const saved = await f.post(payload);
  assert.equal(saved.status, 201);
  assert.equal(saved.body.notification, 'queued');
  const sent = [];
  const result = await processInquiryOutbox({
    env: mailEnvironment,
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      sent.push(JSON.parse(options.body));
      return new Response(JSON.stringify({ id: 'local-transfer-test-id' }), { status: 200 });
    },
  });
  assert.deepEqual(result, { processed: 1, accepted: 1, retry: 0, failed: 0 });
  assert.equal(sent.length, 1);
  assert.ok(sent[0].text.includes(transferUrl));
  assert.ok(sent[0].text.includes(transferDetails));
  assert.ok(sent[0].text.includes(payload.brief.newsletterDetails));
  assert.equal(Object.hasOwn(sent[0], 'attachments'), false, 'the external files are never attached automatically');
});

function insertHistorical(type, answers) {
  const db = getDb(), id = randomUUID();
  const message = 'Message historique conservé sans réécriture.';
  db.prepare('INSERT INTO inquiries(id,name,email,subject,message,created_at) VALUES(?,?,?,?,?,?)').run(id, 'Ancien nom complet', 'history@example.test', type, message, '2026-01-01T12:00:00.000Z');
  const configuration = ['vitrine', 'connecte', 'immersif', 'sur-mesure'].includes(type) ? normalizeConfiguration({ offerId: type }) : null;
  db.prepare('INSERT INTO inquiry_details(inquiry_id,request_id,payload_hash,phone,company,inspiration,configuration_snapshot,quote_snapshot) VALUES(?,?,?,?,?,?,?,?)').run(id, null, 'historical', '+33 1 23 45 67 89', '', '', JSON.stringify(configuration), 'null');
  const snapshot = JSON.stringify(answers);
  db.prepare('INSERT INTO inquiry_briefs(inquiry_id,schema_version,request_type,first_name,last_name,brief_snapshot) VALUES(?,?,?,?,?,?)').run(id, 2, type, 'Ancien', 'Contact', snapshot);
  return { id, snapshot, message };
}

test('admin history and a real SQLite backup restore keep old conditional answers, contradictory uncertainty and transfer links', async t => {
  const f = await fixture(t);
  const legacy = insertHistorical('sur-mesure', { dataFields: 'Anciennes informations de catalogue.' });
  const uncertain = insertHistorical('refonte', { availableAccess: ['admin', 'unknown'] });
  const saved = await f.post(withTransfer('contact'));
  assert.equal(saved.status, 201);
  const admin = await f.adminSession();
  const before = {};
  for (const id of [legacy.id, uncertain.id, saved.body.id]) {
    const detail = await f.request(`/api/admin/inquiries/${id}`, { cookie: admin });
    assert.equal(detail.status, 200);
    before[id] = detail.body.inquiry;
  }
  assert.ok(items(before[legacy.id]).some(item => item.value === 'Anciennes informations de catalogue.'), 'missing newly introduced parent must not hide an old answer');
  const access = items(before[uncertain.id]).map(item => item.value).join('\n');
  assert.ok(access.includes('Administration du site'));
  assert.ok(access.includes('Je ne sais pas'), 'do not normalize conflicting selections in stored history');
  for (const value of [legacy, uncertain]) {
    assert.equal(getDb().prepare('SELECT brief_snapshot FROM inquiry_briefs WHERE inquiry_id=?').get(value.id).brief_snapshot, value.snapshot);
    assert.equal(getDb().prepare('SELECT message FROM inquiries WHERE id=?').get(value.id).message, value.message);
  }
  const backup = await createBackup({ source: dataDirectory(), targetRoot: path.join(f.directory, 'backups') });
  const restored = path.join(f.directory, 'restored');
  await mkdir(restored, { mode: 0o700 });
  await copyFile(path.join(backup.directory, 'studio.sqlite'), path.join(restored, 'studio.sqlite'));
  closeDb();
  process.env.DATA_DIR = restored;
  for (const id of [legacy.id, uncertain.id, saved.body.id]) {
    const detail = await f.request(`/api/admin/inquiries/${id}`, { cookie: admin });
    assert.equal(detail.status, 200);
    assert.deepEqual(detail.body.inquiry, before[id], 'restored records must read identically, including their private references');
  }
});
