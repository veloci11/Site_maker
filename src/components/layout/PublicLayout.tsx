import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, Menu } from 'lucide-react'
import { offers } from '../../../shared/catalog'
import { existingSiteOffer } from '../../content/existing-site'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'
import { PageTransition } from './motion'
import { AmbientGrain } from './AmbientGrain'

const offerLinks = offers.map((offer) => ({
  title: offer.title,
  href: `/forfaits/${offer.slug}`,
}))

function navigationClassName(baseClass: string) {
  return ({ isActive }: { isActive: boolean }) => cn(baseClass, isActive && 'is-active')
}

const desktopNavClassName = navigationClassName('nav-link')
const mobileNavClassName = navigationClassName('mobile-nav-heading')
const mobileOfferClassName = navigationClassName('mobile-offer-link')

export function PublicHeader() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [offersOpen, setOffersOpen] = useState(false)
  const refitActive =
    location.pathname === '/contact' &&
    new URLSearchParams(location.search).get('besoin') === 'refonte'
  const offerActive = location.pathname.startsWith('/forfaits') || refitActive

  useEffect(() => {
    setMobileOpen(false)
    setOffersOpen(false)
  }, [location.key])

  return (
    <div className="public-header-wrap">
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="studio — accueil">
          studio
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <NavLink to="/" end className={desktopNavClassName}>
            Accueil
          </NavLink>
          <DropdownMenu open={offersOpen} onOpenChange={setOffersOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn('nav-link nav-offers-trigger', offerActive && 'is-active')}
              >
                Forfaits
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="public-offers-menu"
              align="start"
              sideOffset={10}
              collisionPadding={16}
            >
              {offerLinks.map((offer) => (
                <DropdownMenuItem key={offer.href} asChild>
                  <Link
                    to={offer.href}
                    aria-current={location.pathname === offer.href ? 'page' : undefined}
                  >
                    {offer.title}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={existingSiteOffer.href} aria-current={refitActive ? 'page' : undefined}>
                  {existingSiteOffer.title}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink to="/exemples" className={desktopNavClassName}>
            Exemples de sites
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link className="header-login" to="/contact">
            Nous contacter
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="icon-button mobile-menu-button"
                aria-label="Ouvrir le menu"
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent className="mobile-navigation" side="right">
              <SheetHeader>
                <SheetTitle className="wordmark">studio</SheetTitle>
                <SheetDescription className="sr-only">Navigation du site</SheetDescription>
              </SheetHeader>
              <nav aria-label="Navigation mobile" className="mobile-nav-list">
                <NavLink to="/" end className={mobileNavClassName}>
                  Accueil
                  <ArrowRight size={20} aria-hidden="true" />
                </NavLink>
                <details className="mobile-offers-menu">
                  <summary className={cn('mobile-nav-heading', offerActive && 'is-active')}>
                    Forfaits
                    <ChevronDown className="mobile-offers-chevron" size={20} aria-hidden="true" />
                  </summary>
                  <div className="mobile-offers-submenu">
                    {offerLinks.map((offer) => (
                      <NavLink key={offer.href} to={offer.href} className={mobileOfferClassName}>
                        {offer.title}
                        <ArrowRight size={16} aria-hidden="true" />
                      </NavLink>
                    ))}
                    <Link
                      to={existingSiteOffer.href}
                      className={cn(
                        'mobile-offer-link mobile-offer-link--refit',
                        refitActive && 'is-active',
                      )}
                      aria-current={refitActive ? 'page' : undefined}
                    >
                      {existingSiteOffer.title}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </details>
                <NavLink to="/exemples" className={mobileNavClassName}>
                  Exemples de sites
                  <ArrowRight size={20} aria-hidden="true" />
                </NavLink>
                <Link to="/contact" className="mobile-nav-heading mobile-nav-contact">
                  Nous contacter
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  )
}

export function PublicFooter() {
  return (
    <footer className="site-footer container">
      <Link to="/" className="wordmark wordmark--small" aria-label="studio — accueil">
        studio
      </Link>
      <nav aria-label="Liens de pied de page">
        <Link to="/forfaits">Comparer les forfaits</Link>
        <Link to="/exemples">Exemples de sites</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contact">Nous contacter</Link>
      </nav>
    </footer>
  )
}

export function PublicLayout() {
  return (
    <div className="public-shell">
      <AmbientGrain />
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <PublicHeader />
      <main id="main-content" className="public-main">
        <Suspense
          fallback={
            <div className="loading-state" role="status">
              Chargement…
            </div>
          }
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}
