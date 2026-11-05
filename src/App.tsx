import { Component, Suspense, lazy, type ComponentType, type ReactNode, useLayoutEffect } from 'react'
import { createBrowserRouter, createRoutesFromElements, Link, Navigate, Outlet, Route, RouterProvider, useLocation, useParams } from 'react-router-dom'
import { PublicLayout, PortalLayout } from './components/layout'
import { AuthProvider, useAuth } from './lib/auth'
import { ProjectProvider } from './lib/project'
import { RouteMetadata } from './components/layout/RouteMetadata'

function page<T, K extends keyof T>(load: () => Promise<T>, name: K) {
  return lazy<ComponentType>(async () => ({ default: (await load())[name] as ComponentType }))
}
const publicModule = () => import('./pages/public/index')
const authModule = () => import('./pages/auth/index')
const portalModule = () => import('./pages/portal/index')
const collaborationModule = () => import('./pages/collaboration/index')
const ordersModule = () => import('./pages/orders/index')
const configuratorModule = () => import('./pages/configurator/index')
const Configurator = page(configuratorModule, 'ConfiguratorPage')
// Resolve these route modules before committing, so the transition captures the
// real card and options on the first visit rather than a Suspense fallback.
const loadForfait = async () => ({ Component: (await configuratorModule()).ForfaitConfiguratorPage })
const loadPublicPage = (name: keyof Awaited<ReturnType<typeof publicModule>>) =>
  async () => ({ Component: (await publicModule())[name] as ComponentType })
const Register = page(authModule, 'RegisterPage'), Login = page(authModule, 'LoginPage'), Forgot = page(authModule, 'ForgotPasswordPage'), Reset = page(authModule, 'ResetPasswordPage')
const Dashboard = page(portalModule, 'DashboardPage'), Contents = page(portalModule, 'ContentsPage'), Account = page(portalModule, 'AccountPage'), Messages = page(collaborationModule, 'MessagesPage'), Previews = page(collaborationModule, 'PreviewsPage')
const Checkout = page(ordersModule, 'CheckoutPage'), Order = page(ordersModule, 'PortalOrderPage'), Admin = page(ordersModule, 'AdminPage')

function NotFound() { return <section className="container page-section"><p className="eyebrow">Page introuvable</p><h1 className="page-heading">Reprenons le bon chemin.</h1><p className="page-subtitle">Cette adresse ne correspond à aucune page du site.</p><Link className="button" to="/">Revenir à l’accueil</Link></section> }
function LegacyOffer() { const { slug } = useParams(); return <Navigate to={`/forfaits/${slug || ''}`} replace /> }
function LegalPage({ privacy = false }: { privacy?: boolean }) { return <section className="container page-section legal-page"><h1 className="page-heading">{privacy ? 'Confidentialité' : 'Informations légales'}</h1><div className="stack"><p>Les informations de l’éditeur et les conditions commerciales seront complétées avant l’ouverture des commandes.</p><p>{privacy ? 'Votre prénom, votre nom, votre e-mail et votre téléphone servent à étudier votre demande et à vous recontacter. Vos réponses et images jointes sont conservées dans un espace privé réservé à l’équipe du studio. Le récapitulatif de votre demande peut être transmis à l’équipe par e-mail ; les images restent consultables dans son administration protégée.' : 'Les références externes présentées illustrent les formats de sites. Elles ne sont pas présentées comme des réalisations ou des clients du studio.'}</p><Link to="/contact">Nous contacter</Link></div></section> }
function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth(); const location = useLocation()
  if (loading) return <div className="loading-state" role="status">Ouverture de votre espace…</div>
  if (!user) return <Navigate to={`/connexion?retour=${encodeURIComponent(location.pathname + location.search)}`} replace />
  if (admin && user.role !== 'admin') return <Navigate to="/espace" replace />
  return children
}
function ScrollTop() {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}
class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <main className="container page-section"><h1 className="page-heading">La page n’a pas pu s’ouvrir.</h1><p className="page-subtitle">Vous pouvez recharger la page pour reprendre votre visite.</p><button className="button" onClick={() => window.location.reload()}>Recharger la page</button></main> : this.props.children }
}
function ApplicationShell() {
  return (
    <AppBoundary>
      <AuthProvider>
        <ProjectProvider>
          <ScrollTop />
          <RouteMetadata />
          <Suspense fallback={<div className="loading-state loading-state--page" role="status">Chargement…</div>}>
            <Outlet />
          </Suspense>
        </ProjectProvider>
      </AuthProvider>
    </AppBoundary>
  )
}

const router = createBrowserRouter(createRoutesFromElements(
  <Route
    element={<ApplicationShell />}
    hydrateFallbackElement={<div className="loading-state loading-state--page" role="status">Chargement…</div>}
  >
    <Route element={<PublicLayout />}>
      <Route index lazy={loadPublicPage('HomePage')} />
      <Route path="forfaits" lazy={loadPublicPage('OffersPage')} />
      <Route path="forfaits/:slug" lazy={loadForfait} />
      <Route path="formules" element={<Navigate to="/forfaits" replace />} />
      <Route path="formules/:slug" element={<LegacyOffer />} />
      <Route path="options" lazy={loadPublicPage('OptionsPage')} />
      <Route path="exemples" lazy={loadPublicPage('ExamplesPage')} />
      <Route path="exemples/:slug" lazy={loadPublicPage('ExampleDetailPage')} />
      <Route path="methode" element={<Navigate to="/#fonctionnement" replace />} />
      <Route path="faq" lazy={loadPublicPage('FaqPage')} />
      <Route path="contact" lazy={loadPublicPage('ContactPage')} />
      <Route path="configurateur" element={<Configurator />} />
      <Route path="inscription" element={<Register />} />
      <Route path="connexion" element={<Login />} />
      <Route path="mot-de-passe-oublie" element={<Forgot />} />
      <Route path="reinitialiser-mot-de-passe" element={<Reset />} />
      <Route path="commande/:projectId" element={<RequireAuth><Checkout /></RequireAuth>} />
      <Route path="confidentialite" element={<LegalPage privacy />} />
      <Route path="mentions-legales" element={<LegalPage />} />
      <Route path="conditions" element={<LegalPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route element={<PortalLayout />}>
      <Route path="espace" element={<Dashboard />} />
      <Route path="espace/contenus" element={<Contents />} />
      <Route path="espace/messages" element={<Messages />} />
      <Route path="espace/maquettes" element={<Previews />} />
      <Route path="espace/commande" element={<Order />} />
      <Route path="espace/compte" element={<Account />} />
      <Route path="admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
    </Route>
  </Route>,
))

export function App() {
  return <RouterProvider router={router} />
}
