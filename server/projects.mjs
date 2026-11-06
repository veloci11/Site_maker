import { Router } from 'express';
import { OFFER_IDS, normalizeConfiguration } from '../shared/catalog.ts';
import { ensureProjectOwner, getDb, getOwnedProject, newId, now, parseJson, projectDto, transaction } from './db.mjs';

const pageTitles = { accueil: 'Accueil', 'a-propos': 'À propos', contact: 'Contact' };
const reservedKeys = new Set(['__proto__', 'prototype', 'constructor']);

class ValidationError extends Error {}

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function onlyKeys(value, allowed) {
  if (!object(value) || Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new ValidationError('Les informations envoyées ne sont pas valides.');
  }
}

function shortText(value, label, maximum = 120) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new ValidationError(`${label} doit contenir entre 1 et ${maximum} caractères.`);
  }
  return value.trim();
}

function stringRecord(value) {
  if (!object(value) || Object.keys(value).length > 30) {
    throw new ValidationError('Le contenu envoyé ne peut pas être enregistré.');
  }
  for (const [key, field] of Object.entries(value)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(key) || reservedKeys.has(key)
      || typeof field !== 'string' || field.length > 10_000 || field.includes('\u0000')) {
      throw new ValidationError('Chaque champ doit contenir du texte de 10 000 caractères maximum.');
    }
  }
  return Object.fromEntries(Object.entries(value));
}

function configuration(input, existing) {
  onlyKeys(input, ['offerId', 'language', 'mobile', 'managedContent', 'scene3d', 'deployment', 'maintenance', 'extras', 'extraPageCount']);
  const candidate = { ...existing, ...input };
  // An explicit option list without a count uses the historical/default one
  // page. A partial patch of unrelated fields retains the existing quantity.
  if (Object.hasOwn(input, 'extras') && !Object.hasOwn(input, 'extraPageCount')) delete candidate.extraPageCount;
  if (!OFFER_IDS.includes(candidate.offerId)
    || (candidate.language !== undefined && !['fr', 'fr-en'].includes(candidate.language))
    || (candidate.managedContent !== undefined && typeof candidate.managedContent !== 'boolean')
    || (candidate.scene3d !== undefined && typeof candidate.scene3d !== 'boolean')
    || (candidate.deployment !== undefined && typeof candidate.deployment !== 'boolean')
    || (candidate.maintenance !== undefined && typeof candidate.maintenance !== 'boolean')) {
    throw new ValidationError('Choisissez une forfait et des options valides.');
  }
  try { return normalizeConfiguration(candidate); }
  catch { throw new ValidationError('Choisissez un forfait et des options valides.'); }
}

function pageKey(req, res, next) {
  const value = req.params.pageKey;
  if (typeof value !== 'string' || value.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || reservedKeys.has(value)) {
    return res.status(400).json({ error: 'Le nom de cette page n’est pas valide.' });
  }
  next();
}

function contentDto(row) {
  return { pageKey: row.page_key, title: row.title, data: parseJson(row.data), updatedAt: row.updated_at };
}

function emptyContent(key) {
  return { pageKey: key, title: pageTitles[key] || key, data: {}, updatedAt: null };
}

function validContentVersion(value) {
  if (value === null) return true;
  if (typeof value !== 'string') return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

// The update timestamp is also the concurrency token. Two saves in the same
// millisecond must never leave the previous token valid.
function nextContentVersion(previous) {
  const previousTime = Date.parse(previous);
  return new Date(Math.max(Date.now(), Number.isFinite(previousTime) ? previousTime + 1 : 0)).toISOString();
}

function guard(handler) {
  return (req, res, next) => {
    try {
      handler(req, res, next);
    } catch (error) {
      if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
      next(error);
    }
  };
}

function defaultRequireAuth(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ error: 'Connectez-vous pour retrouver vos projets.' });
  next();
}

