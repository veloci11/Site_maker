import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import { getRouteSeo, publicPagePaths, siteOrigin } from '../shared/seo.ts';
import { createSeoHandlers, renderSeoDocument, renderSeoHead, renderSitemap, renderRobots } from '../server/seo.mjs';

test('public routes have distinct useful metadata and canonical service variants', () => {
  const titles = new Set();
  for (const route of publicPagePaths) {
    const url = new URL(route, siteOrigin);
    const metadata = getRouteSeo(url.pathname, url.search);
    assert.equal(metadata.status, 200, route);
    assert.equal(metadata.robots, 'index, follow', route);
    assert.equal(metadata.canonical, url.href, route);
    assert.ok(metadata.description.length > 50, route);
    assert.doesNotMatch(metadata.description, /sans compte|aucun compte|premi[eè]re position|garanti/i);
    assert.ok(!titles.has(metadata.title), `Duplicate title for ${route}`);
    titles.add(metadata.title);
  }
  assert.equal(getRouteSeo('/forfaits/connecte').title, 'Site Connecté · studio');
  assert.equal(getRouteSeo('/forfaits/immersif-3d').title, 'Site Immersif 3D · studio');
  assert.equal(getRouteSeo('/contact', '?besoin=refonte').title, 'Refonte de site · studio');
});

test('filter, tracking and arbitrary query values never become canonical content', () => {
  assert.equal(getRouteSeo('/exemples', '?type=immersif&utm_source=test').canonical, `${siteOrigin}/exemples`);
  assert.equal(getRouteSeo('/contact', '?besoin=evolution&utm_source=test').canonical, `${siteOrigin}/contact?besoin=evolution`);
  assert.equal(getRouteSeo('/contact', '?besoin=%22%3E%3Cscript%3E').canonical, `${siteOrigin}/contact`);
  assert.equal(getRouteSeo('/forfaits/vitrine', '?option=mobile&nouveau=1').canonical, `${siteOrigin}/forfaits/vitrine`);
  for (const query of ['?projet=private-id', '?projectId=private-id']) {
    const metadata = getRouteSeo('/forfaits/vitrine', query);
    assert.equal(metadata.robots, 'noindex, nofollow');
    assert.equal(metadata.canonical, null);
    assert.doesNotMatch(JSON.stringify(metadata), /private-id/);
  }
});

