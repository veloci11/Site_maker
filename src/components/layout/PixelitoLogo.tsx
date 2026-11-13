import './pixelito.css'

/** The companion keeps the stepped silhouette and two eyes of the chosen logo. */
export function PixelitoMascot({ trail = false }: { trail?: boolean }) {
  return (
    <svg viewBox={trail ? '0 0 100 52' : '40 0 56 52'} focusable="false" aria-hidden="true">
      {trail ? <g className="pixelito-loader__trail" fill="currentColor">
        <rect x="3" y="38" width="8" height="8" rx="1.5" opacity=".4" />
        <rect x="17" y="29" width="11" height="11" rx="2" opacity=".65" />
        <rect x="32" y="18" width="14" height="14" rx="2" opacity=".85" />
      </g> : null}
      <path fill="currentColor" d="M61 4h22a3 3 0 0 1 3 3v4h3a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3h-3v3a3 3 0 0 1-3 3H57a3 3 0 0 1-3-3v-4h-2a3 3 0 0 1-3-3v-9h-4a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h9V7a3 3 0 0 1 3-3z" />
      <g className="pixelito-eyes" fill="#fff">
        <rect x="64" y="17" width="7" height="13" rx="1.5" />
        <rect x="78" y="17" width="7" height="13" rx="1.5" />
      </g>
    </svg>
  )
}

function PixelitoI({ index }: { index: number }) {
  return <span className="pixelito-wordmark__i">ı<span className="pixelito-wordmark__dot" data-pixelito-dot={index} /></span>
}

export function PixelitoLogo() {
  return (
    <span className="pixelito-logo" aria-hidden="true">
      <span className="pixelito-logo__home"><PixelitoMascot /></span>
      <span className="pixelito-wordmark">p<PixelitoI index={0} />xel<PixelitoI index={1} />to</span>
    </span>
  )
}

export function PixelitoLoading({ label = 'Chargement…', page = false }: { label?: string; page?: boolean }) {
  return (
    <div className={`loading-state${page ? ' loading-state--page' : ''}`} role="status">
      <span className="pixelito-loader" aria-hidden="true"><PixelitoMascot trail /></span>
      <span>{label}</span>
    </div>
  )
}
