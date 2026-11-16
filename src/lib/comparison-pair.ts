import type { PublicOfferId } from '../../shared/catalog'

export type ComparisonOfferPair = readonly [PublicOfferId, PublicOfferId]

/** Keep both phone columns distinct; choosing the other offer swaps them. */
export function replaceComparisonOffer(
  pair: ComparisonOfferPair,
  position: 0 | 1,
  offerId: PublicOfferId,
): ComparisonOfferPair {
  if (pair[position] === offerId) return pair
  const otherPosition = position === 0 ? 1 : 0
  const next: [PublicOfferId, PublicOfferId] = [...pair]
  if (pair[otherPosition] === offerId) next[otherPosition] = pair[position]
  next[position] = offerId
  return next
}
