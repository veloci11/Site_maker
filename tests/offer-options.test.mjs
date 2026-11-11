import test from 'node:test';
import assert from 'node:assert/strict';
import { PUBLIC_OFFER_IDS, defaultPricing, optionDefinitions, normalizeConfiguration, isOptionIncluded, isOptionSelected, quoteConfiguration, withOption } from '../shared/catalog.ts';
import { PUBLIC_OPTIONS_BY_OFFER, changePublicOffer, getPublicOptions, getUnavailableOptions, prunePublicConfiguration } from '../shared/offer-options.ts';

const publicIds = id => getPublicOptions(id).map(option => option.id);
const approved = ['additional-language', 'user-accounts', 'booking', 'online-payment', 'online-store', 'blog', 'extra-pages', 'content-import', 'custom-3d', 'extra-scene-3d', 'analytics', 'newsletter', 'hosting-monthly', 'maintenance-monthly', 'serenity-monthly'];

test('public menus expose only the selected additions and three monthly plans in catalogue order', () => {
  for (const offerId of PUBLIC_OFFER_IDS) {
    const ids = publicIds(offerId);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(ids, [...PUBLIC_OPTIONS_BY_OFFER[offerId]]);
    assert.deepEqual(ids, optionDefinitions.filter(option => ids.includes(option.id)).map(option => option.id));
    assert.ok(ids.every(id => approved.includes(id)));
    assert.ok(ids.every(id => !isOptionIncluded(normalizeConfiguration({ offerId }), id)));
    assert.deepEqual(ids.slice(-3), ['hosting-monthly', 'maintenance-monthly', 'serenity-monthly']);
  }
  assert.deepEqual(publicIds('sur-mesure'), []);
});

test('CMS and member areas start with Business; responsive and launch are always included', () => {
  for (const offerId of PUBLIC_OFFER_IDS) {
    const config = prunePublicConfiguration({ offerId });
    assert.equal(config.mobile, true);
    assert.equal(config.deployment, true);
    assert.ok(!publicIds(offerId).includes('mobile'));
    assert.ok(!publicIds(offerId).includes('deployment'));
    assert.ok(!publicIds(offerId).includes('managed-content'));
    assert.equal(config.managedContent, offerId !== 'vitrine');
    assert.equal(publicIds(offerId).includes('user-accounts'), offerId !== 'vitrine');
    assert.deepEqual(getUnavailableOptions(config), []);
  }
});

test('all highlighted additions remain available or included as appropriate', () => {
  for (const offerId of PUBLIC_OFFER_IDS) {
    const config = prunePublicConfiguration({ offerId });
    for (const id of approved) {
      const availableOrIncluded = publicIds(offerId).includes(id) || isOptionIncluded(config, id);
      assert.equal(availableOrIncluded, offerId !== 'vitrine' || id !== 'user-accounts', `${offerId}/${id}`);
    }
  }
  assert.equal(publicIds('connecte').includes('analytics'), false);
  assert.equal(isOptionIncluded(prunePublicConfiguration({ offerId: 'connecte' }), 'analytics'), true);
});

test('professional email is included only on Business and Premium and cannot be purchased separately', () => {
  assert.ok(!Object.hasOwn(defaultPricing.options, 'professional-email'));
  assert.throws(() => normalizeConfiguration({ offerId: 'vitrine', extras: ['professional-email'] }), /Vérifiez les fonctionnalités/);

  for (const offerId of [...PUBLIC_OFFER_IDS, 'sur-mesure']) {
    assert.ok(!publicIds(offerId).includes('professional-email'), offerId);
    const quote = quoteConfiguration(prunePublicConfiguration({ offerId }));
    const setup = quote.lines.find(line => line.key === 'professional-email');
    if (offerId === 'connecte' || offerId === 'immersif') {
      assert.equal(setup.included, true);
      assert.equal(setup.amountCents, 0);
    } else {
      assert.equal(setup, undefined);
    }
    assert.equal(quote.totalCents, defaultPricing.base[offerId]);
    assert.equal(quote.monthlyTotalCents, 0);
  }
});

test('unapproved additions are pruned without mutating the source configuration', () => {
  const config = normalizeConfiguration({ offerId: 'vitrine', managedContent: true, extras: ['member-roles', 'booking', 'newsletter', 'backups-monthly', 'content-import'] });
  const snapshot = structuredClone(config);
  assert.deepEqual(getUnavailableOptions(config), ['managed-content', 'user-accounts', 'member-roles', 'backups-monthly']);
  const pruned = prunePublicConfiguration(config);
  assert.equal(pruned.managedContent, false);
  assert.deepEqual(pruned.extras, ['booking', 'newsletter', 'content-import']);
  assert.deepEqual(getUnavailableOptions(pruned), []);
  assert.deepEqual(prunePublicConfiguration(pruned), pruned);
  assert.deepEqual(config, snapshot);
});

