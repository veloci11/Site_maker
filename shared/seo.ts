import { defaultPricing, examples, faqs, getOffer, publicOffers, type Pricing } from './catalog.ts'
import { homeMetaDescription } from '../src/content/home-copy.ts'

// A fixed, verified public origin keeps canonicals independent of request headers.
export const siteOrigin = 'https://gilmathis.com'
export const siteSocialImage = `${siteOrigin}/assets/brand/logo-pixelito-512.png`

export type RouteSeo = {
  title: string
  description: string
  canonical: string | null
  robots: 'index, follow' | 'noindex, nofollow'
  status: 200 | 301 | 404
  redirect?: string
}

const page = (title: string, description: string, pathname: string): RouteSeo => ({
  title: `${title} · pixelito`,
  description,
  canonical: `${siteOrigin}${pathname}`,
  robots: 'index, follow',
  status: 200,
})

const publicPages: Record<string, RouteSeo> = {
  '/': page(
    'Création de sites internet clé en main',
    homeMetaDescription(defaultPricing),
    '/',
  ),
  '/forfaits': page(
    'Comparer les forfaits de création de sites',
    'Comparez les trois forfaits Vitrine, Business et Premium / 3D : pages, gestion des contenus, référencement, statistiques et animations pour votre site internet.',
    '/forfaits',
  ),
  '/options': page(
    'Les fonctionnalités de votre site',
    'Découvrez les fonctionnalités disponibles selon votre forfait de création de site internet et choisissez celles qui sont utiles à votre projet.',
    '/options',
  ),
  '/exemples': page(
    'Exemples de sites',
    'Explorez des références externes créditées pour comparer les formats Vitrine, Business et Premium / 3D. Elles illustrent les possibilités de votre site.',
    '/exemples',
  ),
  '/faq': page(
    'Questions fréquentes',
    'Préparez votre projet de site internet : contenus, frais après création, modifications, hébergement, mobile et référencement Google.',
    '/faq',
  ),
  '/contact': page(
    'Contacter le studio',
    'Présentez votre projet de site internet au studio et transmettez les informations utiles pour préciser votre besoin.',
    '/contact',
  ),
}

const privatePages: Record<string, string> = {
  '/configurateur': 'Configurer votre site',
  '/inscription': 'Inscription',
  '/connexion': 'Connexion',
  '/mot-de-passe-oublie': 'Mot de passe oublié',
  '/reinitialiser-mot-de-passe': 'Réinitialiser le mot de passe',
  '/espace': 'Votre espace',
  '/espace/contenus': 'Vos contenus',
  '/espace/messages': 'Vos messages',
  '/espace/maquettes': 'Vos maquettes',
  '/espace/commande': 'Votre commande',
  '/espace/compte': 'Votre compte',
  '/admin': 'Administration',
  '/confidentialite': 'Confidentialité',
  '/mentions-legales': 'Mentions légales',
  '/conditions': 'Conditions',
}

const excludedPage = (title: string, status: 200 | 404 = 200): RouteSeo => ({
  title: `${title} · pixelito`,
  description: status === 404
    ? 'Cette adresse ne correspond à aucune page du site.'
    : 'Espace réservé ou page hors des résultats de recherche.',
  canonical: null,
  robots: 'noindex, nofollow',
  status,
})

const offerPage = (idOrSlug: string): RouteSeo | undefined => {
  const offer = getOffer(idOrSlug)
  if (!offer) return undefined
  const title = offer.id === 'vitrine' ? 'Création de site vitrine'
    : offer.id === 'connecte' ? 'Création de site Business avec CMS'
    : offer.id === 'immersif' ? 'Création de site Premium et 3D' : 'Sur mesure'
  return page(
    title,
    offer.description,
    `/forfaits/${offer.slug}`,
  )
}

function currentPage(pathname: string): RouteSeo | undefined {
  if (publicPages[pathname]) return publicPages[pathname]
  const offer = /^\/forfaits\/([^/]+)$/.exec(pathname)
  if (offer) return offerPage(offer[1])
  if (privatePages[pathname]) return excludedPage(privatePages[pathname])
  if (/^\/commande\/[^/]+$/.test(pathname)) return excludedPage('Votre commande')
  return undefined
}

export const publicPagePaths = [
  '/',
  '/forfaits',
  ...publicOffers.map(offer => `/forfaits/${offer.slug}`),
  '/options',
  '/exemples',
  '/faq',
  '/contact',
] as const

