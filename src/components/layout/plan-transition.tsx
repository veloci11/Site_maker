import { forwardRef, useCallback, useContext, useLayoutEffect, type CSSProperties, type MouseEvent } from 'react'
import {
  Link,
  NavLink,
  UNSAFE_ViewTransitionContext,
  useLocation,
  useNavigate,
  type LinkProps,
  type Location,
  type NavigateOptions,
  type NavLinkProps,
  type To,
} from 'react-router-dom'
import { offers } from '../../../shared/catalog'
import { existingSiteOffers } from '../../content/existing-site'

type PlanRoute = { href: string; variant: string }
type MotionIntent = { href: string; sourceKey: string; preserveScroll: boolean; sourceElement?: HTMLElement | null }
let navigationIntent: MotionIntent | null = null
let interruptionListeners = 0

/** End the browser's snapshot, never navigation or a pending Router update. */
function interruptPlanMotion() {
  const active = (document as Document & {
    activeViewTransition?: { skipTransition(): void } | null
  }).activeViewTransition
  if (active) {
    active.skipTransition()
    return
  }
  // Older implementations expose the native animations but not the active VT.
  for (const animation of document.getAnimations()) {
    if (animation instanceof CSSAnimation
      && /^(?:plan-motion-|-ua-view-transition-)/.test(animation.animationName)) {
      try { animation.finish() } catch { /* A finished/cancelled snapshot needs no intervention. */ }
    }
  }
}

function handlePlanMotionInput(event: Event) {
  if (!event.isTrusted) return
  interruptPlanMotion()
}

function usePlanMotionInterruption(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return
    // Incoming controls are outside the captured copy. Mere pointer movement
    // keeps the full choreography; a new action or scroll takes over at once.
    const events = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const
    if (interruptionListeners++ === 0)
      for (const event of events) document.addEventListener(event, handlePlanMotionInput, { capture: true, passive: true })
    return () => {
      if (--interruptionListeners === 0)
        for (const event of events) document.removeEventListener(event, handlePlanMotionInput, true)
    }
  }, [active])
}

