import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { cn } from "../../lib/utils";
import { PageTransition } from "./motion";
import { AmbientGrain } from "./AmbientGrain";

const offers = [
  { title: "Vitrine", href: "/forfaits/vitrine" },
  { title: "Connecté", href: "/forfaits/connecte" },
  { title: "Immersif 3D", href: "/forfaits/immersif-3d" },
  { title: "Sur mesure", href: "/forfaits/sur-mesure" },
];

export function PublicHeader() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.key]);

  return (
    <div className="public-header-wrap">
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="studio — accueil">studio</Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <NavLink to="/" end className={({ isActive }) => cn("nav-link", isActive && "is-active")}>Accueil</NavLink>
          <div className="nav-forfaits" role="group" aria-label="Forfaits">{offers.map((offer) => <NavLink key={offer.href} to={offer.href} className={({ isActive }) => cn("nav-link", isActive && "is-active")}>{offer.title}</NavLink>)}</div>
          <NavLink to="/exemples" className={({ isActive }) => cn("nav-link", isActive && "is-active")}>Exemples de sites</NavLink>
        </nav>
        <div className="header-actions">
          <Link className="header-login" to="/contact">Nous contacter<ArrowRight size={15} aria-hidden="true" /></Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><button className="icon-button mobile-menu-button" aria-label="Ouvrir le menu"><Menu size={22} aria-hidden="true" /></button></SheetTrigger>
            <SheetContent className="mobile-navigation" side="right">
              <SheetHeader><SheetTitle className="wordmark">studio</SheetTitle><SheetDescription className="sr-only">Navigation du site</SheetDescription></SheetHeader>
              <nav aria-label="Navigation mobile" className="mobile-nav-list">
                <NavLink to="/" end className={({ isActive }) => cn("mobile-nav-heading mobile-nav-home", isActive && "is-active")}>Accueil<ArrowRight size={20} aria-hidden="true" /></NavLink>
                <p className="mobile-nav-label">Forfaits</p>
                <div className="mobile-offers">{offers.map((offer) => <NavLink to={offer.href} key={offer.href} className={({ isActive }) => cn("mobile-nav-heading", isActive && "is-active")}>{offer.title}<ArrowRight size={20} aria-hidden="true" /></NavLink>)}</div>
                <div className="mobile-nav-secondary"><NavLink to="/exemples" className={({ isActive }) => cn("mobile-nav-heading", isActive && "is-active")}>Exemples de sites<ArrowRight size={20} aria-hidden="true" /></NavLink><Link to="/contact" className="mobile-nav-heading">Nous contacter<ArrowRight size={20} aria-hidden="true" /></Link></div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}

export function PublicFooter() {
  return <footer className="site-footer container"><Link to="/" className="wordmark wordmark--small" aria-label="studio — accueil">studio</Link><nav aria-label="Liens de pied de page"><Link to="/forfaits">Comparer les forfaits</Link><Link to="/exemples">Exemples de sites</Link><Link to="/faq">FAQ</Link><Link to="/contact">Nous contacter</Link></nav></footer>;
}

export function PublicLayout() {
  return <div className="public-shell"><AmbientGrain /><a className="skip-link" href="#main-content">Aller au contenu</a><PublicHeader /><main id="main-content" className="public-main"><Suspense fallback={<div className="loading-state" role="status">Chargement…</div>}><PageTransition><Outlet /></PageTransition></Suspense></main><PublicFooter /></div>;
}
