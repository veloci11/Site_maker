import { preload } from 'react-dom'

/** Warm only the selected plan's images on intent; navigation never awaits them. */
export function preloadPlanImages(variant: string) {
  if (typeof window === 'undefined') return
  const continuation = variant === 'custom' || variant === 'immersif' ? '-top' : ''
  preload('/assets/textures/grain-plasma-master.webp', {
    as: 'image', type: 'image/webp', fetchPriority: 'high',
  })
  if (variant !== 'evolution' && variant !== 'refonte') {
    preload(`/assets/textures/grain-plasma-vitrine-continuation${continuation}.webp`, {
      as: 'image', type: 'image/webp', fetchPriority: 'low',
    })
  }
}
