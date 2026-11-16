import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { publicOffers, publicPageCounts, type Pricing } from '../../../shared/catalog'
import { MotionLink as Link, canAnimatePlanNavigation, usePlanTransition } from '../../components/layout/plan-transition'
import { configureHref, startingPrice } from './pricing'
import { preloadPlanImages } from '../../lib/plan-images'
import { replaceComparisonOffer, type ComparisonOfferPair } from '../../lib/comparison-pair'
import { PlanTexture } from '../../components/layout/PlanTexture'

type ComparisonStatus = 'included' | 'absent' | (typeof publicPageCounts)[keyof typeof publicPageCounts]
type ComparisonRow = { title: string; values: readonly ComparisonStatus[]; hint: string }
const comparisonSections: readonly { title: string; rows: readonly ComparisonRow[] }[] = [
  {
    title: 'Inclus dès Vitrine',
    rows: [
      { title: 'Nombre de pages', values: publicOffers.map((offer) => publicPageCounts[offer.id]), hint: 'Pour Premium / 3D, le nombre de pages est défini selon les contenus, les animations et la 3D du projet.' },
      { title: 'Mobile, tablette et ordinateur', values: ['included', 'included', 'included'], hint: 'La mise en page, les textes et les interactions s’adaptent à la taille de l’écran du visiteur.' },
      { title: 'Formulaire de contact', values: ['included', 'included', 'included'], hint: 'Vos visiteurs peuvent vous envoyer une demande directement depuis votre site.' },
      { title: 'Bases du référencement technique', values: ['included', 'included', 'included'], hint: 'Des réglages techniques de base pour aider les moteurs de recherche à lire et comprendre vos pages.' },
      { title: 'Mise en ligne', values: ['included', 'included', 'included'], hint: 'Installation et publication du site sur l’hébergement retenu, une fois le projet validé.' },
    ],
  },
  {
    title: 'Inclus dès Business',
    rows: [
      { title: 'CMS pour gérer vos textes et images', values: ['absent', 'included', 'included'], hint: 'Un espace de gestion pour mettre à jour les contenus des pages de votre forfait.' },
      { title: 'Mise en place d’une adresse e-mail professionnelle', values: ['absent', 'included', 'included'], hint: 'Une boîte e-mail sur votre domaine, reliée au formulaire de votre site. L’abonnement éventuel à la messagerie reste séparé.' },
      { title: 'Bases du référencement local', values: ['absent', 'included', 'included'], hint: 'Les informations de votre activité et de votre zone géographique sont prises en compte pour les recherches locales.' },
      { title: 'Statistiques de visites', values: ['absent', 'included', 'included'], hint: 'Suivez vos visites et une action utile, comme l’envoi du formulaire, avec Google Analytics 4 ou un outil adapté à votre site.' },
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

function ComparisonConfigureButton({ offer, price }: { offer: (typeof publicOffers)[number]; price: string }) {
  const href = configureHref(offer.id)
  const surface = usePlanTransition(offer.variant, href, 'surface', 'comparison')
  const label = usePlanTransition(offer.variant, href, 'thumbnail', 'comparison')
  const prepare = () => {
    preloadPlanImages(offer.variant)
    void import('../configurator/index').catch(() => {})
  }
  return (
    <Link
      className={`plan-cta comparison-cta pricing-card--${offer.variant}`}
      to={href}
      viewTransition={canAnimatePlanNavigation()}
      aria-label={`Configurer le forfait ${offer.title}, ${price}`}
      onPointerEnter={prepare}
      onFocus={(event) => {
        prepare()
        const link = event.currentTarget
        if (!link.matches(':focus-visible')) return
        link.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
      }}
    >
      <span className="comparison-cta__surface" style={surface} aria-hidden="true">
        <PlanTexture preview extend={false} className="comparison-cta__texture" />
      </span>
      <span className="comparison-cta__label" style={label}>Configurer</span>
    </Link>
  )
}

export function OfferComparison({ pricing, id }: { pricing: Pricing; id: string }) {
  const [details, setDetails] = useState(false)
  const [mobilePair, setMobilePair] = useState<ComparisonOfferPair>([publicOffers[0].id, publicOffers[1].id])
  const scrollRef = useRef<HTMLDivElement>(null)
  const mobileOffers = mobilePair.map((offerId) => publicOffers.find((offer) => offer.id === offerId)!)

  useLayoutEffect(() => {
    const scroller = scrollRef.current
    const navigation = document.querySelector('.public-header-wrap')
    const table = scroller?.querySelector('table')
    const heading = scroller?.querySelector('thead')
    if (!scroller || !navigation || !table || !heading) return
    const sections = Array.from(scroller.querySelectorAll('tbody'))
    const desktop = window.matchMedia('(width > 760px)')
    const nativeClipping = CSS.supports('animation-timeline: view(block 1px 0px)') && CSS.supports('animation-range: exit-crossing')
    let headingHeight = -1
    let tableHeight = -1
    let headingClip = ''

    const clipAtHeader = () => {
      // The phone comparison has its own native scrollport. Its page scroll
      // must not trigger desktop geometry reads or clipping writes.
      if (!desktop.matches) return
      const headingBounds = heading.getBoundingClientRect()
      const tableBounds = table.getBoundingClientRect()
      if (headingHeight !== headingBounds.height) {
        headingHeight = headingBounds.height
        scroller.style.setProperty('--comparison-heading-height', `${headingHeight}px`)
      }
      if (tableHeight !== tableBounds.height) {
        tableHeight = tableBounds.height
        scroller.style.setProperty('--comparison-table-height', `${tableHeight}px`)
      }
      if (nativeClipping) return

      const navigationBottom = navigation.getBoundingClientRect().bottom
      const overlap = Math.max(0, navigationBottom + headingHeight - tableBounds.bottom)
      const nextClip = overlap > 0 ? `inset(${overlap}px -1px -1px)` : 'none'
      if (headingClip !== nextClip) {
        headingClip = nextClip
        heading.style.setProperty('--comparison-heading-clip', headingClip)
      }
      const sectionClips = sections.map((section) =>
        Math.max(0, Math.ceil(headingBounds.bottom - section.getBoundingClientRect().top)))
      sections.forEach((section, index) => section.style.setProperty('--comparison-rows-clip-top', `${sectionClips[index]}px`))
    }

    const updateViewport = () => {
      window.removeEventListener('scroll', clipAtHeader)
      window.removeEventListener('animationend', clipAtHeader)
      if (!nativeClipping && desktop.matches) {
        window.addEventListener('scroll', clipAtHeader, { passive: true })
        window.addEventListener('animationend', clipAtHeader)
      }
      clipAtHeader()
    }

    updateViewport()
    const observer = new ResizeObserver(clipAtHeader)
    observer.observe(scroller)
    observer.observe(table)
    observer.observe(navigation)
    observer.observe(heading)
    window.addEventListener('resize', clipAtHeader)
    desktop.addEventListener('change', updateViewport)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', clipAtHeader)
      window.removeEventListener('resize', clipAtHeader)
      window.removeEventListener('animationend', clipAtHeader)
      desktop.removeEventListener('change', updateViewport)
      scroller.style.removeProperty('--comparison-heading-height')
      scroller.style.removeProperty('--comparison-table-height')
      heading.style.removeProperty('--comparison-heading-clip')
      sections.forEach((section) => section.style.removeProperty('--comparison-rows-clip-top'))
    }
  }, [])

  return (
    <div className="offer-comparison" data-details-open={details}>
      <div
        ref={scrollRef}
        className="comparison-scroll"
        tabIndex={0}
        role="region"
        aria-label="Comparatif des trois forfaits"
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
                    <ComparisonConfigureButton offer={offer} price={startingPrice(offer.id, pricing)} />
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
      <div className="comparison-mobile">
        <p id={`${id}-mobile-instruction`} className="comparison-mobile__instruction">
          Comparez deux forfaits côte à côte. Changez l’un des forfaits pour voir le troisième.
        </p>
        <div
          className="comparison-mobile__scroll"
          tabIndex={0}
          role="region"
          aria-label="Comparatif de deux forfaits au choix"
          aria-describedby={`${id}-mobile-instruction`}
        >
          <table id={`${id}-mobile-table`} className="comparison-mobile__table">
            <caption className="public-sr-only">
              Comparer les fonctions comprises dans deux forfaits de création de sites internet.
            </caption>
            <thead>
              <tr>
                {mobileOffers.map((offer, position) => (
                  <th key={position} id={`${id}-mobile-offer-${position}`} scope="col">
                    <div className="comparison-mobile__offer">
                      <label className="comparison-mobile__selector">
                        <span className="public-sr-only">
                          {position === 0 ? 'Premier forfait à comparer' : 'Deuxième forfait à comparer'}
                        </span>
                        <select
                          value={offer.id}
                          aria-label={position === 0 ? 'Premier forfait à comparer' : 'Deuxième forfait à comparer'}
                          aria-controls={`${id}-mobile-table`}
                          onChange={(event) => {
                            const offerId = publicOffers.find((candidate) => candidate.id === event.currentTarget.value)!.id
                            setMobilePair((pair) => replaceComparisonOffer(pair, position as 0 | 1, offerId))
                          }}
                        >
                          {publicOffers.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>{candidate.title}</option>
                          ))}
                        </select>
                        <span className="comparison-mobile__selected" aria-hidden="true">
                          <span>{offer.title}</span>
                          <ChevronDown size={16} />
                        </span>
                      </label>
                      <p>{startingPrice(offer.id, pricing)}</p>
                      <ComparisonConfigureButton offer={offer} price={startingPrice(offer.id, pricing)} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {comparisonSections.flatMap((section, sectionIndex) => section.rows.map((row, rowIndex) => {
              const featureId = `${id}-mobile-feature-${sectionIndex}-${rowIndex}`
              return (
                <tbody key={row.title} aria-labelledby={featureId}>
                  <tr className="comparison-mobile__feature">
                    <th id={featureId} colSpan={2} scope="rowgroup">
                      {rowIndex === 0 ? <span className="comparison-section-label">{section.title}</span> : null}
                      {row.title}
                      <ComparisonReveal collapsed={!details}>
                        <span className="comparison-row-hint">{row.hint}</span>
                      </ComparisonReveal>
                    </th>
                  </tr>
                  <tr className="comparison-mobile__values">
                    {mobileOffers.map((offer, position) => (
                      <td key={position} headers={`${featureId} ${id}-mobile-offer-${position}`}>
                        <ComparisonCell status={row.values[publicOffers.indexOf(offer)]} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              )
            }))}
          </table>
        </div>
      </div>
      <button
        type="button"
        className="comparison-details-toggle"
        aria-expanded={details}
        aria-controls={`${id}-table ${id}-mobile-table`}
        onClick={() => setDetails((open) => !open)}
      >
        {details ? 'Masquer les détails' : 'Afficher plus de détails'}
        <ChevronDown size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

