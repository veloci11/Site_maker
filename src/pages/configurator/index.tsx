import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Loader2, Mail } from 'lucide-react'
import {
  defaultPricing,
  formatMoney,
  getOffer,
  isOptionIncluded,
  isOptionSelected,
  normalizeConfiguration,
  optionDefinitions,
  optionGroups,
  quoteConfiguration,
  withOption,
  type Configuration,
  type OfferId,
  type OptionId,
  type Pricing,
} from '../../../shared/catalog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { SelectedPlanCard } from '../../components/layout/SelectedPlanCard'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { useAuth } from '../../lib/auth'
import { api, errorMessage } from '../../lib/api'
import { useProject } from '../../lib/project'
import { clearDraft, readDraft, writeDraft } from '../../lib/draft'
import { includedGuidance } from '../../content/configurator-copy'

function forOffer(current: Configuration, offerId: OfferId): Configuration {
  if (current.offerId === offerId) return current
  return normalizeConfiguration({
    ...current,
    offerId,
    mobile: current.offerId === 'vitrine' && current.mobile,
    managedContent: current.offerId !== 'connecte' && current.managedContent,
    scene3d: current.offerId !== 'immersif' && current.scene3d,
    extras: current.extras.filter((id) => !isOptionIncluded(current, id)),
  })
}
function initialConfiguration(params: URLSearchParams, slug?: string): Configuration {
  if (params.get('nouveau') === '1') clearDraft()
  const requested = getOffer(slug) ?? getOffer(params.get('forfait') ?? params.get('formule'))
  const previous = readDraft()?.configuration ?? normalizeConfiguration({ offerId: requested?.id })
  const selected = requested ? forOffer(previous, requested.id) : previous
  const option = optionDefinitions.find((item) => item.id === params.get('option'))
  return option ? withOption(selected, option.id, true) : selected
}

