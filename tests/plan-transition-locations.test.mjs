import assert from 'node:assert/strict'
import test from 'node:test'
import { createMemoryRouter } from 'react-router-dom'
import { normalizePlanTransitionLocations } from '../src/lib/plan-transition-locations.ts'

for (const listing of ['/', '/forfaits']) {
  for (const slug of ['vitrine', 'connecte', 'immersif-3d']) {
    test(`native transition endpoints follow PUSH, Back and Forward from ${listing} to ${slug}`, async t => {
      const planPath = `/forfaits/${slug}`
      const router = createMemoryRouter([
        { path: listing, element: null },
        { path: planPath, element: null },
      ], { initialEntries: [listing] })
      t.after(() => router.dispose())
      const transitions = []
      const unsubscribe = router.subscribe((state, { viewTransitionOpts }) => {
        if (!viewTransitionOpts) return
        const { currentLocation, nextLocation } = viewTransitionOpts
        // The hook reads this committed router state while React still paints
        // its outgoing route. Check that source against the actual router.
        const target = router.state.location
        transitions.push({
          action: state.historyAction,
          currentLocation,
          nextLocation,
          target,
          publishedTarget: state.location,
          normalized: normalizePlanTransitionLocations(currentLocation, nextLocation, target.key),
        })
      })
      t.after(unsubscribe)

      const overview = router.state.location
      await router.navigate(planPath, { viewTransition: true })
      const plan = router.state.location
      await router.navigate(-1)
      assert.equal(router.state.location.key, overview.key)
      await router.navigate(1)
      assert.equal(router.state.location.key, plan.key)

      assert.equal(transitions.length, 3, 'The real router must request a native transition for all three navigations')
      const expected = [
        { action: 'PUSH', from: overview, to: plan },
        { action: 'POP', from: plan, to: overview },
        { action: 'POP', from: overview, to: plan },
      ]
      transitions.forEach((transition, index) => {
        const journey = expected[index]
        assert.equal(transition.action, journey.action)
        assert.equal(transition.target.key, transition.publishedTarget.key)
        assert.equal(transition.target.key, journey.to.key)
        assert.ok(transition.normalized, 'Both accepted endpoints must be available')
        assert.equal(transition.normalized.fromLocation.key, journey.from.key)
        assert.equal(transition.normalized.toLocation.key, journey.to.key)
        assert.equal(transition.normalized.fromLocation.pathname, journey.from.pathname)
        assert.equal(transition.normalized.toLocation.pathname, journey.to.pathname)
      })
      assert.equal(transitions[1].currentLocation.key, overview.key,
        'Exercise the reversed POP context: its currentLocation is the incoming overview, not the departing plan')
      assert.equal(transitions[1].nextLocation.key, plan.key)
    })
  }
}

test('transition normalization rejects stale targets and identical endpoint keys', () => {
  const first = { key: 'first' }
  const second = { key: 'second' }
  assert.equal(normalizePlanTransitionLocations(first, second, undefined), null)
  assert.equal(normalizePlanTransitionLocations(first, second, 'unrelated-navigation'), null)
  assert.equal(normalizePlanTransitionLocations(first, { key: 'first' }, 'first'), null)
})

test('location keys disambiguate shared paths without losing queries, hashes or state', () => {
  const evolution = { key: 'evolution', pathname: '/contact', search: '?besoin=evolution', hash: '#details', state: { origin: 'offers' } }
  const refonte = { key: 'refonte', pathname: '/contact', search: '?besoin=refonte', hash: '', state: null }
  const result = normalizePlanTransitionLocations(evolution, refonte, evolution.key)
  assert.equal(result.fromLocation, refonte)
  assert.equal(result.toLocation, evolution)
})
