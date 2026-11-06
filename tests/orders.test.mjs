import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createOrdersRouter, getPricing, getPaymentAvailability } from '../server/orders.mjs';
import { createProjectsRouter } from '../server/projects.mjs';
import { csrfProtection } from '../server/auth.mjs';
import { getDb, closeDb, now } from '../server/db.mjs';
import { defaultPricing, optionDefinitions, withExtraPageCount } from '../shared/catalog.ts';

const originalDirectory = process.env.DATA_DIR;
let directory, server, origin;
const billing = { fullName: 'Camille Exemple', company: '', email: 'camille@example.test', address: '10 rue du Test', postalCode: '75001', city: 'Paris', country: 'FR', vatNumber: '' };
const configuredPricing = { currency: 'EUR', base: { vitrine: 100000, connecte: 150000, immersif: 200000, 'sur-mesure': null }, options: { 'language-en': 20000, 'managed-content': 30000, 'scene-3d': 40000, deployment: 25000, 'maintenance-monthly': 5000 } };

before(async () => {
  directory = mkdtempSync(path.join(tmpdir(), 'studio-orders-'));
  process.env.DATA_DIR = directory;
  for (const [id, role] of [['owner-a', 'customer'], ['owner-b', 'customer'], ['studio', 'admin']]) {
    getDb().prepare('INSERT INTO users(id,name,email,password_hash,role,created_at) VALUES (?,?,?,?,?,?)').run(id, id, `${id}@example.test`, 'isolated-domain-test-only', role, now());
  }
  const app = express();
  app.use(express.json());
  // Domain-test identity injection is isolated to this test app; production uses opaque sessions.
  app.use((req, _res, next) => { const id = req.get('x-test-user'); if (['owner-a', 'owner-b', 'studio'].includes(id)) req.user = { id, role: id === 'studio' ? 'admin' : 'customer' }; next(); });
  app.use(csrfProtection);
  app.use('/api/projects', createProjectsRouter());
  app.use('/api', createOrdersRouter());
  app.use((_error, _req, res, _next) => res.status(500).json({ error: 'Test unexpected error.' }));
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  closeDb();
  if (originalDirectory === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = originalDirectory;
  rmSync(directory, { recursive: true, force: true });
});
async function request(route, { user = 'owner-a', method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${origin}/api${route}`, { method, headers: { 'Content-Type': 'application/json', ...(user ? { 'x-test-user': user } : {}), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: response.status, body: await response.json() };
}
async function create(configuration = { offerId: 'vitrine', language: 'fr', managedContent: false, scene3d: false }) {
  const result = await request('/projects', { method: 'POST', body: { name: 'Le projet', configuration } });
  assert.equal(result.status, 201); return result.body.project;
}
async function setPricing(value = configuredPricing) { return request('/admin/pricing', { user: 'studio', method: 'PUT', body: value }); }

test('published default prices are available but a saved dossier cannot masquerade as a payment', async () => {
  assert.deepEqual(getPricing(), defaultPricing);
  assert.deepEqual(getPricing().base, { vitrine: 89000, connecte: 149000, immersif: 249900, 'sur-mesure': null });
  assert.equal(getDb().prepare("SELECT value FROM studio_settings WHERE key = 'pricing'").get(), undefined, 'reading defaults must not create an admin price document');
  assert.equal(getPaymentAvailability().enabled, false);
  const project = await create();
  const first = await request(`/projects/${project.id}/order`);
  assert.equal(first.body.order, null);
  assert.equal(first.body.quote.totalCents, 89000);
  assert.equal(first.body.payment.enabled, false);
  const result = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.equal(result.status, 200);
  assert.equal(result.body.order.status, 'draft');
  assert.equal(result.body.order.totalCents, 89000);
  assert.equal(result.body.isCurrent, true);
  const checkout = await request(`/projects/${project.id}/checkout`, { method: 'POST', body: { orderId: result.body.order.id } });
  assert.equal(checkout.status, 409);
  assert.equal(checkout.body.code, 'PRICE_UNAVAILABLE');
  assert.equal(getDb().prepare('SELECT payment_reference FROM orders WHERE id = ?').get(result.body.order.id).payment_reference, null);
});

test('unpriced launch settings use published defaults without rewriting their stored bytes', () => {
  const legacy = { version: 'draft-v2', currency: 'EUR', base: { vitrine: null, connecte: null, immersif: null, 'sur-mesure': null }, options: { 'language-en': null, 'managed-content': null, 'scene-3d': null } };
  const serialized = JSON.stringify(legacy);
  getDb().prepare("INSERT INTO studio_settings(key,value,updated_at) VALUES ('pricing',?,?)").run(serialized, now());
  closeDb();
  assert.deepEqual(getPricing(), defaultPricing);
  assert.equal(getDb().prepare("SELECT value FROM studio_settings WHERE key = 'pricing'").get().value, serialized);
});

test('explicit admin unknown prices remain unknown and cannot enable checkout', async () => {
  const unpriced = {
    currency: 'EUR',
    base: Object.fromEntries(Object.keys(defaultPricing.base).map(key => [key, null])),
    options: Object.fromEntries(Object.keys(defaultPricing.options).map(key => [key, null])),
  };
  const saved = await setPricing(unpriced);
  assert.equal(saved.status, 200);
  assert.equal(getPricing().base.vitrine, null);
  assert.equal(getPricing().options['hosting-monthly'], null);
  assert.equal(getPricing().version, saved.body.pricing.version);
  const project = await create();
  const dossier = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.equal(dossier.body.order.totalCents, null);
  const checkout = await request(`/projects/${project.id}/checkout`, { method: 'POST', body: { orderId: dossier.body.order.id } });
  assert.equal(checkout.status, 409);
  assert.equal(checkout.body.code, 'PRICE_UNAVAILABLE');
  assert.equal(getDb().prepare('SELECT payment_reference FROM orders WHERE id = ?').get(dossier.body.order.id).payment_reference, null);
});

test('customer cannot read another dossier or invoke any administration endpoint', async () => {
  const project = await create();
  assert.equal((await request(`/projects/${project.id}/order`, { user: null })).status, 401);
  for (const method of ['GET', 'PUT']) {
    const denied = await request(`/projects/${project.id}/order`, { user: 'owner-b', method, ...(method === 'PUT' ? { body: { billing } } : {}) });
    assert.equal(denied.status, 404);
    assert.deepEqual(denied.body, (await request('/projects/not-present/order', { user: 'owner-b' })).body);
  }
  assert.equal((await request(`/projects/${project.id}/checkout`, { user: 'owner-b', method: 'POST', body: {} })).status, 404);
  for (const route of ['/admin/projects', `/admin/projects/${project.id}`, '/admin/inquiries', '/admin/pricing']) assert.equal((await request(route)).status, 403);
  assert.equal((await request('/admin/pricing', { method: 'PUT', body: configuredPricing })).status, 403);
  assert.equal((await request(`/projects/${project.id}/order`, { user: 'studio' })).status, 404);
  assert.equal((await request(`/admin/projects/${project.id}`, { user: 'studio' })).status, 200);
});

test('billing validation rejects forged prices, status, ownership and malformed fields', async () => {
  const project = await create();
  for (const body of [{ billing, totalCents: 1 }, { billing, status: 'paid' }, { billing, userId: 'owner-b' }, { billing: { ...billing, email: 'not-email' } }, { billing: { ...billing, country: 'France' } }, { billing: { ...billing, address: '' } }, { billing: { ...billing, fullName: { nested: true } } }, { billing: { ...billing, unknown: 'value' } }]) {
    assert.equal((await request(`/projects/${project.id}/order`, { method: 'PUT', body })).status, 400);
  }
  assert.equal(getDb().prepare('SELECT COUNT(*) AS total FROM orders WHERE project_id = ?').get(project.id).total, 0);
});

test('admin pricing is validated, persisted and priced by the server with included capabilities', async () => {
  const good = await setPricing();
  assert.equal(good.status, 200);
  const version = good.body.pricing.version;
  assert.ok(version && version !== 'draft-v1');
  closeDb();
  assert.equal(getPricing().version, version);
  for (const bad of [{ ...configuredPricing, currency: 'XXX' }, { ...configuredPricing, version: 'forged' }, { ...configuredPricing, base: { ...configuredPricing.base, vitrine: -1 } }, { ...configuredPricing, base: { ...configuredPricing.base, vitrine: 1.1 } }, { ...configuredPricing, options: { ...configuredPricing.options, 'scene-3d': '1' } }, { ...configuredPricing, base: { ...configuredPricing.base, 'sur-mesure': 200 } }]) assert.equal((await setPricing(bad)).status, 400);
  assert.equal(getPricing().version, version);
  const project = await create({ offerId: 'connecte', language: 'fr-en', managedContent: true, scene3d: true });
  const saved = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.equal(saved.body.order.totalCents, 210000);
  assert.equal(saved.body.quote.lines.find(line => line.key === 'managed-content').amountCents, 0);
  assert.equal(saved.body.order.snapshot.quote.version, version);
});

test('configuration and price snapshots stay immutable while subsequent edits create a new draft', async () => {
  await setPricing();
  const project = await create();
  const a = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  const original = getDb().prepare('SELECT * FROM orders WHERE id = ?').get(a.body.order.id);
  const same = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing: { ...billing, city: 'Lyon' } } });
  assert.equal(same.body.order.id, a.body.order.id);
  await request(`/projects/${project.id}`, { method: 'PATCH', body: { configuration: { language: 'fr-en' } } });
  assert.equal((await request(`/projects/${project.id}/order`)).body.isCurrent, false);
  assert.equal((await request(`/projects/${project.id}/checkout`, { method: 'POST', body: { orderId: a.body.order.id } })).body.code, 'PRICE_UNAVAILABLE');
  const b = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.notEqual(b.body.order.id, a.body.order.id);
  assert.equal(b.body.order.totalCents, 120000);
  const old = getDb().prepare('SELECT * FROM orders WHERE id = ?').get(a.body.order.id);
  assert.equal(old.configuration_snapshot, original.configuration_snapshot);
  assert.equal(old.total_cents, original.total_cents);
  assert.equal(old.status, 'superseded');
  await setPricing({ ...configuredPricing, base: { ...configuredPricing.base, vitrine: 99900 } });
  assert.equal((await request(`/projects/${project.id}/order`)).body.isCurrent, false);
  const c = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.equal(c.body.order.totalCents, 119900);
  assert.equal(getDb().prepare('SELECT total_cents FROM orders WHERE id = ?').get(b.body.order.id).total_cents, 120000);
});

test('configured prices still cannot trigger payment without a real enabled adapter', async () => {
  await setPricing();
  const project = await create();
  const saved = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.equal(saved.body.quote.checkoutReady, false);
  assert.equal(saved.body.payment.enabled, false);
  const checkout = await request(`/projects/${project.id}/checkout`, { method: 'POST', body: { orderId: saved.body.order.id } });
  assert.equal(checkout.status, 409);
  assert.equal(checkout.body.code, 'PRICE_UNAVAILABLE');
  assert.equal(getDb().prepare('SELECT status FROM orders WHERE id = ?').get(saved.body.order.id).status, 'draft');
  const custom = await create({ offerId: 'sur-mesure', language: 'fr', managedContent: false, scene3d: false });
  assert.equal((await request(`/projects/${custom.id}/checkout`, { method: 'POST', body: {} })).body.code, 'PRICE_UNAVAILABLE');
});

test('administration exposes private content deliberately and records contact review without claiming email', async () => {
  const project = await create();
  await request(`/projects/${project.id}/contents/accueil`, { method: 'PUT', body: { data: { body: 'Texte privé' } } });
  const list = await request('/admin/projects', { user: 'studio' });
  assert.ok(list.body.projects.some(item => item.id === project.id && item.customer.email === 'owner-a@example.test'));
  const detail = await request(`/admin/projects/${project.id}`, { user: 'studio' });
  assert.equal(detail.body.contents.find(item => item.pageKey === 'accueil').data.body, 'Texte privé');
  assert.equal('password_hash' in detail.body.customer, false);
  getDb().prepare('INSERT INTO inquiries(id,name,email,subject,message,created_at) VALUES (?,?,?,?,?,?)').run('inquiry-one', 'Un visiteur', 'visitor@example.test', 'Mon projet', 'Une vraie demande enregistrée', now());
  assert.equal((await request('/admin/inquiries', { user: 'studio' })).body.inquiries.find(item => item.id === 'inquiry-one').status, 'new');
  assert.equal((await request('/admin/inquiries/inquiry-one', { user: 'studio', method: 'PATCH', body: { status: 'reviewed' } })).status, 200);
  assert.equal((await request('/admin/inquiries', { user: 'studio' })).body.inquiries.find(item => item.id === 'inquiry-one').status, 'reviewed');
  assert.equal((await request('/admin/inquiries/inquiry-one', { user: 'owner-b', method: 'PATCH', body: { status: 'reviewed' } })).status, 403);
  assert.equal((await request('/admin/inquiries/inquiry-one', { user: 'studio', method: 'PATCH', body: { status: 'sent' } })).status, 400);
});

test('cross-origin changes are rejected before billing or pricing mutation', async () => {
  const project = await create();
  assert.equal((await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing }, headers: { Origin: 'https://attacker.example' } })).status, 403);
  const previous = getPricing();
  assert.equal((await request('/admin/pricing', { user: 'studio', method: 'PUT', body: configuredPricing, headers: { Origin: 'https://attacker.example' } })).status, 403);
  assert.deepEqual(getPricing(), previous);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS total FROM orders WHERE project_id = ?').get(project.id).total, 0);
});

test('operator CLI creates an explicit administrator without exposing or accepting a password argument', async () => {
  const run = promisify(execFile);
  const password = 'test-only-admin-password-not-a-production-secret';
  const args = ['scripts/create-admin.mjs', '--email', 'operator@example.test', '--name', 'Opérateur test'];
  const result = await run(process.execPath, args, { cwd: new URL('../', import.meta.url), env: { ...process.env, STUDIO_ADMIN_PASSWORD: password } });
  assert.match(result.stdout, /Compte administrateur créé/);
  assert.ok(!result.stdout.includes(password) && !result.stderr.includes(password));
  const admin = getDb().prepare('SELECT * FROM users WHERE email = ?').get('operator@example.test');
  assert.equal(admin.role, 'admin');
  assert.notEqual(admin.password_hash, password);
  const snapshot = { ...admin };
  await assert.rejects(() => run(process.execPath, args, { cwd: new URL('../', import.meta.url), env: { ...process.env, STUDIO_ADMIN_PASSWORD: password } }));
  assert.deepEqual({ ...getDb().prepare('SELECT * FROM users WHERE email = ?').get('operator@example.test') }, snapshot);
  await assert.rejects(() => run(process.execPath, [...args, '--password', password], { cwd: new URL('../', import.meta.url), env: { ...process.env, STUDIO_ADMIN_PASSWORD: password } }));
});

test('legacy persisted prices gain unknown new services without rewriting the saved pricing document', async () => {
  const legacy = { version: 'legacy-pricing-v1', currency: 'CHF', base: { vitrine: 120000, connecte: 200000, immersif: 300000, 'sur-mesure': null }, options: { 'language-en': 25000, 'managed-content': 40000, 'scene-3d': 50000 } };
  const serialized = JSON.stringify(legacy);
  getDb().prepare("UPDATE studio_settings SET value = ? WHERE key = 'pricing'").run(serialized);
  closeDb();
  const merged = getPricing();
  assert.equal(merged.version, legacy.version);
  assert.equal(merged.currency, 'CHF');
  assert.equal(merged.options['managed-content'], 40000);
  assert.equal(merged.options.deployment, null);
  assert.equal(merged.options['maintenance-monthly'], null);
  assert.equal(getDb().prepare("SELECT value FROM studio_settings WHERE key = 'pricing'").get().value, serialized);
});

test('legacy snapshots remain byte-identical on read and a billing-only save', async () => {
  await setPricing();
  const project = await create();
  const saved = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  const snapshot = structuredClone(saved.body.order.snapshot);
  delete snapshot.configuration.deployment;
  delete snapshot.configuration.maintenance;
  delete snapshot.quote.monthlyTotalCents;
  for (const line of snapshot.quote.lines) delete line.billing;
  const legacy = JSON.stringify(snapshot);
  getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(legacy, saved.body.order.id);
  assert.equal((await request(`/projects/${project.id}/order`)).body.isCurrent, true);
  const updated = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing: { ...billing, city: 'Lyon' } } });
  assert.equal(updated.body.order.id, saved.body.order.id);
  assert.equal(updated.body.order.monthlyTotalCents, 0);
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(saved.body.order.id).configuration_snapshot, legacy);
});

test('saved dossier separates monthly maintenance from creation and preserves both historical amounts', async () => {
  await setPricing();
  const project = await create({ offerId: 'connecte', language: 'fr', managedContent: false, scene3d: false, deployment: true, maintenance: true });
  const first = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.equal(first.status, 200);
  assert.equal(first.body.order.totalCents, 150000);
  assert.equal(first.body.order.monthlyTotalCents, 5000);
  assert.equal(first.body.quote.lines.find(line => line.key === 'managed-content').amountCents, 0);
  const original = getDb().prepare('SELECT configuration_snapshot,total_cents FROM orders WHERE id = ?').get(first.body.order.id);
  await setPricing({ ...configuredPricing, options: { ...configuredPricing.options, 'maintenance-monthly': 8000 } });
  const next = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.notEqual(next.body.order.id, first.body.order.id);
  assert.equal(next.body.order.totalCents, 150000);
  assert.equal(next.body.order.monthlyTotalCents, 8000);
  const history = getDb().prepare('SELECT configuration_snapshot,total_cents FROM orders WHERE id = ?').get(first.body.order.id);
  assert.equal(history.configuration_snapshot, original.configuration_snapshot);
  assert.equal(history.total_cents, 150000);
  assert.equal(JSON.parse(history.configuration_snapshot).quote.monthlyTotalCents, 5000);
});

test('legacy admin pricing expands new services to unknown while required keys and amounts stay validated', async () => {
  const accepted = await setPricing();
  assert.equal(accepted.status, 200);
  assert.deepEqual(Object.keys(accepted.body.pricing.options).sort(), optionDefinitions.map(option => option.id).sort());
  assert.equal(accepted.body.pricing.options['language-en'], configuredPricing.options['language-en']);
  for (const id of ['mobile', 'booking', 'user-accounts', 'hosting-monthly']) assert.equal(accepted.body.pricing.options[id], null);
  const version = accepted.body.pricing.version;
  for (const key of Object.keys(configuredPricing.options)) {
    const options = { ...configuredPricing.options }; delete options[key];
    assert.equal((await setPricing({ ...configuredPricing, options })).status, 400, 'missing historical option ' + key);
  }
  for (const key of Object.keys(configuredPricing.base)) {
    const base = { ...configuredPricing.base }; delete base[key];
    assert.equal((await setPricing({ ...configuredPricing, base })).status, 400, 'missing package price ' + key);
  }
  for (const options of [{ ...configuredPricing.options, unknown: null }, { ...configuredPricing.options, mobile: false }, { ...configuredPricing.options, booking: '10' }, { ...configuredPricing.options, 'hosting-monthly': -1 }]) {
    assert.equal((await setPricing({ ...configuredPricing, options })).status, 400);
  }
  assert.equal(getPricing().version, version, 'invalid legacy or extended requests do not replace saved pricing');
});

test('historical snapshots preserve their bytes after display changes and new free package inclusions', async () => {
  await setPricing();
  const project = await create({ offerId: 'connecte', language: 'fr-en', managedContent: true });
  const saved = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  const snapshot = structuredClone(saved.body.order.snapshot);
  delete snapshot.configuration.mobile; delete snapshot.configuration.extras;
  snapshot.quote.lines = snapshot.quote.lines.filter(line => !['mobile', 'booking', 'advanced-forms', 'portfolio-gallery', 'analytics', 'local-seo'].includes(line.key)).reverse();
  for (const line of snapshot.quote.lines) { line.label = 'Ancien libellé de présentation'; delete line.billing; }
  snapshot.quote.version = 'historical-catalogue-version';
  delete snapshot.quote.monthlyTotalCents;
  const serialized = JSON.stringify(snapshot), orderId = saved.body.order.id;
  getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(serialized, orderId);
  const current = await request(`/projects/${project.id}/order`);
  assert.equal(current.body.isCurrent, true);
  assert.equal(current.body.quote.lines.find(line => line.key === 'analytics').amountCents, 0);
  assert.equal(current.body.quote.lines.some(line => line.key === 'user-accounts'), false);
  const updated = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing: { ...billing, city: 'Lyon' } } });
  assert.equal(updated.body.order.id, orderId);
  assert.equal(updated.body.isCurrent, true);
  assert.equal(updated.body.order.snapshot.quote.version, 'historical-catalogue-version');
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(orderId).configuration_snapshot, serialized);
});

test('old included accounts remain in saved quotes even when a new Business quote needs repricing', async () => {
  await setPricing();
  const project = await create({ offerId: 'connecte' });
  const saved = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  const snapshot = structuredClone(saved.body.order.snapshot);
  snapshot.configuration.extras.push('user-accounts');
  snapshot.quote.lines.push({ key: 'user-accounts', label: 'Comptes utilisateurs', amountCents: 0, included: true, billing: 'once' });
  snapshot.quote.lines[0].label = 'Connecté';
  const serialized = JSON.stringify(snapshot);
  getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(serialized, saved.body.order.id);
  getDb().prepare('UPDATE projects SET configuration = ? WHERE id = ?').run(JSON.stringify(snapshot.configuration), project.id);
  const reopened = await request(`/projects/${project.id}/order`);
  assert.equal(reopened.body.isCurrent, false, 'changed commercial inclusions must not masquerade as an unchanged quote');
  assert.equal(reopened.body.order.snapshot.quote.lines.find(line => line.key === 'user-accounts').included, true);
  assert.equal(reopened.body.quote.lines.find(line => line.key === 'user-accounts').included, false);
  assert.equal(reopened.body.order.snapshot.quote.lines[0].label, 'Connecté');
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(saved.body.order.id).configuration_snapshot, serialized);
});

test('equal totals do not hide changed line prices, billing frequencies or duplicated snapshot lines', async () => {
  const extended = { ...configuredPricing, options: { ...configuredPricing.options, booking: 10000, copywriting: 20000 } };
  assert.equal((await setPricing(extended)).status, 200);
  const project = await create({ offerId: 'vitrine', extras: ['booking', 'copywriting'] });
  const saved = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.equal(saved.body.order.totalCents, 130000);
  assert.equal((await setPricing({ ...extended, options: { ...extended.options, booking: 15000, copywriting: 15000 } })).status, 200);
  const repriced = await request(`/projects/${project.id}/order`);
  assert.equal(repriced.body.quote.totalCents, 130000); assert.equal(repriced.body.isCurrent, false);
  await setPricing(extended);
  const original = saved.body.order.snapshot;
  for (const alter of [
    snapshot => { snapshot.quote.lines.find(line => line.key === 'booking').billing = 'monthly'; },
    snapshot => { snapshot.quote.lines.push({ ...snapshot.quote.lines[0] }); },
    snapshot => { snapshot.quote.lines.push({ key: 'unknown-commercial-line', amountCents: 0, included: true }); },
  ]) {
    const snapshot = structuredClone(original); alter(snapshot);
    getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(JSON.stringify(snapshot), saved.body.order.id);
    assert.equal((await request(`/projects/${project.id}/order`)).body.isCurrent, false);
  }
});

test('new order snapshots save estimated bounds and old snapshots stay byte-identical', async () => {
  await setPricing({ currency: defaultPricing.currency, base: defaultPricing.base, options: defaultPricing.options });
  const project = await create({ offerId: 'vitrine', extras: ['user-accounts', 'extra-pages', 'hosting-monthly'] });
  const saved = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  const orderId = saved.body.order.id;
  assert.equal(saved.body.order.snapshot.quote.totalCents, 125000);
  assert.equal(saved.body.order.snapshot.quote.maximumTotalCents, 161000);
  assert.equal(saved.body.order.snapshot.quote.monthlyTotalCents, 1900);
  assert.equal(saved.body.order.snapshot.quote.lines.find(line => line.key === 'extra-pages').maximumCents, 12000);
  const original = structuredClone(saved.body.order.snapshot);
  const legacy = structuredClone(original);
  delete legacy.quote.maximumTotalCents;
  for (const line of legacy.quote.lines) { delete line.maximumCents; delete line.estimated; delete line.quantity; delete line.scope; }
  const serialized = JSON.stringify(legacy);
  getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(serialized, orderId);
  assert.equal((await request(`/projects/${project.id}/order`)).body.isCurrent, true);
  const updated = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing: { ...billing, city: 'Lyon' } } });
  assert.equal(updated.body.order.id, orderId);
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(orderId).configuration_snapshot, serialized);

  for (const alter of [
    snapshot => { snapshot.quote.maximumTotalCents += 10000; },
    snapshot => { snapshot.quote.lines.find(line => line.key === 'extra-pages').maximumCents += 1000; },
  ]) {
    const changed = structuredClone(original); alter(changed);
    const bytes = JSON.stringify(changed);
    getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(bytes, orderId);
    assert.equal((await request(`/projects/${project.id}/order`)).body.isCurrent, false, 'an explicit saved bound is commercial data');
    assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(orderId).configuration_snapshot, bytes);
  }
});

test('historical booking and advanced-form inclusions stay untouched after removal from current packages', async () => {
  await setPricing({ currency: defaultPricing.currency, base: defaultPricing.base, options: defaultPricing.options });
  const project = await create({ offerId: 'connecte' });
  const saved = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  const snapshot = structuredClone(saved.body.order.snapshot);
  for (const id of ['booking', 'advanced-forms']) {
    snapshot.configuration.extras.push(id);
    snapshot.quote.lines.push({ key: id, label: `Historique ${id}`, amountCents: 0, maximumCents: 0, estimated: false, included: true, billing: 'once' });
  }
  const bytes = JSON.stringify(snapshot);
  getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(bytes, saved.body.order.id);
  getDb().prepare('UPDATE projects SET configuration = ? WHERE id = ?').run(JSON.stringify(snapshot.configuration), project.id);
  const reopened = await request(`/projects/${project.id}/order`);
  assert.equal(reopened.body.isCurrent, false);
  for (const id of ['booking', 'advanced-forms']) {
    assert.equal(reopened.body.order.snapshot.quote.lines.find(line => line.key === id).included, true);
    assert.equal(reopened.body.quote.lines.find(line => line.key === id).included, false);
  }
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(saved.body.order.id).configuration_snapshot, bytes);
});

test('quantities survive project patches and changed quantities produce new immutable order snapshots', async () => {
  await setPricing({ currency: defaultPricing.currency, base: defaultPricing.base, options: defaultPricing.options });
  const project = await create({ offerId: 'vitrine', extras: ['extra-pages'], extraPageCount: 5 });
  const first = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  const original = getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(first.body.order.id).configuration_snapshot;
  assert.equal(first.body.quote.totalCents, 119000);
  const partial = await request(`/projects/${project.id}`, { method: 'PATCH', body: { configuration: { language: 'fr-en' } } });
  assert.equal(partial.body.project.configuration.extraPageCount, 5, 'an unrelated partial patch preserves quantity');
  const onePage = withExtraPageCount({ ...partial.body.project.configuration, language: 'fr' }, 1);
  assert.equal(onePage.extraPageCount, undefined, 'one page keeps the historical canonical representation');
  const changed = await request(`/projects/${project.id}`, { method: 'PATCH', body: { configuration: onePage } });
  assert.equal(changed.status, 200);
  assert.equal(changed.body.project.configuration.extraPageCount, undefined, 'an explicit list with implicit one page replaces the old quantity');
  const current = await request(`/projects/${project.id}/order`);
  assert.equal(current.body.quote.totalCents, 95000);
  assert.equal(current.body.isCurrent, false);
  const second = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  assert.notEqual(second.body.order.id, first.body.order.id);
  assert.equal(second.body.order.snapshot.quote.lines.find(line => line.key === 'extra-pages').quantity, 1);
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(first.body.order.id).configuration_snapshot, original);
});

test('historical fixed-price snapshots remain current and byte-identical when new bases become scope estimates', async () => {
  await setPricing({ currency: defaultPricing.currency, base: defaultPricing.base, options: defaultPricing.options });
  const project = await create({ offerId: 'connecte', extras: ['additional-language'] });
  const first = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing } });
  const historic = structuredClone(first.body.order.snapshot);
  delete historic.quote.estimateBasis;
  historic.quote.lines.find(line => line.key === 'base').estimated = false;
  historic.quote.estimated = false;
  historic.quote.requiresQuote = false;
  historic.quote.checkoutReady = true;
  const bytes = JSON.stringify(historic);
  getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(bytes, first.body.order.id);
  const read = await request(`/projects/${project.id}/order`);
  assert.equal(read.body.isCurrent, true);
  assert.equal(read.body.quote.estimated, true);
  assert.equal(read.body.quote.checkoutReady, false, 'historical flags never authorize current payment');
  const updated = await request(`/projects/${project.id}/order`, { method: 'PUT', body: { billing: { ...billing, city: 'Lyon' } } });
  assert.equal(updated.body.order.id, first.body.order.id);
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(first.body.order.id).configuration_snapshot, bytes);
});
