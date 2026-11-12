import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getRouteSeo, publicPagePaths, siteOrigin } from '../shared/seo.ts';

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
      '<meta name="twitter:card" content="summary" />',
      `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    );
  }
  return tags.join('\n    ');
}

export function renderSeoDocument(template, metadata) {
  const head = renderSeoHead(metadata);
  const marker = /<!-- studio:seo:start -->[\s\S]*?<!-- studio:seo:end -->/;
  if (marker.test(template)) return template.replace(marker, () => `<!-- studio:seo:start -->\n    ${head}\n    <!-- studio:seo:end -->`);
  // HTML build tools may remove comments. Preserve scripts, styles and other head tags.
  return template.replace(/<head\b[^>]*>([\s\S]*?)<\/head>/i, (whole, content) => {
    const cleaned = content
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

/** Mount robots/sitemap before express.static, then page after the static files. */
export function createSeoHandlers({ clientDirectory }) {
  const template = readFileSync(path.join(clientDirectory, 'index.html'), 'utf8');
  return {
    robots(_req, res) {
      res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(renderRobots());
    },
    sitemap(_req, res) {
      res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(renderSitemap());
    },
    page(req, res) {
      // An absent asset must never be served an HTML app shell with HTTP 200.
      if (req.path.startsWith('/assets/') || /\.[^/]+$/.test(req.path)) {
        res.status(404).type('text/plain').set('X-Robots-Tag', 'noindex, nofollow').set('Cache-Control', 'no-store').send('Ressource introuvable.');
        return;
      }
      const queryAt = req.originalUrl.indexOf('?');
      const metadata = getRouteSeo(req.path, queryAt === -1 ? '' : req.originalUrl.slice(queryAt));
      res.set('Cache-Control', 'no-store');
      if (metadata.redirect) {
        res.redirect(301, metadata.redirect);
        return;
      }
      if (metadata.robots.startsWith('noindex')) res.set('X-Robots-Tag', metadata.robots);
      res.status(metadata.status).type('html').send(renderSeoDocument(template, metadata));
    },
  };
}
