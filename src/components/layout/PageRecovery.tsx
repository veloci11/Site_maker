/** Shared by render errors and failures while loading a route module. */
export function PageRecovery() {
  return (
    <main className="container page-section" aria-labelledby="page-recovery-title">
      <h1 id="page-recovery-title" className="page-heading">La page n’a pas pu s’ouvrir.</h1>
      <p className="page-subtitle">Vous pouvez recharger la page pour reprendre votre visite.</p>
      <button type="button" className="button" onClick={() => window.location.reload()}>
        Recharger la page
      </button>
    </main>
  )
}