test('private, auth and incomplete legal pages are excluded without echoing identifiers', () => {
  for (const route of ['/configurateur', '/connexion', '/inscription', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe', '/espace', '/espace/messages', '/admin', '/commande/private-id', '/confidentialite', '/mentions-legales', '/conditions']) {
    const metadata = getRouteSeo(route, '?retour=secret&token=secret');
    assert.equal(metadata.status, 200, route);
    assert.equal(metadata.robots, 'noindex, nofollow', route);
    assert.equal(metadata.canonical, null, route);
    assert.doesNotMatch(JSON.stringify(metadata), /secret|private-id/);
  }
});

test('only existing legacy routes redirect; unknown pages retain a real 404', () => {
  assert.equal(getRouteSeo('/formules').redirect, '/forfaits');
  assert.equal(getRouteSeo('/formules/immersif').redirect, '/forfaits/immersif-3d');
  assert.equal(getRouteSeo('/formules/vitrine', '?projet=existing-id').redirect, '/forfaits/vitrine?projet=existing-id');
  assert.equal(getRouteSeo('/forfaits/immersif').redirect, '/forfaits/immersif-3d');
  assert.equal(getRouteSeo('/forfaits/immersif', '?option=scene-3d').redirect, '/forfaits/immersif-3d?option=scene-3d');
  assert.equal(getRouteSeo('/FAQ/').redirect, '/faq');
  assert.equal(getRouteSeo('/methode').redirect, '/#fonctionnement');
  assert.equal(getRouteSeo('/exemples/domteknika').redirect, 'https://domteknika.ch/fr');
  for (const route of ['/not-a-page', '/formules/missing', '/forfaits/missing', '/exemples/missing', '/espace/missing', '//evil.test', '/\\evil.test']) {
    const metadata = getRouteSeo(route);
    assert.equal(metadata.status, 404, route);
    assert.equal(metadata.canonical, null, route);
    assert.equal(metadata.redirect, undefined, route);
    assert.equal(metadata.robots, 'noindex, nofollow', route);
  }
});

test('head output escapes text and attributes without introducing scripts or duplicate canonical tags', () => {
  const metadata = { ...getRouteSeo('/'), title: 'A & B </title><script>alert("x")</script> $&', description: '" onload="bad <bad> & \'', canonical: `${siteOrigin}/?a=1&b="bad"` };
  const head = renderSeoHead(metadata);
  assert.doesNotMatch(head, /<script>|onload="bad|<bad>/);
  assert.match(head, /&lt;\/title&gt;&lt;script&gt;/);
  assert.match(head, /&amp; B/);
  assert.match(head, /&quot; onload=&quot;bad/);
  assert.match(head, /&amp;b=&quot;bad&quot;/);
  const source = '<html><head><meta name="viewport" content="width=device-width"><title>Old</title><meta name="description" content="Old"><link rel="canonical" href="https://old.test"><meta property="og:title" content="Old"><script src="/app.js"></script></head><body><div id="root"></div></body></html>';
  const rendered = renderSeoDocument(source, metadata);
  assert.equal((rendered.match(/<title>/g) ?? []).length, 1);
  assert.equal((rendered.match(/rel="canonical"/g) ?? []).length, 1);
  assert.equal((rendered.match(/property="og:title"/g) ?? []).length, 1);
  assert.ok(rendered.includes('$&'));
  assert.ok(rendered.includes('<script src="/app.js"></script>'));
  assert.ok(rendered.includes('<meta name="viewport" content="width=device-width">'));
  assert.ok(rendered.endsWith('<body><div id="root"></div></body></html>'));
});

test('the marked template retains app resources and removes previous route metadata', () => {
  const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const rendered = renderSeoDocument(template, getRouteSeo('/faq'));
  assert.equal((rendered.match(/<title>/g) ?? []).length, 1);
  assert.equal((rendered.match(/name="description"/g) ?? []).length, 1);
  assert.equal((rendered.match(/rel="canonical"/g) ?? []).length, 1);
  assert.ok(rendered.includes('Questions fréquentes · studio'));
  assert.ok(rendered.includes('<script type="module" src="/src/main.tsx"></script>'));
  assert.ok(rendered.includes('/assets/textures/grain-plasma-card.webp'));
  assert.doesNotMatch(rendered, /Sans compte/);
  const privateRendered = renderSeoDocument(rendered, getRouteSeo('/connexion'));
  assert.doesNotMatch(privateRendered, /rel="canonical"|property="og:|name="twitter:/);
  assert.match(privateRendered, /name="robots" content="noindex, nofollow"/);
});

test('sitemap includes canonical indexable public pages only, without invented modification dates', () => {
  const sitemap = renderSitemap();
  assert.match(sitemap, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  const locations = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g), match => match[1].replaceAll('&amp;', '&'));
  assert.equal(new Set(locations).size, locations.length);
  assert.equal(locations.length, 12);
  for (const location of locations) {
    const url = new URL(location);
    assert.equal(url.origin, siteOrigin);
    const metadata = getRouteSeo(url.pathname, url.search);
    assert.equal(metadata.status, 200);
    assert.equal(metadata.robots, 'index, follow');
    assert.equal(metadata.canonical, location);
  }
  assert.ok(locations.includes(`${siteOrigin}/contact?besoin=evolution`));
  assert.ok(locations.includes(`${siteOrigin}/contact?besoin=refonte`));
  assert.doesNotMatch(sitemap, /lastmod|priority|changefreq|connexion|espace|conditions|formules|exemples\//);
});

test('robots keeps public resources and noindex HTML crawlable while excluding protected APIs', () => {
  const robots = renderRobots();
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Allow: \/api\/catalogue/);
  assert.match(robots, /Sitemap: https:\/\/gilmathis.com\/sitemap.xml/);
  assert.doesNotMatch(robots, /Disallow: \/(?:assets|connexion|espace|admin|commande|configurateur)/);
});

test('Express handlers deliver route heads, correct robots/sitemap types, redirects and real missing-asset statuses', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'studio-seo-'));
  writeFileSync(path.join(directory, 'index.html'), readFileSync(new URL('../index.html', import.meta.url)));
  const handlers = createSeoHandlers({ clientDirectory: directory });
  const app = express();
  app.get('/robots.txt', handlers.robots);
  app.get('/sitemap.xml', handlers.sitemap);
  app.use(express.static(directory, { index: false }));
  app.get('/{*path}', handlers.page);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(`${base}/contact?besoin=refonte&utm_source=test`, { headers: { Host: 'untrusted.example' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.text();
    assert.match(body, /<title>Refonte de site · studio<\/title>/);
    assert.match(body, /rel="canonical" href="https:\/\/gilmathis.com\/contact\?besoin=refonte"/);
    assert.doesNotMatch(body, /untrusted\.example|utm_source/);
    for (const route of ['/connexion?token=secret', '/forfaits/vitrine?projectId=private-id', '/conditions']) {
      const excluded = await fetch(`${base}${route}`);
      assert.equal(excluded.status, 200);
      assert.equal(excluded.headers.get('x-robots-tag'), 'noindex, nofollow');
      const html = await excluded.text();
      assert.doesNotMatch(html, /secret|private-id|rel="canonical"/);
    }
    for (const route of ['/missing-page', '/forfaits/missing', '/assets/missing.js', '/favicon.ico']) {
      const missing = await fetch(`${base}${route}`);
      assert.equal(missing.status, 404, route);
      assert.equal(missing.headers.get('x-robots-tag'), 'noindex, nofollow');
      if (route.includes('.')) assert.match(missing.headers.get('content-type'), /text\/plain/);
    }
    const redirect = await fetch(`${base}/formules/immersif`, { redirect: 'manual' });
    assert.equal(redirect.status, 301);
    assert.equal(redirect.headers.get('location'), '/forfaits/immersif-3d');
    const robots = await fetch(`${base}/robots.txt`);
    assert.match(robots.headers.get('content-type'), /text\/plain/);
    assert.match(await robots.text(), /^User-agent: \*/);
    const sitemap = await fetch(`${base}/sitemap.xml`);
    assert.match(sitemap.headers.get('content-type'), /application\/xml/);
    assert.match(await sitemap.text(), /<urlset/);
  } finally {
    await new Promise(resolve => server.close(resolve));
    rmSync(directory, { recursive: true, force: true });
  }
});

