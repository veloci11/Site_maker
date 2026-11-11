import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { offers, publicOffers, type OfferId } from '../../../shared/catalog'
import { existingSiteOffers } from '../../content/existing-site'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import './project.css'
import { PlanTexture } from './PlanTexture'
import { MotionLink as Link, canAnimatePlanNavigation, usePlanTransition } from './plan-transition'

type Plan = (typeof offers)[number] | (typeof existingSiteOffers)[number]

type SelectedPlanCardProps = {
  plan: Plan
  children: ReactNode
  disabled?: boolean
  onOfferChange?: (offerId: OfferId) => void
}

export function SelectedPlanCard({
  plan,
  children,
  disabled = false,
  onOfferChange,
}: SelectedPlanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const variant = 'variant' in plan ? plan.variant : plan.id
  const href = 'slug' in plan ? `/forfaits/${plan.slug}` : plan.href
  const surfaceTransition = usePlanTransition(variant, href)
  const contentTransition = usePlanTransition(variant, href, 'content')
  const headingTransition = usePlanTransition(variant, href, 'heading')

  useLayoutEffect(() => {
    const card = cardRef.current
    const column = card?.closest<HTMLElement>('.configurator-card-column')
    if (!card || !column) return
    // A tall card follows the page until its bottom fits the viewport. Keep
    // every option accessible without creating a second scrolling region.
    const measure = () => column.style.setProperty('--selected-plan-height', `${Math.ceil(card.getBoundingClientRect().height)}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(card)
    return () => {
      observer.disconnect()
      column.style.removeProperty('--selected-plan-height')
    }
  }, [])

  return (
    <div ref={cardRef} className={`selected-plan pricing-card--${variant}`}>
      <span className="selected-plan__surface" style={surfaceTransition} aria-hidden="true">
        <PlanTexture extend={'slug' in plan} />
      </span>
      <div className="selected-plan__content" role="region" aria-label="Détails du forfait et options choisies">
        <div className="selected-plan__heading-frame">
          <div className="selected-plan__heading" style={headingTransition}>
            <span className="selected-plan__eyebrow">Votre forfait</span>
            {/* The native visual is decorative. Its live trigger stays outside
                the captured subtree so an early click still reaches Radix. */}
            <span className="selected-plan__change selected-plan__change-visual" aria-hidden="true">
              Changer <ChevronDown size={14} aria-hidden="true" />
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="selected-plan__change" disabled={disabled}>
                Changer <ChevronDown size={14} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="public-offers-menu selected-plan-menu"
              aria-label="Changer de forfait"
            >
              {publicOffers.map((item) => {
                const className = `public-offer-link pricing-card--${item.variant}`
                const current = item.id === plan.id ? 'page' : undefined
                const label = (
                  <>
                    {item.title}
                    {current ? <Check size={16} aria-hidden="true" /> : null}
                  </>
                )

                return onOfferChange ? (
                  <DropdownMenuItem
                    key={item.id}
                    className={className}
                    aria-current={current}
                    onSelect={() => onOfferChange(item.id)}
                  >
                    {label}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem key={item.id} asChild className={className}>
                    <Link to={`/forfaits/${item.slug}`} viewTransition={canAnimatePlanNavigation()} aria-current={current}>
                      {label}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="selected-plan__copy" style={contentTransition}>
          <h1>{plan.title}</h1>
          <ul className="selected-plan__features">
            {plan.features.map((feature) => (
              <li key={feature}>
                <Check size={19} strokeWidth={1.6} aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="selected-plan__bottom">{children}</div>
        </div>
      </div>
    </div>
  )
}
