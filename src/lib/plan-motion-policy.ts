import type { RouterSubscriber } from 'react-router-dom'

/** Keep in sync with the live-card media query in plan-motion.css. */
export const LIVE_PLAN_MOTION_QUERY = '(max-width: 760px), (hover: none), (pointer: coarse)'

type PlanMotionEnvironment = {
  supportsViewTransition: boolean
  matchMedia(query: string): Pick<MediaQueryList, 'matches'>
}

/** Native card snapshots belong to fine-pointer desktops, never touch screens. */
export function canUseSharedPlanMotion(environment?: PlanMotionEnvironment): boolean {
  return Boolean(environment?.supportsViewTransition
    && !environment.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !environment.matchMedia(LIVE_PLAN_MOTION_QUERY).matches)
}

type MotionRouter = { subscribe(subscriber: RouterSubscriber): () => void }

/**
 * React Router 7.18 remembers native transitions for Back/Forward. Link options
 * alone cannot disable those after changing viewport/input or reduced motion.
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
