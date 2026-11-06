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
  assert.equal(new Headers(calls[0].options.headers).has('Content-Type'), false, 'the browser must supply the multipart boundary');
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

test('all HeadersInit forms preserve custom headers and replace defaults case-insensitively', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (path, options) => {
    calls.push(new Request(new URL(path, 'https://studio.test'), options));
    return Response.json({ ok: true });
  });
  const values = { accept: 'application/problem+json', 'content-type': 'application/vnd.studio+json', 'x-request-id': 'local-fixture' };
  for (const headers of [values, new Headers(values), Object.entries(values)]) {
    await api('/api/inquiries', { method: 'POST', headers, body: { fixture: true } });
    const request = calls.at(-1);
    assert.equal(request.headers.get('accept'), values.accept);
    assert.equal(request.headers.get('content-type'), values['content-type']);
    assert.equal(request.headers.get('x-request-id'), 'local-fixture');
    assert.equal(request.headers.has('0'), false);
    assert.deepEqual(await request.json(), { fixture: true });
  }
});

test('the submission deadline releases a request with no response headers even if fetch ignores abort', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let signal;
  t.mock.method(globalThis, 'fetch', (_path, options) => {
    signal = options.signal;
    return new Promise(() => {});
  });
  const pending = api('/api/inquiries', { method: 'POST', body: { requestId: 'unchanged' }, timeoutMs: 30_000 });
  const rejected = assert.rejects(pending, error => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.code, 'REQUEST_TIMEOUT');
    assert.equal(error.status, 0);
    assert.match(error.message, /peut déjà être enregistrée/);
    assert.match(error.message, /mêmes informations/);
    return true;
  });
  t.mock.timers.tick(29_999);
  assert.equal(signal.aborted, false);
  t.mock.timers.tick(1);
  await rejected;
  assert.equal(signal.aborted, true);
});

test('one total deadline covers waiting for headers and a stalled JSON body', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const headers = Promise.withResolvers();
  let signal;
  let readingBody = false;
  t.mock.method(globalThis, 'fetch', (_path, options) => {
    signal = options.signal;
    return headers.promise;
  });
  const pending = api('/api/inquiries', { method: 'POST', timeoutMs: 30_000 });
  const rejected = assert.rejects(pending, error => error instanceof ApiError && error.code === 'REQUEST_TIMEOUT');
  t.mock.timers.tick(20_000);
  headers.resolve({
    status: 201, ok: true,
    json: () => { readingBody = true; return new Promise(() => {}); },
  });
  await Promise.resolve();
  assert.equal(readingBody, true);
  t.mock.timers.tick(9_999);
  assert.equal(signal.aborted, false);
  t.mock.timers.tick(1);
  await rejected;
  assert.equal(signal.aborted, true, 'reading JSON does not start another thirty-second allowance');
});

test('caller cancellation remains an AbortError and an already aborted request never starts', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let calls = 0;
  let signal;
  t.mock.method(globalThis, 'fetch', (_path, options) => {
    calls += 1;
    signal = options.signal;
    return new Promise(() => {});
  });
  const controller = new AbortController();
  const pending = api('/api/inquiries', { timeoutMs: 30_000, signal: controller.signal });
  const rejected = assert.rejects(pending, error => error.name === 'AbortError');
  controller.abort();
  await rejected;
  assert.equal(signal.aborted, true);
  assert.equal(signal.reason.name, 'AbortError');
  await assert.rejects(api('/api/inquiries', { timeoutMs: 30_000, signal: controller.signal }), error => error.name === 'AbortError');
  assert.equal(calls, 1);
});

test('a completed request clears its deadline and detaches the caller cancellation listener', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let signal;
  t.mock.method(globalThis, 'fetch', async (_path, options) => {
    signal = options.signal;
    return Response.json({ ok: true });
  });
  const controller = new AbortController();
  assert.deepEqual(await api('/api/inquiries', { timeoutMs: 30_000, signal: controller.signal }), { ok: true });
  t.mock.timers.tick(30_000);
  controller.abort();
  assert.equal(signal.aborted, false, 'a finished request is not interrupted by a stale timer or listener');
});
