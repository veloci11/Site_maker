import { useEffect, useState } from 'react'
import { defaultPricing, formatMoney, getOffer, type OfferId, type Pricing } from '../../../shared/catalog'
import { api } from '../../lib/api'
import { readCataloguePricing } from '../../lib/pricing'

export function usePricing() {
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)
  useEffect(() => {
    const controller = new AbortController()
    api<unknown>('/api/catalogue', { signal: controller.signal })
      .then((data) => setPricing(readCataloguePricing(data)))
      .catch(() => {
        /* Keep the approved shared catalogue when the API is unavailable. */
      })
    return () => controller.abort()
  }, [])
  return pricing
}

export function startingPrice(offerId: OfferId, pricing: Pricing) {
  if (offerId === 'sur-mesure') return 'Sur devis'
  const amount = pricing.base[offerId]
  return amount == null ? 'Sur devis' : `À partir de ${formatMoney(amount, pricing.currency)}`
}

export const configureHref = (offerId: OfferId) => `/forfaits/${getOffer(offerId)!.slug}`

