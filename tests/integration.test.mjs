import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.mjs';
import { createAdminUser } from '../server/auth.mjs';
import { closeDb, getDb } from '../server/db.mjs';
import { validInquiry } from './helpers/inquiry-fixture.mjs';

// Exercise the actual middleware/router composition, real session cookies and a
// private disposable database. No identity injection, external mail or payments.
const old = { DATA_DIR: process.env.DATA_DIR, APP_ORIGIN: process.env.APP_ORIGIN };
const password = 'integration-test-password-2026';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBcAAAAAASUVORK5CYII=', 'base64');
let directory, server, base, client, second, admin, project, file, latestPreview;

before(async () => {
  directory = mkdtempSync(path.join(tmpdir(), 'studio-integrated-'));
  // The default development directory is `.data`. An ancestor beginning with a
  // dot must not make Express silently reject authenticated private downloads.
  process.env.DATA_DIR = path.join(directory, '.private-data');
  server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  process.env.APP_ORIGIN = base;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  closeDb();
  for (const [key, value] of Object.entries(old)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  if (directory) rmSync(directory, { recursive: true, force: true });
});

async function request(route, { cookie, method = 'GET', body, origin = base, headers = {} } = {}) {
  const response = await fetch(base + route, {
    method,
    headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...headers },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });
  const json = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
  return { status: response.status, body: json, headers: response.headers, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
async function signup(name, email) {
  const result = await request('/api/auth/register', { method: 'POST', body: { name, email, password, role: 'admin' } });
  assert.equal(result.status, 201);
  assert.equal(result.body.user.role, 'customer');
  assert.match(result.headers.get('set-cookie'), /HttpOnly/);
  assert.match(result.headers.get('set-cookie'), /SameSite=Lax/);
  return result.cookie;
}
function owned(route, options = {}) { return request(`/api/projects/${project.id}${route}`, { cookie: client, ...options }); }

test('public catalogue, quote and inquiry stay accessible before protected routers; origin checks apply', async () => {
  const catalogue = await request('/api/catalogue');
  assert.equal(catalogue.status, 200); assert.equal(catalogue.body.paymentAvailable, false);
  assert.deepEqual(catalogue.body.pricing.base, { vitrine: 89000, connecte: 149000, immersif: 249900, 'sur-mesure': null });
  assert.equal(catalogue.headers.get('cache-control'), 'no-store');
  const configuration = { offerId: 'vitrine', language: 'fr', managedContent: false, scene3d: false };
  const quote = await request('/api/quote', { method: 'POST', body: { configuration } });
  assert.equal(quote.status, 200); assert.equal(quote.body.quote.checkoutReady, false); assert.equal(quote.body.quote.totalCents, 89000);
  assert.equal(quote.body.quote.lines.find(line => line.key === 'mobile').included, true);
  assert.equal(quote.body.quote.lines.find(line => line.key === 'deployment').amountCents, 0);
  const inquiry = validInquiry('contact', { email: 'inquiry@example.test', brief: { message: 'Un projet de site pour vérifier le formulaire.' } });
  const rejected = await request('/api/inquiries', { method: 'POST', origin: 'https://foreign.example', body: inquiry });
  assert.equal(rejected.status, 403); assert.equal(rejected.body.code, 'INVALID_ORIGIN');
  const accepted = await request('/api/inquiries', { method: 'POST', body: inquiry });
  assert.equal(accepted.status, 201); assert.ok(accepted.body.id); assert.equal('sent' in accepted.body, false);
  assert.equal((await request('/api/projects')).status, 401);
  assert.equal((await request('/api/admin/inquiries')).status, 401);
});

test('real register/login sessions retain server-owned roles and admin access is explicit', async () => {
  client = await signup('Client A', 'client-a@example.test');
  second = await signup('Client B', 'client-b@example.test');
  await createAdminUser({ name: 'Studio test', email: 'operator@example.test', password });
  const login = await request('/api/auth/login', { method: 'POST', body: { email: 'operator@example.test', password } });
  assert.equal(login.status, 200); assert.equal(login.body.user.role, 'admin'); admin = login.cookie;
  assert.equal((await request('/api/admin/projects', { cookie: client })).status, 403);
  assert.equal((await request('/api/admin/inquiries', { cookie: admin })).body.inquiries.length, 1);
  assert.equal((await request('/api/auth/me', { cookie: client })).body.user.name, 'Client A');
  assert.equal((await request('/api/projects', { cookie: client, origin: 'https://foreign.example', method: 'POST', body: { configuration: { offerId: 'vitrine' } } })).status, 403);
});

test('projects, contents and private uploads cross all mounted routers with owner isolation and reversible trash', async () => {
  const created = await request('/api/projects', { cookie: client, method: 'POST', body: { name: 'Atelier test', configuration: { offerId: 'connecte', language: 'fr-en', managedContent: false, scene3d: false } } });
  assert.equal(created.status, 201); project = created.body.project;
  assert.equal(project.configuration.managedContent, true);
  const content = await owned('/contents/accueil', { method: 'PUT', body: { title: 'Accueil', data: { hero: 'Notre atelier de céramique.' } } });
  assert.equal(content.status, 200); assert.equal(content.body.content.data.hero, 'Notre atelier de céramique.');
  assert.equal((await owned('/contents/accueil', { cookie: second })).status, 404);
  const upload = new FormData(); upload.append('files', new Blob([png], { type: 'image/png' }), 'photo.png');
  const uploaded = await owned('/files', { method: 'POST', body: upload });
  assert.equal(uploaded.status, 201); file = uploaded.body.files[0];
  assert.equal('storageName' in file, false);
  assert.equal((await request(file.previewUrl, { cookie: second })).status, 404);
  const preview = await fetch(base + file.previewUrl, { headers: { Cookie: client } });
  assert.equal(preview.status, 200); assert.match(preview.headers.get('content-type'), /^image\/png/);
  assert.deepEqual(Buffer.from(await preview.arrayBuffer()), png);
  const download = await fetch(base + file.downloadUrl, { headers: { Cookie: client } });
  assert.equal(download.status, 200); assert.deepEqual(Buffer.from(await download.arrayBuffer()), png);
  assert.match(download.headers.get('content-disposition'), /^attachment;/);
  assert.equal((await owned(`/files/${file.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await owned('/files')).body.files.length, 0);
  assert.equal((await request(file.downloadUrl, { cookie: client })).status, 404);
  assert.equal((await owned(`/files/${file.id}/restore`, { method: 'POST' })).status, 200);
  const detail = await request(`/api/admin/projects/${project.id}`, { cookie: admin });
  assert.equal(detail.status, 200); assert.equal(detail.body.contents.find(item => item.pageKey === 'accueil').data.hero, 'Notre atelier de céramique.'); assert.equal(detail.body.files[0].id, file.id);
});

test('private conversation, publication, feedback and approval bind authenticated actors and latest versions', async () => {
  const message = await owned('/messages', { method: 'POST', body: { body: 'Voici la photo de notre atelier.', attachmentIds: [file.id] } });
  assert.equal(message.status, 201); assert.equal(message.body.message.author.role, 'customer'); assert.equal(message.body.message.attachments[0].id, file.id);
  assert.equal((await owned('/messages', { cookie: second })).status, 404);
  const reply = await owned('/messages', { cookie: admin, method: 'POST', body: { body: 'Photo reçue, merci.' } });
  assert.equal(reply.status, 201); assert.equal(reply.body.message.author.role, 'admin');
  assert.equal((await owned('/previews', { method: 'POST', body: { title: 'Usurpation', fileId: file.id } })).status, 403);
  const initial = await owned('/previews', { cookie: admin, method: 'POST', body: { title: 'Proposition 1', fileId: file.id } });
  assert.equal(initial.status, 201);
  const first = initial.body.preview;
  const feedback = await owned(`/previews/${first.id}/feedback`, { method: 'POST', body: { body: 'Merci de modifier le titre.' } });
  assert.equal(feedback.status, 201); assert.equal(feedback.body.preview.approvals.length, 0);
  const publish = await owned('/previews', { cookie: admin, method: 'POST', body: { title: 'Proposition 2', fileId: file.id } });
  assert.equal(publish.status, 201); latestPreview = publish.body.preview;
  const stale = await owned(`/previews/${first.id}/approve`, { method: 'POST', body: { confirmed: true } });
  assert.equal(stale.status, 409); assert.equal(stale.body.code, 'PREVIEW_SUPERSEDED');
  assert.equal((await owned(`/previews/${latestPreview.id}/approve`, { cookie: admin, method: 'POST', body: { confirmed: true } })).status, 403);
  const approved = await owned(`/previews/${latestPreview.id}/approve`, { method: 'POST', body: { confirmed: true } });
  assert.equal(approved.status, 200); assert.equal(approved.body.preview.status, 'approved');
  const repeat = await owned(`/previews/${latestPreview.id}/approve`, { method: 'POST', body: { confirmed: true } });
  assert.deepEqual(repeat.body.preview.approvals, approved.body.preview.approvals);
  assert.equal((await owned('')).body.project.status, 'approved');
});

test('saved order snapshots survive price/config changes and no readiness state can become a paid order', async () => {
  const billing = { fullName: 'Client A', company: 'Atelier test', email: 'client-a@example.test', address: '1 rue du Test', postalCode: '75001', city: 'Paris', country: 'FR', vatNumber: '' };
  const draft = await owned('/order', { method: 'PUT', body: { billing } });
  assert.equal(draft.status, 200); const first = draft.body.order;
  assert.equal(first.status, 'draft'); assert.equal(first.totalCents, 159000); assert.equal(draft.body.payment.enabled, false);
  assert.equal((await owned('/order', { cookie: second })).status, 404);
  assert.equal((await owned('/checkout', { method: 'POST', body: { orderId: first.id } })).body.code, 'PRICE_UNAVAILABLE');
  const prices = { currency: 'EUR', base: { vitrine: 100000, connecte: 150000, immersif: 200000, 'sur-mesure': null }, options: { 'language-en': 10000, 'managed-content': 20000, 'scene-3d': 30000, deployment: null, 'maintenance-monthly': null } };
  assert.equal((await request('/api/admin/pricing', { cookie: client, method: 'PUT', body: prices })).status, 403);
  assert.equal((await request('/api/admin/pricing', { cookie: admin, method: 'PUT', body: prices })).status, 200);
  const stale = await owned('/order');
  assert.equal(stale.body.isCurrent, false); assert.equal(stale.body.order.totalCents, 159000); assert.equal(stale.body.quote.totalCents, 160000);
  assert.equal((await owned('/checkout', { method: 'POST', body: { orderId: first.id } })).body.code, 'PRICE_UNAVAILABLE');
  const refreshed = await owned('/order', { method: 'PUT', body: { billing } });
  assert.equal(refreshed.status, 200); const current = refreshed.body.order;
  assert.notEqual(current.id, first.id); assert.equal(current.totalCents, 160000); assert.equal(current.snapshot.configuration.managedContent, true);
  const refused = await owned('/checkout', { method: 'POST', body: { orderId: current.id } });
  assert.equal(refused.status, 409); assert.equal(refused.body.code, 'PRICE_UNAVAILABLE');
  closeDb();
  const restored = await owned('/order');
  assert.equal(restored.body.order.id, current.id); assert.equal(restored.body.order.status, 'draft');
  const historic = getDb().prepare('SELECT status,total_cents,configuration_snapshot FROM orders WHERE id = ?').get(first.id);
  assert.equal(historic.status, 'superseded'); assert.equal(historic.total_cents, 159000); assert.equal(JSON.parse(historic.configuration_snapshot).quote.totalCents, 159000);
  assert.equal(getDb().prepare("SELECT count(*) AS n FROM orders WHERE status = 'paid'").get().n, 0);
  const catalogue = await request('/api/catalogue');
  assert.equal(catalogue.body.pricing.base.connecte, 150000); assert.equal(catalogue.body.paymentAvailable, false);
  const unknown = await request('/api/not-a-route', { cookie: client }); assert.equal(unknown.status, 404); assert.match(unknown.headers.get('content-type'), /application\/json/);
});

test('deployment and maintenance choices are validated, owner scoped and durable through actual project routes', async () => {
  const created = await request('/api/projects', { cookie: client, method: 'POST', body: { name: 'Forfait avec suivi', configuration: { offerId: 'vitrine', deployment: true, maintenance: true } } });
  assert.equal(created.status, 201);
  const id = created.body.project.id;
  const route = `/api/projects/${id}`;
  assert.equal(created.body.project.configuration.deployment, true);
  assert.equal(created.body.project.configuration.maintenance, true);
  const unknownMonthly = await request('/api/quote', { method: 'POST', body: { configuration: { offerId: 'vitrine', maintenance: true } } });
  assert.equal(unknownMonthly.status, 200); assert.equal(unknownMonthly.body.quote.totalCents, 100000);
  assert.equal(unknownMonthly.body.quote.monthlyTotalCents, null); assert.equal(unknownMonthly.body.quote.checkoutReady, false);
  assert.equal((await request(route, { cookie: second, method: 'PATCH', body: { configuration: { maintenance: false } } })).status, 404);
  for (const configuration of [{ deployment: 'true' }, { maintenance: 1 }, { maintenance: null }]) {
    assert.equal((await request(route, { cookie: client, method: 'PATCH', body: { configuration } })).status, 400);
  }
  assert.equal((await request(route, { cookie: client })).body.project.configuration.maintenance, true, 'invalid writes must not replace a valid selection');
  const updated = await request(route, { cookie: client, method: 'PATCH', body: { configuration: { maintenance: false } } });
  assert.equal(updated.status, 200); assert.equal(updated.body.project.configuration.deployment, true); assert.equal(updated.body.project.configuration.maintenance, false);
  closeDb();
  const durable = await request(route, { cookie: client });
  assert.equal(durable.body.project.configuration.deployment, true); assert.equal(durable.body.project.configuration.maintenance, false);
});

test('integrated quote and order keep included deployment separate from recurring maintenance, including price changes', async () => {
  const prices = { currency: 'EUR', base: { vitrine: 100000, connecte: 150000, immersif: 200000, 'sur-mesure': null }, options: { 'language-en': 10000, 'managed-content': 20000, 'scene-3d': 30000, deployment: 25000, 'maintenance-monthly': 5000 } };
  assert.equal((await request('/api/admin/pricing', { cookie: admin, method: 'PUT', body: prices })).status, 200);
  const configuration = { offerId: 'connecte', language: 'fr', deployment: true, maintenance: true };
  const quoted = await request('/api/quote', { method: 'POST', body: { configuration } });
  assert.equal(quoted.status, 200); assert.equal(quoted.body.quote.totalCents, 150000); assert.equal(quoted.body.quote.monthlyTotalCents, 5000);
  assert.equal(quoted.body.quote.lines.find(line => line.key === 'deployment').billing, 'once');
  assert.equal(quoted.body.quote.lines.find(line => line.key === 'deployment').included, true);
  assert.equal(quoted.body.quote.lines.find(line => line.key === 'deployment').amountCents, 0);
  assert.equal(quoted.body.quote.lines.find(line => line.key === 'maintenance-monthly').billing, 'monthly');
  assert.equal(quoted.body.quote.lines.find(line => line.key === 'managed-content').included, true);
  const created = await request('/api/projects', { cookie: client, method: 'POST', body: { configuration } });
  assert.equal(created.status, 201);
  const route = `/api/projects/${created.body.project.id}`;
  const billing = { fullName: 'Client A', email: 'client-a@example.test', address: '1 rue du Test', postalCode: '75001', city: 'Paris', country: 'FR' };
  const saved = await request(`${route}/order`, { cookie: client, method: 'PUT', body: { billing } });
  assert.equal(saved.status, 200); const first = saved.body.order;
  assert.equal(first.totalCents, 150000); assert.equal(first.monthlyTotalCents, 5000);
  assert.equal(first.snapshot.quote.monthlyTotalCents, 5000);
  assert.equal(first.snapshot.configuration.deployment, true); assert.equal(first.snapshot.configuration.maintenance, true);
  const serialized = getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(first.id).configuration_snapshot;
  assert.equal((await request('/api/admin/pricing', { cookie: admin, method: 'PUT', body: { ...prices, options: { ...prices.options, 'maintenance-monthly': 8000 } } })).status, 200);
  const changed = await request(`${route}/order`, { cookie: client });
  assert.equal(changed.body.isCurrent, false); assert.equal(changed.body.order.monthlyTotalCents, 5000); assert.equal(changed.body.quote.monthlyTotalCents, 8000);
  assert.equal(changed.body.order.totalCents, 150000); assert.equal(changed.body.quote.totalCents, 150000);
  const resaved = await request(`${route}/order`, { cookie: client, method: 'PUT', body: { billing } });
  assert.equal(resaved.status, 200); assert.notEqual(resaved.body.order.id, first.id); assert.equal(resaved.body.order.monthlyTotalCents, 8000);
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(first.id).configuration_snapshot, serialized, 'historical creation and monthly prices must not be rewritten');
  assert.equal((await request(`${route}/checkout`, { cookie: client, method: 'POST', body: { orderId: resaved.body.order.id } })).body.code, 'PRICE_UNAVAILABLE');
  assert.equal((await request(`${route}/order`, { cookie: second })).status, 404);
  closeDb();
  const restored = await request(`${route}/order`, { cookie: client });
  assert.equal(restored.body.order.monthlyTotalCents, 8000); assert.equal(restored.body.order.totalCents, 150000);
  const disabled = await request(route, { cookie: client, method: 'PATCH', body: { configuration: { maintenance: false } } });
  assert.equal(disabled.status, 200);
  const withoutMaintenance = await request(`${route}/order`, { cookie: client });
  assert.equal(withoutMaintenance.body.quote.monthlyTotalCents, 0); assert.equal(withoutMaintenance.body.quote.totalCents, 150000);
  assert.equal(withoutMaintenance.body.order.monthlyTotalCents, 8000, 'uncommitted changes do not mutate the saved dossier');
});

test('legacy settings and dossier snapshots remain readable and current without rewriting stored bytes', async () => {
  // Simulate the old persisted shape, which predates the two new option keys,
  // per-line billing frequency and monthly total. Use only this disposable DB.
  const pricingRow = getDb().prepare("SELECT value FROM studio_settings WHERE key = 'pricing'").get();
  const oldPricing = JSON.parse(pricingRow.value);
  delete oldPricing.options.deployment; delete oldPricing.options['maintenance-monthly'];
  getDb().prepare("UPDATE studio_settings SET value = ? WHERE key = 'pricing'").run(JSON.stringify(oldPricing));
  const catalogue = await request('/api/catalogue');
  assert.equal(catalogue.status, 200); assert.equal(catalogue.body.pricing.version, oldPricing.version);
  assert.equal(catalogue.body.pricing.options.deployment, null); assert.equal(catalogue.body.pricing.options['maintenance-monthly'], null);
  const created = await request('/api/projects', { cookie: client, method: 'POST', body: { configuration: { offerId: 'vitrine', language: 'fr' } } });
  assert.equal(created.status, 201);
  const id = created.body.project.id, route = `/api/projects/${id}`;
  const billing = { fullName: 'Client A', email: 'client-a@example.test', address: '1 rue du Test', postalCode: '75001', city: 'Paris', country: 'FR' };
  const saved = await request(`${route}/order`, { cookie: client, method: 'PUT', body: { billing } });
  assert.equal(saved.status, 200); const orderId = saved.body.order.id;
  const snapshot = structuredClone(saved.body.order.snapshot);
  delete snapshot.configuration.deployment; delete snapshot.configuration.maintenance;
  delete snapshot.quote.monthlyTotalCents;
  for (const line of snapshot.quote.lines) delete line.billing;
  const oldConfiguration = { ...snapshot.configuration };
  const serialized = JSON.stringify(snapshot);
  getDb().prepare('UPDATE orders SET configuration_snapshot = ? WHERE id = ?').run(serialized, orderId);
  getDb().prepare('UPDATE projects SET configuration = ? WHERE id = ?').run(JSON.stringify(oldConfiguration), id);
  closeDb();
  const reopened = await request(`${route}/order`, { cookie: client });
  assert.equal(reopened.status, 200); assert.equal(reopened.body.isCurrent, true); assert.equal(reopened.body.order.monthlyTotalCents, 0);
  assert.equal(reopened.body.quote.monthlyTotalCents, 0); assert.equal(reopened.body.quote.totalCents, 100000);
  const updated = await request(`${route}/order`, { cookie: client, method: 'PUT', body: { billing: { ...billing, company: 'Nom actualisé' } } });
  assert.equal(updated.status, 200); assert.equal(updated.body.order.id, orderId, 'editing billing must not create a fake configuration revision');
  assert.equal(updated.body.isCurrent, true); assert.equal(updated.body.order.billing.company, 'Nom actualisé');
  assert.equal(getDb().prepare('SELECT configuration_snapshot FROM orders WHERE id = ?').get(orderId).configuration_snapshot, serialized);
  assert.equal((await request(`${route}/checkout`, { cookie: client, method: 'POST', body: { orderId } })).body.code, 'PRICE_UNAVAILABLE');
});
