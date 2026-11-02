export const OFFER_IDS = ['vitrine', 'connecte', 'immersif', 'sur-mesure'] as const
export type OfferId = typeof OFFER_IDS[number]
export type Configuration = { offerId: OfferId; language: 'fr' | 'fr-en'; managedContent: boolean; scene3d: boolean; deployment: boolean; maintenance: boolean }
export type OptionId = 'language-en' | 'managed-content' | 'scene-3d' | 'deployment' | 'maintenance-monthly'
export type Pricing = { version: string; currency: string; base: Record<OfferId, number | null>; options: Record<OptionId, number | null> }
export type Quote = { currency: string; version: string; lines: { key: string; label: string; amountCents: number | null; included: boolean; billing: 'once' | 'monthly' }[]; totalCents: number | null; monthlyTotalCents: number | null; checkoutReady: boolean; requiresQuote: boolean }

export const offers = [
  { id: 'vitrine', slug: 'vitrine', title: 'Vitrine', headline: 'Présentez votre activité avec soin.', description: 'Un site clair pour expliquer ce que vous faites et donner envie de vous contacter.', features: ['Design adapté à votre activité', 'Version mobile', 'Formulaire de contact'], exampleId: 'domteknika', variant: 'vitrine' },
  { id: 'connecte', slug: 'connecte', title: 'Connecté', headline: 'Votre site évolue avec vous.', description: 'Ajoutez des contenus et modifiez vos textes et vos images depuis un espace simple.', features: ['Textes et images modifiables', 'Espace de gestion simple', 'Version mobile'], exampleId: 'lactel', variant: 'connecte' },
  { id: 'immersif', slug: 'immersif-3d', title: 'Immersif 3D', headline: 'Une autre dimension pour votre site.', description: 'Un élément 3D et des interactions pour faire découvrir votre univers.', features: ['Élément 3D interactif', 'Interactions soignées', 'Version mobile'], exampleId: 'tiny-heaven', variant: 'immersif' },
  { id: 'sur-mesure', slug: 'sur-mesure', title: 'Sur mesure', headline: 'Un projet particulier ? Parlons-en.', description: 'Une expérience originale ou des fonctions spécifiques : décrivez-nous votre besoin.', features: ['Fonctions dédiées', 'Intégrations spécifiques', 'Périmètre personnalisé'], exampleId: 'addiction-agency', variant: 'custom' },
] as const

export function getOffer(idOrSlug: unknown) { return offers.find(offer => offer.id === idOrSlug || offer.slug === idOrSlug) }

export const examples = [
  { id: 'domteknika', title: 'DOMTEKNIKA', category: 'Vitrine', offerId: 'vitrine', image: '/assets/examples/domteknika.webp', url: 'https://domteknika.ch/fr', sourceUrl: 'https://domteknika.ch/fr', creator: 'DOMTEKNIKA', description: 'Présenter une entreprise, son expertise et ses projets.', embeddable: false },
  { id: 'lactel', title: 'Lactel', category: 'Contenus', offerId: 'connecte', image: '/assets/examples/lactel.webp', url: 'https://www.lactel.fr/', sourceUrl: 'https://raphael-ferreira.com/work/Lactel', creator: 'Référence du portfolio de Raphaël Ferreira', description: 'Organiser des produits, des articles et des recettes.', embeddable: false },
  { id: 'julie-thiam', title: 'Julie Thiam', category: '3D', offerId: 'immersif', image: '/assets/examples/julie-thiam.webp', url: 'https://juliethiam.art/', sourceUrl: 'https://juliethiam.art/', creator: 'Julie Thiam', description: 'Découvrir les œuvres d’une artiste dans une galerie 3D.', embeddable: false },
  { id: 'tiny-heaven', title: 'Tiny Heaven', category: '3D', offerId: 'immersif', image: '/assets/examples/tiny-heaven.webp', url: 'https://tiny-heaven.netlify.app/', sourceUrl: 'https://raphael-ferreira.com/work/TinyHeaven', creator: 'Raphaël Ferreira', description: 'Explorer un univers en trois dimensions.', embeddable: true },
  { id: 'addiction-agency', title: 'Addiction Agency', category: 'Sur mesure', offerId: 'sur-mesure', image: '/assets/examples/addiction.jpg', url: 'https://raphael-ferreira.com/works', sourceUrl: 'https://raphael-ferreira.com/', creator: 'Référence du portfolio de Raphaël Ferreira', description: 'Imaginer une expérience particulière.', embeddable: false },
] as const