/** Only known routes and meaningful service parameters become canonical URLs. */
export function getRouteSeo(pathname: string, search = '', pricing: Pricing = defaultPricing): RouteSeo {
  const params = new URLSearchParams(search)
  const legacySearch = params.size ? `?${params.toString()}` : ''
  const normalized = pathname.replace(/\/+$/, '').toLowerCase() || '/'
  if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\')) {
    return excludedPage('Page introuvable', 404)
  }

  if (normalized === '/contact' && ['evolution', 'refonte'].includes(params.get('besoin') ?? '')) {
    params.delete('besoin')
    const remaining = params.size ? `?${params.toString()}` : ''
    return { ...publicPages['/contact'], status: 301, redirect: `/contact${remaining}` }
  }
  if (['/forfaits/sur-mesure', '/formules/sur-mesure'].includes(normalized) &&
    !params.has('projet') && !params.has('projectId')) {
    return { ...offerPage('immersif')!, status: 301, redirect: `/forfaits/immersif-3d${legacySearch}` }
  }

  if (normalized === '/formules') {
    return { ...publicPages['/forfaits'], status: 301, redirect: `/forfaits${legacySearch}` }
  }
  const legacyOffer = /^\/formules\/([^/]+)$/.exec(normalized)
  if (legacyOffer) {
    const metadata = offerPage(legacyOffer[1])
    if (!metadata) return excludedPage('Page introuvable', 404)
    return { ...metadata, status: 301, redirect: `${new URL(metadata.canonical!).pathname}${legacySearch}` }
  }
  if (normalized === '/methode') {
    return { ...publicPages['/'], status: 301, redirect: '/#fonctionnement' }
  }
  const legacyExample = /^\/exemples\/([^/]+)$/.exec(normalized)
  if (legacyExample) {
    const example = examples.find(item => item.id === legacyExample[1])
    if (!example) return excludedPage('Page introuvable', 404)
    return { ...excludedPage(example.title), status: 301, redirect: example.url }
  }

  const metadata = currentPage(normalized)
  if (!metadata) return excludedPage('Page introuvable', 404)
  // The project editor can share a public configurator route; its URL stays private.
  if (params.has('projet') || params.has('projectId')) {
    return { ...metadata, canonical: null, robots: 'noindex, nofollow' }
  }
  const canonicalPath = metadata.canonical ? new URL(metadata.canonical).pathname : normalized
  if (pathname !== normalized || canonicalPath !== normalized) {
    return { ...metadata, status: 301, redirect: `${canonicalPath}${legacySearch}` }
  }
  if (normalized === '/') {
    return { ...metadata, description: homeMetaDescription(pricing) }
  }
  return { ...metadata }
}

/** Describe the site and visible pages without inventing a legal entity or reviews. */
export function getStructuredData(metadata: RouteSeo) {
  if (!metadata.canonical || metadata.robots.startsWith('noindex')) return null
  const pathname = new URL(metadata.canonical).pathname
  const website = {
    '@type': 'WebSite', '@id': `${siteOrigin}/#website`, name: 'pixelito',
    url: `${siteOrigin}/`, inLanguage: 'fr-FR',
  }
  const page = {
    '@type': pathname === '/faq' ? 'FAQPage' : ['/forfaits', '/exemples', '/options'].includes(pathname) ? 'CollectionPage' : pathname === '/contact' ? 'ContactPage' : 'WebPage',
    '@id': `${metadata.canonical}#webpage`, url: metadata.canonical,
    name: metadata.title, description: metadata.description, inLanguage: 'fr-FR',
    isPartOf: { '@id': website['@id'] },
    ...(pathname === '/faq' ? { mainEntity: faqs.map(item => ({
      '@type': 'Question', name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: [item.answer, ...(item.items ?? [])].join('\n') },
    })) } : {}),
  }
  const crumbs = pathname === '/' ? [] : [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${siteOrigin}/` },
    ...(pathname.startsWith('/forfaits/') ? [{ '@type': 'ListItem', position: 2, name: 'Forfaits', item: `${siteOrigin}/forfaits` }] : []),
    { '@type': 'ListItem', position: pathname.startsWith('/forfaits/') ? 3 : 2, name: metadata.title.replace(' · pixelito', ''), item: metadata.canonical },
  ]
  return { '@context': 'https://schema.org', '@graph': [website, page,
    ...(crumbs.length ? [{ '@type': 'BreadcrumbList', '@id': `${metadata.canonical}#breadcrumbs`, itemListElement: crumbs }] : []),
  ] }
}
