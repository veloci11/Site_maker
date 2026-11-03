import { createHash } from 'node:crypto';
import multer from 'multer';
import sharp from 'sharp';

const MAX_FILES = 6;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const MAX_PAYLOAD_BYTES = 64 * 1024;
const MAX_TRANSPORT_BYTES = MAX_TOTAL_BYTES + MAX_PAYLOAD_BYTES + 128 * 1024;
const MAX_PIXELS = 16_000_000;
const states = new WeakMap();
const imageStates = new WeakMap();
let activeMultipart = 0;
let activeImageValidations = 0;

const errors = Object.freeze({
  INQUIRY_MULTIPART_INVALID: [400, 'Les informations envoyées ne sont pas lisibles. Réessayez depuis le formulaire.'],
  INQUIRY_IMAGE_INVALID: [400, 'Une image est illisible ou incomplète. Choisissez un autre fichier.'],
  INQUIRY_UPLOAD_LIMIT: [413, 'Ajoutez au maximum six images de 5 Mio chacune, dans la limite de 20 Mio au total.'],
  INQUIRY_PAYLOAD_LIMIT: [413, 'Les informations de votre demande sont trop volumineuses.'],
  INQUIRY_IMAGE_PIXEL_LIMIT: [413, 'Chaque image peut contenir au maximum 16 millions de pixels.'],
  INQUIRY_IMAGE_TYPE: [415, 'Ajoutez uniquement des images JPEG, PNG ou WebP non animées, avec une extension correspondante.'],
  INQUIRY_TRANSPORT_TYPE: [415, 'Utilisez le formulaire pour envoyer votre demande.'],
  INQUIRY_UPLOAD_BUSY: [429, 'Deux envois d’images sont déjà en cours. Réessayez dans un instant.'],
});

/** Only allowlisted messages and codes may be returned by the inquiry route. */
export class InquiryImageError extends Error {
  constructor(code) {
    const safeCode = Object.hasOwn(errors, code) ? code : 'INQUIRY_MULTIPART_INVALID';
    super(errors[safeCode][1]);
    this.name = 'InquiryImageError';
    this.code = safeCode;
    this.status = errors[safeCode][0];
  }
}

function clearFiles(req) {
  for (const file of req.files || []) delete file.buffer;
}

function fail(state, error) {
  if (state.failure) return;
  state.failure = error;
  for (const cancel of [...state.pending]) cancel(error);
  clearFiles(state.req);
  if (state.parser && !state.parser.destroyed) state.parser.destroy(error);
}

// Each request owns its counters and buffers. No file or temporary directory is
// created, and the aggregate limit is checked before retaining the next chunk.
const storage = {
  _handleFile(req, file, callback) {
    const state = states.get(req);
    let chunks = [], size = 0, settled = false;
    function finish(error) {
      if (settled) return;
      settled = true;
      file.stream.removeListener('data', onData);
      file.stream.removeListener('end', onEnd);
      file.stream.removeListener('error', onError);
      file.stream.removeListener('close', onClose);
      state.pending.delete(cancel);
      const result = error ? undefined : { buffer: Buffer.concat(chunks, size), size };
      chunks = [];
      callback(error, result);
    }
    function cancel(error) { finish(error); file.stream.resume(); }
    function onData(chunk) {
      if (state.failure) return cancel(state.failure);
      if (size + chunk.length > MAX_FILE_BYTES || state.total + chunk.length > MAX_TOTAL_BYTES) {
        return fail(state, new InquiryImageError('INQUIRY_UPLOAD_LIMIT'));
      }
      size += chunk.length;
      state.total += chunk.length;
      chunks.push(chunk);
    }
    function onEnd() { finish(); }
    function onError() { finish(new InquiryImageError('INQUIRY_MULTIPART_INVALID')); }
    function onClose() { if (!file.stream.readableEnded) onError(); }
    state.pending.add(cancel);
    if (state.failure) return cancel(state.failure);
    file.stream.on('data', onData);
    file.stream.once('end', onEnd);
    file.stream.once('error', onError);
    file.stream.once('close', onClose);
  },
  _removeFile(_req, file, callback) { delete file.buffer; callback(); },
};

function declaredType(file) {
  if (typeof file.originalname !== 'string' || typeof file.mimetype !== 'string') throw new InquiryImageError('INQUIRY_IMAGE_TYPE');
  const basename = file.originalname.normalize('NFKC').replaceAll('\\', '/').split('/').at(-1);
  const extension = basename.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  const mime = file.mimetype.toLowerCase();
  const format = mime === 'image/jpeg' && ['jpg', 'jpeg'].includes(extension) ? 'jpeg'
    : mime === 'image/png' && extension === 'png' ? 'png'
      : mime === 'image/webp' && extension === 'webp' ? 'webp' : null;
  if (!format) throw new InquiryImageError('INQUIRY_IMAGE_TYPE');
  const suffix = `.${extension}`;
  const stem = basename.slice(0, -suffix.length).replace(/[^\p{L}\p{N}._ -]/gu, '_').replace(/\s+/g, ' ').replace(/^[. ]+|[. ]+$/g, '') || 'image';
  const originalName = Array.from(stem).slice(0, 120 - suffix.length).join('') + suffix;
  return { format, mime, originalName };
}

