import { useEffect, useRef } from 'react'

const TILE_SIZE = 256
const MAX_PIXELS = 4_000_000

/** Fine, stationary grain. Each sample occupies a physical display pixel. */
export function PlanGrain() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const surface = canvas.current
    const card = surface?.parentElement
    if (!surface || !card) return

    const started = performance.now()
    const tile = document.createElement('canvas')
    tile.width = tile.height = TILE_SIZE
    const tileContext = tile.getContext('2d')
    if (!tileContext) return
    const pixels = tileContext.createImageData(TILE_SIZE, TILE_SIZE)
    let seed = 0x52a17f09
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed ^= seed << 13
      seed ^= seed >>> 17
      seed ^= seed << 5
      // A bell-shaped distribution avoids harsh black-and-white speckles.
      const gray = 128 + (((seed & 255) + ((seed >>> 8) & 255) + ((seed >>> 16) & 255)) - 382.5) * .32
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = gray
      pixels.data[i + 3] = 255
    }
    tileContext.putImageData(pixels, 0, 0)

    let previousSize = ''
    let resizeTimer: number | undefined
    let densityQuery: MediaQueryList | undefined
    const paint = () => {
      const bounds = card.getBoundingClientRect()
      if (bounds.width < 1 || bounds.height < 1) return
      const density = Math.min(window.devicePixelRatio || 1, 3, Math.sqrt(MAX_PIXELS / (bounds.width * bounds.height)))
      const width = Math.ceil(bounds.width * density)
      const height = Math.ceil(bounds.height * density)
      const size = `${width}:${height}`
      if (size === previousSize) return
      surface.width = width
      surface.height = height
      const context = surface.getContext('2d')
      const pattern = context?.createPattern(tile, 'repeat')
      if (!context || !pattern) return
      // Do not scale the context or tile: the grain stays at native pixel size.
      context.fillStyle = pattern
      context.fillRect(0, 0, width, height)
      previousSize = size
    }
    const resize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(paint, 100)
    }
    const densityChanged = () => {
      densityQuery?.removeEventListener('change', densityChanged)
      densityQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`)
      densityQuery.addEventListener('change', densityChanged)
      paint()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(card)
    window.addEventListener('resize', resize, { passive: true })
    densityChanged()
    performance.clearMeasures('studio:plan-grain-init')
    performance.measure('studio:plan-grain-init', { start: started, end: performance.now() })

    return () => {
      window.clearTimeout(resizeTimer)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      densityQuery?.removeEventListener('change', densityChanged)
    }
  }, [])

  return <canvas ref={canvas} className="selected-plan__grain" aria-hidden="true" />
}
