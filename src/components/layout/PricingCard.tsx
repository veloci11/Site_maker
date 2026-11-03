import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

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
  /** Accepted for existing callers. Navigation never waits for preparation. */
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
  const priceLabel = price ?? (custom ? 'Sur devis' : 'À partir de…')
  const actionLabel = cta ?? (custom ? 'Parlons de votre projet' : `Découvrir ${title}`)
  return (
    <Link
      to={destination}
      className={cn('pricing-card', `pricing-card--${color}`, className)}
      aria-label={`${actionLabel}. ${priceLabel}`}
    >
      <div className="pricing-card__top">
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
