import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight } from 'lucide-react'
import {
  offers,
  getOffer,
  examples,
  faqs,
  optionDefinitions,
  optionGroups,
  defaultPricing,
  formatMoney,
  normalizeConfiguration,
  isOptionIncluded,
  type OfferId,
  type Pricing,
} from '../../../shared/catalog'
import { PricingCard } from '../../components/layout/PricingCard'
import { SelectedPlanCard } from '../../components/layout/SelectedPlanCard'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Reveal } from '../../components/layout/motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'
import { existingSiteOffers, getExistingSiteOffer } from '../../content/existing-site'
import { api, errorMessage } from '../../lib/api'
import '../public.css'

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · studio`
  }, [title])
}

function usePricing() {
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)
  useEffect(() => {
    const controller = new AbortController()
    api<{ pricing?: Pricing }>('/api/catalogue', { signal: controller.signal })
      .then((data) => {
        if (data.pricing?.base && data.pricing?.options) setPricing(data.pricing)
      })
      .catch(() => {
        /* The unpriced catalogue remains a valid pre-launch state. */
      })
    return () => controller.abort()
  }, [])
  return pricing
}

function startingPrice(offerId: OfferId, pricing: Pricing) {
  if (offerId === 'sur-mesure') return 'Sur devis'
  const amount = pricing.base[offerId]
  return amount == null ? 'À partir de…' : `À partir de ${formatMoney(amount, pricing.currency)}`
}

const configureHref = (offerId: OfferId) => `/forfaits/${getOffer(offerId)!.slug}`

function ExistingSiteServices() {
  return (
    <section className="container existing-site-offers" aria-label="Pour votre site actuel">
      <div className="pricing-grid pricing-grid--existing">
        {existingSiteOffers.map((service) => (
          <PricingCard
            key={service.id}
            slug={service.id}
            title={service.title}
            price="Sur devis"
            features={service.features}
            href={service.href}
            variant={service.id}
            cta={service.cta}
          />
        ))}
      </div>
    </section>
  )
}

function Intro({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string
  description?: string
  eyebrow?: string
  action?: ReactNode
}) {
  return (
    <section className={`container page-intro public-intro${action ? ' public-intro--split' : ''}`}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-heading">{title}</h1>
        {description ? <p className="page-subtitle">{description}</p> : null}
      </div>
      {action ? <div className="public-intro__action">{action}</div> : null}
    </section>
  )
}

function Breadcrumb({ children }: { children: ReactNode }) {
  return (
    <nav className="public-breadcrumb" aria-label="Fil d’Ariane">
      <Link to="/forfaits">Forfaits</Link>
      <ChevronRight size={15} aria-hidden="true" />
      <span aria-current="page">{children}</span>
    </nav>
  )
}

function FaqList({
  items,
  prefix = 'faq',
}: {
  items: readonly { question: string; answer: string }[]
  prefix?: string
}) {
  return (
    <Accordion type="single" collapsible className="public-faq-list">
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`${prefix}-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function HomePage() {
  usePageTitle('Création de sites internet clé en main')
  const pricing = usePricing()
  const { hash } = useLocation()
  useEffect(() => {
    if (hash)
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [hash])
  const homeFaqs = faqs.slice(0, 3)
  return (
    <>
      <section className="container home-hero" aria-labelledby="home-title">
        <Reveal className="home-hero__copy">
          <h1 id="home-title">
            Votre site internet.
            <br />
            Clé en main.
          </h1>
          <p className="home-hero__description">
            Un site réalisé pour vous : présenter votre activité, proposer un espace utilisateur ou
            faire découvrir votre univers en 3D.
          </p>
          <div className="home-hero__actions">
            <Button asChild size="lg">
              <a href="#forfaits">
                Choisir mon forfait <ArrowRight size={18} aria-hidden="true" />
              </a>
            </Button>
            <a className="text-link" href="#fonctionnement">
              Comment ça se passe
            </a>
          </div>
        </Reveal>
      </section>
      <section className="container home-offers" id="forfaits" aria-labelledby="home-offers-title">
        <Reveal className="home-section-heading">
          <h2 id="home-offers-title">Choisissez votre forfait.</h2>
          <a className="text-link" href="#comparer">
            Comparer les forfaits <ArrowRight size={17} aria-hidden="true" />
          </a>
        </Reveal>
        <div className="pricing-grid">
          {offers.map((offer, index) => (
            <Reveal key={offer.id} delay={index * 65}>
              <PricingCard
                slug={offer.slug}
                title={offer.title}
                price={startingPrice(offer.id, pricing)}
                features={offer.features}
                href={configureHref(offer.id)}
                variant={offer.variant}
                cta={
                  offer.id === 'sur-mesure'
                    ? 'Parlons de votre projet'
                    : `Configurer ${offer.title}`
                }
              />
            </Reveal>
          ))}
        </div>
      </section>
      <ExistingSiteServices />
      <section
        className="container home-method"
        id="fonctionnement"
        aria-label="Les étapes de votre projet"
      >
        {[
          [
            'Configurez votre site',
            'Choisissez votre forfait et les fonctions utiles à votre activité.',
          ],
          [
            'Laissez vos coordonnées',
            'Transmettez votre configuration avec votre nom et votre e-mail.',
          ],
          [
            'Précisons votre projet',
            'Nous vous recontactons pour valider le périmètre avant de commencer.',
          ],
        ].map(([title, text], index) => (
          <Reveal className="home-method__step" key={title} delay={index * 80}>
            <span className="home-method__number">0{index + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </Reveal>
        ))}
      </section>
      <section
        className="container home-comparison"
        id="comparer"
        aria-labelledby="home-comparison-title"
      >
        <Reveal className="section-heading">
          <h2 id="home-comparison-title">Comparer les forfaits</h2>
        </Reveal>
        <Reveal>
          <OfferComparison pricing={pricing} id="home-comparison" />
        </Reveal>
      </section>
      <section className="container home-faq" aria-labelledby="home-faq-title">
        <Reveal>
          <div className="section-heading">
            <h2 id="home-faq-title">Questions fréquentes</h2>
          </div>
          <FaqList items={homeFaqs} prefix="home" />
          <Link className="text-link home-faq__all" to="/faq">
            Toutes les questions <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
  )
}

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

function OfferComparison({ pricing, id }: { pricing: Pricing; id: string }) {
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

export function OffersPage() {
  usePageTitle('Comparer les forfaits de création de sites')
  const pricing = usePricing()
  return (
    <>
      <Intro
        title="Comparer les forfaits"
        description="Comparez ce que comprend chaque forfait, puis personnalisez votre site."
      />
      <section className="container public-comparison" aria-label="Comparaison des forfaits">
        <OfferComparison pricing={pricing} id="forfaits-comparison" />
      </section>
      <ExistingSiteServices />
    </>
  )
}

function OptionRows({ offerId = 'vitrine' }: { offerId?: OfferId }) {
  const pricing = usePricing()
  const configuration = normalizeConfiguration({ offerId })
  return (
    <div className="public-option-list">
      {optionGroups.map((group) => (
        <section
          className="public-option-group"
          key={group.id}
          aria-labelledby={`options-${group.id}`}
        >
          <h2 id={`options-${group.id}`}>{group.title}</h2>
          {optionDefinitions
            .filter((option) => option.group === group.id)
            .map((option) => {
              const included = isOptionIncluded(configuration, option.id)
              return (
                <div className="public-option" key={option.id}>
                  <div>
                    <h3>{option.title}</h3>
                    <p>{option.description}</p>
                  </div>
                  <div className="public-option__action">
                    <span>
                      {included
                        ? 'Compris'
                        : `+ ${formatMoney(pricing.options[option.id], pricing.currency)}${option.billing === 'monthly' ? ' / mois' : ''}`}
                    </span>
                    {included ? (
                      <Check size={22} aria-label="Compris dans le forfait" />
                    ) : (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          aria-label={`Choisir ${option.title}`}
                          to={`${configureHref(offerId)}?option=${option.id}`}
                        >
                          Choisir <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
        </section>
      ))}
    </div>
  )
}

function MissingPage({ title = 'Cette page n’est pas disponible.' }: { title?: string }) {
  return (
    <section className="container page-section public-missing">
      <h1>{title}</h1>
      <p>Retrouvez les forfaits et les exemples pour continuer votre visite.</p>
      <Button asChild>
        <Link to="/forfaits">
          Voir les forfaits <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </Button>
    </section>
  )
}

export function CustomProjectPage() {
  usePageTitle('Création de site sur mesure')
  return (
    <>
      <section className="container page-intro public-offer-hero">
        <div>
          <Breadcrumb>Sur mesure</Breadcrumb>
          <h1>Un site sur mesure.</h1>
          <p className="page-subtitle">
            Des fonctions dédiées, des outils à connecter ou une expérience particulière.
            Présentez-nous ce que votre site doit permettre.
          </p>
        </div>
        <div className="public-offer-price">
          <p>Sur devis</p>
        </div>
      </section>
      <section className="container public-custom-project">
        <div className="public-custom-copy">
          <h2>Précisons votre besoin.</h2>
          <p>
            Votre activité, les personnes qui utiliseront le site et les fonctions attendues nous
            aident à définir le projet.
          </p>
          <p>Nous vous recontactons pour valider le périmètre avant de vous proposer un devis.</p>
        </div>
        <div className="public-custom-form" id="projet">
          <InquiryForm custom />
        </div>
      </section>
    </>
  )
}

/** Kept only for older lazy imports; public routes now open the configurator directly. */
export function OfferDetailPage() {
  const { slug } = useParams()
  const offer = getOffer(slug)
  return offer ? <Navigate to={configureHref(offer.id)} replace /> : <MissingPage />
}

export function OptionsPage() {
  usePageTitle('Les options de votre site')
  return (
    <>
      <Intro title="Options du site" description="À ajouter à votre forfait selon vos besoins." />
      <section className="container public-options-page">
        <OptionRows />
        <p className="public-reference-note">
          Certaines fonctions sont déjà incluses selon le forfait. La mise en ligne est ponctuelle ;
          la maintenance est mensuelle.
        </p>
        <Button asChild>
          <Link to="/forfaits">
            Choisir mon forfait <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </>
  )
}

const exampleFilters = [
  { id: 'all', label: 'Tous' },
  { id: 'vitrine', label: 'Vitrine' },
  { id: 'connecte', label: 'Connecté' },
  { id: 'immersif', label: '3D' },
  { id: 'sur-mesure', label: 'Sur mesure' },
] as const

export function ExamplesPage() {
  usePageTitle('Exemples de sites')
  const [search, setSearch] = useSearchParams()
  const filter = exampleFilters.find((item) => item.id === search.get('type'))?.id ?? 'all'
  const filtered = examples.filter(
    (example) =>
      filter === 'all' ||
      example.offerId === filter ||
      (filter === 'immersif' && example.tags?.includes('3D')),
  )
  function changeFilter(id: string) {
    setSearch(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (id === 'all') next.delete('type')
        else next.set('type', id)
        return next
      },
      { preventScrollReset: true },
    )
  }
  return (
    <>
      <Intro
        title="Exemples de sites"
        description="Découvrez des styles et des usages pour préciser ce que vous souhaitez créer. Ces références externes illustrent les types de sites proposés."
      />
      <section className="container public-examples-page">
        <div className="public-gallery-toolbar">
          <div
            className="public-gallery-filters"
            role="group"
            aria-label="Filtrer les exemples par type de site"
          >
            {exampleFilters.map((item) => {
              const offer = getOffer(item.id)
              return (
                <button
                  type="button"
                  key={item.id}
                  className={
                    offer ? `public-gallery-filter pricing-card--${offer.variant}` : undefined
                  }
                  aria-pressed={filter === item.id}
                  onClick={() => changeFilter(item.id)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <span className="public-gallery-count" role="status">
            {filtered.length} référence{filtered.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="public-examples-grid">
          {filtered.map((example) => (
            <article className="public-example-tile" key={example.id}>
              <a
                className="public-example-tile__image"
                href={example.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  example.archived
                    ? `Voir la présentation de ${example.title}, projet archivé (nouvel onglet)`
                    : `Ouvrir le site ${example.title} (nouvel onglet)`
                }
              >
                <img
                  src={example.image}
                  alt={`Aperçu du site ${example.title}`}
                  width="1672"
                  height="940"
                  loading="lazy"
                />
              </a>
              <div className="public-example-tile__body">
                <span
                  className={`public-example-tag pricing-card--${getOffer(example.offerId)!.variant}`}
                >
                  {exampleFilters.find((item) => item.id === example.offerId)?.label ??
                    example.category}
                </span>
                <a
                  className="public-example-tile__title"
                  href={example.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h2>{example.title}</h2>
                  <ArrowRight size={21} aria-hidden="true" />
                </a>
                <p className="public-example-tile__description">
                  {example.archived ? 'Projet archivé · ' : ''}
                  {example.description}
                </p>
                <div className="public-example-tile__links">
                  <a
                    className="public-example-credit"
                    href={example.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source : {example.creator}
                  </a>
                  <a
                    className="text-link"
                    href={example.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {example.archived ? 'Voir la présentation' : 'Voir le site'}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length ? (
          <div className="empty-state">
            <p>Aucune référence pour ce type de site.</p>
            <Button variant="outline" onClick={() => changeFilter('all')}>
              Voir toutes les références
            </Button>
          </div>
        ) : null}
      </section>
    </>
  )
}

export function ExampleDetailPage() {
  const { slug } = useParams()
  const example = examples.find((item) => item.id === slug)
  usePageTitle(example?.title ?? 'Exemple')
  useEffect(() => {
    if (example) window.location.replace(example.url)
  }, [example])

  if (!example) return <MissingPage title="Cet exemple n’est pas disponible." />
  return (
    <section className="container page-section public-missing">
      <h1>{example.title}</h1>
      {example.archived && <p>Projet archivé</p>}
      <Button asChild>
        <a href={example.url}>{example.archived ? 'Voir la présentation' : 'Voir le site'}</a>
      </Button>
    </section>
  )
}

export function FaqPage() {
  usePageTitle('Questions fréquentes')
  return (
    <>
      <Intro title="Questions fréquentes" />
      <section className="container public-faq-page">
        <FaqList items={faqs} prefix="faq" />
        <div className="public-faq-contact">
          <p>Vous avez une autre question ?</p>
          <Button asChild>
            <Link to="/contact">
              Nous contacter <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}

type InquiryResult = { ok: true; id: string; notification: 'queued' | 'accepted' | 'unavailable' }
type InquiryFormProps = { custom?: boolean; service?: (typeof existingSiteOffers)[number] }

const customSubject = 'Projet sur mesure'
const inquirySubjects = [
  'Une question sur Vitrine',
  'Une question sur Connecté',
  'Une question sur la 3D',
  customSubject,
  ...existingSiteOffers.map((service) => service.subject),
  'Une autre question',
]
const inquiryMessageCopy = {
  custom: {
    label: 'Ce que vous souhaitez créer',
    placeholder: 'Votre activité, les fonctions souhaitées, les personnes qui utiliseront le site…',
  },
  contact: {
    label: 'Votre message',
    placeholder: 'Votre projet ou votre question…',
  },
} as const

function InquiryForm({ custom = false, service }: InquiryFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(custom ? customSubject : service?.subject ?? '')
  const [currentSite, setCurrentSite] = useState('')
  const [message, setMessage] = useState('')
  const [inspiration, setInspiration] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [notification, setNotification] = useState<InquiryResult['notification']>('unavailable')
  const [failure, setFailure] = useState('')
  const attempt = useRef<{ requestId: string; fingerprint: string } | null>(null)
  const inFlight = useRef(false)
  const idPrefix = custom ? 'custom' : 'contact'
  const existingSiteService = !custom
    ? service ?? existingSiteOffers.find((item) => item.subject === subject)
    : undefined
  const messageCopy = existingSiteService
    ? {
        label: existingSiteService.messageLabel,
        placeholder: existingSiteService.messagePlaceholder,
      }
    : inquiryMessageCopy[custom ? 'custom' : 'contact']

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return

    const currentSiteDetails =
      existingSiteService && currentSite.trim() ? `Site actuel : ${currentSite.trim()}\n\n` : ''
    const inspirationDetails = inspiration.trim()
      ? `\n\nLien d’inspiration : ${inspiration.trim()}`
      : ''
    const body = {
      name: name.trim(),
      email: email.trim(),
      subject: custom ? customSubject : subject,
      message: `${currentSiteDetails}${message.trim()}${inspirationDetails}`,
      website,
    }
    if (body.message.length > 4000) {
      setStatus('error')
      setFailure(
        'Votre message et vos liens doivent tenir en 4 000 caractères. Raccourcissez-les pour continuer.',
      )
      return
    }

    const fingerprint = JSON.stringify(body)
    // Retrying the same message keeps the same ID so it cannot be recorded twice.
    if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
      attempt.current = { requestId: crypto.randomUUID(), fingerprint }
    }
    inFlight.current = true
    setStatus('loading')
    setFailure('')
    try {
      const result = await api<InquiryResult>('/api/inquiries', {
        method: 'POST',
        body: { ...body, requestId: attempt.current.requestId },
      })
      if (!result?.ok || typeof result.id !== 'string') {
        throw new Error(
          'La confirmation de votre demande n’a pas abouti. Réessayez dans un instant.',
        )
      }
      setNotification(
        result.notification === 'accepted' || result.notification === 'queued'
          ? result.notification
          : 'unavailable',
      )
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setFailure(errorMessage(error, 'Votre demande n’a pas pu être enregistrée. Réessayez.'))
    } finally {
      inFlight.current = false
    }
  }

  function newMessage() {
    attempt.current = null
    setStatus('idle')
    setFailure('')
    setMessage('')
    setInspiration('')
    setCurrentSite('')
    setWebsite('')
  }

  if (status === 'success') {
    return (
      <div className="public-inquiry-success" role="status">
        <span className="public-success-icon">
          <Check size={25} aria-hidden="true" />
        </span>
        <h3>Votre demande est enregistrée.</h3>
        {notification === 'unavailable' ? (
          <>
            <p>
              La notification au studio est actuellement indisponible. Votre message est conservé,
              mais son envoi par e-mail n’a pas pu être déclenché.
            </p>
            <Button variant="outline" onClick={() => setStatus('idle')}>
              Revenir à mon message
            </Button>
          </>
        ) : (
          <>
            <p>
              Nous vous recontactons par e-mail pour préciser votre besoin et la suite du projet.
            </p>
            <Button variant="outline" onClick={newMessage}>
              Écrire un autre message
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <form className="public-inquiry-form" onSubmit={submit} aria-busy={status === 'loading'}>
      <fieldset className="public-inquiry-fields" disabled={status === 'loading'}>
        <legend className="public-sr-only">
          {custom ? 'Décrire votre projet sur mesure' : 'Contacter le studio'}
        </legend>
        <div className="form-grid">
          <div className="field">
            <Label htmlFor={`${idPrefix}-name`}>Votre nom</Label>
            <Input
              id={`${idPrefix}-name`}
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              placeholder="Votre nom"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="field">
            <Label htmlFor={`${idPrefix}-email`}>Votre e-mail</Label>
            <Input
              id={`${idPrefix}-email`}
              name="email"
              autoComplete="email"
              type="email"
              required
              maxLength={254}
              placeholder="votre@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
        {!custom && !service ? (
          <div className="field">
            <Label htmlFor="contact-subject">Votre demande</Label>
            <select
              id="contact-subject"
              name="subject"
              className="input public-native-select"
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              <option value="" disabled>
                Choisir un sujet
              </option>
              {inquirySubjects.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        ) : null}
        {existingSiteService ? (
          <div className="field">
            <Label htmlFor="contact-current-site">
              Votre site actuel <span className="text-muted">(facultatif)</span>
            </Label>
            <Input
              id="contact-current-site"
              name="currentSite"
              type="url"
              maxLength={500}
              placeholder="https://votre-site.fr"
              value={currentSite}
              onChange={(event) => setCurrentSite(event.target.value)}
            />
          </div>
        ) : null}
        <div className="field">
          <Label htmlFor={`${idPrefix}-message`}>{messageCopy.label}</Label>
          <Textarea
            id={`${idPrefix}-message`}
            name="message"
            required
            minLength={10}
            maxLength={4000}
            rows={6}
            placeholder={messageCopy.placeholder}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
        {custom ? (
          <div className="field">
            <Label htmlFor="custom-inspiration">
              Lien d’inspiration <span className="text-muted">(facultatif)</span>
            </Label>
            <Input
              id="custom-inspiration"
              name="inspiration"
              type="url"
              maxLength={500}
              placeholder="https://"
              value={inspiration}
              onChange={(event) => setInspiration(event.target.value)}
            />
          </div>
        ) : null}
        {/* Spam trap: keep separate from the optional currentSite URL above. */}
        <div className="public-inquiry-honeypot" aria-hidden="true">
          <label htmlFor={`${idPrefix}-website`}>Votre site web</label>
          <input
            id={`${idPrefix}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
        {status === 'error' ? (
          <p className="field-error" role="alert">
            {failure}
          </p>
        ) : null}
        <div className="public-inquiry-actions">
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading'
              ? 'Enregistrement…'
              : custom || existingSiteService
                ? 'Envoyer ma demande'
                : 'Envoyer mon message'}
            {status !== 'loading' ? <ArrowRight size={18} aria-hidden="true" /> : null}
          </Button>
          <p>
            {custom
              ? 'Nous validons le périmètre avec vous avant tout engagement.'
              : 'Vos coordonnées servent à vous répondre.'}
          </p>
        </div>
      </fieldset>
    </form>
  )
}

export function ContactPage() {
  const [search] = useSearchParams()
  const service = getExistingSiteOffer(search.get('besoin'))
  usePageTitle(service ? `${service.title} de site` : 'Contacter le studio')
  if (service) {
    return (
      <section className="configurator-page container existing-site-page">
        <div className="configurator-topline">
          <Link to="/forfaits">
            <ArrowLeft size={15} aria-hidden="true" />
            Tous les forfaits
          </Link>
          <Link to="/exemples">
            Exemples de sites <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="configurator-grid">
          <aside className="configurator-card-column" aria-label="Votre forfait et son prix">
            <SelectedPlanCard plan={service}>
              <div className="selected-plan__total">
                <span>Votre projet</span>
                <strong>Sur devis</strong>
              </div>
            </SelectedPlanCard>
          </aside>
          <div className="configurator-options">
            <header className="configurator-section-heading">
              <h2>{service.contactTitle}</h2>
              <p>{service.contactDescription}</p>
            </header>
            <InquiryForm key={service.id} service={service} />
          </div>
        </div>
      </section>
    )
  }
  return (
    <>
      <Intro
        title="Contacter le studio"
        description="Décrivez votre projet ou posez votre question. Nous vous recontactons par e-mail pour préciser votre besoin."
      />
      <section className="container public-contact-page">
        <div className="public-contact-copy">
          <div>
            <h2>Choisir un forfait</h2>
            <p>Comparez les fonctions et les options avant de nous écrire.</p>
            <Link className="text-link" to="/forfaits">
              Comparer les forfaits <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <InquiryForm key="contact" />
      </section>
    </>
  )
}
