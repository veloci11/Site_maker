import { useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { useLocation, useViewTransitionState } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { preparePlanNavigation } from '../../lib/plan-return'
import { consumePlanNavigationIntent, usePlanNavigationTransition } from './plan-transition'
import './plan-motion.css'

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Accepted for existing callers; content no longer waits for a timer or observer. */
  delay?: number
  once?: boolean
}

/** Always visible: scrolling cannot reveal blank spaces or wait for an observer. */
export function Reveal({ children, className, delay: _delay, once: _once, ...props }: RevealProps) {
  return <div className={cn('motion-reveal', className)} data-visible="true" {...props}>{children}</div>
}

type Geometry = { id: string; surface: DOMRect; content?: DOMRect; heading?: DOMRect; anchor?: DOMRect }

function surfaceGeometry(page: HTMLDivElement, variant: string): Omit<Geometry, 'id'> | null {
  const surface = page.querySelector<HTMLElement>('.selected-plan__surface')
    ?? page.querySelector<HTMLElement>(`.pricing-card--${variant} .pricing-card__surface`)
  if (!surface) return null
  const content = page.querySelector<HTMLElement>('.selected-plan__copy')
    ?? page.querySelector<HTMLElement>(`.pricing-card--${variant} .pricing-card__top`)
  const heading = page.querySelector<HTMLElement>('.selected-plan__heading')
  const anchor = page.querySelector<HTMLElement>('.selected-plan__copy h1')
    ?? page.querySelector<HTMLElement>(`.pricing-card--${variant} h3`)
  return {
    surface: surface.getBoundingClientRect(),
    content: content?.getBoundingClientRect(),
    heading: heading?.getBoundingClientRect(),
    anchor: anchor?.getBoundingClientRect(),
  }
}

function setGeometry(old: Omit<Geometry, 'id'> | null, next: Omit<Geometry, 'id'> | null) {
  document.documentElement.dataset.planMotionShared = String(Boolean(old && next))
  const style = document.documentElement.style
  const x = old && next ? (old.anchor ?? old.surface).x - (next.anchor ?? next.surface).x : 0
  const y = old && next ? (old.anchor ?? old.surface).y - (next.anchor ?? next.surface).y : 0
  style.setProperty('--plan-copy-enter-x', `${x}px`)
  style.setProperty('--plan-copy-enter-y', `${y}px`)
  style.setProperty('--plan-copy-exit-x', `${-x}px`)
  style.setProperty('--plan-copy-exit-y', `${-y}px`)
  // Both endpoints use the same title anchor and easing as the frame. Clip all
  // four edges: the eyebrow and total must travel inside it, including when a
  // far-right or lower-row thumbnail moves across the viewport.
  for (const [phase, geometry, otherSurface] of [
    ['enter', next, old?.surface],
    ['exit', old, next?.surface],
  ] as const) {
    for (const [part, rect] of [['copy', geometry?.content], ['heading', geometry?.heading]] as const) {
      for (const [state, surface] of [
        ['', otherSurface],
        ['-rest', geometry?.surface],
      ] as const) {
        // Signed insets interpolate the exact frame bounds. Clamping to zero
        // would keep trimming the eyebrow after it has already entered the card.
        // Clip the group, not its replaced bitmap: the browser can give that
        // bitmap a different intrinsic paint box from the element's DOM rect.
        const insets = rect && surface ? {
          top: surface.top - rect.top,
          right: rect.right - surface.right,
          bottom: rect.bottom - surface.bottom,
          left: surface.left - rect.left,
        } : { top: 0, right: 0, bottom: 0, left: 0 }
        for (const [edge, inset] of Object.entries(insets))
          style.setProperty(`--plan-${part}-${phase}${state}-${edge}`, `${inset}px`)
      }
    }
  }
}

/** Coordinated route/body and card layers; the persistent header stays live. */
export function PageTransition({ children, className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  const location = useLocation()
  const { pathname } = location
  const transitioning = useViewTransitionState(pathname)
  const planTransition = usePlanNavigationTransition()
  const page = useRef<HTMLDivElement>(null)
  const outgoing = useRef<Geometry | null>(null)
  const [planArrivalKey, setPlanArrivalKey] = useState<string>()
  const id = planTransition?.id
  const phase = planTransition?.phase
  const nextHref = planTransition?.nextHref
  const variant = planTransition?.toPlan?.variant ?? planTransition?.fromPlan?.variant

  useLayoutEffect(() => {
    if (!id || !phase || !nextHref || !variant || !page.current) return
    const headerBottom = document.querySelector('.public-header-wrap')?.getBoundingClientRect().bottom ?? 0
    const rootStyle = document.documentElement.style
    rootStyle.setProperty('--plan-motion-header', `${Math.max(0, headerBottom)}px`)
    if (phase === 'outgoing') {
      // Router sets this context after blockers and route modules are resolved,
      // synchronously before its old snapshot. Read geometry at that exact point.
      const intent = consumePlanNavigationIntent(nextHref, planTransition.sourceKey)
      preparePlanNavigation(nextHref, {
        preserveScroll: intent?.preserveScroll,
        sourceElement: intent?.sourceElement,
      })
      const measured = surfaceGeometry(page.current, variant)
      outgoing.current = measured ? { id, ...measured } : null
      setGeometry(null, null)
    } else {
      setGeometry(outgoing.current?.id === id ? outgoing.current : null, surfaceGeometry(page.current, variant))
      // Retain the completed entrance for this location. Removing the native
      // context must not restart the ordinary page entrance underneath it.
      setPlanArrivalKey(location.key)
    }
    return () => { rootStyle.removeProperty('--plan-motion-header') }
  }, [id, phase, nextHref, variant, location.key])

  const motionStyle: CSSProperties = planTransition?.phase === 'outgoing' ? {
    // Only the departing page is captured. The arriving page stays live so
    // pointer movement can never cancel its motion or suppress its controls.
    viewTransitionName: 'plan-page-outgoing',
    viewTransitionClass: 'plan-page',
  } : {}

  return (
    <div
      key={pathname}
      ref={page}
      className={cn('motion-page', transitioning && 'motion-page--transitioning', planTransition && 'motion-page--plan-transitioning', planArrivalKey === location.key && 'motion-page--plan-arrived', className)}
      data-plan-motion-direction={planTransition?.direction}
      data-plan-motion-phase={phase}
      style={{ ...style, ...motionStyle }}
      {...props}
    >
      {children}
    </div>
  )
}
