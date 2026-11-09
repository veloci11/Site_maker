export const OFFER_IDS = ['vitrine', 'connecte', 'immersif', 'sur-mesure'] as const
export type OfferId = (typeof OFFER_IDS)[number]
export const PUBLIC_OFFER_IDS = ['vitrine', 'connecte', 'immersif'] as const
export type PublicOfferId = (typeof PUBLIC_OFFER_IDS)[number]
export const isPublicOffer = (id: unknown): id is PublicOfferId =>
  (PUBLIC_OFFER_IDS as readonly unknown[]).includes(id)
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
  'extra-scene-3d',
  'hosting-monthly',
  'serenity-monthly',
  'backups-monthly',
] as const
export type ExtraOptionId = (typeof EXTRA_OPTION_IDS)[number]
/** Technical input limit, not a commitment to deliver projects of this size. */
export const MAX_EXTRA_PAGE_COUNT = 100
const ADDITIONAL_LANGUAGE_PAGE_LIMIT = { vitrine: 5, connecte: 6, immersif: 6, 'sur-mesure': 5 } as const
export type Configuration = {
  offerId: OfferId
  language: 'fr' | 'fr-en'
  mobile: boolean
  managedContent: boolean
  scene3d: boolean
  deployment: boolean
  maintenance: boolean
  extras: ExtraOptionId[]
  /** Historical selections without a quantity mean one additional page. */
  extraPageCount?: number
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
    maximumCents?: number | null
    estimated?: boolean
    included: boolean
    billing: 'once' | 'monthly'
    quantity?: number
    scope?: string
  }[]
  totalCents: number | null
  /** Absent on historical snapshots; null means no approved upper estimate. */
  maximumTotalCents?: number | null
  monthlyTotalCents: number | null
  checkoutReady: boolean
  requiresQuote: boolean
  estimated: boolean
  /** New estimates depend on the confirmed project scope; absent in old snapshots. */
  estimateBasis?: 'scope'
}

