import assert from 'node:assert/strict'
import test from 'node:test'
import { createMemoryRouter } from 'react-router-dom'
import { canUseSharedPlanMotion, withPlanMotionPolicy } from '../src/lib/plan-motion-policy.ts'

function environment({ width = 1440, hover = true, pointer = 'fine', reduced = false, supported = true } = {}) {
  return {
    supportsViewTransition: supported,
    matchMedia(query) {
      return {
        matches: query.split(',').some(part => {
          const media = part.trim()
          if (media === '(prefers-reduced-motion: reduce)') return reduced
          if (media === '(hover: none)') return !hover
          if (media === '(pointer: coarse)') return pointer === 'coarse'
          const maxWidth = /^\(max-width: (\d+)px\)$/.exec(media)
          if (maxWidth) return width <= Number(maxWidth[1])
          throw new Error(`Unexpected motion policy query: ${media}`)
        }),
      }
    },
  }
}

test('iPhone portrait and landscape navigate without native card snapshots', () => {
  for (const width of [320, 390, 430, 844, 932]) {
    assert.equal(canUseSharedPlanMotion(environment({ width, hover: false, pointer: 'coarse' })), false)
  }
})

test('touch tablets and a fine pointer without hover also keep the direct path', () => {
  assert.equal(canUseSharedPlanMotion(environment({ width: 1024, hover: false, pointer: 'coarse' })), false)
  assert.equal(canUseSharedPlanMotion(environment({ width: 1024, hover: false })), false)
  assert.equal(canUseSharedPlanMotion(environment({ width: 1024, pointer: 'coarse' })), false)
})

test('narrow windows use the live path; a full fine-pointer desktop keeps its expansion', () => {
  assert.equal(canUseSharedPlanMotion(environment({ width: 760 })), false)
  assert.equal(canUseSharedPlanMotion(environment({ width: 761 })), true)
  assert.equal(canUseSharedPlanMotion(environment()), true)
})

test('reduced motion, unsupported browsers and SSR never request shared captures', () => {
  assert.equal(canUseSharedPlanMotion(environment({ reduced: true })), false)
  assert.equal(canUseSharedPlanMotion(environment({ supported: false })), false)
  assert.equal(canUseSharedPlanMotion(), false)
})

test('Back/Forward stop requesting remembered desktop captures when the input policy changes', async t => {
  let allowSnapshots = true
  const router = withPlanMotionPolicy(createMemoryRouter([
    { path: '/', element: null },
    { path: '/forfaits/vitrine', element: null },
  ], { initialEntries: ['/'] }), () => allowSnapshots)
  t.after(() => router.dispose())
  const updates = []
  const unsubscribe = router.subscribe((state, options) => {
    updates.push({ path: state.location.pathname, action: state.historyAction, native: Boolean(options.viewTransitionOpts) })
  })
  t.after(unsubscribe)

  const homeKey = router.state.location.key
  await router.navigate('/forfaits/vitrine', { viewTransition: true })
  const planKey = router.state.location.key
  allowSnapshots = false
  await router.navigate(-1)
  assert.equal(router.state.location.key, homeKey)
  await router.navigate(1)
  assert.equal(router.state.location.key, planKey)
  allowSnapshots = true
  await router.navigate(-1)
  assert.deepEqual(updates, [
    { path: '/forfaits/vitrine', action: 'PUSH', native: true },
    { path: '/', action: 'POP', native: false },
    { path: '/forfaits/vitrine', action: 'POP', native: false },
    { path: '/', action: 'POP', native: true },
  ])
})

test('the policy filters only snapshot metadata and preserves accepted update options', () => {
  let publish
  const unsubscribe = () => {}
  const router = withPlanMotionPolicy({
    subscribe(subscriber) { publish = subscriber; return unsubscribe },
  }, () => false)
  const state = { location: { key: 'accepted-plan' }, blockers: new Map() }
  const native = { currentLocation: { key: 'home' }, nextLocation: state.location }
  const options = { deletedFetchers: ['finished-request'], newErrors: null, flushSync: true, viewTransitionOpts: native }
  let received
  assert.equal(router.subscribe((nextState, nextOptions) => { received = { state: nextState, options: nextOptions } }), unsubscribe)
  publish(state, options)
  assert.equal(received.state, state)
  assert.deepEqual(received.options, { ...options, viewTransitionOpts: undefined })
  assert.equal(options.viewTransitionOpts, native, 'Do not mutate Router metadata shared with other subscribers')
})
