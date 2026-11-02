import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('a loopback proxy keeps visitor limits separate and ignores spoofed earlier forwarding hops', async () => {
  const saved = { DATA_DIR: process.env.DATA_DIR, APP_ORIGIN: process.env.APP_ORIGIN, TRUST_PROXY: process.env.TRUST_PROXY };
  const directory = mkdtempSync(path.join(tmpdir(), 'studio-proxy-'));
  process.env.DATA_DIR = directory;
  process.env.APP_ORIGIN = 'https://gilmathis.com';
  process.env.TRUST_PROXY = 'loopback';
  const { createApp } = await import('../server/app.mjs');
  const { closeDb } = await import('../server/db.mjs');
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/inquiries`;
  const request = forwarded => fetch(url, { method: 'POST', headers: { Origin: 'https://gilmathis.com', 'Content-Type': 'application/json', 'X-Forwarded-For': forwarded }, body: '{}' }).then(response => response.status);
  try {
    for (let index = 0; index < 8; index++) assert.equal(await request('198.51.100.1'), 400);
    assert.equal(await request('198.51.100.1'), 429);
    assert.equal(await request('198.51.100.2'), 400);
    for (let index = 0; index < 8; index++) assert.equal(await request(`192.0.2.${index + 1}, 203.0.113.8`), 400);
    assert.equal(await request('192.0.2.99, 203.0.113.8'), 429);
  } finally {
    await new Promise(resolve => server.close(resolve));
    closeDb();
    rmSync(directory, { recursive: true, force: true });
    for (const [key, value] of Object.entries(saved)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
