import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeConfiguration, quoteConfiguration, defaultPricing, EXTRA_OPTION_IDS,
  offers, publicOffers, examples, faqs, optionDefinitions, optionGroups, isOptionIncluded,
  isOptionSelected, withOption, formatOptionPrice, formatQuoteTotal, formatQuoteLine, getOffer, MONTHLY_PLAN_IDS,
  withExtraPageCount, MAX_EXTRA_PAGE_COUNT, getOptionScope,
} from '../shared/catalog.ts';

const billable = quote => quote.lines.filter(line => !line.included);

test('three public offers have approved names, prices and matching gallery references', () => {
  assert.deepEqual(publicOffers.map(offer => offer.title), ['Vitrine', 'Business', 'Premium / 3D']);
  assert.deepEqual(publicOffers.map(offer => defaultPricing.base[offer.id]), [89000, 149000, 249900]);
  for (const offer of publicOffers) {
    const example = examples.find(item => item.id === offer.exampleId);
    assert.ok(example, offer.id);
    assert.equal(example.offerId, offer.id);
  }
  assert.ok(!examples.some(example => example.id === 'cal-com'));
  assert.ok(examples.every(example => publicOffers.some(offer => offer.id === example.offerId && offer.title === example.category)));
  assert.equal(offers.length, 4, 'private historical offer is retained');
  assert.equal(getOffer('sur-mesure').title, 'Sur mesure');
});

test('every public base includes responsive and launch without charging them again', () => {
  for (const offer of publicOffers) {
    const config = normalizeConfiguration({ offerId: offer.id, mobile: false, deployment: false });
    assert.equal(config.mobile, true);
    assert.equal(config.deployment, true);
    const quote = quoteConfiguration(config);
    assert.equal(quote.totalCents, defaultPricing.base[offer.id]);
    assert.equal(quote.monthlyTotalCents, 0);
    assert.equal(quote.estimated, true);
    assert.equal(quote.checkoutReady, false);
    for (const id of ['mobile', 'deployment']) {
      assert.equal(isOptionIncluded(config, id), true);
      assert.equal(quote.lines.find(line => line.key === id).amountCents, 0);
      assert.equal(isOptionSelected(withOption(config, id, false), id), true);
    }
  }
});

test('Business includes its professional functions while accounts remain a paid addition', () => {
  const config = normalizeConfiguration({ offerId: 'connecte' });
  for (const id of ['managed-content', 'portfolio-gallery', 'local-seo', 'analytics']) {
    assert.equal(isOptionIncluded(config, id), true, id);
    assert.equal(isOptionSelected(config, id), true, id);
    assert.equal(quoteConfiguration(config).lines.find(line => line.key === id).amountCents, 0);
  }
  assert.equal(isOptionSelected(config, 'user-accounts'), false);
  assert.equal(isOptionIncluded(config, 'user-accounts'), false);
  const accounts = quoteConfiguration(withOption(config, 'user-accounts', true));
  assert.equal(accounts.totalCents, 179000);
  assert.equal(accounts.estimated, true);
  assert.equal(accounts.requiresQuote, true);
  assert.equal(accounts.checkoutReady, false);
});

test('Premium distinguishes included integration, extra integration and model creation', () => {
  const base = normalizeConfiguration({ offerId: 'immersif' });
  assert.equal(isOptionIncluded(base, 'scene-3d'), true);
  assert.equal(isOptionIncluded(base, 'managed-content'), true);
  const extra = quoteConfiguration(withOption(base, 'extra-scene-3d', true));
  assert.equal(extra.totalCents, 274900);
  assert.equal(extra.lines.find(line => line.key === 'scene-3d').amountCents, 0);
  assert.equal(extra.lines.find(line => line.key === 'extra-scene-3d').amountCents, 25000);
  const model = quoteConfiguration(withOption(base, 'custom-3d', true));
  assert.equal(model.totalCents, 264900);
  assert.equal(model.lines.some(line => line.key === 'extra-scene-3d'), false, 'creating a model does not silently add another paid integration');
});