test('the real Express application mounts SEO before static files and preserves protected API access', { skip: !existsSync(new URL('../dist/client/index.html', import.meta.url)) }, async () => {
  const saved = Object.fromEntries(['DATA_DIR', 'APP_ORIGIN', 'PUBLIC_APP_URL', 'TRUST_PROXY', 'NODE_ENV'].map(key => [key, process.env[key]]));
  const directory = mkdtempSync(path.join(tmpdir(), 'studio-seo-app-'));
  process.env.DATA_DIR = directory;
  process.env.APP_ORIGIN = siteOrigin;
  process.env.PUBLIC_APP_URL = siteOrigin;
  process.env.TRUST_PROXY = 'loopback';
  process.env.NODE_ENV = 'production';
  const { createApp } = await import('../server/app.mjs');
  const { closeDb } = await import('../server/db.mjs');
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of publicPagePaths) {
      const response = await fetch(`${base}${route}`);
      assert.equal(response.status, 200, route);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('x-robots-tag'), null);
      const html = await response.text();
      const url = new URL(route, siteOrigin);
      assert.ok(html.includes(`<title>${getRouteSeo(url.pathname, url.search).title}</title>`), route);
      assert.ok(html.includes(`rel="canonical" href="${siteOrigin}${route}"`), route);
      assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, route);
      assert.match(html, /<script type="module"[^>]*src="\/assets\//);
      assert.doesNotMatch(html, /Sans compte/);
    }
    for (const route of ['/connexion', '/admin', '/espace', '/commande/existing-id', '/forfaits/vitrine?projet=existing-id', '/mentions-legales']) {
      const response = await fetch(`${base}${route}`);
      assert.equal(response.status, 200, route);
      assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow', route);
      const html = await response.text();
      assert.match(html, /name="robots" content="noindex, nofollow"/);
      assert.doesNotMatch(html, /rel="canonical"|existing-id/);
    }
    for (const route of ['/seo-unknown', '/forfaits/seo-unknown', '/assets/seo-unknown.js', '/favicon-seo-unknown.ico']) {
      const response = await fetch(`${base}${route}`);
      assert.equal(response.status, 404, route);
      assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow', route);
    }
    const index = await fetch(`${base}/index.html`, { redirect: 'manual' });
    assert.equal(index.status, 301);
    assert.equal(index.headers.get('location'), '/');
    const robots = await fetch(`${base}/robots.txt`);
    assert.match(robots.headers.get('content-type'), /text\/plain/);
    assert.equal(await robots.text(), renderRobots());
    const sitemap = await fetch(`${base}/sitemap.xml`);
    assert.match(sitemap.headers.get('content-type'), /application\/xml/);
    assert.equal(await sitemap.text(), renderSitemap());
    const catalogue = await fetch(`${base}/api/catalogue`);
    assert.equal(catalogue.status, 200);
    assert.equal(catalogue.headers.get('x-robots-tag'), 'noindex, nofollow');
    const protectedProjects = await fetch(`${base}/api/projects`);
    assert.equal(protectedProjects.status, 401);
    assert.equal(protectedProjects.headers.get('x-robots-tag'), 'noindex, nofollow');
  } finally {
    await new Promise(resolve => server.close(resolve));
    closeDb();
    rmSync(directory, { recursive: true, force: true });
    for (const [key, value] of Object.entries(saved)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
