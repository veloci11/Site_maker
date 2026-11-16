import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App, createAppRouter } from './App.tsx'
import { defaultPricing } from '../shared/catalog'
import { readCataloguePricing } from './lib/pricing'
import { readPublicDraftConfiguration } from './lib/draft'
import { PublicPricingProvider } from './lib/public-pricing'
import './styles.css'

const root = document.getElementById('root')!
let pricing = defaultPricing
try {
  const data = document.getElementById('studio-public-data')?.textContent
  if (data) pricing = readCataloguePricing(JSON.parse(data))
} catch { /* A static preview still uses the approved public catalogue. */ }

const router = createAppRouter()
function start() {
  const app = <StrictMode><PublicPricingProvider pricing={pricing}><App router={router} /></PublicPricingProvider></StrictMode>
  // A returning visitor's saved configuration is private browser state. Mount it
  // normally instead of trying to hydrate the anonymous base-offer HTML.
  const savedConfiguration = /^\/forfaits\/[^/]+\/?$/.test(window.location.pathname)
    && Boolean(readPublicDraftConfiguration())
  if (root.dataset.ssr === 'true' && !savedConfiguration) hydrateRoot(root, app)
  else createRoot(root).render(app)
}

// Preserve useful server HTML while the first route's module is loading.
if (router.state.initialized) start()
else {
  const unsubscribe = router.subscribe(state => {
    if (!state.initialized) return
    unsubscribe()
    start()
  })
}
