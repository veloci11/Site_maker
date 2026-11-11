import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPricing, normalizeConfiguration, OFFER_IDS, optionDefinitions, quoteConfiguration } from '../shared/catalog.ts';
import { ApiError } from '../src/lib/api.ts';
import { formatPublicCreationEstimate, readCataloguePricing } from '../src/lib/pricing.ts';

const response = () => ({ pricing: structuredClone(defaultPricing) });
const invalid = value => assert.throws(() => readCataloguePricing(value), error =>
  error instanceof ApiError && error.code === 'INVALID_CATALOGUE');

test('the public configurator estimates creation at the midpoint of each priced range', () => {
  const estimate = (offerId, extras) => quoteConfiguration(normalizeConfiguration({ offerId, extras }));
  const bounded = estimate('vitrine', ['booking', 'blog']);
  assert.match(formatPublicCreationEstimate(bounded), /^Environ 1\s175\s€$/);
  assert.equal(bounded.totalCents, 113000);
  assert.equal(bounded.maximumTotalCents, 122000);

  const fixed = estimate('vitrine', ['blog']);
  assert.match(formatPublicCreationEstimate(fixed), /^Environ 1\s040\s€$/);

  const mixed = estimate('immersif', ['extra-scene-3d', 'custom-3d', 'hosting-monthly']);
  assert.match(formatPublicCreationEstimate(mixed), /^Environ 3\s065\s€$/);
  assert.equal(mixed.maximumTotalCents, null);

  const pages = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine', extras: ['extra-pages'], extraPageCount: 3 }));
  assert.match(formatPublicCreationEstimate(pages), /^Environ 1\s160\s€$/);

  const monthly = estimate('immersif', ['hosting-monthly']);
  assert.match(formatPublicCreationEstimate(monthly), /^Environ 2\s490\s€$/);
  assert.equal(monthly.monthlyTotalCents, 1900);

  assert.match(formatPublicCreationEstimate(estimate('immersif', [])), /^À partir de 2\s490\s€$/);
  assert.match(formatPublicCreationEstimate(estimate('sur-mesure', [])), /^Sur devis$/);
});

test('a complete approved catalogue and server-supported currencies remain valid', () => {
  for (const currency of ['EUR', 'CHF']) {
    const source = response();
    source.pricing.currency = currency;
    source.pricing.base.vitrine = 0;
    source.pricing.options.mobile = 12345;
    assert.deepEqual(readCataloguePricing(source), source.pricing);
  }
});

test('null, missing and malformed JSON containers are rejected before the UI uses prices', () => {
  for (const value of [null, undefined, [], {}, { pricing: null }, { pricing: [] }, { pricing: {} },
    { pricing: { ...defaultPricing, base: [] } }, { pricing: { ...defaultPricing, options: [] } }]) invalid(value);
});

test('every current offer and option must have an explicit amount or null', () => {
  for (const id of OFFER_IDS) {
    const source = response();
    delete source.pricing.base[id];
    invalid(source);
  }
  for (const { id } of optionDefinitions) {
    const source = response();
    delete source.pricing.options[id];
    invalid(source);
  }
});

test('amounts cannot be coerced, fractional, negative, infinite or above the server limit', () => {
  for (const value of ['100', undefined, true, {}, -1, .5, Infinity, NaN, 1_000_000_001]) {
    const source = response();
    source.pricing.base.vitrine = value;
    invalid(source);
    source.pricing.base.vitrine = null;
    source.pricing.options.mobile = value;
    invalid(source);
  }
  const source = response();
  source.pricing.options.mobile = 1_000_000_000;
  assert.equal(readCataloguePricing(source).options.mobile, 1_000_000_000);
});

test('version, currency and the quote-only offer remain part of the catalogue contract', () => {
  for (const version of [undefined, null, '', '   ', 1]) invalid({ pricing: { ...defaultPricing, version } });
  for (const currency of [undefined, null, '', 'eur', 'US Dollars', 'USD']) invalid({ pricing: { ...defaultPricing, currency } });
  const source = response();
  source.pricing.base['sur-mesure'] = 100;
  invalid(source);
});

test('validated values are copied and unknown future keys do not become billable choices', () => {
  const source = response();
  source.pricing.options.unknown = 500;
  const pricing = readCataloguePricing(source);
  assert.notEqual(pricing, source.pricing);
  assert.notEqual(pricing.base, source.pricing.base);
  assert.notEqual(pricing.options, source.pricing.options);
  assert.deepEqual(Object.keys(pricing.options), optionDefinitions.map(option => option.id));
  pricing.options.mobile = 200;
  assert.equal(source.pricing.options.mobile, null);
});
