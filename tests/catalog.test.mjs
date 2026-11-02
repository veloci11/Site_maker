import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfiguration, quoteConfiguration, defaultPricing, EXTRA_OPTION_IDS, optionDefinitions, optionGroups, isOptionIncluded, isOptionSelected, withOption } from '../shared/catalog.ts';

test('included capabilities are normalized and are not charged twice', () => {
  const pricing = { ...defaultPricing, base: { vitrine: 10000, connecte: 20000, immersif: 30000, 'sur-mesure': null }, options: { ...defaultPricing.options, 'managed-content': 5000, 'scene-3d': 8000, 'language-en': 4000 } };
  const connected = quoteConfiguration(normalizeConfiguration({ offerId: 'connecte', language: 'fr' }), pricing);
  assert.equal(connected.totalCents, 20000);
  assert.equal(connected.lines.find(line => line.key === 'managed-content').included, true);
  const immersive = quoteConfiguration(normalizeConfiguration({ offerId: 'immersif', managedContent: true, language: 'fr-en' }), pricing);
  assert.equal(immersive.totalCents, 39000);
});
test('unpriced and custom configurations never enable checkout', () => {
  assert.equal(quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine' })).checkoutReady, false);
  const custom = quoteConfiguration(normalizeConfiguration({ offerId: 'sur-mesure' }));
  assert.equal(custom.requiresQuote, true); assert.equal(custom.totalCents, null);
});
test('unknown offers and wrongly typed options are rejected', () => {
  assert.throws(() => normalizeConfiguration({ offerId: 'unknown' }));
  assert.throws(() => normalizeConfiguration({ managedContent: 'false' }));
  assert.throws(() => normalizeConfiguration({ language: 'xx' }));
  assert.throws(() => normalizeConfiguration({ deployment: 'true' }));
  assert.throws(() => normalizeConfiguration({ maintenance: 1 }));
});

test('deployment is a single creation fee and maintenance is a separate optional monthly amount', () => {
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, connecte: 100000 }, options: { ...defaultPricing.options, 'managed-content': 30000, deployment: 20000, 'maintenance-monthly': 5000 } };
  const quote = quoteConfiguration(normalizeConfiguration({ offerId: 'connecte', deployment: true, maintenance: true }), pricing);
  assert.equal(quote.totalCents, 120000, 'creation includes deployment once and excludes maintenance');
  assert.equal(quote.monthlyTotalCents, 5000);
  assert.equal(quote.checkoutReady, true);
  assert.equal(quote.lines.find(line => line.key === 'managed-content').amountCents, 0, 'CMS already included');
  assert.equal(quote.lines.filter(line => line.key === 'deployment').length, 1);
  assert.equal(quote.lines.find(line => line.key === 'deployment').billing, 'once');
  assert.equal(quote.lines.find(line => line.key === 'maintenance-monthly').billing, 'monthly');
  const removed = quoteConfiguration(normalizeConfiguration({ offerId: 'connecte' }), pricing);
  assert.equal(removed.totalCents, 100000);
  assert.equal(removed.monthlyTotalCents, 0);
  assert.ok(removed.lines.every(line => line.billing === 'once'));
});

test('unknown maintenance price blocks checkout without hiding the known creation amount', () => {
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, vitrine: 100000 } };
  const selected = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine', maintenance: true }), pricing);
  assert.equal(selected.totalCents, 100000);
  assert.equal(selected.monthlyTotalCents, null);
  assert.equal(selected.checkoutReady, false);
  const unselected = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine' }), pricing);
  assert.equal(unselected.monthlyTotalCents, 0);
  assert.equal(unselected.checkoutReady, true);
  const unknownDeployment = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine', deployment: true }), pricing);
  assert.equal(unknownDeployment.totalCents, null);
  assert.equal(unknownDeployment.monthlyTotalCents, 0);
  assert.equal(unknownDeployment.checkoutReady, false);
});

test('older configuration inputs keep both new services unselected by default', () => {
  const legacy = normalizeConfiguration({ offerId: 'vitrine', language: 'fr', managedContent: false, scene3d: false });
  assert.equal(legacy.deployment, false);
  assert.equal(legacy.maintenance, false);
});