const upload = multer({
  storage,
  defParamCharset: 'utf8',
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES, fields: 1, fieldNameSize: 32, fieldSize: MAX_PAYLOAD_BYTES, parts: 7, fieldNestingDepth: 0, fieldArrayIndexLimit: 0 },
  fileFilter(_req, file, callback) {
    try { declaredType(file); callback(null, true); } catch (error) { callback(error); }
  },
  streamHandler(req, parser) {
    const state = states.get(req);
    state.parser = parser;
    parser.prependListener('field', name => {
      state.fields++;
      if (name !== 'payload' || state.fields !== 1) fail(state, new InquiryImageError('INQUIRY_MULTIPART_INVALID'));
    });
    parser.prependListener('file', (name, _stream, info) => {
      if (name !== 'files' || !info.filename) fail(state, new InquiryImageError('INQUIRY_MULTIPART_INVALID'));
    });
    req.pipe(parser);
  },
}).array('files', MAX_FILES);

function transportError(error) {
  if (error instanceof InquiryImageError) return error;
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FIELD_VALUE') return new InquiryImageError('INQUIRY_PAYLOAD_LIMIT');
    if (['LIMIT_FILE_SIZE', 'LIMIT_FILE_COUNT', 'LIMIT_PART_COUNT'].includes(error.code)) return new InquiryImageError('INQUIRY_UPLOAD_LIMIT');
  }
  return new InquiryImageError('INQUIRY_MULTIPART_INVALID');
}

function respond(res, error) {
  if (res.headersSent || res.destroyed) return;
  if (error.status === 429) res.set('Retry-After', '5');
  res.status(error.status).json({ error: error.message, code: error.code });
}

/** Place after CSRF and rate limiting. JSON parsing belongs to the app. */
export function parseInquiryTransport(req, res, next) {
  const type = (req.get('content-type') || '').split(';', 1)[0].trim().toLowerCase();
  if (type === 'application/json') return next();
  if (type !== 'multipart/form-data') return respond(res, new InquiryImageError('INQUIRY_TRANSPORT_TYPE'));
  if (activeMultipart >= 2) return respond(res, new InquiryImageError('INQUIRY_UPLOAD_BUSY'));
  if (Number(req.get('content-length')) > MAX_TRANSPORT_BYTES) return respond(res, new InquiryImageError('INQUIRY_UPLOAD_LIMIT'));

  activeMultipart++;
  const state = { req, total: 0, wireBytes: 0, fields: 0, pending: new Set(), failure: null, parser: null, released: false, cancelled: false };
  states.set(req, state);
  function release() {
    if (state.released) return;
    state.released = true;
    state.cancelled = !res.writableFinished;
    activeMultipart--;
    if (state.pending.size) fail(state, new InquiryImageError('INQUIRY_MULTIPART_INVALID'));
    clearFiles(req);
    state.total = 0;
    states.delete(req);
    req.removeListener('data', onData);
    req.removeListener('aborted', onAbort);
    res.removeListener('finish', release);
    res.removeListener('close', release);
  }
  function onData(chunk) {
    state.wireBytes += chunk.length;
    if (state.wireBytes > MAX_TRANSPORT_BYTES) fail(state, new InquiryImageError('INQUIRY_UPLOAD_LIMIT'));
  }
  function onAbort() { fail(state, new InquiryImageError('INQUIRY_MULTIPART_INVALID')); release(); }
  req.on('data', onData);
  req.once('aborted', onAbort);
  res.once('finish', release);
  res.once('close', release);

  upload(req, res, error => {
    if (req.aborted || res.destroyed) return release();
    if (error || state.failure) {
      clearFiles(req);
      return respond(res, transportError(state.failure || error));
    }
    try {
      if (state.fields !== 1 || Object.keys(req.body).length !== 1 || typeof req.body.payload !== 'string') throw new InquiryImageError('INQUIRY_MULTIPART_INVALID');
      if (Buffer.byteLength(req.body.payload, 'utf8') > MAX_PAYLOAD_BYTES) throw new InquiryImageError('INQUIRY_PAYLOAD_LIMIT');
      const payload = JSON.parse(req.body.payload);
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new InquiryImageError('INQUIRY_MULTIPART_INVALID');
      req.body = payload;
      imageStates.set(req.files, state);
    } catch (error) {
      clearFiles(req);
      return respond(res, transportError(error));
    }
    return next();
  });
}

