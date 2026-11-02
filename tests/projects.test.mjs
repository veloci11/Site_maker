import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import { createProjectsRouter } from '../server/projects.mjs';
import { closeDb, getDb, now } from '../server/db.mjs';

const originalDataDirectory = process.env.DATA_DIR;
let directory;
let server;
let endpoint;

before(async () => {
  directory = mkdtempSync(path.join(tmpdir(), 'studio-project-api-test-'));
  process.env.DATA_DIR = directory;
  const db = getDb();
  for (const id of ['owner-a', 'owner-b']) {
    db.prepare('INSERT INTO users(id,name,email,password_hash,created_at) VALUES (?,?,?,?,?)')
      .run(id, id, `${id}@example.test`, 'test-only-hash', now());
  }
  const app = express();
  app.use(express.json({ limit: '500kb' }));
  // Isolated test identity injection. Production only uses authenticated sessions.
  app.use((req, _res, next) => {
    const id = req.get('x-test-user');
    if (['owner-a', 'owner-b'].includes(id)) req.user = { id };
    next();
  });
  app.use('/api/projects', createProjectsRouter());
  app.use((_error, _req, res, _next) => res.status(500).json({ error: 'Erreur de test inattendue.' }));
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  endpoint = `http://127.0.0.1:${server.address().port}/api/projects`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  closeDb();
  if (originalDataDirectory === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = originalDataDirectory;
  rmSync(directory, { recursive: true, force: true });
});

async function request(route = '', { user = 'owner-a', method = 'GET', body } = {}) {
  const response = await fetch(`${endpoint}${route}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(user ? { 'x-test-user': user } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: await response.json() };
}

async function create(user = 'owner-a', configuration = { offerId: 'vitrine', language: 'fr', managedContent: false, scene3d: false }) {
  const result = await request('', { user, method: 'POST', body: { name: 'Mon site de test', configuration } });
  assert.equal(result.status, 201);
  return result.body.project;
}

test('projects require authentication and central normalization preserves included features', async () => {
  assert.equal((await request('', { user: null })).status, 401);
  assert.equal((await request('', { user: null, method: 'POST', body: {} })).status, 401);
  const project = await create('owner-a', { offerId: 'connecte', language: 'fr-en', managedContent: false, scene3d: false });
  assert.equal(project.offerId, 'connecte');
  assert.equal(project.configuration.managedContent, true);
  assert.equal(project.configuration.language, 'fr-en');
  assert.equal(project.status, 'draft');
  assert.equal('user_id' in project, false);
});

test('a second account cannot list, read, alter or write content in another project', async () => {
  const privateProject = await create('owner-a');
  const other = await create('owner-b');
  const list = await request('', { user: 'owner-b' });
  assert.ok(list.body.projects.some((item) => item.id === other.id));
  assert.ok(list.body.projects.every((item) => item.id !== privateProject.id));
  const unauthorized = await request(`/${privateProject.id}`, { user: 'owner-b' });
  const missing = await request('/does-not-exist', { user: 'owner-b' });
  assert.equal(unauthorized.status, 404);
  assert.deepEqual(unauthorized.body, missing.body);
  assert.equal((await request(`/${privateProject.id}`, { user: 'owner-b', method: 'PATCH', body: { name: 'Volé' } })).status, 404);
  assert.equal((await request(`/${privateProject.id}/contents/accueil`, { user: 'owner-b' })).status, 404);
  assert.equal((await request(`/${privateProject.id}/contents/accueil`, { user: 'owner-b', method: 'PUT', body: { data: { body: 'Volé' } } })).status, 404);
  assert.equal((await request(`/${privateProject.id}`)).body.project.name, 'Mon site de test');
});

test('project updates cannot transfer ownership, forge status or smuggle prices', async () => {
  const project = await create();
  for (const body of [{ userId: 'owner-b' }, { status: 'paid' }, { configuration: { totalCents: 1 } }, { configuration: { scene3d: 'false' } }]) {
    assert.equal((await request(`/${project.id}`, { method: 'PATCH', body })).status, 400);
  }
  const valid = await request(`/${project.id}`, { method: 'PATCH', body: { configuration: { offerId: 'immersif', scene3d: false } } });
  assert.equal(valid.status, 200);
  assert.equal(valid.body.project.configuration.scene3d, true);
  assert.equal(valid.body.project.status, 'draft');
  assert.equal((await request(`/${project.id}`, { user: 'owner-b' })).status, 404);
});

test('activity and page text persist and remain scoped to their project', async () => {
  const project = await create();
  assert.equal((await request(`/${project.id}`, { method: 'PATCH', body: { activity: { companyName: 'Atelier', description: 'Des créations durables.' } } })).status, 200);
  const updated = await request(`/${project.id}`, { method: 'PATCH', body: { activity: { phone: '+33 1 00 00 00 00' } } });
  assert.equal(updated.body.project.activity.companyName, 'Atelier');
  const saved = await request(`/${project.id}/contents/accueil`, { method: 'PUT', body: { title: 'Accueil', data: { heading: 'L’atelier', body: 'Une première ligne.\nUne seconde.', services: '<texte conservé comme texte>' } } });
  assert.equal(saved.status, 200);
  closeDb();
  const restored = await request(`/${project.id}/contents/accueil`);
  assert.deepEqual(restored.body.content.data, saved.body.content.data);
  assert.ok((await request(`/${project.id}/contents`)).body.contents.some((item) => item.pageKey === 'accueil'));
  const newPage = await request(`/${project.id}/contents/mes-creations`);
  assert.equal(newPage.status, 200);
  assert.deepEqual(newPage.body.content.data, {});
});

test('malformed records are rejected without replacing saved content', async () => {
  const project = await create();
  await request(`/${project.id}/contents/accueil`, { method: 'PUT', body: { data: { body: 'À conserver' } } });
  for (const data of [[], { body: { rich: 'object' } }, { body: 'x'.repeat(10_001) }, JSON.parse('{"__proto__":"bad"}')]) {
    assert.equal((await request(`/${project.id}/contents/accueil`, { method: 'PUT', body: { data } })).status, 400);
  }
  assert.equal((await request(`/${project.id}/contents/constructor`)).status, 400);
  assert.equal((await request(`/${project.id}/contents/a_bad_slug`)).status, 400);
  assert.equal((await request(`/${project.id}/contents/accueil`)).body.content.data.body, 'À conserver');
});

test('a stale editor cannot overwrite another tab and receives the saved page for comparison', async () => {
  const project = await create();
  const route = `/${project.id}/contents/accueil`;
  const opened = (await request(route)).body.content;
  const first = await request(route, { method: 'PUT', body: { title: 'Accueil publiée', data: { body: 'Première modification' }, expectedUpdatedAt: opened.updatedAt } });
  assert.equal(first.status, 200);
  const stale = await request(route, { method: 'PUT', body: { data: { body: 'Ancien onglet' }, expectedUpdatedAt: opened.updatedAt } });
  assert.equal(stale.status, 409);
  assert.equal(stale.body.code, 'CONTENT_CONFLICT');
  assert.deepEqual(stale.body.content, first.body.content);
  assert.deepEqual((await request(route)).body.content, first.body.content);
  // Existing API integrations without the new field remain compatible.
  assert.equal((await request(route, { method: 'PUT', body: { data: { body: 'Appel historique' } } })).status, 200);
});

test('content version tokens advance even for writes within the same millisecond', async () => {
  const project = await create();
  const route = `/${project.id}/contents/accueil`;
  const initial = (await request(route)).body.content;
  const originalNow = Date.now;
  Date.now = () => Date.parse(initial.updatedAt);
  try {
    const first = await request(route, { method: 'PUT', body: { data: { body: 'A' }, expectedUpdatedAt: initial.updatedAt } });
    const second = await request(route, { method: 'PUT', body: { data: { body: 'B' }, expectedUpdatedAt: first.body.content.updatedAt } });
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(Date.parse(first.body.content.updatedAt), Date.parse(initial.updatedAt) + 1);
    assert.equal(Date.parse(second.body.content.updatedAt), Date.parse(initial.updatedAt) + 2);
    assert.equal((await request(route, { method: 'PUT', body: { data: { body: 'Perte' }, expectedUpdatedAt: first.body.content.updatedAt } })).status, 409);
  } finally { Date.now = originalNow; }
});

test('conditional creation detects duplicate page names and rejects invalid concurrency tokens', async () => {
  const project = await create();
  const route = `/${project.id}/contents/mes-realisations`;
  const first = await request(route, { method: 'PUT', body: { title: 'Mes réalisations', data: { body: 'Créée une fois' }, expectedUpdatedAt: null } });
  assert.equal(first.status, 200);
  const duplicate = await request(route, { method: 'PUT', body: { title: 'Même nom', data: {}, expectedUpdatedAt: null } });
  assert.equal(duplicate.status, 409);
  assert.deepEqual(duplicate.body.content, first.body.content);
  for (const expectedUpdatedAt of [123, {}, '', 'not-a-date', '2026-02-31T00:00:00.000Z']) {
    assert.equal((await request(route, { method: 'PUT', body: { data: {}, expectedUpdatedAt } })).status, 400);
  }
  assert.deepEqual((await request(route)).body.content, first.body.content);
});
