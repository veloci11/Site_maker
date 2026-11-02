import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRouter, optionalAuth, requireAuth, csrfProtection } from './auth.mjs';
import { createProjectsRouter } from './projects.mjs';
import { createFilesRouter } from './files.mjs';
import { createCollaborationRouter } from './collaboration.mjs';
import { createOrdersRouter, getPricing, getPaymentAvailability } from './orders.mjs';
import { getDb, newId, now } from './db.mjs';
import { offers, optionDefinitions, normalizeConfiguration, quoteConfiguration } from '../shared/catalog.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'blob:'], fontSrc: ["'self'"], connectSrc: ["'self'"], frameSrc: ['https:'], objectSrc: ["'none'"], baseUri: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"] },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(optionalAuth);
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api', csrfProtection);
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/catalogue', (_req, res) => res.json({ offers, options: optionDefinitions, pricing: getPricing(), paymentAvailable: getPaymentAvailability().enabled }));
  app.post('/api/quote', (req, res) => {
    try { res.json({ quote: quoteConfiguration(normalizeConfiguration(req.body?.configuration), getPricing()) }); }
    catch { res.status(400).json({ error: 'Vérifiez le forfait et les options choisies.' }); }
  });
  app.use('/api/auth', authRouter);
  app.use('/api/projects', createProjectsRouter({ requireAuth }));
  app.use('/api/projects', createFilesRouter({ requireAuth }));
  app.use('/api/projects', createCollaborationRouter({ requireAuth }));
  app.post('/api/inquiries', rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Plusieurs demandes ont déjà été enregistrées. Réessayez un peu plus tard.' } }), (req, res) => {
    const { name, email, subject, message } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.length > 120 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof message !== 'string' || message.trim().length < 10 || message.length > 10_000 || (subject != null && (typeof subject !== 'string' || subject.length > 160))) return res.status(400).json({ error: 'Indiquez votre nom, un e-mail valide et un message de 10 caractères minimum.' });
    const db = getDb();
    db.exec('CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,subject TEXT NOT NULL,message TEXT NOT NULL,created_at TEXT NOT NULL) STRICT');
    const id = newId();
    db.prepare('INSERT INTO inquiries (id,name,email,subject,message,created_at) VALUES (?,?,?,?,?,?)').run(id, name.trim(), email.trim(), subject?.trim() || 'Projet', message.trim(), now());
    res.status(201).json({ ok: true, id });
  });

  app.use('/api', createOrdersRouter({ requireAuth }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Cette ressource est introuvable.' }));
  const client = path.join(root, 'dist/client');
  if (existsSync(path.join(client, 'index.html'))) {
    app.use(express.static(client, { index: false, maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(client, 'index.html')));
  }
  app.use((error, _req, res, _next) => {
    if (res.headersSent) return _next(error);
    res.type('application/json');
    if (error instanceof SyntaxError && error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Les informations envoyées ne sont pas lisibles.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Le contenu envoyé est trop volumineux.' });
    console.error('[studio API]', error.name, error.code || 'UNEXPECTED');
    res.status(500).json({ error: 'L’enregistrement n’a pas abouti. Réessayez dans un instant.' });
  });
  return app;
}