export const faqs = [
  { question: 'Je n’y connais rien. Puis-je quand même commander ?', answer: 'Oui. Choisissez un forfait et laissez-vous guider. Vous pourrez ajouter vos textes, vos photos et votre logo depuis votre espace client.', category: 'Choisir son site' },
  { question: 'Que signifie « À partir de » ?', answer: 'Chaque forfait a un prix de départ. Les options ponctuelles s’ajoutent au prix de création. La maintenance, si vous la choisissez, est présentée séparément par mois.', category: 'Options et prix' },
  { question: 'Puis-je combiner plusieurs options ?', answer: 'Oui. Vous pouvez par exemple associer plusieurs langues, la gestion de vos contenus et un élément 3D. Les fonctions déjà incluses dans votre forfait ne sont pas ajoutées une deuxième fois.', category: 'Options et prix' },
  { question: 'Que dois-je préparer pour mon site ?', answer: 'Une présentation de votre activité, vos coordonnées, votre logo et vos photos si vous en avez. Vous pourrez les ajouter en plusieurs fois dans votre espace.', category: 'Préparer son contenu' },
  { question: 'Quelle est la différence entre mon espace client et la gestion du site ?', answer: 'L’espace client sert à préparer et suivre votre projet. La gestion du site permet ensuite de modifier les textes et les images du site en ligne ; elle dépend du forfait et des options choisies.', category: 'Choisir son site' },
  { question: 'Et si mon projet ne rentre dans aucun forfait ?', answer: 'Choisissez Sur mesure et décrivez votre besoin. Le périmètre et le devis seront précisés avant tout engagement.', category: 'Choisir son site' },
  { question: 'Puis-je faire évoluer mon site plus tard ?', answer: 'Oui. Une nouvelle fonction peut être étudiée selon votre besoin et les possibilités de votre site.', category: 'Options et prix' },
]

export const optionDefinitions = [
  { id: 'language-en', title: 'Français + anglais', description: 'Présentez votre activité dans les deux langues.', billing: 'once' },
  { id: 'managed-content', title: 'Modifier mes textes et images', description: 'Après la mise en ligne, gardez la main.', billing: 'once' },
  { id: 'scene-3d', title: 'Un élément 3D interactif', description: 'Faites découvrir un produit ou un univers en trois dimensions.', billing: 'once' },
  { id: 'deployment', title: 'Mise en ligne de votre site', description: 'Confiez-nous la mise en ligne de votre site.', billing: 'once' },
  { id: 'maintenance-monthly', title: 'Maintenance du site', description: 'Un suivi mensuel après la mise en ligne.', billing: 'monthly' },
] as const

export const defaultPricing: Pricing = {
  version: 'draft-v1', currency: 'EUR',
  base: { vitrine: null, connecte: null, immersif: null, 'sur-mesure': null },
  options: { 'language-en': null, 'managed-content': null, 'scene-3d': null, deployment: null, 'maintenance-monthly': null },
}

export function normalizeConfiguration(input: unknown): Configuration {
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {}
  const offer = getOffer(value.offerId ?? 'vitrine')
  if (!offer) throw new Error('Choisissez un forfait valide.')
  const language = value.language ?? 'fr'
  if (language !== 'fr' && language !== 'fr-en') throw new Error('Choisissez une langue valide.')
  for (const key of ['managedContent', 'scene3d', 'deployment', 'maintenance']) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean') throw new Error('Vérifiez les options de votre site.')
  }
  return { offerId: offer.id, language, managedContent: offer.id === 'connecte' || value.managedContent === true, scene3d: offer.id === 'immersif' || value.scene3d === true, deployment: value.deployment === true, maintenance: value.maintenance === true }
}

export function quoteConfiguration(input: Configuration, pricing: Pricing = defaultPricing): Quote {
  const config = normalizeConfiguration(input)
  const offer = getOffer(config.offerId)!
  const amount = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000 ? value : null
  const lines: Quote['lines'] = [{ key: 'base', label: offer.title, amountCents: amount(pricing.base?.[config.offerId]), included: false, billing: 'once' }]
  if (config.language === 'fr-en') lines.push({ key: 'language-en', label: 'Français + anglais', amountCents: amount(pricing.options?.['language-en']), included: false, billing: 'once' })
  if (config.managedContent) lines.push({ key: 'managed-content', label: 'Modification des textes et images', amountCents: config.offerId === 'connecte' ? 0 : amount(pricing.options?.['managed-content']), included: config.offerId === 'connecte', billing: 'once' })
  if (config.scene3d) lines.push({ key: 'scene-3d', label: 'Élément 3D interactif', amountCents: config.offerId === 'immersif' ? 0 : amount(pricing.options?.['scene-3d']), included: config.offerId === 'immersif', billing: 'once' })
  if (config.deployment) lines.push({ key: 'deployment', label: 'Mise en ligne de votre site', amountCents: amount(pricing.options?.deployment), included: false, billing: 'once' })
  if (config.maintenance) lines.push({ key: 'maintenance-monthly', label: 'Maintenance du site', amountCents: amount(pricing.options?.['maintenance-monthly']), included: false, billing: 'monthly' })
  const requiresQuote = config.offerId === 'sur-mesure'
  const once = lines.filter(line => line.billing === 'once')
  const monthly = lines.filter(line => line.billing === 'monthly')
  const sum = (items: Quote['lines']) => items.some(line => line.amountCents === null) ? null : items.reduce((total, line) => total + (line.amountCents ?? 0), 0)
  const totalCents = requiresQuote ? null : sum(once)
  const monthlyTotalCents = sum(monthly)
  return { currency: pricing.currency || 'EUR', version: pricing.version || 'draft-v1', lines, totalCents, monthlyTotalCents, checkoutReady: !requiresQuote && totalCents !== null && monthlyTotalCents !== null, requiresQuote }
}

export function formatMoney(amountCents: number | null | undefined, currency = 'EUR'): string {
  if (amountCents == null) return currency === 'EUR' ? '… €' : `… ${currency}`
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: amountCents % 100 ? 2 : 0 }).format(amountCents / 100)
}
