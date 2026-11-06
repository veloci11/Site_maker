import type { OfferId } from '../../shared/catalog'

// Explain the approved scope before the visitor chooses paid additions.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Votre activité, vos services et vos coordonnées réunis dans un site personnalisé de 1 à 3 pages : l’essentiel pour être présenté clairement et recevoir des demandes. Mobile, tablette et ordinateur, formulaire de contact, référencement technique de base et mise en ligne sont compris. Vous fournissez les textes et les images. Besoin de plus de pages et de mises à jour autonomes ? Business comprend 1 à 6 pages, un espace de gestion (CMS), le référencement local et les statistiques de visites.',
  connecte:
    'Gardez la main sur votre site : l’espace de gestion (CMS) vous permet de modifier vos textes et images vous-même. De 1 à 6 pages pour détailler vos services, avec des rubriques pour vos réalisations, tarifs et avis clients. Le référencement local de base aide à présenter votre activité dans sa zone géographique ; les statistiques vous aident à suivre les visites. Tout Vitrine est compris, de l’adaptation aux écrans à la mise en ligne.',
  immersif:
    'Toutes les fonctions Business sont comprises dans un site de 1 à 10 pages, avec un espace de gestion (CMS) pour modifier vos textes et images vous-même. Premium ajoute une direction artistique personnalisée, des animations et interactions avancées, et la 3D si elle sert votre projet, avec un travail renforcé sur la fluidité du site et l’accompagnement. Vos demandes sur mesure sont étudiées et chiffrées selon le périmètre avant le démarrage. Vous fournissez le modèle 3D ; sa création ou un élément supplémentaire se choisissent ci-dessous.',
  'sur-mesure':
    'Le périmètre et les fonctions de ce dossier historique restent définis par son devis.',
}
