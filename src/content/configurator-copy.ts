import type { OfferId } from '../../shared/catalog'

export const priceEstimateNote = 'Le prix est donné à titre indicatif. Un expert étudie votre projet avant de confirmer le devis. Précisez vos besoins et vos demandes particulières dans votre message.'
export const planEstimateNote = 'Prix à titre indicatif. Précisez vos besoins et vos demandes. Un expert vous contactera pour adapter l’offre.'
export const startingOptionsNote = 'Options sur devis au prix de départ.'

// Explain the approved scope before the visitor chooses paid additions.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Présentez votre activité, vos services et vos coordonnées sur un site de 1 à 3 pages adapté aux mobiles, tablettes et ordinateurs. Vous fournissez les textes et les images. Le formulaire de contact, le référencement technique de base et la mise en ligne sont compris.',
  connecte:
    'Tout le forfait Vitrine est inclus dans Business. Vous disposez de 1 à 6 pages et de rubriques pour vos réalisations, vos tarifs et vos avis clients. Le CMS vous permet de modifier vos textes et images. Le référencement local, les statistiques et la mise en place d’une adresse e-mail professionnelle sont compris.',
  immersif:
    'Tout le forfait Business est inclus dans Premium / 3D. Vous disposez de 1 à 10 pages, d’animations avancées et de l’intégration interactive d’un modèle 3D fourni. Nous soignons la fluidité du site, reprenons jusqu’à 5 pages et 15 médias de votre ancien site et étudions vos demandes sur mesure avant le devis.',
  'sur-mesure':
    'Le périmètre et les fonctions de ce dossier historique restent définis par son devis.',
}
