import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Mail } from 'lucide-react'
import {
  defaultPricing,
  formatMoney,
  formatQuoteTotal,
  formatQuoteLine,
  getOptionDescription,
  getOptionScope,
  MAX_EXTRA_PAGE_COUNT,
  quoteEstimateNotice,
  formatOptionPrice,
  getOffer,
  isOptionIncluded,
  isOptionSelected,
  isPublicOffer,
  normalizeConfiguration,
  optionDefinitions,
  optionGroups,
  quoteConfiguration,
  withOption,
  withExtraPageCount,
  type Configuration,
  type OfferId,
  type OptionId,
  type Pricing,
} from '../../../shared/catalog'
import { changePublicOffer, getPublicOptions, prunePublicConfiguration } from '../../../shared/offer-options'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { SelectedPlanCard } from '../../components/layout/SelectedPlanCard'
import { MotionLink as Link, canAnimatePlanNavigation, usePlanNavigate } from '../../components/layout/plan-transition'
import {
  ProjectBriefForm,
  type InquiryResult,
} from '../../components/inquiries/ProjectBriefForm'
import { useAuth } from '../../lib/auth'
import { api, errorMessage } from '../../lib/api'
import { formatPublicCreationEstimate, readCataloguePricing } from '../../lib/pricing'
import { useProject } from '../../lib/project'
import {
  clearDraft,
  configurationKey,
  readDraft,
  readPublicDraftConfiguration,
  writeDraft,
  type ProjectDraft,
} from '../../lib/draft'
import { includedGuidance, planEstimateNote } from '../../content/configurator-copy'
import { getPlanReturnHref } from '../../lib/plan-return'
import { useOptionReflow } from '../../components/layout/use-option-reflow'

