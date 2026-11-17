import test from 'node:test'
import assert from 'node:assert/strict'
import { compactPlanGeometry } from '../src/lib/compact-plan-geometry.ts'

const thumbnail = { x: 29, y: 310.5, width: 372, height: 188 }
const selected = { x: 20, y: 192, width: 390, height: 542 }

function assertFrame(canvas, frame, rect) {
  const match = /^translate\(([-.\d]+)px, ([-.\d]+)px\) scale\(([-.\d]+)\)$/.exec(frame.transform)
  assert.ok(match)
  const [, x, y, scale] = match.map(Number)
  assert.equal(x, rect.x)
  assert.equal(y, rect.y)
  assert.ok(Math.abs(canvas.width * scale - rect.width) < .00001)
  assert.ok(Math.abs((canvas.height - frame.crop) * scale - rect.height) < .00001)
  assert.ok(frame.crop >= 0 && frame.crop < canvas.height)
}

test('phone opening and closing crop the same fixed canvas to both exact rectangles', () => {
  const open = compactPlanGeometry(thumbnail, selected)
  const close = compactPlanGeometry(selected, thumbnail)
  assert.ok(open && close)
  assert.equal(open.width, close.width)
  assert.equal(open.height, close.height)
  assert.deepEqual(open.from, close.to)
  assert.deepEqual(open.to, close.from)
  assertFrame(open, open.from, thumbnail)
  assertFrame(open, open.to, selected)
  assert.equal(open.top, 'new')
  assert.equal(close.top, 'old')
})

test('a short comparison button shares an opaque full-height texture without stretching its axes', () => {
  const button = { x: 220, y: 210, width: 82, height: 44 }
  const canvas = compactPlanGeometry(button, selected)
  assert.ok(canvas)
  assertFrame(canvas, canvas.from, button)
  assertFrame(canvas, canvas.to, selected)
  assert.equal(canvas.top, 'new')
})

test('negative scroll coordinates and tall selected cards retain their crop and position', () => {
  const tall = { x: 20, y: -430, width: 390, height: 1600 }
  const canvas = compactPlanGeometry(tall, thumbnail)
  assert.ok(canvas)
  assertFrame(canvas, canvas.from, tall)
  assertFrame(canvas, canvas.to, thumbnail)
  assert.equal(canvas.top, 'old')
})

test('zero, missing and infinite geometry fail closed instead of producing an invalid animation', () => {
  for (const patch of [{ width: 0 }, { height: -1 }, { x: NaN }, { y: Infinity }, { width: Infinity }]) {
    assert.equal(compactPlanGeometry({ ...thumbnail, ...patch }, selected), null)
    assert.equal(compactPlanGeometry(selected, { ...thumbnail, ...patch }), null)
  }
})