export const offers = [
  {
    id: 'vitrine',
    slug: 'vitrine',
    title: 'Vitrine',
    headline: 'Votre activité, en ligne.',
    description:
      'Présentez clairement votre activité, vos services et vos coordonnées sur 1 à 3 pages personnalisées. Un point de contact accessible sur mobile comme sur ordinateur.',
    features: ['Site personnalisé de 1 à 3 pages', 'Mobile, tablette et ordinateur', 'Contact, référencement de base, mise en ligne'],
    exampleId: 'domteknika',
    variant: 'vitrine',
  },
  {
    id: 'connecte',
    slug: 'connecte',
    title: 'Business',
    headline: 'Votre site évolue avec votre activité.',
    description:
      'Gardez la main sur vos textes et images grâce à votre espace de gestion (CMS). De 1 à 6 pages personnalisées pour détailler vos services, avec référencement local de base et statistiques pour suivre les visites.',
    features: ['Tout le forfait Vitrine inclus · 1 à 6 pages', 'CMS pour gérer vos textes et images', 'Référencement local et statistiques', 'Mise en place d’un e-mail professionnel'],
    exampleId: 'lactel',
    variant: 'connecte',
  },
  {
    id: 'immersif',
    slug: 'immersif-3d',
    title: 'Premium / 3D',
    headline: 'Une présence visuelle distinctive.',
    description: 'Tout le forfait Business est inclus sur 1 à 10 pages, avec la reprise de vos contenus existants, des animations avancées et la 3D interactive. Vos demandes sur mesure sont étudiées avant devis.',
    features: ['Tout le forfait Business inclus · 1 à 10 pages', 'Animations avancées et 3D interactive', 'Reprise de vos anciens contenus', 'Demandes sur mesure étudiées'],
    exampleId: 'tiny-heaven',
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
/** The fourth definition remains available to historical private dossiers only. */
export const publicOffers = offers.filter((offer) => isPublicOffer(offer.id))
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
    category: 'Business',
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
    category: 'Premium / 3D',
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
    category: 'Premium / 3D',
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
    category: 'Premium / 3D',
    offerId: 'immersif',
    image: '/assets/examples/addiction-agency.webp',
    url: 'https://addiction-agency.com/',
    sourceUrl: 'https://addiction-agency.com/',
    creator: 'Addiction Agency',
    description: 'Présenter une agence créative et son univers.',
    embeddable: false,
  },
  {
    id: 'geoboss',
    title: 'GeoBoss',
    category: 'Premium / 3D',
    offerId: 'immersif',
    image: '/assets/examples/geoboss.webp',
    url: 'https://geoboss.onrender.com/',
    sourceUrl: 'https://raphael-ferreira.com/',
    creator: 'Raphaël Ferreira',
    description: 'Un jeu de géographie multijoueur avec globe 3D et classement.',
    embeddable: false,
  },
  {
    id: 'aema',
    title: 'Aéma Groupe',
    category: 'Business',
    offerId: 'connecte',
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
    category: 'Premium / 3D',
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
    category: 'Premium / 3D',
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
    question: "Quels frais dois-je prévoir après la création du site ?",
    answer:
      "La mise en production est comprise dans les trois forfaits. Le suivi mensuel est facultatif : Hébergement à 19 €/mois, Maintenance à 39 €/mois ou Sérénité à 69 €/mois. Ces formules ne se cumulent pas. Nous précisons les coûts nécessaires à votre projet avant le démarrage.",
    category: "Budget et suivi",
  },
  {
    question: "Qui prépare les textes et les photos ?",
    answer:
      "Vous fournissez les textes de vos pages, votre logo si vous en avez un, vos coordonnées et les images que vous êtes autorisé à utiliser. Vous pouvez nous transmettre une première liste de contenus même si tout n’est pas prêt. Si vous avez déjà un site, l’option de reprise couvre jusqu’à cinq pages et quinze médias ; la réécriture et la création de nouveaux contenus restent distinctes.",
    category: "Contenus",
  },
  {
    question: "Pourrai-je modifier mes textes et mes photos après la livraison ?",
    answer:
      "Oui, avec Business ou Premium / 3D. Le CMS inclus vous permet de modifier vous-même les textes et images des pages prévues dans votre forfait. Le blog et la boutique disposent de leur gestion propre pour les articles et les produits. Ajouter une page, changer la structure ou développer une nouvelle fonction demande de préciser le périmètre de l’intervention.",
    category: "Après la livraison",
  },
  {
    question: "Puis-je garder mon nom de domaine et mon hébergement ?",
    answer:
      "Oui, lorsque les services existants sont compatibles avec le nouveau site. Indiquez le nom de domaine et l’hébergeur dans votre message : nous vérifions ce qui peut être conservé et les éventuels changements nécessaires. Le domaine, l’hébergement et les adresses e-mail peuvent relever de services différents ; précisez aussi si vous utilisez une messagerie professionnelle liée à ce domaine. Aucun mot de passe n’est à envoyer dans le formulaire.",
    category: "Mise en ligne",
  },
  {
    question: "Une adresse e-mail professionnelle est-elle comprise ?",
    answer:
      "Business et Premium / 3D comprennent la mise en place d’une boîte e-mail sur votre nom de domaine et son raccordement au formulaire du site. L’abonnement éventuel à la messagerie reste séparé. La reprise de vos anciens messages est chiffrée sur devis.",
    category: "Mise en ligne",
  },
  {
    question: "Le site sera-t-il adapté aux téléphones et tablettes ?",
    answer:
      "Oui. Vitrine, Business et Premium / 3D comprennent une mise en page adaptée aux téléphones, aux tablettes et aux ordinateurs. Les contenus et les interactions sont ajustés aux petits écrans ; une animation ou une scène 3D doit aussi rester pertinente et utilisable sur mobile.",
    category: "Fonctionnement du site",
  },
  {
    question: "J’ai déjà un site : peut-on reprendre mes contenus ?",
    answer:
      "Indiquez l’adresse de votre site et les textes, images ou rubriques à conserver. La reprise est comprise dans Premium / 3D et disponible en option avec Vitrine et Business. Elle couvre la réintégration de cinq pages et quinze médias au maximum. Les volumes plus importants, la réécriture et la création de nouvelles pages sont chiffrés séparément.",
    category: "Site existant",
  },
  {
    question: "Quand mon site pourra-t-il être mis en ligne ?",
    answer:
      "Le calendrier dépend du nombre de pages, des fonctions choisies, des intégrations et de la disponibilité de vos contenus. Une date souhaitée ou un événement peut être indiqué dans votre message. Nous confirmons le planning après l’étude de votre demande et du périmètre, avant de commencer. Un changement important de contenu ou de fonctionnalités peut nécessiter de revoir ce planning avec vous.",
    category: "Création et livraison",
  },
  {
    question: "Le référencement Google est-il compris ?",
    answer:
      "Les trois forfaits comprennent les bases du référencement technique. Business et Premium / 3D comprennent aussi les bases du référencement local. Cela prépare le site à être compris par les moteurs de recherche, mais ne garantit ni une position, ni un volume de visites ou de ventes. La visibilité dépend aussi des contenus, de la concurrence et du travail réalisé dans le temps ; les actions prévues sont précisées avec votre projet.",
    category: "Visibilité",
  },
  {
    question: "Comment savoir quel forfait choisir ?",
    answer:
      "Vitrine présente votre activité sur un site personnalisé de 1 à 3 pages. Business reprend Vitrine sur 1 à 6 pages, avec un CMS pour modifier vos textes et images, le référencement local et les statistiques. L’espace membres est disponible en option à partir de Business. Premium / 3D reprend Business sur 1 à 10 pages et ajoute les animations avancées, la reprise de vos contenus existants et l’étude de vos demandes sur mesure. La prise de rendez-vous en ligne est disponible en option dans les trois forfaits. Nous vérifions vos besoins avant de confirmer le devis.",
    category: "Choix du forfait",
  },
  {
    question: "Comment sont comptées les pages supplémentaires et les options ?",
    answer:
      "Vitrine prévoit 1 à 3 pages, Business 1 à 6 et Premium / 3D 1 à 10. Chaque page supplémentaire dans le design de votre site et avec vos contenus est estimée entre 60 et 120 €. Deux pages ajoutent donc 120 à 240 € à l’estimation. La reprise de contenus couvre jusqu’à cinq pages et quinze médias. Le configurateur indique le nombre de pages couvertes par l’option de langue. Précisez les pages concernées dans votre message pour que nous puissions chiffrer les éventuels compléments.",
    category: "Budget et suivi",
  },
  {
    question: "Et si je choisis le mauvais forfait ?",
    answer:
      "Votre sélection sert de point de départ à l’échange. Notre équipe étudie votre demande avant le démarrage et vous propose un autre forfait si son périmètre est plus adapté. Le choix et les options sont confirmés avec vous. Envoyer le formulaire ne déclenche aucun paiement.",
    category: "Choix du forfait",
  },
  {
    question: "Quelle différence entre Hébergement, Maintenance et Sérénité ?",
    answer:
      "Hébergement à 19 €/mois couvre l’hébergement, le certificat SSL et la surveillance de disponibilité. Maintenance à 39 €/mois ajoute les mises à jour, les sauvegardes et de petites modifications de contenus existants. Sérénité à 69 €/mois comprend Maintenance, une heure de modifications par mois et un support prioritaire.",
    category: "Budget et suivi",
  },
  {
    question: "Qu’apporte Premium / 3D par rapport à Business ?",
    answer:
      "Premium / 3D reprend Business sur 1 à 10 pages. Il ajoute la reprise de vos contenus, des animations avancées, l’intégration d’un modèle 3D interactif, un travail renforcé sur la fluidité et un accompagnement plus poussé. La création du modèle et les développements sur mesure sont chiffrés selon vos besoins.",
    category: "Fonctionnalités",
  },
  {
    question: "Puis-je proposer mon site dans une autre langue ?",
    answer:
      `Oui. Nous traduisons vos textes et intégrons une langue supplémentaire, navigation comprise. L’option à 100 € couvre jusqu’à ${ADDITIONAL_LANGUAGE_PAGE_LIMIT.vitrine} pages avec Vitrine et ${ADDITIONAL_LANGUAGE_PAGE_LIMIT.connecte} avec Business ou Premium / 3D. Indiquez la langue souhaitée et les pages concernées. Au-delà de ces limites, le complément est chiffré sur devis.`,
    category: "Contenus",
  },
  {
    question: "Ai-je besoin de liens de paiement ou d’une boutique ?",
    answer:
      "Les liens de paiement à 100 € permettent d’encaisser directement le prix d’un produit ou d’une prestation via un lien. La boutique à 600–1 100 € permet de vendre depuis un catalogue avec panier et de gérer jusqu’à dix produits simples. Nous précisons les modalités de livraison, les taxes et les frais du prestataire dans le devis.",
    category: "Fonctionnalités",
  },
  {
    question: "Qu’inclut la 3D dans le forfait Premium / 3D ?",
    answer:
      "Le forfait comprend l’intégration d’un modèle 3D fourni avec des interactions adaptées à votre site. La création d’un objet simple est proposée à partir de 150 €. L’intégration d’un élément supplémentaire est disponible en option.",
    category: "Design et 3D",
  },
  {
    question: "Peut-on prendre rendez-vous directement depuis mon site ?",
    answer:
      "Oui. L’option « Prise de rendez-vous en ligne », disponible dans les trois forfaits, permet à vos visiteurs de choisir un créneau avec un outil compatible. La configuration, l’intégration autorisée et les tests sont estimés entre 90 et 180 € pour un outil. Son abonnement éventuel reste séparé. Un simple lien ne nécessite pas cette prestation ; un système développé spécialement ou une connexion particulière demande une étude distincte.",
    category: "Fonctionnalités",
  },
  {
    question: "Que se passe-t-il après l’envoi de ma demande ?",
    answer:
      "Votre forfait, vos options et votre message sont enregistrés ensemble. Nous étudions le besoin, les contenus disponibles et les contraintes pour préciser le périmètre, le prix et le calendrier avec vous. Vous pouvez aussi utiliser Nous contacter si vous n’avez pas encore choisi de forfait. Le formulaire sert à préparer cet échange : il ne lance ni le développement ni un paiement automatique.",
    category: "Création et livraison",
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
    title: 'Ajouter une version anglaise',
    description: 'Une version anglaise pour jusqu’à 5 pages, navigation comprise. Vous fournissez les traductions ; rédaction et traduction ne sont pas incluses.',
    billing: 'once',
    group: 'essentials',
  },
  {
    id: 'additional-language',
    title: 'Langue supplémentaire',
    description: 'Nous traduisons vos textes et intégrons la langue au site, navigation comprise. Indiquez la langue souhaitée dans votre message.',
    billing: 'once',
    group: 'essentials',
  },
  {
    id: 'managed-content',
    title: 'Modifier mes contenus (CMS)',
    description: 'Modifiez vous-même les textes et images de 5 pages maximum. Au-delà, le complément est chiffré sur devis.',
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
    title: 'Espace membres',
    description: 'Inscription, connexion et profil simple avec un mécanisme d’authentification. Rôles complexes, abonnements et espace métier exclus ; périmètre confirmé avant devis.',
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
    title: 'Prise de rendez-vous en ligne',
    description: 'Permettez à vos visiteurs de choisir un créneau en ligne. Configuration, intégration autorisée et tests d’un outil compatible ; un simple lien seul ne nécessite pas cette prestation. L’abonnement éventuel à l’outil reste séparé. Une réservation développée spécialement ou une connexion à une API particulière fait l’objet d’une étude distincte.',
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
    title: 'Liens de paiement',
    description: 'Encaissez directement le prix d’un produit ou d’une prestation via un lien. Nous configurons le prestataire et intégrons les liens au site. Les frais du prestataire sont précisés dans le devis.',
    billing: 'once',
    group: 'features',
  },
  {
    id: 'online-store',
    title: 'Boutique avec panier et paiement',
    description: 'Vos clients choisissent leurs produits et paient sur votre site. Vous disposez d’un catalogue et d’un espace pour gérer jusqu’à 10 produits simples. Nous précisons la livraison, les taxes et les frais du prestataire dans le devis.',
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
    title: 'Blog prêt à publier',
    description: 'Nous installons une rubrique Blog avec son éditeur. Vous rédigez, modifiez et publiez vos articles depuis votre site.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'portfolio-gallery',
    title: 'Photos de réalisations',
    description: 'Présentez vos photos et vos projets avec des filtres.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'extra-pages',
    title: 'Ajouter une page',
    description: 'Une page de plus dans le design de votre site, avec vos textes et images. Précisez si vous souhaitez la gérer avec le CMS ou lui ajouter d’autres fonctions pour que nous puissions les chiffrer.',
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
    title: 'Reprendre mon ancien contenu',
    description: 'Nous réintégrons les contenus de votre site existant, jusqu’à 5 pages et 15 médias que vous êtes autorisé à utiliser. Au-delà de ce volume, le complément est chiffré sur devis.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'custom-3d',
    title: 'Créer mon modèle 3D',
    description: 'Nous créons un modèle 3D simple avec une révision. L’intégration du modèle sur le site est une prestation distincte.',
    billing: 'once',
    group: 'content',
  },
  {
    id: 'extra-scene-3d',
    title: 'Ajouter un élément 3D',
    description: 'Nous intégrons un modèle 3D fourni sur une page, avec des interactions simples et un chargement optimisé.',
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
    title: 'Suivre mes visites',
    description: 'Nous configurons Google Analytics 4 ou un outil adapté à votre site pour suivre les visites et une action utile, comme l’envoi du formulaire. Les frais éventuels de l’outil sont précisés dans le devis.',
    billing: 'once',
    group: 'visibility',
  },
  {
    id: 'newsletter',
    title: 'Inscription à la newsletter',
    description: 'Un formulaire de 2 champs pour que vos visiteurs s’inscrivent à votre newsletter. Nous le relions à une liste de votre outil d’envoi. L’abonnement à l’outil et les campagnes sont gérés séparément.',
    billing: 'once',
    group: 'visibility',
  },
  {
    id: 'crm-integration',
    title: 'Connexion à vos outils',
    description: 'Reliez votre site à un CRM ou un service externe. Échanges, intégration et frais du service à préciser.',
    billing: 'once',
    group: 'visibility',
  },
  {
    id: 'deployment',
    title: 'Mise en ligne du site',
    description:
      'Installation sur un hébergement compatible, raccordement du domaine et HTTPS. Domaine et hébergement à prévoir séparément.',
    billing: 'once',
    group: 'launch',
  },
  {
    id: 'hosting-monthly',
    title: 'Hébergement',
    description: 'Hébergement du site, certificat SSL et surveillance de sa disponibilité. Nom de domaine et abonnements aux outils externes séparés.',
    billing: 'monthly',
    group: 'launch',
  },
  {
    id: 'maintenance-monthly',
    title: 'Maintenance',
    description: 'Hébergement, mises à jour, sauvegardes et petites modifications de contenus existants.',
    billing: 'monthly',
    group: 'launch',
  },
  {
    id: 'serenity-monthly',
    title: 'Sérénité',
    description: 'Tous les services de Maintenance, plus 1 heure de modifications par mois et un support prioritaire.',
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

/** Minimums for scoped options; their displayed ranges never become a fixed quote. */
export const OPTION_PRICE_RANGES: Partial<Record<OptionId, { min: number; max?: number }>> = {
  booking: { min: 9_000, max: 18_000 },
  'user-accounts': { min: 30_000, max: 60_000 },
  'online-store': { min: 60_000, max: 110_000 },
  'extra-pages': { min: 6_000, max: 12_000 },
  'content-import': { min: 10_000, max: 25_000 },
  'custom-3d': { min: 15_000 },
  'extra-scene-3d': { min: 25_000, max: 60_000 },
  newsletter: { min: 9_000 },
}

export const MONTHLY_PLAN_IDS = ['hosting-monthly', 'maintenance-monthly', 'serenity-monthly'] as const

export const defaultPricing: Pricing = {
  version: 'public-2026-11-06-booking-v2',
  currency: 'EUR',
  base: { vitrine: 89_000, connecte: 149_000, immersif: 249_000, 'sur-mesure': null },
  options: {
    ...Object.fromEntries(optionDefinitions.map((option) => [option.id, null])),
    'language-en': 10_000,
    'additional-language': 10_000,
    'managed-content': 30_000,
    'user-accounts': 30_000,
    booking: 9_000,
    'online-payment': 10_000,
    'online-store': 60_000,
    blog: 15_000,
    'extra-pages': 6_000,
    'content-import': 10_000,
    'custom-3d': 15_000,
    'extra-scene-3d': 25_000,
    analytics: 6_000,
    newsletter: 9_000,
    'hosting-monthly': 1_900,
    'maintenance-monthly': 3_900,
    'serenity-monthly': 6_900,
  } as Pricing['options'],
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
  if (value.extraPageCount !== undefined &&
    (typeof value.extraPageCount !== 'number' || !Number.isSafeInteger(value.extraPageCount) ||
      value.extraPageCount < 1 || value.extraPageCount > MAX_EXTRA_PAGE_COUNT))
    throw new Error(`Choisissez entre 1 et ${MAX_EXTRA_PAGE_COUNT} pages supplémentaires.`)
  if (offer.id === 'connecte' || offer.id === 'immersif') {
    for (const id of ['portfolio-gallery', 'analytics', 'local-seo'] as const)
      extras.add(id)
  }
  if (extras.has('member-roles')) extras.add('user-accounts')
  // A shop already covers the standalone catalogue and checkout; never charge both.
  if (extras.has('online-store')) {
    extras.delete('product-catalog')
    extras.delete('online-payment')
  }
  // A recurring plan replaces the smaller plans; never add their monthly fees.
  const serenity = extras.has('serenity-monthly')
  const maintenance = !serenity && value.maintenance === true
  if (serenity || maintenance) extras.delete('hosting-monthly')
  return {
    offerId: offer.id,
    language,
    mobile: isPublicOffer(offer.id) || value.mobile === true,
    managedContent: offer.id === 'connecte' || offer.id === 'immersif' || value.managedContent === true,
    scene3d: offer.id === 'immersif' || value.scene3d === true,
    deployment: isPublicOffer(offer.id) || value.deployment === true,
    maintenance,
    extras: EXTRA_OPTION_IDS.filter((id) => extras.has(id)),
    ...(extras.has('extra-pages') && typeof value.extraPageCount === 'number' && value.extraPageCount > 1
      ? { extraPageCount: value.extraPageCount } : {}),
  }
}

export function isOptionIncluded(configuration: Configuration, id: OptionId): boolean {
  return (
    ((id === 'mobile' || id === 'deployment') && isPublicOffer(configuration.offerId)) ||
    (id === 'managed-content' &&
      (configuration.offerId === 'connecte' || configuration.offerId === 'immersif')) ||
    ((configuration.offerId === 'connecte' || configuration.offerId === 'immersif') &&
      (['portfolio-gallery', 'analytics', 'local-seo'] as OptionId[]).includes(id)) ||
    ((id === 'scene-3d' || id === 'content-import') && configuration.offerId === 'immersif') ||
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
  const value = { ...configuration, extras: [...configuration.extras] }
  if (selected && (MONTHLY_PLAN_IDS as readonly OptionId[]).includes(id)) {
    value.maintenance = false
    value.extras = value.extras.filter(key => key !== 'hosting-monthly' && key !== 'serenity-monthly')
  }
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

/** Quantities only apply to explicitly selected extra pages, never to capped lots. */
export function withExtraPageCount(configuration: Configuration, count: number): Configuration {
  return normalizeConfiguration({
    ...configuration,
    extras: [...new Set([...configuration.extras, 'extra-pages'])],
    extraPageCount: count,
  })
}
export function getOptionDescription(offerId: OfferId, option: (typeof optionDefinitions)[number]): string {
  if (option.id === 'additional-language')
    return `Jusqu’à ${ADDITIONAL_LANGUAGE_PAGE_LIMIT[offerId]} pages. ${option.description} Au-delà de ce périmètre, le complément est chiffré sur devis.`
  if (option.id === 'extra-pages' && offerId === 'vitrine')
    return 'Une page de plus dans le design de votre site, avec vos textes et images.'
  if (option.id === 'extra-scene-3d' && offerId === 'immersif')
    return `${option.description} Cette option ajoute un élément 3D supplémentaire.`
  return option.description
}
export function getOptionScope(configuration: Configuration, id: OptionId): string | null {
  if (id === 'content-import') return 'Reprise de 5 pages et 15 médias maximum.'
  if (isOptionIncluded(configuration, id))
    return id === 'managed-content' && configuration.extras.includes('extra-pages')
      ? 'Gestion des contenus des pages prévues dans le forfait.' : null
  switch (id) {
    case 'extra-pages': {
      const count = configuration.extraPageCount ?? 1
      return `${count} page${count > 1 ? 's' : ''} supplémentaire${count > 1 ? 's' : ''} dans le design du site, avec vos textes et images.`
    }
    case 'language-en':
      return 'Une langue, jusqu’à 5 pages, traductions fournies.'
    case 'additional-language':
      return `Une langue, jusqu’à ${ADDITIONAL_LANGUAGE_PAGE_LIMIT[configuration.offerId]} pages. Traduction et intégration par notre équipe.`
    case 'managed-content':
      return 'Gestion des textes et images de 5 pages maximum.'
    default:
      return null
  }
}
function optionScopeDetail(configuration: Configuration, id: OptionId): string | null {
  const scope = getOptionScope(configuration, id)
  if (!scope) return null
  if (id === 'language-en' || id === 'additional-language') {
    const pageLimit = id === 'language-en' ? 5 : ADDITIONAL_LANGUAGE_PAGE_LIMIT[configuration.offerId]
    return `${scope} Un devis complémentaire est nécessaire au-delà de ${pageLimit} pages ou pour plusieurs langues.`
  }
  if (id === 'managed-content')
    return `${scope} ${isOptionIncluded(configuration, id)
      ? 'La gestion des pages supplémentaires et son éventuel complément de devis sont à confirmer.'
      : 'Au-delà de 5 pages, un devis complémentaire est nécessaire.'}`
  if (id === 'content-import')
    return `${scope} Au-delà de l’une de ces limites, un devis complémentaire est nécessaire.`
  return scope
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
      maximumCents: amount(pricing.base?.[config.offerId]),
      estimated: isPublicOffer(config.offerId),
      included: false,
      billing: 'once',
    },
  ]
  if (config.offerId === 'connecte' || config.offerId === 'immersif') {
    lines.push({
      key: 'professional-email',
      label: 'Adresse e-mail professionnelle',
      amountCents: 0,
      maximumCents: 0,
      included: true,
      billing: 'once',
      scope: 'Une boîte sur votre domaine, reliée au formulaire. Abonnement de messagerie séparé.',
    })
  }
  for (const option of optionDefinitions) {
    if (!isOptionSelected(config, option.id)) continue
    const included = isOptionIncluded(config, option.id)
    const unitMinimum = included ? 0 : amount(pricing.options?.[option.id])
    const quantity = option.id === 'extra-pages' ? config.extraPageCount ?? 1 : 1
    const minimum = unitMinimum === null ? null : unitMinimum * quantity
    const range = included ? undefined : OPTION_PRICE_RANGES[option.id]
    // Published upper bounds apply to their approved EUR minimums only. An
    // independently configured admin price must not inherit an invented cap.
    const maximum = range
      ? unitMinimum === range.min && pricing.currency === 'EUR' ? range.max === undefined ? null : range.max * quantity : null
      : minimum
    const scope = optionScopeDetail(config, option.id)
    lines.push({
      key: option.id,
      label: option.id === 'extra-pages' && quantity > 1 ? `Pages supplémentaires (${quantity} pages)` : option.title,
      amountCents: minimum,
      maximumCents: maximum,
      estimated: Boolean(range),
      included,
      billing: option.billing,
      ...(option.id === 'extra-pages' ? { quantity } : {}),
      ...(scope ? { scope } : {}),
    })
  }
  const estimated = lines.some(line => line.estimated)
  const requiresQuote = config.offerId === 'sur-mesure' || estimated
  const sum = (items: Quote['lines']) =>
    items.some((line) => line.amountCents === null)
      ? null
      : items.reduce((total, line) => total + (line.amountCents ?? 0), 0)
  const totalCents = config.offerId === 'sur-mesure' ? null : sum(lines.filter((line) => line.billing === 'once'))
  const once = lines.filter(line => line.billing === 'once')
  const maximumTotalCents = config.offerId === 'sur-mesure' || once.some(line => line.maximumCents == null)
    ? null
    : once.reduce((total, line) => total + (line.maximumCents ?? 0), 0)
  const monthlyTotalCents = sum(lines.filter((line) => line.billing === 'monthly'))
  return {
    currency: pricing.currency || 'EUR',
    version: pricing.version || 'draft-v2',
    lines,
    totalCents,
    maximumTotalCents,
    monthlyTotalCents,
    checkoutReady: !requiresQuote && totalCents !== null && monthlyTotalCents !== null,
    requiresQuote,
    estimated,
    estimateBasis: 'scope',
  }
}

function formatEstimate(minimum: number | null, maximum: number | null | undefined, estimated: boolean | undefined, currency: string) {
  if (minimum === null) return 'À préciser'
  if (typeof maximum === 'number' && maximum > minimum)
    return `${formatMoney(minimum, currency)}–${formatMoney(maximum, currency)}`
  return `${estimated ? 'À partir de ' : ''}${formatMoney(minimum, currency)}`
}

/** Read the saved bounds only; never reconstruct historical estimates from today's catalogue. */
export function formatQuoteTotal(quote: Pick<Quote, 'totalCents' | 'currency'> & Partial<Quote>): string {
  if (quote.totalCents === null && quote.requiresQuote) return 'Sur devis'
  return formatEstimate(quote.totalCents, quote.maximumTotalCents, quote.estimated, quote.currency)
}

export function formatQuoteLine(line: Pick<Quote['lines'][number], 'amountCents' | 'maximumCents' | 'estimated'>, currency = 'EUR'): string {
  return formatEstimate(line.amountCents, line.maximumCents, line.estimated, currency)
}

export function quoteEstimateNotice(quote: Pick<Quote, 'estimated' | 'maximumTotalCents'> & Partial<Pick<Quote, 'totalCents'>>): string {
  if (quote.maximumTotalCents != null && quote.maximumTotalCents === quote.totalCents)
    return 'Estimation de départ selon le périmètre du projet. Le montant sera confirmé sur devis.'
  return quote.maximumTotalCents == null
    ? 'Estimation minimale : certaines options n’ont pas de plafond défini. Le montant dépend du périmètre et sera confirmé sur devis.'
    : 'Fourchette indicative selon le périmètre des options. Le montant sera confirmé sur devis.'
}

/** Show the approved range, and a minimum when a future admin tariff differs. */
export function formatOptionPrice(id: OptionId, pricing: Pricing = defaultPricing): string {
  const amount = pricing.options[id]
  const range = OPTION_PRICE_RANGES[id]
  const option = optionDefinitions.find(item => item.id === id)!
  const suffix = option.billing === 'monthly' ? ' / mois' : ''
  if (amount == null) return 'Sur devis'
  if (range) {
    if (range.max !== undefined && amount === range.min && pricing.currency === 'EUR')
      return `${formatMoney(amount, pricing.currency)}–${formatMoney(range.max, pricing.currency)}`
    return `À partir de ${formatMoney(amount, pricing.currency)}`
  }
  return `${formatMoney(amount, pricing.currency)}${suffix}`
}
export function formatMoney(amountCents: number | null | undefined, currency = 'EUR'): string {
  if (amountCents == null) return currency === 'EUR' ? '… €' : `… ${currency}`
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: amountCents % 100 ? 2 : 0,
  }).format(amountCents / 100)
}
