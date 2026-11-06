import type { OfferId } from '../../shared/catalog'

// Explain the approved scope before the visitor chooses paid additions.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Un site de 1 à 3 pages pour présenter votre activité. La version mobile, tablette et ordinateur, le formulaire de contact, les bases du SEO technique et la mise en production sont compris. Vous fournissez les textes et les images. Pour aller jusqu’à 6 pages, modifier vos contenus et bénéficier du référencement local et des statistiques, choisissez Business.',
  connecte:
    'Jusqu’à 6 pages dont vous pouvez modifier les textes et images. Le forfait comprend une galerie, vos tarifs et témoignages, les bases du référencement local et les statistiques avec une configuration adaptée. La version mobile, tablette et ordinateur, le formulaire de contact, les bases du SEO technique et la mise en production sont compris.',
  immersif:
    'Toutes les prestations Business sont comprises : jusqu’à 6 pages modifiables, galerie, tarifs et témoignages, référencement local et statistiques, en plus du socle mobile, contact et mise en production. Premium ajoute une direction artistique personnalisée, des animations et interactions avancées, et Three.js / WebGL si pertinent, avec optimisation des performances et accompagnement renforcés. Le modèle 3D est fourni ; sa création ou un élément supplémentaire se choisissent ci-dessous.',
  'sur-mesure':
    'Le périmètre et les fonctions de ce dossier historique restent définis par son devis.',
}
