import type { OfferId } from '../../shared/catalog'

export const priceEstimateNote = 'Le prix est donné à titre indicatif. Un expert étudie votre projet avant de confirmer le devis. Précisez vos besoins et vos demandes particulières dans votre message.'

// Explain the approved scope before the visitor chooses paid additions.
export const includedGuidance: Record<OfferId, string> = {
  vitrine:
    'Présentez votre activité, vos services et vos coordonnées sur un site de 1 à 3 pages adapté aux mobiles, tablettes et ordinateurs. Vous fournissez les textes et les images. Le formulaire de contact, le référencement technique de base et la mise en ligne sont compris.',
  connecte:
    'Tout le forfait Vitrine est compris, avec 1 à 6 pages et des rubriques pour vos réalisations, vos tarifs et vos avis clients. Le CMS vous permet de modifier vos textes et images. Le référencement local et les statistiques de visites sont inclus.',
  immersif:
    'Tout le forfait Business est compris, avec 1 à 10 pages, des animations avancées et un travail renforcé sur la fluidité du site. Si vous avez déjà un site, nous réintégrons jusqu’à 5 pages et 15 médias. L’intégration d’un modèle fourni est comprise si la 3D sert votre projet. Nous étudions vos demandes sur mesure avant le devis.',
  'sur-mesure':
    'Le périmètre et les fonctions de ce dossier historique restent définis par son devis.',
}
