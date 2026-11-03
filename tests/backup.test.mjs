import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { cp, mkdtemp, mkdir, readFile, realpath, rm, stat, symlink, writeFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createBackup } from '../scripts/backup.mjs';
import { initializeInquiries } from '../server/inquiries.mjs';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const timestamp = '2026-11-03T12:00:00.000Z';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'studio-backup-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = path.join(root, 'data');
  await mkdir(path.join(source, 'uploads'), { recursive: true });
  const db = new DatabaseSync(path.join(source, 'studio.sqlite'));
  t.after(() => db.close());
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; CREATE TABLE files (id TEXT PRIMARY KEY, storage_name TEXT NOT NULL, size INTEGER NOT NULL, deleted_at TEXT); CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT NOT NULL);');
  return { root, source, db, targetRoot: path.join(root, 'backups') };
}

function seedInquiry(db, id, { legacy = false, status = 'retry' } = {}) {
  const brief = { activity: 'Atelier de test', audience: 'Professionnels', primaryAction: 'Demander un devis', pages: 'Accueil\nServices\nContact', contentReady: 'partial' };
  const configuration = JSON.stringify({ offerId: 'vitrine', language: 'fr', mobile: false });
  const quote = JSON.stringify({ currency: 'EUR', totalCents: null, monthlyTotalCents: 0, lines: [] });
  const payload = JSON.stringify({ from: 'studio@example.test', to: ['owner@example.test'], reply_to: 'client@example.test', subject: 'Projet Vitrine', text: `Message privé ${id}\nÀ conserver exactement.` });
  db.prepare('INSERT INTO inquiries(id,name,email,subject,message,created_at) VALUES(?,?,?,?,?,?)')
    .run(id, legacy ? 'Atelier & partenaires — nom historique' : 'Camille Test', 'client@example.test', 'Projet Vitrine', `Message privé ${id}\nÀ conserver exactement.`, timestamp);
  db.prepare('INSERT INTO inquiry_details(inquiry_id,request_id,payload_hash,phone,company,inspiration,configuration_snapshot,quote_snapshot) VALUES(?,?,?,?,?,?,?,?)')
    .run(id, randomUUID(), sha256(payload), '+33 1 23 45 67 89', 'Atelier de test', legacy ? 'Ancienne inspiration privée' : '', configuration, quote);
  if (!legacy) db.prepare('INSERT INTO inquiry_briefs(inquiry_id,schema_version,request_type,first_name,last_name,brief_snapshot) VALUES(?,?,?,?,?,?)')
    .run(id, 2, 'vitrine', 'Camille', 'Test', JSON.stringify(brief));
  db.prepare('INSERT INTO inquiry_outbox(inquiry_id,status,attempts,next_attempt_at,first_attempt_at,deadline_at,payload,provider_id,last_error_code,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)')
    .run(id, status, 2, '2026-11-03T12:05:00.000Z', timestamp, '2026-11-04T11:00:00.000Z', payload, status === 'accepted' ? 'offline-provider-id' : null, status === 'accepted' ? null : 'HTTP_503', timestamp);
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

test('a fresh restore preserves briefs, image bytes and ownership, outbox, and historical files after live changes', async t => {
  const { root, source, db, targetRoot } = await fixture(t);
  // An explicit fixture connection prevents the initializer from opening DATA_DIR.
  initializeInquiries(db);
  seedInquiry(db, 'inquiry-one');
  seedInquiry(db, 'inquiry-two', { status: 'accepted' });
  const images = [
    { id: randomUUID(), inquiryId: 'inquiry-one', originalName: 'référence privée.png', mime: 'image/png', bytes: await sharp({ create: { width: 2, height: 3, channels: 3, background: '#de4090' } }).png().toBuffer() },
    { id: randomUUID(), inquiryId: 'inquiry-two', originalName: 'autre demande.webp', mime: 'image/webp', bytes: await sharp({ create: { width: 2, height: 3, channels: 3, background: '#1974af' } }).webp().toBuffer() },
  ];
  const insertImage = db.prepare('INSERT INTO inquiry_attachments(id,inquiry_id,position,original_name,mime,size,sha256,width,height,bytes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  for (const image of images) insertImage.run(image.id, image.inquiryId, 0, image.originalName, image.mime, image.bytes.length, sha256(image.bytes), 2, 3, image.bytes, timestamp);
  const filename = randomUUID(), historicalBytes = Buffer.from('Fichier privé historique dans la corbeille');
  await writeFile(path.join(source, 'uploads', filename), historicalBytes);
  db.prepare('INSERT INTO files VALUES (?,?,?,?)').run('historical-file', filename, historicalBytes.length, timestamp);
  const tables = ['inquiries', 'inquiry_details', 'inquiry_briefs', 'inquiry_outbox'];
  const expected = Object.fromEntries(tables.map(table => [table, db.prepare(`SELECT * FROM ${table} ORDER BY ${table === 'inquiries' ? 'id' : 'inquiry_id'}`).all()]));
  assert.ok((await stat(path.join(source, 'studio.sqlite-wal'))).size > 0);

  const result = await createBackup({ source, targetRoot });
  // Only the historical filesystem upload counts as a copied file.
  assert.equal(result.fileCount, 1);
  const manifest = JSON.parse(await readFile(path.join(result.directory, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.files, [{ id: 'historical-file', storageName: filename, size: historicalBytes.length, sha256: sha256(historicalBytes) }]);
  const databaseHash = manifest.databaseSha256;
  assert.equal(databaseHash, sha256(await readFile(path.join(result.directory, 'studio.sqlite'))));
  assert.deepEqual((await readdir(path.join(result.directory, 'uploads'))), [filename]);

  db.prepare('UPDATE inquiries SET name=?,message=? WHERE id=?').run('Modifié après sauvegarde', 'Nouveau message', 'inquiry-one');
  db.prepare('UPDATE inquiry_briefs SET brief_snapshot=? WHERE inquiry_id=?').run(JSON.stringify({ activity: 'Modifié ensuite' }), 'inquiry-one');
  db.prepare('UPDATE inquiry_details SET configuration_snapshot=? WHERE inquiry_id=?').run('{"modified":true}', 'inquiry-one');
  db.prepare('UPDATE inquiry_attachments SET bytes=?,size=?,sha256=? WHERE id=?').run(images[1].bytes, images[1].bytes.length, sha256(images[1].bytes), images[0].id);
  db.prepare("UPDATE inquiry_outbox SET status='accepted',attempts=3,provider_id='later-id',payload='{}' WHERE inquiry_id=?").run('inquiry-one');
  db.prepare('DELETE FROM inquiries WHERE id=?').run('inquiry-two');
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM inquiry_attachments').get().count, 1);

  const restoreDirectory = path.join(root, 'restored-private-data');
  await cp(result.directory, restoreDirectory, { recursive: true });
  const restored = new DatabaseSync(path.join(restoreDirectory, 'studio.sqlite'), { readOnly: true });
  try {
    for (const table of tables) assert.deepEqual(restored.prepare(`SELECT * FROM ${table} ORDER BY ${table === 'inquiries' ? 'id' : 'inquiry_id'}`).all(), expected[table], table);
    const rows = restored.prepare('SELECT * FROM inquiry_attachments ORDER BY inquiry_id,position').all();
    assert.equal(rows.length, images.length);
    for (const [index, image] of images.entries()) {
      const row = rows[index];
      assert.equal(row.id, image.id);
      assert.equal(row.inquiry_id, image.inquiryId);
      assert.equal(row.position, 0);
      assert.equal(row.original_name, image.originalName);
      assert.equal(row.mime, image.mime);
      assert.equal(row.width, 2);
      assert.equal(row.height, 3);
      assert.equal(row.size, image.bytes.length);
      assert.equal(row.sha256, sha256(image.bytes));
      assert.equal(sha256(row.bytes), row.sha256);
      assert.deepEqual(Buffer.from(row.bytes), image.bytes);
      assert.equal(restored.prepare('SELECT id FROM inquiry_attachments WHERE id=? AND inquiry_id=?').get(image.id, images[1 - index].inquiryId), undefined);
    }
    assert.equal(restored.prepare('SELECT deleted_at FROM files WHERE id=?').get('historical-file').deleted_at, timestamp);
    assert.equal(Object.values(restored.prepare('PRAGMA integrity_check').get())[0], 'ok');
    assert.deepEqual(restored.prepare('PRAGMA foreign_key_check').all(), []);
  } finally { restored.close(); }
  assert.deepEqual(await readFile(path.join(restoreDirectory, 'uploads', filename)), historicalBytes);
  assert.equal(sha256(await readFile(path.join(result.directory, 'studio.sqlite'))), databaseHash);
});

test('an older inbox backup without brief tables restores and migrates without rewriting historical rows', async t => {
  const { root, source, db, targetRoot } = await fixture(t);
  initializeInquiries(db);
  // These are the same historical tables; V2 only adds the two removed tables.
  db.exec('DROP TABLE inquiry_attachments; DROP TABLE inquiry_briefs;');
  seedInquiry(db, 'legacy-inquiry', { legacy: true, status: 'accepted' });
  db.prepare('INSERT INTO inquiries(id,name,email,subject,message,created_at) VALUES(?,?,?,?,?,?)')
    .run('legacy-bare-inquiry', 'Ancien nom indivisible', 'old@example.test', 'Ancien sujet', 'Ancien message sans détails ni outbox', timestamp);
  const tables = ['inquiries', 'inquiry_details', 'inquiry_outbox'];
  const expected = Object.fromEntries(tables.map(table => [table, db.prepare(`SELECT * FROM ${table} ORDER BY ${table === 'inquiries' ? 'id' : 'inquiry_id'}`).all()]));
  await rm(path.join(source, 'uploads'), { recursive: true });

  const result = await createBackup({ source, targetRoot });
  assert.equal(result.fileCount, 0);
  assert.deepEqual((await readdir(result.directory)).sort(), ['manifest.json', 'studio.sqlite']);
  const restoreDirectory = path.join(root, 'restored-legacy-data');
  await cp(result.directory, restoreDirectory, { recursive: true });
  const restored = new DatabaseSync(path.join(restoreDirectory, 'studio.sqlite'));
  try {
    restored.exec('PRAGMA foreign_keys=ON;');
    assert.equal(restored.prepare("SELECT COUNT(*) AS count FROM sqlite_schema WHERE name IN ('inquiry_briefs','inquiry_attachments')").get().count, 0);
    initializeInquiries(restored);
    for (const table of tables) assert.deepEqual(restored.prepare(`SELECT * FROM ${table} ORDER BY ${table === 'inquiries' ? 'id' : 'inquiry_id'}`).all(), expected[table], table);
    assert.equal(restored.prepare('SELECT COUNT(*) AS count FROM inquiry_briefs').get().count, 0);
    assert.equal(restored.prepare('SELECT COUNT(*) AS count FROM inquiry_attachments').get().count, 0);
    assert.equal(Object.values(restored.prepare('PRAGMA integrity_check').get())[0], 'ok');
    assert.deepEqual(restored.prepare('PRAGMA foreign_key_check').all(), []);
  } finally { restored.close(); }
});

test('backup refuses an orphan brief even when the SQLite page integrity check passes', async t => {
  const { source, db, targetRoot } = await fixture(t);
  initializeInquiries(db);
  db.exec('PRAGMA foreign_keys=OFF;');
  db.prepare('INSERT INTO inquiry_briefs(inquiry_id,schema_version,request_type,first_name,last_name,brief_snapshot) VALUES(?,?,?,?,?,?)')
    .run('missing-inquiry', 2, 'contact', 'Camille', 'Test', '{}');
  assert.equal(Object.values(db.prepare('PRAGMA integrity_check').get())[0], 'ok');
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 1);
  await assert.rejects(createBackup({ source, targetRoot }), /vérification de la base sauvegardée/);
  assert.deepEqual(await readdir(targetRoot), []);
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
