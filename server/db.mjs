import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { chmodSync, mkdirSync, realpathSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
let connection;
let connectionPath;
let savepointCounter = 0;

export const newId = () => randomUUID();
export const now = () => new Date().toISOString();

export function dataDirectory() {
  const directory = path.resolve(process.env.DATA_DIR || path.join(projectDirectory, '.data'));
  const resolved = resolveExistingParents(directory);
  for (const publicRoot of [path.join(projectDirectory, 'public'), path.join(projectDirectory, 'dist', 'client')]) {
    const relative = path.relative(resolveExistingParents(publicRoot), resolved);
    if (relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
      throw new Error('DATA_DIR doit désigner un dossier privé, hors des fichiers publics du site.');
    }
  }
  return directory;
}

function resolveExistingParents(directory) {
  let parent = directory;
  const missing = [];
  while (!existsSync(parent)) {
    const next = path.dirname(parent);
    if (next === parent) return directory;
    missing.unshift(path.basename(parent));
    parent = next;
  }
  return path.resolve(realpathSync(parent), ...missing);
}

/** A single private, durable database per application process. */
export function getDb() {
  const directory = dataDirectory();
  const filename = path.join(directory, 'studio.sqlite');
  if (connection && connectionPath === filename) return connection;
  closeDb();
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  connection = new DatabaseSync(filename);
  connectionPath = filename;
  chmodSync(filename, 0o600);
  connection.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;');
  try {
    migrate(connection);
  } catch (error) {
    closeDb();
    throw error;
  }
  return connection;
}

export function closeDb() {
  if (connection) connection.close();
  connection = undefined;
  connectionPath = undefined;
}

/** Execute synchronous work atomically, including safe nested transactions. */
export function transaction(work, db = getDb()) {
  if (typeof work !== 'function' || work.constructor.name === 'AsyncFunction') {
    throw new TypeError('La transaction doit recevoir une fonction synchrone.');
  }
  const nested = db.isTransaction;
  const savepoint = `studio_${++savepointCounter}`;
  db.exec(nested ? `SAVEPOINT ${savepoint}` : 'BEGIN IMMEDIATE');
  try {
    const result = work(db);
    if (result && typeof result.then === 'function') {
      throw new TypeError('Les transactions asynchrones ne sont pas prises en charge.');
    }
    db.exec(nested ? `RELEASE SAVEPOINT ${savepoint}` : 'COMMIT');
    return result;
  } catch (error) {
    db.exec(nested ? `ROLLBACK TO SAVEPOINT ${savepoint}; RELEASE SAVEPOINT ${savepoint}` : 'ROLLBACK');
    throw error;
  }
}

function migrate(db) {
  transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_versions (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      ) STRICT;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS sessions (
        id_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
      CREATE TABLE IF NOT EXISTS password_resets (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      ) STRICT;

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        offer TEXT NOT NULL,
        configuration TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(configuration)),
        activity TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(activity)),
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS projects_owner_updated ON projects(user_id, updated_at DESC);

      CREATE TABLE IF NOT EXISTS contents (
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        page_key TEXT NOT NULL,
        title TEXT NOT NULL,
        data TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(data)),
        updated_at TEXT NOT NULL,
        PRIMARY KEY (project_id, page_key)
      ) STRICT;

      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id),
        storage_name TEXT NOT NULL UNIQUE,
        original_name TEXT NOT NULL,
        mime TEXT NOT NULL,
        size INTEGER NOT NULL CHECK(size >= 0),
        category TEXT NOT NULL DEFAULT 'photo',
        deleted_at TEXT,
        created_at TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS files_project ON files(project_id, deleted_at, created_at);

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        author_id TEXT NOT NULL REFERENCES users(id),
        body TEXT NOT NULL,
        created_at TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS messages_project ON messages(project_id, created_at);
      CREATE TABLE IF NOT EXISTS message_attachments (
        message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        file_id TEXT NOT NULL REFERENCES files(id),
        PRIMARY KEY (message_id, file_id)
      ) STRICT;

      CREATE TABLE IF NOT EXISTS previews (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        url TEXT,
        file_id TEXT REFERENCES files(id),
        status TEXT NOT NULL DEFAULT 'review',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS previews_project ON previews(project_id, created_at DESC);
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        preview_id TEXT NOT NULL REFERENCES previews(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id),
        body TEXT NOT NULL,
        created_at TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        preview_id TEXT NOT NULL REFERENCES previews(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TEXT NOT NULL,
        UNIQUE (preview_id, user_id)
      ) STRICT;

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'draft',
        configuration_snapshot TEXT NOT NULL CHECK(json_valid(configuration_snapshot)),
        billing TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(billing)),
        total_cents INTEGER CHECK(total_cents IS NULL OR total_cents >= 0),
        currency TEXT NOT NULL DEFAULT 'EUR',
        payment_reference TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS orders_project ON orders(project_id, created_at DESC);
    `);
    db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(1, now());
  }, db);
}

export function parseJson(value, fallback = {}) {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function projectDto(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    offerId: row.offer,
    configuration: parseJson(row.configuration),
    activity: parseJson(row.activity),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** An unauthorized project is deliberately indistinguishable from an absent one. */
export function getOwnedProject(projectId, userId, db = getDb()) {
  if (typeof projectId !== 'string' || typeof userId !== 'string') return undefined;
  return db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
}

export function ensureProjectOwner(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ error: 'Connectez-vous pour retrouver votre projet.' });
  const id = req.params.projectId ?? req.params.id;
  const project = getOwnedProject(id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Ce projet est introuvable.' });
  req.project = project;
  next();
}
