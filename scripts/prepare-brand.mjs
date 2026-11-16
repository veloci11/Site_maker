import sharp from 'sharp'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const source = new URL('docs/asset-sources/brand/pixelito-selected-2026-11-16.png', root)
const sourcePath = fileURLToPath(source)
const output = new URL('public/assets/brand/', root)
await mkdir(output, { recursive: true })

// Trace the supplied silhouettes rather than substitute a font. Potrace is needed
// only for this preparation command; builds use the checked-in SVG exports.
const { data, info } = await sharp(sourcePath).removeAlpha().raw().toBuffer({ resolveWithObject: true })
function artworkBounds(area) {
  let left = area.left + area.width, top = area.top + area.height, right = area.left, bottom = area.top
  for (let y = area.top; y < area.top + area.height; y++) {
    for (let x = area.left; x < area.left + area.width; x++) {
      const i = (y * info.width + x) * info.channels
      if (Math.min(data[i], data[i + 1], data[i + 2]) < 220) {
        left = Math.min(left, x); top = Math.min(top, y)
        right = Math.max(right, x); bottom = Math.max(bottom, y)
      }
    }
  }
  return { left: left - 3, top: top - 3, width: right - left + 7, height: bottom - top + 7 }
}
const logoBounds = artworkBounds({ left: 190, top: 210, width: 1200, height: 300 })
const symbolBounds = artworkBounds({ left: 190, top: 230, width: 260, height: 260 })
const wordBounds = artworkBounds({ left: 450, top: 210, width: 940, height: 300 })
function trace(area, isInk) {
  const stride = Math.ceil(area.width / 8)
  const pixels = Buffer.alloc(stride * area.height)
  for (let y = 0; y < area.height; y++) {
    for (let x = 0; x < area.width; x++) {
      const i = ((area.top + y) * info.width + area.left + x) * info.channels
      if (isInk(data[i], data[i + 1], data[i + 2], x, y)) pixels[y * stride + (x >> 3)] |= 128 >> (x % 8)
    }
  }
  const bitmap = Buffer.concat([Buffer.from(`P4\n${area.width} ${area.height}\n`), pixels])
  const svg = execFileSync('potrace', ['--svg', '--output', '-', '--alphamax', '1', '--opttolerance', '.15', '--turdsize', '2'], { input: bitmap }).toString()
  return svg.match(/<g\b[\s\S]*<\/g>/)[0].replace('fill="#000000"', '')
}
const dark = (r, g, b) => Math.max(r, g, b) < 150
const topBand = trace(symbolBounds, (r, g, b, x, y) => y < 65 && dark(r, g, b))
const middleBand = trace(symbolBounds, (r, g, b, x, y) => y >= 65 && y < 160 && Math.min(r, g, b) < 235)
const bottomBand = trace(symbolBounds, (r, g, b, x, y) => y >= 160 && dark(r, g, b))
const wordPaths = trace(wordBounds, dark)
const gradientStops = [0, .25, .5, .75, 1].map(position => {
  const column = symbolBounds.left + 4 + Math.round(position * (symbolBounds.width - 9))
  const sums = [0, 0, 0]; let count = 0
  for (let y = symbolBounds.top + 96; y < symbolBounds.top + 133; y++) {
    for (let x = column - 2; x <= column + 2; x++) {
      const i = (y * info.width + x) * info.channels
      if (data[i + 2] - data[i] > 10 && Math.min(data[i], data[i + 1], data[i + 2]) < 235) {
        for (let c = 0; c < 3; c++) sums[c] += data[i + c]
        count++
      }
    }
  }
  if (!count) throw new Error('Gradient sample outside the selected artwork')
  return { position, color: '#' + sums.map(sum => Math.round(sum / count).toString(16).padStart(2, '0')).join('') }
})
const defs = `<defs><linearGradient id="pixelito-gradient" x1="0%" y1="50%" x2="100%" y2="50%">${gradientStops.map(stop => `<stop offset="${stop.position * 100}%" stop-color="${stop.color}"/>`).join('')}</linearGradient><filter id="pixelito-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" seed="5" result="noise"/><feColorMatrix in="noise" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".16"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>`
const symbolGroup = `<g id="pixelito-symbole"><g id="bande-haute" fill="#080808">${topBand}</g><g id="bande-degradee" fill="url(#pixelito-gradient)" filter="url(#pixelito-grain)">${middleBand}</g><g id="bande-basse" fill="#080808">${bottomBand}</g></g>`
const wordGroup = `<g id="pixelito-typographie" fill="#080808">${wordPaths}</g>`
const svgDocument = (width, height, content, definitions = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${definitions}${content}</svg>\n`
const symbol = Buffer.from(svgDocument(symbolBounds.width, symbolBounds.height, symbolGroup, defs))
const word = svgDocument(wordBounds.width, wordBounds.height, wordGroup)
const logo = svgDocument(logoBounds.width, logoBounds.height,
  `<g transform="translate(${symbolBounds.left - logoBounds.left} ${symbolBounds.top - logoBounds.top})">${symbolGroup}</g><g transform="translate(${wordBounds.left - logoBounds.left} ${wordBounds.top - logoBounds.top})">${wordGroup}</g>`, defs)
for (const [name, svg] of [['logo-pixelito.svg', logo], ['logo-pixelito-symbole.svg', symbol], ['logo-pixelito-typo.svg', word]]) {
  await writeFile(new URL(name, output), svg)
}

const faviconFrames = []
for (const size of [16, 32, 48, 180, 192, 512]) {
  const inset = Math.max(1, Math.round(size * .08))
  const image = await sharp(symbol).resize(size - inset * 2, size - inset * 2, { fit: 'contain', background: '#fff' })
    .flatten({ background: '#fff' }).extend({ top: inset, bottom: inset, left: inset, right: inset, background: '#fff' }).png().toBuffer()
  await writeFile(new URL(`logo-pixelito-${size}.png`, output), image)
  if (size <= 48) faviconFrames.push({ size, image })
}
const header = Buffer.alloc(6 + faviconFrames.length * 16)
header.writeUInt16LE(1, 2); header.writeUInt16LE(faviconFrames.length, 4)
let offset = header.length
faviconFrames.forEach(({ size, image }, index) => {
  const i = 6 + index * 16
  header[i] = size; header[i + 1] = size
  header.writeUInt16LE(1, i + 4); header.writeUInt16LE(32, i + 6)
  header.writeUInt32LE(image.length, i + 8); header.writeUInt32LE(offset, i + 12)
  offset += image.length
})
await writeFile(new URL('public/favicon.ico', root), Buffer.concat([header, ...faviconFrames.map(f => f.image)]))
await writeFile(new URL('public/site.webmanifest', root), JSON.stringify({
  name: 'pixelito', short_name: 'pixelito', start_url: '/', display: 'browser',
  background_color: '#ffffff', theme_color: '#e8def4',
  icons: [192, 512].map(size => ({ src: `/assets/brand/logo-pixelito-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })),
}, null, 2) + '\n')
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
await writeFile(new URL('docs/asset-sources/brand/provenance.json', root), JSON.stringify({
  source: 'docs/asset-sources/brand/pixelito-selected-2026-11-16.png', sourceSha256: hash(await readFile(source)),
  logoBounds, symbolBounds, wordBounds, gradientStops, logoSha256: hash(logo), symbolSha256: hash(symbol),
  treatment: 'Potrace silhouettes from the selected artwork; outlined lettering and separate symbol/wordmark groups and files. Sampled gradient and static SVG grain. No embedded bitmap or font dependency.',
}, null, 2) + '\n')
console.log(JSON.stringify({ logoBounds, symbolBounds, wordBounds, gradientStops }))
