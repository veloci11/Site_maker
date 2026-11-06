import test from 'node:test';
import assert from 'node:assert/strict';
import {
  requestTypes, requestTypeLabels, briefLimits, isRequestType, getBriefSections,
  emptyBrief, isBriefQuestionVisible, validateBrief, summarizeBrief,
} from '../shared/brief.ts';

const questionsFor = type => getBriefSections(type).flatMap(section => section.questions);
const validAnswers = type => Object.fromEntries(questionsFor(type)
  .filter(question => question.required && !question.showWhen)
  .map(question => [question.id, question.type === 'select' ? question.options[0].value
    : question.type === 'multiselect' ? [question.options[0].value]
      : question.type === 'url' ? 'https://example.test' : 'Une réponse précise.']));

test('the seven request types share a bounded French questionnaire contract', () => {
  assert.deepEqual(requestTypes, ['vitrine', 'connecte', 'immersif', 'sur-mesure', 'evolution', 'refonte', 'contact']);
  assert.deepEqual(Object.keys(requestTypeLabels), requestTypes);
  for (const type of requestTypes) {
    assert.equal(isRequestType(type), true);
    const sections = getBriefSections(type), questions = questionsFor(type);
    assert.equal(sections.length, type === 'contact' ? 3 : 5, type);
    assert.equal(sections.at(-1).id, 'project-files', 'every request can share files by link');
    assert.equal(new Set(sections.map(section => section.id)).size, sections.length, type);
    assert.equal(new Set(questions.map(question => question.id)).size, questions.length, type);
    assert.ok(questions.filter(question => !question.showForOption && !question.showForAnyOption).length <= (type === 'contact' ? 5 : 24), type);
    assert.ok(questions.length <= (type === 'contact' ? 5 : 28), 'additional questions stay optional and conditional');
    assert.ok(questions.filter(question => question.required).length <= 6, type);
    assert.ok(questions.every(question => question.label && question.id && ['text', 'textarea', 'select', 'multiselect', 'url'].includes(question.type)));
    const preceding = new Set();
    for (const question of questions) {
      if (question.showWhen) {
        assert.ok(preceding.has(question.showWhen.field), `${type}/${question.id} has an earlier condition`);
        const parent = questions.find(item => item.id === question.showWhen.field);
        assert.ok(question.showWhen.values.every(value => parent.options.some(option => option.value === value)));
      }
      if (question.showWhenAnswered) assert.ok(preceding.has(question.showWhenAnswered));
      if (question.options) {
        assert.equal(new Set(question.options.map(option => option.value)).size, question.options.length);
        assert.ok(question.options.every(option => option.value && option.label));
      }
      preceding.add(question.id);
    }
    assert.ok(!questions.some(question => /password|secret|prix|price|tarif/i.test(question.id)), type);
  }
  for (const value of ['', 'creation', 'projet', '__proto__', null, 3]) assert.equal(isRequestType(value), false);
  assert.deepEqual(getBriefSections('invalid'), []);
});

for (const type of requestTypes) {
  test(`${type}: required visible fields are enforced and valid answers are normalized`, () => {
    const missing = validateBrief(type, {});
    for (const question of questionsFor(type).filter(item => item.required && !item.showWhen)) {
      assert.ok(missing.fields[question.id], question.id);
    }
    const input = validAnswers(type);
    // Selecting the first 3D model choice reveals a required follow-up.
    if (type === 'immersif') input.modelStatus = 'unknown';
    for (const [key, value] of Object.entries(input)) if (typeof value === 'string') input[key] = `  ${value}  `;
    const before = JSON.stringify(input);
    const validated = validateBrief(type, Object.freeze(input));
    assert.deepEqual(validated.fields, {});
    assert.equal(JSON.stringify(input), before, 'validation does not mutate the caller');
    assert.ok(Object.values(validated.answers).every(value => typeof value !== 'string' || value === value.trim()));
    assert.deepEqual(validateBrief(type, validated.answers), validated, 'normalization is idempotent');
  });

  test(`${type}: keys from another context and price injections are rejected`, () => {
    const input = validAnswers(type);
    if (type === 'immersif') input.modelStatus = 'unknown';
    for (const key of ['totalCents', 'monthlyTotalCents', 'to', 'unknownQuestion']) {
      const result = validateBrief(type, { ...input, [key]: 'injected' });
      assert.ok(result.fields[key]);
      assert.equal(Object.hasOwn(result.answers, key), false);
    }
    const other = requestTypes.flatMap(questionsFor).find(question => !questionsFor(type).some(current => current.id === question.id));
    assert.ok(validateBrief(type, { ...input, [other.id]: 'outside context' }).fields[other.id]);
  });
}

