import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfiguration, quoteConfiguration, defaultPricing } from '../shared/catalog.ts';

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
