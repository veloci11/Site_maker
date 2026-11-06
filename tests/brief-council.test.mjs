import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfiguration, withOption } from '../shared/catalog.ts';
import {
  requestTypes, getBriefSections, isBriefQuestionVisible, toggleBriefChoice,
  validateBrief, summarizeBrief, briefLimits,
} from '../shared/brief.ts';

const question = (type, id) => getBriefSections(type).flatMap(section => section.questions).find(item => item.id === id);

test('all requests accept an optional HTTPS transfer reference without an image', () => {
  for (const type of requestTypes) {
    assert.equal(validateBrief(type, {}).fields.transferUrl, undefined);
    for (const url of ['https://we.tl/t-exemple', 'https://www.swisstransfer.com/d/exemple', 'https://files.example.test/folder?key=sample#files']) {
      const result = validateBrief(type, { transferUrl: url, transferDetails: 'Logo et textes ; lien valable cette semaine.' });
      assert.equal(result.fields.transferUrl, undefined);
      assert.equal(result.fields.transferDetails, undefined);
      assert.equal(result.answers.transferUrl, url);
    }
    assert.ok(validateBrief(type, { transferDetails: 'Aucun lien' }).fields.transferDetails);
    assert.equal(isBriefQuestionVisible(question(type, 'transferDetails'), { transferUrl: '' }), false);
    assert.equal(isBriefQuestionVisible(question(type, 'transferDetails'), { transferUrl: 'https://files.example.test/' }), true);
  }
});

test('transfer references reject active schemes, misleading credentials and invalid or oversized URLs', () => {
  for (const url of ['http://files.example.test/', 'javascript:alert(1)', 'data:text/html,test', '//files.example.test/', 'we.tl/t-test', 'https://user:secret@files.example.test/', 'https://@files.example.test/', 'https://files.example.test/a b', 'https://files.example.test/\n', 'https:\\files.example.test/']) {
    assert.ok(validateBrief('contact', { message: 'Question', transferUrl: url }).fields.transferUrl, url);
  }
  const max = 'https://files.example.test/' + 'x'.repeat(briefLimits.url - 'https://files.example.test/'.length);
  assert.equal(validateBrief('contact', { message: 'Question', transferUrl: max }).fields.transferUrl, undefined);
  assert.ok(validateBrief('contact', { message: 'Question', transferUrl: max + 'x' }).fields.transferUrl);
  assert.equal(summarizeBrief('contact', { message: 'Question', transferUrl: 'https://we.tl/t-exemple' }).flatMap(s => s.items).find(item => item.url)?.url, 'https://we.tl/t-exemple');
  assert.ok(!summarizeBrief('contact', { transferUrl: 'javascript:alert(1)' }, { historical: true }).flatMap(s => s.items).some(item => item.url));
  const invalidParent = validateBrief('contact', { message: 'Question', transferUrl: 'http://files.example.test/', transferDetails: 'Logo et textes' });
  assert.deepEqual(Object.keys(invalidParent.fields), ['transferUrl'], 'correcting the URL must not require deleting its description');
});

test('uncertainty is exclusive on new submissions while available and outstanding access can coexist', () => {
  const access = question('refonte', 'availableAccess');
  const selected = Object.freeze(['admin', 'hosting']);
  assert.deepEqual(toggleBriefChoice(access, selected, 'unknown', true), ['unknown']);
  assert.deepEqual(toggleBriefChoice(access, ['unknown'], 'domain', true), ['domain']);
  assert.deepEqual(toggleBriefChoice(access, ['admin'], 'not-yet', true), ['admin', 'not-yet']);
  assert.deepEqual(selected, ['admin', 'hosting']);
  assert.ok(validateBrief('refonte', { availableAccess: ['admin', 'unknown'] }).fields.availableAccess);
  assert.ok(validateBrief('immersif', { interactions3d: ['rotate', 'unknown'] }).fields.interactions3d);
  assert.equal(validateBrief('refonte', { availableAccess: ['admin', 'not-yet'] }).fields.availableAccess, undefined);
});