test('invalid request types and malformed containers never become answers', () => {
  assert.ok(validateBrief('invalid', {}).fields._form);
  for (const input of [null, undefined, '', 4, [], new Date(), Object.create({ activity: 'inherited' })]) {
    const result = validateBrief('vitrine', input);
    assert.ok(result.fields._form);
    assert.deepEqual(result.answers, {});
  }
  const poisoned = JSON.parse('{"__proto__":"bad","constructor":"bad","toString":"bad"}');
  const result = validateBrief('contact', poisoned);
  for (const key of Object.keys(poisoned)) assert.equal(Object.hasOwn(result.fields, key), true);
  assert.equal(Object.getPrototypeOf(result.answers), Object.prototype);
  assert.equal({}.polluted, undefined);
  const accessor = Object.defineProperty({}, 'message', { enumerable: true, get() { throw new Error('must not execute'); } });
  assert.ok(validateBrief('contact', accessor).fields.message);
});

test('text types, exact character limits, multiline normalization and controls are enforced', () => {
  for (const value of [null, 42, true, {}, ['text']]) assert.ok(validateBrief('contact', { message: value }).fields.message);
  assert.equal(validateBrief('contact', { message: 'x'.repeat(briefLimits.textarea) }).fields.message, undefined);
  assert.ok(validateBrief('contact', { message: 'x'.repeat(briefLimits.textarea + 1) }).fields.message);
  assert.equal(validateBrief('contact', { activity: 'x'.repeat(briefLimits.text), message: 'Besoin' }).fields.activity, undefined);
  assert.ok(validateBrief('contact', { activity: 'x'.repeat(briefLimits.text + 1), message: 'Besoin' }).fields.activity);
  assert.equal(validateBrief('contact', { message: '  Première ligne\r\nDeuxième ligne\rTroisième ligne  ' }).answers.message, 'Première ligne\nDeuxième ligne\nTroisième ligne');
  for (const control of ['\u0000', '\u0001', '\t', '\u000b', '\u007f', '\u0085']) {
    assert.ok(validateBrief('contact', { message: `Message${control}` }).fields.message, JSON.stringify(control));
  }
  for (const control of ['\r', '\n', '\u2028']) assert.ok(validateBrief('contact', { activity: `activité${control}`, message: 'Besoin' }).fields.activity);
  assert.deepEqual(validateBrief('contact', { activity: '  ', message: '\n  \n', deadline: '' }).answers, {});
  assert.ok(validateBrief('contact', { message: ' ' }).fields.message);
});

test('aggregate text has a separate 16000 character limit', () => {
  const input = validAnswers('connecte');
  const visible = questionsFor('connecte').filter(question => isBriefQuestionVisible(question, input));
  for (const question of visible) {
    if (question.type === 'textarea') input[question.id] = 'x'.repeat(briefLimits.textarea);
    if (question.type === 'text') input[question.id] = 'x'.repeat(briefLimits.text);
  }
  const size = () => Object.values(input).reduce((sum, value) => sum + (typeof value === 'string' ? value.length : 0), 0);
  assert.ok(size() > briefLimits.total);
  assert.ok(validateBrief('connecte', input).fields._form);
  let excess = size() - briefLimits.total;
  for (const question of [...visible].reverse().filter(question => question.type === 'textarea')) {
    const cut = Math.min(excess, input[question.id].length - 1);
    input[question.id] = input[question.id].slice(0, input[question.id].length - cut);
    excess -= cut;
  }
  assert.equal(size(), briefLimits.total);
  assert.deepEqual(validateBrief('connecte', input).fields, {});
  input.activity += 'x';
  assert.ok(validateBrief('connecte', input).fields._form);
});

test('select values and multiselects use only the declared enums and preserve source arrays', () => {
  for (const type of requestTypes) {
    for (const question of questionsFor(type).filter(item => ['select', 'multiselect'].includes(item.type) && !item.showWhen)) {
      const bad = question.type === 'multiselect' ? ['not-an-option'] : 'not-an-option';
      assert.ok(validateBrief(type, { [question.id]: bad }).fields[question.id], `${type}/${question.id}`);
      for (const badType of question.type === 'multiselect' ? ['rotate', [1], null, {}] : [['unknown'], 1, null, {}]) {
        assert.ok(validateBrief(type, { [question.id]: badType }).fields[question.id]);
      }
      const valid = question.type === 'multiselect' ? [question.options[0].value] : question.options[0].value;
      assert.equal(validateBrief(type, { [question.id]: valid }).fields[question.id], undefined, `${type}/${question.id}`);
    }
  }
  const input = Object.freeze({ interactions3d: Object.freeze(['zoom', 'rotate']) });
  assert.deepEqual(validateBrief('immersif', input).answers.interactions3d, ['rotate', 'zoom']);
  assert.deepEqual(input.interactions3d, ['zoom', 'rotate']);
  assert.ok(validateBrief('immersif', { interactions3d: ['rotate', 'rotate'] }).fields.interactions3d);
  assert.deepEqual(validateBrief('immersif', { interactions3d: [] }).answers, {});
  assert.deepEqual(validateBrief('immersif', { interactions3d: [' rotate '] }).answers.interactions3d, ['rotate']);
});

