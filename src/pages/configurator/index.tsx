import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Mail } from 'lucide-react'
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
import { getPublicOptions, prunePublicConfiguration } from '../../../shared/offer-options'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { SelectedPlanCard } from '../../components/layout/SelectedPlanCard'
import {
  ProjectBriefForm,
  type InquiryResult,
} from '../../components/inquiries/ProjectBriefForm'
import { useAuth } from '../../lib/auth'
import { api, errorMessage } from '../../lib/api'
import { useProject } from '../../lib/project'
import {
  clearDraft,
  configurationKey,
  readDraft,
  writeDraft,
  type ProjectDraft,
} from '../../lib/draft'
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
  const editing = Boolean(params.get('projet') || params.get('projectId'))
  const requested = getOffer(slug) ?? getOffer(params.get('forfait') ?? params.get('formule'))
  const previous = readDraft()?.configuration ?? normalizeConfiguration({ offerId: requested?.id })
  const selected = requested ? forOffer(previous, requested.id) : previous
  const options = editing ? optionDefinitions : getPublicOptions(selected.offerId)
  const option = options.find((item) => item.id === params.get('option'))
  const configuration = option ? withOption(selected, option.id, true) : selected
  return editing ? configuration : prunePublicConfiguration(configuration)
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
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<InquiryResult | null>(null)
  const pending = useRef(false)
  const submittedDraft = useRef<ProjectDraft | null>(null)
  const contactHeading = useRef<HTMLHeadingElement>(null)
  const optionsHeading = useRef<HTMLHeadingElement>(null)
  const successHeading = useRef<HTMLHeadingElement>(null)
  const editingId = params.get('projet') || params.get('projectId')
  const [loadedProjectKey, setLoadedProjectKey] = useState('')
  const [projectError, setProjectError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const routeOffer = getOffer(slug)
  const configuration =
    routeOffer && !editingId && routeOffer.id !== storedConfiguration.offerId
      ? prunePublicConfiguration(forOffer(storedConfiguration, routeOffer.id))
      : storedConfiguration
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
  const availableOptions = editingId ? optionDefinitions : getPublicOptions(offer.id)
  const visibleGroups = optionGroups.filter((group) =>
    availableOptions.some((option) => option.group === group.id),
  )

  useEffect(() => {
    document.title = `${title} · studio`
  }, [title])
  useEffect(() => {
    if (!routeOffer || editingId) return
    setConfiguration((current) => prunePublicConfiguration(forOffer(current, routeOffer.id)))
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
    const next = withOption(configuration, id, checked)
    setConfiguration(editingId ? next : prunePublicConfiguration(next))
    setError('')
  }
  function changeOffer(offerId: OfferId) {
    if (offerId === configuration.offerId) return
    if (!editingId) {
      navigate(`/forfaits/${getOffer(offerId)!.slug}`, { preventScrollReset: true })
      return
    }
    setConfiguration(forOffer(configuration, offerId))
    setStage('options')
    setError('')
    setResult(null)
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
  function briefBusyChange(busy: boolean) {
    if (busy) submittedDraft.current = writeDraft(configuration)
    setSending(busy)
  }
  function briefSuccess(response: InquiryResult) {
    const submitted = submittedDraft.current
    const current = readDraft()
    if (
      submitted &&
      current?.id === submitted.id &&
      configurationKey(current.configuration) === configurationKey(submitted.configuration)
    )
      clearDraft()
    setResult(response)
    setStage('success')
    requestAnimationFrame(() => revealSection(successHeading.current))
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
                {visibleGroups.map((group, index) => {
                  const options = availableOptions.filter((option) => option.group === group.id)
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
                  {editingId ? 'Enregistrer mes choix' : 'Décrire mon projet'}
                  <ArrowRight size={17} aria-hidden="true" />
                </Button>
              </div>
            </>
          ) : null}
          {!editingId && stage !== 'success' ? (
            <div
              hidden={stage !== 'contact'}
              className={stage === 'contact' ? 'configurator-contact' : undefined}
            >
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
                  Décrivez votre projet.
                </h2>
                <p>Précisez vos besoins et laissez vos coordonnées pour préparer votre site.</p>
              </header>
              <ProjectBriefForm
                key={offer.id}
                requestType={offer.id}
                configuration={configuration}
                onSuccess={briefSuccess}
                onBusyChange={briefBusyChange}
              />
            </div>
          ) : null}
          {stage === 'success' ? (
            <div className="configurator-success" role="status">
              <span className="configurator-success__icon">
                <Mail size={28} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2 ref={successHeading} tabIndex={-1}>
                Votre demande est enregistrée.
              </h2>
              <p>
                {result?.notification === 'accepted'
                  ? 'La notification au studio a été acceptée par le service d’e-mail. Sa livraison n’est pas encore confirmée.'
                  : result?.notification === 'queued'
                    ? 'La notification au studio est en attente d’envoi. Votre demande et vos images jointes sont conservées.'
                    : 'La notification par e-mail est momentanément indisponible. Votre demande et vos images jointes restent enregistrées.'}
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
          ) : null}
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
            {editingId ? 'Enregistrer' : 'Décrire mon projet'}
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </section>
  )
}
