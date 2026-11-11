/** Ephemeral navigation geometry only: no draft, query string or browser storage. */
type ScrollPosition = { x: number; y: number }
type PageRect = ScrollPosition & { width: number; height: number }
type PlanId = 'vitrine' | 'connecte' | 'immersif-3d' | 'sur-mesure' | 'evolution' | 'refonte'
type ListingPath = '/' | '/forfaits'
type RouteLocation = { pathname: string; search?: string; hash?: string; key?: string }
type PlanRoute = { kind: 'plan'; id: PlanId }
type ListingRoute = { kind: 'listing'; path: ListingPath; hasHash: boolean }
type Route = PlanRoute | ListingRoute | null
type ListingOrigin = { path: ListingPath; scroll: ScrollPosition }
type Page = { route: Route; key?: string; scroll: ScrollPosition }

let committedPage: Page | null = null
let origin: ListingOrigin | null = null
let prepared: { source: Page | null; target: Route; preserveScroll: boolean } | null = null
let previousPageScroll: ScrollPosition | null = null
let previousPageRect: PageRect | null = null
let restoredKey: string | undefined

function route(location: RouteLocation): Route {
  if (location.pathname === '/' || location.pathname === '/forfaits')
    return { kind: 'listing', path: location.pathname, hasHash: Boolean(location.hash) }
  const id = location.pathname.match(/^\/forfaits\/(vitrine|connecte|immersif-3d|sur-mesure)\/?$/)?.[1]
  if (id) return { kind: 'plan', id: id as PlanId }
  if (location.pathname === '/contact') {
    const service = new URLSearchParams(location.search).get('besoin')
    if (service === 'evolution' || service === 'refonte') return { kind: 'plan', id: service }
  }
  return null
}

function sameRoute(first: Route, second: Route): boolean {
  return first?.kind === 'plan' && second?.kind === 'plan'
    ? first.id === second.id
    : first?.kind === 'listing' && second?.kind === 'listing'
      ? first.path === second.path && first.hasHash === second.hasHash
      : first === second
}

function hrefRoute(href: string): Route {
  const url = new URL(href, window.location.href)
  return url.origin === window.location.origin ? route(url) : null
}

function scroll(): ScrollPosition {
  return { x: window.scrollX, y: window.scrollY }
}

/** Call only once the router accepts a navigation, before its outgoing snapshot. */
export function preparePlanNavigation(href: string, options: {
  preserveScroll?: boolean
  sourceElement?: HTMLElement | null
} = {}) {
  const target = hrefRoute(href)
  if (prepared && prepared.source?.key === committedPage?.key && sameRoute(prepared.target, target)) return
  const source = committedPage ? { ...committedPage, scroll: scroll() } : null
  prepared = { source, target, preserveScroll: Boolean(options.preserveScroll) }
  previousPageScroll = scroll()
  const rect = document.querySelector('.motion-page')?.getBoundingClientRect()
  previousPageRect = rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null

  if (source?.route?.kind === 'listing' && target?.kind === 'plan')
    origin = { path: source.route.path, scroll: scroll() }
  else if (source?.route?.kind !== 'plan' || (target?.kind !== 'plan' && target?.kind !== 'listing'))
    origin = null
}

export function getPlanReturnHref(): ListingPath {
  // Before the first incoming layout effect, a synchronous/reduced-motion
  // navigation still renders against the last committed listing.
  return origin?.path ?? (committedPage?.route?.kind === 'listing' ? committedPage.route.path : '/forfaits')
}

export function getPlanPreviousPageScroll(): ScrollPosition | null {
  return previousPageScroll
}

export function getPlanPreviousPageRect(): PageRect | null {
  return previousPageRect
}

/** Layout cleanup also remembers accepted navigations without View Transitions. */
export function rememberPlanPageScroll(location: RouteLocation) {
  if (committedPage && committedPage.key === location.key) committedPage.scroll = scroll()
}

/** Restore synchronously in a layout effect, before the incoming native snapshot. */
export function restorePlanScroll(location: RouteLocation, acceptedIntent?: { sourceKey: string; preserveScroll?: boolean; sourceElement?: HTMLElement | null }): boolean {
  const target = route(location)
  const navigation = prepared && sameRoute(prepared.target, target) ? prepared : null
  const source = navigation?.source ?? committedPage
  restoredKey = undefined

  // Normal links, reduced motion and browser Back use the last committed source.
  if (!navigation && source?.route?.kind === 'listing' && target?.kind === 'plan')
    origin = {
      path: source.route.path,
      scroll: source.scroll,
    }
  else if (source?.route?.kind !== 'plan' && target?.kind !== 'plan')
    origin = null
  else if (source?.route?.kind !== 'listing' && source?.route?.kind !== 'plan')
    origin = null

  let restored = false
  if (source?.route?.kind === 'plan' && target?.kind === 'listing'
    && origin?.path === target.path && (!navigation || !target.hasHash)) {
    let top = origin.scroll.y
    // Every entry point returns to the offer overview, including cards clicked
    // halfway down and comparison buttons. Never restore a partly hidden card.
    const section = document.querySelector<HTMLElement>(target.path === '/' ? '#forfaits' : '.public-comparison')
    const headerHeight = document.querySelector('.public-header-wrap')?.getBoundingClientRect().height ?? 0
    if (section) top = window.scrollY + section.getBoundingClientRect().top - headerHeight
    window.scrollTo({ left: origin.scroll.x, top: Math.max(0, top), behavior: 'instant' })
    restored = true
    restoredKey = location.key
  } else if ((navigation?.preserveScroll ?? (source?.key === acceptedIntent?.sourceKey && source?.route?.kind === 'plan' && target?.kind === 'plan' && acceptedIntent?.preserveScroll)) && !location.hash) {
    window.scrollTo({ left: source?.scroll.x ?? 0, top: source?.scroll.y ?? 0, behavior: 'instant' })
    restored = true
  }

  if (target?.kind !== 'plan') origin = null
  committedPage = { route: target, key: location.key, scroll: scroll() }
  prepared = null
  return restored
}

/** Home hash scrolling must not replace the restored offer overview. */
export function didRestorePlanScroll(location: Pick<RouteLocation, 'key'>): boolean {
  return restoredKey !== undefined && restoredKey === location.key
}
