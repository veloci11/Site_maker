export const OFFER_IDS = ['vitrine', 'connecte', 'immersif', 'sur-mesure'] as const
export type OfferId = (typeof OFFER_IDS)[number]
export const EXTRA_OPTION_IDS = [
  'user-accounts',
  'member-roles',
  'booking',
  'product-catalog',
  'online-payment',
  'online-store',
  'blog',
  'portfolio-gallery',
  'advanced-forms',
  'newsletter',
  'crm-integration',
  'analytics',
  'local-seo',
  'copywriting',
  'content-import',
  'extra-pages',
  'additional-language',
  'custom-3d',
  'hosting-monthly',
  'backups-monthly',
] as const
export type ExtraOptionId = (typeof EXTRA_OPTION_IDS)[number]
export type Configuration = {
  offerId: OfferId
  language: 'fr' | 'fr-en'
  mobile: boolean
  managedContent: boolean
  scene3d: boolean
  deployment: boolean
  maintenance: boolean
  extras: ExtraOptionId[]
}
export type OptionId =
  | 'language-en'
  | 'mobile'
  | 'managed-content'
  | 'scene-3d'
  | 'deployment'
  | 'maintenance-monthly'
  | ExtraOptionId
export type Pricing = {
  version: string
  currency: string
  base: Record<OfferId, number | null>
  options: Record<OptionId, number | null>
}
export type Quote = {
  currency: string
  version: string
  lines: {
    key: string
    label: string
    amountCents: number | null
    included: boolean
    billing: 'once' | 'monthly'
  }[]
  totalCents: number | null
  monthlyTotalCents: number | null
  checkoutReady: boolean
  requiresQuote: boolean
}

export const offers = [
  {
    id: 'vitrine',
    slug: 'vitrine',
    title: 'Vitrine',
    headline: 'Votre activité, en ligne.',
    description:
      'Présentez vos services, vos réalisations et vos coordonnées sur un site à votre image.',
    features: ['Design adapté à votre activité', 'Version ordinateur', 'Formulaire de contact'],
    exampleId: 'domteknika',
    variant: 'vitrine',
  },
  {
    id: 'connecte',
    slug: 'connecte',
    title: 'Connecté',
    headline: 'Un site avec des utilisateurs.',
    description:
      'Proposez des comptes à vos visiteurs et gérez vos contenus. Ajoutez les fonctions utiles à votre activité.',
    features: ['Comptes utilisateurs', 'Contenus modifiables', 'Ordinateur et mobile'],
    exampleId: 'lactel',
    variant: 'connecte',
  },
  {
    id: 'immersif',
    slug: 'immersif-3d',
    title: 'Immersif 3D',
    headline: 'Votre univers prend vie.',
    description: 'Présentez votre activité avec un élément 3D interactif intégré à votre site.',
    features: ['Élément 3D interactif', 'Interactions soignées', 'Ordinateur et mobile'],
    exampleId: 'julie-thiam',
    variant: 'immersif',
  },
  {
    id: 'sur-mesure',
    slug: 'sur-mesure',
    title: 'Sur mesure',
    headline: 'Un site conçu pour votre besoin.',
    description:
      'Sélectionnez les fonctions souhaitées et décrivez votre projet. Nous en précisons ensemble le périmètre.',
    features: ['Fonctions dédiées', 'Intégrations spécifiques', 'Périmètre personnalisé'],
    exampleId: 'addiction-agency',
    variant: 'custom',
  },
] as const
export function getOffer(idOrSlug: unknown) {
  return offers.find((offer) => offer.id === idOrSlug || offer.slug === idOrSlug)
}

export type SiteExample = {
  id: string
  title: string
  category: string
  offerId: OfferId
  image: string
  url: string
  sourceUrl: string
  creator: string
  description: string
  embeddable: boolean
  tags?: readonly string[]
  archived?: boolean
}

