import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('the real development server refuses private storage through both static URL forms', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const cache = await mkdtemp(path.join(os.tmpdir(), 'studio-vite-test-'));
  const filename = `private-test-${randomUUID()}.txt`;
  const fixture = path.join(root, '.data', filename);
  const marker = randomUUID();
  await mkdir(path.dirname(fixture), { recursive: true, mode: 0o700 });
  await writeFile(fixture, marker, { mode: 0o600 });
  let server;
  try {
    server = await createServer({ root, configFile: path.join(root, 'vite.config.mjs'), cacheDir: cache, logLevel: 'silent', server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false, warmup: { clientFiles: [] } }, optimizeDeps: { noDiscovery: true, include: [] } });
    await server.listen();
    const base = `http://127.0.0.1:${server.httpServer.address().port}`;
    for (const url of [`/.data/${filename}`, `/@fs/${fixture}`]) {
      const response = await fetch(base + url);
      assert.equal(response.status, 403);
      assert.ok(!(await response.text()).includes(marker));
    }
    assert.equal((await fetch(base + '/src/main.tsx')).status, 200);
  } finally {
    await server?.close();
    await rm(fixture, { force: true });
    await rm(cache, { recursive: true, force: true });
  }
});
