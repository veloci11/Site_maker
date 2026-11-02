import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, symlinkSync, rmSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, closeDb, dataDirectory } from '../server/db.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
test('database refuses public paths before creating sensitive files', () => {
  const previous = process.env.DATA_DIR;
  try {
    for (const base of ['public', 'dist/client']) {
      process.env.DATA_DIR = path.join(root, base, `private-test-${Date.now()}`);
      assert.throws(() => getDb(), /dossier privé/);
      assert.equal(existsSync(path.join(process.env.DATA_DIR, 'studio.sqlite')), false);
    }
  } finally { closeDb(); if (previous === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previous; }
});
test('a symlink cannot turn a private storage path into a public one', () => {
  const previous = process.env.DATA_DIR;
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'studio-private-'));
  try {
    symlinkSync(path.join(root, 'public'), path.join(temporary, 'link'));
    process.env.DATA_DIR = path.join(temporary, 'link', 'secret');
    assert.throws(() => dataDirectory(), /dossier privé/);
  } finally { closeDb(); rmSync(temporary, { recursive: true, force: true }); if (previous === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previous; }
});
