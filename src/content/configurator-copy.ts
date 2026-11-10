import type { OfferId } from '../../shared/catalog'

export const priceEstimateNote = 'Le prix est donné à titre indicatif. Un expert étudie votre projet avant de confirmer le devis. Précisez vos besoins et vos demandes particulières dans votre message.'
export const planEstimateNote = 'Prix à titre indicatif. Précisez vos besoins et vos demandes. Un expert vous contactera pour adapter l’offre.'

// Explain the approved scope before the visitor chooses paid additions.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Présentez votre activité, vos services et vos coordonnées sur un site de 3 pages maximum, adapté aux mobiles, tablettes et ordinateurs. Vous fournissez les textes et les images. Le formulaire de contact, le référencement technique de base et la mise en ligne sont compris. Le CMS et l’option Espace membres sont disponibles à partir de Business.',
  connecte:
    'Tout le forfait Vitrine est inclus dans Business, avec jusqu’à 6 pages et des rubriques pour vos réalisations, vos tarifs et vos avis clients. Un CMS vous permet de gérer vos textes et images. Le référencement local, les statistiques et la mise en place d’une adresse e-mail professionnelle sont compris.',
  immersif:
    'Tout le forfait Business est inclus, avec des animations avancées et l’intégration interactive d’un modèle 3D fourni. Nous définissons le nombre de pages selon votre projet et reprenons jusqu’à 5 pages et 15 médias de votre ancien site.',
  'sur-mesure':
    'Le périmètre et les fonctions de ce dossier historique restent définis par son devis.',
}