export const examples: readonly SiteExample[] = [
  {
    id: 'domteknika',
    title: 'DOMTEKNIKA',
    category: 'Vitrine',
    offerId: 'vitrine',
    image: '/assets/examples/domteknika.webp',
    url: 'https://domteknika.ch/fr',
    sourceUrl: 'https://domteknika.ch/fr',
    creator: 'DOMTEKNIKA',
    description: 'Présenter une entreprise, son expertise et ses projets.',
    embeddable: false,
  },
  {
    id: 'lactel',
    title: 'Lactel',
    category: 'Contenus',
    offerId: 'connecte',
    image: '/assets/examples/lactel.webp',
    url: 'https://www.lactel.fr/',
    sourceUrl: 'https://raphael-ferreira.com/',
    creator: 'Raphaël Ferreira · Wonderstudios',
    description: 'Organiser des produits, des articles et des recettes.',
    embeddable: false,
  },
  {
    id: 'julie-thiam',
    title: 'Julie Thiam',
    category: '3D',
    offerId: 'immersif',
    image: '/assets/examples/julie-thiam.webp',
    url: 'https://juliethiam.art/',
    sourceUrl: 'https://juliethiam.art/',
    creator: 'Julie Thiam',
    description: 'Découvrir les œuvres d’une artiste dans une galerie 3D.',
    embeddable: false,
  },
  {
    id: 'tiny-heaven',
    title: 'Tiny Heaven',
    category: '3D',
    offerId: 'immersif',
    image: '/assets/examples/tiny-heaven.webp',
    url: 'https://tiny.raphael-ferreira.com/',
    sourceUrl: 'https://raphael-ferreira.com/',
    creator: 'Raphaël Ferreira',
    description: 'Explorer un univers en trois dimensions.',
    embeddable: true,
  },
  {
    id: 'addiction-agency',
    title: 'Addiction Agency',
    category: 'Sur mesure',
    offerId: 'sur-mesure',
    image: '/assets/examples/addiction-agency.webp',
    url: 'https://addiction-agency.com/agence',
    sourceUrl: 'https://addiction-agency.com/',
    creator: 'Addiction Agency',
    description: 'Présenter une agence créative et son univers.',
    embeddable: false,
  },
  {
    id: 'geoboss',
    title: 'GeoBoss',
    category: 'Jeu en ligne',
    offerId: 'sur-mesure',
    image: '/assets/examples/geoboss.webp',
    url: 'https://geoboss.onrender.com/',
    sourceUrl: 'https://raphael-ferreira.com/',
    creator: 'Raphaël Ferreira',
    description: 'Un jeu de géographie multijoueur avec globe 3D et classement.',
    tags: ['3D'],
    embeddable: false,
  },
  {
    id: 'aema',
    title: 'Aéma Groupe',
    category: 'Vitrine',
    offerId: 'vitrine',
    image: '/assets/examples/aema.webp',
    url: 'https://www.aemagroupe.fr/',
    sourceUrl: 'https://raphael-ferreira.com/',
    creator: 'Raphaël Ferreira · Wonderstudios',
    description: 'Un site institutionnel avec actualités et contenus éditoriaux.',
    tags: ['Contenus'],
    embeddable: false,
  },
  {
    id: 'satellite-story',
    title: 'Satellite Story',
    category: '3D',
    offerId: 'immersif',
    image: '/assets/examples/satellite.webp',
    url: 'https://satellite.raphael-ferreira.com/',
    sourceUrl: 'https://raphael-ferreira.com/',
    creator: 'Raphaël Ferreira',
    description: 'Une histoire de Spoutnik, animée en 3D au défilement.',
    embeddable: false,
  },
  {
    id: 'atlante-3d',
    title: 'Atlante 3D',
    category: '3D',
    offerId: 'immersif',
    image: '/assets/examples/atlante.webp',
    url: 'https://github.com/rqphy/Atlante3d#readme',
    sourceUrl: 'https://raphael-ferreira.com/',
    creator: 'Raphaël Ferreira — projet Atlante',
    description: 'Une présentation interactive de station de recharge en 3D.',
    archived: true,
    embeddable: false,
  },
] as const

