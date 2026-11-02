import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import { createCollaborationRouter } from '../server/collaboration.mjs';
import { createFilesRouter } from '../server/files.mjs';
import { getDb, closeDb, newId, now } from '../server/db.mjs';

const originalDataDirectory = process.env.DATA_DIR;
let directory, server, endpoint;

before(async () => {
  directory = mkdtempSync(path.join(tmpdir(), 'studio-collaboration-'));
  process.env.DATA_DIR = directory;
  const db = getDb();
  for (const [id, role] of [['owner-a', 'customer'], ['owner-b', 'customer'], ['studio-admin', 'admin']]) {
    db.prepare('INSERT INTO users(id,name,email,password_hash,role,created_at) VALUES(?,?,?,?,?,?)').run(id, id, `${id}@example.test`, 'isolated-test-only', role, now());
  }
  const app = express();
  app.use(express.json());
  // The real application uses the authenticated server session. These test identities
  // are looked up in SQLite, so role/author payloads cannot create operator rights.
  app.use((req, _res, next) => {
    const id = req.get('x-test-user');
    if (id) req.user = getDb().prepare('SELECT id,name,email,role FROM users WHERE id = ?').get(id);
    next();
  });
  app.use('/api/projects', createFilesRouter());
  app.use('/api/projects', createCollaborationRouter());
  app.use((_error, _req, res, _next) => res.status(500).json({ error: 'Erreur de test inattendue.' }));
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  endpoint = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  closeDb();
  if (originalDataDirectory === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = originalDataDirectory;
  rmSync(directory, { recursive: true, force: true });
});
function project(owner = 'owner-a') {
  const id = newId(), timestamp = now();
  getDb().prepare('INSERT INTO projects(id,user_id,name,offer,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(id, owner, 'Projet privé', 'vitrine', timestamp, timestamp);
  return id;
}
async function request(route, { user = 'owner-a', method = 'GET', body } = {}) {
  const response = await fetch(`${endpoint}/api/projects${route}`, {
    method, headers: { 'Content-Type': 'application/json', ...(user ? { 'x-test-user': user } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: await response.json(), headers: response.headers };
}
async function upload(projectId, user = 'owner-a', name = 'brief.txt', data = 'Un document privé', mime = 'text/plain') {
  const form = new FormData(); form.append('files', new Blob([data], { type: mime }), name);
  const response = await fetch(`${endpoint}/api/projects/${projectId}/files`, { method: 'POST', headers: { 'x-test-user': user }, body: form });
  assert.equal(response.status, 201);
  return (await response.json()).files[0];
}
async function publish(projectId, data = { title: 'Première proposition', url: 'https://example.com/maquette' }) {
  const response = await request(`/${projectId}/previews`, { user: 'studio-admin', method: 'POST', body: data });
  assert.equal(response.status, 201); return response.body.preview;
}

test('all collaboration routes enforce session, project ownership and explicit admin access', async () => {
  const id = project();
  const preview = await publish(id);
  const routes = [
    [`/${id}/messages`, 'GET'], [`/${id}/messages`, 'POST', { body: 'Question privée' }],
    [`/${id}/previews`, 'GET'], [`/${id}/previews`, 'POST', { title: 'Essai', url: 'https://example.com' }],
    [`/${id}/previews/${preview.id}/feedback`, 'POST', { body: 'Retour privé' }],
    [`/${id}/previews/${preview.id}/approve`, 'POST', { confirmed: true }],
  ];
  for (const [route, method, body] of routes) {
    assert.equal((await request(route, { user: null, method, body })).status, 401);
    assert.equal((await request(route, { user: 'owner-b', method, body })).status, 404);
  }
  assert.equal((await request(`/${id}/messages`, { user: 'studio-admin' })).status, 200);
  assert.equal((await request(`/${id}/previews`, { user: 'studio-admin' })).status, 200);
  assert.equal((await request(`/${id}/previews/${preview.id}/approve`, { user: 'studio-admin', method: 'POST', body: { confirmed: true } })).status, 403);
});

test('real messages retain authenticated authors, protected attachments and studio replies', async () => {
  const id = project();
  assert.deepEqual((await request(`/${id}/messages`)).body.messages, []);
  const file = await upload(id);
  const sent = await request(`/${id}/messages`, { method: 'POST', body: { body: 'Voici mon brief.\nMerci !', attachmentIds: [file.id], authorId: 'studio-admin', role: 'admin' } });
  assert.equal(sent.status, 201);
  assert.equal(sent.body.message.author.id, 'owner-a');
  assert.equal(sent.body.message.author.role, 'customer');
  assert.equal(sent.body.message.attachments[0].downloadUrl, file.downloadUrl);
  assert.equal((await fetch(endpoint + file.downloadUrl, { headers: { 'x-test-user': 'owner-b' } })).status, 404);
  const download = await fetch(endpoint + file.downloadUrl, { headers: { 'x-test-user': 'studio-admin' } });
  assert.equal(download.status, 200); assert.equal(await download.text(), 'Un document privé');
  const reply = await request(`/${id}/messages`, { user: 'studio-admin', method: 'POST', body: { body: 'Merci, le brief est reçu.' } });
  assert.equal(reply.body.message.author.role, 'admin');
  closeDb(); // The next HTTP request reopens the durable database.
  const list = await request(`/${id}/messages`);
  assert.equal(list.headers.get('cache-control'), 'private, no-store');
  assert.equal(list.body.messages.length, 2);
  assert.equal(list.body.messages[0].body, 'Voici mon brief.\nMerci !');
});

test('attachment selection is atomic, same-project and active; deleted attachments become unavailable', async () => {
  const id = project(), other = project('owner-b');
  const file = await upload(id), foreign = await upload(other, 'owner-b');
  for (const ids of [[foreign.id], [file.id, foreign.id], [file.id, file.id], ['missing']]) {
    assert.equal((await request(`/${id}/messages`, { method: 'POST', body: { body: 'À conserver ?', attachmentIds: ids } })).status, 400);
  }
  assert.equal((await request(`/${id}/messages`)).body.messages.length, 0);
  assert.equal((await request(`/${id}/messages`, { method: 'POST', body: { attachmentIds: [file.id] } })).status, 201);
  await request(`/${id}/files/${file.id}`, { method: 'DELETE' });
  assert.equal((await request(`/${id}/messages`, { method: 'POST', body: { attachmentIds: [file.id] } })).status, 400);
  const message = (await request(`/${id}/messages`)).body.messages[0];
  assert.equal(message.attachments.length, 0); assert.equal(message.unavailableAttachments, 1);
  for (const body of [{ body: ' ' }, { body: 'x'.repeat(10_001) }, { body: {} }, { body: 'a', attachmentIds: 'bad' }]) {
    assert.equal((await request(`/${id}/messages`, { method: 'POST', body })).status, 400);
  }
});

test('only the studio publishes and versions are server assigned; unsafe URLs never enter the library', async () => {
  const id = project();
  assert.equal((await request(`/${id}/previews`, { method: 'POST', body: { title: 'Usurpation', url: 'https://example.com', role: 'admin' } })).status, 403);
  for (const url of ['javascript:alert(1)', 'data:text/html,<script/>', 'http://example.com', 'https://localhost:8443', 'https://127.0.0.1', 'https://[::1]', 'https://10.0.0.1', 'https://user:password@example.com', 'https://intranet.local']) {
    assert.equal((await request(`/${id}/previews`, { user: 'studio-admin', method: 'POST', body: { title: 'Refus', url } })).status, 400, url);
  }
  assert.equal((await request(`/${id}/previews`, { user: 'studio-admin', method: 'POST', body: { title: 'Version forgée', url: 'https://example.com', version: 99 } })).status, 400);
  const first = await publish(id), second = await publish(id, { title: 'Nouvelle proposition', url: 'https://example.org/site' });
  assert.equal(first.version, 1); assert.equal(second.version, 2);
  const versions = (await request(`/${id}/previews`)).body.previews;
  assert.deepEqual(versions.map(item => item.version), [2, 1]);
  assert.equal(versions[0].isLatest, true); assert.equal(versions[1].isLatest, false);
});

test('published files must belong to the project and a removed source cannot be approved', async () => {
  const id = project(), other = project('owner-b');
  const foreign = await upload(other, 'owner-b');
  assert.equal((await request(`/${id}/previews`, { user: 'studio-admin', method: 'POST', body: { title: 'Mauvais projet', fileId: foreign.id } })).status, 400);
  const file = await upload(id, 'owner-a', 'logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', 'image/svg+xml');
  const preview = await publish(id, { title: 'Document transmis', fileId: file.id });
  assert.equal(preview.file.previewUrl, null);
  const inline = await fetch(`${endpoint}/api/projects/${id}/files/${file.id}/preview`, { headers: { 'x-test-user': 'owner-a' } });
  assert.equal(inline.status, 415);
  await request(`/${id}/files/${file.id}`, { method: 'DELETE' });
  assert.equal((await request(`/${id}/previews/${preview.id}/approve`, { method: 'POST', body: { confirmed: true } })).status, 409);
  const unavailable = (await request(`/${id}/previews`)).body.previews[0];
  assert.equal(unavailable.file, null); assert.equal(unavailable.sourceUnavailable, true);
});

test('feedback remains tied to its version and does not imply approval', async () => {
  const id = project(), other = project();
  const preview = await publish(id), foreign = await publish(other);
  assert.equal((await request(`/${id}/previews/${foreign.id}/feedback`, { method: 'POST', body: { body: 'Autre projet' } })).status, 404);
  assert.equal((await request(`/${id}/previews/${preview.id}/feedback`, { method: 'POST', body: { body: ' ' } })).status, 400);
  const result = await request(`/${id}/previews/${preview.id}/feedback`, { method: 'POST', body: { body: 'Agrandir le titre, s’il vous plaît.' } });
  assert.equal(result.status, 201); assert.equal(result.body.preview.feedback.length, 1);
  assert.equal(result.body.preview.status, 'review'); assert.equal(result.body.preview.approvals.length, 0);
  const reply = await request(`/${id}/previews/${preview.id}/feedback`, { user: 'studio-admin', method: 'POST', body: { body: 'Le changement est prévu.' } });
  assert.equal(reply.body.preview.feedback[1].author.role, 'admin');
  assert.equal((await request(`/${id}/previews`)).body.previews[0].feedback[0].body, 'Agrandir le titre, s’il vous plaît.');
});

test('approval requires explicit confirmation, is idempotent, and always checks the latest version', async () => {
  const id = project(), first = await publish(id);
  for (const body of [{}, { confirmed: 'true' }, { confirmed: false }]) {
    assert.equal((await request(`/${id}/previews/${first.id}/approve`, { method: 'POST', body })).status, 400);
  }
  const approved = await request(`/${id}/previews/${first.id}/approve`, { method: 'POST', body: { confirmed: true } });
  assert.equal(approved.status, 200); assert.equal(approved.body.preview.status, 'approved');
  const repeat = await request(`/${id}/previews/${first.id}/approve`, { method: 'POST', body: { confirmed: true } });
  assert.deepEqual(repeat.body.preview.approvals, approved.body.preview.approvals);
  const second = await publish(id);
  const stale = await request(`/${id}/previews/${first.id}/approve`, { method: 'POST', body: { confirmed: true } });
  assert.equal(stale.status, 409); assert.equal(stale.body.code, 'PREVIEW_SUPERSEDED');
  assert.equal(getDb().prepare('SELECT status FROM projects WHERE id = ?').get(id).status, 'review');
  const current = await request(`/${id}/previews/${second.id}/approve`, { method: 'POST', body: { confirmed: true } });
  assert.equal(current.body.preview.approvals.length, 1);
  assert.equal(getDb().prepare('SELECT status FROM projects WHERE id = ?').get(id).status, 'approved');
});
