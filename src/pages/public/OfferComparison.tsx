import { useState, type ReactNode } from 'react'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { publicOffers, type Pricing } from '../../../shared/catalog'
import { MotionLink as Link, canAnimatePlanNavigation } from '../../components/layout/plan-transition'
import { configureHref, startingPrice } from './pricing'

type ComparisonStatus = 'included' | 'absent' | '1 à 3' | '1 à 6' | '1 à 10'
type ComparisonRow = { title: string; values: readonly ComparisonStatus[]; hint: string }
const comparisonSections: readonly { title: string; rows: readonly ComparisonRow[] }[] = [
  {
    title: 'Inclus dès Vitrine',
    rows: [
      { title: 'Nombre de pages', values: ['1 à 3', '1 à 6', '1 à 10'], hint: 'Le nombre de pages prévu pour présenter votre activité, vos services et vos informations pratiques.' },
      { title: 'Mobile, tablette et ordinateur', values: ['included', 'included', 'included'], hint: 'La mise en page, les textes et les interactions s’adaptent à la taille de l’écran du visiteur.' },
      { title: 'Formulaire de contact', values: ['included', 'included', 'included'], hint: 'Vos visiteurs peuvent vous envoyer une demande directement depuis votre site.' },
      { title: 'Bases du référencement technique', values: ['included', 'included', 'included'], hint: 'Des réglages techniques de base pour aider les moteurs de recherche à lire et comprendre vos pages.' },
      { title: 'Mise en ligne', values: ['included', 'included', 'included'], hint: 'Installation et publication du site sur l’hébergement retenu, une fois le projet validé.' },
    ],
  },
  {
    title: 'Inclus dès Business',
    rows: [
      { title: 'CMS pour modifier vos textes et images', values: ['absent', 'included', 'included'], hint: 'Un espace de gestion pour mettre à jour les contenus des pages de votre forfait.' },
      { title: 'Bases du référencement local', values: ['absent', 'included', 'included'], hint: 'Les informations de votre activité et de votre zone géographique sont prises en compte pour les recherches locales.' },
      { title: 'Statistiques de visites', values: ['absent', 'included', 'included'], hint: 'Suivez vos visites et une action utile, comme l’envoi du formulaire, avec Google Analytics 4 ou un outil adapté à votre site.' },
      { title: 'Rubriques réalisations, tarifs et avis clients', values: ['absent', 'included', 'included'], hint: 'Des rubriques dédiées pour montrer votre travail, présenter vos tarifs et donner la parole à vos clients.' },
    ],
  },
  {
    title: 'Les plus de Premium / 3D',
    rows: [
      { title: 'Reprise de vos anciens contenus', values: ['absent', 'absent', 'included'], hint: 'Nous réintégrons jusqu’à 5 pages et 15 médias de votre ancien site. Au-delà, le complément est chiffré sur devis.' },
      { title: 'Animations avancées et interactions', values: ['absent', 'absent', 'included'], hint: 'Des éléments qui s’animent au défilement ou réagissent aux actions du visiteur, selon les besoins de votre présentation.' },
      { title: 'Intégration d’un élément 3D interactif', values: ['absent', 'absent', 'included'], hint: 'Intégration d’un modèle 3D fourni avec des interactions adaptées. La création du modèle et les éléments supplémentaires sont chiffrés séparément.' },
      { title: 'Optimisation des performances renforcée', values: ['absent', 'absent', 'included'], hint: 'Un travail approfondi sur le chargement et la fluidité du site, notamment en présence d’animations ou de 3D.' },
      { title: 'Accompagnement renforcé', values: ['absent', 'absent', 'included'], hint: 'Un suivi plus poussé pour préciser les choix visuels, les fonctions et les ajustements de votre projet.' },
      { title: 'Étude des demandes sur mesure', values: ['absent', 'absent', 'included'], hint: 'Vos besoins spécifiques sont étudiés pour définir les solutions possibles et leur prix avant le démarrage.' },
    ],
  },
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

function ComparisonReveal({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
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
          {comparisonSections.map((section) => (
            <tbody key={section.title} className="comparison-section" aria-label={section.title}>
              {section.rows.map((row, rowIndex) => (
                <tr key={row.title}>
                  <th scope="row">
                    {rowIndex === 0 ? <span className="comparison-section-label">{section.title}</span> : null}
                    {row.title}
                    <ComparisonReveal collapsed={!details}>
                      <span className="comparison-row-hint">{row.hint}</span>
                    </ComparisonReveal>
                  </th>
                  {row.values.map((value, index) => (
                    <td key={publicOffers[index].id}>
                      <ComparisonCell status={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className="comparison-mobile-hint">
        Faites défiler pour comparer les forfaits <ArrowRight size={14} aria-hidden="true" />
      </p>
      <button
        type="button"
        className="comparison-details-toggle"
        aria-expanded={details}
        aria-controls={`${id}-table`}
        onClick={() => setDetails((open) => !open)}
      >
        {details ? 'Masquer les détails' : 'Afficher plus de détails'}
        <ChevronDown size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

