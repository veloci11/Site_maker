import { Router } from 'express';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { appendFile, chmod, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { getDb, newId, now, dataDirectory, transaction } from './db.mjs';

const scryptAsync = promisify(scrypt);
const PASSWORD_OPTIONS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_MS = 30 * 60 * 1000;
const COOKIE = 'studio_session';
const GENERIC_LOGIN_ERROR = 'E-mail ou mot de passe incorrect.';
let dummyPasswordHash;
let runningHashes = 0;
const hashQueue = [];

function apiError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function emailValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function validEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPassword(value) {
  return typeof value === 'string' && value.length >= 12 && value.length <= 128 && Buffer.byteLength(value) <= 512;
}

async function boundedScrypt(password, salt) {
  if (runningHashes >= 2) {
    if (hashQueue.length >= 12) {
      const error = new Error('Veuillez patienter avant de réessayer.');
      error.status = 429;
      error.code = 'AUTH_BUSY';
      throw error;
    }
    await new Promise((resolve) => hashQueue.push(resolve));
  } else {
    runningHashes += 1;
  }
  try {
    return await scryptAsync(password, salt, 64, PASSWORD_OPTIONS);
  } finally {
    const next = hashQueue.shift();
    if (next) next();
    else runningHashes -= 1;
  }
}

export async function hashPassword(password) {
  if (!validPassword(password)) throw new Error('Choisissez un mot de passe de 12 à 128 caractères.');
  const salt = randomBytes(16);
  const derived = await boundedScrypt(password, salt);
  return `scrypt$v1$32768$8$3$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 128 || Buffer.byteLength(password) > 512) return false;
  const parts = typeof encoded === 'string' ? encoded.split('$') : [];
  if (parts.length !== 7 || parts.slice(0, 5).join('$') !== 'scrypt$v1$32768$8$3') return false;
  const salt = Buffer.from(parts[5], 'base64');
  const expected = Buffer.from(parts[6], 'base64');
  if (salt.length !== 16 || expected.length !== 64) return false;
  const actual = await boundedScrypt(password, salt);
  return timingSafeEqual(actual, expected);
}

function cookies(req) {
  const values = Object.create(null);
  for (const item of (req.headers.cookie || '').split(';')) {
    const equals = item.indexOf('=');
    if (equals < 1) continue;
    const key = item.slice(0, equals).trim();
    try { values[key] = decodeURIComponent(item.slice(equals + 1).trim()); } catch { /* Ignore malformed cookie. */ }
  }
  return values;
}

function cookieOptions(req) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || req.secure === true,
    path: '/',
  };
}

function currentToken(req) {
  const token = cookies(req)[COOKIE];
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

function removeCurrentSession(req) {
  const token = currentToken(req);
  if (token) getDb().prepare('DELETE FROM sessions WHERE id_hash = ?').run(tokenHash(token));
}

function createSession(req, res, userId) {
  const db = getDb();
  removeCurrentSession(req);
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now());
  const token = randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (id_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .run(tokenHash(token), userId, new Date(Date.now() + SESSION_MS).toISOString(), now());
  res.cookie(COOKIE, token, { ...cookieOptions(req), maxAge: SESSION_MS });
}

// Password verification yields to the event loop. Recheck the verified identity
// under the write transaction before issuing a session or changing credentials.
function unchangedCredentials(db, verified) {
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(verified.id);
  return current && current.password_hash === verified.password_hash && current.email === verified.email ? current : null;
}

function activeSession(req, db, userId) {
  return req.sessionHash && db.prepare('SELECT user_id FROM sessions WHERE id_hash = ? AND user_id = ? AND expires_at > ?')
    .get(req.sessionHash, userId, now());
}

export function optionalAuth(req, res, next) {
  try {
    req.user = null;
    req.sessionHash = null;
    const token = currentToken(req);
    if (!token) return next();
    const hash = tokenHash(token);
    const user = getDb().prepare(`SELECT users.id, users.name, users.email, users.role
      FROM sessions JOIN users ON users.id = sessions.user_id
      WHERE sessions.id_hash = ? AND sessions.expires_at > ?`).get(hash, now());
    if (user) {
      req.user = publicUser(user);
      req.sessionHash = hash;
    } else {
      getDb().prepare('DELETE FROM sessions WHERE id_hash = ?').run(hash);
      res.clearCookie(COOKIE, cookieOptions(req));
    }
    return next();
  } catch (error) { return next(error); }
}

export function requireAuth(req, res, next) {
  if (!req.user) return apiError(res, 401, 'Connectez-vous pour accéder à votre projet.', 'AUTH_REQUIRED');
  return next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return apiError(res, 401, 'Connectez-vous pour continuer.', 'AUTH_REQUIRED');
  if (req.user.role !== 'admin') return apiError(res, 403, 'Cet accès est réservé au studio.', 'FORBIDDEN');
  return next();
}

/** SameSite is complemented by explicit origin validation on all state-changing requests. */
export function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (!origin) {
    if (req.headers['sec-fetch-site'] === 'cross-site') return apiError(res, 403, 'Cette requête ne peut pas être acceptée.', 'INVALID_ORIGIN');
    return next();
  }
  const allowed = new Set();
  for (const configured of [process.env.APP_ORIGIN, process.env.PUBLIC_APP_URL]) {
    if (!configured) continue;
    try { allowed.add(new URL(configured).origin); } catch { /* Invalid configured URL is not trusted. */ }
  }
  if (req.headers.host) allowed.add(`${req.protocol || 'http'}://${req.headers.host}`);
  if (origin === 'null' || !allowed.has(origin)) return apiError(res, 403, 'Cette requête ne peut pas être acceptée.', 'INVALID_ORIGIN');
  return next();
}

function makeLimiter(maximum, windowMs) {
  const buckets = new Map();
  let sweeps = 0;
  return (req, res, next) => {
    const timestamp = Date.now();
    if (++sweeps % 64 === 0 || buckets.size > 10000) {
      for (const [key, value] of buckets) if (value.until <= timestamp) buckets.delete(key);
    }
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    let bucket = buckets.get(key);
    if (!bucket || bucket.until <= timestamp) {
      if (!bucket && buckets.size >= 10000) {
        res.set('Retry-After', '60');
        return apiError(res, 429, 'Veuillez patienter avant de réessayer.', 'RATE_LIMITED');
      }
      bucket = { count: 0, until: timestamp + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > maximum) {
      res.set('Retry-After', String(Math.ceil((bucket.until - timestamp) / 1000)));
      return apiError(res, 429, 'Trop de tentatives. Patientez quelques minutes avant de réessayer.', 'RATE_LIMITED');
    }
    return next();
  };
}

function wrap(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch((error) => {
    if (error.status && error.status < 500) return apiError(res, error.status, error.message, error.code || 'INVALID_REQUEST');
    return next(error);
  });
}

async function privateResetOutbox(message) {
  const directory = dataDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, 'mail-outbox.ndjson');
  await appendFile(file, JSON.stringify(message) + '\n', { encoding: 'utf8', mode: 0o600 });
  await chmod(file, 0o600);
}

function resetBaseUrl(req) {
  const configured = process.env.PUBLIC_APP_URL || process.env.APP_ORIGIN;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && url.protocol === 'http:')) return url.origin;
    } catch { /* Fall back to local development URL below. */ }
  }
  // Never construct a secret-bearing mail link from an untrusted Host header.
  return process.env.NODE_ENV === 'production' ? null : 'http://localhost:4173';
}