test('technical details are optional and creative custom projects need no data model', () => {
  assert.equal(validateBrief('immersif', { modelStatus: 'ready' }).fields.modelDetails, undefined);
  assert.equal(validateBrief('refonte', { seoTools: 'available' }).fields.seoDetails, undefined);
  for (const answer of [undefined, 'no', 'unknown']) {
    assert.equal(isBriefQuestionVisible(question('sur-mesure', 'dataFields'), { dataNeeds: answer }), false);
    assert.equal(validateBrief('sur-mesure', { dataNeeds: answer }).fields.dataFields, undefined);
  }
  assert.equal(isBriefQuestionVisible(question('sur-mesure', 'dataFields'), { dataNeeds: 'yes' }), true);
  assert.equal(validateBrief('sur-mesure', { dataNeeds: 'yes' }).fields.dataFields, undefined);
  assert.ok(validateBrief('connecte', {}).fields.dataFields, 'the connected offer still needs a description of managed information');
});

test('option questions depend on the submitted configuration and never change it', () => {
  const base = normalizeConfiguration({ offerId: 'connecte' });
  const configured = withOption(withOption(base, 'booking', true), 'online-store', true);
  const before = JSON.stringify(configured);
  const answers = { bookingDetails: 'Un cours, confirmation par notre équipe.', storeDetails: 'Dix produits, retrait sur place.' };
  assert.ok(validateBrief('connecte', answers, base).fields.bookingDetails, 'reservation is only readable when explicitly selected in a historical configuration');
  assert.ok(validateBrief('connecte', answers, base).fields.storeDetails);
  const result = validateBrief('connecte', answers, configured);
  assert.equal(result.fields.bookingDetails, undefined);
  assert.equal(result.fields.storeDetails, undefined);
  assert.equal(result.answers.bookingDetails, answers.bookingDetails);
  assert.equal(JSON.stringify(configured), before);
  assert.equal(isBriefQuestionVisible(question('connecte', 'bookingDetails'), {}, configured), true);
});

test('visitor tools and language details follow selected options without adding paid choices', () => {
  for (const type of ['vitrine', 'connecte', 'immersif', 'sur-mesure']) {
    const base = normalizeConfiguration({ offerId: type });
    const answers = {
      newsletterDetails: 'Un formulaire Brevo ; textes préparés par mon équipe.',
      analyticsDetails: 'Mesurer les demandes de contact.',
      languageDetails: 'Français et espagnol, cinq pages ; textes fournis.',
      localSeoDetails: 'Un atelier à Nantes et ses environs.',
    };
    const configured = ['newsletter', 'analytics', 'additional-language', 'local-seo']
      .reduce((current, id) => withOption(current, id, true), base);
    const before = JSON.stringify(configured);
    for (const id of Object.keys(answers)) {
      const includedInBusiness = ['connecte', 'immersif'].includes(type) && ['analyticsDetails', 'localSeoDetails'].includes(id);
      assert.equal(isBriefQuestionVisible(question(type, id), {}, base), includedInBusiness);
      assert.equal(Boolean(validateBrief(type, answers, base).fields[id]), !includedInBusiness, `${type}/${id} follows the selected or included service`);
    }
    const result = validateBrief(type, answers, configured);
    for (const id of Object.keys(answers)) {
      assert.equal(result.fields[id], undefined, `${type}/${id}`);
      assert.equal(result.answers[id], answers[id]);
    }
    assert.equal(JSON.stringify(configured), before);
    assert.equal(isBriefQuestionVisible(question(type, 'languageDetails'), {}, withOption(base, 'language-en', true)), true);
    assert.ok(summarizeBrief(type, answers, { configuration: configured }).flatMap(section => section.items).some(item => item.value === answers.analyticsDetails));
  }
});

test('historical summaries preserve earlier conditions and contradictory selections without rewriting answers', () => {
  const snapshot = Object.freeze({ dataFields: 'Données décrites avant la nouvelle branche.', availableAccess: ['unknown', 'admin'], modelDetails: 'Anciennes précisions.' });
  const custom = summarizeBrief('sur-mesure', snapshot, { historical: true }).flatMap(s => s.items);
  assert.ok(custom.some(item => item.value === snapshot.dataFields));
  const access = summarizeBrief('refonte', snapshot, { historical: true }).flatMap(s => s.items);
  assert.ok(access.some(item => item.value.includes('Je ne sais pas') && item.value.includes('Administration du site')));
  assert.ok(summarizeBrief('immersif', snapshot, { historical: true }).flatMap(s => s.items).some(item => item.value === snapshot.modelDetails));
  assert.equal(snapshot.dataFields, 'Données décrites avant la nouvelle branche.');
});