test('switching offers clears the choices and uses the inclusions of the new offer', () => {
  const connected = prunePublicConfiguration({ offerId: 'connecte', language: 'fr-en', extras: ['user-accounts', 'blog', 'hosting-monthly'] });
  const vitrine = changePublicOffer(connected, 'vitrine');
  for (const id of ['user-accounts', 'blog', 'hosting-monthly']) assert.equal(isOptionSelected(vitrine, id), false);
  for (const id of ['booking', 'advanced-forms', 'portfolio-gallery', 'local-seo']) assert.equal(isOptionSelected(vitrine, id), false);
  assert.equal(vitrine.language, 'fr');
  assert.equal(isOptionSelected(vitrine, 'additional-language'), false);
  assert.equal(vitrine.managedContent, false);
  assert.equal(isOptionSelected(vitrine, 'analytics'), false);
  assert.ok(!connected.extras.includes('portfolio-gallery'));
});

test('public drafts remove the former gallery without changing saved configurations or paid choices', () => {
  for (const offerId of ['connecte', 'immersif']) {
    const historical = normalizeConfiguration({ offerId, extras: ['portfolio-gallery', 'blog', 'newsletter'] });
    const snapshot = structuredClone(historical);
    assert.deepEqual(getUnavailableOptions(historical), ['portfolio-gallery']);
    const current = prunePublicConfiguration(historical);
    assert.equal(isOptionSelected(current, 'portfolio-gallery'), false);
    assert.equal(isOptionIncluded(current, 'managed-content'), true);
    for (const id of ['blog', 'newsletter']) assert.equal(isOptionSelected(current, id), true);
    assert.ok(!getPublicOptions(current).some(option => option.id === 'portfolio-gallery'));
    assert.deepEqual(getUnavailableOptions(current), []);
    assert.deepEqual(prunePublicConfiguration(current), current);
    assert.equal(quoteConfiguration(current).totalCents, quoteConfiguration(historical).totalCents);
    assert.deepEqual(historical, snapshot);
  }
});

test('a selected shop makes payment included and keeps the server quote consistent', () => {
  const base = prunePublicConfiguration({ offerId: 'connecte', extras: ['online-payment'] });
  const shop = prunePublicConfiguration(withOption(base, 'online-store', true));
  assert.deepEqual(getUnavailableOptions(shop), []);
  assert.equal(isOptionSelected(shop, 'online-payment'), true);
  assert.equal(isOptionIncluded(shop, 'online-payment'), true);
  const quote = quoteConfiguration(shop);
  assert.equal(quote.totalCents, defaultPricing.base.connecte + defaultPricing.options['online-store']);
  assert.equal(quote.lines.find(line => line.key === 'online-payment').amountCents, 0);
});

test('public choices hide every included feature, including payment covered by the selected shop', () => {
  for (const offerId of PUBLIC_OFFER_IDS) {
    const base = prunePublicConfiguration({ offerId });
    const payment = prunePublicConfiguration(withOption(base, 'online-payment', true));
    assert.ok(getPublicOptions(payment).some(option => option.id === 'online-payment'), 'standalone payment stays available to deselect');
    const shop = prunePublicConfiguration(withOption(payment, 'online-store', true));
    const visible = getPublicOptions(shop);
    assert.ok(visible.every(option => !isOptionIncluded(shop, option.id)), `${offerId}: no included feature is a selectable addition`);
    assert.ok(!visible.some(option => option.id === 'online-payment'), 'the shop already covers payment');
    assert.ok(visible.some(option => option.id === 'online-store'), 'the selected shop remains available to deselect');
    assert.equal(quoteConfiguration(shop).totalCents, defaultPricing.base[offerId] + defaultPricing.options['online-store']);

    const withoutShop = prunePublicConfiguration(withOption(shop, 'online-store', false));
    assert.ok(getPublicOptions(withoutShop).some(option => option.id === 'online-payment'), 'standalone payment returns as an available choice');
    assert.equal(isOptionSelected(withoutShop, 'online-payment'), false, 'removing a bundle never silently selects a paid standalone option');
    assert.equal(quoteConfiguration(withoutShop).totalCents, defaultPricing.base[offerId]);
    assert.ok(!getPublicOptions(withoutShop).some(option => option.id === 'managed-content'));
    assert.equal(getPublicOptions(withoutShop).some(option => option.id === 'analytics'), offerId === 'vitrine');
  }
});