export function canAnimatePlanNavigation() {
  return typeof document !== 'undefined'
    && typeof document.startViewTransition === 'function'
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function routeHref(location: Pick<Location, 'pathname' | 'search' | 'hash'>) {
  return location.pathname + location.search + location.hash
}

function planRoute(location: Pick<Location, 'pathname' | 'search'>): PlanRoute | null {
  const pathname = location.pathname.replace(/\/$/, '') || '/'
  const offer = offers.find((item) => pathname === `/forfaits/${item.slug}`)
  if (offer) return { href: `/forfaits/${offer.slug}`, variant: offer.variant }
  if (pathname === '/contact') {
    const service = existingSiteOffers.find((item) => item.id === new URLSearchParams(location.search).get('besoin'))
    if (service) return { href: service.href, variant: service.id }
  }
  return null
}

function isListing(location: Pick<Location, 'pathname'>) {
  // The homepage CTA uses #forfaits. It remains the same listing journey.
  return location.pathname === '/' || location.pathname.replace(/\/$/, '') === '/forfaits'
}

export type PlanNavigationTransition = {
  id: string
  sourceKey: string
  direction: 'open' | 'close' | 'switch'
  phase: 'outgoing' | 'incoming'
  fromPlan: PlanRoute | null
  toPlan: PlanRoute | null
  nextHref: string
}

/**
 * React Router 7.18 exposes the accepted transition endpoints here. Its public
 * useViewTransitionState matches only pathname, which conflates both services
 * on /contact. Keep that version-specific adapter in one place, and fail closed
 * if the context is absent/inactive. The Router alone starts/cancels native VTs.
 */
export function usePlanNavigationTransition(): PlanNavigationTransition | null {
  const context = useContext(UNSAFE_ViewTransitionContext)
  const location = useLocation()
  usePlanMotionInterruption(Boolean(context?.isTransitioning))
  if (!context?.isTransitioning || !canAnimatePlanNavigation()) return null
  const { currentLocation, nextLocation } = context
  if (!currentLocation || !nextLocation || currentLocation.key === nextLocation.key) return null
  if (location.key !== currentLocation.key && location.key !== nextLocation.key) return null
  const fromPlan = planRoute(currentLocation)
  const toPlan = planRoute(nextLocation)
  const direction = fromPlan && toPlan ? 'switch'
    : toPlan && isListing(currentLocation) ? 'open'
      : fromPlan && isListing(nextLocation) ? 'close' : null
  if (!direction) return null
  if (fromPlan && toPlan && fromPlan.href === toPlan.href) return null
  return {
    id: `${currentLocation.key}:${nextLocation.key}`,
    sourceKey: currentLocation.key,
    direction,
    phase: location.key === currentLocation.key ? 'outgoing' : 'incoming',
    fromPlan,
    toPlan,
    nextHref: routeHref(nextLocation),
  }
}

function stageNavigation(href: string, sourceKey: string, options: NavigateOptions, sourceElement?: HTMLElement | null) {
  navigationIntent = { href, sourceKey, preserveScroll: Boolean(options.preventScrollReset), sourceElement }
}

/** An intent carries geometry only; it never changes return history before a blocker accepts. */
export function getPlanNavigationIntent(href: string, sourceKey?: string) {
  if (!navigationIntent || typeof window === 'undefined') return undefined
  if (sourceKey !== undefined && navigationIntent.sourceKey !== sourceKey) return undefined
  const intended = new URL(navigationIntent.href, window.location.href)
  const next = new URL(href, window.location.href)
  return intended.href === next.href ? navigationIntent : undefined
}

export function consumePlanNavigationIntent(href: string, sourceKey: string) {
  const intent = getPlanNavigationIntent(href, sourceKey)
  if (intent) navigationIntent = null
  return intent
}

export function discardPlanNavigationIntent() {
  navigationIntent = null
}

/** Programmatic plan changes use the same interruptible Router path as links. */
export function usePlanNavigate() {
  const navigate = useNavigate()
  const location = useLocation()
  const context = useContext(UNSAFE_ViewTransitionContext)
  return useCallback((to: To, options: NavigateOptions = {}) => {
    const href = typeof to === 'string' ? to
      : (to.pathname ?? location.pathname) + (to.search ?? '') + (to.hash ?? '')
    stageNavigation(href, location.key, options)
    const interrupting = Boolean(context?.isTransitioning)
    if (interrupting) interruptPlanMotion()
    const animate = !interrupting && (options.viewTransition ?? true) && canAnimatePlanNavigation()
    return navigate(to, { ...options, viewTransition: animate, flushSync: options.flushSync ?? animate })
  }, [navigate, location.pathname, location.key, context?.isTransitioning])
}

function useMotionLinkClick(props: LinkProps | NavLinkProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const context = useContext(UNSAFE_ViewTransitionContext)
  return (event: MouseEvent<HTMLAnchorElement>) => {
    props.onClick?.(event)
    if (event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || (props.target && props.target !== '_self') || props.reloadDocument
      || event.currentTarget.hasAttribute('download')
      || !props.viewTransition
      || (typeof props.to === 'string' && /^([a-z][a-z\d+.-]*:|\/\/)/i.test(props.to))) return

    event.preventDefault()
    const interrupting = Boolean(context?.isTransitioning)
    if (interrupting) interruptPlanMotion()
    const animate = !interrupting && canAnimatePlanNavigation()
    const options = {
      replace: props.replace ?? event.currentTarget.href === window.location.href,
      state: props.state,
      relative: props.relative,
      preventScrollReset: props.preventScrollReset,
      viewTransition: animate,
      flushSync: animate,
    }
    stageNavigation(event.currentTarget.href, location.key, options, event.currentTarget)
    // No animation-finished callbacks can replay an obsolete route. Router
    // blockers run first; accepted outgoing capture consumes the intent.
    return navigate(props.to, options)
  }
}

export const MotionLink = forwardRef<HTMLAnchorElement, LinkProps>(function MotionLink(props, ref) {
  const onClick = useMotionLinkClick(props)
  return <Link {...props} ref={ref} onClick={onClick} />
})

export const MotionNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function MotionNavLink(props, ref) {
  const onClick = useMotionLinkClick(props)
  return <NavLink {...props} ref={ref} onClick={onClick} />
})

export function usePlanTransition(
  variant: string,
  href: string,
  part: 'surface' | 'content' | 'heading' | 'thumbnail' = 'surface',
): CSSProperties {
  const transition = usePlanNavigationTransition()
  const active = transition && [transition.fromPlan, transition.toPlan]
    .some((plan) => plan?.variant === variant && plan.href === href)
  const suffix = part === 'surface' ? '' : part === 'thumbnail' ? '-thumbnail-copy' : `-${part}`
  return {
    viewTransitionName: active ? `plan-${variant}${suffix}` : undefined,
    viewTransitionClass: part === 'thumbnail' ? 'plan-thumbnail-copy' : `plan-${part}`,
  }
}
