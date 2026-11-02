import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { chmod, lstat, mkdir, open, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (child, parent) => child === parent || child.startsWith(parent + path.sep);

async function resolvedPath(filename) {
  const missing = [];
  let existing = path.resolve(filename);
  while (true) {
    try { return path.resolve(await realpath(existing), ...missing); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(existing);
      if (parent === existing) throw error;
      missing.unshift(path.basename(existing)); existing = parent;
    }
  }
}

async function privatePath(filename) {
  const resolved = await resolvedPath(filename);
  for (const publicRoot of [path.join(projectRoot, 'public'), path.join(projectRoot, 'dist/client')]) {
    if (inside(resolved, await resolvedPath(publicRoot))) throw new Error('La sauvegarde et les données doivent rester hors des fichiers publics.');
  }
  return resolved;
}

/**
 * SQLite's VACUUM INTO makes a consistent database snapshot, including committed
 * WAL contents. Uploads in this release are immutable and only soft-deleted, so
 * copying exactly the files referenced by that snapshot is consistent as well.
 * A future physical-purge feature must coordinate with this backup first.
 */
export async function createBackup({ source = process.env.DATA_DIR || path.join(projectRoot, '.data'), targetRoot } = {}) {
  if (!targetRoot) throw new Error('Indiquez un dossier privé de sauvegarde avec --to.');
  const from = await privatePath(source);
  const to = await privatePath(targetRoot);
  if (inside(to, from)) throw new Error('La sauvegarde doit être placée hors du dossier de données source.');
  const database = path.join(from, 'studio.sqlite');
  const info = await lstat(database);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('La base source doit être un fichier SQLite ordinaire.');
  await mkdir(to, { recursive: true, mode: 0o700 });
  const directory = path.join(to, `studio-${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}`);
  await mkdir(directory, { mode: 0o700 });
  const snapshotPath = path.join(directory, 'studio.sqlite');
  let live, snapshot;
  try {
    live = new DatabaseSync(database, { readOnly: true });
    live.exec('PRAGMA busy_timeout = 10000; PRAGMA synchronous = FULL;');
    live.prepare('VACUUM INTO ?').run(snapshotPath);
    live.close(); live = null;
    await chmod(snapshotPath, 0o600);
    snapshot = new DatabaseSync(snapshotPath, { readOnly: true });
    const integrity = Object.values(snapshot.prepare('PRAGMA integrity_check').get())[0];
    if (integrity !== 'ok' || snapshot.prepare('PRAGMA foreign_key_check').all().length) throw new Error('La vérification de la base sauvegardée a échoué.');
    const rows = snapshot.prepare('SELECT id, storage_name, size FROM files ORDER BY id').all();
    snapshot.close(); snapshot = null;
    const files = [];
    if (rows.length) {
      const uploadRoot = await realpath(path.join(from, 'uploads'));
      if (!inside(uploadRoot, from)) throw new Error('Le dossier de fichiers source doit rester dans le dossier privé.');
      await mkdir(path.join(directory, 'uploads'), { mode: 0o700 });
      for (const row of rows) {
        if (!/^[a-f0-9-]{36}$/i.test(row.storage_name)) throw new Error('Un nom de stockage est invalide.');
        const handle = await open(path.join(uploadRoot, row.storage_name), constants.O_RDONLY | constants.O_NOFOLLOW);
        let bytes;
        try {
          const fileInfo = await handle.stat();
          if (!fileInfo.isFile() || fileInfo.size !== row.size) throw new Error('Un fichier référencé est absent ou sa taille est incohérente.');
          bytes = await handle.readFile();
        } finally { await handle.close(); }
        if (bytes.length !== row.size) throw new Error('Un fichier a changé pendant la sauvegarde.');
        await writeFile(path.join(directory, 'uploads', row.storage_name), bytes, { flag: 'wx', mode: 0o600 });
        files.push({ id: row.id, storageName: row.storage_name, size: row.size, sha256: sha256(bytes) });
      }
    }
    const manifest = { version: 1, createdAt: new Date().toISOString(), databaseSha256: sha256(await readFile(snapshotPath)), files };
    await writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    return { directory, fileCount: files.length };
  } catch (error) {
    try { live?.close(); } catch { /* Preserve the original failure. */ }
    try { snapshot?.close(); } catch { /* Preserve the original failure. */ }
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    for (let index = 0; index < args.length; index += 2) {
      if (!['--from', '--to'].includes(args[index]) || !args[index + 1] || args[index + 1].startsWith('--') || options[args[index]]) throw new Error('Usage : node scripts/backup.mjs [--from dossier-données] --to dossier-privé');
      options[args[index]] = args[index + 1];
    }
    const result = await createBackup({ source: options['--from'], targetRoot: options['--to'] });
    process.stdout.write(`Sauvegarde vérifiée : ${result.directory} (${result.fileCount} fichiers)\n`);
  } catch (error) { process.stderr.write(`Sauvegarde interrompue : ${error.message}\n`); process.exitCode = 1; }
}
