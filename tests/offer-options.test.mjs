import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFER_IDS,
  defaultPricing,
  isOptionIncluded,
  isOptionSelected,
  normalizeConfiguration,
  optionDefinitions,
  quoteConfiguration,
  withOption,
} from '../shared/catalog.ts';
import {
  PUBLIC_OPTIONS_BY_OFFER,
  getPublicOptions,
  getUnavailableOptions,
  prunePublicConfiguration,
} from '../shared/offer-options.ts';

const publicIds = (offerId) => getPublicOptions(offerId).map(option => option.id);

test('each offer has a targeted optional menu in the existing catalogue order', () => {
  const expectedCounts = { vitrine: 14, connecte: 17, immersif: 14, 'sur-mesure': 14 };
  for (const offerId of OFFER_IDS) {
    const choices = getPublicOptions(offerId);
    const ids = choices.map(option => option.id);
    assert.equal(choices.length, expectedCounts[offerId], offerId);
    assert.equal(new Set(ids).size, choices.length, offerId);
    assert.deepEqual(ids, optionDefinitions.filter(option => ids.includes(option.id)).map(option => option.id));
    assert.ok(choices.every(option => optionDefinitions.includes(option)), 'definitions and prices have one source');
    assert.ok(choices.every(option => !isOptionIncluded(normalizeConfiguration({ offerId }), option.id)));
    assert.deepEqual(ids, [...PUBLIC_OPTIONS_BY_OFFER[offerId]]);
  }
  assert.notDeepEqual(publicIds('vitrine'), publicIds('connecte'));
  assert.notDeepEqual(publicIds('immersif'), publicIds('sur-mesure'));
});

test('Vitrine keeps mobile optional and directs account and 3D needs to the other offers', () => {
  const ids = publicIds('vitrine');
  assert.ok(ids.includes('mobile'));
  assert.ok(ids.includes('managed-content'), 'the editable-content addition promised by the FAQ stays available');
  for (const id of ['user-accounts', 'member-roles', 'scene-3d', 'custom-3d', 'online-store']) {
    assert.ok(!ids.includes(id), id);
  }
  const base = prunePublicConfiguration({ offerId: 'vitrine' });
  assert.equal(base.mobile, false);
  assert.equal(isOptionIncluded(base, 'mobile'), false);
  assert.equal(prunePublicConfiguration(withOption(base, 'mobile', true)).mobile, true);
});

test('shared visitor needs survive offer changes without exposing historical-only options', () => {
  for (const offerId of OFFER_IDS) {
    const ids = publicIds(offerId);
    for (const id of ['analytics', 'newsletter', 'additional-language', 'local-seo']) {
      assert.ok(ids.includes(id), `${offerId}/${id}`);
      const selected = prunePublicConfiguration({ offerId, extras: [id] });
      assert.equal(isOptionSelected(selected, id), true);
      assert.deepEqual(getUnavailableOptions(selected), []);
    }
    for (const id of ['content-import', 'backups-monthly']) assert.ok(!ids.includes(id));
  }
  assert.ok(publicIds('connecte').includes('portfolio-gallery'));
  const source = prunePublicConfiguration({ offerId: 'vitrine', extras: ['analytics', 'newsletter', 'additional-language', 'local-seo', 'portfolio-gallery'] });
  const connected = prunePublicConfiguration({ ...source, offerId: 'connecte' });
  for (const id of source.extras) assert.equal(isOptionSelected(connected, id), true, id);
  assert.equal(isOptionIncluded(connected, 'managed-content'), true);
});

test('included Connecté and Immersif functions remain selected without appearing as paid choices', () => {
  for (const [offerId, included] of [
    ['connecte', ['mobile', 'managed-content', 'user-accounts']],
    ['immersif', ['mobile', 'scene-3d']],
  ]) {
    const configuration = prunePublicConfiguration({ offerId });
    assert.deepEqual(getUnavailableOptions(configuration), []);
    for (const id of included) {
      assert.ok(!publicIds(offerId).includes(id), id);
      assert.equal(isOptionIncluded(configuration, id), true);
      assert.equal(isOptionSelected(configuration, id), true);
    }
  }
  assert.ok(publicIds('immersif').includes('custom-3d'), 'creating a model is distinct from integrating a supplied one');
  assert.ok(publicIds('immersif').includes('managed-content'));
  assert.ok(publicIds('sur-mesure').includes('managed-content'));
});

test('deployment, maintenance and hosting stay independent optional choices on every offer', () => {
  for (const offerId of OFFER_IDS) {
    const ids = publicIds(offerId);
    for (const id of ['deployment', 'maintenance-monthly', 'hosting-monthly']) assert.ok(ids.includes(id));
    assert.ok(!ids.includes('backups-monthly'));
    const base = prunePublicConfiguration({ offerId });
    assert.equal(base.deployment, false);
    assert.equal(base.maintenance, false);
    assert.ok(!base.extras.includes('hosting-monthly'));
    const hosted = prunePublicConfiguration(withOption(base, 'hosting-monthly', true));
    assert.equal(hosted.deployment, false);
    assert.equal(hosted.maintenance, false);
    assert.ok(hosted.extras.includes('hosting-monthly'));
  }
});

