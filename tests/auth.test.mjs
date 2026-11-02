import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { createHash } from 'node:crypto';
import { createAuthRouter, optionalAuth, requireAuth, requireAdmin, createAdminUser, hashPassword } from '../server/auth.mjs';
import { closeDb, getDb, transaction } from '../server/db.mjs';

let directory;
let server;
let base;
const password = 'Test-uniquement-42!';
let sequence = 0;
const previousEnvironment = { DATA_DIR: process.env.DATA_DIR, NODE_ENV: process.env.NODE_ENV, APP_ORIGIN: process.env.APP_ORIGIN, PUBLIC_APP_URL: process.env.PUBLIC_APP_URL };

before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'studio-auth-'));
  process.env.DATA_DIR = directory;
  process.env.NODE_ENV = 'test';
  process.env.APP_ORIGIN = 'http://localhost:4173';
  delete process.env.PUBLIC_APP_URL;
  const app = express();
  app.use(express.json({ limit: '16kb' }));
  app.use('/api/auth', createAuthRouter({ limits: { login: 1000, register: 1000, reset: 1000 } }));
  app.get('/private', optionalAuth, requireAuth, (req, res) => res.json({ id: req.user.id }));
  app.get('/admin', optionalAuth, requireAdmin, (req, res) => res.json({ allowed: true }));
  app.use('/limited', createAuthRouter({ limits: { login: 1 } }));
  app.use((error, _req, res, _next) => res.status(error.status || 500).json({ error: 'Erreur de test.' }));
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  closeDb();
  if (directory) await rm(directory, { recursive: true, force: true });
  for (const [key, value] of Object.entries(previousEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

async function call(route, { method = 'GET', body, cookie, origin = 'http://localhost:4173' } = {}) {
  const headers = { Origin: origin };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(base + route, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return { response, status: response.status, body: await response.json(), setCookie: response.headers.get('set-cookie') };
}

async function register(extra = {}) {
  const email = `client-${++sequence}@example.test`;
  const result = await call('/api/auth/register', { method: 'POST', body: { name: 'Client test', email, password, ...extra } });
  assert.equal(result.status, 201);
  return { ...result, email, cookie: result.setCookie.split(';', 1)[0] };
}

test('inscription : rôle client imposé, hash de mot de passe et session opaque, cookie protégé', async () => {
  const account = await register({ role: 'admin' });
  assert.equal(account.body.user.role, 'customer');
  assert.deepEqual(Object.keys(account.body.user).sort(), ['email', 'id', 'name', 'role']);
  const stored = getDb().prepare('SELECT password_hash FROM users WHERE id = ?').get(account.body.user.id);
  assert.ok(stored.password_hash.startsWith('scrypt$v1$'));
  assert.ok(stored.password_hash !== password);
  assert.ok(/HttpOnly/i.test(account.setCookie));
  assert.ok(/SameSite=Lax/i.test(account.setCookie));
  const rawToken = account.cookie.split('=')[1];
  const row = getDb().prepare('SELECT id_hash FROM sessions WHERE user_id = ?').get(account.body.user.id);
  assert.ok(row.id_hash !== rawToken);
  assert.equal(row.id_hash, createHash('sha256').update(rawToken).digest('hex'));
  assert.equal((await call('/private', { cookie: account.cookie })).body.id, account.body.user.id);
  assert.equal((await call('/admin', { cookie: account.cookie })).status, 403);
});

test('validation des données et absence de création de session sur mot de passe faible', async () => {
  const invalid = await call('/api/auth/register', { method: 'POST', body: { name: 'Test', email: 'test@example.test', password: 'court' } });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.code, 'INVALID_PASSWORD');
  assert.equal(invalid.setCookie, null);
  assert.equal((await call('/private')).status, 401);
});

test('connexion : erreurs génériques et rotation du jeton courant', async () => {
  const account = await register();
  const unknown = await call('/api/auth/login', { method: 'POST', body: { email: 'absent@example.test', password } });
  const wrong = await call('/api/auth/login', { method: 'POST', body: { email: account.email, password: 'Mauvais-password-42!' } });
  assert.equal(unknown.status, 401);
  assert.deepEqual(unknown.body, wrong.body);
  const login = await call('/api/auth/login', { method: 'POST', cookie: account.cookie, body: { email: account.email.toUpperCase(), password } });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.id, account.body.user.id);
  const newCookie = login.setCookie.split(';', 1)[0];
  assert.ok(newCookie !== account.cookie);
  assert.equal((await call('/private', { cookie: account.cookie })).status, 401);
  assert.equal((await call('/private', { cookie: newCookie })).status, 200);
});

test('expiration côté serveur, déconnexion et cookie malformé', async () => {
  const account = await register();
  getDb().prepare('UPDATE sessions SET expires_at = ? WHERE user_id = ?').run(new Date(Date.now() - 1000).toISOString(), account.body.user.id);
  assert.equal((await call('/private', { cookie: account.cookie })).status, 401);
  const logged = await call('/api/auth/login', { method: 'POST', body: { email: account.email, password } });
  const cookie = logged.setCookie.split(';', 1)[0];
  const logout = await call('/api/auth/logout', { method: 'POST', cookie });
  assert.equal(logout.status, 200);
  assert.equal((await call('/api/auth/me', { cookie })).body.user, null);
  assert.equal((await call('/api/auth/me', { cookie: 'studio_session=%invalid' })).body.user, null);
});

test('les mutations provenant d’un autre site sont refusées', async () => {
  const account = await register();
  const result = await call('/api/auth/logout', { method: 'POST', cookie: account.cookie, origin: 'https://autre-site.example' });
  assert.equal(result.status, 403);
  assert.equal(result.body.code, 'INVALID_ORIGIN');
  assert.equal((await call('/private', { cookie: account.cookie })).status, 200);
});

test('récupération : réponse générique sans token, outbox privée, lien à usage unique et sessions révoquées', async () => {
  const account = await register();
  const requested = await call('/api/auth/forgot-password', { method: 'POST', body: { email: account.email } });
  const unknown = await call('/api/auth/forgot-password', { method: 'POST', body: { email: 'inconnu@example.test' } });
  assert.equal(requested.status, 202);
  assert.deepEqual(requested.body, unknown.body);
  assert.equal(requested.body.delivery, 'local-outbox');
  const outbox = path.join(directory, 'mail-outbox.ndjson');
  const message = JSON.parse((await readFile(outbox, 'utf8')).trim().split('\n').at(-1));
  const token = new URL(message.resetUrl).searchParams.get('token');
  assert.ok(token && !JSON.stringify(requested.body).includes(token));
  assert.equal((await stat(outbox)).mode & 0o777, 0o600);
  assert.equal(new URL(message.resetUrl).origin, 'http://localhost:4173');
  const reset = await call('/api/auth/reset-password', { method: 'POST', body: { token, password: 'Nouveau-test-password-42!' } });
  assert.equal(reset.status, 200);
  assert.equal((await call('/private', { cookie: account.cookie })).status, 401);
  assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token, password } })).status, 400);
  assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: account.email, password } })).status, 401);
  assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: account.email, password: 'Nouveau-test-password-42!' } })).status, 200);
});

