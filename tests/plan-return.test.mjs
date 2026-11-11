import test from 'node:test';
import assert from 'node:assert/strict';

let scenario = 0;

async function journey(t, listing = '/') {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const sectionTop = listing === '/' ? 800 : 180;
  const cardSelector = listing === '/' ? '.pricing-card' : '.comparison-cta';
  const browser = {
    location: { href: `https://studio.test${listing}`, origin: 'https://studio.test' },
    scrollX: 0,
    scrollY: 1100,
    scrollTo({ left, top }) { this.scrollX = left; this.scrollY = top; },
  };
  const card = {
    href: 'https://studio.test/forfaits/vitrine',
    dataset: {},
    closest: () => card,
    matches: selector => selector === cardSelector,
    getBoundingClientRect: () => ({ top: 950 - browser.scrollY }),
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      querySelector(selector) {
        if (selector === '.public-header-wrap') return { getBoundingClientRect: () => ({ height: 96 }) };
        if (selector === (listing === '/' ? '#forfaits' : '.public-comparison'))
          return { getBoundingClientRect: () => ({ top: sectionTop - browser.scrollY }) };
        return null;
      },
      querySelectorAll: selector => selector.startsWith(cardSelector) ? [card] : [],
    },
  });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else delete globalThis.window;
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
    else delete globalThis.document;
  });
  const url = new URL('../src/lib/plan-return.ts', import.meta.url);
  url.search = `scenario=${scenario++}`;
  const navigation = await import(url.href);
  navigation.restorePlanScroll({ pathname: listing, key: 'listing' });
  return {
    navigation,
    browser,
    card,
    expectedTop: sectionTop - 96,
    enter(path) { browser.location.href = `https://studio.test${path}`; browser.scrollY = 0; },
  };
}

test('Back from a partly hidden offer card aligns the offers below navigation', async t => {
  const page = await journey(t);
  page.navigation.preparePlanNavigation('/forfaits/vitrine', { sourceElement: page.card });
  page.enter('/forfaits/vitrine');
  page.navigation.restorePlanScroll({ pathname: '/forfaits/vitrine', key: 'plan' });
  page.enter('/');
  assert.equal(page.navigation.restorePlanScroll({ pathname: '/', key: 'listing' }), true);
  assert.equal(page.browser.scrollY, page.expectedTop);
  assert.equal(page.navigation.didRestorePlanScroll({ key: 'listing' }), true);
});

test('the return link also recentres with reduced motion and after a plan switch', async t => {
  const page = await journey(t);
  // No prepared outgoing snapshot: the reduced-motion route commits directly.
  page.enter('/forfaits/vitrine');
  page.navigation.restorePlanScroll({ pathname: '/forfaits/vitrine', key: 'vitrine' });
  page.navigation.preparePlanNavigation('/forfaits/connecte');
  page.enter('/forfaits/connecte');
  page.navigation.restorePlanScroll({ pathname: '/forfaits/connecte', key: 'business' });
  assert.equal(page.navigation.getPlanReturnHref(), '/');
  page.navigation.preparePlanNavigation('/');
  page.enter('/');
  assert.equal(page.navigation.restorePlanScroll({ pathname: '/', key: 'return' }), true);
  assert.equal(page.browser.scrollY, page.expectedTop);
});

test('comparison entry returns to its overview rather than an old row position', async t => {
  const page = await journey(t, '/forfaits');
  page.navigation.preparePlanNavigation('/forfaits/vitrine', { sourceElement: page.card });
  page.enter('/forfaits/vitrine');
  page.navigation.restorePlanScroll({ pathname: '/forfaits/vitrine', key: 'plan' });
  page.enter('/forfaits');
  assert.equal(page.navigation.restorePlanScroll({ pathname: '/forfaits', key: 'listing' }), true);
  assert.equal(page.browser.scrollY, page.expectedTop);
});
