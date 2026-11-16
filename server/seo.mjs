import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { defaultPricing } from '../shared/catalog.ts';
import { getRouteSeo, getStructuredData, publicPagePaths, siteOrigin, siteSocialImage } from '../shared/seo.ts';

export const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function renderSeoHead(metadata) {
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
  ];
  if (metadata.canonical) {
    tags.push(
      `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" />`,
      '<meta property="og:type" content="website" />',
      '<meta property="og:locale" content="fr_FR" />',
      '<meta property="og:site_name" content="pixelito" />',
      `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
      `<meta property="og:url" content="${escapeHtml(metadata.canonical)}" />`,
      `<meta property="og:image" content="${siteSocialImage}" />`,
      '<meta property="og:image:width" content="512" />',
      '<meta property="og:image:height" content="512" />',
      '<meta property="og:image:alt" content="Symbole pixelito" />',
      '<meta name="twitter:card" content="summary" />',
      `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
      `<meta name="twitter:image" content="${siteSocialImage}" />`,
      '<meta name="twitter:image:alt" content="Symbole pixelito" />',
      `<script type="application/ld+json" id="studio-structured-data">${safeJson(getStructuredData(metadata))}</script>`,
    );
  }
  return tags.join('\n    ');
}

export function renderSeoDocument(template, metadata, { body, pricing, assets = '' } = {}) {
  if (typeof body === 'string') {
    const root = /<div\b(?=[^>]*\bid=["']root["'])[^>]*>\s*<\/div>/i;
    if (!root.test(template)) throw new Error('Missing public HTML root');
    template = template.replace(root, () => `<div id="root" data-ssr="true">${body}</div><script type="application/json" id="studio-public-data">${safeJson({ pricing })}</script>`);
  }
  const head = renderSeoHead(metadata) + (assets ? `\n    ${assets}` : '');
  const marker = /<!-- studio:seo:start -->[\s\S]*?<!-- studio:seo:end -->/;
  if (marker.test(template)) return template.replace(marker, () => `<!-- studio:seo:start -->\n    ${head}\n    <!-- studio:seo:end -->`);
  // HTML build tools may remove comments. Preserve scripts, styles and other head tags.
  return template.replace(/<head\b[^>]*>([\s\S]*?)<\/head>/i, (whole, content) => {
    const cleaned = content
      .replace(/<script\b(?=[^>]*\bid=["']studio-structured-data["'])[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<meta\b(?=[^>]*(?:name\s*=\s*["'](?:description|robots|twitter:[^"']*)["']|property\s*=\s*["']og:[^"']*["']))[^>]*>/gi, '')
      .replace(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gi, '');
    return whole.replace(content, () => `${cleaned}\n    ${head}\n  `);
  });
}

export function renderSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPagePaths.map(route => `  <url><loc>${escapeHtml(`${siteOrigin}${route}`)}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export function renderRobots() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Allow: /api/catalogue',
    '',
    `Sitemap: ${siteOrigin}/sitemap.xml`,
    '',
  ].join('\n');
}

/** Include the route's real build assets so server HTML is styled without JS. */
export function renderPublicAssets(manifest, pathname) {
  const sources = [pathname.startsWith('/forfaits/') ? 'src/pages/configurator/index.tsx' : 'src/pages/public/index.tsx'];
  if (pathname === '/contact') sources.push('src/components/inquiries/ProjectBriefForm.tsx');
  const visited = new Set(['index.html']); // The entry's styles and modules are already in the template.
  const styles = new Set();
  const modules = new Set();
  function visit(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const chunk = manifest[key];
    if (!chunk) return;
    if (chunk.file?.endsWith('.js')) modules.add(chunk.file);
    for (const css of chunk.css ?? []) styles.add(css);
    for (const imported of chunk.imports ?? []) visit(imported);
  }
  sources.forEach(visit);
  return [
    ...Array.from(styles, file => `<link rel="stylesheet" href="/${escapeHtml(file)}" />`),
    ...Array.from(modules, file => `<link rel="modulepreload" href="/${escapeHtml(file)}" />`),
  ].join('\n    ');
}

/** Mount robots/sitemap before express.static, then page after the static files. */
export function createSeoHandlers({ clientDirectory, renderPage, getPricing = () => defaultPricing }) {
  const template = readFileSync(path.join(clientDirectory, 'index.html'), 'utf8');
  const manifestFile = path.join(clientDirectory, '.vite/manifest.json');
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {};
  // Anonymous public HTML only. Bound memory, coalesce concurrent renders and
  // include actual prices so an administration change cannot reuse stale prices.
  const publicBodies = new Map();
  function publicBody(href, pricing) {
    const key = `${href}\n${safeJson(pricing)}`;
    const existing = publicBodies.get(key);
    if (existing && existing.expires > Date.now()) {
      publicBodies.delete(key);
      publicBodies.set(key, existing);
      return existing.html;
    }
    publicBodies.delete(key);
    while (publicBodies.size >= 32) publicBodies.delete(publicBodies.keys().next().value);
    const entry = { expires: Date.now() + 60_000, html: Promise.resolve().then(() => renderPage(href, pricing)) };
    publicBodies.set(key, entry);
    entry.html.catch(() => { if (publicBodies.get(key) === entry) publicBodies.delete(key); });
    return entry.html;
  }
  return {
    robots(_req, res) {
      res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(renderRobots());
    },
    sitemap(_req, res) {
      res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(renderSitemap());
    },
    async page(req, res) {
      // An absent asset must never be served an HTML app shell with HTTP 200.
      if (req.path.startsWith('/assets/') || /\.[^/]+$/.test(req.path)) {
        res.status(404).type('text/plain').set('X-Robots-Tag', 'noindex, nofollow').set('Cache-Control', 'no-store').send('Ressource introuvable.');
        return;
      }
      const queryAt = req.originalUrl.indexOf('?');
      const search = queryAt === -1 ? '' : req.originalUrl.slice(queryAt);
      const pricing = getPricing();
      const metadata = getRouteSeo(req.path, search, pricing);
      res.set('Cache-Control', 'no-store');
      if (metadata.redirect) {
        res.redirect(301, metadata.redirect);
        return;
      }
      if (metadata.robots.startsWith('noindex')) res.set('X-Robots-Tag', metadata.robots);
      const body = renderPage && metadata.canonical && metadata.status === 200
        ? await publicBody(req.path + search, pricing) : undefined;
      const assets = body === undefined ? '' : renderPublicAssets(manifest, req.path);
      res.status(metadata.status).type('html').send(renderSeoDocument(template, metadata, { body, pricing, assets }));
    },
  };
}
