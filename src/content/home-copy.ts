import { formatMoney, type Pricing } from '../../shared/catalog.ts'

export const homeDescription = 'Nous concevons et créons votre site internet sur mesure pour présenter votre activité, faciliter les prises de contact ou faire découvrir votre univers en 3D.'

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
