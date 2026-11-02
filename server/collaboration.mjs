import { Router } from 'express';
import { isIP } from 'node:net';
import { getDb, newId, now, transaction } from './db.mjs';
import { ensureFileProjectAccess, fileDto } from './files.mjs';

function requireSignedIn(req, res, next) {
  return req.user?.id ? next() : res.status(401).json({ error: 'Connectez-vous pour retrouver votre projet.' });
}
function badRequest(res, error) { return res.status(400).json({ error }); }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function text(value, maximum) { return typeof value === 'string' && value.trim().length <= maximum ? value.trim() : null; }
function activeFile(db, id, projectId) {
  return typeof id === 'string' ? db.prepare('SELECT * FROM files WHERE id = ? AND project_id = ? AND deleted_at IS NULL').get(id, projectId) : undefined;
}
function author(row) { return { id: row.author_id, name: row.author_name, role: row.author_role }; }
function messageDto(row, db = getDb()) {
  const attachments = db.prepare('SELECT f.* FROM message_attachments ma JOIN files f ON f.id = ma.file_id WHERE ma.message_id = ? AND f.project_id = ? AND f.deleted_at IS NULL ORDER BY f.created_at, f.id').all(row.id, row.project_id);
  const total = db.prepare('SELECT COUNT(*) AS count FROM message_attachments WHERE message_id = ?').get(row.id).count;
  return { id: row.id, body: row.body, author: author(row), createdAt: row.created_at, attachments: attachments.map(fileDto), unavailableAttachments: total - attachments.length };
}
function messageRow(db, id) {
  return db.prepare('SELECT m.*, u.name AS author_name, u.role AS author_role FROM messages m JOIN users u ON u.id = m.author_id WHERE m.id = ?').get(id);
}
function previewDto(row, latestVersion, db = getDb()) {
  const file = row.file_id ? activeFile(db, row.file_id, row.project_id) : null;
  const feedback = db.prepare('SELECT f.*, u.name AS author_name, u.role AS author_role FROM feedback f JOIN users u ON u.id = f.user_id WHERE f.preview_id = ? ORDER BY f.created_at, f.rowid').all(row.id)
    .map(item => ({ id: item.id, body: item.body, author: { id: item.user_id, name: item.author_name, role: item.author_role }, createdAt: item.created_at }));
  const approvals = db.prepare('SELECT a.*, u.name AS author_name FROM approvals a JOIN users u ON u.id = a.user_id WHERE a.preview_id = ? ORDER BY a.created_at').all(row.id)
    .map(item => ({ id: item.id, userId: item.user_id, name: item.author_name, createdAt: item.created_at }));
  return { id: row.id, title: row.title, version: row.version, url: row.url, file: file ? fileDto(file) : null, sourceUnavailable: Boolean(row.file_id && !file), status: row.status, isLatest: row.version === latestVersion, feedback, approvals, createdAt: row.created_at, updatedAt: row.updated_at };
}

/** No network requests: validation applies to a browser link, never to a server fetch. */
export function safePreviewUrl(value) {
  if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
    if (!host || host === 'localhost' || /\.(localhost|local|internal|test|invalid)$/.test(host)) return null;
    const ip = isIP(host);
    if (ip === 4) {
      const [a, b] = host.split('.').map(Number);
      if (a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19))) return null;
    } else if (ip === 6) {
      if (host === '::' || host === '::1' || host.startsWith('::ffff:') || /^(fc|fd|fe[89ab])/i.test(host)) return null;
    } else if (!host.includes('.')) return null;
    return url.href;
  } catch { return null; }
}

