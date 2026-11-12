import express from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRouter, optionalAuth, requireAuth, csrfProtection } from './auth.mjs';
import { createProjectsRouter } from './projects.mjs';
import { createFilesRouter } from './files.mjs';
import { createCollaborationRouter } from './collaboration.mjs';
import { createOrdersRouter, getPricing, getPaymentAvailability } from './orders.mjs';
import { createInquiriesRouter } from './inquiries.mjs';
import { createInquiryAdminRouter } from './inquiry-admin.mjs';
import { createSeoHandlers } from './seo.mjs';
import { publicOffers, optionDefinitions, normalizeConfiguration, quoteConfiguration } from '../shared/catalog.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY) {
    if (process.env.TRUST_PROXY !== 'loopback') throw new Error('TRUST_PROXY accepte uniquement loopback.');
    app.set('trust proxy', 'loopback');
  }
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'blob:'], fontSrc: ["'self'"], connectSrc: ["'self'"], frameSrc: ['https:'], objectSrc: ["'none'"], baseUri: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"] },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use('/api/inquiries', express.json({ limit: '64kb' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(optionalAuth);
  app.use('/api', (req, res, next) => { res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }); next(); });
  app.use('/api', csrfProtection);
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/catalogue', (_req, res) => res.json({ offers: publicOffers, options: optionDefinitions, pricing: getPricing(), paymentAvailable: getPaymentAvailability().enabled }));
  app.post('/api/quote', (req, res) => {
    try { res.json({ quote: quoteConfiguration(normalizeConfiguration(req.body?.configuration), getPricing()) }); }
    catch { res.status(400).json({ error: 'Vérifiez le forfait et les fonctionnalités choisies.' }); }
  });
  app.use('/api/auth', authRouter);
  app.use('/api/projects', createProjectsRouter({ requireAuth }));
  app.use('/api/projects', createFilesRouter({ requireAuth }));
  app.use('/api/projects', createCollaborationRouter({ requireAuth }));
  app.use('/api/inquiries', createInquiriesRouter());
  app.use('/api', createInquiryAdminRouter());

  app.use('/api', createOrdersRouter({ requireAuth }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Cette ressource est introuvable.' }));
  const client = path.join(root, 'dist/client');
  if (existsSync(path.join(client, 'index.html'))) {
    const seo = createSeoHandlers({ clientDirectory: client });
    app.get('/robots.txt', seo.robots);
    app.get('/sitemap.xml', seo.sitemap);
    app.get('/index.html', (_req, res) => res.redirect(301, '/'));
    app.use(express.static(client, { index: false, maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
    app.get('/{*path}', seo.page);
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
