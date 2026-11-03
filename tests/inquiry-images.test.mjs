import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { request } from 'node:http';
import { once } from 'node:events';
import { InquiryImageError, parseInquiryTransport, validateInquiryImages } from '../server/inquiry-images.mjs';

const MiB = 1024 * 1024;
const image = (buffer, originalname = 'image.png', mimetype = 'image/png') => ({ buffer, size: buffer.length, originalname, mimetype });
const png = () => sharp({ create: { width: 12, height: 9, channels: 4, background: '#c04e8fff' } }).png().toBuffer();
const boundary = 'studio-inquiry-test-boundary';

function multipart(parts) {
  const chunks = [];
  for (const part of parts) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${part.name}"${part.filename === undefined ? '' : `; filename="${part.filename}"`}\r\n${part.mime ? `Content-Type: ${part.mime}\r\n` : ''}\r\n`));
    chunks.push(Buffer.isBuffer(part.value) ? part.value : Buffer.from(part.value));
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}
const payload = value => ({ name: 'payload', value: JSON.stringify(value) });
const part = (value, filename = 'image.png', mime = 'image/png') => ({ name: 'files', value, filename, mime });

async function fixture(t, { validate = true, handler, incoming } = {}) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  if (incoming) app.use((req, res, next) => { incoming(req, res); next(); });
  app.post('/', parseInquiryTransport, async (req, res) => {
    if (handler) return handler(req, res);
    const images = validate ? await validateInquiryImages(req.files) : (req.files || []).map(file => ({ size: file.size }));
    res.json({ body: req.body, images: images.map(({ bytes: _bytes, ...metadata }) => metadata) });
  });
  app.use((error, _req, res, _next) => {
    if (error instanceof InquiryImageError) return res.status(error.status).json({ error: error.message, code: error.code });
    res.status(500).json({ error: 'Erreur de test.' });
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}/`;
  return { base, async send(parts, headers = {}) {
    const response = await fetch(base, { method: 'POST', headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, ...headers }, body: multipart(parts) });
    return { status: response.status, body: await response.json() };
  } };
}

function rejectsImage(files, status, code) {
  return assert.rejects(validateInquiryImages(files), error => error instanceof InquiryImageError && error.status === status && (!code || error.code === code));
}

test('PNG, JPEG and WebP are decoded and preserve original bytes and their hash', async () => {
  for (const [format, mime, suffix] of [['png', 'image/png', 'png'], ['jpeg', 'image/jpeg', 'jpg'], ['webp', 'image/webp', 'webp']]) {
    const bytes = await sharp(await png()).toFormat(format).toBuffer();
    const [result] = await validateInquiryImages([image(bytes, `référence.${suffix}`, mime)]);
    assert.equal(result.width, 12);
    assert.equal(result.height, 9);
    assert.equal(result.mime, mime);
    assert.equal(result.size, bytes.length);
    assert.equal(result.originalName, `référence.${suffix}`);
    assert.deepEqual(result.bytes, bytes);
    assert.notEqual(result.bytes, bytes);
    assert.equal(result.sha256, createHash('sha256').update(bytes).digest('hex'));
  }
  assert.deepEqual(await validateInquiryImages(undefined), []);
  assert.deepEqual(await validateInquiryImages([]), []);
});

test('filenames are reduced to a safe basename of at most 120 characters', async () => {
  const [result] = await validateInquiryImages([image(await png(), `..\\répertoire\\../<nom>\u0000${'a'.repeat(150)}.PNG`)]);
  assert.ok(result.originalName.length <= 120);
  assert.equal(/[\\/<>\u0000-\u001f]/.test(result.originalName), false);
  assert.equal(result.originalName.startsWith('.'), false);
  assert.equal(result.originalName.endsWith('.png'), true);
});

test('the validated snapshot cannot change when the source buffer is changed during decoding', async () => {
  const bytes = await png(), original = Buffer.from(bytes);
  const pending = validateInquiryImages([image(bytes)]);
  bytes.fill(0);
  const [result] = await pending;
  assert.deepEqual(result.bytes, original);
  assert.equal(result.sha256, createHash('sha256').update(original).digest('hex'));
});

test('extensions, MIME declarations and actual signatures must all agree', async () => {
  const bytes = await png();
  for (const file of [image(bytes, 'image.svg', 'image/svg+xml'), image(bytes, 'image.jpg', 'image/png'), image(bytes, 'image.png', 'image/jpeg'), image(bytes, 'image.webp', 'image/webp'), image(Buffer.from('<svg/>')), image(Buffer.from('%PDF-1.7')), image(Buffer.from('GIF89a')), image(Buffer.from('glTF')), image(bytes, 'image.heic', 'image/heic')]) {
    await rejectsImage([file], 415, 'INQUIRY_IMAGE_TYPE');
  }
  await rejectsImage([image(Buffer.alloc(0))], 400);
  await rejectsImage([image(bytes, 'image.png', 'image/png; charset=utf-8')], 415);
});

test('truncated containers and corrupt encoded pixels are refused', async () => {
  for (const [format, name, mime] of [['png', 'image.png', 'image/png'], ['jpeg', 'image.jpg', 'image/jpeg'], ['webp', 'image.webp', 'image/webp']]) {
    const bytes = await sharp(await png()).toFormat(format).toBuffer();
    await rejectsImage([image(bytes.subarray(0, bytes.length - 3), name, mime)], 400);
  }
  const corrupt = Buffer.from(await png());
  const start = corrupt.indexOf(Buffer.from('IDAT')) + 4;
  corrupt.fill(0, start, start + 8);
  // The header still parses; rejecting this input requires decoding pixels.
  assert.equal((await sharp(corrupt).metadata()).width, 12);
  await rejectsImage([image(corrupt)], 400, 'INQUIRY_IMAGE_INVALID');
});

test('compressed images over 16 million pixels are refused before pixel processing', async () => {
  const bytes = await sharp({ create: { width: 4001, height: 4000, channels: 3, background: 'white' } }).png().toBuffer();
  assert.ok(bytes.length < 5 * MiB);
  await rejectsImage([image(bytes)], 413, 'INQUIRY_IMAGE_PIXEL_LIMIT');
});

test('animated WebP and PNG animation control chunks are refused', async () => {
  const frames = Buffer.concat([Buffer.alloc(4 * 4 * 3, 30), Buffer.alloc(4 * 4 * 3, 200)]);
  const animated = await sharp(frames, { raw: { width: 4, height: 8, channels: 3, pageHeight: 4 } }).webp({ delay: [100, 100], loop: 0 }).toBuffer();
  assert.equal((await sharp(animated, { animated: true }).metadata()).pages, 2);
  await rejectsImage([image(animated, 'image.webp', 'image/webp')], 415);
  const bytes = await png();
  const control = Buffer.alloc(20);
  control.writeUInt32BE(8, 0);
  control.write('acTL', 4);
  control.writeUInt32BE(2, 8);
  await rejectsImage([image(Buffer.concat([bytes.subarray(0, 33), control, bytes.subarray(33)]))], 415);
});

test('validation independently enforces image count, individual and aggregate byte limits', async () => {
  const small = image(await png());
  await rejectsImage(Array(7).fill(small), 413);
  await rejectsImage([image(Buffer.alloc(5 * MiB + 1))], 413);
  await rejectsImage(Array.from({ length: 5 }, () => image(Buffer.alloc(4 * MiB + 1))), 413);
  await rejectsImage([{ ...small, size: small.size + 1 }], 400);
  await rejectsImage({ files: [small] }, 400);
});

test('multipart payload and repeated images arrive atomically as parsed JSON and validated images', async t => {
  const f = await fixture(t);
  const result = await f.send([payload({ requestId: 'test', message: 'Un projet.' }), part(await png()), part(await sharp(await png()).jpeg().toBuffer(), 'image.jpg', 'image/jpeg')]);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.body, { requestId: 'test', message: 'Un projet.' });
  assert.equal(result.body.images.length, 2);
  assert.equal(result.body.images[0].width, 12);
  assert.equal(JSON.stringify(result.body).includes('bytes'), false);
});

test('application/json passes through and unsupported transports return a safe error', async t => {
  const f = await fixture(t);
  const response = await fetch(f.base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hello: 'world' }) });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).body, { hello: 'world' });
  const other = await fetch(f.base, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'private-details' });
  assert.equal(other.status, 415);
  assert.equal((await other.json()).code, 'INQUIRY_TRANSPORT_TYPE');
});

test('missing, duplicate, nested, unknown and invalid JSON fields are refused', async t => {
  const f = await fixture(t);
  for (const parts of [[], [part(await png())], [payload({}), payload({})], [{ name: 'other', value: '{}' }], [{ name: 'payload[x]', value: '{}' }], [{ name: '__proto__[x]', value: '{}' }], [{ name: 'payload', value: '{broken' }], [{ name: 'payload', value: 'null' }], [{ name: 'payload', value: '[]' }], [payload({}), { ...part(await png()), name: 'unexpected' }], [payload({}), part(await png(), '')]]) {
    const result = await f.send(parts);
    assert.equal(result.status, 400, JSON.stringify(parts.map(({ name, filename }) => ({ name, filename }))));
    assert.equal(result.body.code, 'INQUIRY_MULTIPART_INVALID');
  }
});

test('malformed boundaries and prematurely ended multipart bodies return 400 without parser details', async t => {
  const f = await fixture(t);
  for (const [contentType, body] of [['multipart/form-data', 'untrusted parser detail'], [`multipart/form-data; boundary=${boundary}`, `--${boundary}\r\nContent-Disposition: form-data; name="payload"\r\n\r\n{}`]]) {
    const response = await fetch(f.base, { method: 'POST', headers: { 'Content-Type': contentType }, body });
    assert.equal(response.status, 400);
    const result = await response.json();
    assert.equal(result.code, 'INQUIRY_MULTIPART_INVALID');
    assert.equal(result.error.includes('boundary'), false);
    assert.equal(result.error.includes('untrusted'), false);
  }
});

test('multipart enforces exact payload, file and aggregate byte boundaries', async t => {
  const f = await fixture(t, { validate: false });
  assert.equal((await f.send([payload({ x: 'x'.repeat(64 * 1024 - 8) })])).status, 200);
  assert.equal((await f.send([payload({ x: 'x'.repeat(64 * 1024 - 7) })])).status, 413);
  assert.equal((await f.send([payload({}), part(Buffer.alloc(5 * MiB))])).status, 200);
  assert.equal((await f.send([payload({}), part(Buffer.alloc(5 * MiB + 1))])).status, 413);
  assert.equal((await f.send([payload({}), ...Array.from({ length: 4 }, () => part(Buffer.alloc(5 * MiB)))])).status, 200);
  assert.equal((await f.send([payload({}), ...Array.from({ length: 5 }, () => part(Buffer.alloc(4 * MiB + 1)))])).status, 413);
  assert.equal((await f.send([payload({}), ...Array.from({ length: 6 }, () => part(Buffer.alloc(1)))])).status, 200);
  assert.equal((await f.send([payload({}), ...Array.from({ length: 7 }, () => part(Buffer.alloc(1)))])).status, 413);
});

test('two active multipart requests reject another multipart immediately while JSON remains available', async t => {
  const gates = [], entered = [];
  const f = await fixture(t, { handler: async (req, res) => {
    if (req.body.hold) {
      entered.push(true);
      await new Promise(resolve => gates.push(resolve));
    }
    res.json({ ok: true });
  } });
  const first = f.send([payload({ hold: true })]), second = f.send([payload({ hold: true })]);
  while (entered.length < 2) await new Promise(resolve => setImmediate(resolve));
  assert.equal((await f.send([payload({})])).status, 429);
  const json = await fetch(f.base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(json.status, 200);
  for (const release of gates) release();
  assert.deepEqual((await Promise.all([first, second])).map(result => result.status), [200, 200]);
  assert.equal((await f.send([payload({})])).status, 200);
});

test('aborting an incomplete upload releases its permit and retained file buffers', async t => {
  const incoming = [];
  const f = await fixture(t, { validate: false, incoming: (req, res) => incoming.push({ req, res }) });
  function start() {
    const client = request(f.base, { method: 'POST', headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` } });
    client.on('error', () => {});
    client.write(`--${boundary}\r\nContent-Disposition: form-data; name="payload"\r\n\r\n{}\r\n--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="image.png"\r\nContent-Type: image/png\r\n\r\npartial`);
    return client;
  }
  const first = start(), second = start();
  t.after(() => { first.destroy(); second.destroy(); });
  while (incoming.length < 2) await new Promise(resolve => setImmediate(resolve));
  assert.equal((await f.send([payload({})])).status, 429);
  const aborted = once(incoming[0].req, 'aborted');
  first.destroy();
  await aborted;
  assert.equal((await f.send([payload({})])).status, 200);
  assert.ok((incoming[0].req.files || []).every(file => !file.buffer));
  const secondAborted = once(incoming[1].req, 'aborted');
  second.destroy();
  await secondAborted;
  assert.equal((await f.send([payload({})])).status, 200);
});
