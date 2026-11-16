export function PixelitoLogo() {
  return (
    <span className="pixelito-logo-art" aria-hidden="true">
      <img className="pixelito-logo-art__symbol" src="/assets/brand/logo-pixelito-symbole.svg" width="228" height="217" alt="" />
      <img className="pixelito-logo-art__type" src="/assets/brand/logo-pixelito-typo.svg" width="884" height="248" alt="" />
    </span>
  )
}

export function PixelitoLoading({ label = 'Chargement…', page = false }: { label?: string; page?: boolean }) {
  return (
    <div className={`loading-state${page ? ' loading-state--page' : ''}`} role="status">
      <span className="pixelito-loader" aria-hidden="true">
        <img src="/assets/brand/logo-pixelito-symbole.svg" width="228" height="217" alt="" />
      </span>
      <span>{label}</span>
    </div>
  )
}