test('the public catalogue has one unknown price and one group per distinct option', () => {
  const ids = optionDefinitions.map(option => option.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(Object.keys(defaultPricing.options).sort(), [...ids].sort());
  assert.ok(Object.values(defaultPricing.base).every(value => value === null));
  assert.ok(Object.values(defaultPricing.options).every(value => value === null), 'test fixtures must never populate production prices');
  const groups = new Set(optionGroups.map(group => group.id));
  assert.ok(optionDefinitions.every(option => groups.has(option.group)));
  assert.ok(EXTRA_OPTION_IDS.every(id => ids.includes(id)), 'a selectable extra must have a catalogue entry');
});

test('Vitrine is desktop-only by default and mobile adaptation adds exactly its selected fee', () => {
  const base = normalizeConfiguration({ offerId: 'vitrine' });
  assert.equal(base.mobile, false); assert.deepEqual(base.extras, []);
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, vitrine: 100000 }, options: { ...defaultPricing.options, mobile: 15000 } };
  const desktop = quoteConfiguration(base, pricing);
  assert.equal(desktop.totalCents, 100000); assert.ok(!desktop.lines.some(line => line.key === 'mobile'));
  const selected = withOption(base, 'mobile', true);
  assert.equal(base.mobile, false, 'selection does not mutate the prior configuration');
  assert.equal(selected.mobile, true); assert.equal(isOptionIncluded(selected, 'mobile'), false); assert.equal(isOptionSelected(selected, 'mobile'), true);
  const adapted = quoteConfiguration(selected, pricing);
  assert.equal(adapted.totalCents, 115000);
  assert.equal(adapted.lines.filter(line => line.key === 'mobile').length, 1);
  assert.equal(adapted.lines.find(line => line.key === 'mobile').included, false);
  assert.equal(quoteConfiguration(withOption(selected, 'mobile', false), pricing).totalCents, 100000);
});

test('included mobile, CMS, user accounts and 3D stay selected and free despite unknown individual prices', () => {
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, connecte: 200000, immersif: 300000 } };
  const connected = normalizeConfiguration({ offerId: 'connecte', mobile: false, managedContent: false, extras: [] });
  assert.equal(connected.mobile, true); assert.equal(connected.managedContent, true); assert.deepEqual(connected.extras, ['user-accounts']);
  const connectedQuote = quoteConfiguration(connected, pricing);
  assert.equal(connectedQuote.totalCents, 200000); assert.equal(connectedQuote.checkoutReady, true);
  for (const id of ['mobile', 'managed-content', 'user-accounts']) {
    assert.equal(isOptionIncluded(connected, id), true, id); assert.equal(isOptionSelected(connected, id), true, id);
    const line = connectedQuote.lines.find(line => line.key === id);
    assert.equal(line.amountCents, 0, id); assert.equal(line.included, true, id);
    assert.equal(connectedQuote.lines.filter(line => line.key === id).length, 1, id);
    assert.equal(isOptionSelected(withOption(connected, id, false), id), true, id + ' cannot be removed from its package');
  }
  const immersive = normalizeConfiguration({ offerId: 'immersif', mobile: false, scene3d: false });
  assert.equal(immersive.mobile, true); assert.equal(immersive.scene3d, true);
  const immersiveQuote = quoteConfiguration(immersive, pricing);
  assert.equal(immersiveQuote.totalCents, 300000); assert.equal(immersiveQuote.checkoutReady, true);
  assert.equal(immersiveQuote.lines.find(line => line.key === 'scene-3d').amountCents, 0);
  assert.equal(isOptionSelected(withOption(immersive, 'scene-3d', false), 'scene-3d'), true);
});

test('extras use a stable catalogue order, deduplicate and preserve the input array', () => {
  const extras = Object.freeze(['blog', 'booking', 'blog', 'user-accounts']);
  const config = normalizeConfiguration(Object.freeze({ offerId: 'vitrine', extras }));
  assert.deepEqual(config.extras, ['user-accounts', 'booking', 'blog']);
  assert.deepEqual(extras, ['blog', 'booking', 'blog', 'user-accounts']);
  assert.deepEqual(normalizeConfiguration(config), config, 'normalization is idempotent');
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, vitrine: 100000 }, options: { ...defaultPricing.options, 'user-accounts': 25000, booking: 12000, blog: 9000 } };
  const quote = quoteConfiguration(config, pricing);
  assert.equal(quote.totalCents, 146000);
  assert.deepEqual(quote.lines.map(line => line.key), ['base', 'user-accounts', 'booking', 'blog']);
  assert.equal(new Set(quote.lines.map(line => line.key)).size, quote.lines.length);
});

test('malformed extras and wrongly typed mobile values cannot silently become valid options', () => {
  for (const extras of ['booking', null, {}, [1], ['unknown-option'], ['mobile'], ['managed-content']]) {
    assert.throws(() => normalizeConfiguration({ offerId: 'vitrine', extras }), JSON.stringify(extras));
  }
  for (const mobile of ['false', 1, null]) assert.throws(() => normalizeConfiguration({ mobile }));
  assert.throws(() => normalizeConfiguration({ extras: Array(EXTRA_OPTION_IDS.length + 1).fill('booking') }));
});