function verifyContainer(bytes, format) {
  if (format === 'png') {
    if (bytes.length < 33 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new InquiryImageError('INQUIRY_IMAGE_TYPE');
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const length = bytes.readUInt32BE(offset), kind = bytes.toString('ascii', offset + 4, offset + 8);
      const end = offset + length + 12;
      if (end > bytes.length || (offset === 8 && (kind !== 'IHDR' || length !== 13))) break;
      if (['acTL', 'fcTL', 'fdAT'].includes(kind)) throw new InquiryImageError('INQUIRY_IMAGE_TYPE');
      if (kind === 'IEND') {
        if (length === 0 && end === bytes.length) return;
        break;
      }
      offset = end;
    }
    throw new InquiryImageError('INQUIRY_IMAGE_INVALID');
  }
  if (format === 'jpeg') {
    if (bytes.length < 4 || bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) throw new InquiryImageError('INQUIRY_IMAGE_TYPE');
    if (bytes[bytes.length - 2] !== 255 || bytes[bytes.length - 1] !== 217) throw new InquiryImageError('INQUIRY_IMAGE_INVALID');
    return;
  }
  if (bytes.length < 20 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new InquiryImageError('INQUIRY_IMAGE_TYPE');
  if (bytes.readUInt32LE(4) + 8 !== bytes.length) throw new InquiryImageError('INQUIRY_IMAGE_INVALID');
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const kind = bytes.toString('ascii', offset, offset + 4), length = bytes.readUInt32LE(offset + 4);
    const end = offset + 8 + length + (length % 2);
    if (end > bytes.length) break;
    if (['ANIM', 'ANMF'].includes(kind) || (kind === 'VP8X' && length && (bytes[offset + 8] & 2))) throw new InquiryImageError('INQUIRY_IMAGE_TYPE');
    offset = end;
  }
  if (offset !== bytes.length) throw new InquiryImageError('INQUIRY_IMAGE_INVALID');
}

/** Returns only the snapshotted original bytes that were actually decoded. */
export async function validateInquiryImages(files) {
  if (files === undefined) return [];
  if (!Array.isArray(files)) throw new InquiryImageError('INQUIRY_MULTIPART_INVALID');
  if (files.length > MAX_FILES) throw new InquiryImageError('INQUIRY_UPLOAD_LIMIT');
  if (!files.length) return [];
  // Closing a response releases its transport buffers, but a native decode may
  // still be running. Keep this independent permit until validation settles.
  if (activeImageValidations >= 2) throw new InquiryImageError('INQUIRY_UPLOAD_BUSY');
  activeImageValidations++;
  const state = imageStates.get(files);
  const checkCancelled = () => {
    if (state?.cancelled || state?.failure) throw new InquiryImageError('INQUIRY_MULTIPART_INVALID');
  };
  try {
    checkCancelled();
    let total = 0;
    const snapshots = files.map(file => {
      if (!file || !Buffer.isBuffer(file.buffer) || !file.buffer.length || (file.size !== undefined && file.size !== file.buffer.length)) throw new InquiryImageError('INQUIRY_IMAGE_INVALID');
      total += file.buffer.length;
      if (file.buffer.length > MAX_FILE_BYTES || total > MAX_TOTAL_BYTES) throw new InquiryImageError('INQUIRY_UPLOAD_LIMIT');
      const declared = declaredType(file);
      return { ...declared, bytes: Buffer.from(file.buffer) };
    });
    const validated = [];
    for (const { format, mime, originalName, bytes } of snapshots) {
      checkCancelled();
      verifyContainer(bytes, format);
      const decoder = sharp(bytes, { failOn: 'warning', limitInputPixels: MAX_PIXELS, pages: 1, sequentialRead: true });
      try {
        const metadata = await decoder.metadata();
        checkCancelled();
        if (metadata.format !== format || (metadata.pages || 1) !== 1) throw new InquiryImageError('INQUIRY_IMAGE_TYPE');
        const { width, height } = metadata;
        if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) throw new InquiryImageError('INQUIRY_IMAGE_INVALID');
        if (width * height > MAX_PIXELS) throw new InquiryImageError('INQUIRY_IMAGE_PIXEL_LIMIT');
        // stats() evaluates every input pixel while returning only fixed-size
        // statistics, instead of retaining a raw or re-encoded output image.
        await decoder.stats();
        checkCancelled();
        validated.push({ originalName, mime, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), bytes, width, height });
      } catch (error) {
        if (error instanceof InquiryImageError) throw error;
        if (/pixel limit/i.test(error?.message || '')) throw new InquiryImageError('INQUIRY_IMAGE_PIXEL_LIMIT');
        throw new InquiryImageError('INQUIRY_IMAGE_INVALID');
      } finally { decoder.destroy(); }
    }
    return validated;
  } finally { activeImageValidations--; }
}
