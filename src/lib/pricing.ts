import { OFFER_IDS, formatQuoteLine, formatQuoteTotal, optionDefinitions, type Pricing, type Quote } from '../../shared/catalog.ts'
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

/** Show known variation at the starting prices of open-ended options. The quote retains its own bounds. */
export function formatPublicCreationEstimate(quote: Quote) {
  const { totalCents, maximumTotalCents, currency } = quote
  if (totalCents !== null && maximumTotalCents === null) {
    const referenceUpper = quote.lines.reduce((sum, line) =>
      line.billing === 'once' ? sum + (line.maximumCents ?? line.amountCents ?? 0) : sum, 0)
    if (referenceUpper > totalCents) {
      return {
        label: formatQuoteLine({ amountCents: totalCents, maximumCents: referenceUpper }, currency),
        usesStartingPrices: true,
      }
    }
  }
  const label = formatQuoteTotal(quote)
  return {
    label: totalCents !== null && !quote.estimated ? `À partir de ${label}` : label,
    usesStartingPrices: false,
  }
}