test('approved fixed additions and scoped ranges are explicitly displayed', () => {
  assert.match(formatOptionPrice('additional-language'), /^100\s€/);
  assert.equal(optionDefinitions.find(option => option.id === 'additional-language').title, 'Langue supplémentaire');
  assert.match(formatOptionPrice('extra-pages'), /60\s€–120\s€/);
  assert.match(formatOptionPrice('extra-scene-3d'), /250\s€–600\s€/);
  assert.match(formatOptionPrice('custom-3d'), /À partir de 150\s€/);
  assert.match(formatOptionPrice('newsletter'), /À partir de 90\s€/);
  assert.match(formatOptionPrice('hosting-monthly'), /19\s€ \/ mois/);
  const unknown = { ...defaultPricing, options: { ...defaultPricing.options, 'language-en': null } };
  assert.equal(formatOptionPrice('language-en', unknown), 'Sur devis');
  const changed = { ...defaultPricing, options: { ...defaultPricing.options, 'extra-pages': 9000 } };
  assert.match(formatOptionPrice('extra-pages', changed), /À partir de 90\s€/);
});

test('monthly plans replace each other in both directions and keep creation independent', () => {
  let config = normalizeConfiguration({ offerId: 'vitrine', language: 'fr-en' });
  for (const id of [...MONTHLY_PLAN_IDS, ...MONTHLY_PLAN_IDS.toReversed()]) {
    const previous = config;
    const before = structuredClone(previous);
    config = withOption(previous, id, true);
    assert.equal(MONTHLY_PLAN_IDS.filter(candidate => isOptionSelected(config, candidate)).length, 1);
    const quote = quoteConfiguration(config);
    assert.equal(quote.totalCents, 99000);
    assert.equal(quote.monthlyTotalCents, defaultPricing.options[id]);
    assert.equal(billable(quote).filter(line => line.billing === 'monthly').length, 1);
    assert.deepEqual(previous, before, 'selection does not mutate the prior configuration');
  }
  config = withOption(config, 'hosting-monthly', false);
  assert.equal(quoteConfiguration(config).monthlyTotalCents, 0);
});

test('malformed overlapping monthly selections normalize to the highest plan exactly once', () => {
  const input = Object.freeze({ offerId: 'vitrine', maintenance: true, extras: Object.freeze(['hosting-monthly', 'serenity-monthly']) });
  const config = normalizeConfiguration(input);
  assert.equal(config.maintenance, false);
  assert.deepEqual(config.extras, ['serenity-monthly']);
  assert.equal(quoteConfiguration(config).monthlyTotalCents, 6900);
  assert.deepEqual(input.extras, ['hosting-monthly', 'serenity-monthly']);
  assert.deepEqual(normalizeConfiguration(config), config);
});

test('a shop includes standalone catalogue and payment without double charging', () => {
  const config = normalizeConfiguration({ offerId: 'vitrine', extras: ['online-payment', 'product-catalog', 'online-store'] });
  assert.deepEqual(config.extras, ['online-store']);
  const quote = quoteConfiguration(config);
  assert.equal(quote.totalCents, 149000);
  assert.equal(quote.estimated, true);
  for (const id of ['online-payment', 'product-catalog']) {
    assert.equal(isOptionIncluded(config, id), true);
    assert.equal(quote.lines.find(line => line.key === id).amountCents, 0);
  }
  assert.equal(quoteConfiguration(withOption(config, 'online-store', false)).totalCents, 89000);
});

test('blog has its own editor and does not silently add a general CMS fee', () => {
  const config = withOption(normalizeConfiguration({ offerId: 'vitrine' }), 'blog', true);
  assert.equal(config.managedContent, false);
  assert.equal(quoteConfiguration(config).totalCents, 104000);
  assert.equal(quoteConfiguration(withOption(config, 'managed-content', true)).totalCents, 134000);
});

test('unknown prices do not become free and only hide their own billing total', () => {
  const pricing = { ...defaultPricing, options: { ...defaultPricing.options, 'language-en': null, 'hosting-monthly': null } };
  const once = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine', language: 'fr-en' }), pricing);
  assert.equal(once.totalCents, null);
  assert.equal(once.monthlyTotalCents, 0);
  assert.equal(once.checkoutReady, false);
  const monthly = quoteConfiguration(normalizeConfiguration({ offerId: 'vitrine', extras: ['hosting-monthly'] }), pricing);
  assert.equal(monthly.totalCents, 89000);
  assert.equal(monthly.monthlyTotalCents, null);
  assert.equal(monthly.checkoutReady, false);
  const custom = quoteConfiguration(normalizeConfiguration({ offerId: 'sur-mesure' }));
  assert.equal(custom.totalCents, null);
  assert.equal(custom.requiresQuote, true);
});

