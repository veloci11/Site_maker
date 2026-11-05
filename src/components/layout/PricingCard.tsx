import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'
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
  prepare = () => import('../../pages/configurator/index'),
}: PricingCardProps) {
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
  const priceLabel = price ?? (custom ? 'Sur devis' : 'À partir de…')
  const actionLabel = cta ?? (custom ? 'Parlons de votre projet' : `Découvrir ${title}`)
  const prepareDestination = () => {
    if (destination.startsWith('/forfaits/')) void prepare().catch(() => {})
  }
  return (
    <Link
      to={destination}
      viewTransition={canAnimatePlanNavigation()}
      className={cn('pricing-card', `pricing-card--${color}`, className)}
      aria-label={`${actionLabel}. ${priceLabel}`}
      onPointerEnter={prepareDestination}
      onFocus={prepareDestination}
    >
      <div className="pricing-card__top">
        <span className="pricing-card__surface" style={surfaceTransition} aria-hidden="true">
          <span className="pricing-card__grain" />
        </span>
        <h3>{title}</h3>
        <p className="pricing-card__price">{priceLabel}</p>
      </div>
      <span className="plan-cta pricing-card__cta" aria-hidden="true">
        {actionLabel}
      </span>
      <ul className="pricing-card__features">
        {features.slice(0, 3).map((feature) => (
          <li key={feature}>
            <Check size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Link>
  )
}
