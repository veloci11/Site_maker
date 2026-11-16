import test from 'node:test';
import assert from 'node:assert/strict';

let scenario = 0;
const slugs = ['vitrine', 'connecte', 'immersif-3d'];

async function journey(t, { listing = '/', stacked = false } = {}) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const browser = {
    location: new URL(`https://studio.test${listing}`),
    history: { state: { idx: 0, key: 'entry' } },
    scrollX: 0,
    scrollY: 1100,
    scrollTo({ left, top }) { this.scrollX = left; this.scrollY = top; },
  };
  const cards = slugs.map((slug, index) => ({
    href: `https://studio.test/forfaits/${slug}`,
    getBoundingClientRect: () => ({ top: 890 + (stacked ? index * 590 : 0) - browser.scrollY }),
  }));
  const section = {
    getBoundingClientRect: () => ({ top: 800 - browser.scrollY }),
    querySelectorAll: () => cards,
    querySelector: selector => cards[slugs.findIndex(slug => selector.includes(`/forfaits/${slug}`))] ?? null,
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      querySelector(selector) {
        if (selector === '.public-header-wrap') return { getBoundingClientRect: () => ({ height: 96 }) };
        if (selector === '#forfaits' && browser.location.pathname === '/') return section;
        return null;
      },
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
  navigation.restorePlanScroll({ pathname: listing, key: 'entry' });
  return {
    navigation,
    browser,
    expectedTop(slug) { return (stacked ? 890 + slugs.indexOf(slug) * 590 : 800) - 96; },
    enter(path, index) {
      browser.location = new URL(`https://studio.test${path}`);
      browser.history.state.idx = index;
      browser.history.state.key = `${path}:${index}`;
      browser.scrollY = 0;
      return { pathname: browser.location.pathname, search: browser.location.search, hash: browser.location.hash, key: `${path}:${index}` };
    },
  };
}

for (const stacked of [false, true]) {
  for (const slug of slugs) {
    test(`Back from ${slug} aligns ${stacked ? 'its stacked card' : 'the desktop offer row'}, not the old scroll`, async t => {
      const page = await journey(t, { stacked });
      page.navigation.preparePlanNavigation(`/forfaits/${slug}`);
      page.navigation.restorePlanScroll(page.enter(`/forfaits/${slug}`, 1));
      const target = page.enter('/', 0);
      assert.equal(page.navigation.getPlanBackHref(target, 'POP'), null);
      assert.equal(page.navigation.restorePlanScroll(target), true);
      assert.equal(page.browser.scrollY, page.expectedTop(slug));
      assert.equal(page.navigation.didRestorePlanScroll(target), true);
    });
  }
}

for (const listing of ['/forfaits', '/faq']) {
  test(`Back from a plan entered via ${listing} replaces the destination with the current home offer`, async t => {
    const page = await journey(t, { listing, stacked: true });
    page.navigation.restorePlanScroll(page.enter('/forfaits/connecte', 1));
    const back = page.enter(listing, 0);
    assert.equal(page.navigation.getPlanBackHref(back, 'POP'), '/');
    // ScrollTop replaces the accepted destination without committing it to
    // the scroll helper. The departing plan remains the return-card source.
    const home = page.enter('/', 0);
    assert.equal(page.navigation.getPlanBackHref(home, 'REPLACE'), null);
    assert.equal(page.navigation.restorePlanScroll(home), true);
    assert.equal(page.browser.scrollY, page.expectedTop('connecte'));
  });
}

test('Tous les forfaits also selects a directly opened plan without a remembered listing', async t => {
  const page = await journey(t, { listing: '/forfaits/immersif-3d', stacked: true });
  assert.equal(page.navigation.getPlanReturnHref(), '/');
  page.navigation.preparePlanNavigation('/');
  assert.equal(page.navigation.restorePlanScroll(page.enter('/', 1)), true);
  assert.equal(page.browser.scrollY, page.expectedTop('immersif-3d'));
});

for (const prepared of [false, true]) {
  test(`after Changer, ${prepared ? 'native animation' : 'disabled animation'} returns to the current plan`, async t => {
    const page = await journey(t, { stacked: true });
    page.navigation.restorePlanScroll(page.enter('/forfaits/vitrine', 1));
    page.browser.scrollY = 330;
    page.navigation.capturePlanPageScroll();
    page.navigation.rememberPlanPageScroll({ key: '/forfaits/vitrine:1' });
    if (prepared) page.navigation.preparePlanNavigation('/forfaits/immersif-3d', { preserveScroll: true });
    const switched = page.enter('/forfaits/immersif-3d', 1);
    assert.equal(page.navigation.restorePlanScroll(switched, { sourceKey: '/forfaits/vitrine:1', preserveScroll: true }), true);
    assert.equal(page.browser.scrollY, 330);
    assert.equal(page.navigation.restorePlanScroll(page.enter('/', 0)), true);
    assert.equal(page.browser.scrollY, page.expectedTop('immersif-3d'));
  });
}