test('existing-site URLs remain optional, accept http(s), and reject credentials and malformed URLs', () => {
  for (const type of ['evolution', 'refonte']) {
    assert.equal(validateBrief(type, {}).fields.currentUrl, undefined);
    assert.equal(validateBrief(type, { currentUrl: '' }).fields.currentUrl, undefined);
    for (const value of ['https://example.test', 'http://example.test/path?x=1#part', ' HTTPS://example.test/path ']) {
      const result = validateBrief(type, { currentUrl: value });
      assert.equal(result.fields.currentUrl, undefined, value);
      assert.equal(result.answers.currentUrl, value.trim());
    }
    for (const value of ['example.test', '//example.test', 'javascript:alert(1)', 'ftp://example.test', 'https://user:secret@example.test', 'https://user@example.test', 'https://@example.test', 'https://', 'https://example.test/a b', 'https:\\example.test', 'https://example.test\n']) {
      assert.ok(validateBrief(type, { currentUrl: value }).fields.currentUrl, value);
    }
    const url = 'https://example.test/' + 'x'.repeat(briefLimits.url - 'https://example.test/'.length);
    assert.equal(validateBrief(type, { currentUrl: url }).fields.currentUrl, undefined);
    assert.ok(validateBrief(type, { currentUrl: url + 'x' }).fields.currentUrl);
  }
});

test('conditional questions are required only when visible and hidden nonempty answers are refused', () => {
  for (const type of requestTypes) {
    for (const question of questionsFor(type).filter(item => item.showWhen)) {
      const { field, values } = question.showWhen;
      assert.equal(isBriefQuestionVisible(question, {}), false);
      assert.equal(isBriefQuestionVisible(question, { [field]: values[0] }), true);
      assert.equal(isBriefQuestionVisible(question, { [field]: [values[0]] }), true);
      assert.equal(validateBrief(type, {}).fields[question.id], undefined);
      const input = { [field]: values[0] };
      assert.equal(Boolean(validateBrief(type, input).fields[question.id]), Boolean(question.required));
      const valid = validateBrief(type, { ...input, [question.id]: 'Informations disponibles.' });
      assert.equal(valid.fields[question.id], undefined);
      assert.equal(valid.answers[question.id], 'Informations disponibles.');
      for (const parent of [undefined, 'invalid-value']) {
        const hidden = validateBrief(type, { [field]: parent, [question.id]: 'Stale hidden answer' });
        assert.ok(hidden.fields[question.id]);
        assert.equal(Object.hasOwn(hidden.answers, question.id), false);
      }
      for (const empty of ['', '  ', []]) {
        assert.equal(validateBrief(type, { [question.id]: empty }).fields[question.id], undefined);
      }
    }
  }
});

test('summaries use the same question labels and human choice labels without hidden or unknown values', () => {
  const summary = summarizeBrief('refonte', {
    activity: '  Atelier test  ', primaryAction: 'Contacter', currentProblems: 'Navigation', preserve: 'Logo',
    platform: 'wordpress', availableAccess: ['domain', 'admin'], dataTools: 'no', dataDetails: 'stale',
    seoTools: 'unknown', seoDetails: 'stale', invented: 'must not appear',
  });
  const items = summary.flatMap(section => section.items);
  assert.equal(items.find(item => item.label === 'Quelle est votre activité ?').value, 'Atelier test');
  assert.equal(items.find(item => item.label.includes('quel outil')).value, 'WordPress');
  assert.equal(items.find(item => item.label.includes('Quels accès')).value, 'Administration du site, Nom de domaine');
  assert.equal(JSON.stringify(summary).includes('stale'), false);
  assert.equal(JSON.stringify(summary).includes('must not appear'), false);
  assert.deepEqual(summarizeBrief('contact', {}), []);
  assert.deepEqual(summarizeBrief('invalid', { message: 'No context' }), []);
  const first = emptyBrief(), second = emptyBrief();
  first.message = 'Local';
  assert.deepEqual(second, {}, 'empty briefs never share a mutable object');
});
