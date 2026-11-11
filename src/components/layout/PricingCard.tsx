import { useLayoutEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { preloadPlanImages } from '../../lib/plan-images'
import { PlanTexture } from './PlanTexture'
import { MotionLink as Link, canAnimatePlanNavigation, usePlanTransition } from './plan-transition'

export interface PricingCardProps {
  slug: string
  title: string
  /** Detail-page copy only. Deliberately not rendered in pricing cards. */
  description?: string
  price?: string | null
  features: readonly string[]
  href?: string
  cta?: string
  variant?: 'vitrine' | 'connecte' | 'immersif' | 'custom' | 'evolution' | 'refonte'
  className?: string
  featured?: boolean
  /** Preload on pointer/focus intent. Clicking never waits for preparation. */
  prepare?: () => Promise<unknown>
}

export function PricingCard({
  slug,
  title,
  price,
  features,
  href,
  cta,
  variant,
  className,
  featured = false,
  prepare = () => import('../../pages/configurator/index'),
}: PricingCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLSpanElement>(null)
  const color =
    variant ??
    (slug === 'sur-mesure'
      ? 'custom'
      : slug.startsWith('immersif')
        ? 'immersif'
        : slug === 'connecte'
          ? 'connecte'
          : 'vitrine')
  const custom = color === 'custom'
  const publicSlug = slug === 'immersif' ? 'immersif-3d' : slug
  const destination = href ?? `/forfaits/${publicSlug}`
  const surfaceTransition = usePlanTransition(color, destination)
  const thumbnailTransition = usePlanTransition(color, destination, 'thumbnail')
  const priceLabel = price ?? (custom ? 'Sur devis' : 'À partir de…')
  const actionLabel = cta ?? (custom ? 'Parlons de votre projet' : `Découvrir ${title}`)
  useLayoutEffect(() => {
    const card = cardRef.current
    const top = topRef.current
    const cta = ctaRef.current
    if (!card || !top || !cta) return
    // The title and CTA are two clipped windows onto one complete image.
    // Size its canvas through the CTA so every crop, including mirrored
    // variants, stays covered beyond the intervening white gap.
    const measure = () => {
      const topRect = top.getBoundingClientRect()
      const ctaRect = cta.getBoundingClientRect()
      const offset = ctaRect.top - topRect.top
      const height = offset + ctaRect.height
      const properties = {
        '--card-canvas-height': `${height}px`,
        '--card-cta-offset': `${offset}px`,
      }
      for (const [property, value] of Object.entries(properties))
        if (card.style.getPropertyValue(property) !== value) card.style.setProperty(property, value)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(top)
    observer.observe(cta)
    return () => observer.disconnect()
  }, [color])
  const prepareDestination = () => {
    preloadPlanImages(color)
    if (destination.startsWith('/forfaits/')) void prepare().catch(() => {})
  }
  return (
    <Link
      ref={cardRef}
      to={destination}
      viewTransition={canAnimatePlanNavigation()}
      className={cn('pricing-card', `pricing-card--${color}`, className)}
      aria-label={`${actionLabel}${actionLabel === 'Configurer' ? ` ${title}` : ''}. ${priceLabel}`}
      onPointerEnter={prepareDestination}
      onFocus={prepareDestination}
    >
      <div ref={topRef} className="pricing-card__top" style={thumbnailTransition}>
        <span className="pricing-card__surface" style={surfaceTransition} aria-hidden="true">
          <PlanTexture preview className="pricing-card__texture" />
          <span className="pricing-card__grain" />
        </span>
        {featured ? <span className="pricing-card__featured">Populaire</span> : null}
        <h3>{title}</h3>
        <p className="pricing-card__price">{priceLabel}</p>
      </div>
      <span ref={ctaRef} className="plan-cta pricing-card__cta" aria-hidden="true">
        <PlanTexture preview className="pricing-card__texture" />
        {actionLabel}
      </span>
      <ul className="pricing-card__features">
        {features.map((feature) => (
          <li key={feature}>
            <Check size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Link>
  )
}
