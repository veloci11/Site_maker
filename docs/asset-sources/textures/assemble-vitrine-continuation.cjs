// Rebuild new Vitrine continuation assets without editing the original texture.
// Run from repository root: node docs/asset-sources/textures/assemble-vitrine-continuation.cjs
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../../..');
const sourceDir = __dirname;
const publicDir = path.join(root, 'public/assets/textures');
const width = 1536;
const sourceHeight = 1024;
const overlap = 256;
const newHeight = 2048;

const paths = [1, 2, 3].map((n) => path.join(sourceDir, `vitrine-continuation-outpaint-${n}-2026-11-04.png`));

async function rgb(input) {
  return sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}
async function low(input, sigma) {
  return sharp(input).removeAlpha().blur(sigma).raw().toBuffer();
}
function raw(input, height) { return sharp(input, { raw: { width, height, channels: 3 } }); }
function clamp(value) { return Math.max(0, Math.min(255, Math.round(value))); }

async function main() {
  const originalPath = path.join(publicDir, 'grain-plasma-master.webp');
  const originalBytes = await fs.readFile(originalPath);
  const original = await rgb(originalBytes);
  const originalLow = await low(originalBytes, 24);
  let previousLowRow = originalLow.subarray((sourceHeight - 1) * width * 3);
  const sections = [];
  const seamStats = [];

  for (let index = 0; index < paths.length; index++) {
    const file = await fs.readFile(paths[index]);
    const meta = await sharp(file).metadata();
    if (meta.width !== width || meta.height !== sourceHeight) throw new Error(`Unexpected native panel size: ${paths[index]}`);
    const crop = await sharp(file).extract({ left: 0, top: overlap, width, height: sourceHeight - overlap }).png().toBuffer();
    const section = await rgb(crop);
    const sectionLow = await low(crop, 24);
    const corrected = Buffer.from(section.data);
    const fadeHeight = 192;
    let deltaMax = 0;
    for (let y = 0; y < fadeHeight; y++) {
      const t = y / (fadeHeight - 1);
      const fade = 1 - t * t * (3 - 2 * t);
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          const offset = x * 3 + c;
          const delta = previousLowRow[offset] - sectionLow[offset];
          deltaMax = Math.max(deltaMax, Math.abs(delta));
          const pixel = (y * width + x) * 3 + c;
          corrected[pixel] = clamp(corrected[pixel] + fade * delta);
        }
      }
    }
    const encoded = await raw(corrected, sourceHeight - overlap).png().toBuffer();
    const correctedLow = await low(encoded, 24);
    previousLowRow = correctedLow.subarray((sourceHeight - overlap - 1) * width * 3);
    sections.push(corrected);
    seamStats.push({ panel: index + 1, fadeHeight, maxColorCorrection: deltaMax });
  }

  const assembled = Buffer.concat(sections).subarray(0, width * newHeight * 3);
  // This keeps every generated color current native-size. No resizing, mirroring,
  // sharpening, procedural noise or reuse of the rejected 724px trial occurs.
  const nativePng = await raw(assembled, newHeight).png().toBuffer();
  await fs.writeFile(path.join(sourceDir, 'vitrine-continuation-native-2026-11-04.png'), nativePng);

  // Texture compositing: reuse the source's high-frequency RGB residual,
  // independent of its color field. Small patches are selected by local tone
  // in an irregular order. This transfers the original's crisp point grain;
  // imagegen remains the source of all new large and medium-scale color forms.
  // This is not recovered detail from the rejected low-resolution trial.
  const grainSigma = 4;
  const generatedBase = await low(nativePng, grainSigma);
  const sourceBase = await low(originalBytes, grainSigma);
  function transferGrain(base, height, bandTop) {
    const output = Buffer.from(base);
    const patch = 32;
    const candidates = [];
    for (let sy = bandTop; sy < bandTop + 512; sy += patch) for (let sx = 0; sx < width; sx += patch) {
      const middle = ((sy + patch / 2) * width + sx + patch / 2) * 3;
      candidates.push({ sx, sy, color: sourceBase.subarray(middle, middle + 3) });
    }
    // Choose small original residual patches with the closest underlying tone.
    // This preserves the actual clipped RGB grain distribution and its spatial
    // frequency, rather than amplifying bright-area noise into dark pinholes.
    // Patch order is irregular; only sub-8px residual detail is transferred.
    for (let y = 0; y < height; y += patch) for (let x = 0; x < width; x += patch) {
      const middle = ((y + patch / 2) * width + x + patch / 2) * 3;
      const best = [];
      for (const candidate of candidates) {
        const distance = [0, 1, 2].reduce((sum, c) => sum + (base[middle + c] - candidate.color[c]) ** 2, 0);
        if (best.length < 6 || distance < best[best.length - 1].distance) {
          best.push({ ...candidate, distance });
          best.sort((a, b) => a.distance - b.distance);
          best.length = Math.min(6, best.length);
        }
      }
      const seed = ((x / patch + 1) * 2654435761 ^ (y / patch + 1) * 1597334677) >>> 0;
      const selected = best[seed % best.length];
      for (let py = 0; py < patch && y + py < height; py++) for (let px = 0; px < patch && x + px < width; px++) {
        const sourceOffset = ((selected.sy + py) * width + selected.sx + px) * 3;
        const targetOffset = ((y + py) * width + x + px) * 3;
        for (let c = 0; c < 3; c++) {
          const grain = original.data[sourceOffset + c] - sourceBase[sourceOffset + c];
          output[targetOffset + c] = clamp(base[targetOffset + c] + grain);
        }
      }
    }
    return output;
  }
  const grainMatched = transferGrain(generatedBase, newHeight, 512);

  const grainMatchedPng = await raw(grainMatched, newHeight).png().toBuffer();
  await fs.writeFile(path.join(sourceDir, 'vitrine-continuation-grain-matched-2026-11-04.png'), grainMatchedPng);
  await raw(grainMatched, newHeight).webp({ lossless: true, effort: 6 }).toFile(path.join(publicDir, 'grain-plasma-vitrine-continuation.webp'));
  await raw(grainMatched, newHeight).resize(768, 1024, { kernel: 'lanczos3' }).webp({ quality: 95, effort: 6, smartSubsample: true }).toFile(path.join(publicDir, 'grain-plasma-vitrine-continuation-1x.webp'));
  await raw(assembled, newHeight).webp({ quality: 97, effort: 6, smartSubsample: true }).toFile(path.join(sourceDir, 'vitrine-continuation-native-2026-11-04.webp'));

  const complete = await sharp({ create: { width, height: sourceHeight + newHeight, channels: 3, background: '#000' } })
    .composite([{ input: originalBytes, left: 0, top: 0 }, { input: grainMatchedPng, left: 0, top: sourceHeight }])
    .png().toBuffer();
  const preview = await sharp(complete).resize({ width: 768 }).png().toBuffer();
  await fs.writeFile(path.join(sourceDir, 'vitrine-continuation-complete-preview.png'), preview);

  const upwardFile = await fs.readFile(path.join(sourceDir, 'vitrine-upward-native-2026-11-04.png'));
  const upwardMeta = await sharp(upwardFile).metadata();
  if (upwardMeta.width !== width || upwardMeta.height !== sourceHeight) throw new Error('Unexpected upward native image size');
  const upward = await rgb(upwardFile);
  const upwardLow = await low(upwardFile, 24);
  const upwardCorrected = Buffer.from(upward.data);
  const upwardFadeHeight = 192;
  let upwardDeltaMax = 0;
  for (let y = sourceHeight - upwardFadeHeight; y < sourceHeight; y++) {
    const t = (y - (sourceHeight - upwardFadeHeight)) / (upwardFadeHeight - 1);
    const fade = t * t * (3 - 2 * t);
    for (let x = 0; x < width; x++) for (let c = 0; c < 3; c++) {
      const column = x * 3 + c;
      const delta = originalLow[column] - upwardLow[(sourceHeight - 1) * width * 3 + column];
      upwardDeltaMax = Math.max(upwardDeltaMax, Math.abs(delta));
      const index = (y * width + x) * 3 + c;
      upwardCorrected[index] = clamp(upwardCorrected[index] + delta * fade);
    }
  }
  const upwardCorrectedPng = await raw(upwardCorrected, sourceHeight).png().toBuffer();
  const upwardMatched = transferGrain(await low(upwardCorrectedPng, grainSigma), sourceHeight, 0);
  const upwardMatchedPng = await raw(upwardMatched, sourceHeight).png().toBuffer();
  await fs.writeFile(path.join(sourceDir, 'vitrine-upward-grain-matched-2026-11-04.png'), upwardMatchedPng);
  await raw(upwardMatched, sourceHeight).webp({ lossless: true, effort: 6 }).toFile(path.join(publicDir, 'grain-plasma-vitrine-continuation-top.webp'));
  await raw(upwardMatched, sourceHeight).resize(768, 512, { kernel: 'lanczos3' }).webp({ quality: 95, effort: 6, smartSubsample: true }).toFile(path.join(publicDir, 'grain-plasma-vitrine-continuation-top-1x.webp'));
  const upwardComplete = await sharp({ create: { width, height: sourceHeight * 2, channels: 3, background: '#000' } })
    .composite([{ input: upwardMatchedPng, left: 0, top: 0 }, { input: originalBytes, left: 0, top: sourceHeight }]).png().toBuffer();
  await sharp(upwardComplete).resize({ width: 768 }).png().toFile(path.join(sourceDir, 'vitrine-upward-complete-preview.png'));

  async function fileInfo(name) {
    const bytes = await fs.readFile(path.join(publicDir, name));
    const meta = await sharp(bytes).metadata();
    return { file: name, width: meta.width, height: meta.height, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
  }
  const originals = await Promise.all(['grain-plasma-master.webp', 'grain-plasma-card.webp', 'grain-plasma-detail.webp', 'grain-plasma-vitrine-trial.webp'].map(fileInfo));
  const exports = await Promise.all(['grain-plasma-vitrine-continuation.webp', 'grain-plasma-vitrine-continuation-1x.webp', 'grain-plasma-vitrine-continuation-top.webp', 'grain-plasma-vitrine-continuation-top-1x.webp'].map(fileInfo));
  const report = { originals, exports, generation: { tool: 'built-in image_gen', nativePanelWidth: width, nativePanelHeight: sourceHeight, resizedUpward: false, rejectedPortraitUsed: false }, width, sourceHeight, continuationHeight: newHeight, overlapDiscardedPerPanel: overlap, seamStats, upward: { width, height: sourceHeight, fadeHeight: upwardFadeHeight, maxColorCorrection: upwardDeltaMax, orientation: 'Natural: top is far above; bottom joins original top edge. Rotate 180 degrees with original for custom variant.' }, grainCompositing: { generatedLowPassSigma: grainSigma, sourceHighPassSigma: grainSigma, sourceBands: { downward: 'original rows 512–1023', upward: 'original rows 0–511' }, patchSize: 32, candidateSelection: 'Irregular choice among 6 nearest source-tone patches. No mirror, rotation, noise synthesis or source color-field copying.' }, integration: { originalHeightAtWidthW: '2W/3', downwardHeightAtWidthW: '4W/3', upwardHeightAtWidthW: '2W/3' }, encoding: { main: 'lossless WebP, effort 6', oneX: 'WebP quality95, 50% native width, Lanczos3' } };
  await fs.writeFile(path.join(sourceDir, 'vitrine-continuation-assembly.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
