import type { OfferId } from '../../shared/catalog'

// Explain the approved scope before the visitor chooses paid additions.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Un site personnalisé de 1 à 3 pages pour présenter votre activité. La version mobile, tablette et ordinateur, le formulaire de contact, les bases du SEO technique et la mise en production sont compris. Vous fournissez les textes et les images. Pour gérer vos contenus avec un CMS, passer à 1 à 6 pages et bénéficier du référencement local et des statistiques, choisissez Business.',
  connecte:
    'Un site personnalisé de 1 à 6 pages avec CMS inclus : votre espace de gestion pour modifier vos textes et vos images vous-même. Présentez vos réalisations, vos tarifs et les témoignages de vos clients, avec les bases du référencement local et les statistiques de visites. Mobile, tablette et ordinateur, formulaire de contact, SEO technique et mise en production sont compris.',
  immersif:
    'Toutes les fonctions Business sont comprises, CMS inclus, avec un site de 1 à 10 pages. Premium ajoute une direction artistique personnalisée, des animations et interactions avancées, et la 3D si elle sert votre projet, avec performances et accompagnement renforcés. Vos demandes sur mesure sont étudiées et chiffrées selon le périmètre avant le démarrage. Le modèle 3D est fourni ; sa création ou un élément supplémentaire se choisissent ci-dessous.',
  'sur-mesure':
    'Le périmètre et les fonctions de ce dossier historique restent définis par son devis.',
}
