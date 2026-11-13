import pixelitoLogo from '../../assets/pixelito-comet-logo.png'

/** Layers reveal the original artwork without changing the selected image. */
export function PixelitoLogo() {
  return (
    <span className="pixelito-logo-art" aria-hidden="true">
      <img className="pixelito-logo-art__word" src={pixelitoLogo} width="2172" height="724" alt="" />
      <img className="pixelito-logo-art__trail" src={pixelitoLogo} width="2172" height="724" alt="" />
      <img className="pixelito-logo-art__mascot" src={pixelitoLogo} width="2172" height="724" alt="" />
    </span>
  )
}

export function PixelitoLoading({ label = 'Chargement…', page = false }: { label?: string; page?: boolean }) {
  return (
    <div className={`loading-state${page ? ' loading-state--page' : ''}`} role="status">
      <span className="pixelito-loader" aria-hidden="true">
        <svg viewBox="0 0 100 52" focusable="false">
          <g className="pixelito-loader__trail">
            <rect x="3" y="38" width="8" height="8" rx="1.5" fill="#ffac70" />
            <rect x="17" y="29" width="11" height="11" rx="2" fill="#ff8c22" />
            <rect x="32" y="18" width="14" height="14" rx="2" fill="#ff4b00" />
          </g>
          <path fill="#ff4b00" d="M61 4h22a3 3 0 0 1 3 3v4h3a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3h-3v3a3 3 0 0 1-3 3H57a3 3 0 0 1-3-3v-4h-2a3 3 0 0 1-3-3v-9h-4a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h9V7a3 3 0 0 1 3-3z" />
          <rect x="64" y="17" width="7" height="13" rx="1.5" fill="#fff" />
          <rect x="78" y="17" width="7" height="13" rx="1.5" fill="#fff" />
        </svg>
      </span>
      <span>{label}</span>
    </div>
  )
}