/** Mount at /api/projects, after authenticated sessions and CSRF protection. */
export function createCollaborationRouter({ requireAuth = requireSignedIn } = {}) {
  const router = Router();
  const access = [requireAuth, ensureFileProjectAccess];
  const latest = (db, projectId) => db.prepare('SELECT COALESCE(MAX(version), 0) AS version FROM previews WHERE project_id = ?').get(projectId).version;

  router.get('/:projectId/messages', ...access, (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    const db = getDb();
    const rows = db.prepare('SELECT m.*, u.name AS author_name, u.role AS author_role FROM messages m JOIN users u ON u.id = m.author_id WHERE m.project_id = ? ORDER BY m.created_at, m.rowid').all(req.project.id);
    res.json({ messages: rows.map(row => messageDto(row, db)) });
  });
  router.post('/:projectId/messages', ...access, (req, res) => {
    if (!object(req.body)) return badRequest(res, 'Écrivez un message ou choisissez un fichier.');
    const body = req.body.body === undefined ? '' : text(req.body.body, 10_000);
    const ids = req.body.attachmentIds ?? [];
    if (body === null || !Array.isArray(ids) || ids.length > 10 || ids.some(id => typeof id !== 'string' || id.length > 100) || new Set(ids).size !== ids.length || (!body && !ids.length)) return badRequest(res, 'Écrivez un message de 10 000 caractères maximum et joignez jusqu’à 10 fichiers.');
    const db = getDb();
    const result = transaction(() => {
      if (ids.some(id => !activeFile(db, id, req.project.id))) return null;
      const id = newId(), timestamp = now();
      db.prepare('INSERT INTO messages(id,project_id,author_id,body,created_at) VALUES(?,?,?,?,?)').run(id, req.project.id, req.user.id, body, timestamp);
      for (const fileId of ids) db.prepare('INSERT INTO message_attachments(message_id,file_id) VALUES(?,?)').run(id, fileId);
      db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(timestamp, req.project.id);
      return messageDto(messageRow(db, id), db);
    }, db);
    if (!result) return badRequest(res, 'Un fichier sélectionné n’est plus disponible dans ce projet.');
    res.status(201).json({ message: result });
  });

  router.get('/:projectId/previews', ...access, (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    const db = getDb(), latestVersion = latest(db, req.project.id);
    const rows = db.prepare('SELECT * FROM previews WHERE project_id = ? ORDER BY version DESC, created_at DESC').all(req.project.id);
    res.json({ previews: rows.map(row => previewDto(row, latestVersion, db)) });
  });
  router.post('/:projectId/previews', ...access, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Seul le studio peut publier une version.' });
    if (!object(req.body) || Object.keys(req.body).some(key => !['title', 'url', 'fileId'].includes(key))) return badRequest(res, 'Renseignez un titre et un lien HTTPS ou un fichier du projet.');
    const title = text(req.body.title, 160);
    const hasUrl = req.body.url !== undefined && req.body.url !== null && req.body.url !== '';
    const hasFile = req.body.fileId !== undefined && req.body.fileId !== null && req.body.fileId !== '';
    if (!title || hasUrl === hasFile) return badRequest(res, 'Renseignez un titre et choisissez un seul lien ou fichier.');
    const url = hasUrl ? safePreviewUrl(req.body.url) : null;
    if (hasUrl && !url) return badRequest(res, 'Utilisez un lien HTTPS public, sans identifiants ni adresse locale.');
    const db = getDb();
    const result = transaction(() => {
      if (hasFile && !activeFile(db, req.body.fileId, req.project.id)) return null;
      const id = newId(), timestamp = now(), version = latest(db, req.project.id) + 1;
      db.prepare('INSERT INTO previews(id,project_id,title,version,url,file_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id, req.project.id, title, version, url, hasFile ? req.body.fileId : null, 'review', timestamp, timestamp);
      db.prepare("UPDATE projects SET status = 'review', updated_at = ? WHERE id = ?").run(timestamp, req.project.id);
      return previewDto(db.prepare('SELECT * FROM previews WHERE id = ?').get(id), version, db);
    }, db);
    if (!result) return badRequest(res, 'Choisissez un fichier disponible dans ce projet.');
    res.status(201).json({ preview: result });
  });

  function previewAccess(req, res, next) {
    const row = getDb().prepare('SELECT * FROM previews WHERE id = ? AND project_id = ?').get(req.params.previewId, req.project.id);
    if (!row) return res.status(404).json({ error: 'Cette version est introuvable.' });
    req.preview = row; next();
  }
  router.post('/:projectId/previews/:previewId/feedback', ...access, previewAccess, (req, res) => {
    const body = object(req.body) ? text(req.body.body, 10_000) : null;
    if (!body) return badRequest(res, 'Décrivez votre retour en 10 000 caractères maximum.');
    const db = getDb(), timestamp = now();
    transaction(() => {
      db.prepare('INSERT INTO feedback(id,preview_id,user_id,body,created_at) VALUES(?,?,?,?,?)').run(newId(), req.preview.id, req.user.id, body, timestamp);
      db.prepare('UPDATE previews SET updated_at = ? WHERE id = ?').run(timestamp, req.preview.id);
    }, db);
    res.status(201).json({ preview: previewDto(db.prepare('SELECT * FROM previews WHERE id = ?').get(req.preview.id), latest(db, req.project.id), db) });
  });
  router.post('/:projectId/previews/:previewId/approve', ...access, previewAccess, (req, res) => {
    if (req.user.id !== req.project.user_id) return res.status(403).json({ error: 'La validation appartient au propriétaire du projet.' });
    if (!object(req.body) || req.body.confirmed !== true) return badRequest(res, 'Confirmez votre accord pour valider cette version.');
    const db = getDb();
    const result = transaction(() => {
      const latestVersion = latest(db, req.project.id);
      if (req.preview.version !== latestVersion) return { stale: true };
      // A deleted source cannot be approved without the opportunity to inspect it.
      if (req.preview.file_id && !activeFile(db, req.preview.file_id, req.project.id)) return { unavailable: true };
      const existing = db.prepare('SELECT id FROM approvals WHERE preview_id = ? AND user_id = ?').get(req.preview.id, req.user.id);
      if (!existing) {
        const timestamp = now();
        db.prepare('INSERT INTO approvals(id,preview_id,user_id,created_at) VALUES(?,?,?,?)').run(newId(), req.preview.id, req.user.id, timestamp);
        db.prepare("UPDATE previews SET status = 'approved', updated_at = ? WHERE id = ?").run(timestamp, req.preview.id);
        db.prepare("UPDATE projects SET status = 'approved', updated_at = ? WHERE id = ?").run(timestamp, req.project.id);
      }
      return { preview: previewDto(db.prepare('SELECT * FROM previews WHERE id = ?').get(req.preview.id), latestVersion, db) };
    }, db);
    if (result.stale) return res.status(409).json({ error: 'Une version plus récente est disponible. Consultez-la avant de valider.', code: 'PREVIEW_SUPERSEDED' });
    if (result.unavailable) return res.status(409).json({ error: 'Cette maquette n’est plus disponible. Contactez le studio avant de la valider.', code: 'PREVIEW_UNAVAILABLE' });
    res.json(result);
  });
  return router;
}

export default createCollaborationRouter;
