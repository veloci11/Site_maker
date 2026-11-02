import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { defaultPricing, examples, formatMoney, getOffer, normalizeConfiguration, offers, quoteConfiguration, type Configuration, type OfferId, type Pricing } from '../../../shared/catalog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { useAuth } from '../../lib/auth'
import { api, errorMessage } from '../../lib/api'
import { useProject } from '../../lib/project'
import { clearDraft, readDraft, saveDraftProjectOnce, writeDraft } from '../../lib/draft'
import '../configurator.css'

export function ProjectSteps({ current = 1 }: { current?: 1 | 2 | 3 }) {
  return <ol className="project-steps" aria-label="Les étapes de votre projet">{['Votre site', 'Votre espace', 'Commande'].map((label, index) => <li key={label} className={current === index + 1 ? 'is-current' : current > index + 1 ? 'is-complete' : ''} aria-current={current === index + 1 ? 'step' : undefined}>{current > index + 1 ? <Check size={16} aria-hidden="true" /> : <span>{index + 1}.</span>} {label}</li>)}</ol>
}

export function AtelierPreview({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return <figure className={`atelier-preview ${compact ? 'atelier-preview--compact' : ''} ${className}`} aria-label="Exemple fictif de site pour un atelier de céramique">
    <div className="atelier-preview__header"><span className="atelier-preview__wordmark">atelier</span><div className="atelier-preview__nav" aria-hidden="true"><span>L’atelier</span><span>Créations</span><span>Contact</span></div></div>
    <div className="atelier-preview__scene"><img src="/assets/atelier/workshop.webp" alt="Atelier de céramique baigné de soleil, avec tables en bois et poteries artisanales" width="1586" height="992" />
      <div className="atelier-preview__copy"><span className="atelier-preview__headline">Des objets<br />faits pour durer.</span><span className="atelier-preview__text">Une collection d’objets du quotidien, façonnés avec des matières naturelles et un savoir-faire artisanal.</span><span className="atelier-preview__button" aria-hidden="true">Découvrir l’atelier</span></div>
    </div>
  </figure>
}

const productCopy: Record<OfferId, { title: string; description: string; included: string[] }> = {
  vitrine: { title: 'Site Vitrine', description: 'Présentez votre activité et vos réalisations. Facilitez la prise de contact.', included: ['Un design adapté à votre activité', 'Une version ordinateur et mobile', 'Un formulaire de contact'] },
  connecte: { title: 'Site Connecté', description: 'Un site dont vous pouvez modifier les textes et les images après livraison.', included: ['Votre site et son espace de gestion', 'Vos textes et images modifiables', 'Une version ordinateur et mobile'] },
  immersif: { title: 'Site Immersif 3D', description: 'Présentez votre activité avec un élément 3D interactif.', included: ['Un élément 3D interactif', 'Un site qui présente votre univers', 'Une version ordinateur et mobile'] },
  'sur-mesure': { title: 'Site sur mesure', description: 'Définissons les fonctions et les intégrations adaptées à votre projet.', included: ['Un périmètre personnalisé', 'Des fonctions et intégrations dédiées', 'Un devis avant tout engagement'] },
}

type PreviewSample = { id: string; title: string; category: string; image: string; reference?: typeof examples[number] }
const atelierSample: PreviewSample = { id: 'atelier', title: 'Atelier de céramique', category: 'Artisanat', image: '/assets/atelier/workshop.webp' }
const referenceSample = (id: string): PreviewSample => {
  const reference = examples.find(item => item.id === id)!
  return { id, title: reference.title, category: reference.category, image: reference.image, reference }
}
const previewSamples: Record<OfferId, PreviewSample[]> = {
  vitrine: [referenceSample('domteknika'), atelierSample],
  connecte: [referenceSample('lactel'), atelierSample, referenceSample('domteknika')],
  immersif: [referenceSample('julie-thiam'), referenceSample('tiny-heaven'), atelierSample],
  'sur-mesure': [referenceSample('addiction-agency'), referenceSample('tiny-heaven'), atelierSample],
}

function PreviewImage({ sample }: { sample: PreviewSample }) {
  if (sample.id === 'atelier') return <AtelierPreview />
  return <figure className="configurator-reference"><img src={sample.image} alt={`Aperçu du site ${sample.title}, référence visuelle indépendante`} width="1672" height="1000" decoding="async" /></figure>
}

function forOffer(current: Configuration, offerId: OfferId): Configuration {
  if (current.offerId === offerId) return current
  return normalizeConfiguration({ ...current, offerId, managedContent: current.offerId !== 'connecte' && current.managedContent, scene3d: current.offerId !== 'immersif' && current.scene3d })
}

function initialConfiguration(params: URLSearchParams, slug?: string): Configuration {
  if (params.get('nouveau') === '1') clearDraft()
  const requested = getOffer(slug) ?? getOffer(params.get('formule'))
  const draft = readDraft()
  const previous = draft?.configuration ?? normalizeConfiguration({ offerId: 'vitrine' })
  const configuration = requested ? forOffer(previous, requested.id) : previous
  const option = params.get('option')
  const patch = option === 'language-en' ? { language: 'fr-en' } : option === 'managed-content' ? { managedContent: true } : option === 'scene-3d' ? { scene3d: true } : option === 'deployment' ? { deployment: true } : option === 'maintenance-monthly' ? { maintenance: true } : {}
  return normalizeConfiguration({ ...configuration, ...patch })
}

function OptionDetails({ title = 'En savoir plus', children }: { title?: string; children: ReactNode }) {
  return <Accordion type="single" collapsible className="configurator-option-details"><AccordionItem value="details"><AccordionTrigger>{title}</AccordionTrigger><AccordionContent>{children}</AccordionContent></AccordionItem></Accordion>
}

export function ForfaitConfiguratorPage() { return <ConfiguratorPage /> }

export function ConfiguratorPage() {
  const { slug } = useParams<{ slug: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { createProject, refresh, selectProject } = useProject()
  const [storedConfiguration, setConfiguration] = useState<Configuration>(() => initialConfiguration(params, slug))
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)
  const [pricingError, setPricingError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sampleIndex, setSampleIndex] = useState(0)
  const saveInProgress = useRef<Promise<void> | null>(null)
  const mounted = useRef(true)
  const editingId = params.get('projet') || params.get('projectId')
  const [loadedProjectKey, setLoadedProjectKey] = useState<string | null>(null)
  const [projectLoadError, setProjectLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const editingKey = `${user?.id}:${editingId}`
  const editingLoaded = !editingId || loadedProjectKey === editingKey
  const requestedSave = params.get('enregistrer') === '1'
  const routeOffer = getOffer(slug)
  // Route changes render their product immediately, including inside a view
  // transition. The effect below synchronizes the editable draft afterward.
  const configuration = routeOffer && !editingId ? forOffer(storedConfiguration, routeOffer.id) : storedConfiguration
  const offer = getOffer(configuration.offerId)!
  const copy = productCopy[configuration.offerId]
  const samples = previewSamples[configuration.offerId]
  const sample = samples[sampleIndex] ?? samples[0]
  const custom = configuration.offerId === 'sur-mesure'
  const quote = quoteConfiguration(configuration, pricing)
  const selectedOptionCount = quote.lines.filter(line => line.key !== 'base' && !line.included).length
  const disabled = saving || (!!editingId && !editingLoaded)

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    if (routeOffer && !editingId) setConfiguration(current => forOffer(current, routeOffer.id))
  }, [routeOffer?.id, editingId])
  useEffect(() => { setSampleIndex(0) }, [configuration.offerId])
  useEffect(() => {
    let active = true
    api<{ pricing?: Pricing }>('/api/catalogue').then(data => { if (active && data.pricing) setPricing(data.pricing) }).catch(() => { if (active) setPricingError('Les tarifs sont momentanément indisponibles. Vous pouvez enregistrer vos choix.') })
    return () => { active = false }
  }, [])
  useEffect(() => { if (!editingId || editingLoaded) writeDraft(configuration) }, [configuration, editingId, editingLoaded])
  useEffect(() => {
    if (!editingId || authLoading) return
    if (!user) {
      navigate(`/connexion?retour=${encodeURIComponent(`/configurateur?projet=${encodeURIComponent(editingId)}`)}`, { replace: true })
      return
    }
    let active = true
    setLoadedProjectKey(null); setProjectLoadError('')
    api<{ project: { configuration: Configuration } }>(`/api/projects/${encodeURIComponent(editingId)}`).then(data => { if (active) { setConfiguration(normalizeConfiguration(data.project.configuration)); setLoadedProjectKey(`${user.id}:${editingId}`) } }).catch(e => { if (active) setProjectLoadError(errorMessage(e)) })
    return () => { active = false }
  }, [editingId, user?.id, authLoading, navigate, loadAttempt])

  const save = useCallback((): Promise<void> => {
    if (saveInProgress.current) return saveInProgress.current
    if (configuration.offerId === 'sur-mesure') { navigate('/contact?forfait=sur-mesure'); return Promise.resolve() }
    const draft = writeDraft(configuration)
    if (!user) {
      navigate(`/inscription?retour=${encodeURIComponent('/configurateur?enregistrer=1')}`)
      return Promise.resolve()
    }
    setSaving(true); setError('')
    const promise = (async () => {
      try {
        let projectId: string
        if (editingId) {
          if (!editingLoaded) throw new Error('Le projet n’est pas encore chargé.')
          const result = await api<{ project: { id: string } }>(`/api/projects/${encodeURIComponent(editingId)}`, { method: 'PATCH', body: { configuration } })
          projectId = result.project.id
        } else {
          projectId = await saveDraftProjectOnce(user.id, draft, selected => createProject(selected, `Mon site ${getOffer(selected.offerId)?.title ?? ''}`.trim()))
        }
        await refresh()
        if (!mounted.current) return
        selectProject(projectId)
        navigate(`/commande/${encodeURIComponent(projectId)}`, { replace: true })
      } catch (e) { if (mounted.current) setError(errorMessage(e)) }
      finally { if (mounted.current) setSaving(false); saveInProgress.current = null }
    })()
    saveInProgress.current = promise
    return promise
  }, [configuration, user, editingId, editingLoaded, createProject, refresh, selectProject, navigate])

  const autoSaveAttempt = useRef(false)
  useEffect(() => {
    if (!requestedSave || authLoading || !user || !editingLoaded || autoSaveAttempt.current) return
    autoSaveAttempt.current = true
    void save()
  }, [requestedSave, authLoading, user, editingLoaded, editingId, save])

  const change = (patch: Partial<Configuration>) => { setError(''); setConfiguration(current => normalizeConfiguration({ ...current, ...patch })) }
  const changeOffer = (offerId: OfferId) => {
    setConfiguration(current => forOffer(current, offerId))
    setChooserOpen(false); setError('')
    const next = getOffer(offerId)!
    // A route change remounts the product page. While editing, that would fetch
    // the saved project again and discard choices made since opening it.
    if (!editingId) navigate(`/forfaits/${next.slug}`, { preventScrollReset: true })
  }
  const addon = (key: keyof Pricing['options'], monthly = false) => pricing.options[key] === 0 ? 'Inclus' : `+ ${formatMoney(pricing.options[key], pricing.currency)}${monthly ? ' / mois' : ''}`
  const basePrice = custom ? 'Sur devis' : `À partir de ${formatMoney(pricing.base[configuration.offerId], pricing.currency)}`

  if (slug && !routeOffer) return <section className="container page-section"><h1 className="page-heading">Ce forfait n’existe pas.</h1><Button asChild><Link to="/forfaits">Voir les forfaits</Link></Button></section>
  if (editingId && (authLoading || !user || !editingLoaded)) return <section className="container page-section">
    {projectLoadError ? <><h1 className="page-heading">Ce projet n’a pas pu être ouvert.</h1><p className="page-subtitle" role="alert">{projectLoadError}</p><div className="form-actions"><Button variant="outline" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Réessayer</Button><Button asChild><Link to="/espace">Mes projets</Link></Button><Link className="text-link" to="/forfaits">Choisir un forfait <ArrowRight size={16} aria-hidden="true" /></Link></div></> : <div className="loading-state" role="status"><Loader2 size={22} className="spin" aria-hidden="true" /><span>Chargement de votre projet…</span></div>}
  </section>

  return <section className="configurator-page">
    <div className="container">
      <div className="configurator-topline"><Link className="configurator-back" to="/forfaits"><ArrowLeft size={15} aria-hidden="true" />Tous les forfaits</Link></div>
      <div className="configurator-grid">
        <header className="configurator-mobile-heading" key={`mobile:${offer.id}`}><h1>{copy.title}</h1></header>
        <aside className="configurator-preview-column" aria-label="Aperçus de sites">
          <div className="configurator-preview">
            <div className="configurator-preview-stage"><div key={`${offer.id}:${sample.id}`} className="configurator-preview-motion"><PreviewImage sample={sample} /></div></div>
            <div className="configurator-preview-caption"><div><strong>{sample.title}</strong><span>{sample.reference ? <>Référence indépendante · {sample.reference.creator} · <a href={sample.reference.url} target="_blank" rel="noreferrer">Explorer le site<ArrowUpRight size={11} aria-hidden="true" /></a></> : 'Exemple de rendu fictif'}</span></div><Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogTrigger asChild><button className="configurator-inline-link" type="button">Agrandir<ArrowUpRight size={15} aria-hidden="true" /></button></DialogTrigger><DialogContent className="atelier-enlarged"><DialogHeader><DialogTitle>{sample.title}</DialogTitle><DialogDescription>{sample.reference ? `Une référence pour vous projeter. ${sample.reference.creator}.` : 'Une illustration de site pour un atelier de céramique.'}</DialogDescription></DialogHeader><PreviewImage sample={sample} />{sample.reference ? <a className="configurator-inline-link" href={sample.reference.sourceUrl} target="_blank" rel="noreferrer">Voir la source<ArrowUpRight size={15} aria-hidden="true" /></a> : null}</DialogContent></Dialog></div>
            <div className="configurator-gallery-controls"><div className="configurator-samples" role="group" aria-label="Choisir un aperçu">{samples.map((item, index) => <button key={item.id} type="button" aria-pressed={index === sampleIndex} className="configurator-sample" onClick={() => setSampleIndex(index)}><span className="configurator-sample-image"><img src={item.image} alt="" loading="lazy" /></span><span>{item.category}</span></button>)}</div><div className="configurator-gallery-arrows"><button type="button" aria-label="Aperçu précédent" onClick={() => setSampleIndex(index => (index - 1 + samples.length) % samples.length)}><ChevronLeft size={20} /></button><button type="button" aria-label="Aperçu suivant" onClick={() => setSampleIndex(index => (index + 1) % samples.length)}><ChevronRight size={20} /></button></div></div>
          </div>
        </aside>

        <div className="configurator-options" aria-busy={saving}>
          <header className="configurator-product"><div className="configurator-product-copy" key={offer.id}><h1>{copy.title}</h1><p className="configurator-product-description">{copy.description}</p></div><div className="configurator-product-price"><strong>{basePrice}</strong><Dialog open={chooserOpen} onOpenChange={setChooserOpen}><DialogTrigger asChild><button type="button" className="configurator-inline-link" disabled={disabled}>Changer de forfait</button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Choisir un forfait</DialogTitle><DialogDescription>Vous pourrez ensuite personnaliser les options.</DialogDescription></DialogHeader><div className="configurator-offer-choices">{offers.map(item => <button type="button" className="choice" data-selected={configuration.offerId === item.id} key={item.id} onClick={() => changeOffer(item.id)}><span><strong className="choice-title">{item.title}</strong><span className="choice-description">{item.description}</span><span className="configurator-offer-price">{item.id === 'sur-mesure' ? 'Sur devis' : `À partir de ${formatMoney(pricing.base[item.id], pricing.currency)}`}</span></span>{configuration.offerId === item.id ? <Check size={20} aria-hidden="true" /> : null}</button>)}</div></DialogContent></Dialog></div><div className="configurator-included"><h2>Inclus dans ce forfait</h2><ul>{copy.included.map(text => <li key={text}><Check size={15} aria-hidden="true" />{text}</li>)}</ul></div></header>

          {custom ? <div className="configurator-custom"><h2>Décrivez votre besoin</h2><p>Le périmètre et le devis sont définis avec vous.</p><ul><li>Votre objectif et vos utilisateurs</li><li>Les fonctions et connexions souhaitées</li><li>Vos références et vos contraintes</li></ul></div> : <>
            <fieldset className="configurator-option-group" disabled={disabled}><legend>Langues</legend><RadioGroup className="configurator-language-choices" aria-label="Les langues de votre site" value={configuration.language} onValueChange={value => change({ language: value as Configuration['language'] })} disabled={disabled}>
              <label className="configurator-choice" data-selected={configuration.language === 'fr'} htmlFor="config-language-fr"><RadioGroupItem value="fr" id="config-language-fr" /><span className="configurator-choice-copy"><strong>Français</strong></span><span className="configurator-choice-price">Inclus</span></label>
              <label className="configurator-choice" data-selected={configuration.language === 'fr-en'} htmlFor="config-language-en"><RadioGroupItem value="fr-en" id="config-language-en" /><span className="configurator-choice-copy"><strong>Français + anglais</strong></span><span className="configurator-choice-price">{addon('language-en')}</span></label>
            </RadioGroup></fieldset>

            <fieldset className="configurator-option-group" disabled={disabled}><legend>Gestion des contenus</legend><label className="configurator-checkbox-choice" data-selected={configuration.managedContent} htmlFor="config-content"><Checkbox id="config-content" checked={configuration.managedContent} disabled={disabled || configuration.offerId === 'connecte'} onCheckedChange={checked => change({ managedContent: checked === true })} /><span className="configurator-choice-copy"><strong>Modifier mes textes et images</strong><span>Sur le site livré, après sa mise en ligne.</span></span><span className="configurator-option-price">{configuration.offerId === 'connecte' ? 'Inclus' : addon('managed-content')}</span></label></fieldset>

            <fieldset className="configurator-option-group" disabled={disabled}><legend>Élément 3D</legend><label className="configurator-checkbox-choice" data-selected={configuration.scene3d} htmlFor="config-3d"><Checkbox id="config-3d" checked={configuration.scene3d} disabled={disabled || configuration.offerId === 'immersif'} onCheckedChange={checked => change({ scene3d: checked === true })} /><span className="configurator-choice-copy"><strong>Un élément 3D interactif</strong><span>Un objet ou une scène à explorer.</span></span><span className="configurator-option-price">{configuration.offerId === 'immersif' ? 'Inclus' : addon('scene-3d')}</span></label><OptionDetails title="Le périmètre de la 3D"><p>L’élément et ses interactions sont définis avec vous. Une expérience ou un configurateur complexe peut nécessiter un projet sur mesure.</p></OptionDetails></fieldset>

            <fieldset className="configurator-option-group" disabled={disabled}><legend>Mise en ligne</legend><label className="configurator-checkbox-choice" data-selected={configuration.deployment} htmlFor="config-deployment"><Checkbox id="config-deployment" checked={configuration.deployment} disabled={disabled} onCheckedChange={checked => change({ deployment: checked === true })} /><span className="configurator-choice-copy"><strong>Confier la mise en ligne au studio</strong><span>Installation et configuration initiales.</span></span><span className="configurator-option-price">{addon('deployment')}</span></label><OptionDetails title="Domaine et hébergement"><p>Le nom de domaine, l’hébergement et leurs éventuels abonnements sont précisés avant la commande.</p></OptionDetails></fieldset>

            <fieldset className="configurator-option-group" disabled={disabled}><legend>Maintenance</legend><label className="configurator-checkbox-choice" data-selected={configuration.maintenance} htmlFor="config-maintenance"><Checkbox id="config-maintenance" checked={configuration.maintenance} disabled={disabled} onCheckedChange={checked => change({ maintenance: checked === true })} /><span className="configurator-choice-copy"><strong>Suivi technique mensuel</strong><span>Après la mise en ligne.</span></span><span className="configurator-option-price">{addon('maintenance-monthly', true)}</span></label><OptionDetails title="Ce que couvre le suivi"><p>Le périmètre des mises à jour et des vérifications est précisé avant la commande. Les nouvelles fonctions sont étudiées séparément.</p></OptionDetails></fieldset>

            <div className="configurator-project-space"><Check size={18} aria-hidden="true" /><div><h2>Espace client inclus</h2><p>Déposez vos textes, vos photos et votre logo. Retrouvez vos échanges et vos validations.</p></div></div>
            <OptionDetails title="Voir le détail de ma configuration"><ul className="configurator-line-items">{quote.lines.map(line => <li key={line.key}><span>{line.label}</span><strong>{line.included ? 'Inclus' : `${formatMoney(line.amountCents, quote.currency)}${line.billing === 'monthly' ? ' / mois' : ''}`}</strong></li>)}</ul></OptionDetails>
          </>}
          {error ? <p className="field-error configurator-error" role="alert">{error}</p> : null}{pricingError ? <p className="field-help configurator-error" role="status">{pricingError}</p> : null}
        </div>
      </div>
    </div>
    <div className="configurator-summary"><div className="container configurator-summary-inner"><div className="configurator-summary-product"><strong>Site {offer.title}</strong>{!custom && selectedOptionCount > 0 ? <span>{selectedOptionCount} option{selectedOptionCount > 1 ? 's' : ''} choisie{selectedOptionCount > 1 ? 's' : ''}</span> : null}</div><div className="configurator-summary-prices" aria-live="polite"><div className="configurator-total"><span>{custom ? 'Votre projet' : 'Création du site'}</span><strong>{quote.requiresQuote ? 'Sur devis' : formatMoney(quote.totalCents, quote.currency)}</strong></div>{!custom && configuration.maintenance ? <div className="configurator-monthly"><span>Maintenance</span><strong>{formatMoney(quote.monthlyTotalCents, quote.currency)}<span> / mois</span></strong></div> : null}</div><Button size="lg" onClick={() => void save()} disabled={disabled || authLoading}>{saving ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}{custom ? 'Décrire mon projet' : editingId ? 'Enregistrer mes modifications' : 'Enregistrer mon projet'}<ArrowRight size={18} aria-hidden="true" /></Button></div></div>
  </section>
}