test('un lien de récupération expiré est refusé', async () => {
  const account = await register();
  await call('/api/auth/forgot-password', { method: 'POST', body: { email: account.email } });
  const message = JSON.parse((await readFile(path.join(directory, 'mail-outbox.ndjson'), 'utf8')).trim().split('\n').at(-1));
  const token = new URL(message.resetUrl).searchParams.get('token');
  getDb().prepare('UPDATE password_resets SET expires_at = ? WHERE user_id = ?').run(new Date(Date.now() - 1000).toISOString(), account.body.user.id);
  assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token, password } })).body.code, 'INVALID_RESET');
});

test('le changement de mot de passe exige le mot de passe courant et révoque les autres sessions', async () => {
  const account = await register();
  const other = await call('/api/auth/login', { method: 'POST', body: { email: account.email, password } });
  const otherCookie = other.setCookie.split(';', 1)[0];
  assert.equal((await call('/api/auth/change-password', { method: 'POST', cookie: account.cookie, body: { currentPassword: 'incorrect', newPassword: 'Nouveau-test-password-42!' } })).status, 403);
  const changed = await call('/api/auth/change-password', { method: 'POST', cookie: account.cookie, body: { currentPassword: password, newPassword: 'Nouveau-test-password-42!' } });
  assert.equal(changed.status, 200);
  assert.equal((await call('/private', { cookie: otherCookie })).status, 401);
  assert.equal((await call('/private', { cookie: changed.setCookie.split(';', 1)[0] })).status, 200);
});

