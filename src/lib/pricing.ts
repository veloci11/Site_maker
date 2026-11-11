import { OFFER_IDS, formatMoney, formatQuoteTotal, optionDefinitions, type Pricing, type Quote } from '../../shared/catalog.ts'
import { ApiError } from './api.ts'

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const validAmount = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000)

/** A JSON response is not enough: never replace the approved fallback with a partial catalogue. */
export function readCataloguePricing(response: unknown): Pricing {
  const pricing = record(response) ? response.pricing : null
  const optionIds = optionDefinitions.map(option => option.id)
  if (!record(pricing) || typeof pricing.version !== 'string' || !pricing.version.trim() ||
    (pricing.currency !== 'EUR' && pricing.currency !== 'CHF') ||
    !record(pricing.base) || !record(pricing.options)) {
    throw invalidCatalogue()
  }
  const { base, options } = pricing
  if (OFFER_IDS.some(id => !Object.hasOwn(base, id) || !validAmount(base[id])) ||
    optionIds.some(id => !Object.hasOwn(options, id) || !validAmount(options[id])) ||
    base['sur-mesure'] !== null) {
    throw invalidCatalogue()
  }
  return {
    version: pricing.version,
    currency: pricing.currency,
    base: Object.fromEntries(OFFER_IDS.map(id => [id, base[id]])) as Pricing['base'],
    options: Object.fromEntries(optionIds.map(id => [id, options[id]])) as Pricing['options'],
  }
}

function invalidCatalogue() {
  return new ApiError('Les tarifs reçus ne sont pas valides. Réessayez dans un instant.', 200, 'INVALID_CATALOGUE')
}

/** Estimate creation using the midpoint of each option with a published range. */
export function formatPublicCreationEstimate(quote: Quote): string {
  const { totalCents, currency } = quote
  if (totalCents === null) return formatQuoteTotal(quote)

  const selectedOptions = quote.lines.filter((line) => line.key !== 'base' && !line.included)
  if (selectedOptions.length === 0) return `À partir de ${formatMoney(totalCents, currency)}`

  const estimateCents = selectedOptions.reduce((total, option) => {
    const { billing, amountCents, maximumCents } = option
    if (billing !== 'once' || amountCents == null || maximumCents == null) return total
    return total + (maximumCents - amountCents) / 2
  }, totalCents)

  return `Environ ${formatMoney(Math.round(estimateCents), currency)}`
}
