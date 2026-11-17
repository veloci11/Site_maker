import { LIVE_PLAN_MOTION_QUERY } from './plan-motion-policy.ts'

/** Ephemeral navigation geometry only: no draft, query string or browser storage. */
type ScrollPosition = { x: number; y: number }
type PageRect = ScrollPosition & { width: number; height: number }
type PlanId = 'vitrine' | 'connecte' | 'immersif-3d' | 'sur-mesure' | 'evolution' | 'refonte'
type ListingPath = '/' | '/forfaits'
type RouteLocation = { pathname: string; search?: string; hash?: string; key?: string }
type PlanRoute = { kind: 'plan'; id: PlanId }
type ListingRoute = { kind: 'listing'; path: ListingPath; hasHash: boolean }
type Route = PlanRoute | ListingRoute | null
type Page = { route: Route; key?: string; scroll: ScrollPosition; historyIndex: number | null }

let committedPage: Page | null = null
let prepared: { source: Page | null; target: Route; preserveScroll: boolean } | null = null
let previousPageScroll: ScrollPosition | null = null
let previousPageRect: PageRect | null = null
let restoredKey: string | undefined
const pageScrolls = new Map<string, ScrollPosition>()

function hasPrivateProject(location: RouteLocation): boolean {
  const params = new URLSearchParams(location.search)
  return params.has('projet') || params.has('projectId')
}

function route(location: RouteLocation): Route {
  if (hasPrivateProject(location)) return null
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

function historyIndex(): number | null {
  const index: unknown = window.history?.state?.idx
  return typeof index === 'number' ? index : null
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
}

export function getPlanReturnHref(): ListingPath {
  return '/'
}

/** Back leaves a configuration at its offer card, regardless of its entry page. */
export function getPlanBackHref(location: RouteLocation, action: string): ListingPath | null {
  const index = historyIndex()
  if (action !== 'POP' || index === null || committedPage?.historyIndex == null
    || index >= committedPage.historyIndex || committedPage.route?.kind !== 'plan'
    || hasPrivateProject(location) || route(location)?.kind === 'plan') return null
  // Keep the departing plan committed until the replacement home DOM exists.
  // Its id then selects the current card, including after Changer de forfait.
  return location.pathname === '/' && !location.hash ? null : '/'
}

export function getPlanPreviousPageScroll(): ScrollPosition | null {
  return previousPageScroll
}

export function getPlanPreviousPageRect(): PageRect | null {
  return previousPageRect
}

/** Sample the live page before navigation/DOM replacement can clamp its scroll. */
export function capturePlanPageScroll() {
  const key: unknown = window.history?.state?.key ?? 'default'
  if (committedPage && committedPage.key === key) committedPage.scroll = scroll()
}

/** Cleanup persists the last live sample, never the incoming DOM's clamped scroll. */
export function rememberPlanPageScroll(location: RouteLocation) {
  if (committedPage && committedPage.key === location.key) {
    if (location.key) {
      pageScrolls.delete(location.key)
      pageScrolls.set(location.key, committedPage.scroll)
      if (pageScrolls.size > 100) pageScrolls.delete(pageScrolls.keys().next().value!)
    }
  }
}

/** Restore synchronously in a layout effect, before the incoming native snapshot. */
export function restorePlanScroll(location: RouteLocation, acceptedIntent?: { sourceKey: string; preserveScroll?: boolean; sourceElement?: HTMLElement | null }, action?: string): boolean {
  const target = route(location)
  const navigation = prepared && sameRoute(prepared.target, target) ? prepared : null
  const source = navigation?.source ?? committedPage
  restoredKey = undefined

  let restored = false
  if (source?.route?.kind === 'plan' && target?.kind === 'listing' && target.path === '/') {
    const section = document.querySelector<HTMLElement>('#forfaits')
    const cards = section?.querySelectorAll<HTMLElement>('.pricing-card')
    const firstCard = cards?.[0]
    const secondCard = cards?.[1]
    const selectedCard = section?.querySelector<HTMLElement>(`.pricing-card[href="/forfaits/${source.route.id}"]`)
    // On desktop the row and its heading fit together. Stacked mobile cards
    // need their own top: aligning only the section would hide Business/3D.
    const cardsAreStacked = firstCard && secondCard
      && secondCard.getBoundingClientRect().top > firstCard.getBoundingClientRect().top + 1
    const anchor = cardsAreStacked && selectedCard ? selectedCard : section
    const headerHeight = document.querySelector('.public-header-wrap')?.getBoundingClientRect().height ?? 0
    if (anchor) {
      const top = window.scrollY + anchor.getBoundingClientRect().top - headerHeight
      window.scrollTo({ left: 0, top: Math.max(0, top), behavior: 'instant' })
      restored = true
      restoredKey = location.key
      // The layout is already aligned. Ease the live card into that position
      // with a transform and opacity so adjacent cards and scroll stay steady.
      if (typeof selectedCard?.animate === 'function'
        && window.matchMedia(LIVE_PLAN_MOTION_QUERY).matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const arrival = selectedCard.animate([
          { opacity: .68, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ], { duration: 560, easing: 'cubic-bezier(.24,.62,.36,1)' })
        arrival.id = 'plan-live-return'
      }
    }
  } else if ((navigation?.preserveScroll ?? (source?.key === acceptedIntent?.sourceKey && source?.route?.kind === 'plan' && target?.kind === 'plan' && acceptedIntent?.preserveScroll)) && !location.hash) {
    window.scrollTo({ left: source?.scroll.x ?? 0, top: source?.scroll.y ?? 0, behavior: 'instant' })
    restored = true
  } else if (action === 'POP' && location.key && !location.hash) {
    // Manual history restoration also preserves ordinary and private pages.
    // Public plan returns take precedence over their old partial-card offset.
    const saved = pageScrolls.get(location.key)
    if (saved) {
      window.scrollTo({ left: saved.x, top: saved.y, behavior: 'instant' })
      restored = true
    }
  }

  committedPage = { route: target, key: location.key, scroll: scroll(), historyIndex: historyIndex() }
  prepared = null
  return restored
}

/** Home hash scrolling must not replace the restored offer overview. */
export function didRestorePlanScroll(location: Pick<RouteLocation, 'key'>): boolean {
  return restoredKey !== undefined && restoredKey === location.key
}