/** A transport can be supplied by the application once its transactional-mail provider is configured. */
export function createAuthRouter({ resetTransport, limits = {} } = {}) {
  const router = Router();
  const loginLimit = makeLimiter(limits.login ?? 30, 15 * 60 * 1000);
  const registerLimit = makeLimiter(limits.register ?? 10, 60 * 60 * 1000);
  const resetLimit = makeLimiter(limits.reset ?? 8, 30 * 60 * 1000);
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.use(csrfProtection, optionalAuth);

  router.get('/me', (req, res) => res.json({ user: req.user }));

  router.post('/register', registerLimit, wrap(async (req, res) => {
    if (process.env.NODE_ENV === 'production') return apiError(res, 403, 'La demande de site se fait sans compte depuis le configurateur.', 'REGISTRATION_CLOSED');
    const email = emailValue(req.body?.email);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : '';
    const password = req.body?.password;
    if (name.length < 2 || name.length > 100 || /[\x00-\x1f\x7f]/.test(name)) return apiError(res, 400, 'Indiquez votre nom (2 à 100 caractères).', 'INVALID_NAME');
    if (!validEmail(email)) return apiError(res, 400, 'Indiquez une adresse e-mail valide.', 'INVALID_EMAIL');
    if (!validPassword(password)) return apiError(res, 400, 'Choisissez un mot de passe de 12 à 128 caractères.', 'INVALID_PASSWORD');
    const db = getDb();
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return apiError(res, 409, 'Impossible de créer ce compte. Essayez de vous connecter.', 'ACCOUNT_EXISTS');
    const passwordHash = await hashPassword(password);
    const id = newId();
    try {
      db.prepare("INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'customer', ?)")
        .run(id, name, email, passwordHash, now());
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) return apiError(res, 409, 'Impossible de créer ce compte. Essayez de vous connecter.', 'ACCOUNT_EXISTS');
      throw error;
    }
    createSession(req, res, id);
    return res.status(201).json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id)) });
  }));

  router.post('/login', loginLimit, wrap(async (req, res) => {
    const email = emailValue(req.body?.email);
    const password = req.body?.password;
    if (!validEmail(email) || typeof password !== 'string' || password.length > 128 || Buffer.byteLength(password) > 512) return apiError(res, 401, GENERIC_LOGIN_ERROR, 'INVALID_CREDENTIALS');
    const user = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user && !dummyPasswordHash) dummyPasswordHash = hashPassword(randomBytes(24).toString('base64url')).catch((error) => { dummyPasswordHash = undefined; throw error; });
    const encoded = user?.password_hash || await dummyPasswordHash;
    const valid = await verifyPassword(password, encoded);
    if (!user || !valid) return apiError(res, 401, GENERIC_LOGIN_ERROR, 'INVALID_CREDENTIALS');
    const current = transaction((db) => {
      const fresh = unchangedCredentials(db, user);
      if (!fresh) return null;
      createSession(req, res, fresh.id);
      return fresh;
    });
    if (!current) return apiError(res, 401, GENERIC_LOGIN_ERROR, 'INVALID_CREDENTIALS');
    return res.json({ user: publicUser(current) });
  }));

  router.post('/logout', (req, res) => {
    removeCurrentSession(req);
    res.clearCookie(COOKIE, cookieOptions(req));
    return res.json({ ok: true });
  });

  router.patch('/me', requireAuth, wrap(async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : req.user.name;
    const email = req.body?.email === undefined ? req.user.email : emailValue(req.body.email);
    if (name.length < 2 || name.length > 100 || /[\x00-\x1f\x7f]/.test(name)) return apiError(res, 400, 'Indiquez votre nom (2 à 100 caractères).', 'INVALID_NAME');
    if (!validEmail(email)) return apiError(res, 400, 'Indiquez une adresse e-mail valide.', 'INVALID_EMAIL');
    // Identity changes require the existing password, not possession of an unattended session alone.
    const stored = getDb().prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!stored) return apiError(res, 401, 'Connectez-vous pour continuer.', 'AUTH_REQUIRED');
    if (email !== stored.email && !await verifyPassword(req.body?.currentPassword, stored.password_hash)) return apiError(res, 403, 'Saisissez votre mot de passe actuel pour modifier votre e-mail.', 'PASSWORD_REQUIRED');
    let current;
    try {
      current = transaction((db) => {
        const fresh = unchangedCredentials(db, stored);
        if (!fresh || !activeSession(req, db, fresh.id)) return null;
        db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(req.body?.name === undefined ? fresh.name : name, req.body?.email === undefined ? fresh.email : email, fresh.id);
        return db.prepare('SELECT * FROM users WHERE id = ?').get(fresh.id);
      });
    }
    catch (error) {
      if (String(error.message).includes('UNIQUE')) return apiError(res, 409, 'Cette adresse ne peut pas être utilisée.', 'ACCOUNT_EXISTS');
      throw error;
    }
    if (!current) return apiError(res, 401, 'Connectez-vous pour continuer.', 'AUTH_REQUIRED');
    return res.json({ user: publicUser(current) });
  }));

  router.post('/change-password', requireAuth, wrap(async (req, res) => {
    if (!validPassword(req.body?.newPassword)) return apiError(res, 400, 'Choisissez un mot de passe de 12 à 128 caractères.', 'INVALID_PASSWORD');
    const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return apiError(res, 401, 'Connectez-vous pour continuer.', 'AUTH_REQUIRED');
    if (!await verifyPassword(req.body?.currentPassword, user.password_hash)) return apiError(res, 403, 'Le mot de passe actuel est incorrect.', 'INVALID_CREDENTIALS');
    const passwordHash = await hashPassword(req.body.newPassword);
    const current = transaction((db) => {
      const fresh = unchangedCredentials(db, user);
      if (!fresh || !activeSession(req, db, fresh.id)) return null;
      const updated = db.prepare('UPDATE users SET password_hash = ? WHERE id = ? AND password_hash = ?').run(passwordHash, fresh.id, user.password_hash);
      if (Number(updated.changes) !== 1) return null;
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(fresh.id);
      db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(fresh.id);
      createSession(req, res, fresh.id);
      return fresh;
    });
    if (!current) return apiError(res, 401, 'Connectez-vous pour continuer.', 'AUTH_REQUIRED');
    return res.json({ user: publicUser(current), message: 'Votre mot de passe a été modifié.' });
  }));

  router.post('/forgot-password', resetLimit, wrap(async (req, res) => {
    const email = emailValue(req.body?.email);
    if (!validEmail(email)) return apiError(res, 400, 'Indiquez une adresse e-mail valide.', 'INVALID_EMAIL');
    const user = getDb().prepare('SELECT id, email FROM users WHERE email = ?').get(email);
    const base = resetBaseUrl(req);
    const canSend = typeof resetTransport === 'function' && base !== null;
    const local = process.env.NODE_ENV !== 'production' && !canSend;
    if (user && (canSend || local)) {
      const token = randomBytes(32).toString('base64url');
      const db = getDb();
      db.prepare('DELETE FROM password_resets WHERE user_id = ? OR expires_at <= ?').run(user.id, now());
      db.prepare('INSERT INTO password_resets (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
        .run(tokenHash(token), user.id, new Date(Date.now() + RESET_MS).toISOString(), now());
      const message = { to: user.email, subject: 'Retrouvez votre espace studio', resetUrl: `${base}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`, createdAt: now() };
      if (canSend) await resetTransport(message);
      else await privateResetOutbox(message);
    }
    // Response does not disclose account existence or return a reset token to the requesting client.
    return res.status(202).json({
      message: canSend ? 'Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation.' : 'L’envoi d’e-mails n’est pas encore activé. Contactez le studio pour retrouver votre accès.',
      delivery: canSend ? 'configured' : local ? 'local-outbox' : 'not-configured',
    });
  }));

  router.post('/reset-password', resetLimit, wrap(async (req, res) => {
    const token = req.body?.token;
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return apiError(res, 400, 'Ce lien est invalide ou a expiré.', 'INVALID_RESET');
    if (!validPassword(req.body?.password)) return apiError(res, 400, 'Choisissez un mot de passe de 12 à 128 caractères.', 'INVALID_PASSWORD');
    const db = getDb();
    const hash = tokenHash(token);
    const reset = db.prepare('SELECT user_id FROM password_resets WHERE token_hash = ? AND expires_at > ?').get(hash, now());
    if (!reset) return apiError(res, 400, 'Ce lien est invalide ou a expiré.', 'INVALID_RESET');
    const passwordHash = await hashPassword(req.body.password);
    db.exec('BEGIN IMMEDIATE');
    try {
      const consumed = db.prepare('DELETE FROM password_resets WHERE token_hash = ? AND expires_at > ?').run(hash, now());
      if (Number(consumed.changes) !== 1) {
        db.exec('ROLLBACK');
        return apiError(res, 400, 'Ce lien est invalide ou a expiré.', 'INVALID_RESET');
      }
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, reset.user_id);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(reset.user_id);
      db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(reset.user_id);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    res.clearCookie(COOKIE, cookieOptions(req));
    return res.json({ user: null, message: 'Votre mot de passe est modifié. Vous pouvez vous connecter.' });
  }));

  return router;
}

export const authRouter = createAuthRouter();

/** Operator-only bootstrap, to call from a local CLI. Never mount this helper on a public route. */
export async function createAdminUser({ name, email, password }) {
  const normalizedEmail = emailValue(email);
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  if (!validEmail(normalizedEmail) || normalizedName.length < 2 || normalizedName.length > 100) throw new Error('Nom ou e-mail administrateur invalide.');
  if (getDb().prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail)) throw new Error('Ce compte existe déjà ; aucune modification automatique n’a été effectuée.');
  const passwordHash = await hashPassword(password);
  const id = newId();
  getDb().prepare("INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)")
    .run(id, normalizedName, normalizedEmail, passwordHash, now());
  return publicUser(getDb().prepare('SELECT * FROM users WHERE id = ?').get(id));
}
