import { useState, type ReactNode } from 'react'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { offers, type Pricing } from '../../../shared/catalog'
import { MotionLink as Link, canAnimatePlanNavigation } from '../../components/layout/plan-transition'
import { configureHref, startingPrice } from './pricing'

type ComparisonStatus = 'included' | 'absent' | 'custom'
type ComparisonRow = { title: string; values: readonly ComparisonStatus[]; hint?: string }
const comparisonRows: readonly ComparisonRow[] = [
  { title: 'Présentation sur ordinateur', values: ['included', 'included', 'included', 'custom'] },
  { title: 'Adaptation mobile', values: ['absent', 'included', 'included', 'custom'] },
  {
    title: 'Comptes utilisateurs',
    values: ['absent', 'included', 'absent', 'custom'],
    hint: 'Des visiteurs peuvent se connecter à leur espace sur votre site.',
  },
  {
    title: 'Textes et images modifiables',
    values: ['absent', 'included', 'absent', 'custom'],
    hint: 'Modifiez les textes et les images du site livré.',
  },
  { title: 'Élément 3D interactif', values: ['absent', 'absent', 'included', 'custom'] },
]
const comparisonDetails: readonly ComparisonRow[] = [
  {
    title: 'Design adapté à votre activité',
    values: ['included', 'included', 'included', 'custom'],
  },
  { title: 'Formulaire de contact', values: ['included', 'included', 'included', 'custom'] },
  { title: 'Site en français', values: ['included', 'included', 'included', 'custom'] },
  { title: 'Français + anglais', values: ['absent', 'absent', 'absent', 'custom'] },
  { title: 'Mise en ligne par nos soins', values: ['absent', 'absent', 'absent', 'custom'] },
  { title: 'Maintenance mensuelle', values: ['absent', 'absent', 'absent', 'custom'] },
  { title: 'Fonctions et intégrations dédiées', values: ['absent', 'absent', 'absent', 'custom'] },
]

function ComparisonCell({ status }: { status: ComparisonStatus }) {
  if (status === 'included')
    return (
      <span className="comparison-included">
        <Check size={19} strokeWidth={1.8} aria-hidden="true" />
        <span className="public-sr-only">Compris dans le forfait</span>
      </span>
    )
  if (status === 'absent')
    return (
      <span className="comparison-absent">
        <span aria-hidden="true">—</span>
        <span className="public-sr-only">Non compris dans le forfait</span>
      </span>
    )
  return <span className="comparison-status">Selon besoin</span>
}

function ComparisonReveal({ children, collapsed }: { children: ReactNode; collapsed?: boolean }) {
  return (
    <div className="comparison-detail-reveal" aria-hidden={collapsed}>
      <div className="comparison-detail-reveal__inner">{children}</div>
    </div>
  )
}

export function OfferComparison({ pricing, id }: { pricing: Pricing; id: string }) {
  const [details, setDetails] = useState(false)
  return (
    <div className="offer-comparison" data-details-open={details}>
      <div
        className="table-scroll comparison-scroll"
        tabIndex={0}
        role="region"
        aria-label="Comparatif des quatre forfaits, défilement horizontal sur petit écran"
      >
        <table id={`${id}-table`} className="comparison-table">
          <caption className="public-sr-only">
            Comparer les fonctions comprises dans les quatre forfaits de création de sites internet.
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <span>Fonctions</span>
              </th>
              {offers.map((offer) => (
                <th key={offer.id} scope="col">
                  <div className="comparison-offer">
                    <h3>{offer.title}</h3>
                    <p>{startingPrice(offer.id, pricing)}</p>
                    <Link
                      className={`plan-cta comparison-cta pricing-card--${offer.variant}`}
                      to={configureHref(offer.id)}
                      viewTransition={canAnimatePlanNavigation()}
                      aria-label={
                        offer.id === 'sur-mesure'
                          ? 'Parler du projet sur mesure'
                          : `Configurer le forfait ${offer.title}`
                      }
                    >
                      {offer.id === 'sur-mesure' ? 'Parlons-en' : 'Configurer'}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.title}>
                <th scope="row">
                  {row.title}
                  {row.hint ? (
                    <ComparisonReveal collapsed={!details}>
                      <span className="comparison-row-hint">{row.hint}</span>
                    </ComparisonReveal>
                  ) : null}
                </th>
                {row.values.map((value, index) => (
                  <td key={offers[index].id}>
                    <ComparisonCell status={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tbody id={`${id}-details`} className="comparison-detail-rows" aria-hidden={!details}>
            {comparisonDetails.map((row) => (
              <tr key={row.title}>
                <th scope="row">
                  <ComparisonReveal>
                    <div className="comparison-detail-cell">
                      {row.title}
                      {row.hint ? <span className="comparison-row-hint">{row.hint}</span> : null}
                    </div>
                  </ComparisonReveal>
                </th>
                {row.values.map((value, index) => (
                  <td key={offers[index].id}>
                    <ComparisonReveal>
                      <div className="comparison-detail-cell">
                        <ComparisonCell status={value} />
                      </div>
                    </ComparisonReveal>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="comparison-mobile-hint">
        Faites défiler pour comparer les forfaits <ArrowRight size={14} aria-hidden="true" />
      </p>
      <button
        type="button"
        className="comparison-details-toggle"
        aria-expanded={details}
        aria-controls={`${id}-details`}
        onClick={() => setDetails((open) => !open)}
      >
        {details ? 'Masquer les détails' : 'Afficher plus de détails'}
        <ChevronDown size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