test('member roles add their account dependency and removing optional accounts removes those roles', () => {
  const base = normalizeConfiguration({ offerId: 'vitrine' });
  const roles = withOption(base, 'member-roles', true);
  assert.deepEqual(roles.extras, ['user-accounts', 'member-roles']);
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, vitrine: 100000 }, options: { ...defaultPricing.options, 'user-accounts': 25000, 'member-roles': 10000 } };
  assert.equal(quoteConfiguration(roles, pricing).totalCents, 135000);
  const removed = withOption(roles, 'user-accounts', false);
  assert.deepEqual(removed.extras, []); assert.equal(quoteConfiguration(removed, pricing).totalCents, 100000);
  assert.deepEqual(withOption(roles, 'member-roles', false).extras, ['user-accounts'], 'removing roles does not discard independently useful accounts');
});

test('a shop covers standalone catalogue and payment without double charging or unknown-price blocking', () => {
  const config = normalizeConfiguration({ offerId: 'vitrine', extras: ['product-catalog', 'online-payment', 'online-store', 'online-store'] });
  assert.deepEqual(config.extras, ['online-store']);
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, vitrine: 100000 }, options: { ...defaultPricing.options, 'online-store': 60000 } };
  const quote = quoteConfiguration(config, pricing);
  assert.equal(quote.totalCents, 160000); assert.equal(quote.checkoutReady, true);
  for (const id of ['product-catalog', 'online-payment']) {
    assert.equal(isOptionSelected(config, id), true); assert.equal(isOptionIncluded(config, id), true);
    assert.equal(quote.lines.find(line => line.key === id).amountCents, 0); assert.equal(quote.lines.find(line => line.key === id).included, true);
  }
  assert.deepEqual(withOption(config, 'product-catalog', true), config, 'selecting an included component is a no-op');
  const noShop = withOption(config, 'online-store', false);
  assert.ok(!isOptionSelected(noShop, 'product-catalog')); assert.ok(!isOptionSelected(noShop, 'online-payment'));
  assert.equal(quoteConfiguration(noShop, pricing).totalCents, 100000);
});

test('extended one-time features and recurring services use independent totals', () => {
  // Deliberate test-only amounts; defaultPricing remains untouched and unknown.
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, vitrine: 100000 }, options: { ...defaultPricing.options, mobile: 15000, booking: 12000, deployment: 20000, 'maintenance-monthly': 4000, 'hosting-monthly': 2000, 'backups-monthly': 1000 } };
  const config = normalizeConfiguration({ offerId: 'vitrine', mobile: true, deployment: true, maintenance: true, extras: ['booking', 'hosting-monthly', 'backups-monthly'] });
  const quote = quoteConfiguration(config, pricing);
  assert.equal(quote.totalCents, 147000); assert.equal(quote.monthlyTotalCents, 7000); assert.equal(quote.checkoutReady, true);
  assert.deepEqual(quote.lines.filter(line => line.billing === 'monthly').map(line => line.key), ['maintenance-monthly', 'hosting-monthly', 'backups-monthly']);
  assert.equal(quote.lines.find(line => line.key === 'booking').billing, 'once');
  assert.equal(defaultPricing.options.booking, null, 'the fixture never mutates public prices');
});

test('an unknown extra fee blocks only its own billing total and never becomes zero', () => {
  const pricing = { ...defaultPricing, base: { ...defaultPricing.base, vitrine: 100000 }, options: { ...defaultPricing.options, 'hosting-monthly': 2000 } };
  const onceUnknown = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine', extras: ['booking', 'hosting-monthly'] }), pricing);
  assert.equal(onceUnknown.totalCents, null); assert.equal(onceUnknown.monthlyTotalCents, 2000); assert.equal(onceUnknown.checkoutReady, false);
  const monthlyUnknown = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine', extras: ['hosting-monthly', 'backups-monthly'] }), pricing);
  assert.equal(monthlyUnknown.totalCents, 100000); assert.equal(monthlyUnknown.monthlyTotalCents, null); assert.equal(monthlyUnknown.checkoutReady, false);
  const absentServices = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine' }), pricing);
  assert.equal(absentServices.totalCents, 100000); assert.equal(absentServices.monthlyTotalCents, 0); assert.equal(absentServices.checkoutReady, true);
});
