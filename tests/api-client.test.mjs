import test from 'node:test';
import assert from 'node:assert/strict';
import { api, ApiError } from '../src/lib/api.ts';

test('a successful HTML fallback is not accepted as a JSON API result', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<!doctype html><title>studio</title>', {
    status: 200, headers: { 'Content-Type': 'text/html' },
  }));
  await assert.rejects(api('/api/catalogue'), error => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 200);
    assert.equal(error.code, 'INVALID_RESPONSE');
    assert.match(error.message, /réponse du serveur/i);
    return true;
  });
});

test('a truncated successful JSON response leaves a readable retry error', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('{"pricing":', {
    status: 200, headers: { 'Content-Type': 'application/json' },
  }));
  await assert.rejects(api('/api/catalogue'), error => error instanceof ApiError && error.code === 'INVALID_RESPONSE');
});

test('normal JSON, no-content and multipart requests keep their transport behavior', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (path, options) => {
    calls.push({ path, options });
    return path.endsWith('/logout') ? new Response(null, { status: 204 })
      : Response.json({ ok: true, id: 'local-fixture' });
  });
  const form = new FormData();
  form.append('files', new Blob(['fixture'], { type: 'text/plain' }), 'fixture.txt');
  assert.deepEqual(await api('/api/inquiries', { method: 'POST', body: form }), { ok: true, id: 'local-fixture' });
  assert.equal(calls[0].options.body, form);
  assert.equal(calls[0].options.headers['Content-Type'], undefined, 'the browser must supply the multipart boundary');
  assert.equal(calls[0].options.credentials, 'same-origin');
  assert.equal(await api('/api/auth/logout', { method: 'POST' }), null);
});

test('non-JSON HTTP failures keep their real status and JSON validation failures retain fields', async (t) => {
  t.mock.method(globalThis, 'fetch', async (path) => path.endsWith('/limited')
    ? new Response('<h1>Too many requests</h1>', { status: 429 })
    : Response.json({ error: 'Vérifiez les champs.', code: 'VALIDATION', fields: { email: 'Adresse requise.' } }, { status: 400 }));
  await assert.rejects(api('/api/limited'), error => error instanceof ApiError && error.status === 429 && error.code === undefined);
  await assert.rejects(api('/api/inquiries'), error => {
    assert.equal(error.status, 400);
    assert.equal(error.code, 'VALIDATION');
    assert.deepEqual(error.fields, { email: 'Adresse requise.' });
    return true;
  });
});

test('aborting while the JSON body is read remains an abort, not a connection or parse error', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    status: 200, ok: true,
    json: async () => { throw new DOMException('Aborted', 'AbortError'); },
  }));
  await assert.rejects(api('/api/catalogue'), error => error.name === 'AbortError');
});
