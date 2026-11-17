type SurfaceRect = { x: number; y: number; width: number; height: number }

/** A fixed bitmap canvas: only a uniform scale, translation and crop move.
 * Unlike native width/height interpolation, neither frame resizes its paint. */
export function compactPlanGeometry(from: SurfaceRect, to: SurfaceRect) {
  if (![from, to].every(rect => [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)
    && rect.width > 0 && rect.height > 0)) return null
  const width = Math.max(from.width, to.width)
  const fromScale = from.width / width
  const toScale = to.width / width
  const height = Math.max(from.height / fromScale, to.height / toScale)
  const frame = (rect: SurfaceRect, scale: number) => ({
    transform: `translate(${rect.x}px, ${rect.y}px) scale(${scale})`,
    crop: Math.max(0, height - rect.height / scale),
  })
  return {
    width,
    height,
    from: frame(from, fromScale),
    to: frame(to, toScale),
    top: from.height / from.width > to.height / to.width ? 'old' : 'new',
  }
}
