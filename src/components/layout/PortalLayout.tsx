import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, FolderOpen, Home, Loader2, LogOut, MessagesSquare, PanelsTopLeft, ReceiptText, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useProject } from "../../lib/project";
import { cn } from "../../lib/utils";

const portalLinks = [
  { href: "/espace", label: "Vue d’ensemble", mobile: "Projet", icon: Home, end: true },
  { href: "/espace/contenus", label: "Mes contenus", mobile: "Contenus", icon: FolderOpen },
  { href: "/espace/messages", label: "Messages", mobile: "Messages", icon: MessagesSquare },
  { href: "/espace/maquettes", label: "Maquettes", mobile: "Maquettes", icon: PanelsTopLeft },
  { href: "/espace/commande", label: "Commande", mobile: "Commande", icon: ReceiptText },
];

export function PortalLayout({ projectName }: { projectName?: string }) {
  const { user, loading, logout } = useAuth();
  const { project } = useProject();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const account = useRef<HTMLDivElement>(null);
  const accountTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => { setAccountOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!accountOpen) return;
    const outside = (event: PointerEvent) => { if (!account.current?.contains(event.target as Node)) setAccountOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setAccountOpen(false); accountTrigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [accountOpen]);

  if (loading) return <div className="loading-state loading-state--page" role="status"><Loader2 className="spin" size={24} aria-hidden="true" /><span>Ouverture de votre espace…</span></div>;
  if (!user) return <Navigate to={`/connexion?retour=${encodeURIComponent(location.pathname + location.search)}`} replace />;

  async function signOut() {
    setLogoutError("");
    try { await logout(); } catch { setLogoutError("La déconnexion n’a pas abouti. Réessayez."); }
  }

  return (
    <div className="portal-shell">
      <a className="skip-link" href="#portal-main">Aller au contenu</a>
      <header className="portal-header">
        <Link className="wordmark" to="/" aria-label="pixelito — accueil">pixelito</Link>
        <span className="portal-project-name">{projectName ?? project?.name ?? "Mon projet"}</span>
        <div className="portal-header-actions"><Link to="/" className="portal-return">Retour au site <ArrowUpRight size={17} aria-hidden="true" /></Link><div className="account-menu" ref={account}><button className="avatar-button" ref={accountTrigger} aria-expanded={accountOpen} aria-controls="account-menu" aria-label="Ouvrir le menu du compte" onClick={() => setAccountOpen(!accountOpen)}>{user.name?.trim().charAt(0).toUpperCase() || "M"}</button>{accountOpen ? <div className="account-popover" id="account-menu"><div className="account-popover-identity"><strong>{user.name}</strong><span>{user.email}</span></div><Link to="/espace/compte"><Settings size={17} aria-hidden="true" />Mon compte</Link>{user.role === "admin" ? <Link to="/admin"><ShieldCheck size={17} aria-hidden="true" />Administration</Link> : null}<button onClick={signOut}><LogOut size={17} aria-hidden="true" />Se déconnecter</button>{logoutError ? <p className="field-error" role="alert">{logoutError}</p> : null}</div> : null}</div></div>
      </header>
      <aside className="portal-sidebar"><nav aria-label="Espace client">{portalLinks.map(({ href, label, end }) => <NavLink to={href} key={href} end={end} className={({ isActive }) => cn("portal-nav-link", isActive && "is-active")}>{label}</NavLink>)}</nav><NavLink to="/espace/compte" className={({ isActive }) => cn("portal-nav-link portal-account-link", isActive && "is-active")}>Mon compte</NavLink></aside>
      <main className="portal-main" id="portal-main"><Outlet /></main>
      <nav className="portal-mobile-nav" aria-label="Navigation de l’espace client">{portalLinks.map(({ href, mobile, icon: Icon, end }) => <NavLink to={href} key={href} end={end} className={({ isActive }) => cn(isActive && "is-active")}><Icon size={22} strokeWidth={1.6} aria-hidden="true" /><span>{mobile}</span></NavLink>)}</nav>
    </div>
  );
}