test('catalogue identifiers stay unique and historical additions remain readable', () => {
  const ids = optionDefinitions.map(option => option.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(Object.keys(defaultPricing.options).sort(), [...ids].sort());
  assert.ok(EXTRA_OPTION_IDS.every(id => ids.includes(id)));
  assert.ok(optionDefinitions.every(option => optionGroups.some(group => group.id === option.group)));
  const config = normalizeConfiguration({ offerId: 'sur-mesure', extras: ['member-roles', 'backups-monthly'] });
  assert.deepEqual(config.extras, ['user-accounts', 'member-roles', 'backups-monthly']);
  assert.equal(isOptionSelected(config, 'backups-monthly'), true);
});

test('malformed and unknown configuration inputs are rejected', () => {
  for (const value of [
    { offerId: 'unknown' }, { mobile: 'false' }, { managedContent: null },
    { deployment: 'true' }, { maintenance: 1 }, { language: 'xx' },
    { extras: null }, { extras: ['unknown'] }, { extras: [1] },
    { extras: Array(EXTRA_OPTION_IDS.length + 1).fill('blog') },
  ]) assert.throws(() => normalizeConfiguration(value));
});

test('creation totals aggregate approved lower and upper bounds while monthly fees remain separate', () => {
  const quote = quoteConfiguration(normalizeConfiguration({
    offerId: 'vitrine',
    extras: ['additional-language', 'user-accounts', 'extra-pages', 'content-import', 'hosting-monthly'],
  }));
  assert.equal(quote.totalCents, 145000);
  assert.equal(quote.maximumTotalCents, 196000);
  assert.equal(quote.monthlyTotalCents, 1900);
  assert.match(formatQuoteTotal(quote), /^1\s450\s€–1\s960\s€$/);
  const accounts = quote.lines.find(line => line.key === 'user-accounts');
  assert.equal(accounts.amountCents, 30000);
  assert.equal(accounts.maximumCents, 60000);
  assert.equal(accounts.estimated, true);
  assert.match(formatQuoteLine(accounts), /^300\s€–600\s€$/);
  assert.equal(quote.checkoutReady, false);
  assert.equal(quote.requiresQuote, true);
});

test('one option without a ceiling keeps a minimum total instead of inventing a maximum', () => {
  const quote = quoteConfiguration(normalizeConfiguration({
    offerId: 'vitrine', extras: ['user-accounts', 'newsletter', 'serenity-monthly'],
  }));
  assert.equal(quote.totalCents, 128000);
  assert.equal(quote.maximumTotalCents, null);
  assert.equal(quote.monthlyTotalCents, 6900);
  assert.match(formatQuoteTotal(quote), /^À partir de 1\s280\s€$/);
  assert.match(formatQuoteLine(quote.lines.find(line => line.key === 'newsletter')), /^À partir de 90\s€$/);
});

test('included additions and fixed-price bases do not create artificial ranges', () => {
  const quote = quoteConfiguration(normalizeConfiguration({ offerId: 'connecte', extras: ['analytics', 'blog'] }));
  assert.equal(quote.totalCents, 164000);
  assert.equal(quote.maximumTotalCents, 164000);
  assert.equal(quote.estimated, true);
  assert.match(formatQuoteTotal(quote), /^À partir de 1\s640\s€$/);
  assert.equal(quote.lines.find(line => line.key === 'analytics').maximumCents, 0);
});

test('admin prices and other currencies do not inherit unrelated published EUR upper bounds', () => {
  const config = normalizeConfiguration({ offerId: 'vitrine', extras: ['user-accounts'] });
  for (const pricing of [
    { ...defaultPricing, currency: 'CHF' },
    { ...defaultPricing, options: { ...defaultPricing.options, 'user-accounts': 40000 } },
  ]) {
    const quote = quoteConfiguration(config, pricing);
    assert.equal(quote.maximumTotalCents, null);
    assert.match(formatQuoteTotal(quote), /^À partir de /);
  }
  const unknown = quoteConfiguration(config, { ...defaultPricing, options: { ...defaultPricing.options, 'user-accounts': null } });
  assert.equal(unknown.totalCents, null);
  assert.equal(unknown.maximumTotalCents, null);
  assert.equal(formatQuoteTotal(unknown), 'Sur devis');
});

test('legacy quote formatting reads saved amounts without reconstructing or mutating bounds', () => {
  const fixed = { currency: 'EUR', totalCents: 123400, lines: [{ amountCents: 30000 }] };
  const minimum = { ...fixed, estimated: true };
  const snapshot = structuredClone(minimum);
  assert.match(formatQuoteTotal(fixed), /^1\s234\s€$/);
  assert.match(formatQuoteTotal(minimum), /^À partir de 1\s234\s€$/);
  assert.match(formatQuoteLine(fixed.lines[0]), /^300\s€$/);
  assert.deepEqual(minimum, snapshot);
  assert.equal(Object.hasOwn(minimum, 'maximumTotalCents'), false);
  assert.equal(formatQuoteTotal({ currency: 'EUR', totalCents: null, requiresQuote: true }), 'Sur devis');
});

test('Premium includes every Business capability and adds its visual experience at the approved price', () => {
  const business = normalizeConfiguration({ offerId: 'connecte' });
  const premium = normalizeConfiguration({ offerId: 'immersif', extras: ['analytics'] });
  for (const option of optionDefinitions) {
    if (isOptionIncluded(business, option.id)) {
      assert.equal(isOptionIncluded(premium, option.id), true, option.id);
      assert.equal(isOptionSelected(premium, option.id), true, option.id);
    }
  }
  const quote = quoteConfiguration(premium);
  assert.equal(quote.totalCents, 249900);
  assert.equal(quote.maximumTotalCents, 249900);
  assert.equal(quote.estimated, true);
  for (const id of ['managed-content', 'portfolio-gallery', 'local-seo', 'analytics', 'scene-3d', 'content-import']) {
    const line = quote.lines.find(line => line.key === id);
    assert.equal(line.included, true, id);
    assert.equal(line.amountCents, 0, id);
  }
  assert.match(quote.lines.find(line => line.key === 'content-import').scope, /5 pages et 15 médias/);
  assert.match(getOffer('immersif').features.join(' '), /Tout le forfait Business inclus.*10 pages/);
});

test('booking and historical advanced forms are not included in any new public base', () => {
  for (const offer of publicOffers) {
    const config = normalizeConfiguration({ offerId: offer.id });
    for (const id of ['booking', 'advanced-forms']) {
      assert.equal(isOptionIncluded(config, id), false);
      assert.equal(isOptionSelected(config, id), false);
      assert.ok(optionDefinitions.some(option => option.id === id));
    }
  }
  const text = JSON.stringify({ offers: publicOffers, faqs });
  assert.doesNotMatch(text, /template|Doctolib|formulaire avancé|offre principale|direction artistique/i);
  assert.ok(faqs.some(faq => faq.question === 'Qu’apporte Premium / 3D par rapport à Business ?'));
});

test('booking is an optional 90–180 euro integration on all three offers', () => {
  const booking = optionDefinitions.find(option => option.id === 'booking');
  assert.equal(booking.title, 'Prise de rendez-vous en ligne');
  assert.doesNotMatch(booking.description, /Doctolib/i);
  assert.match(formatOptionPrice('booking'), /^90\s€–180\s€$/);
  for (const offer of publicOffers) {
    const base = normalizeConfiguration({ offerId: offer.id, maintenance: true });
    const selected = withOption(base, 'booking', true);
    const quote = quoteConfiguration(selected);
    const line = quote.lines.find(line => line.key === 'booking');
    assert.equal(line.included, false);
    assert.equal(line.amountCents, 9000);
    assert.equal(line.maximumCents, 18000);
    assert.equal(line.estimated, true);
    assert.equal(quote.totalCents, defaultPricing.base[offer.id] + 9000);
    assert.equal(quote.maximumTotalCents, defaultPricing.base[offer.id] + 18000);
    assert.equal(quote.monthlyTotalCents, 3900);
    assert.equal(quote.requiresQuote, true);
    assert.equal(quote.checkoutReady, false);
    assert.deepEqual(withOption(selected, 'booking', false), base);
  }
});

test('extra pages multiply both approved bounds and keep legacy selections equivalent to one page', () => {
  for (const offer of publicOffers) {
    const legacy = normalizeConfiguration({ offerId: offer.id, extras: ['extra-pages', 'hosting-monthly'] });
    assert.deepEqual(normalizeConfiguration({ ...legacy, extraPageCount: 1 }), legacy);
    const selected = withExtraPageCount(legacy, 3);
    const quote = quoteConfiguration(selected);
    const line = quote.lines.find(line => line.key === 'extra-pages');
    assert.equal(line.quantity, 3);
    assert.equal(line.amountCents, 18000);
    assert.equal(line.maximumCents, 36000);
    assert.match(line.label, /3 pages/);
    assert.equal(quote.totalCents, defaultPricing.base[offer.id] + 18000);
    assert.equal(quote.maximumTotalCents, defaultPricing.base[offer.id] + 36000);
    assert.equal(quote.monthlyTotalCents, 1900);
    assert.deepEqual(normalizeConfiguration(selected), selected);
    const removed = withOption(selected, 'extra-pages', false);
    assert.equal(removed.extraPageCount, undefined);
    assert.equal(quoteConfiguration(removed).totalCents, defaultPricing.base[offer.id]);
    assert.equal(quoteConfiguration(withOption(removed, 'extra-pages', true)).lines.find(line => line.key === 'extra-pages').quantity, 1);
  }
});

test('page quantities are validated without coercion and use server pricing rather than the published minimum', () => {
  for (const extraPageCount of [0, -1, 1.5, '3', null, Infinity, NaN, MAX_EXTRA_PAGE_COUNT + 1]) {
    assert.throws(() => normalizeConfiguration({ offerId: 'vitrine', extras: ['extra-pages'], extraPageCount }));
  }
  assert.equal(normalizeConfiguration({ offerId: 'vitrine', extraPageCount: 3 }).extraPageCount, undefined, 'quantity alone cannot silently select a paid option');
  const config = withExtraPageCount(normalizeConfiguration({ offerId: 'vitrine' }), 3);
  const changed = quoteConfiguration(config, { ...defaultPricing, options: { ...defaultPricing.options, 'extra-pages': 9000 } });
  assert.equal(changed.totalCents, 116000);
  assert.equal(changed.maximumTotalCents, null, 'a changed unit tariff has no invented upper bound');
  const unknown = quoteConfiguration(config, { ...defaultPricing, options: { ...defaultPricing.options, 'extra-pages': null } });
  assert.equal(unknown.totalCents, null);
  assert.equal(unknown.lines.find(line => line.key === 'extra-pages').amountCents, null);
});

test('capped language, CMS and import lots never expand or multiply with page quantities', () => {
  const config = withExtraPageCount(normalizeConfiguration({ offerId: 'vitrine', managedContent: true, extras: ['additional-language', 'content-import'] }), 5);
  const quote = quoteConfiguration(config);
  assert.equal(quote.totalCents, 169000);
  assert.equal(quote.maximumTotalCents, 214000);
  for (const [id, minimum, maximum] of [['additional-language', 10000, 10000], ['managed-content', 30000, 30000], ['content-import', 10000, 25000]]) {
    const line = quote.lines.find(line => line.key === id);
    assert.equal(line.amountCents, minimum);
    assert.equal(line.maximumCents, maximum);
    assert.equal(line.quantity, undefined);
    assert.match(line.scope, /5 pages/);
    assert.match(line.scope, /devis complémentaire/);
  }
  assert.match(getOptionScope(config, 'content-import'), /15 médias/);
  assert.doesNotMatch(getOptionScope(config, 'additional-language'), /devis complémentaire/, 'cards receive the compact scope');
  for (const offerId of ['connecte', 'immersif']) {
    const base = normalizeConfiguration({ offerId });
    assert.equal(getOptionScope(base, 'managed-content'), null);
    const addedPages = withExtraPageCount(withOption(base, 'additional-language', true), 2);
    const { lines } = quoteConfiguration(addedPages);
    const cms = lines.find(line => line.key === 'managed-content');
    assert.equal(cms.included, true);
    assert.equal(cms.amountCents, 0);
    assert.doesNotMatch(cms.scope, /5 pages/);
    assert.match(cms.scope, /pages supplémentaires.*à confirmer/);
    const language = lines.find(line => line.key === 'additional-language');
    assert.equal(language.amountCents, 10000);
    assert.match(language.scope, /jusqu’à 6 pages.*au-delà de 6 pages/);
    assert.match(getOptionScope(base, 'language-en'), /5 pages/);
  }
});

test('new base prices are scope estimates while saved historical amounts retain their own presentation', () => {
  for (const offer of publicOffers) {
    const quote = quoteConfiguration(normalizeConfiguration({ offerId: offer.id }));
    assert.equal(quote.estimateBasis, 'scope');
    assert.equal(quote.estimated, true);
    assert.equal(quote.requiresQuote, true);
    assert.equal(quote.checkoutReady, false);
    assert.match(formatQuoteTotal(quote), /^À partir de /);
    const historic = { currency: quote.currency, totalCents: quote.totalCents, maximumTotalCents: quote.totalCents, estimated: false };
    const before = structuredClone(historic);
    assert.doesNotMatch(formatQuoteTotal(historic), /À partir de/);
    assert.deepEqual(historic, before);
  }
});
