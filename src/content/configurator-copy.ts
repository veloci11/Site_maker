import type { OfferId } from '../../shared/catalog'

// Explain the base offer before the visitor chooses paid options.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Le design, l’intégration de vos contenus et un formulaire de contact sont compris. L’adaptation mobile se choisit ci-dessous. Pour des comptes visiteurs ou une expérience 3D, choisissez Connecté ou Immersif 3D.',
  connecte:
    'Les comptes de vos visiteurs, la gestion des textes et images et les versions ordinateur et mobile sont compris. Ajoutez les fonctionnalités utiles à votre activité.',
  immersif:
    'L’intégration d’un modèle 3D fourni, ses interactions et l’adaptation mobile sont comprises. La création d’un modèle sur mesure se choisit dans les options.',
  'sur-mesure':
    'Les options ci-dessous précisent des besoins courants. Décrivez aussi les fonctions spécifiques de votre projet pour définir ensemble le périmètre et le devis.',
}