export const faqs = [
  {
    question: 'Quels frais dois-je prévoir après la création du site ?',
    answer:
      'Le configurateur distingue la création et les options ponctuelles des services mensuels que vous choisissez : hébergement géré, maintenance et sauvegardes suivies. La mise en ligne est une prestation ponctuelle. Le domaine et les éventuels abonnements à des outils externes sont précisés avant le démarrage.',
    category: 'Budget et suivi',
  },
  {
    question: 'Qui prépare les textes et les photos ?',
    answer:
      'Préparez vos coordonnées, les textes de vos pages et les images que vous souhaitez utiliser, ainsi que votre logo si vous en avez un. Une aide à la rédaction et la reprise de contenus d’un ancien site sont proposées dans les options.',
    category: 'Contenus',
  },
  {
    question: 'Pourrai-je modifier mes textes et mes photos après la livraison ?',
    answer:
      'Connecté comprend une interface pour modifier vos textes et vos images. Cette gestion peut être ajoutée aux autres forfaits. Pour ajouter de nouvelles pages ou fonctionnalités, nous définissons une intervention selon votre besoin.',
    category: 'Après la livraison',
  },
  {
    question: 'Puis-je garder mon nom de domaine et mon hébergement ?',
    answer:
      'Indiquez votre domaine et votre hébergement dans votre demande. Nous vérifions ce qui peut être conservé, la compatibilité avec le projet et les changements nécessaires avant la mise en ligne.',
    category: 'Mise en ligne',
  },
  {
    question: 'Le site sera-t-il adapté aux téléphones et tablettes ?',
    answer:
      'L’adaptation mobile et tablette est comprise dans Connecté et Immersif 3D. Vitrine est prévu pour ordinateur à la base ; cette adaptation se choisit dans le configurateur. Pour Sur mesure, les formats sont définis avec le projet.',
    category: 'Fonctionnement du site',
  },
  {
    question: 'J’ai déjà un site : faut-il tout refaire ?',
    answer:
      'Évolution permet d’ajouter des pages ou des fonctionnalités. Refonte sert à repenser le design et la structure du site. Ces deux prestations sont sur devis, après examen de l’existant et des éléments qui peuvent être conservés.',
    category: 'Site existant',
  },
  {
    question: 'Quand mon site pourra-t-il être mis en ligne ?',
    answer:
      'Le calendrier dépend des fonctionnalités choisies et des contenus disponibles. Nous confirmons une date de livraison après avoir étudié votre demande, avant de commencer le projet.',
    category: 'Création et livraison',
  },
  {
    question: 'Le référencement Google est-il compris ?',
    answer:
      'Une option Référencement local est disponible dans le configurateur. Elle prévoit des pages et des informations structurées pour votre zone d’activité. Les actions à réaliser sont précisées avec le projet ; aucune position sur Google ni aucun nombre de ventes n’est promis.',
    category: 'Visibilité',
  },
  {
    question: 'Comment savoir quel forfait choisir ?',
    answer:
      'Choisissez celui qui vous semble le plus proche de votre projet et décrivez votre besoin dans votre demande. Nos développeurs vous guideront pour confirmer le forfait et les options adaptés.',
    category: 'Choix du forfait',
  },
  {
    question: 'Et si je choisis le mauvais forfait ?',
    answer:
      'Notre équipe étudie votre demande avant de démarrer. Si un autre forfait correspond mieux à votre besoin, nous vous réorientons et ajustons la configuration avec vous.',
    category: 'Choix du forfait',
  },
]

