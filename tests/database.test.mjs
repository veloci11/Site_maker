import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { closeDb, ensureProjectOwner, getDb, getOwnedProject, now, projectDto, transaction } from '../server/db.mjs';

const originalDataDirectory = process.env.DATA_DIR;
let directory;

before(() => {
  directory = mkdtempSync(path.join(tmpdir(), 'studio-database-test-'));
  process.env.DATA_DIR = directory;
  const db = getDb();
  for (const [id, email] of [['client-a', 'a@example.test'], ['client-b', 'b@example.test']]) {
    db.prepare('INSERT INTO users (id,name,email,password_hash,created_at) VALUES (?,?,?,?,?)')
      .run(id, id, email, 'test-only-hash', now());
  }
});

after(() => {
  closeDb();
  if (originalDataDirectory === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = originalDataDirectory;
  rmSync(directory, { recursive: true, force: true });
});

function createProject(id, owner = 'client-a') {
  const timestamp = now();
  getDb().prepare('INSERT INTO projects (id,user_id,name,offer,configuration,created_at,updated_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, owner, 'Mon site', 'vitrine', JSON.stringify({ offerId: 'vitrine', optionIds: [] }), timestamp, timestamp);
}

test('saved projects survive reconnecting to the durable database', () => {
  createProject('persistent');
  closeDb();
  assert.equal(getOwnedProject('persistent', 'client-a').name, 'Mon site');
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM schema_versions').get().count, 1);
  if (process.platform !== 'win32') assert.equal(statSync(path.join(directory, 'studio.sqlite')).mode & 0o777, 0o600);
});

test('the owner predicate never returns another client’s project', () => {
  createProject('private');
  assert.equal(getOwnedProject('private', 'client-b'), undefined);
  assert.equal(getOwnedProject('missing', 'client-a'), undefined);
  assert.equal(getOwnedProject('private', undefined), undefined);
  const dto = projectDto(getOwnedProject('private', 'client-a'));
  assert.equal(dto.id, 'private');
  assert.deepEqual(dto.configuration, { offerId: 'vitrine', optionIds: [] });
  assert.equal('user_id' in dto, false);
});

test('project ownership middleware hides both absent and unauthorized resources', () => {
  const responses = [];
  const res = { status(code) { responses.push(code); return this; }, json(body) { responses.push(body); return this; } };
  let calls = 0;
  ensureProjectOwner({ params: { projectId: 'private' }, user: { id: 'client-b' } }, res, () => calls++);
  assert.equal(calls, 0);
  assert.equal(responses[0], 404);
  responses.length = 0;
  ensureProjectOwner({ params: { projectId: 'missing' }, user: { id: 'client-a' } }, res, () => calls++);
  assert.equal(responses[0], 404);
  responses.length = 0;
  ensureProjectOwner({ params: { projectId: 'private' } }, res, () => calls++);
  assert.equal(responses[0], 401);
  const req = { params: { projectId: 'private' }, user: { id: 'client-a' } };
  ensureProjectOwner(req, res, () => calls++);
  assert.equal(calls, 1);
  assert.equal(req.project.user_id, 'client-a');
});

test('partial writes are rolled back, including nested committed work', () => {
  assert.throws(() => transaction(() => {
    createProject('rolled-back');
    transaction(() => createProject('nested-rolled-back'));
    throw new Error('abandon');
  }), /abandon/);
  assert.equal(getOwnedProject('rolled-back', 'client-a'), undefined);
  assert.equal(getOwnedProject('nested-rolled-back', 'client-a'), undefined);
  transaction(() => {
    createProject('outer-kept');
    assert.throws(() => transaction(() => {
      createProject('inner-discarded');
      throw new Error('inner');
    }), /inner/);
  });
  assert.ok(getOwnedProject('outer-kept', 'client-a'));
  assert.equal(getOwnedProject('inner-discarded', 'client-a'), undefined);
  assert.throws(() => transaction(async () => {}), /synchrone/);
});

test('foreign keys and JSON checks reject orphaned and corrupt records', () => {
  assert.throws(() => createProject('orphan', 'unknown-user'), /FOREIGN KEY/);
  assert.throws(() => getDb().prepare('UPDATE projects SET configuration = ? WHERE id = ?').run('{bad-json', 'persistent'), /CHECK/);
  assert.equal(getOwnedProject('persistent', 'client-a').name, 'Mon site');
});
