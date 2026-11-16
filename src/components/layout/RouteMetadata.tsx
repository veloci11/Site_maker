import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteSeo, getStructuredData, siteSocialImage } from '../../../shared/seo'
import { useInitialPublicPricing } from '../../lib/public-pricing'

function setMeta(attribute: 'name' | 'property', key: string, content: string | null) {
  const matches = document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  const element = matches[0]
  for (const duplicate of Array.from(matches).slice(1)) duplicate.remove()
  if (content === null) {
    element?.remove()
    return
  }
  const meta = element ?? document.createElement('meta')
  meta.setAttribute(attribute, key)
  meta.content = content
  if (!element) document.head.append(meta)
}

/** Keep navigation within the SPA consistent with each server-rendered head. */
export function RouteMetadata() {
  const { pathname, search } = useLocation()
  const pricing = useInitialPublicPricing()
  useEffect(() => {
    const metadata = getRouteSeo(pathname, search, pricing)
    document.title = metadata.title
    setMeta('name', 'description', metadata.description)
    setMeta('name', 'robots', metadata.robots)

    const canonicals = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
    const canonical = canonicals[0]
    for (const duplicate of Array.from(canonicals).slice(1)) duplicate.remove()
    if (metadata.canonical) {
      const link = canonical ?? document.createElement('link')
      link.rel = 'canonical'
      link.href = metadata.canonical
      if (!canonical) document.head.append(link)
    } else canonical?.remove()

    const publicPage = Boolean(metadata.canonical)
    setMeta('property', 'og:type', publicPage ? 'website' : null)
    setMeta('property', 'og:locale', publicPage ? 'fr_FR' : null)
    setMeta('property', 'og:site_name', publicPage ? 'pixelito' : null)
    setMeta('property', 'og:title', publicPage ? metadata.title : null)
    setMeta('property', 'og:description', publicPage ? metadata.description : null)
    setMeta('property', 'og:url', metadata.canonical)
    setMeta('property', 'og:image', publicPage ? siteSocialImage : null)
    setMeta('property', 'og:image:width', publicPage ? '512' : null)
    setMeta('property', 'og:image:height', publicPage ? '512' : null)
    setMeta('property', 'og:image:alt', publicPage ? 'Symbole pixelito' : null)
    setMeta('name', 'twitter:card', publicPage ? 'summary' : null)
    setMeta('name', 'twitter:title', publicPage ? metadata.title : null)
    setMeta('name', 'twitter:description', publicPage ? metadata.description : null)
    setMeta('name', 'twitter:image', publicPage ? siteSocialImage : null)
    setMeta('name', 'twitter:image:alt', publicPage ? 'Symbole pixelito' : null)
    const previous = document.getElementById('studio-structured-data')
    const data = getStructuredData(metadata)
    if (data) {
      const script = previous ?? document.createElement('script')
      script.id = 'studio-structured-data'
      script.setAttribute('type', 'application/ld+json')
      script.textContent = JSON.stringify(data)
      if (!previous) document.head.append(script)
    } else previous?.remove()
  }, [pathname, search, pricing])
  return null
}
