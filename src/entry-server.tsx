import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom'
import { appRoutes } from './App'
import { PublicPricingProvider } from './lib/public-pricing'
import { siteOrigin } from '../shared/seo'
import type { Pricing } from '../shared/catalog'

const handler = createStaticHandler(appRoutes)

/** Render the actual public React route for every visitor, regardless of user agent. */
export async function renderPublicPage(href: string, pricing: Pricing): Promise<string> {
  const context = await handler.query(new Request(new URL(href, siteOrigin)))
  if (context instanceof Response) throw new Error('Unexpected redirect during public rendering')
  const router = createStaticRouter(handler.dataRoutes, context)
  let failure: unknown
  const { prelude, postponed } = await prerenderToNodeStream(
    <StrictMode>
      <PublicPricingProvider pricing={pricing}>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </PublicPricingProvider>
    </StrictMode>,
    // Public pages fit in one completed boundary. Avoid React emitting hidden
    // streaming segments that need inline scripts and violate the existing CSP.
    { signal: AbortSignal.timeout(10_000), progressiveChunkSize: 1_000_000, onError(error) { failure = error } },
  )
  if (failure) throw failure
  if (postponed) throw new Error('Public rendering did not finish')
  const chunks: Buffer[] = []
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}
