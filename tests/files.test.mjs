import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createFilesRouter } from '../server/files.mjs';
import { getDb, closeDb, now } from '../server/db.mjs';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBcAAAAAASUVORK5CYII=', 'base64');
const oldDirectory = process.env.DATA_DIR;
let directory, server, base;

before(async () => {
  directory = mkdtempSync(path.join(tmpdir(), 'studio-files-test-'));
  process.env.DATA_DIR = directory;
  const db = getDb();
  for (const [id, role] of [['client-a', 'customer'], ['client-b', 'customer'], ['operator', 'admin']]) db.prepare('INSERT INTO users (id,name,email,password_hash,role,created_at) VALUES (?,?,?,?,?,?)').run(id, id, `${id}@example.test`, 'test-only-hash', role, now());
  for (const [id, owner] of [['project-a', 'client-a'], ['project-b', 'client-b']]) db.prepare('INSERT INTO projects (id,user_id,name,offer,configuration,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(id, owner, id, 'vitrine', '{"offerId":"vitrine","language":"fr","managedContent":false,"scene3d":false}', now(), now());
  const app = express();
  app.use(express.json());
  // Isolated test identity injection. Production obtains the user from server sessions.
  app.use((req, _res, next) => { const id = req.get('x-test-user'); if (['client-a', 'client-b', 'operator'].includes(id)) req.user = { id, role: id === 'operator' ? 'admin' : 'customer' }; next(); });
  app.use('/api/projects', createFilesRouter());
  app.use((error, _req, res, _next) => res.status(500).json({ error: error.message }));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/projects`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  closeDb();
  if (oldDirectory === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = oldDirectory;
  rmSync(directory, { recursive: true, force: true });
});

function request(route, { user = 'client-a', ...options } = {}) { return fetch(`${base}${route}`, { ...options, headers: { ...(user ? { 'x-test-user': user } : {}), ...options.headers } }); }
async function upload({ project = 'project-a', user = 'client-a', bytes = png, name = 'photo.png', mime = 'image/png', category } = {}) {
  const form = new FormData();
  if (category) form.append('category', category);
  form.append('files', new Blob([bytes], { type: mime }), name);
  const response = await request(`/${project}/files`, { user, method: 'POST', body: form });
  return { response, data: await response.json() };
}

test('files require a session and ownership before any upload processing', async () => {
  assert.equal((await request('/project-a/files', { user: null })).status, 401);
  const foreign = await upload({ user: 'client-b' });
  assert.equal(foreign.response.status, 404);
  assert.equal(getDb().prepare('SELECT count(*) AS count FROM files').get().count, 0);
});
test('verified files are stored privately and can be downloaded and previewed', async () => {
  const { response, data } = await upload({ name: '../../logo.png', category: 'logo' });
  assert.equal(response.status, 201);
  const file = data.files[0];
  assert.equal(file.originalName, 'logo.png');
  assert.equal(file.category, 'logo');
  assert.equal('storageName' in file, false);
  const row = getDb().prepare('SELECT * FROM files WHERE id = ?').get(file.id);
  assert.notEqual(row.storage_name, 'logo.png');
  assert.deepEqual(readFileSync(path.join(directory, 'uploads', row.storage_name)), png);
  assert.equal(statSync(path.join(directory, 'uploads', row.storage_name)).mode & 0o777, 0o600);
  const download = await request(`/project-a/files/${file.id}/download`);
  assert.equal(download.status, 200);
  assert.match(download.headers.get('content-disposition'), /^attachment;/);
  assert.equal(download.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(Buffer.from(await download.arrayBuffer()), png);
  const preview = await request(`/project-a/files/${file.id}/preview`);
  assert.equal(preview.status, 200);
  assert.match(preview.headers.get('content-type'), /^image\/png/);
  await preview.arrayBuffer();
});
test('a second client cannot list, read, delete, restore, or cross-reference another file', async () => {
  const { data } = await upload(); const file = data.files[0];
  for (const [method, suffix] of [['GET', ''], ['GET', `/${file.id}/download`], ['GET', `/${file.id}/preview`], ['DELETE', `/${file.id}`], ['POST', `/${file.id}/restore`]]) assert.equal((await request(`/project-a/files${suffix}`, { user: 'client-b', method })).status, 404);
  assert.equal((await request(`/project-b/files/${file.id}/download`, { user: 'client-b' })).status, 404);
  const operator = await request(`/project-a/files/${file.id}/download`, { user: 'operator' });
  assert.equal(operator.status, 200); await operator.arrayBuffer();
});
test('trash is reversible and a stored file survives a database reconnect', async () => {
  const { data } = await upload(); const file = data.files[0];
  assert.equal((await request(`/project-a/files/${file.id}`, { method: 'DELETE' })).status, 200);
  const active = await (await request('/project-a/files')).json();
  assert.equal(active.files.some(item => item.id === file.id), false);
  assert.equal((await request(`/project-a/files/${file.id}/download`)).status, 404);
  const trash = await (await request('/project-a/files?includeDeleted=1')).json();
  assert.ok(trash.files.find(item => item.id === file.id).deletedAt);
  closeDb();
  const restored = await request(`/project-a/files/${file.id}/restore`, { method: 'POST' });
  assert.equal(restored.status, 200);
  assert.equal((await restored.json()).file.deletedAt, null);
  const reopened = await request(`/project-a/files/${file.id}/download`);
  assert.equal(reopened.status, 200); assert.deepEqual(Buffer.from(await reopened.arrayBuffer()), png);
});
test('SVG is an attachment and never an executable inline preview', async () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
  const { response, data } = await upload({ bytes: svg, name: 'logo.svg', mime: 'image/svg+xml' });
  assert.equal(response.status, 201); const file = data.files[0];
  assert.equal(file.previewUrl, null);
  assert.equal((await request(`/project-a/files/${file.id}/preview`)).status, 415);
  const downloaded = await request(`/project-a/files/${file.id}/download`);
  assert.match(downloaded.headers.get('content-disposition'), /^attachment;/);
  assert.match(downloaded.headers.get('content-security-policy'), /sandbox/);
  await downloaded.text();
});
test('invalid file batches are rejected atomically and temporary files are cleaned', async () => {
  const count = getDb().prepare('SELECT count(*) AS count FROM files').get().count;
  const form = new FormData(); form.append('files', new Blob([png], { type: 'image/png' }), 'valid.png'); form.append('files', new Blob(['<html>bad</html>'], { type: 'image/png' }), 'fake.png');
  const response = await request('/project-a/files', { method: 'POST', body: form });
  assert.equal(response.status, 400);
  assert.equal(getDb().prepare('SELECT count(*) AS count FROM files').get().count, count);
  assert.deepEqual(readdirSync(path.join(directory, 'upload-tmp')), []);
  assert.equal((await upload({ bytes: 'plain', name: 'x.html', mime: 'text/html' })).response.status, 400);
  assert.equal((await upload({ category: 'invalid' })).response.status, 400);
});
test('oversized files are rejected without retaining partial uploads', async () => {
  const huge = Buffer.alloc(10 * 1024 * 1024 + 1); png.copy(huge);
  const result = await upload({ bytes: huge });
  assert.equal(result.response.status, 413);
  assert.deepEqual(readdirSync(path.join(directory, 'upload-tmp')), []);
});
test('upload directories cannot escape the private data directory through a symlink', async () => {
  const external = mkdtempSync(path.join(tmpdir(), 'studio-public-link-test-'));
  const temporary = path.join(directory, 'upload-tmp');
  try {
    rmSync(temporary, { recursive: true }); symlinkSync(external, temporary);
    const result = await upload();
    assert.equal(result.response.status, 500);
    assert.deepEqual(readdirSync(external), []);
  } finally { unlinkSync(temporary); rmSync(external, { recursive: true, force: true }); }
});