test('une modification d’e-mail requiert le mot de passe actuel ; aucun rôle administrateur ne peut être injecté', async () => {
  const account = await register();
  const refused = await call('/api/auth/me', { method: 'PATCH', cookie: account.cookie, body: { email: 'nouvelle-adresse@example.test', role: 'admin' } });
  assert.equal(refused.status, 403);
  const result = await call('/api/auth/me', { method: 'PATCH', cookie: account.cookie, body: { name: 'Nouveau nom', role: 'admin' } });
  assert.equal(result.status, 200);
  assert.equal(result.body.user.name, 'Nouveau nom');
  assert.equal(result.body.user.role, 'customer');
});

test('la connexion est limitée et les cookies sont Secure en production', async () => {
  assert.equal((await call('/limited/login', { method: 'POST', body: { email: 'unknown@example.test', password } })).status, 401);
  const limited = await call('/limited/login', { method: 'POST', body: { email: 'unknown@example.test', password } });
  assert.equal(limited.status, 429);
  assert.ok(limited.response.headers.get('retry-after'));
  const account = await register();
  process.env.NODE_ENV = 'production';
  try {
    const login = await call('/api/auth/login', { method: 'POST', body: { email: account.email, password } });
    assert.equal(login.status, 200);
    assert.ok(/; Secure/i.test(login.setCookie));
    const reset = await call('/api/auth/forgot-password', { method: 'POST', body: { email: account.email } });
    assert.equal(reset.body.delivery, 'not-configured');
    assert.match(reset.body.message, /pas encore activé/);
  } finally { process.env.NODE_ENV = 'test'; }
});

test('les inscriptions publiques sont fermées en production sans supprimer les comptes historiques', async () => {
  const account = await register();
  const usersBefore = getDb().prepare('SELECT COUNT(*) AS count FROM users').get().count;
  const sessionsBefore = getDb().prepare('SELECT COUNT(*) AS count FROM sessions').get().count;
  process.env.NODE_ENV = 'production';
  try {
    const refused = await call('/api/auth/register', { method: 'POST', body: { name: 'Visiteur public', email: 'production-closed@example.test', password, role: 'admin' } });
    assert.equal(refused.status, 403);
    assert.equal(refused.body.code, 'REGISTRATION_CLOSED');
    assert.equal(refused.setCookie, null);
    assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM users').get().count, usersBefore);
    assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM sessions').get().count, sessionsBefore);
    assert.equal((await call('/private', { cookie: account.cookie })).body.id, account.body.user.id);
  } finally { process.env.NODE_ENV = 'test'; }
});

test('la création opérateur d’un administrateur est explicite et ne remplace pas un compte existant', async () => {
  const admin = await createAdminUser({ name: 'Administrateur test', email: 'operateur@example.test', password });
  assert.equal(admin.role, 'admin');
  const login = await call('/api/auth/login', { method: 'POST', body: { email: admin.email, password } });
  assert.equal((await call('/admin', { cookie: login.setCookie.split(';', 1)[0] })).status, 200);
  await assert.rejects(() => createAdminUser({ name: 'Autre', email: admin.email, password }));
});

