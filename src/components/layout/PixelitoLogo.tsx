import { useId } from 'react'
import symbolArtwork from '../../assets/logo-pixelito-symbole.svg?raw'

const symbolContent = symbolArtwork.slice(symbolArtwork.indexOf('>') + 1, symbolArtwork.lastIndexOf('</svg>'))

function PixelitoSymbol({ loading = false }: { loading?: boolean }) {
  const id = useId()
  // Trusted build-time artwork, identical to the selected SVG. Scope paint IDs
  // because the header, footer and loader can coexist in the same document.
  const content = symbolContent
    .replaceAll('pixelito-gradient', `${id}-gradient`)
    .replaceAll('pixelito-grain', `${id}-grain`)
    .replace('id="pixelito-symbole"', '')
    .replace('id="bande-haute"', 'class="pixelito-symbol__part pixelito-symbol__part--top"')
    .replace('id="bande-degradee"', 'class="pixelito-symbol__part pixelito-symbol__part--middle"')
    .replace('id="bande-basse"', 'class="pixelito-symbol__part pixelito-symbol__part--bottom"')
  return (
    <span className={`pixelito-symbol${loading ? ' pixelito-symbol--loading' : ''}`}>
      <svg viewBox="0 0 228 217" width="228" height="217" focusable="false" dangerouslySetInnerHTML={{ __html: content }} />
    </span>
  )
}

export function PixelitoLogo({ intro = false }: { intro?: boolean }) {
  return (
    <span className={`pixelito-logo-art${intro ? ' pixelito-logo-art--intro' : ''}`} aria-hidden="true">
      <PixelitoSymbol />
      <img className="pixelito-logo-art__type" src="/assets/brand/logo-pixelito-typo.svg" width="884" height="248" alt="" />
    </span>
  )
}

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