test('public helpers keep historical catalogue identifiers and reject malformed data', () => {
  for (const id of ['mobile', 'deployment', 'member-roles', 'backups-monthly', 'copywriting', 'additional-language'])
    assert.ok(optionDefinitions.some(option => option.id === id));
  for (const value of [{ offerId: 'unknown' }, { mobile: 'true' }, { extras: ['unknown'] }])
    assert.throws(() => prunePublicConfiguration(value));
});

test('offer changes clear chosen shop and language without billing prior included CMS or analytics', () => {
  for (const source of ['connecte', 'immersif']) {
    const original = prunePublicConfiguration({ offerId: source, language: 'fr-en', extras: ['online-store', 'serenity-monthly'] });
    const snapshot = structuredClone(original);
    const vitrine = changePublicOffer(original, 'vitrine');
    assert.equal(vitrine.managedContent, false);
    assert.equal(isOptionSelected(vitrine, 'analytics'), false);
    assert.equal(vitrine.scene3d, false);
    assert.equal(vitrine.language, 'fr');
    assert.equal(isOptionSelected(vitrine, 'additional-language'), false);
    assert.equal(isOptionSelected(vitrine, 'online-store'), false);
    assert.equal(isOptionIncluded(vitrine, 'online-payment'), false);
    assert.equal(quoteConfiguration(vitrine).totalCents, 89000);
    assert.equal(quoteConfiguration(vitrine).monthlyTotalCents, 0);
    assert.deepEqual(original, snapshot);
  }
  const vitrine = prunePublicConfiguration({ offerId: 'vitrine', managedContent: true, extras: ['analytics'] });
  assert.deepEqual(changePublicOffer(vitrine, 'vitrine'), vitrine, 'staying on the same offer preserves paid additions');
  assert.equal(quoteConfiguration(changePublicOffer(vitrine, 'connecte')).totalCents, 149000, 'new inclusions replace paid choices');
});

test('upgrading to Premium includes content import and the first 3D integration without a duplicate charge', () => {
  for (const source of ['vitrine', 'connecte']) {
    const previous = prunePublicConfiguration({
      offerId: source,
      language: 'fr-en',
      extras: ['extra-scene-3d', 'content-import', 'custom-3d', 'blog', 'serenity-monthly'],
    });
    const snapshot = structuredClone(previous);
    const premium = changePublicOffer(previous, 'immersif');
    assert.equal(isOptionIncluded(premium, 'scene-3d'), true, 'the first integration belongs to the Premium base');
    assert.equal(isOptionIncluded(premium, 'content-import'), true);
    assert.equal(isOptionSelected(changePublicOffer(premium, source), 'content-import'), false, 'an included import never becomes a paid choice on downgrade');
    assert.equal(isOptionSelected(premium, 'extra-scene-3d'), false, 'a second integration must be chosen explicitly');
    for (const id of ['custom-3d', 'blog', 'serenity-monthly']) assert.equal(isOptionSelected(premium, id), false, id);
    assert.equal(premium.language, 'fr');
    assert.equal(isOptionSelected(premium, 'additional-language'), false);
    assert.equal(quoteConfiguration(premium).totalCents, 249000);
    assert.equal(quoteConfiguration(premium).monthlyTotalCents, 0);
    assert.deepEqual(previous, snapshot);

    const secondElement = withOption(premium, 'extra-scene-3d', true);
    assert.equal(quoteConfiguration(secondElement).totalCents, 274000, 'a deliberately added second element costs the quoted minimum');
    assert.equal(isOptionSelected(changePublicOffer(secondElement, 'immersif'), 'extra-scene-3d'), true, 'staying on Premium retains the explicit second element');
  }
});

test('the public language option is generic and priced once without encoding English', () => {
  for (const offerId of PUBLIC_OFFER_IDS) {
    const base = prunePublicConfiguration({ offerId });
    const choice = prunePublicConfiguration(withOption(base, 'additional-language', true));
    assert.equal(choice.language, 'fr');
    assert.equal(isOptionSelected(choice, 'additional-language'), true);
    assert.equal(isOptionSelected(choice, 'language-en'), false);
    assert.equal(quoteConfiguration(choice).totalCents, defaultPricing.base[offerId] + 10000);
    assert.ok(!publicIds(offerId).includes('language-en'));
    assert.deepEqual(getUnavailableOptions(choice), []);
  }
});