test('server validation identifies unsupported paid selections without changing the configuration', () => {
  const configuration = normalizeConfiguration({
    offerId: 'vitrine', mobile: true, scene3d: true,
    extras: ['member-roles', 'booking', 'custom-3d', 'backups-monthly'],
  });
  const snapshot = structuredClone(configuration);
  assert.deepEqual(getUnavailableOptions(configuration), [
    'scene-3d', 'user-accounts', 'member-roles', 'custom-3d', 'backups-monthly',
  ]);
  assert.deepEqual(configuration, snapshot);
});

test('pruning removes only incompatible choices and keeps launch services and compatible options', () => {
  const input = Object.freeze({
    offerId: 'vitrine', language: 'fr-en', mobile: true, managedContent: true,
    scene3d: true, deployment: true, maintenance: true,
    extras: Object.freeze(['member-roles', 'booking', 'portfolio-gallery', 'custom-3d', 'hosting-monthly', 'backups-monthly']),
  });
  const configuration = prunePublicConfiguration(input);
  assert.deepEqual(configuration, {
    offerId: 'vitrine', language: 'fr-en', mobile: true, managedContent: true,
    scene3d: false, deployment: true, maintenance: true,
    extras: ['booking', 'portfolio-gallery', 'hosting-monthly'],
  });
  assert.deepEqual(getUnavailableOptions(configuration), []);
  assert.deepEqual(prunePublicConfiguration(configuration), configuration);
  assert.equal(input.scene3d, true);
  assert.ok(input.extras.includes('backups-monthly'));
});

test('changing offer prunes accounts and roles while preserving compatible selections', () => {
  const connected = prunePublicConfiguration({
    offerId: 'connecte', language: 'fr-en',
    extras: ['member-roles', 'booking', 'blog', 'hosting-monthly'],
  });
  assert.deepEqual(connected.extras, ['user-accounts', 'member-roles', 'booking', 'blog', 'hosting-monthly']);
  const vitrine = prunePublicConfiguration({ ...connected, offerId: 'vitrine' });
  assert.deepEqual(vitrine.extras, ['booking', 'hosting-monthly']);
  assert.equal(vitrine.mobile, true);
  assert.equal(vitrine.managedContent, true);
  assert.equal(vitrine.language, 'fr-en');
  assert.ok(connected.extras.includes('member-roles'), 'the source draft is not modified');
});

test('roles are only offered where their account dependency is available', () => {
  for (const offerId of OFFER_IDS) {
    if (!publicIds(offerId).includes('member-roles')) continue;
    const base = prunePublicConfiguration({ offerId });
    assert.ok(isOptionIncluded(base, 'user-accounts') || publicIds(offerId).includes('user-accounts'));
    const roles = prunePublicConfiguration(withOption(base, 'member-roles', true));
    assert.equal(isOptionSelected(roles, 'user-accounts'), true);
    assert.equal(isOptionSelected(roles, 'member-roles'), true);
    assert.deepEqual(getUnavailableOptions(roles), []);
  }
});

test('a public shop includes catalogue and payment without unavailable errors or double charges', () => {
  const pricing = {
    ...defaultPricing,
    base: { ...defaultPricing.base, connecte: 100000 },
    options: { ...defaultPricing.options, 'online-store': 60000 },
  };
  const configuration = prunePublicConfiguration({
    offerId: 'connecte', extras: ['online-store', 'product-catalog', 'online-payment'],
  });
  assert.ok(!publicIds('connecte').includes('product-catalog'));
  assert.ok(!publicIds('connecte').includes('online-payment'));
  assert.deepEqual(getUnavailableOptions(configuration), []);
  assert.deepEqual(configuration.extras, ['user-accounts', 'online-store']);
  const quote = quoteConfiguration(configuration, pricing);
  assert.equal(quote.totalCents, 160000);
  for (const id of ['product-catalog', 'online-payment']) {
    assert.equal(quote.lines.find(line => line.key === id).amountCents, 0);
    assert.equal(quote.lines.find(line => line.key === id).included, true);
  }
});

test('public pruning does not replace validation of malformed configurations', () => {
  for (const input of [
    { offerId: 'unknown' },
    { offerId: 'vitrine', mobile: 'true' },
    { offerId: 'connecte', extras: ['unknown-option'] },
  ]) assert.throws(() => prunePublicConfiguration(input));
});

test('historical catalogue definitions and pricing still support options removed from public menus', () => {
  assert.equal(optionDefinitions.length, 26);
  assert.equal(Object.keys(defaultPricing.options).length, 26);
  assert.ok(Object.values(defaultPricing.options).every(price => price === null));
  const legacy = normalizeConfiguration({
    offerId: 'vitrine', scene3d: true,
    extras: ['user-accounts', 'backups-monthly'],
  });
  const snapshot = structuredClone(legacy);
  const pricing = {
    ...defaultPricing,
    base: { ...defaultPricing.base, vitrine: 100000 },
    options: { ...defaultPricing.options, 'scene-3d': 20000, 'user-accounts': 15000, 'backups-monthly': 1000 },
  };
  const quote = quoteConfiguration(legacy, pricing);
  assert.equal(quote.totalCents, 135000);
  assert.equal(quote.monthlyTotalCents, 1000);
  assert.deepEqual(quote.lines.map(line => line.key), ['base', 'scene-3d', 'user-accounts', 'backups-monthly']);
  getUnavailableOptions(legacy);
  getPublicOptions('vitrine');
  assert.deepEqual(legacy, snapshot, 'existing private configurations are never rewritten by the public helpers');
  assert.deepEqual(quoteConfiguration(legacy, pricing), quote);
});