export const optionGroups = [
  { id: 'essentials', title: 'Votre site' },
  { id: 'features', title: 'Vos fonctionnalités' },
  { id: 'content', title: 'Vos contenus' },
  { id: 'visibility', title: 'Visibilité et outils' },
  { id: 'launch', title: 'Mise en ligne et suivi' },
] as const
export type OptionGroupId = (typeof optionGroups)[number]['id']
export const optionDefinitions = [
  {
    id: 'mobile',
    title: 'Adaptation mobile et tablette',
    description: 'Une mise en page adaptée aux petits écrans.',
    billing: 'once',
    group: 'essentials',
  },
  {
    id: 'language-en',
    title: 'Français + anglais',
    description: 'Une version du site dans chaque langue. Textes fournis par vos soins.',
    billing: 'once',
    group: 'essentials',
  },
  {
    id: 'managed-content',
    title: 'Gestion des textes et images',
    description: 'Modifiez vos contenus après la livraison depuis une interface dédiée.',
    billing: 'once',
    group: 'essentials',
  },
  {
    id: 'scene-3d',
    title: 'Élément 3D interactif',
    description: 'Intégration d’un modèle 3D fourni, avec des interactions adaptées.',
    billing: 'once',
    group: 'essentials',
  },
  {
    id: 'user-accounts',
    title: 'Comptes utilisateurs',
    description: 'Inscription, connexion et espace personnel sur votre futur site.',
    billing: 'once',
    group: 'features',
  },
  {
    id: 'member-roles',
    title: 'Accès et rôles personnalisés',
    description:
      'Différents droits pour vos membres et votre équipe. Comptes utilisateurs nécessaires.',
    billing: 'once',
    group: 'features',
  },
  {
    id: 'booking',
    title: 'Prise de rendez-vous',
    description: 'Vos clients choisissent un créneau dans un calendrier en ligne.',
    billing: 'once',
    group: 'features',
  },
  {
    id: 'product-catalog',
    title: 'Catalogue de produits',
    description: 'Fiches produits et catégories, pour présenter votre offre sans panier.',
    billing: 'once',
    group: 'features',
  },
  {
    id: 'online-payment',
    title: 'Paiement en ligne',
    description:
      'Un paiement sécurisé via un prestataire. Frais du prestataire à prévoir séparément.',
    billing: 'once',
    group: 'features',
  },
  {
    id: 'online-store',
    title: 'Boutique en ligne',
    description: 'Catalogue, panier et paiement réunis. Produits et livraison à préciser ensemble.',
    billing: 'once',
    group: 'features',
  },
  {
    id: 'advanced-forms',
    title: 'Formulaire personnalisé',
    description: 'Plusieurs étapes, choix de services ou demande de devis structurée.',
    billing: 'once',
    group: 'features',
  },
  {
    id: 'blog',
    title: 'Blog et actualités',
    description: 'Publiez vos articles dans une rubrique dédiée.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'portfolio-gallery',
    title: 'Galerie de réalisations',
    description: 'Présentez vos photos et vos projets avec des filtres.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'extra-pages',
    title: 'Pages supplémentaires',
    description: 'Développez vos services ou vos rubriques. Nombre à préciser ensemble.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'additional-language',
    title: 'Une autre langue',
    description: 'Ajoutez une version dans la langue de votre choix.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'copywriting',
    title: 'Aide à la rédaction',
    description: 'Des textes préparés à partir des informations de votre activité.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'content-import',
    title: 'Reprise de contenus existants',
    description: 'Transférez les textes et médias de votre ancien site. Volume à définir.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'custom-3d',
    title: 'Création d’un modèle 3D',
    description: 'Un modèle réalisé pour votre projet. Complexité à préciser ensemble.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'local-seo',
    title: 'Référencement local',
    description: 'Pages et informations locales structurées pour votre zone d’activité.',
    billing: 'once',
    group: 'visibility',
  },
  {
    id: 'analytics',
    title: 'Statistiques de visites',
    description: 'Un outil pour comprendre les visites et les actions sur votre site.',
    billing: 'once',
    group: 'visibility',
  },
  {
    id: 'newsletter',
    title: 'Inscription à la newsletter',
    description: 'Reliez un formulaire à votre outil d’envoi d’e-mails.',
    billing: 'once',
    group: 'visibility',
  },
  {
    id: 'crm-integration',
    title: 'Connexion à vos outils',
    description: 'Reliez votre site à un CRM ou un service externe. Intégration à préciser.',
    billing: 'once',
    group: 'visibility',
  },
  {
    id: 'deployment',
    title: 'Mise en ligne du site',
    description: 'Configuration du domaine et installation sur un hébergement compatible.',
    billing: 'once',
    group: 'launch',
  },
  {
    id: 'maintenance-monthly',
    title: 'Maintenance du site',
    description: 'Suivi technique et mises à jour. Périmètre précisé avant activation.',
    billing: 'monthly',
    group: 'launch',
  },
  {
    id: 'hosting-monthly',
    title: 'Hébergement géré',
    description: 'Hébergement du site et suivi de sa disponibilité. Ressources à définir.',
    billing: 'monthly',
    group: 'launch',
  },
  {
    id: 'backups-monthly',
    title: 'Sauvegardes suivies',
    description: 'Copies régulières et restauration accompagnée selon le périmètre retenu.',
    billing: 'monthly',
    group: 'launch',
  },
] as const satisfies readonly {
  id: OptionId
  title: string
  description: string
  billing: 'once' | 'monthly'
  group: OptionGroupId
}[]

export const defaultPricing: Pricing = {
  version: 'draft-v2',
  currency: 'EUR',
  base: { vitrine: null, connecte: null, immersif: null, 'sur-mesure': null },
  options: Object.fromEntries(
    optionDefinitions.map((option) => [option.id, null]),
  ) as Pricing['options'],
}

export function normalizeConfiguration(input: unknown): Configuration {
  const value =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {}
  const offer = getOffer(value.offerId ?? 'vitrine')
  if (!offer) throw new Error('Choisissez un forfait valide.')
  const language = value.language ?? 'fr'
  if (language !== 'fr' && language !== 'fr-en') throw new Error('Choisissez une langue valide.')
  for (const key of ['mobile', 'managedContent', 'scene3d', 'deployment', 'maintenance']) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean')
      throw new Error('Vérifiez les options de votre site.')
  }
  if (
    value.extras !== undefined &&
    (!Array.isArray(value.extras) ||
      value.extras.length > EXTRA_OPTION_IDS.length ||
      value.extras.some(
        (id) => typeof id !== 'string' || !(EXTRA_OPTION_IDS as readonly string[]).includes(id),
      ))
  )
    throw new Error('Vérifiez les fonctionnalités choisies.')
  const extras = new Set((value.extras ?? []) as ExtraOptionId[])
  if (offer.id === 'connecte') extras.add('user-accounts')
  if (extras.has('member-roles')) extras.add('user-accounts')
  // A shop already covers the standalone catalogue and checkout; never charge both.
  if (extras.has('online-store')) {
    extras.delete('product-catalog')
    extras.delete('online-payment')
  }
  return {
    offerId: offer.id,
    language,
    mobile: offer.id === 'connecte' || offer.id === 'immersif' || value.mobile === true,
    managedContent: offer.id === 'connecte' || value.managedContent === true,
    scene3d: offer.id === 'immersif' || value.scene3d === true,
    deployment: value.deployment === true,
    maintenance: value.maintenance === true,
    extras: EXTRA_OPTION_IDS.filter((id) => extras.has(id)),
  }
}