test('Back cleans an old home hash so its anchor cannot replace the selected-card position', async t => {
  const page = await journey(t, { stacked: true });
  page.navigation.restorePlanScroll(page.enter('/forfaits/connecte', 1));
  const back = page.enter('/#comparer', 0);
  assert.equal(page.navigation.getPlanBackHref(back, 'POP'), '/');
  const home = page.enter('/', 0);
  assert.equal(page.navigation.restorePlanScroll(home), true);
  assert.equal(page.navigation.didRestorePlanScroll(home), true);
  assert.equal(page.browser.scrollY, page.expectedTop('connecte'));
});

test('Forward and intentional links keep their destination; Back between plans remains a plan navigation', async t => {
  const page = await journey(t);
  page.navigation.restorePlanScroll(page.enter('/forfaits/connecte', 1));
  assert.equal(page.navigation.getPlanBackHref(page.enter('/faq', 2), 'POP'), null);
  assert.equal(page.navigation.getPlanBackHref(page.enter('/faq', 2), 'PUSH'), null);
  assert.equal(page.navigation.getPlanBackHref(page.enter('/faq', 1), 'REPLACE'), null);
  assert.equal(page.navigation.getPlanBackHref(page.enter('/forfaits/vitrine', 0), 'POP'), null);
});

test('ordinary browser Back preserves a scrolled gallery and its filter query', async t => {
  const page = await journey(t);
  const examples = page.enter('/exemples?forfait=connecte', 1);
  page.navigation.restorePlanScroll(examples);
  page.browser.scrollY = 1450;
  page.navigation.capturePlanPageScroll();
  page.navigation.rememberPlanPageScroll(examples);
  page.navigation.restorePlanScroll(page.enter('/faq', 2));
  const back = page.enter('/exemples?forfait=connecte', 1);
  assert.equal(page.navigation.getPlanBackHref(back, 'POP'), null);
  assert.equal(page.navigation.restorePlanScroll(back, undefined, 'POP'), true);
  assert.equal(page.browser.scrollY, 1450);
});

test('a shorter incoming DOM cannot replace the outgoing gallery scroll sample', async t => {
  const page = await journey(t);
  const examples = page.enter('/exemples', 1);
  page.navigation.restorePlanScroll(examples);
  page.browser.scrollY = 740;
  // Passive scroll or the navigation click samples the old, still-live page.
  page.navigation.capturePlanPageScroll();
  const faq = page.enter('/faq', 2);
  // React has mounted the shorter FAQ before the old layout cleanup runs.
  page.browser.scrollY = 367;
  page.navigation.capturePlanPageScroll();
  page.navigation.rememberPlanPageScroll(examples);
  page.navigation.restorePlanScroll(faq);
  const back = page.enter('/exemples', 1);
  assert.equal(page.navigation.restorePlanScroll(back, undefined, 'POP'), true);
  assert.equal(page.browser.scrollY, 740);
});

for (const parameter of ['projet', 'projectId']) {
  test(`Back from a private ${parameter} fiche preserves the portal route and scroll`, async t => {
    const page = await journey(t);
    const portal = page.enter('/espace', 1);
    page.navigation.restorePlanScroll(portal);
    page.browser.scrollY = 640;
    page.navigation.capturePlanPageScroll();
    page.navigation.rememberPlanPageScroll(portal);
    const privatePlan = page.enter(`/forfaits/connecte?${parameter}=private-project`, 2);
    page.navigation.restorePlanScroll(privatePlan);
    const back = page.enter('/espace', 1);
    assert.equal(page.navigation.getPlanBackHref(back, 'POP'), null);
    assert.equal(page.navigation.restorePlanScroll(back, undefined, 'POP'), true);
    assert.equal(page.browser.scrollY, 640);
    assert.equal(page.navigation.didRestorePlanScroll(back), false);
  });

  test(`a private ${parameter} destination is never replaced by a public offer return`, async t => {
    const page = await journey(t);
    const privatePlan = page.enter(`/forfaits/vitrine?${parameter}=private-project`, 1);
    page.navigation.restorePlanScroll(privatePlan);
    page.browser.scrollY = 420;
    page.navigation.capturePlanPageScroll();
    page.navigation.rememberPlanPageScroll(privatePlan);
    page.navigation.restorePlanScroll(page.enter('/forfaits/connecte', 2));
    const back = page.enter(`/forfaits/vitrine?${parameter}=private-project`, 1);
    assert.equal(page.navigation.getPlanBackHref(back, 'POP'), null);
    assert.equal(page.navigation.restorePlanScroll(back, undefined, 'POP'), true);
    assert.equal(page.browser.scrollY, 420);
  });

  test(`leaving a private ${parameter} fiche for home does not apply public-card recentering`, async t => {
    const page = await journey(t, { stacked: true });
    page.navigation.restorePlanScroll(page.enter(`/forfaits/connecte?${parameter}=private-project`, 1));
    const home = page.enter('/', 0);
    assert.equal(page.navigation.restorePlanScroll(home), false);
    assert.equal(page.browser.scrollY, 0);
    assert.equal(page.navigation.didRestorePlanScroll(home), false);
  });
}
