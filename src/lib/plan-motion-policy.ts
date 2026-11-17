import type { RouterSubscriber } from 'react-router-dom'

/** Keep in sync with the compact media query in plan-motion.css. */
export const COMPACT_PLAN_MOTION_QUERY = '(max-width: 760px), (hover: none), (pointer: coarse)'

type PlanMotionEnvironment = {
  supportsViewTransition: boolean
  matchMedia(query: string): Pick<MediaQueryList, 'matches'>
}

export function getPlanMotionProfile(environment?: Pick<PlanMotionEnvironment, 'matchMedia'>): 'compact' | 'full' {
  return environment?.matchMedia(COMPACT_PLAN_MOTION_QUERY).matches ? 'compact' : 'full'
}

/** Phones share only the image; full-page choreography stays on desktop. */
export function canUseSharedPlanMotion(environment?: PlanMotionEnvironment): boolean {
  return Boolean(environment?.supportsViewTransition
    && !environment.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

const compactPairs = new WeakMap<object, boolean>()

/** Freeze a compact opening's eligibility for one accepted native transition.
 * The Router reuses location keys on Forward, but supplies a fresh context.
 * An incoming render must not rediscover an old, detached card as its source. */
export function hasCompactPlanPair(context: object, phase: 'outgoing' | 'incoming', hasVisibleCardSource: boolean): boolean {
  const accepted = compactPairs.get(context)
  if (accepted !== undefined) return accepted
  const paired = phase === 'outgoing' && hasVisibleCardSource
  compactPairs.set(context, paired)
  return paired
}

type MotionRouter = { subscribe(subscriber: RouterSubscriber): () => void }

/**
 * React Router 7.18 remembers native transitions for Back/Forward. Link options
 * alone cannot disable those after changing support or reduced motion.
 * Filter only its snapshot metadata at the provider subscription boundary; the
 * accepted location, blockers, scroll state and update timing stay unchanged.
 */
export function withPlanMotionPolicy<T extends MotionRouter>(router: T, allowSnapshots: () => boolean): T {
  const subscribe = router.subscribe.bind(router)
  router.subscribe = subscriber => subscribe((state, options) => {
    subscriber(state, options.viewTransitionOpts && !allowSnapshots()
      ? { ...options, viewTransitionOpts: undefined }
      : options)
  })
  return router
}
