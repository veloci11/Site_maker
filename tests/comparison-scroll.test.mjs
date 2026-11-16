import test from 'node:test'
import assert from 'node:assert/strict'
import { comparisonColumnScrollLeft } from '../src/lib/comparison-scroll.ts'

function geometry(viewportWidth, column, scrollLeft) {
  const clientWidth = viewportWidth - 42
  const labelWidth = 108
  const offerWidth = clientWidth - labelWidth
  const tableWidth = labelWidth + 3 * offerWidth
  const viewportLeft = 21
  return {
    scrollLeft,
    clientWidth,
    scrollWidth: tableWidth,
    viewportLeft,
    tableRight: viewportLeft + tableWidth - scrollLeft,
    labelWidth,
    columnLeft: viewportLeft + labelWidth + column * offerWidth - scrollLeft,
  }
}

for (const viewportWidth of [320, 375, 390, 430, 760]) {
  test(`all offers occupy the visible area beside labels at ${viewportWidth}px`, () => {
    const offerWidth = viewportWidth - 42 - 108
    for (let column = 0; column < 3; column++) {
      for (const current of [-50, 0, offerWidth / 2, 2 * offerWidth, 3 * offerWidth]) {
        const target = comparisonColumnScrollLeft(geometry(viewportWidth, column, current))
        assert.equal(target, column * offerWidth, `column ${column}, current ${current}`)
        const leftAfterScroll = 108 + column * offerWidth - target
        assert.equal(leftAfterScroll, 108, 'selected offer starts after the labels')
        assert.equal(leftAfterScroll + offerWidth, viewportWidth - 42, 'selected offer ends at the scrollport edge')
      }
    }
  })
}

test('Premium never exposes overflow beyond the actual table, even if scrollWidth is inflated', () => {
  // A constrained/older table can end before Premium can be left-aligned.
  // An unrelated overflowing child must not extend that scroll destination.
  assert.equal(comparisonColumnScrollLeft({
    scrollLeft: 100,
    clientWidth: 348,
    scrollWidth: 726,
    viewportLeft: 21,
    tableRight: 21 + 486 - 100,
    labelWidth: 108,
    columnLeft: 21 + 108 + 2 * 126 - 100,
  }), 138)
})

test('fractional table edges cap the target before a rounded scrollWidth would leave a gap', () => {
  const metrics = geometry(390, 2, 60)
  metrics.tableRight -= 0.5
  assert.equal(comparisonColumnScrollLeft(metrics), 479.5)
})

test('a table narrower than its viewport stays at its start', () => {
  assert.equal(comparisonColumnScrollLeft({
    scrollLeft: 0,
    clientWidth: 600,
    scrollWidth: 600,
    viewportLeft: 20,
    tableRight: 520,
    labelWidth: 108,
    columnLeft: 400,
  }), 0)
})