test('legacy public English drafts become one generic option idempotently without changing historical input', () => {
  for (const offerId of PUBLIC_OFFER_IDS) {
    const legacy = normalizeConfiguration({ offerId, language: 'fr-en', extras: ['additional-language', 'blog'] });
    const snapshot = structuredClone(legacy);
    const migrated = prunePublicConfiguration(legacy);
    assert.equal(migrated.language, 'fr');
    assert.equal(migrated.extras.filter(id => id === 'additional-language').length, 1);
    assert.equal(quoteConfiguration(migrated).totalCents, defaultPricing.base[offerId] + 10000 + 15000);
    assert.deepEqual(prunePublicConfiguration(migrated), migrated);
    assert.deepEqual(legacy, snapshot);
    assert.equal(normalizeConfiguration(legacy).language, 'fr-en', 'private normalization does not reinterpret an existing English selection');
  }
  const legacyCustom = normalizeConfiguration({ offerId: 'sur-mesure', language: 'fr-en' });
  const snapshot = structuredClone(legacyCustom);
  prunePublicConfiguration(legacyCustom);
  assert.deepEqual(legacyCustom, snapshot);
  assert.equal(quoteConfiguration(legacyCustom).lines.some(line => line.key === 'language-en'), true);
});

test('public pruning removes retired advanced forms, retains explicit booking and includes Premium analytics', () => {
  const previous = normalizeConfiguration({ offerId: 'connecte', extras: ['booking', 'advanced-forms', 'additional-language', 'hosting-monthly'] });
  const snapshot = structuredClone(previous);
  const current = prunePublicConfiguration(previous);
  assert.equal(isOptionSelected(current, 'advanced-forms'), false);
  assert.ok(!getPublicOptions(current).some(option => option.id === 'advanced-forms'));
  assert.equal(isOptionSelected(current, 'booking'), true);
  assert.ok(getPublicOptions(current).some(option => option.id === 'booking'));
  assert.equal(quoteConfiguration(current).totalCents, 168000);
  assert.equal(quoteConfiguration(current).maximumTotalCents, 177000);
  assert.equal(quoteConfiguration(current).monthlyTotalCents, 1900);
  assert.deepEqual(previous, snapshot);
  for (const offerId of ['connecte', 'immersif']) {
    const config = prunePublicConfiguration({ offerId, extras: ['analytics'] });
    assert.ok(!getPublicOptions(config).some(option => option.id === 'analytics'));
    assert.equal(quoteConfiguration(config).totalCents, defaultPricing.base[offerId]);
    assert.equal(quoteConfiguration(config).lines.find(line => line.key === 'analytics').amountCents, 0);
  }
});

test('all public offer transitions start at the new base and retain choices on the current offer', () => {
  for (const source of PUBLIC_OFFER_IDS) {
    const original = prunePublicConfiguration({ offerId: source, extras: ['additional-language', 'user-accounts', 'booking', 'online-store', 'serenity-monthly'] });
    const before = structuredClone(original);
    for (const target of PUBLIC_OFFER_IDS) {
      const changed = changePublicOffer(original, target);
      const quote = quoteConfiguration(changed);
      const sameOffer = source === target;
      assert.deepEqual(changed, sameOffer ? original : normalizeConfiguration({ offerId: target }));
      const additionsMin = target === 'vitrine' ? 79000 : 109000;
      const additionsMax = target === 'vitrine' ? 138000 : 198000;
      assert.equal(quote.totalCents, defaultPricing.base[target] + (sameOffer ? additionsMin : 0));
      assert.equal(quote.maximumTotalCents, defaultPricing.base[target] + (sameOffer ? additionsMax : 0));
      assert.equal(quote.monthlyTotalCents, sameOffer ? 6900 : 0);
      assert.equal(isOptionSelected(changed, 'booking'), sameOffer);
      assert.equal(isOptionIncluded(changed, 'booking'), false);
      assert.deepEqual(getUnavailableOptions(changed), []);
      if (target === 'vitrine') {
        for (const id of ['managed-content', 'analytics', 'local-seo', 'portfolio-gallery']) assert.equal(isOptionSelected(changed, id), false);
      }
      assert.deepEqual(original, before);
    }
  }
});

test('additional-page quantities reset only when changing to a different offer', () => {
  for (const source of PUBLIC_OFFER_IDS) {
    const previous = prunePublicConfiguration({ offerId: source, extras: ['extra-pages', 'additional-language'], extraPageCount: 4 });
    for (const target of PUBLIC_OFFER_IDS) {
      const changed = changePublicOffer(previous, target);
      const sameOffer = source === target;
      assert.equal(changed.extraPageCount, sameOffer ? 4 : undefined);
      assert.equal(quoteConfiguration(changed).totalCents, defaultPricing.base[target] + (sameOffer ? 34000 : 0));
      assert.equal(quoteConfiguration(changed).maximumTotalCents, defaultPricing.base[target] + (sameOffer ? 58000 : 0));
      assert.deepEqual(prunePublicConfiguration(changed), changed);
    }
  }
});
