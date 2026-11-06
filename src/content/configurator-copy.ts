import type { OfferId } from '../../shared/catalog'

// Explain the approved scope before the visitor chooses paid additions.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Votre site de 1 à 3 pages repose sur un template. La version mobile, tablette et ordinateur, le formulaire de contact, les bases du SEO technique et la mise en production sont compris. Vous fournissez les textes et les images. Pour un template personnalisé, une réservation, un formulaire avancé ou le référencement local, choisissez Business.',
  connecte:
    'Jusqu’à 6 pages avec un template personnalisé, un formulaire avancé, l’intégration de Doctolib ou d’un outil de réservation compatible, les bases du SEO local, une galerie, vos tarifs et témoignages, ainsi que les statistiques avec une configuration adaptée. Gestion des textes et images, version responsive et mise en production comprises. Les abonnements éventuels aux outils restent séparés.',
  immersif:
    'Direction artistique personnalisée, animations avancées, interactions propres à votre projet et Three.js / WebGL si pertinent. Le périmètre visuel est défini ensemble, avec optimisation des performances et accompagnement renforcé. Gestion des contenus, version responsive, formulaire de contact, bases du SEO technique et mise en production compris. Le modèle 3D est fourni ; sa création ou un élément supplémentaire se choisissent ci-dessous.',
  'sur-mesure':
    'Le périmètre et les fonctions de ce dossier historique restent définis par son devis.',
}
