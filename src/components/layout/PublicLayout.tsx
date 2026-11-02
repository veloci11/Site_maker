import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/utils";
import { PageTransition } from "./motion";
import { AmbientGrain } from "./AmbientGrain";

const offers = [
  { title: "Vitrine", href: "/forfaits/vitrine" },
  { title: "Connecté", href: "/forfaits/connecte" },
  { title: "Immersif 3D", href: "/forfaits/immersif-3d" },
  { title: "Sur mesure", href: "/forfaits/sur-mesure" },
];

export interface NavigationExample {
  title: string;
  description: string;
  href: string;
  image?: string;
}

const defaultExamples: NavigationExample[] = [
  { title: "DOMTEKNIKA", description: "Présentation d’entreprise", href: "/exemples/domteknika", image: "/assets/examples/domteknika.png" },
  { title: "Lactel", description: "Contenus et produits", href: "/exemples/lactel", image: "/assets/examples/lactel.png" },
  { title: "Tiny Heaven", description: "Expérience 3D", href: "/exemples/tiny-heaven", image: "/assets/examples/tiny-heaven.webp" },
];

export function PublicHeader({ examples = defaultExamples }: { examples?: NavigationExample[] }) {
  const { user } = useAuth();
  const location = useLocation();
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const examplesTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => { setExamplesOpen(false); setMobileOpen(false); }, [location.key]);
  useEffect(() => {
    let frame = 0;
    let distance = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const update = () => {
      frame = 0;
      const scrollY = window.scrollY;
      if (progress.current) progress.current.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
      const scrolled = scrollY > 28 ? "true" : "false";
      if (chrome.current && chrome.current.dataset.scrolled !== scrolled) chrome.current.dataset.scrolled = scrolled;
    };
    const queue = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const measure = () => { distance = Math.max(0, document.documentElement.scrollHeight - window.innerHeight); queue(); };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => { window.cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", queue); window.removeEventListener("resize", measure); };
  }, []);
  useEffect(() => {
    if (!examplesOpen) return;
    function outside(event: PointerEvent) { if (!header.current?.contains(event.target as Node)) setExamplesOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { setExamplesOpen(false); examplesTrigger.current?.focus(); } }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [examplesOpen]);

  return (
    <div className="public-header-wrap" ref={chrome}>
      <div className="reading-progress" aria-hidden="true"><span ref={progress} /></div>
      <header className="site-header" ref={header} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setExamplesOpen(false); }}>
        <Link className="wordmark" to="/" aria-label="studio — accueil">studio</Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <NavLink to="/" end className={({ isActive }) => cn("nav-link", isActive && "is-active")}>Accueil</NavLink>
          <div className="nav-forfaits" role="group" aria-label="Forfaits">{offers.map((offer) => <NavLink key={offer.href} to={offer.href} className={({ isActive }) => cn("nav-link", isActive && "is-active")}>{offer.title}</NavLink>)}</div>
          <button ref={examplesTrigger} type="button" className={cn("nav-link nav-dropdown-trigger", (examplesOpen || location.pathname.startsWith("/exemples")) && "is-active")} aria-expanded={examplesOpen} aria-controls="examples-menu" onClick={() => setExamplesOpen(!examplesOpen)}>Exemples <ChevronDown size={14} aria-hidden="true" /></button>
          <NavLink className={({ isActive }) => cn("nav-link nav-link--secondary", isActive && "is-active")} to="/methode">La méthode</NavLink>
          <NavLink className={({ isActive }) => cn("nav-link nav-link--secondary", isActive && "is-active")} to="/faq">FAQ</NavLink>
        </nav>
        <div className="header-actions">
          <Link className="header-login" to={user ? "/espace" : "/connexion"}>{user ? "Mon espace" : "Se connecter"}<ArrowRight size={15} aria-hidden="true" /></Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><button className="icon-button mobile-menu-button" aria-label="Ouvrir le menu"><Menu size={22} aria-hidden="true" /></button></SheetTrigger>
            <SheetContent className="mobile-navigation" side="right">
              <SheetHeader><SheetTitle className="wordmark">studio</SheetTitle><SheetDescription className="sr-only">Navigation du site</SheetDescription></SheetHeader>
              <nav aria-label="Navigation mobile" className="mobile-nav-list">
                <NavLink to="/" end className={({ isActive }) => cn("mobile-nav-heading mobile-nav-home", isActive && "is-active")}>Accueil<ArrowRight size={20} aria-hidden="true" /></NavLink>
                <p className="mobile-nav-label">Forfaits</p>
                <div className="mobile-offers">{offers.map((offer) => <NavLink to={offer.href} key={offer.href} className={({ isActive }) => cn("mobile-nav-heading", isActive && "is-active")}>{offer.title}<ArrowRight size={20} aria-hidden="true" /></NavLink>)}</div>
                <div className="mobile-nav-secondary"><Link className="mobile-nav-heading" to="/exemples">Exemples <ArrowRight size={20} aria-hidden="true" /></Link><Link className="mobile-nav-heading" to="/methode">La méthode <ArrowRight size={20} aria-hidden="true" /></Link><Link className="mobile-nav-heading" to="/faq">FAQ <ArrowRight size={20} aria-hidden="true" /></Link><Link className="mobile-nav-heading" to="/contact">Nous contacter <ArrowRight size={20} aria-hidden="true" /></Link></div>
                <Link to={user ? "/espace" : "/connexion"} className="mobile-login">{user ? "Mon espace client" : "Se connecter"}<ArrowRight size={18} aria-hidden="true" /></Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        {examplesOpen ? <div className="mega-menu mega-menu--examples" id="examples-menu"><div className="mega-examples-grid">{examples.map((example) => <Link to={example.href} key={example.href} className="mega-example">{example.image ? <img src={example.image} alt="" /> : null}<strong>{example.title}<ArrowRight size={18} aria-hidden="true" /></strong><span>{example.description}</span></Link>)}</div><div className="mega-menu-footer"><Link to="/exemples">Tous les exemples <ArrowRight size={17} aria-hidden="true" /></Link></div></div> : null}
      </header>
      {examplesOpen ? <div className="nav-backdrop" aria-hidden="true" onClick={() => setExamplesOpen(false)} /> : null}
    </div>
  );
}

export function PublicFooter() {
  return <footer className="site-footer container"><Link to="/" className="wordmark wordmark--small" aria-label="studio — accueil">studio</Link><p>Votre site, simplement.</p><nav aria-label="Liens de pied de page"><Link to="/forfaits">Forfaits</Link><Link to="/faq">FAQ</Link><Link to="/contact">Nous contacter</Link></nav></footer>;
}

export function PublicLayout({ examples }: { examples?: NavigationExample[] }) {
  return <div className="public-shell"><AmbientGrain /><a className="skip-link" href="#main-content">Aller au contenu</a><PublicHeader examples={examples} /><main id="main-content" className="public-main"><PageTransition><Outlet /></PageTransition></main><PublicFooter /></div>;
}
