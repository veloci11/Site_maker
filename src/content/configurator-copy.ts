import type { OfferId } from '../../shared/catalog'

// Explain the base offer before the visitor chooses paid options.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Le design, l’intégration de vos contenus et un formulaire de contact sont compris. L’adaptation mobile et les autres fonctionnalités se choisissent ci-dessous.',
  connecte:
    'Les comptes de vos visiteurs, la gestion des textes et images et les versions ordinateur et mobile sont compris. Ajoutez les fonctionnalités utiles à votre activité.',
  immersif:
    'L’intégration d’un modèle 3D fourni, ses interactions et l’adaptation mobile sont comprises. La création d’un modèle sur mesure se choisit dans les options.',
  'sur-mesure':
    'Choisissez les fonctionnalités attendues et décrivez votre projet. Le contenu de la prestation est défini avec vous avant le devis.',
}
