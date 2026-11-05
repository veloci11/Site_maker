import { useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react'
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

type Geometry = { id: string; surface: DOMRect; content?: DOMRect }

function surfaceGeometry(page: HTMLDivElement, variant: string): Omit<Geometry, 'id'> | null {
  const surface = page.querySelector<HTMLElement>('.selected-plan__surface')
    ?? page.querySelector<HTMLElement>(`.pricing-card--${variant} .pricing-card__surface`)
  if (!surface) return null
  const content = page.querySelector<HTMLElement>('.selected-plan__content')
  return { surface: surface.getBoundingClientRect(), content: content?.getBoundingClientRect() }
}

function setGeometry(old: Omit<Geometry, 'id'> | null, next: Omit<Geometry, 'id'> | null) {
  const style = document.documentElement.style
  const x = old && next ? old.surface.x - next.surface.x : 0
  const y = old && next ? old.surface.y - next.surface.y : 0
  style.setProperty('--plan-copy-enter-x', `${x}px`)
  style.setProperty('--plan-copy-enter-y', `${y}px`)
  style.setProperty('--plan-copy-exit-x', `${-x}px`)
  style.setProperty('--plan-copy-exit-y', `${-y}px`)
  // Copy translates with the moving frame but never scales. Clip only pixels
  // outside that frame, revealing final-resolution type as its bounds grow.
  for (const [phase, content, ownSurface, otherSurface] of [
    ['enter', next?.content, next?.surface, old?.surface],
    ['exit', old?.content, old?.surface, next?.surface],
  ] as const) {
    const right = content && ownSurface && otherSurface
      ? Math.max(0, content.width - otherSurface.width + content.x - ownSurface.x) : 0
    const bottom = content && ownSurface && otherSurface
      ? Math.max(0, content.height - otherSurface.height + content.y - ownSurface.y) : 0
    style.setProperty(`--plan-copy-${phase}-right`, `${right}px`)
    style.setProperty(`--plan-copy-${phase}-bottom`, `${bottom}px`)
  }
}

/** Coordinated route/body and card layers; the persistent header stays live. */
export function PageTransition({ children, className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { pathname } = useLocation()
  const transitioning = useViewTransitionState(pathname)
  const planTransition = usePlanNavigationTransition()
  const page = useRef<HTMLDivElement>(null)
  const outgoing = useRef<Geometry | null>(null)
  const id = planTransition?.id
  const phase = planTransition?.phase
  const nextHref = planTransition?.nextHref
  const variant = planTransition?.toPlan?.variant ?? planTransition?.fromPlan?.variant

  useLayoutEffect(() => {
    if (!id || !phase || !nextHref || !variant || !page.current) return
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
    }
  }, [id, phase, nextHref, variant])

  const motionStyle: CSSProperties = planTransition ? {
    // Different names deliberately form two unpaired snapshots. Each keeps its
    // native viewport rectangle, including the old page's actual scroll.
    // Pairing entire pages would resize/reposition a long listing into a short
    // detail page and require fragile scroll compensation.
    viewTransitionName: `plan-page-${planTransition.phase}`,
    viewTransitionClass: 'plan-page',
  } : {}

  return (
    <div
      key={pathname}
      ref={page}
      className={cn('motion-page', transitioning && 'motion-page--transitioning', planTransition && 'motion-page--plan-transitioning', className)}
      data-plan-motion-direction={planTransition?.direction}
      data-plan-motion-phase={phase}
      style={{ ...style, ...motionStyle }}
      {...props}
    >
      {children}
    </div>
  )
}