function changePrivateOffer(current: Configuration, offerId: OfferId): Configuration {
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
  const previous = (editing ? readDraft()?.configuration : readPublicDraftConfiguration()) ?? normalizeConfiguration({ offerId: requested?.id })
  const requestedConfiguration = requested
    ? editing ? changePrivateOffer(previous, requested.id) : changePublicOffer(previous, requested.id)
    : previous
  const selected = !editing && !isPublicOffer(requestedConfiguration.offerId)
    ? changePublicOffer(requestedConfiguration, 'immersif')
    : requestedConfiguration
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
  const { slug } = useParams()
  if (slug && !getOffer(slug)) {
    return (
      <section className="container page-section">
        <h1 className="page-heading">Ce forfait n’existe pas.</h1>
        <Button asChild>
          <Link to="/forfaits">Voir les forfaits</Link>
        </Button>
      </section>
    )
  }
  return <ConfiguratorPage key={location.key} />
}
export function ConfiguratorPage() {
  const { slug } = useParams<{ slug: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const navigatePlan = usePlanNavigate()
  const { user, loading: authLoading } = useAuth()
  const { refresh, selectProject } = useProject()
  const [storedConfiguration, setConfiguration] = useState(() => initialConfiguration(params, slug))
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)
  const [pricingError, setPricingError] = useState(false)
  const [stage, setStage] = useState<'options' | 'contact' | 'success'>('options')
  const [openGroups, setOpenGroups] = useState<string[]>(['essentials'])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<InquiryResult | null>(null)
  const pending = useRef(false)
  const submittedDraft = useRef<ProjectDraft | null>(null)
  const contactHeading = useRef<HTMLHeadingElement>(null)
  const optionsHeading = useRef<HTMLHeadingElement>(null)
  const successHeading = useRef<HTMLHeadingElement>(null)
  const openingGroup = useRef<HTMLButtonElement>(null)
  const estimateRef = useRef<HTMLDivElement>(null)
  const [estimateOutsideViewport, setEstimateOutsideViewport] = useState(false)
  const mobileBarRef = useRef<HTMLDivElement>(null)
  const editingId = params.get('projet') || params.get('projectId')
  const [loadedProjectKey, setLoadedProjectKey] = useState('')
  const [projectError, setProjectError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const routeOffer = getOffer(slug)
  const configuration =
    routeOffer && !editingId && routeOffer.id !== storedConfiguration.offerId
      ? changePublicOffer(storedConfiguration, routeOffer.id)
      : storedConfiguration
  const offer = getOffer(configuration.offerId)!
  const quote = quoteConfiguration(configuration, pricing)
  const selected = quote.lines.filter((line) => line.key !== 'base' && !line.included)
  // Presentation order follows the choices, independently of quote/catalogue
  // order. Existing configurations start in their canonical catalogue order.
  const [selectionOrder, setSelectionOrder] = useState<string[]>([])
  const activeKeys = new Set(selected.map((line) => line.key))
  const orderedSelection = [
    ...selectionOrder.filter((key) => activeKeys.has(key)),
    ...selected.filter((line) => !selectionOrder.includes(line.key)).map((line) => line.key),
  ]
  const selectionRanks = new Map(orderedSelection.map((key, index) => [key, index]))
  const selectionOrderKey = `${orderedSelection.join('|')}:${configuration.extraPageCount ?? 1}`
  const optionReflow = useOptionReflow(selectionOrderKey)
  const custom = offer.id === 'sur-mesure'
  const editingLoaded = !editingId || (user && loadedProjectKey === `${user.id}:${editingId}`)
  const title = custom ? 'Sur mesure' : `Site ${offer.title}`
  const totalLabel = editingId ? formatQuoteTotal(quote) : formatPublicCreationEstimate(quote)
  const monthly = quote.lines.some((line) => line.billing === 'monthly')
  const availableOptions = editingId ? optionDefinitions : getPublicOptions(offer.id)
  const visibleOptions = editingId ? optionDefinitions : getPublicOptions(configuration)
  const visibleGroups = optionGroups.filter((group) =>
    visibleOptions.some((option) => option.group === group.id),
  )

  useEffect(() => {
    document.title = `${title} · pixelito`
  }, [title])
  useEffect(() => {
    const estimate = estimateRef.current
    if (!estimate || editingId || stage !== 'options') return
    const observer = new IntersectionObserver(([entry]) => {
      setEstimateOutsideViewport(entry.intersectionRatio < 0.95)
    }, { threshold: 0.95 })
    observer.observe(estimate)
    return () => observer.disconnect()
  }, [editingId, editingLoaded, stage])
  useLayoutEffect(() => {
    const bar = mobileBarRef.current
    if (!bar) return
    const viewport = document.documentElement
    const measure = () => viewport.style.setProperty('--configurator-bar-space', `${Math.ceil(bar.getBoundingClientRect().height) + 12}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(bar)
    return () => {
      observer.disconnect()
      viewport.style.removeProperty('--configurator-bar-space')
    }
  }, [stage, editingLoaded])
  useEffect(() => {
    if (!routeOffer || editingId) return
    setConfiguration((current) => changePublicOffer(current, routeOffer.id))
    setStage('options')
    setError('')
    setResult(null)
  }, [routeOffer?.id, editingId])
  useEffect(() => {
    const controller = new AbortController()
    api<unknown>('/api/catalogue', { signal: controller.signal })
      .then((data) => setPricing(readCataloguePricing(data)))
      .catch((error) => {
        if (error.name !== 'AbortError') setPricingError(true)
      })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    if (editingLoaded && stage !== 'success') writeDraft(configuration, { markCurrentCatalogue: !editingId })
  }, [configuration, editingLoaded, editingId, stage])
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
    optionReflow.capture()
    const next = withOption(configuration, id, checked)
    setSelectionOrder(checked
      ? [...orderedSelection.filter((key) => key !== id), id]
      : orderedSelection.filter((key) => key !== id))
    setConfiguration(editingId ? next : prunePublicConfiguration(next))
    setError('')
  }
  function resetOptions() {
    optionReflow.capture()
    setConfiguration(normalizeConfiguration({ offerId: configuration.offerId }))
    setSelectionOrder([])
    setError('')
    optionsHeading.current?.focus({ preventScroll: true })
  }
  function changeOffer(offerId: OfferId) {
    if (offerId === configuration.offerId) return
    if (!editingId) {
      navigatePlan(`/forfaits/${getOffer(offerId)!.slug}`, {
        preventScrollReset: true,
      })
      return
    }
    setConfiguration(changePrivateOffer(configuration, offerId))
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
  const optionPrice = (id: OptionId, included: boolean) => {
    if (included)
      return configuration.extras.includes('online-store') &&
        (id === 'product-catalog' || id === 'online-payment')
        ? 'Dans la boutique'
        : 'Inclus'
    return `+ ${formatOptionPrice(id, pricing)}`
  }

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
          <SelectedPlanCard
            plan={offer}
            disabled={sending || stage === 'success'}
            onOfferChange={changeOffer}
          >
            <section
              className="selected-plan__selection"
              aria-label="Fonctionnalités choisies"
              aria-hidden={selected.length === 0}
              inert={selected.length === 0}
              data-open={selected.length > 0}
            >
              <div className="selected-plan__selection-clip">
                <div className="selected-plan__selection-content">
                  <div className="selected-plan__selection-heading">
                    <p>Fonctionnalités choisies</p>
                    {!editingId && stage === 'options' ? (
                      <button type="button" className="selected-plan__reset" onClick={resetOptions} disabled={sending}>
                        Réinitialiser les fonctionnalités
                      </button>
                    ) : null}
                  </div>
                  <div className="selected-plan__options-frame" ref={optionReflow.frameRef}>
                    <ul ref={optionReflow.listRef}>
                      {[...availableOptions].sort((a, b) =>
                        (selectionRanks.get(a.id) ?? availableOptions.length)
                        - (selectionRanks.get(b.id) ?? availableOptions.length),
                      ).map((option, fallbackIndex) => {
                        const active = selectionRanks.has(option.id)
                        const index = selectionRanks.get(option.id) ?? fallbackIndex
                        // 1–3 left, 4–6 right; then left/right pairs below.
                        const column = index < 3 ? 1 : index < 6 ? 2 : index % 2 === 0 ? 1 : 2
                        const row = index < 3 ? index + 1 : index < 6 ? index - 2 : 4 + Math.floor((index - 6) / 2)
                        return (
                          <li
                            key={option.id}
                            data-option={option.id}
                            data-selected={active}
                            aria-hidden={!active}
                            style={{
                              '--option-column': column,
                              '--option-row': row,
                              '--option-sequence': index + 1,
                            } as CSSProperties}
                          >
                            <div className="selected-plan__option-clip">
                              <div className="selected-plan__option-content">
                                <Check size={15} strokeWidth={1.6} aria-hidden="true" />
                                <span>
                                  {selected.find(line => line.key === option.id)?.label ?? option.title}
                                  {getOptionScope(configuration, option.id) ? <small>{getOptionScope(configuration, option.id)}</small> : null}
                                </span>
                                <strong>
                                  {`+ ${option.id === 'extra-pages'
                                    ? formatQuoteLine(selected.find(line => line.key === option.id) ?? { amountCents: null }, pricing.currency)
                                    : formatOptionPrice(option.id, pricing)}`}
                                </strong>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
            <div ref={estimateRef} className="selected-plan__total" aria-live="polite" aria-atomic="true">
              <span>{custom ? 'Votre projet' : quote.estimated ? 'Estimation de création' : 'Création du site'}</span>
              <strong key={totalLabel}>{totalLabel}</strong>
              <div className="selected-plan__monthly" data-open={monthly} aria-hidden={!monthly}>
                <p key={quote.monthlyTotalCents}>
                  + {formatMoney(quote.monthlyTotalCents, quote.currency)} <span>/ mois</span>
                </p>
              </div>
              <small key={selected.length}>
                {selected.length === 0
                  ? 'Forfait de base'
                  : `${selected.length} fonctionnalité${selected.length > 1 ? 's' : ''} sélectionnée${selected.length > 1 ? 's' : ''}`}
              </small>
            </div>
            {!editingId ? <p className="selected-plan__estimate">{planEstimateNote}</p> : null}
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
                Modifier mes fonctionnalités
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
                {...(editingId
                  ? { type: 'multiple', value: openGroups, onValueChange: setOpenGroups }
                  : {
                    type: 'single',
                    collapsible: true,
                    value: openGroups[0] ?? '',
                    onValueChange: (value: string) => setOpenGroups(value ? [value] : []),
                  })}
                className="configurator-groups"
              >
                {visibleGroups.map((group, index) => {
                  const isOpen = openGroups.includes(group.id)
                  const options = availableOptions.filter((option) => option.group === group.id)
                  const selectedOptions = visibleOptions.filter((option) =>
                    option.group === group.id && isOptionSelected(configuration, option.id),
                  )
                  return (
                    <AccordionItem value={group.id} key={group.id} className="configurator-group">
                      <AccordionTrigger onClick={(event) => {
                        openingGroup.current = isOpen ? null : event.currentTarget
                      }}>
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
                            <span className="configurator-group__summary" aria-hidden={isOpen}>
                              <span>
                                <span>
                                  {selectedOptions
                                    .map((option) =>
                                      isOptionIncluded(configuration, option.id)
                                        ? `${option.title} (inclus)`
                                        : option.id === 'extra-pages'
                                          ? `${configuration.extraPageCount ?? 1} page${(configuration.extraPageCount ?? 1) > 1 ? 's' : ''} supplémentaire${(configuration.extraPageCount ?? 1) > 1 ? 's' : ''}`
                                          : option.title,
                                    )
                                    .join(' · ')}
                                </span>
                              </span>
                            </span>
                          ) : null}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent
                        forceMount
                        inert={!isOpen}
                        aria-hidden={!isOpen}
                        onTransitionEnd={(event) => {
                          const trigger = openingGroup.current
                          if (
                            event.propertyName !== 'grid-template-rows' || !isOpen ||
                            trigger?.getAttribute('aria-controls') !== event.currentTarget.id
                          ) return
                          openingGroup.current = null
                          if (trigger.getBoundingClientRect().top < 0) {
                            trigger.scrollIntoView({ block: 'start' })
                          }
                        }}
                      >
                        <div className="configurator-group__body">
                          {group.id === 'launch' ? <p className="configurator-notice">Choisissez une formule mensuelle facultative. Chaque formule remplace la précédente.</p> : null}
                          <div className="configurator-choice-list">
                            {options.map((option) => {
                              const included = isOptionIncluded(configuration, option.id)
                              const animatesVisibility = !editingId && option.id === 'online-payment'
                              const hidden = animatesVisibility && included
                              const checked = !hidden && isOptionSelected(configuration, option.id)
                              const extraPage = option.id === 'extra-pages'
                              const showQuantity = extraPage && checked
                              const choice = (
                                <div key={option.id} className="configurator-choice-item" data-quantity={showQuantity}>
                                  <label
                                    className={`configurator-choice${included && !hidden ? ' configurator-choice--included' : ''}`}
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
                                      <span id={`description-${option.id}`}>{getOptionDescription(offer.id, option)}</span>
                                    </span>
                                    <span className="configurator-choice__price">
                                      {optionPrice(option.id, included && !hidden)}
                                      {extraPage ? <small>par page</small> : null}
                                    </span>
                                  </label>
                                  {showQuantity ? (
                                    <input
                                      id="extra-page-count"
                                      type="number"
                                      className="input configurator-choice__quantity"
                                      min={1}
                                      max={MAX_EXTRA_PAGE_COUNT}
                                      step={1}
                                      value={configuration.extraPageCount ?? 1}
                                      disabled={sending}
                                      aria-label="Nombre de pages supplémentaires"
                                      aria-describedby={`description-${option.id}`}
                                      onChange={(event) => {
                                        const count = event.currentTarget.valueAsNumber
                                        if (!Number.isInteger(count) || count < 1 || count > MAX_EXTRA_PAGE_COUNT) return
                                        optionReflow.capture()
                                        setConfiguration(withExtraPageCount(configuration, count))
                                        setError('')
                                      }}
                                    />
                                  ) : null}
                                </div>
                              )
                              return animatesVisibility ? (
                                <div key={option.id} className="configurator-choice-visibility" data-visible={!hidden} inert={hidden} aria-hidden={hidden}>
                                  <div className="configurator-choice-visibility__clip">{choice}</div>
                                </div>
                              ) : choice
                            })}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
              {editingId && quote.estimated ? (
                <p className="configurator-notice">{quoteEstimateNotice(quote)}</p>
              ) : null}
              {pricingError ? (
                <p className="configurator-notice" role="status">
                  Les tarifs sont temporairement indisponibles. Vous pouvez nous transmettre vos
                  choix.
                </p>
              ) : null}
              <div className="configurator-next">
                <Button size="lg" onClick={editingId ? saveExisting : goContact} disabled={sending}>
                  {editingId ? 'Enregistrer mes choix' : 'Continuer'}
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
                    Mes fonctionnalités
                  </button>
                </div>
                <h2 ref={contactHeading} tabIndex={-1}>
                  Envoyez votre demande.
                </h2>
                <p>Laissez vos coordonnées et quelques mots sur votre projet. Votre forfait et vos fonctionnalités sont joints à la demande.</p>
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
          {stage === 'success' && result ? (
            <div className="configurator-success" role="status">
              <span className="configurator-success__icon">
                <Mail size={28} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2 ref={successHeading} tabIndex={-1}>
                Votre demande a bien été enregistrée.
              </h2>
              <p>
                Un développeur vous contactera au plus vite pour échanger sur votre projet.
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
        <div ref={mobileBarRef} className="configurator-price-bar" data-follow-estimate={!editingId && estimateOutsideViewport}>
          <div>
            <span>{offer.title}</span>
            <strong>{totalLabel}</strong>
            {monthly ? (
              <small>+ {formatMoney(quote.monthlyTotalCents, quote.currency)} / mois</small>
            ) : null}
          </div>
          <Button onClick={editingId ? saveExisting : goContact} disabled={sending}>
            {editingId ? 'Enregistrer' : 'Continuer'}
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </section>
  )
}
