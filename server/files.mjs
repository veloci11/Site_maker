import { Router } from 'express';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, realpathSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dataDirectory, getDb, newId, now, transaction } from './db.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const maximumFileSize = 10 * 1024 * 1024;
const categories = new Set(['logo', 'photo', 'document']);
const previewMimes = new Set(['image/png', 'image/jpeg', 'image/webp']);

function inside(location, parent) { return location === parent || location.startsWith(parent + path.sep); }
function privateDirectories() {
  const directory = dataDirectory();
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const resolved = realpathSync(directory);
  for (const publicDirectory of [path.join(root, 'public'), path.join(root, 'dist/client')]) {
    const publicPath = existsSync(publicDirectory) ? realpathSync(publicDirectory) : publicDirectory;
    if (inside(resolved, publicPath)) throw new Error('DATA_DIR doit être placé hors des fichiers publics.');
  }
  const uploads = path.join(resolved, 'uploads');
  const temporary = path.join(resolved, 'upload-tmp');
  mkdirSync(uploads, { recursive: true, mode: 0o700 });
  mkdirSync(temporary, { recursive: true, mode: 0o700 });
  const privateUploads = realpathSync(uploads);
  const privateTemporary = realpathSync(temporary);
  if (!inside(privateUploads, resolved) || !inside(privateTemporary, resolved)) {
    throw new Error('Les dossiers de fichiers doivent rester dans DATA_DIR.');
  }
  for (const publicDirectory of [path.join(root, 'public'), path.join(root, 'dist/client')]) {
    const publicPath = existsSync(publicDirectory) ? realpathSync(publicDirectory) : publicDirectory;
    if (inside(privateUploads, publicPath) || inside(privateTemporary, publicPath)) {
      throw new Error('Les dossiers de fichiers doivent rester privés.');
    }
  }
  return { uploads: privateUploads, temporary: privateTemporary };
}

function removeFiles(paths) { for (const filename of paths) { try { unlinkSync(filename); } catch (error) { if (error.code !== 'ENOENT') console.error('[studio files]', error.code); } } }
function cleanName(value) {
  return path.posix.basename(String(value || '').replaceAll('\\', '/')).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 180).trim();
}
function fileType(file) {
  const bytes = readFileSync(file.path);
  const name = cleanName(file.originalname);
  const extension = path.extname(name).toLowerCase();
  let mime;
  if (extension === '.png' && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) mime = 'image/png';
  else if (['.jpg', '.jpeg'].includes(extension) && bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) mime = 'image/jpeg';
  else if (extension === '.webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') mime = 'image/webp';
  else if (extension === '.pdf' && bytes.toString('ascii', 0, 5) === '%PDF-') mime = 'application/pdf';
  else if (extension === '.docx' && bytes[0] === 80 && bytes[1] === 75 && bytes.includes(Buffer.from('[Content_Types].xml')) && bytes.includes(Buffer.from('word/'))) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  else if (extension === '.doc' && bytes.subarray(0, 8).equals(Buffer.from([208,207,17,224,161,177,26,225]))) mime = 'application/msword';
  else if (extension === '.txt' && !bytes.includes(0)) {
    try { new TextDecoder('utf-8', { fatal: true }).decode(bytes); mime = 'text/plain'; } catch { /* Not valid text. */ }
  } else if (extension === '.svg' && bytes.length < 2 * 1024 * 1024 && /<svg(?:\s|>)/i.test(bytes.toString('utf8'))) mime = 'image/svg+xml';
  const claimed = String(file.mimetype || '').toLowerCase();
  const generic = new Set(['application/octet-stream', 'binary/octet-stream', '']);
  const aliases = { 'image/jpeg': ['image/jpg', 'image/pjpeg'], 'image/svg+xml': ['text/xml', 'application/xml'], 'text/plain': ['text/plain; charset=utf-8'] };
  if (!mime || !name || (claimed !== mime && !generic.has(claimed) && !aliases[mime]?.includes(claimed))) {
    const error = new Error('Ce fichier n’est pas reconnu. Ajoutez une image PNG, JPEG, WebP, un logo SVG, un PDF, un document Word ou un texte.');
    error.status = 400; throw error;
  }
  return { name, mime };
}

export function fileDto(row) {
  const base = `/api/projects/${encodeURIComponent(row.project_id)}/files/${encodeURIComponent(row.id)}`;
  return { id: row.id, originalName: row.original_name, mime: row.mime, size: row.size, category: row.category, createdAt: row.created_at, deletedAt: row.deleted_at, previewUrl: !row.deleted_at && previewMimes.has(row.mime) ? `${base}/preview` : null, downloadUrl: `${base}/download` };
}

/** Deliberate operator access; a customer can only read their own project. */
export function ensureFileProjectAccess(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ error: 'Connectez-vous pour retrouver vos fichiers.' });
  const project = req.user.role === 'admin'
    ? getDb().prepare('SELECT * FROM projects WHERE id = ?').get(req.params.projectId)
    : getDb().prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.projectId, req.user.id);
  if (!project) return res.status(404).json({ error: 'Ce projet est introuvable.' });
  req.project = project; next();
}

function requireSignedIn(req, res, next) { return req.user?.id ? next() : res.status(401).json({ error: 'Connectez-vous pour retrouver vos fichiers.' }); }
function activeFile(req, res, next) {
  const row = getDb().prepare('SELECT * FROM files WHERE id = ? AND project_id = ? AND deleted_at IS NULL').get(req.params.fileId, req.project.id);
  if (!row) return res.status(404).json({ error: 'Ce fichier est introuvable.' });
  req.studioFile = row; next();
}
function attachmentHeaders(res) { res.set('Cache-Control', 'private, no-store'); res.set('X-Content-Type-Options', 'nosniff'); res.set('Content-Security-Policy', "sandbox; default-src 'none'"); }

