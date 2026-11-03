import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyInquiryContact, validateInquiryContact } from '../shared/inquiry-contact.ts';

const validContact = (extra = {}) => ({ firstName: 'Élodie', lastName: "O’Connor", email: 'elodie@example.test', phone: '+33 (0)1 23 45 67 89', company: 'Atelier', ...extra });

test('valid contact is trimmed and keeps Unicode names and company', () => {
  const result = validateInquiryContact(validContact({ firstName: '  李 Élodie  ', lastName: '  Muñoz-De la Cruz  ', email: '  CLIENT@Example.test  ', phone: '  +52 (55) 1234-5678  ', company: '  Société 東京  ' }));
  assert.deepEqual(result.fields, {});
  assert.deepEqual(result.contact, { firstName: '李 Élodie', lastName: 'Muñoz-De la Cruz', email: 'client@example.test', phone: '+52 (55) 1234-5678', company: 'Société 東京' });
  assert.deepEqual(emptyInquiryContact, { firstName: '', lastName: '', email: '', phone: '', company: '' });
});

test('each mandatory field is required and company is optional', () => {
  for (const key of ['firstName', 'lastName', 'email', 'phone']) {
    const input = validContact();
    delete input[key];
    assert.deepEqual(Object.keys(validateInquiryContact(input).fields), [key]);
    assert.deepEqual(Object.keys(validateInquiryContact(validContact({ [key]: '   ' })).fields), [key]);
  }
  const input = validContact();
  delete input.company;
  assert.deepEqual(validateInquiryContact(input).fields, {});
  assert.equal(validateInquiryContact(input).contact.company, '');
});

test('every field refuses non-string values without coercion', () => {
  for (const key of ['firstName', 'lastName', 'email', 'phone', 'company']) {
    for (const value of [null, 42, false, [], {}, { toString() { throw new Error('must not coerce'); } }]) {
      const result = validateInquiryContact(validContact({ [key]: value }));
      assert.deepEqual(Object.keys(result.fields), [key]);
      assert.equal(result.contact[key], '');
    }
  }
});

test('names, email, phone and company enforce their length limits', () => {
  for (const key of ['firstName', 'lastName']) {
    assert.deepEqual(validateInquiryContact(validContact({ [key]: 'é'.repeat(80) })).fields, {});
    assert.ok(validateInquiryContact(validContact({ [key]: 'é'.repeat(81) })).fields[key]);
  }
  assert.deepEqual(validateInquiryContact(validContact({ company: 'é'.repeat(160) })).fields, {});
  assert.ok(validateInquiryContact(validContact({ company: 'é'.repeat(161) })).fields.company);
  const email = `${'a'.repeat(241)}@example.test`;
  assert.equal(email.length, 254);
  assert.deepEqual(validateInquiryContact(validContact({ email })).fields, {});
  assert.ok(validateInquiryContact(validContact({ email: `a${email}` })).fields.email);
  assert.ok(validateInquiryContact(validContact({ email: `${'İ'.repeat(241)}@example.test` })).fields.email);
  const phone = `+1${' '.repeat(32)}234567`;
  assert.equal(phone.length, 40);
  assert.deepEqual(validateInquiryContact(validContact({ phone })).fields, {});
  assert.ok(validateInquiryContact(validContact({ phone: `+1 ${' '.repeat(32)}234567` })).fields.phone);
});

test('control characters are rejected before trimming for every field', () => {
  for (const key of ['firstName', 'lastName', 'email', 'phone', 'company']) {
    for (const control of ['\0', '\t', '\n', '\r', '\x7f', '\u0085', '\u2028', '\u2029']) {
      assert.ok(validateInquiryContact(validContact({ [key]: `${control}${validContact()[key]}` })).fields[key]);
    }
  }
});

test('international phone formats need 7 to 15 digits without words or extensions', () => {
  for (const phone of ['+33 1 23 45 67 89', '+52 (55) 1234-5678', '+1 (212) 555.0123', '01 23 45 67 89', '1234567', '+123456789012345']) {
    assert.deepEqual(validateInquiryContact(validContact({ phone })).fields, {});
  }
  for (const phone of ['123456', '+1234567890123456', 'appelez-moi', '+33 1 23 45 67 89 ext 12', '+33 1 23 45 67 89 x12', '++33 123456789', '33+123456789', '+33/123456789', '＋３３１２３４５６７８９']) {
    assert.ok(validateInquiryContact(validContact({ phone })).fields.phone);
  }
});

test('email validation rejects malformed addresses and header or markup injection', () => {
  for (const email of ['client', 'client@example', 'client@@example.test', 'client name@example.test', '<client@example.test>', 'client@example.test\r\nBcc: victim@example.test', 'client@example.test<script>']) {
    assert.ok(validateInquiryContact(validContact({ email })).fields.email);
  }
  assert.deepEqual(validateInquiryContact(validContact({ email: 'élodie+pro@exemple.test' })).fields, {});
});

test('input must be a plain object with only the five contact keys', () => {
  for (const input of [undefined, null, 'contact', 42, [], new Date(), Object.create(validContact())]) {
    const result = validateInquiryContact(input);
    assert.ok(result.fields.form);
    for (const key of ['firstName', 'lastName', 'email', 'phone']) assert.ok(result.fields[key]);
  }
  for (const extra of [{ name: 'Ancien nom' }, { to: 'victim@example.test' }, JSON.parse('{"__proto__": {"polluted": true}}'), { [Symbol('extra')]: true }]) {
    assert.ok(validateInquiryContact({ ...validContact(), ...extra }).fields.form);
  }
  assert.deepEqual(validateInquiryContact(Object.assign(Object.create(null), validContact())).fields, {});
  assert.equal({}.polluted, undefined);
});

test('text punctuation is kept as text rather than rewritten or interpreted', () => {
  const input = validContact({ firstName: "D’Angelo", lastName: "O'Brien", company: '<Atelier> & "Société"; DROP TABLE users;' });
  assert.deepEqual(validateInquiryContact(input), { contact: input, fields: {} });
});
