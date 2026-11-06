import type { OfferId } from '../../shared/catalog'

// Explain the approved scope before the visitor chooses paid additions.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Un site personnalisé de 1 à 3 pages pour présenter votre activité. La version mobile, tablette et ordinateur, le formulaire de contact, les réglages de base pour les moteurs de recherche et la mise en ligne sont compris. Vous fournissez les textes et les images. Business permet de passer à 1 à 6 pages, de modifier vos contenus dans un espace de gestion (CMS) et de bénéficier du référencement local et des statistiques de visites.',
  connecte:
    'Un site personnalisé de 1 à 6 pages avec un espace de gestion (CMS) pour modifier vos textes et images vous-même. Présentez les photos de vos réalisations, vos tarifs et les avis de vos clients, avec les bases du référencement local et les statistiques de visites. L’adaptation aux différents écrans, le formulaire de contact, les réglages de base pour les moteurs de recherche et la mise en ligne sont compris.',
  immersif:
    'Toutes les fonctions Business sont comprises dans un site de 1 à 10 pages, avec un espace de gestion (CMS) pour modifier vos textes et images vous-même. Premium ajoute une direction artistique personnalisée, des animations et interactions avancées, et la 3D si elle sert votre projet, avec un travail renforcé sur la fluidité du site et l’accompagnement. Vos demandes sur mesure sont étudiées et chiffrées selon le périmètre avant le démarrage. Vous fournissez le modèle 3D ; sa création ou un élément supplémentaire se choisissent ci-dessous.',
  'sur-mesure':
    'Le périmètre et les fonctions de ce dossier historique restent définis par son devis.',
}
