import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import express from 'express';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { defaultPricing, faqs } from '../shared/catalog.ts';
import { getRouteSeo, getStructuredData, publicPagePaths, siteOrigin, siteSocialImage } from '../shared/seo.ts';
import { createSeoHandlers, renderSeoDocument, safeJson } from '../server/seo.mjs';
import { renderPublicPage } from '../dist/ssr/entry-server.js';

const scriptData = (html, id) => {
  const match = html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/script>`));
  assert.ok(match, `missing ${id}`);
  return JSON.parse(match[1]);
};

test('every public route renders its actual content without JavaScript or streaming placeholders', async () => {
  for (const route of publicPagePaths) {
    const html = await renderPublicPage(route, defaultPricing);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, route);
    assert.doesNotMatch(html, /<script\b|id="[BS]:|\$RC\(|\$RV\(/, route);
    assert.match(html, /href="\/contact"/, route);
    assert.match(html, /href="\/mentions-legales"/, route);
    if (route === '/faq') for (const faq of faqs) assert.ok(html.includes(faq.question), faq.question);
    if (route.startsWith('/forfaits/')) assert.match(html, /Continuer|Décrire mon projet/, route);
    if (route === '/contact') {
      assert.match(html, /<fieldset[^>]*disabled=""/);
      assert.match(html, /<noscript><p>Activez JavaScript/);
      assert.match(html, /<form[^>]*method="post"/);
    }
  }
});

test('structured data matches the shared FAQ and excludes unconfirmed business identities', () => {
  const graph = getStructuredData(getRouteSeo('/faq'))['@graph'];
  const faq = graph.find(item => item['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map(item => item.name), faqs.map(item => item.question));
  assert.deepEqual(faq.mainEntity.map(item => item.acceptedAnswer.text), faqs.map(item => [item.answer, ...(item.items ?? [])].join('\n')));
  assert.doesNotMatch(JSON.stringify(graph), /LocalBusiness|Organization|aggregateRating|reviewCount|contact@pixelito/);
  for (const route of ['/connexion', '/mentions-legales', '/espace']) assert.equal(getStructuredData(getRouteSeo(route)), null);
});

test('concurrent public renders keep each request’s prices isolated', async () => {
  const first = structuredClone(defaultPricing);
  const second = structuredClone(defaultPricing);
  first.base.vitrine = 111100;
  second.base.vitrine = 222200;
  const [a, b] = await Promise.all([renderPublicPage('/forfaits/vitrine', first), renderPublicPage('/forfaits/vitrine', second)]);
  assert.match(a, /1[\s\u00a0\u202f]?111/);
  assert.doesNotMatch(a, /2[\s\u00a0\u202f]?222/);
  assert.match(b, /2[\s\u00a0\u202f]?222/);
  assert.doesNotMatch(b, /1[\s\u00a0\u202f]?111/);
});

test('public JSON data cannot break out of its inert script or replace literal template tokens', () => {
  const pricing = { ...structuredClone(defaultPricing), version: '</script><script>alert(1)</script>$&' };
  assert.equal(JSON.parse(safeJson(pricing)).version, pricing.version);
  assert.doesNotMatch(safeJson(pricing), /<script|<\/script/);
  const html = renderSeoDocument('<html><head></head><body><div id="root"></div></body></html>', getRouteSeo('/'), { body: '<h1>$&</h1>', pricing });
  assert.match(html, /<h1>\$&<\/h1>/);
  assert.equal(scriptData(html, 'studio-public-data').pricing.version, pricing.version);
});

test('anonymous HTML cache coalesces requests, follows actual prices and retries failed renders', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'pixelito-ssr-cache-'));
  writeFileSync(path.join(directory, 'index.html'), '<html><head></head><body><div id="root"></div></body></html>');
  let pricing = structuredClone(defaultPricing);
  let calls = 0;
  let failOnce = true;
  const handlers = createSeoHandlers({ clientDirectory: directory, getPricing: () => pricing,
    renderPage: async (href, catalogue) => {
      calls++;
      if (href === '/faq?fail=1' && failOnce) { failOnce = false; throw new Error('temporary render failure'); }
      return renderPublicPage(href, catalogue);
    },
  });
  const app = express();
  app.get('/{*path}', handlers.page);
  app.use((_error, _req, res, _next) => res.sendStatus(503));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const responses = await Promise.all([fetch(base), fetch(base)]);
    const [first, second] = await Promise.all(responses.map(response => response.text()));
    assert.equal(first, second);
    assert.equal(calls, 1);
    pricing = { ...structuredClone(pricing), base: { ...pricing.base, vitrine: 133700 } };
    const changed = await (await fetch(base)).text();
    assert.equal(calls, 2);
    assert.deepEqual(scriptData(changed, 'studio-public-data').pricing, pricing);
    const privateHtml = await (await fetch(`${base}/?projet=private`)).text();
    assert.doesNotMatch(privateHtml, /data-ssr|studio-public-data/);
    assert.equal(calls, 2);
    assert.equal((await fetch(`${base}/faq?fail=1`)).status, 503);
    assert.equal((await fetch(`${base}/faq?fail=1`)).status, 200);
    assert.equal(calls, 4);
  } finally {
    await new Promise(resolve => server.close(resolve));
    rmSync(directory, { recursive: true, force: true });
  }
});

test('production HTML, API prices and metadata agree; private pages never receive public prerender data', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'pixelito-ssr-'));
  process.env.DATA_DIR = directory;
  process.env.NODE_ENV = 'production';
  const { createApp } = await import('../server/app.mjs');
  const { getDb, closeDb } = await import('../server/db.mjs');
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const socialImage = await fetch(`${base}${new URL(siteSocialImage).pathname}`);
    assert.equal(socialImage.status, 200);
    assert.match(socialImage.headers.get('content-type'), /image\/png/);
    for (const route of publicPagePaths) {
      const response = await fetch(`${base}${route}`);
      const html = await response.text();
      assert.equal(response.status, 200, route);
      assert.match(html, /id="root" data-ssr="true"/, route);
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1, route);
      assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, route);
      assert.ok(html.includes(`${siteOrigin}${route}`), route);
      assert.ok(html.includes(siteSocialImage), route);
      const styles = [...html.matchAll(/rel="stylesheet"[^>]*href="([^"]+)"/g)].map(([, href]) => href);
      assert.ok(styles.length >= 2, `entry and route CSS are required without JavaScript: ${route}`);
      assert.equal(new Set(styles).size, styles.length, route);
      for (const href of styles) {
        const asset = await fetch(`${base}${href}`);
        assert.equal(asset.status, 200, href);
        assert.match(asset.headers.get('cache-control'), /max-age=31536000, immutable/, href);
      }
      assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
      const scripts = [...html.matchAll(/<script\b([^>]*)>/g)];
      assert.ok(scripts.every(([, attributes]) => /type="application\/(?:ld\+)?json"|src=/.test(attributes)), route);
      assert.equal(scriptData(html, 'studio-structured-data')['@context'], 'https://schema.org');
    }
    const pricing = structuredClone(defaultPricing);
    pricing.version = '</script><script>private-breakout</script>';
    pricing.currency = 'CHF';
    pricing.base.vitrine = 123400;
    pricing.base.connecte = null;
    getDb().prepare("INSERT INTO studio_settings(key,value,updated_at) VALUES ('pricing',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(pricing), new Date().toISOString());
    const html = await (await fetch(`${base}/`)).text();
    const catalogue = await (await fetch(`${base}/api/catalogue`)).json();
    assert.deepEqual(scriptData(html, 'studio-public-data').pricing, catalogue.pricing);
    assert.match(html, /name="description" content="Votre site internet personnalisé à petit prix, à partir de 1[\s\u00a0\u202f]?234[\s\u00a0\u202f]?CHF/);
    assert.doesNotMatch(html, /<script>private-breakout<\/script>/);
    pricing.base.vitrine = null;
    getDb().prepare("UPDATE studio_settings SET value=? WHERE key='pricing'").run(JSON.stringify(pricing));
    const unpriced = await (await fetch(`${base}/`)).text();
    assert.match(unpriced, /name="description" content="Votre site internet personnalisé sur devis\./);
    assert.equal(scriptData(unpriced, 'studio-public-data').pricing.base.vitrine, null);
    for (const route of ['/connexion', '/mentions-legales', '/espace', '/forfaits/vitrine?projet=private-project']) {
      const response = await fetch(`${base}${route}`);
      const privateHtml = await response.text();
      assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow', route);
      assert.doesNotMatch(privateHtml, /data-ssr|studio-public-data|studio-structured-data|private-project/, route);
    }
    assert.equal((await fetch(`${base}/seo-missing-page`)).status, 404);
    const aliases = await fetch(`${base}/index.html`, { redirect: 'manual' });
    assert.equal(aliases.status, 301);
    assert.equal(aliases.headers.get('location'), '/');
  } finally {
    await new Promise(resolve => server.close(resolve));
    closeDb();
    rmSync(directory, { recursive: true, force: true });
  }
});
