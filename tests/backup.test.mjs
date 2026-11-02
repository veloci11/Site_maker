import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, realpath, rm, stat, symlink, writeFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBackup } from '../scripts/backup.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'studio-backup-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = path.join(root, 'data');
  await mkdir(path.join(source, 'uploads'), { recursive: true });
  const db = new DatabaseSync(path.join(source, 'studio.sqlite'));
  t.after(() => db.close());
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE files (id TEXT PRIMARY KEY, storage_name TEXT NOT NULL, size INTEGER NOT NULL, deleted_at TEXT); CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT NOT NULL);');
  return { root, source, db, targetRoot: path.join(root, 'backups') };
}

test('backup restores committed WAL rows and immutable files, including the recoverable bin', async t => {
  const fixtureData = await fixture(t);
  const { root, source, db, targetRoot } = fixtureData;
  db.prepare('INSERT INTO projects VALUES (?,?)').run('project-1', 'Atelier');
  const filename = randomUUID(), bytes = Buffer.from('Contenu privé du client');
  await writeFile(path.join(source, 'uploads', filename), bytes);
  db.prepare('INSERT INTO files VALUES (?,?,?,?)').run('file-1', filename, bytes.length, new Date().toISOString());
  await writeFile(path.join(source, 'mail-outbox.ndjson'), 'secret reset link');
  const result = await createBackup({ source, targetRoot });
  assert.equal(result.fileCount, 1);
  const restored = new DatabaseSync(path.join(result.directory, 'studio.sqlite'), { readOnly: true });
  try {
    assert.equal(restored.prepare('SELECT name FROM projects').get().name, 'Atelier');
    assert.equal(restored.prepare('SELECT deleted_at FROM files').get().deleted_at !== null, true);
    assert.equal(Object.values(restored.prepare('PRAGMA integrity_check').get())[0], 'ok');
  } finally { restored.close(); }
  assert.deepEqual(await readFile(path.join(result.directory, 'uploads', filename)), bytes);
  const manifest = JSON.parse(await readFile(path.join(result.directory, 'manifest.json'), 'utf8'));
  assert.equal(manifest.files[0].size, bytes.length);
  assert.match(manifest.databaseSha256, /^[0-9a-f]{64}$/);
  assert.equal((await stat(result.directory)).mode & 0o777, 0o700);
  assert.equal((await stat(path.join(result.directory, 'studio.sqlite'))).mode & 0o777, 0o600);
  assert.equal((await stat(path.join(result.directory, 'uploads', filename))).mode & 0o777, 0o600);
  assert.equal((await readdir(result.directory)).includes('mail-outbox.ndjson'), false);
  db.prepare('UPDATE projects SET name=?').run('Projet modifié ensuite');
  const unchanged = new DatabaseSync(path.join(result.directory, 'studio.sqlite'), { readOnly: true });
  try { assert.equal(unchanged.prepare('SELECT name FROM projects').get().name, 'Atelier'); } finally { unchanged.close(); }
  assert.ok(result.directory.startsWith(await realpath(root) + path.sep));
});

test('backup refuses a symlink upload and removes its incomplete output', async t => {
  const { root, source, db, targetRoot } = await fixture(t);
  const filename = randomUUID();
  await writeFile(path.join(root, 'outside.txt'), 'private');
  await symlink(path.join(root, 'outside.txt'), path.join(source, 'uploads', filename));
  db.prepare('INSERT INTO files VALUES (?,?,?,NULL)').run('file-1', filename, 7);
  await assert.rejects(createBackup({ source, targetRoot }));
  assert.deepEqual(await readdir(targetRoot), []);
});

test('backup refuses public destinations, source nesting, and inconsistent file sizes', async t => {
  const { source, db, targetRoot } = await fixture(t);
  const projectRoot = fileURLToPath(new URL('../', import.meta.url));
  await assert.rejects(createBackup({ source, targetRoot: path.join(projectRoot, 'public/backups') }), /publics/);
  await assert.rejects(createBackup({ source, targetRoot: path.join(source, 'backups') }), /hors du dossier/);
  const filename = randomUUID();
  await writeFile(path.join(source, 'uploads', filename), 'not-the-recorded-size');
  db.prepare('INSERT INTO files VALUES (?,?,?,NULL)').run('file-1', filename, 3);
  await assert.rejects(createBackup({ source, targetRoot }), /taille/);
  assert.deepEqual(await readdir(targetRoot), []);
});
