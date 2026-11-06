import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronRight, ShieldCheck } from 'lucide-react'
import {
  offers,
  getOffer,
  examples,
  faqs,
  optionDefinitions,
  optionGroups,
  formatMoney,
  normalizeConfiguration,
  isOptionIncluded,
  type OfferId,
} from '../../../shared/catalog'
import { getPublicOptions } from '../../../shared/offer-options'
import { PricingCard } from '../../components/layout/PricingCard'
import { SelectedPlanCard } from '../../components/layout/SelectedPlanCard'
import { MotionLink as Link, canAnimatePlanNavigation } from '../../components/layout/plan-transition'
import { Button } from '../../components/ui/button'
import { Reveal } from '../../components/layout/motion'
import { existingSiteOffers, getExistingSiteOffer } from '../../content/existing-site'
import { didRestorePlanScroll, getPlanReturnHref } from '../../lib/plan-return'
import { FaqList } from './FaqList'
import { OfferComparison } from './OfferComparison'
import { configureHref, startingPrice, usePricing } from './pricing'
import '../public.css'

const ProjectBriefForm = lazy(() =>
  import('../../components/inquiries/ProjectBriefForm').then((module) => ({
    default: module.ProjectBriefForm,
  })),
)

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · studio`
  }, [title])
}

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

export function HomePage() {
  usePageTitle('Création de sites internet clé en main')
  const pricing = usePricing()
  const location = useLocation()
  const { hash } = location
  useEffect(() => {
    if (hash && !didRestorePlanScroll(location))
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
            Présentez votre activité, proposez un espace client ou faites découvrir votre univers en 3D.
            Nous vous aidons à choisir les fonctions utiles, puis réalisons votre site.
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
          <p className="home-hero__reassurance">
            Un doute sur le forfait ? Nous vérifions votre choix avec vous avant de commencer.
          </p>
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
            'Choisissez vos fonctions',
            'Comparez ce qui est compris et ajoutez les fonctions utiles à votre activité.',
          ],
          [
            'Décrivez votre projet',
            'Partagez vos besoins, vos fichiers et vos coordonnées dans un questionnaire adapté.',
          ],
          [
            'Préparons votre site',
            'Nous reprenons votre demande avec vous pour confirmer le forfait et les choix avant de démarrer.',
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
      <section className="container home-assurance" aria-label="Sécurité et protection des données">
        <div className="home-assurance__item">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <h2>Une revue de sécurité avant livraison.</h2>
            <p>Les accès, les formulaires et la protection des données sont contrôlés avant la mise en ligne.</p>
          </div>
        </div>
        <div className="home-assurance__item">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <h2>Un site conçu pour respecter le RGPD.</h2>
            <p>Formulaires, gestion du consentement et informations sur les données personnelles sont préparés selon les outils retenus.</p>
          </div>
        </div>
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
          <Link className="text-link home-faq__all" to="/faq" viewTransition={canAnimatePlanNavigation()}>
            Toutes les questions <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
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
          {getPublicOptions(offerId)
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
  const [search, setSearch] = useSearchParams()
  const offer = getOffer(search.get('forfait')) ?? offers[0]
  usePageTitle('Les options de votre site')
  return (
    <>
      <Intro title="Options du site" description="À ajouter à votre forfait selon vos besoins." />
      <section className="container public-options-page">
        <div className="field">
          <label htmlFor="options-offer">Votre forfait</label>
          <select id="options-offer" className="input" value={offer.id} onChange={event => setSearch({ forfait: event.target.value })}>
            {offers.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}
          </select>
        </div>
        <OptionRows offerId={offer.id} />
        <p className="public-reference-note">
          Certaines fonctions sont déjà incluses selon le forfait. La mise en ligne est ponctuelle ;
          la maintenance est mensuelle.
        </p>
        <Button asChild>
          <Link to="/forfaits" viewTransition={canAnimatePlanNavigation()}>
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
  const filtered = examples.filter((example) => filter === 'all' || example.offerId === filter)
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
      <section className="container public-examples-page">
        <h1 className="public-sr-only">Exemples de sites</h1>
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
                  className={offer ? `public-gallery-filter pricing-card--${offer.variant}` : undefined}
                  aria-pressed={filter === item.id}
                  onClick={() => changeFilter(item.id)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <span className="public-gallery-count" role="status">
            {filtered.length} référence{filtered.length > 1 ? 's' : ''} externe{filtered.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="public-examples-grid">
          {filtered.map((example, index) => (
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
                  loading={index < 2 ? 'eager' : 'lazy'}
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
                  aria-label={`${example.title} (nouvel onglet)`}
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
                    aria-label={`Source de ${example.title} : ${example.creator} (nouvel onglet)`}
                  >
                    Source : {example.creator}
                  </a>
                  <a
                    className="text-link"
                    href={example.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${example.archived ? 'Voir la présentation de' : 'Voir le site'} ${example.title} (nouvel onglet)`}
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

type InquiryFormProps = {
  custom?: boolean
  service?: (typeof existingSiteOffers)[number]
  onBusyChange?: (busy: boolean) => void
}

function InquiryForm({ custom = false, service, onBusyChange }: InquiryFormProps) {
  const requestType = service?.id ?? (custom ? 'sur-mesure' : 'contact')
  return (
    <Suspense fallback={<p role="status">Chargement du formulaire…</p>}>
      <ProjectBriefForm
        key={requestType}
        requestType={requestType}
        configuration={custom ? normalizeConfiguration({ offerId: 'sur-mesure' }) : null}
        onBusyChange={onBusyChange}
      />
    </Suspense>
  )
}

export function ContactPage() {
  const [search] = useSearchParams()
  const [sending, setSending] = useState(false)
  const service = getExistingSiteOffer(search.get('besoin'))
  usePageTitle(service ? `${service.title} de site` : 'Contacter le studio')
  if (service) {
    return (
      <section className="configurator-page container existing-site-page">
        <div className="configurator-topline">
          <Link to={getPlanReturnHref()} viewTransition={canAnimatePlanNavigation()}>
            <ArrowLeft size={15} aria-hidden="true" />
            Tous les forfaits
          </Link>
          <Link to="/exemples" viewTransition={canAnimatePlanNavigation()}>
            Exemples de sites <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="configurator-grid">
          <aside className="configurator-card-column" aria-label="Votre forfait et son prix">
            <SelectedPlanCard plan={service} disabled={sending}>
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
            <InquiryForm key={service.id} service={service} onBusyChange={setSending} />
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
            <p>Vous pouvez nous écrire sans avoir choisi. Le comparatif peut vous aider à préciser votre besoin.</p>
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
