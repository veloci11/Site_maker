import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { api, ApiError } from '../src/lib/api.ts';
import { createApp } from '../server/app.mjs';
import { closeDb, getDb } from '../server/db.mjs';
import { validInquiry } from './helpers/inquiry-fixture.mjs';

test('retrying an inquiry after its confirmation times out retrieves the stored request without a duplicate', async t => {
  const directory = mkdtempSync(path.join(tmpdir(), 'studio-inquiry-timeout-'));
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
  // The real API stores data, but createApp starts no external notification worker.
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
  const nativeFetch = globalThis.fetch;
  const submittedBodies = [];
  const responseStatuses = [];
  t.mock.method(globalThis, 'fetch', async (route, options) => {
    assert.equal(route, '/api/inquiries', 'the test never calls an external service');
    submittedBodies.push(options.body);
    const response = await nativeFetch(origin + route, {
      ...options, headers: { ...Object.fromEntries(new Headers(options.headers)), Origin: origin },
    });
    responseStatuses.push(response.status);
    if (responseStatuses.length === 1) {
      // The server has committed the request, but its confirmation never reaches
      // the caller. Consume only this local response; make the JSON reader stall.
      await response.json();
      return { status: response.status, ok: response.ok, json: () => new Promise(() => {}) };
    }
    return response;
  });
  const body = validInquiry('connecte', {
    briefFormat: 'contact',
    brief: { activity: 'Atelier local', message: 'Préparer le site de notre atelier.' },
  });
  const original = JSON.stringify(body);
  await assert.rejects(api('/api/inquiries', { method: 'POST', body, timeoutMs: 1_000 }), error => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.code, 'REQUEST_TIMEOUT');
    assert.match(error.message, /peut déjà être enregistrée/);
    return true;
  });
  assert.deepEqual(responseStatuses, [201], 'the first request was already persisted before its timeout');
  const stored = getDb().prepare('SELECT id FROM inquiries').all();
  assert.equal(stored.length, 1);
  const before = getDb().prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(stored[0].id);
  const retry = await api('/api/inquiries', { method: 'POST', body, timeoutMs: 3_000 });
  assert.equal(retry.ok, true);
  assert.equal(retry.id, stored[0].id);
  assert.equal(retry.notification, 'unavailable');
  assert.deepEqual(responseStatuses, [201, 200]);
  assert.equal(submittedBodies[0], submittedBodies[1], 'the retry uses identical content and requestId');
  assert.equal(JSON.stringify(body), original, 'the client leaves the contact and message data intact');
  assert.equal(getDb().prepare('SELECT COUNT(*) AS count FROM inquiries').get().count, 1);
  assert.deepEqual(getDb().prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(stored[0].id), before);
  assert.equal(getDb().prepare('SELECT SUM(attempts) AS attempts FROM inquiry_outbox').get().attempts, 0);
});
