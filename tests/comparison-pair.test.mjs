import test from 'node:test'
import assert from 'node:assert/strict'
import { replaceComparisonOffer } from '../src/lib/comparison-pair.ts'

import { publicOffers } from '../shared/catalog.ts'

const offerIds = publicOffers.map(offer => offer.id)

test('either comparison column can display the third offer without changing its neighbour', () => {
  assert.deepEqual(replaceComparisonOffer(['vitrine', 'connecte'], 0, 'immersif'), ['immersif', 'connecte'])
  assert.deepEqual(replaceComparisonOffer(['vitrine', 'connecte'], 1, 'immersif'), ['vitrine', 'immersif'])
})

test('choosing the neighbouring offer swaps columns so two different offers stay visible', () => {
  assert.deepEqual(replaceComparisonOffer(['vitrine', 'connecte'], 0, 'connecte'), ['connecte', 'vitrine'])
  assert.deepEqual(replaceComparisonOffer(['vitrine', 'connecte'], 1, 'vitrine'), ['connecte', 'vitrine'])
})

test('every offer and every pair remain reachable from either phone selector', () => {
  for (const first of offerIds) {
    for (const second of offerIds.filter((offer) => offer !== first)) {
      const pair = Object.freeze([first, second])
      for (const position of [0, 1]) {
        for (const offerId of offerIds) {
          const next = replaceComparisonOffer(pair, position, offerId)
          assert.equal(next[position], offerId)
          assert.notEqual(next[0], next[1])
          assert.deepEqual(pair, [first, second], 'selection must not mutate the current pair')
        }
      }
    }
  }
})

test('reselecting the current offer preserves both column positions', () => {
  const pair = ['vitrine', 'immersif']
  assert.equal(replaceComparisonOffer(pair, 0, 'vitrine'), pair)
  assert.equal(replaceComparisonOffer(pair, 1, 'immersif'), pair)
})
