import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { offers, type OfferId } from '../../../shared/catalog'
import { existingSiteOffers } from '../../content/existing-site'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import './project.css'
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
  const variant = 'variant' in plan ? plan.variant : plan.id
  const href = 'slug' in plan ? `/forfaits/${plan.slug}` : plan.href
  const surfaceTransition = usePlanTransition(variant, href)
  const contentTransition = usePlanTransition(variant, href, 'content')
  const cardRef = useRef<HTMLDivElement>(null)
  const [tall, setTall] = useState(false)

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return
    // A visible selection can grow beyond the viewport; let the whole card scroll.
    const update = () => setTall(card.getBoundingClientRect().height > window.innerHeight - 136)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(card)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div ref={cardRef} className={`selected-plan pricing-card--${variant}`} data-tall={tall || undefined}>
      <span className="selected-plan__surface" style={surfaceTransition} aria-hidden="true" />
      <div className="selected-plan__content" style={contentTransition}>
        <div className="selected-plan__heading">
          <span className="selected-plan__eyebrow">Votre forfait</span>
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
              {offers.map((item) => {
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
              <DropdownMenuSeparator />
              {existingSiteOffers.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  className={`public-offer-link pricing-card--${item.id}`}
                >
                  <Link to={item.href} viewTransition={canAnimatePlanNavigation()} aria-current={item.id === plan.id ? 'page' : undefined}>
                    {item.title}
                    {item.id === plan.id ? <Check size={16} aria-hidden="true" /> : null}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h1>{plan.title}</h1>
        <p className="selected-plan__description">{plan.description}</p>
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
  )
}