/** Mount at /api/projects after optionalAuth + csrfProtection. */
export function createFilesRouter({ requireAuth = requireSignedIn } = {}) {
  const router = Router();
  const access = [requireAuth, ensureFileProjectAccess];
  const upload = multer({
    defParamCharset: 'utf8',
    storage: multer.diskStorage({
      destination(_req, _file, callback) { try { callback(null, privateDirectories().temporary); } catch (error) { callback(error); } },
      filename(_req, _file, callback) { callback(null, randomUUID()); },
    }),
    limits: { fileSize: maximumFileSize, files: 10, fields: 2, fieldSize: 128, parts: 14 },
  }).array('files', 10);
  const uploadLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, keyGenerator: req => req.user.id, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Vous avez ajouté plusieurs fichiers. Réessayez dans un instant.' } });

  router.get('/:projectId/files', ...access, (req, res) => {
    const includeDeleted = req.query.includeDeleted === '1';
    const rows = getDb().prepare(`SELECT * FROM files WHERE project_id = ? ${includeDeleted ? '' : 'AND deleted_at IS NULL'} ORDER BY created_at DESC, id DESC`).all(req.project.id);
    res.json({ files: rows.map(fileDto) });
  });

  router.post('/:projectId/files', ...access, uploadLimit, (req, res, next) => {
    upload(req, res, error => {
      const files = Array.isArray(req.files) ? req.files : [];
      const temporary = files.map(file => file.path);
      if (error) {
        removeFiles(temporary);
        if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Chaque fichier peut peser jusqu’à 10 Mo.' : 'Ajoutez jusqu’à 10 fichiers à la fois.' });
        return next(error);
      }
      const moved = [];
      try {
        if (!files.length) return res.status(400).json({ error: 'Choisissez au moins un fichier.' });
        if (req.body.category !== undefined && !categories.has(req.body.category)) { const invalid = new Error('Choisissez une catégorie de fichier valide.'); invalid.status = 400; throw invalid; }
        const checked = files.map(file => ({ file, ...fileType(file) }));
        const { uploads } = privateDirectories();
        const timestamp = now();
        const rows = transaction(db => {
          const added = [];
          for (const { file, name, mime } of checked) {
            const id = newId(), storageName = randomUUID();
            const target = path.join(uploads, storageName);
            renameSync(file.path, target); moved.push(target); chmodSync(target, 0o600);
            const category = req.body.category || (mime.startsWith('image/') ? (mime === 'image/svg+xml' ? 'logo' : 'photo') : 'document');
            db.prepare('INSERT INTO files (id,project_id,user_id,storage_name,original_name,mime,size,category,created_at) VALUES (?,?,?,?,?,?,?,?,?)').run(id, req.project.id, req.user.id, storageName, name, mime, file.size, category, timestamp);
            added.push(db.prepare('SELECT * FROM files WHERE id = ?').get(id));
          }
          db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(timestamp, req.project.id);
          return added;
        });
        res.status(201).json({ files: rows.map(fileDto) });
      } catch (failure) {
        removeFiles(moved);
        if (failure.status === 400) res.status(400).json({ error: failure.message });
        else next(failure);
      } finally { removeFiles(temporary); }
    });
  });

  router.get('/:projectId/files/:fileId/download', ...access, activeFile, (req, res, next) => {
    const file = req.studioFile;
    const target = path.join(privateDirectories().uploads, file.storage_name);
    if (!existsSync(target)) return res.status(404).json({ error: 'Ce fichier est introuvable.' });
    attachmentHeaders(res); res.type(file.mime);
    // DATA_DIR defaults to .data. Only this authenticated, database-selected file
    // may be served through a hidden ancestor; no directory is exposed statically.
    res.download(target, file.original_name, { dotfiles: 'allow' }, error => { if (error && !res.headersSent) next(error); });
  });
  router.get('/:projectId/files/:fileId/preview', ...access, activeFile, (req, res, next) => {
    const file = req.studioFile;
    if (!previewMimes.has(file.mime)) return res.status(415).json({ error: 'Ce document se consulte en le téléchargeant.' });
    const target = path.join(privateDirectories().uploads, file.storage_name);
    if (!existsSync(target)) return res.status(404).json({ error: 'Ce fichier est introuvable.' });
    attachmentHeaders(res); res.type(file.mime); res.set('Content-Disposition', 'inline');
    res.sendFile(target, { dotfiles: 'allow' }, error => { if (error && !res.headersSent) next(error); });
  });
  router.delete('/:projectId/files/:fileId', ...access, activeFile, (req, res) => {
    const timestamp = now();
    getDb().prepare('UPDATE files SET deleted_at = ? WHERE id = ? AND project_id = ?').run(timestamp, req.studioFile.id, req.project.id);
    res.json({ file: fileDto({ ...req.studioFile, deleted_at: timestamp }) });
  });
  router.post('/:projectId/files/:fileId/restore', ...access, (req, res) => {
    const file = getDb().prepare('SELECT * FROM files WHERE id = ? AND project_id = ?').get(req.params.fileId, req.project.id);
    if (!file) return res.status(404).json({ error: 'Ce fichier est introuvable.' });
    getDb().prepare('UPDATE files SET deleted_at = NULL WHERE id = ? AND project_id = ?').run(file.id, req.project.id);
    res.json({ file: fileDto({ ...file, deleted_at: null }) });
  });
  return router;
}

export default createFilesRouter;
