import { createContext, useContext, type ReactNode } from 'react'
import { defaultPricing, type Pricing } from '../../shared/catalog'

const PublicPricingContext = createContext<Pricing>(defaultPricing)

/** Only the public catalogue is shared with server rendering, never account data. */
export function PublicPricingProvider({ pricing, children }: { pricing: Pricing; children: ReactNode }) {
  return <PublicPricingContext.Provider value={pricing}>{children}</PublicPricingContext.Provider>
}

export const useInitialPublicPricing = () => useContext(PublicPricingContext)