/** Mount at /api/projects after optionalAuth and the app's CSRF middleware. */
export function createProjectsRouter({ requireAuth = defaultRequireAuth } = {}) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', guard((req, res) => {
    const projects = getDb().prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
      .all(req.user.id).map(projectDto);
    res.json({ projects });
  }));

  router.post('/', guard((req, res) => {
    onlyKeys(req.body, ['name', 'configuration']);
    const selected = configuration(req.body.configuration);
    const name = req.body.name === undefined ? 'Mon site' : shortText(req.body.name, 'Le nom du projet');
    const id = newId();
    const timestamp = now();
    transaction((db) => {
      db.prepare(`INSERT INTO projects (id,user_id,name,offer,configuration,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?)`).run(id, req.user.id, name, selected.offerId, JSON.stringify(selected), timestamp, timestamp);
      for (const [key, title] of Object.entries(pageTitles)) {
        db.prepare('INSERT INTO contents (project_id,page_key,title,data,updated_at) VALUES (?,?,?,?,?)')
          .run(id, key, title, '{}', timestamp);
      }
    });
    res.status(201).json({ project: projectDto(getOwnedProject(id, req.user.id)) });
  }));

  router.get('/:projectId', ensureProjectOwner, (req, res) => {
    res.json({ project: projectDto(req.project) });
  });

  router.patch('/:projectId', ensureProjectOwner, guard((req, res) => {
    onlyKeys(req.body, ['name', 'configuration', 'activity']);
    if (Object.keys(req.body).length === 0) throw new ValidationError('Aucune modification à enregistrer.');
    const name = req.body.name === undefined ? req.project.name : shortText(req.body.name, 'Le nom du projet');
    const selected = req.body.configuration === undefined
      ? parseJson(req.project.configuration)
      : configuration(req.body.configuration, parseJson(req.project.configuration));
    const activity = req.body.activity === undefined
      ? parseJson(req.project.activity)
      : { ...parseJson(req.project.activity), ...stringRecord(req.body.activity) };
    getDb().prepare(`UPDATE projects SET name = ?, offer = ?, configuration = ?, activity = ?, updated_at = ?
      WHERE id = ? AND user_id = ?`).run(name, selected.offerId, JSON.stringify(selected), JSON.stringify(activity), now(), req.project.id, req.user.id);
    res.json({ project: projectDto(getOwnedProject(req.project.id, req.user.id)) });
  }));

  router.get('/:projectId/contents', ensureProjectOwner, (req, res) => {
    const contents = getDb().prepare('SELECT * FROM contents WHERE project_id = ? ORDER BY page_key').all(req.project.id).map(contentDto);
    res.json({ contents });
  });

  router.get('/:projectId/contents/:pageKey', ensureProjectOwner, pageKey, (req, res) => {
    const row = getDb().prepare('SELECT * FROM contents WHERE project_id = ? AND page_key = ?').get(req.project.id, req.params.pageKey);
    res.json({ content: row ? contentDto(row) : emptyContent(req.params.pageKey) });
  });

  router.put('/:projectId/contents/:pageKey', ensureProjectOwner, pageKey, guard((req, res) => {
    onlyKeys(req.body, ['title', 'data', 'expectedUpdatedAt']);
    const data = stringRecord(req.body.data);
    const checksVersion = Object.hasOwn(req.body, 'expectedUpdatedAt');
    if (checksVersion && !validContentVersion(req.body.expectedUpdatedAt)) {
      throw new ValidationError('Rechargez cette page avant de l’enregistrer.');
    }
    const requestedTitle = req.body.title === undefined ? undefined : shortText(req.body.title, 'Le titre de la page');
    const result = transaction((db) => {
      const existing = db.prepare('SELECT * FROM contents WHERE project_id = ? AND page_key = ?').get(req.project.id, req.params.pageKey);
      if (checksVersion && (existing?.updated_at ?? null) !== req.body.expectedUpdatedAt) {
        return { conflict: true, content: existing ? contentDto(existing) : emptyContent(req.params.pageKey) };
      }
      const title = requestedTitle ?? existing?.title ?? pageTitles[req.params.pageKey] ?? req.params.pageKey;
      const timestamp = nextContentVersion(existing?.updated_at);
      db.prepare(`INSERT INTO contents (project_id,page_key,title,data,updated_at) VALUES (?,?,?,?,?)
        ON CONFLICT(project_id,page_key) DO UPDATE SET title=excluded.title,data=excluded.data,updated_at=excluded.updated_at`)
        .run(req.project.id, req.params.pageKey, title, JSON.stringify(data), timestamp);
      db.prepare('UPDATE projects SET updated_at = ? WHERE id = ? AND user_id = ?').run(timestamp, req.project.id, req.user.id);
      return { content: contentDto(db.prepare('SELECT * FROM contents WHERE project_id = ? AND page_key = ?').get(req.project.id, req.params.pageKey)) };
    });
    if (result.conflict) return res.status(409).json({ error: 'Cette page a été modifiée depuis son ouverture. Vos textes ne sont pas remplacés. Comparez avec la version enregistrée avant de continuer.', code: 'CONTENT_CONFLICT', content: result.content });
    res.json(result);
  }));

  return router;
}

export default createProjectsRouter;
