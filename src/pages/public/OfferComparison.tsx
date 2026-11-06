import { useState, type ReactNode } from 'react'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { publicOffers, type Pricing } from '../../../shared/catalog'
import { MotionLink as Link, canAnimatePlanNavigation } from '../../components/layout/plan-transition'
import { configureHref, startingPrice } from './pricing'

type ComparisonStatus = 'included' | 'absent' | '1 à 3' | 'Jusqu’à 6' | 'À définir' | 'Si pertinent'
type ComparisonRow = { title: string; values: readonly ComparisonStatus[]; hint?: string }
const comparisonRows: readonly ComparisonRow[] = [
  { title: 'Nombre de pages', values: ['1 à 3', 'Jusqu’à 6', 'À définir'] },
  { title: 'Template personnalisé', values: ['absent', 'included', 'absent'], hint: 'Vitrine utilise un template ; Business le personnalise. Premium / 3D repose sur une direction artistique propre au projet.' },
  { title: 'Textes et images modifiables', values: ['absent', 'included', 'included'], hint: 'Compris dans Business et Premium / 3D. Peut être ajouté à Vitrine, sans les autres fonctions du forfait Business.' },
  { title: 'Doctolib ou outil de réservation', values: ['absent', 'included', 'absent'], hint: 'Intégration d’un outil compatible ; son abonnement éventuel reste séparé.' },
  { title: 'Statistiques avec configuration adaptée', values: ['absent', 'included', 'absent'] },
  { title: 'Direction artistique personnalisée', values: ['absent', 'absent', 'included'] },
  { title: 'Animations avancées et interactions', values: ['absent', 'absent', 'included'] },
]
const comparisonDetails: readonly ComparisonRow[] = [
  { title: 'Mobile, tablette et ordinateur', values: ['included', 'included', 'included'] },
  { title: 'Three.js / WebGL', values: ['absent', 'absent', 'Si pertinent'], hint: 'Le recours à la 3D dépend du projet. La création d’un modèle et les éléments supplémentaires sont distincts de l’intégration initiale.' },
  { title: 'Formulaire de contact', values: ['included', 'included', 'included'] },
  { title: 'Formulaire avancé', values: ['absent', 'included', 'absent'] },
  { title: 'Bases du SEO technique', values: ['included', 'included', 'included'] },
  { title: 'Bases du référencement local', values: ['absent', 'included', 'absent'] },
  { title: 'Galerie, tarifs et témoignages', values: ['absent', 'included', 'absent'] },
  { title: 'Optimisation des performances renforcée', values: ['absent', 'absent', 'included'] },
  { title: 'Accompagnement renforcé', values: ['absent', 'absent', 'included'] },
  { title: 'Mise en production', values: ['included', 'included', 'included'] },
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
  return <span className="comparison-status">{status}</span>
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
        aria-label="Comparatif des trois forfaits, défilement horizontal sur petit écran"
      >
        <table id={`${id}-table`} className="comparison-table">
          <caption className="public-sr-only">
            Comparer les fonctions comprises dans les trois forfaits de création de sites internet.
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <span>Fonctions</span>
              </th>
              {publicOffers.map((offer) => (
                <th key={offer.id} scope="col">
                  <div className="comparison-offer">
                    <h3>{offer.title}</h3>
                    <p>{startingPrice(offer.id, pricing)}</p>
                    <Link
                      className={`plan-cta comparison-cta pricing-card--${offer.variant}`}
                      to={configureHref(offer.id)}
                      viewTransition={canAnimatePlanNavigation()}
                      aria-label={`Configurer le forfait ${offer.title}`}
                    >
                      Configurer
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
                  <td key={publicOffers[index].id}>
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
                  <td key={publicOffers[index].id}>
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

