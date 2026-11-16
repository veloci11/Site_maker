import { formatMoney, type Pricing } from '../../shared/catalog.ts'

export const homeDescription = 'Créer votre site internet devient simple. Vous choisissez les fonctionnalités utiles, nous vous guidons jusqu’à la mise en ligne.'
export const homeBenefits = ['Design personnalisé', 'Mobile compris', 'Mise en ligne comprise']

export function homeStartingAmount(pricing: Pricing) {
  const amount = pricing.base.vitrine
  return amount == null ? null : formatMoney(amount, pricing.currency)
}

export function homeMetaDescription(pricing: Pricing) {
  const amount = homeStartingAmount(pricing)
  const introduction = amount
    ? `Votre site internet personnalisé à petit prix, à partir de ${amount}.`
    : 'Votre site internet personnalisé sur devis.'
  return `${introduction} Design adapté à votre activité, mobile et mise en ligne compris.`
}
