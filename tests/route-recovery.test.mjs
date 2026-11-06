import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { transformSync } from 'esbuild';

// Exercise the real TSX component using the JSX compiler already used by Vite.
const recoveryUrl = new URL('../src/components/layout/PageRecovery.tsx', import.meta.url).href;
const hooks = registerHooks({
  load(url, context, nextLoad) {
    if (url !== recoveryUrl) return nextLoad(url, context);
    return {
      format: 'module', shortCircuit: true,
      source: transformSync(readFileSync(new URL(url), 'utf8'), {
        loader: 'tsx', format: 'esm', jsx: 'automatic',
      }).code,
    };
  },
});
const { PageRecovery } = await import(recoveryUrl);
hooks.deregister();

const failure = () => { throw new Error('Failed to fetch dynamically imported module: /assets/private-debug-marker.js'); };
const routes = () => [{
  id: 'root', element: createElement(Outlet), errorElement: createElement(PageRecovery),
  children: [
    { index: true, element: createElement('h1', null, 'Accueil disponible') },
    { path: 'forfaits/vitrine', lazy: async () => failure() },
  ],
}];

function assertRecovery(router) {
  assert.ok(router.state.errors?.root, 'The router must actually catch the lazy rejection.');
  const markup = renderToStaticMarkup(createElement(RouterProvider, { router }));
  assert.match(markup, /La page n’a pas pu s’ouvrir\./);
  assert.match(markup, /<button type="button"[^>]*>Recharger la page<\/button>/);
  assert.doesNotMatch(markup, /Unexpected Application Error|Failed to fetch|private-debug-marker|<pre/);
}

test('a rejected lazy route on first visit renders the French recovery screen without error details', async t => {
  const router = createMemoryRouter(routes(), { initialEntries: ['/forfaits/vitrine'] });
  t.after(() => router.dispose());
  // This awaits the initial route loading, without mounting a browser or making a network request.
  if (!router.state.initialized) await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { unsubscribe(); reject(new Error('Route initialization did not finish')); }, 1000);
    const unsubscribe = router.subscribe(state => {
      if (!state.initialized) return;
      clearTimeout(timer);
      unsubscribe();
      resolve();
    });
  });
  assertRecovery(router);
});

test('a rejected lazy navigation uses recovery and the router can still return to a working route', async t => {
  const router = createMemoryRouter(routes());
  t.after(() => router.dispose());
  assert.match(renderToStaticMarkup(createElement(RouterProvider, { router })), /Accueil disponible/);
  await router.navigate('/forfaits/vitrine');
  assertRecovery(router);
  await router.navigate('/');
  assert.equal(router.state.errors, null);
  assert.match(renderToStaticMarkup(createElement(RouterProvider, { router })), /Accueil disponible/);
});

test('reloading requires an explicit click rather than rendering the recovery screen', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let reloads = 0;
  Object.defineProperty(globalThis, 'window', {
    configurable: true, value: { location: { reload: () => { reloads += 1; } } },
  });
  try {
    renderToStaticMarkup(createElement(PageRecovery));
    assert.equal(reloads, 0);
    const screen = PageRecovery();
    const button = screen.props.children.find(child => child.type === 'button');
    assert.equal(reloads, 0);
    button.props.onClick();
    assert.equal(reloads, 1);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else delete globalThis.window;
  }
});
