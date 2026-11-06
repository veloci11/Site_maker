import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.mjs';
import { createAdminUser } from '../server/auth.mjs';
import { closeDb, getDb } from '../server/db.mjs';
import { getContactBriefSections, validateContactBrief, summarizeBrief } from '../shared/brief.ts';
import { validInquiry } from './helpers/inquiry-fixture.mjs';

test('the public form has only activity and message, with no legacy required questions', () => {
  assert.deepEqual(getContactBriefSections().flatMap(section => section.questions.map(question => question.id)), ['activity', 'message']);
  assert.deepEqual(validateContactBrief({ message: '  Créer le site de mon atelier.  ' }), {
    answers: { message: 'Créer le site de mon atelier.' }, fields: {},
  });
  assert.ok(validateContactBrief({}).fields.message);
  for (const key of ['deadline', 'transferUrl', 'object3d', 'dataFields', 'totalCents']) {
    const result = validateContactBrief({ message: 'Mon projet.', [key]: 'Champ non proposé' });
    assert.ok(result.fields[key]);
    assert.equal(Object.hasOwn(result.answers, key), false);
  }
});

test('compact offer messages and historical questionnaires both remain visible in saved summaries', () => {
  for (const requestType of ['vitrine', 'connecte', 'immersif']) {
    const brief = Object.freeze({ activity: 'Atelier', message: 'Mon besoin précis.' });
    const saved = summarizeBrief(requestType, brief, { historical: true });
    assert.ok(saved.flatMap(section => section.items).some(item => item.value === brief.message));
    const current = summarizeBrief(requestType, brief, { contactForm: true });
    assert.deepEqual(current, saved);
  }
  const legacy = summarizeBrief('immersif', { object3d: 'Produit historique', modelDetails: 'Fichier déjà décrit.' }, { historical: true });
  assert.ok(legacy.flatMap(section => section.items).some(item => item.value === 'Produit historique'));
  assert.ok(legacy.flatMap(section => section.items).some(item => item.value === 'Fichier déjà décrit.'));
  const contact = summarizeBrief('contact', { message: 'Ancienne demande.', deadline: 'Ancienne échéance.' }, { historical: true });
  assert.ok(contact.flatMap(section => section.items).some(item => item.value === 'Ancienne échéance.'));
});

test('all three offers and contact submit the short form through the real API without legacy fields', async t => {
  const directory = mkdtempSync(path.join(tmpdir(), 'studio-short-form-'));
  const overrides = {
    DATA_DIR: path.join(directory, '.private-data'), NODE_ENV: 'test',
    APP_ORIGIN: undefined, PUBLIC_APP_URL: undefined, TRUST_PROXY: undefined,
    RESEND_API_KEY: undefined, RESEND_FROM: undefined, INQUIRY_TO: undefined,
  };
  const previous = Object.fromEntries(Object.keys(overrides).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  closeDb();
  // createApp has no email worker: requests remain private in this disposable DB.
  const server = createApp().listen(0, '127.0.0.1');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    closeDb();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  });
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  process.env.APP_ORIGIN = origin;
  const post = async payload => {
    const response = await fetch(`${origin}/api/inquiries`, {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    return { status: response.status, body: await response.json() };
  };
  const password = 'short-form-private-admin-test-2026';
  await createAdminUser({ name: 'Studio test', email: 'short-admin@example.test', password });
  const login = await fetch(`${origin}/api/auth/login`, {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'short-admin@example.test', password }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  let replay;
  for (const requestType of ['vitrine', 'connecte', 'immersif', 'contact']) {
    const payload = validInquiry(requestType, { briefFormat: 'contact', brief: { message: `Projet ${requestType}.` } });
    if (requestType === 'vitrine') payload.configuration.extras = ['user-accounts'];
    if (requestType === 'connecte') payload.configuration.extras = ['additional-language'];
    const response = await post(payload);
    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(response.body.notification, 'unavailable');
    const row = getDb().prepare('SELECT message FROM inquiries WHERE id=?').get(response.body.id);
    assert.ok(row.message.includes(payload.brief.message));
    const saved = getDb().prepare('SELECT brief_snapshot FROM inquiry_briefs WHERE inquiry_id=?').get(response.body.id);
    assert.deepEqual(JSON.parse(saved.brief_snapshot), payload.brief);
    const adminResponse = await fetch(`${origin}/api/admin/inquiries/${response.body.id}`, { headers: { Cookie: cookie } });
    assert.equal(adminResponse.status, 200);
    const { inquiry } = await adminResponse.json();
    assert.ok(inquiry.sections.flatMap(section => section.items).some(item => item.value === payload.brief.message));
    assert.deepEqual(inquiry.brief, payload.brief);
    if (requestType === 'vitrine') {
      assert.equal(inquiry.quote.estimated, true);
      assert.equal(inquiry.quote.totalCents, 119000);
      assert.equal(inquiry.quote.maximumTotalCents, 149000);
      assert.match(row.message, /Création : 1\s190\s€–1\s490\s€/);
      assert.match(row.message, /Espace membres : 300\s€–600\s€/);
      assert.match(row.message, /Fourchette indicative/);
    }
    if (requestType === 'connecte') {
      assert.equal(inquiry.configuration.language, 'fr');
      assert.ok(inquiry.configuration.extras.includes('additional-language'));
      const language = inquiry.quote.lines.find(line => line.key === 'additional-language');
      assert.equal(language.label, 'Langue supplémentaire');
      assert.equal(language.amountCents, 10000);
      assert.equal(inquiry.quote.totalCents, 159000);
      assert.ok(row.message.includes('Langue supplémentaire'));
    }
    replay = { payload, id: response.body.id };
  }
  const repeated = await post(replay.payload);
  assert.equal(repeated.status, 200);
  assert.equal(repeated.body.id, replay.id);
  const missingMessage = await post(validInquiry('immersif', { briefFormat: 'contact', brief: {} }));
  assert.equal(missingMessage.status, 400);
  assert.ok(missingMessage.body.fields.message);
  const removedQuestion = await post(validInquiry('vitrine', { briefFormat: 'contact', brief: { message: 'Mon besoin.', deadline: 'Demain' } }));
  assert.equal(removedQuestion.status, 400);
  assert.ok(removedQuestion.body.fields.deadline);
  const invalidFormat = await post(validInquiry('contact', { briefFormat: 'anything', brief: { message: 'Mon besoin.' } }));
  assert.equal(invalidFormat.status, 400);
  assert.ok(invalidFormat.body.fields.briefFormat);
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM inquiries').get().count, 4);
  assert.equal(getDb().prepare('SELECT SUM(attempts) AS attempts FROM inquiry_outbox').get().attempts, 0);
});