type Contact = {
  name: string
  email: string
  phone: string
  company: string
  message: string
  inspiration: string
  website: string
}
const emptyContact: Contact = {
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  inspiration: '',
  website: '',
}
type InquiryResult = {
  ok: boolean
  id: string
  notification: 'queued' | 'accepted' | 'unavailable'
}
function revealSection(element: HTMLElement | null) {
  element?.focus({ preventScroll: true })
  if (window.matchMedia('(min-width: 761px)').matches)
    window.scrollTo({ top: 0, behavior: 'instant' })
  else element?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

export function ForfaitConfiguratorPage() {
  const location = useLocation()
  return <ConfiguratorPage key={location.key} />
}
export function ConfiguratorPage() {
  const { slug } = useParams<{ slug: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { refresh, selectProject } = useProject()
  const [storedConfiguration, setConfiguration] = useState(() => initialConfiguration(params, slug))
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)
  const [pricingError, setPricingError] = useState(false)
  const [stage, setStage] = useState<'options' | 'contact' | 'success'>('options')
  const [contact, setContact] = useState<Contact>(emptyContact)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<InquiryResult | null>(null)
  const pending = useRef(false)
  const mounted = useRef(true)
  const requestContext = useRef(0)
  const attempt = useRef<{ body: string; id: string } | null>(null)
  const contactHeading = useRef<HTMLHeadingElement>(null)
  const optionsHeading = useRef<HTMLHeadingElement>(null)
  const successHeading = useRef<HTMLHeadingElement>(null)
  const editingId = params.get('projet') || params.get('projectId')
  const [loadedProjectKey, setLoadedProjectKey] = useState('')
  const [projectError, setProjectError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const routeOffer = getOffer(slug)
  const configuration =
    routeOffer && !editingId ? forOffer(storedConfiguration, routeOffer.id) : storedConfiguration
  const offer = getOffer(configuration.offerId)!
  const quote = quoteConfiguration(configuration, pricing)
  const selected = quote.lines.filter((line) => line.key !== 'base' && !line.included)
  const custom = offer.id === 'sur-mesure'
  const editingLoaded = !editingId || (user && loadedProjectKey === `${user.id}:${editingId}`)
  const title = custom ? 'Sur mesure' : `Site ${offer.title}`
  const totalLabel = custom
    ? 'Sur devis'
    : quote.totalCents === null
      ? 'À partir de…'
      : formatMoney(quote.totalCents, quote.currency)
  const monthly = quote.lines.some((line) => line.billing === 'monthly')

  useEffect(() => {
    document.title = `${title} · studio`
  }, [title])
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    if (!routeOffer || editingId) return
    requestContext.current++
    setConfiguration((current) => forOffer(current, routeOffer.id))
    setStage('options')
    setError('')
    setResult(null)
  }, [routeOffer?.id, editingId])
  useEffect(() => {
    const controller = new AbortController()
    api<{ pricing: Pricing }>('/api/catalogue', { signal: controller.signal })
      .then((data) => setPricing(data.pricing))
      .catch((error) => {
        if (error.name !== 'AbortError') setPricingError(true)
      })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    if (editingLoaded && stage !== 'success') writeDraft(configuration)
  }, [configuration, editingLoaded, stage])
  useEffect(() => {
    if (!editingId || authLoading) return
    if (!user) {
      navigate(`/connexion?retour=${encodeURIComponent(`/configurateur?projet=${editingId}`)}`, {
        replace: true,
      })
      return
    }
    let active = true
    setProjectError('')
    setLoadedProjectKey('')
    api<{ project: { configuration: Configuration } }>(
      `/api/projects/${encodeURIComponent(editingId)}`,
    )
      .then((data) => {
        if (active) {
          setConfiguration(normalizeConfiguration(data.project.configuration))
          setLoadedProjectKey(`${user.id}:${editingId}`)
        }
      })
      .catch((error) => {
        if (active) setProjectError(errorMessage(error))
      })
    return () => {
      active = false
    }
  }, [editingId, user?.id, authLoading, navigate, loadAttempt])

  function changeOption(id: OptionId, checked: boolean) {
    setConfiguration(withOption(configuration, id, checked))
    setError('')
  }
  function changeOffer(offerId: OfferId) {
    setConfiguration(forOffer(configuration, offerId))
    setStage('options')
    setError('')
    if (!editingId) navigate(`/forfaits/${getOffer(offerId)!.slug}`, { preventScrollReset: true })
  }
  function goContact() {
    setStage('contact')
    setError('')
    requestAnimationFrame(() => revealSection(contactHeading.current))
  }
  function goOptions() {
    setStage('options')
    setError('')
    requestAnimationFrame(() => revealSection(optionsHeading.current))
  }
  async function saveExisting() {
    if (pending.current || !editingId || !editingLoaded) return
    pending.current = true
    setSending(true)
    setError('')
    try {
      await api(`/api/projects/${encodeURIComponent(editingId)}`, {
        method: 'PATCH',
        body: { configuration },
      })
      await refresh()
      selectProject(editingId)
      navigate('/espace')
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      pending.current = false
      setSending(false)
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    pending.current = true
    setSending(true)
    setError('')
    const submittedDraft = writeDraft(configuration)
    const context = requestContext.current
    const body = {
      ...contact,
      name: contact.name.trim(),
      email: contact.email.trim(),
      configuration,
    }
    const signature = JSON.stringify(body)
    if (!attempt.current || attempt.current.body !== signature)
      attempt.current = { body: signature, id: crypto.randomUUID() }
    try {
      const response = await api<InquiryResult>('/api/inquiries', {
        method: 'POST',
        body: { ...body, requestId: attempt.current.id },
      })
      if (readDraft()?.id === submittedDraft.id) clearDraft()
      if (!mounted.current || context !== requestContext.current) return
      setResult(response)
      setStage('success')
      requestAnimationFrame(() => revealSection(successHeading.current))
    } catch (error) {
      if (mounted.current && context === requestContext.current)
        setError(errorMessage(error, 'Votre demande n’a pas pu être enregistrée. Réessayez.'))
    } finally {
      pending.current = false
      if (mounted.current) setSending(false)
    }
  }
  const optionPrice = (id: OptionId) => {
    if (isOptionIncluded(configuration, id))
      return configuration.extras.includes('online-store') &&
        (id === 'product-catalog' || id === 'online-payment')
        ? 'Dans la boutique'
        : 'Inclus'
    const option = optionDefinitions.find((item) => item.id === id)!
    return `+ ${formatMoney(pricing.options[id], pricing.currency)}${option.billing === 'monthly' ? ' / mois' : ''}`
  }

  if (slug && !routeOffer)
    return (
      <section className="container page-section">
        <h1 className="page-heading">Ce forfait n’existe pas.</h1>
        <Button asChild>
          <Link to="/forfaits">Voir les forfaits</Link>
        </Button>
      </section>
    )
  if (!editingLoaded)
    return (
      <section className="container page-section">
        {projectError ? (
          <>
            <h1 className="page-heading">Ce projet n’a pas pu être ouvert.</h1>
            <p role="alert">{projectError}</p>
            <Button onClick={() => setLoadAttempt((value) => value + 1)}>Réessayer</Button>
          </>
        ) : (
          <p role="status">Chargement du projet…</p>
        )}
      </section>
    )

  return (
    <section className="configurator-page container">
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
          <SelectedPlanCard
            plan={offer}
            disabled={sending || stage === 'success'}
            onOfferChange={changeOffer}
          >
            <div className="selected-plan__total" aria-live="polite" aria-atomic="true">
              <span>{custom ? 'Votre projet' : 'Création du site'}</span>
              <strong>{totalLabel}</strong>
              {monthly ? (
                <p>
                  + {formatMoney(quote.monthlyTotalCents, quote.currency)} <span>/ mois</span>
                </p>
              ) : null}
              <small>
                {selected.length === 0
                  ? 'Forfait de base'
                  : `${selected.length} option${selected.length > 1 ? 's' : ''} sélectionnée${selected.length > 1 ? 's' : ''}`}
              </small>
            </div>
            {stage === 'success' ? (
              <div className="selected-plan__confirmation">
                <Check size={18} aria-hidden="true" />
                Demande enregistrée
              </div>
            ) : stage === 'contact' ? (
              <button
                type="button"
                className="selected-plan__button"
                onClick={goOptions}
                disabled={sending}
              >
                <ArrowLeft size={17} aria-hidden="true" />
                Modifier mes options
              </button>
            ) : editingId ? (
              <button
                className="selected-plan__button"
                type="button"
                onClick={saveExisting}
                disabled={sending}
              >
                {sending ? 'Enregistrement…' : 'Enregistrer mes choix'}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            ) : null}
          </SelectedPlanCard>
          {selected.length ? (
            <details className="configurator-selection">
              <summary>
                Votre sélection{' '}
                <span>
                  {selected.length} <ChevronDown size={14} aria-hidden="true" />
                </span>
              </summary>
              <ul>
                {selected.map((line) => (
                  <li key={line.key}>
                    <span>{line.label}</span>
                    <strong>
                      {custom && line.amountCents === null
                        ? 'À définir'
                        : `+ ${formatMoney(line.amountCents, quote.currency)}${line.billing === 'monthly' ? ' / mois' : ''}`}
                    </strong>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </aside>
        <div className="configurator-options">
          {stage === 'options' ? (
            <>
              <header className="configurator-section-heading">
                <span className="configurator-step">01 / 02</span>
                <h2 ref={optionsHeading} tabIndex={-1}>
                  Configurez votre site.
                </h2>
                <p>{includedGuidance[offer.id]}</p>
              </header>
              <Accordion
                type="single"
                collapsible
                defaultValue="essentials"
                className="configurator-groups"
              >
                {optionGroups.map((group, index) => {
                  const options = optionDefinitions.filter((option) => option.group === group.id)
                  const selectedOptions = options.filter((option) =>
                    isOptionSelected(configuration, option.id),
                  )
                  return (
                    <AccordionItem value={group.id} key={group.id} className="configurator-group">
                      <AccordionTrigger>
                        <span className="configurator-group__copy">
                          <span className="configurator-group__heading">
                            <span className="configurator-group__number">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span>{group.title}</span>
                            {selectedOptions.length > 0 ? (
                              <span className="configurator-group__count">
                                {selectedOptions.length}
                              </span>
                            ) : null}
                          </span>
                          {selectedOptions.length > 0 ? (
                            <span className="configurator-group__summary">
                              {selectedOptions
                                .map((option) =>
                                  isOptionIncluded(configuration, option.id)
                                    ? `${option.title} (inclus)`
                                    : option.title,
                                )
                                .join(' · ')}
                            </span>
                          ) : null}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="configurator-choice-list">
                          {options.map((option) => {
                            const included = isOptionIncluded(configuration, option.id)
                            const checked = isOptionSelected(configuration, option.id)
                            return (
                              <label
                                key={option.id}
                                className={`configurator-choice${included ? ' configurator-choice--included' : ''}`}
                                data-selected={checked}
                                htmlFor={`option-${option.id}`}
                              >
                                <Checkbox
                                  id={`option-${option.id}`}
                                  checked={checked}
                                  disabled={included || sending}
                                  onCheckedChange={(value) =>
                                    changeOption(option.id, value === true)
                                  }
                                  aria-describedby={`description-${option.id}`}
                                />
                                <span className="configurator-choice__copy">
                                  <strong>{option.title}</strong>
                                  <span id={`description-${option.id}`}>{option.description}</span>
                                </span>
                                <span className="configurator-choice__price">
                                  {optionPrice(option.id)}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
              {pricingError ? (
                <p className="configurator-notice" role="status">
                  Les tarifs sont temporairement indisponibles. Vous pouvez nous transmettre vos
                  choix.
                </p>
              ) : null}
              <div className="configurator-next">
                <Button size="lg" onClick={editingId ? saveExisting : goContact} disabled={sending}>
                  {editingId ? 'Enregistrer mes choix' : 'Ajouter mes coordonnées'}
                  <ArrowRight size={17} aria-hidden="true" />
                </Button>
              </div>
            </>
          ) : stage === 'contact' ? (
            <>
              <header className="configurator-section-heading">
                <div className="configurator-step-line">
                  <span className="configurator-step">02 / 02</span>
                  <button
                    type="button"
                    className="configurator-back-options"
                    onClick={goOptions}
                    disabled={sending}
                  >
                    <ArrowLeft size={13} aria-hidden="true" />
                    Mes options
                  </button>
                </div>
                <h2 ref={contactHeading} tabIndex={-1}>
                  Parlons de votre site.
                </h2>
                <p>Laissez vos coordonnées, nous vous recontactons.</p>
              </header>
              <form className="configurator-contact" onSubmit={submit} aria-busy={sending}>
                <fieldset disabled={sending}>
                  <div className="field">
                    <Label htmlFor="request-name">Votre nom</Label>
                    <Input
                      id="request-name"
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={120}
                      value={contact.name}
                      onChange={(event) => setContact({ ...contact, name: event.target.value })}
                    />
                  </div>
                  <div className="field">
                    <Label htmlFor="request-email">Votre e-mail</Label>
                    <Input
                      id="request-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={contact.email}
                      onChange={(event) => setContact({ ...contact, email: event.target.value })}
                    />
                  </div>
                  <div className="configurator-contact__row">
                    <div className="field">
                      <Label htmlFor="request-phone">
                        Téléphone <span>Facultatif</span>
                      </Label>
                      <Input
                        id="request-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        maxLength={40}
                        value={contact.phone}
                        onChange={(event) => setContact({ ...contact, phone: event.target.value })}
                      />
                    </div>
                    <div className="field">
                      <Label htmlFor="request-company">
                        Entreprise <span>Facultatif</span>
                      </Label>
                      <Input
                        id="request-company"
                        name="company"
                        autoComplete="organization"
                        maxLength={160}
                        value={contact.company}
                        onChange={(event) =>
                          setContact({ ...contact, company: event.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="field">
                    <Label htmlFor="request-message">
                      Votre projet {custom ? null : <span>Facultatif</span>}
                    </Label>
                    <Textarea
                      id="request-message"
                      name="message"
                      rows={4}
                      maxLength={4000}
                      required={custom}
                      minLength={custom ? 10 : undefined}
                      placeholder="Votre activité, vos attentes, une précision sur vos options…"
                      value={contact.message}
                      onChange={(event) => setContact({ ...contact, message: event.target.value })}
                    />
                  </div>
                  <div className="field">
                    <Label htmlFor="request-inspiration">
                      Un site qui vous inspire <span>Facultatif</span>
                    </Label>
                    <Input
                      id="request-inspiration"
                      name="inspiration"
                      type="url"
                      maxLength={500}
                      placeholder="https://"
                      value={contact.inspiration}
                      onChange={(event) =>
                        setContact({ ...contact, inspiration: event.target.value })
                      }
                    />
                  </div>
                  <div className="configurator-honeypot" aria-hidden="true">
                    <label htmlFor="request-website">Votre site actuel</label>
                    <input
                      id="request-website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={contact.website}
                      onChange={(event) => setContact({ ...contact, website: event.target.value })}
                    />
                  </div>
                  {error ? (
                    <p className="field-error" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <Button type="submit" size="lg" className="configurator-send" disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="spin" size={18} aria-hidden="true" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        Envoyer ma demande
                        <ArrowRight size={18} aria-hidden="true" />
                      </>
                    )}
                  </Button>
                  <p className="configurator-privacy">
                    Vos coordonnées servent à vous répondre.{' '}
                    <Link to="/confidentialite">Confidentialité</Link>
                  </p>
                </fieldset>
              </form>
            </>
          ) : (
            <div className="configurator-success" role="status">
              <span className="configurator-success__icon">
                <Mail size={28} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2 ref={successHeading} tabIndex={-1}>
                Votre demande est enregistrée.
              </h2>
              <p>
                {result?.notification === 'unavailable'
                  ? 'Votre sélection est conservée. La notification par e-mail est momentanément indisponible.'
                  : 'Nous vous recontactons par e-mail pour préparer la suite.'}
              </p>
              <div className="configurator-success__actions">
                <Button asChild variant="outline">
                  <Link to="/">
                    Retour à l’accueil <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </Button>
                <Link className="text-link" to="/exemples">
                  Explorer les exemples
                </Link>
              </div>
            </div>
          )}
          {stage === 'options' && error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
      {stage === 'options' ? (
        <div className="configurator-mobile-bar">
          <div>
            <span>{offer.title}</span>
            <strong>{totalLabel}</strong>
            {monthly ? (
              <small>+ {formatMoney(quote.monthlyTotalCents, quote.currency)} / mois</small>
            ) : null}
          </div>
          <Button onClick={editingId ? saveExisting : goContact} disabled={sending}>
            {editingId ? 'Enregistrer' : 'Mes coordonnées'}
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </section>
  )
}