export function isOptionIncluded(configuration: Configuration, id: OptionId): boolean {
  return (
    (id === 'mobile' &&
      (configuration.offerId === 'connecte' || configuration.offerId === 'immersif')) ||
    ((id === 'managed-content' || id === 'user-accounts') &&
      configuration.offerId === 'connecte') ||
    (id === 'scene-3d' && configuration.offerId === 'immersif') ||
    ((id === 'product-catalog' || id === 'online-payment') &&
      configuration.extras.includes('online-store'))
  )
}
export function isOptionSelected(configuration: Configuration, id: OptionId): boolean {
  switch (id) {
    case 'language-en':
      return configuration.language === 'fr-en'
    case 'mobile':
      return configuration.mobile
    case 'managed-content':
      return configuration.managedContent
    case 'scene-3d':
      return configuration.scene3d
    case 'deployment':
      return configuration.deployment
    case 'maintenance-monthly':
      return configuration.maintenance
    default:
      return configuration.extras.includes(id) || isOptionIncluded(configuration, id)
  }
}
export function withOption(
  configuration: Configuration,
  id: OptionId,
  selected: boolean,
): Configuration {
  const value = { ...configuration }
  switch (id) {
    case 'language-en':
      value.language = selected ? 'fr-en' : 'fr'
      break
    case 'mobile':
      value.mobile = selected
      break
    case 'managed-content':
      value.managedContent = selected
      break
    case 'scene-3d':
      value.scene3d = selected
      break
    case 'deployment':
      value.deployment = selected
      break
    case 'maintenance-monthly':
      value.maintenance = selected
      break
    default:
      value.extras = selected
        ? [...new Set([...value.extras, id])]
        : value.extras.filter((key) => key !== id)
      if (id === 'user-accounts' && !selected)
        value.extras = value.extras.filter((key) => key !== 'member-roles')
  }
  return normalizeConfiguration(value)
}
export function quoteConfiguration(input: Configuration, pricing: Pricing = defaultPricing): Quote {
  const config = normalizeConfiguration(input)
  const offer = getOffer(config.offerId)!
  const amount = (value: unknown) =>
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000
      ? value
      : null
  const lines: Quote['lines'] = [
    {
      key: 'base',
      label: offer.title,
      amountCents: amount(pricing.base?.[config.offerId]),
      included: false,
      billing: 'once',
    },
  ]
  for (const option of optionDefinitions) {
    if (!isOptionSelected(config, option.id)) continue
    const included = isOptionIncluded(config, option.id)
    lines.push({
      key: option.id,
      label: option.title,
      amountCents: included ? 0 : amount(pricing.options?.[option.id]),
      included,
      billing: option.billing,
    })
  }
  const requiresQuote = config.offerId === 'sur-mesure'
  const sum = (items: Quote['lines']) =>
    items.some((line) => line.amountCents === null)
      ? null
      : items.reduce((total, line) => total + (line.amountCents ?? 0), 0)
  const totalCents = requiresQuote ? null : sum(lines.filter((line) => line.billing === 'once'))
  const monthlyTotalCents = sum(lines.filter((line) => line.billing === 'monthly'))
  return {
    currency: pricing.currency || 'EUR',
    version: pricing.version || 'draft-v2',
    lines,
    totalCents,
    monthlyTotalCents,
    checkoutReady: !requiresQuote && totalCents !== null && monthlyTotalCents !== null,
    requiresQuote,
  }
}
export function formatMoney(amountCents: number | null | undefined, currency = 'EUR'): string {
  if (amountCents == null) return currency === 'EUR' ? '… €' : `… ${currency}`
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: amountCents % 100 ? 2 : 0,
  }).format(amountCents / 100)
}
