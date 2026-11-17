import { memo, useId, useMemo } from 'react'
import symbolArtwork from '../../assets/logo-pixelito-symbole.svg?raw'

const symbolDefinitions = symbolArtwork.match(/<defs>[\s\S]*?<\/defs>/)![0]
const symbolParts = [
  { name: 'top', source: 'haute' },
  { name: 'middle', source: 'degradee' },
  { name: 'bottom', source: 'basse' },
].map(({ name, source }) => ({
  name,
  artwork: (name === 'middle' ? symbolDefinitions : '')
    + symbolArtwork.match(new RegExp(`<g id="bande-${source}"[\\s\\S]*?<\\/g><\\/g>`))![0]
      .replace(`id="bande-${source}"`, ''),
}))

function PixelitoSymbol({ loading = false }: { loading?: boolean }) {
  const id = useId()
  // Trusted build-time artwork, identical to the selected SVG. Scope paint IDs
  // because the header, footer and loader can coexist in the same document.
  // Keep the innerHTML payload stable: a menu render must not replace the SVG
  // paths and replay their CSS entrance.
  const parts = useMemo(() => symbolParts.map(part => ({
    name: part.name,
    markup: { __html: part.artwork
      .replaceAll('pixelito-gradient', `${id}-gradient`)
      .replaceAll('pixelito-grain', `${id}-grain`) },
  })), [id])
  return (
    <span className={`pixelito-symbol${loading ? ' pixelito-symbol--loading' : ''}`}>
      {parts.map(part => (
        <span key={part.name} className={`pixelito-symbol__part pixelito-symbol__part--${part.name}`}>
          <svg viewBox="0 0 228 217" width="228" height="217" focusable="false" dangerouslySetInnerHTML={part.markup} />
        </span>
      ))}
    </span>
  )
}

export const PixelitoLogo = memo(function PixelitoLogo({ intro = false }: { intro?: boolean }) {
  return (
    <span className={`pixelito-logo-art${intro ? ' pixelito-logo-art--intro' : ''}`} aria-hidden="true">
      <PixelitoSymbol />
      <img className="pixelito-logo-art__type" src="/assets/brand/logo-pixelito-typo.svg" width="884" height="248" alt="" />
    </span>
  )
})

export function PixelitoLoading({ label = 'Chargement…', page = false }: { label?: string; page?: boolean }) {
  return (
    <div className={`loading-state${page ? ' loading-state--page' : ''}`} role="status">
      <span className="pixelito-loader" aria-hidden="true">
        <PixelitoSymbol loading />
      </span>
      <span>{label}</span>
    </div>
  )
}
