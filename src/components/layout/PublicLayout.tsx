import { Suspense, useEffect, useRef, useState, type MouseEvent } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, Menu } from 'lucide-react'
import { PixelitoLoading, PixelitoLogo } from './PixelitoLogo'
import { publicOffers } from '../../../shared/catalog'
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
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'
import { PageTransition } from './motion'
import { AmbientGrain } from './AmbientGrain'
import { MotionLink as Link, MotionNavLink as NavLink, canAnimatePlanNavigation } from './plan-transition'

const offerLinks = publicOffers.map((offer) => ({
  title: offer.title,
  href: `/forfaits/${offer.slug}`,
  variant: offer.variant,
}))

function navigationClassName(baseClass: string) {
  return ({ isActive }: { isActive: boolean }) => cn(baseClass, isActive && 'is-active')
}

const desktopNavClassName = navigationClassName('nav-link')
const mobileNavClassName = navigationClassName('mobile-nav-heading')
const mobileOfferClassName = navigationClassName('mobile-offer-link')

function scrollHomeToTop(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0
    || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    || (event.currentTarget.target && event.currentTarget.target !== '_self')
    || event.currentTarget.href !== window.location.href) return

  event.preventDefault()
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}

export function PublicHeader() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileMenuButton = useRef<HTMLButtonElement>(null)
  const [offersOpen, setOffersOpen] = useState(false)
  const offerActive = location.pathname.startsWith('/forfaits')

  useEffect(() => {
    setMobileOpen(false)
    setOffersOpen(false)
  }, [location.key])

  return (
    <div className="public-header-wrap">
      <header className="site-header">
        <Link className="wordmark navigation-logo" to="/" onClick={scrollHomeToTop} viewTransition={canAnimatePlanNavigation()} aria-label="pixelito — accueil">
          <PixelitoLogo />
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <NavLink to="/" end onClick={scrollHomeToTop} viewTransition={canAnimatePlanNavigation()} className={desktopNavClassName}>
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
                    data-plan-return="offers"
                    viewTransition={canAnimatePlanNavigation()}
                    className={`public-offer-link pricing-card--${offer.variant}`}
                    aria-current={location.pathname === offer.href ? 'page' : undefined}
                  >
                    {offer.title}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink to="/exemples" viewTransition={canAnimatePlanNavigation()} className={desktopNavClassName}>
            Exemples de sites
          </NavLink>
          <NavLink to="/faq" viewTransition={canAnimatePlanNavigation()} className={desktopNavClassName}>
            FAQ
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link className="header-login" to="/contact" viewTransition={canAnimatePlanNavigation()}>
            Nous contacter
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                ref={mobileMenuButton}
                type="button"
                className="icon-button mobile-menu-button"
                aria-label="Ouvrir le menu"
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent
              className="mobile-navigation"
              side="right"
              onCloseAutoFocus={(event) => {
                event.preventDefault()
                // Restoring focus must not interrupt an ongoing scroll to the top.
                mobileMenuButton.current?.focus({ preventScroll: true })
              }}
            >
              <SheetHeader>
                <SheetTitle className="wordmark">pixelito</SheetTitle>
                <SheetDescription className="sr-only">Navigation du site</SheetDescription>
              </SheetHeader>
              <nav aria-label="Navigation mobile" className="mobile-nav-list">
                <NavLink
                  to="/"
                  end
                  onClick={(event) => {
                    scrollHomeToTop(event)
                    setMobileOpen(false)
                  }}
                  viewTransition={canAnimatePlanNavigation()}
                  className={mobileNavClassName}
                >
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
                      <NavLink key={offer.href} to={offer.href} data-plan-return="offers" onClick={() => setMobileOpen(false)} viewTransition={canAnimatePlanNavigation()} className={mobileOfferClassName}>
                        {offer.title}
                        <ArrowRight size={16} aria-hidden="true" />
                      </NavLink>
                    ))}
                  </div>
                </details>
                <NavLink to="/exemples" viewTransition={canAnimatePlanNavigation()} className={mobileNavClassName}>
                  Exemples de sites
                  <ArrowRight size={20} aria-hidden="true" />
                </NavLink>
                <NavLink to="/faq" viewTransition={canAnimatePlanNavigation()} className={mobileNavClassName}>
                  FAQ
                  <ArrowRight size={20} aria-hidden="true" />
                </NavLink>
                <Link to="/contact" viewTransition={canAnimatePlanNavigation()} className="mobile-nav-heading mobile-nav-contact">
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
      <Link to="/" onClick={scrollHomeToTop} viewTransition={canAnimatePlanNavigation()} className="wordmark wordmark--small" aria-label="pixelito — accueil">
        pixelito
      </Link>
      <nav aria-label="Liens de pied de page">
        <Link to="/forfaits" viewTransition={canAnimatePlanNavigation()}>Comparer les forfaits</Link>
        <Link to="/exemples" viewTransition={canAnimatePlanNavigation()}>Exemples de sites</Link>
        <Link to="/faq" viewTransition={canAnimatePlanNavigation()}>FAQ</Link>
        <Link to="/contact" viewTransition={canAnimatePlanNavigation()}>Nous contacter</Link>
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
      <main id="main-content" className="public-main" tabIndex={-1}>
        <Suspense
          fallback={<PixelitoLoading />}
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