// Commit a concurrent operation immediately after the handler reads credentials,
// while its real scrypt verification is awaiting. This controls the ordering
// without timing delays, mock passwords or production-only test hooks.
function afterCredentialRead(sql, mutation) {
  const db = getDb(), prepare = db.prepare;
  let triggered = false;
  db.prepare = function (query, ...options) {
    const statement = prepare.call(this, query, ...options);
    if (query === sql) {
      const get = statement.get;
      statement.get = function (...parameters) {
        const row = get.apply(this, parameters);
        if (!triggered) { triggered = true; queueMicrotask(() => transaction(mutation, db)); }
        return row;
      };
    }
    return statement;
  };
  return () => { db.prepare = prepare; assert.equal(triggered, true); };
}

test('une connexion en cours ne recrée pas de session après une réinitialisation concurrente', async () => {
  const account = await register();
  const nextPassword = 'Concurrent-reset-password-42!';
  const nextHash = await hashPassword(nextPassword);
  const restore = afterCredentialRead('SELECT * FROM users WHERE email = ?', db => {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(nextHash, account.body.user.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(account.body.user.id);
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(account.body.user.id);
  });
  let result;
  try { result = await call('/api/auth/login', { method: 'POST', body: { email: account.email, password } }); }
  finally { restore(); }
  assert.equal(result.status, 401);
  assert.equal(result.body.code, 'INVALID_CREDENTIALS');
  assert.equal(result.setCookie, null);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?').get(account.body.user.id).count, 0);
  assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: account.email, password: nextPassword } })).status, 200);
});

test('une connexion avec une ancienne adresse ne crée pas de session après son changement concurrent', async () => {
  const account = await register();
  const email = `changed-${++sequence}@example.test`;
  const restore = afterCredentialRead('SELECT * FROM users WHERE email = ?', db => {
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, account.body.user.id);
  });
  let result;
  try { result = await call('/api/auth/login', { method: 'POST', body: { email: account.email, password } }); }
  finally { restore(); }
  assert.equal(result.status, 401);
  assert.equal(result.body.code, 'INVALID_CREDENTIALS');
  assert.equal(result.setCookie, null);
});

test('une modification d’identité en cours ne survit pas à la révocation de sa session', async () => {
  for (const route of ['/api/auth/me', '/api/auth/change-password']) {
    const account = await register();
    const originalHash = getDb().prepare('SELECT password_hash FROM users WHERE id = ?').get(account.body.user.id).password_hash;
    const restore = afterCredentialRead('SELECT * FROM users WHERE id = ?', db => {
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(account.body.user.id);
    });
    let result;
    try {
      result = await call(route, { method: route.endsWith('/me') ? 'PATCH' : 'POST', cookie: account.cookie, body: route.endsWith('/me') ? { email: `revoked-${++sequence}@example.test`, currentPassword: password } : { currentPassword: password, newPassword: 'Never-committed-password-42!' } });
    } finally { restore(); }
    assert.equal(result.status, 401);
    assert.equal(result.body.code, 'AUTH_REQUIRED');
    assert.equal(result.setCookie, null);
    const stored = getDb().prepare('SELECT * FROM users WHERE id = ?').get(account.body.user.id);
    assert.equal(stored.password_hash, originalHash);
    assert.equal(stored.email, account.email);
    assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?').get(account.body.user.id).count, 0);
  }
});

test('un changement de mot de passe ne remplace pas un mot de passe réinitialisé pendant la vérification', async () => {
  const account = await register();
  const resetHash = await hashPassword('Reset-wins-password-42!');
  const restore = afterCredentialRead('SELECT * FROM users WHERE id = ?', db => {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(resetHash, account.body.user.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(account.body.user.id);
  });
  let result;
  try { result = await call('/api/auth/change-password', { method: 'POST', cookie: account.cookie, body: { currentPassword: password, newPassword: 'Stale-change-password-42!' } }); }
  finally { restore(); }
  assert.equal(result.status, 401);
  assert.equal(result.setCookie, null);
  assert.equal(getDb().prepare('SELECT password_hash FROM users WHERE id = ?').get(account.body.user.id).password_hash, resetHash);
});
