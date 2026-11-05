import { preload } from 'react-dom'

/** Warm only the selected plan's images on intent; navigation never awaits them. */
export function preloadPlanImages(variant: string) {
  if (typeof window === 'undefined') return
  const highDensity = window.devicePixelRatio > 1
  const original = highDensity ? 'master' : 'card'
  const continuation = variant === 'custom' ? '-top' : ''
  const density = highDensity ? '' : '-1x'
  preload(`/assets/textures/grain-plasma-${original}.webp`, {
    as: 'image', type: 'image/webp', fetchPriority: 'high',
  })
  if (variant !== 'evolution' && variant !== 'refonte') {
    preload(`/assets/textures/grain-plasma-vitrine-continuation${continuation}${density}.webp`, {
      as: 'image', type: 'image/webp', fetchPriority: 'low',
    })
  }
}
