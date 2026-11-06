import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, ChevronUp, Download, FileText, FolderOpen, LoaderCircle, MessageSquare, Plus, RefreshCw, Save, Send, Settings2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { api, errorMessage } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useProject, type Project } from '../../lib/project'
import { formatMoney, formatQuoteTotal, formatQuoteLine, quoteEstimateNotice, getOffer, offers, optionDefinitions, type Configuration, type Pricing, type Quote } from '../../../shared/catalog'
import './orders.css'

type Billing = { fullName: string; company: string; email: string; address: string; postalCode: string; city: string; country: string; vatNumber: string }
type Order = { id: string; projectId: string; status: string; snapshot: { projectName: string; configuration: Configuration; quote: Quote }; billing: Billing; totalCents: number | null; monthlyTotalCents: number | null; currency: string; createdAt: string; updatedAt: string }
type OrderState = { order: Order | null; quote: Quote; isCurrent: boolean; payment: { enabled: boolean; reason: string } }
type StudioFile = { id: string; originalName: string; mime: string; size: number; category: string; previewUrl: string | null; downloadUrl: string }
type StudioMessage = { id: string; body: string; author: { id: string; name: string; role: string }; createdAt: string; attachments: StudioFile[]; unavailableAttachments: number }
type StudioPreview = { id: string; title: string; version: number; status: string; url: string | null; file: StudioFile | null; isLatest: boolean; approvals: { name: string; createdAt: string }[]; feedback: { id: string; body: string; author: { name: string }; createdAt: string }[] }
type AdminProject = Project & { customer: { name: string; email: string } }
type ProjectDetail = OrderState & { project: Project; customer: { name: string; email: string }; contents: { pageKey: string; title: string; data: Record<string, string> }[]; files: StudioFile[]; orders: Order[] }
type Inquiry = { id: string; name: string; email: string; subject: string; message: string; createdAt: string; status: 'new' | 'reviewed' }
type InquiryDetail = Omit<Inquiry, 'status'> & {
  schemaVersion: 2 | null
  requestType: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  company: string | null
  brief: Record<string, string | string[]> | null
  sections: { title: string; items: { label: string; value: string; url?: string }[] }[]
  configuration: Configuration | null
  quote: Quote | null
  files: { id: string; originalName: string; mime: string; size: number; width: number; height: number; previewUrl: string; downloadUrl: string }[]
  notification: { status: string; attempts: number; updatedAt: string } | null
}

const blankBilling: Billing = { fullName: '', company: '', email: '', address: '', postalCode: '', city: '', country: 'FR', vatNumber: '' }
const countryNames: Record<string, string> = { FR: 'France', CH: 'Suisse', BE: 'Belgique', LU: 'Luxembourg', DE: 'Allemagne', AT: 'Autriche', ES: 'Espagne', IT: 'Italie', PT: 'Portugal', NL: 'Pays-Bas', IE: 'Irlande', GB: 'Royaume-Uni', CA: 'Canada', US: 'États-Unis', MX: 'Mexique', MA: 'Maroc', TN: 'Tunisie', DZ: 'Algérie', SN: 'Sénégal', CI: 'Côte d’Ivoire', RE: 'La Réunion' }
const date = (value: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const statusLabel = (status: string) => ({ draft: 'En préparation', review: 'À valider', approved: 'Validé', superseded: 'Version précédente', paid: 'Réglé' }[status] ?? status)

function QuoteSummary({ quote, title = 'Votre sélection' }: { quote: Quote; title?: string }) {
  const monthly = quote.lines.filter(line => line.billing === 'monthly')
  const once = quote.lines.filter(line => line.billing !== 'monthly')
  return <section className="order-summary panel" aria-label={title}>
    <h2>{title}</h2>
    <dl className="order-lines">{once.map(line => <div key={line.key}><dt>{line.label}</dt><dd>{line.included ? 'Inclus' : formatQuoteLine(line, quote.currency)}</dd></div>)}</dl>
    <div className="order-total"><span>{quote.estimated ? 'Estimation de création' : 'Total création'}</span><strong>{formatQuoteTotal(quote)}</strong></div>
    {quote.estimated && <p className="order-small">{quoteEstimateNotice(quote)}</p>}
    {quote.totalCents === null && <p className="order-small">Le prix sera précisé avant tout engagement.</p>}
    {monthly.length > 0 && <div className="order-monthly"><p className="order-monthly-heading">Après la mise en ligne</p><dl className="order-lines">{monthly.map(line => <div key={line.key}><dt>{line.label}</dt><dd>{formatQuoteLine(line, quote.currency)}<span> / mois</span></dd></div>)}</dl><p className="order-small">Le suivi mensuel est séparé du prix de création.</p></div>}
  </section>
}

function OrderEditor({ projectId, portal = false }: { projectId: string; portal?: boolean }) {
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [state, setState] = useState<OrderState | null>(null)
  const [billing, setBilling] = useState<Billing>({ ...blankBilling, fullName: user?.name ?? '', email: user?.email ?? '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    let active = true
    setLoading(true); setError(''); setSaved(false); setProject(null); setState(null)
    Promise.all([api<{ project: Project }>(`/api/projects/${projectId}`), api<OrderState>(`/api/projects/${projectId}/order`)])
      .then(([details, result]) => { if (!active) return; setProject(details.project); setState(result); setBilling(result.order?.billing ?? { ...blankBilling, fullName: user?.name ?? '', email: user?.email ?? '' }) })
      .catch(e => { if (active) setError(errorMessage(e)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [projectId, user?.id])
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setSaved(false)
    try { setState(await api<OrderState>(`/api/projects/${projectId}/order`, { method: 'PUT', body: { billing } })); setSaved(true) }
    catch (e) { setError(errorMessage(e)) } finally { setSaving(false) }
  }
  function update(key: keyof Billing, value: string) { setBilling(current => ({ ...current, [key]: value })); setSaved(false) }
  if (loading) return <div className="loading-state" role="status"><LoaderCircle className="spin" size={22} /> Chargement de votre dossier…</div>
  if (!project || !state) return <div className="empty-state"><FileText size={28} /><h2>Votre dossier n’a pas pu être ouvert.</h2><p role="alert">{error || 'Retrouvez vos projets depuis votre espace.'}</p><Button asChild><Link to="/espace">Mon espace</Link></Button></div>
  return <>
    <div className="order-page-heading">
      {!portal && <Link className="order-back" to={`/configurateur?projet=${projectId}`}><ArrowLeft size={16} /> Modifier mon site</Link>}
      <p className="eyebrow">{project.name}</p><h1 className={portal ? 'portal-heading' : 'page-heading'}>{portal ? 'Mon dossier' : 'Votre projet prend forme.'}</h1>
      <p className="page-subtitle">Retrouvez votre sélection et enregistrez vos coordonnées.</p>
    </div>
    {state.order && !state.isCurrent && <div className="order-notice"><Settings2 size={18} /><p>Votre sélection a changé depuis le dernier enregistrement. Enregistrez le dossier pour le mettre à jour.</p></div>}
    <div className="order-grid">
      <form className="order-billing panel" onSubmit={save}>
        <div className="order-section-heading"><span className="order-step">1</span><h2>Vos coordonnées</h2></div>
        <p className="order-small">Ces informations restent dans votre dossier. Aucun paiement n’est demandé.</p>
        <div className="form-grid">
          <div className="field"><Label htmlFor="billing-name">Nom complet</Label><Input id="billing-name" autoComplete="name" maxLength={120} required value={billing.fullName} onChange={e => update('fullName', e.target.value)} /></div>
          <div className="field"><Label htmlFor="billing-company">Entreprise <span className="order-optional">(facultatif)</span></Label><Input id="billing-company" autoComplete="organization" maxLength={160} value={billing.company} onChange={e => update('company', e.target.value)} /></div>
          <div className="field order-span"><Label htmlFor="billing-email">E-mail</Label><Input id="billing-email" type="email" autoComplete="email" maxLength={254} required value={billing.email} onChange={e => update('email', e.target.value)} /></div>
          <div className="field order-span"><Label htmlFor="billing-address">Adresse</Label><Input id="billing-address" autoComplete="street-address" maxLength={240} required value={billing.address} onChange={e => update('address', e.target.value)} /></div>
          <div className="field"><Label htmlFor="billing-postal">Code postal</Label><Input id="billing-postal" autoComplete="postal-code" maxLength={20} required value={billing.postalCode} onChange={e => update('postalCode', e.target.value)} /></div>
          <div className="field"><Label htmlFor="billing-city">Ville</Label><Input id="billing-city" autoComplete="address-level2" maxLength={120} required value={billing.city} onChange={e => update('city', e.target.value)} /></div>
          <div className="field"><Label htmlFor="billing-country">Pays</Label><select className="input" id="billing-country" autoComplete="country" required value={billing.country} onChange={e => update('country', e.target.value)}>{Object.entries(countryNames).map(([code, label]) => <option key={code} value={code}>{label}</option>)}{!countryNames[billing.country] && <option value={billing.country}>{billing.country}</option>}</select></div>
          <div className="field"><Label htmlFor="billing-vat">N° de TVA <span className="order-optional">(facultatif)</span></Label><Input id="billing-vat" maxLength={40} value={billing.vatNumber} onChange={e => update('vatNumber', e.target.value)} /></div>
        </div>
        {error && <p role="alert" className="field-error">{error}</p>}
        {saved && <p role="status" className="field-success order-feedback"><Check size={18} />Votre dossier est enregistré.</p>}
        <div className="order-save-row"><Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}{saving ? 'Enregistrement…' : 'Enregistrer le dossier'}</Button>{state.order && <span className="order-small">Dernier enregistrement : {date(state.order.updatedAt)}</span>}</div>
      </form>
      <aside className="order-aside"><QuoteSummary quote={state.quote} /><div className="order-next surface"><div className="order-section-heading"><span className="order-step">2</span><h2>Et ensuite ?</h2></div><p>Préparez vos textes, vos photos et votre logo depuis votre espace. Vous pourrez échanger avec nous et retrouver vos maquettes au même endroit.</p><Button asChild variant="outline"><Link to="/espace/contenus">Préparer mes contenus <ArrowRight size={17} /></Link></Button><p className="order-small">{state.payment.reason}</p></div></aside>
    </div>
  </>
}

export function CheckoutPage() {
  const { projectId } = useParams()
  return <section className="container page-section order-checkout">{projectId ? <OrderEditor key={projectId} projectId={projectId} /> : <p role="alert">Choisissez d’abord votre projet.</p>}</section>
}
export function PortalOrderPage() {
  const { project, loading, error } = useProject()
  if (loading) return <div className="loading-state" role="status">Chargement de votre projet…</div>
  return project ? <OrderEditor key={project.id} projectId={project.id} portal /> : <div className="empty-state"><FileText size={32} /><h1>Votre dossier commence ici.</h1><p>{error || 'Choisissez un forfait pour préparer votre site.'}</p><Button asChild><Link to="/configurateur">Choisir mon site <ArrowRight size={17} /></Link></Button></div>
}

function AdminProjectDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<ProjectDetail | null>(null)
  const [messages, setMessages] = useState<StudioMessage[]>([])
  const [previews, setPreviews] = useState<StudioPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [body, setBody] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [fileId, setFileId] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    setLoading(true); setDetail(null); setError(''); setSuccess(''); setBody(''); setTitle(''); setUrl(''); setFileId('')
    Promise.all([api<ProjectDetail>(`/api/admin/projects/${id}`), api<{ messages: StudioMessage[] }>(`/api/projects/${id}/messages`), api<{ previews: StudioPreview[] }>(`/api/projects/${id}/previews`)])
      .then(([details, conversation, versions]) => { if (active) { setDetail(details); setMessages(conversation.messages); setPreviews(versions.previews) } })
      .catch(e => { if (active) setError(errorMessage(e)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])
  async function sendMessage(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('')
    try { const result = await api<{ message: StudioMessage }>(`/api/projects/${id}/messages`, { method: 'POST', body: { body } }); setMessages(list => [...list, result.message]); setBody(''); setSuccess('Le message est disponible dans l’espace du client.') }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  async function publish(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('')
    try { await api(`/api/projects/${id}/previews`, { method: 'POST', body: { title, ...(fileId ? { fileId } : { url }) } }); const [result, updated] = await Promise.all([api<{ previews: StudioPreview[] }>(`/api/projects/${id}/previews`), api<ProjectDetail>(`/api/admin/projects/${id}`)]); setPreviews(result.previews); setDetail(updated); setTitle(''); setUrl(''); setFileId(''); setSuccess('La nouvelle version est disponible dans l’espace du client.') }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  async function uploadPreview(file: File | undefined) {
    if (!file) return
    setBusy(true); setError(''); setSuccess('')
    try { const form = new FormData(); form.append('files', file); form.append('category', 'document'); const result = await api<{ files: StudioFile[] }>(`/api/projects/${id}/files`, { method: 'POST', body: form }); const added = result.files[0]; setDetail(current => current ? { ...current, files: [...result.files, ...current.files] } : current); setFileId(added.id); setUrl(''); if (!title) setTitle(file.name.replace(/\.[^.]+$/, '')); setSuccess('Le fichier est ajouté au projet. Publiez la version pour demander sa validation.') }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  async function refreshDetail() {
    setBusy(true); setError(''); setSuccess('')
    try { const [details, conversation, versions] = await Promise.all([api<ProjectDetail>(`/api/admin/projects/${id}`), api<{ messages: StudioMessage[] }>(`/api/projects/${id}/messages`), api<{ previews: StudioPreview[] }>(`/api/projects/${id}/previews`)]); setDetail(details); setMessages(conversation.messages); setPreviews(versions.previews); setSuccess('Le projet est à jour.') }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  if (loading) return <div className="loading-state" role="status">Ouverture du projet…</div>
  if (!detail) return <p className="field-error" role="alert">{error || 'Ce projet est introuvable.'}</p>
  return <div className="admin-project-detail stack">
    <header className="admin-detail-heading"><div><p className="eyebrow">{getOffer(detail.project.offerId)?.title}</p><h2>{detail.project.name}</h2><p>{detail.customer.name} · <a href={`mailto:${detail.customer.email}`}>{detail.customer.email}</a></p></div><div className="cluster"><span className="badge badge--outline">{statusLabel(detail.project.status)}</span><Button size="sm" variant="outline" disabled={busy} onClick={() => void refreshDetail()}><RefreshCw size={15} />Actualiser</Button></div></header>
    {error && <p className="field-error" role="alert">{error}</p>}{success && <p className="field-success" role="status">{success}</p>}
    <Tabs defaultValue="contenus"><TabsList aria-label="Détail du projet"><TabsTrigger value="contenus">Contenus</TabsTrigger><TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger><TabsTrigger value="maquettes">Maquettes ({previews.length})</TabsTrigger><TabsTrigger value="dossier">Dossier</TabsTrigger></TabsList>
      <TabsContent value="contenus"><div className="stack"><section className="admin-content-block"><h3>Activité</h3>{Object.keys(detail.project.activity).length ? <dl className="admin-record">{Object.entries(detail.project.activity).map(([key, value]) => <div key={key}><dt>{activityLabels[key] ?? key}</dt><dd>{value || 'Non renseigné'}</dd></div>)}</dl> : <p className="order-small">Le client n’a pas encore renseigné son activité.</p>}</section>
        <section className="admin-content-block"><h3>Textes</h3>{detail.contents.map(content => <details key={content.pageKey} className="admin-content-page"><summary>{content.title}<ChevronRight size={17} /></summary>{Object.keys(content.data).length ? <dl className="admin-record">{Object.entries(content.data).map(([key, value]) => <div key={key}><dt>{contentLabels[key] ?? key}</dt><dd>{value || 'Non renseigné'}</dd></div>)}</dl> : <p className="order-small">Aucun texte ajouté.</p>}</details>)}</section>
        <section className="admin-content-block"><h3>Fichiers ({detail.files.length})</h3>{detail.files.length ? <div className="admin-file-list">{detail.files.map(file => <div key={file.id}>{file.previewUrl ? <img src={file.previewUrl} alt="" loading="lazy" /> : <FileText size={24} />}<span>{file.originalName}<small>{(file.size / 1024).toFixed(0)} Ko</small></span><a className="button button--ghost button--sm" href={file.downloadUrl} download aria-label={`Télécharger ${file.originalName}`}><Download size={18} /></a></div>)}</div> : <p className="order-small">Aucun fichier ajouté.</p>}</section>
      </div></TabsContent>
      <TabsContent value="messages"><div className="admin-messages">{messages.length ? messages.map(message => <article key={message.id} className={message.author.role === 'admin' ? 'admin-message admin-message--studio' : 'admin-message'}><header><strong>{message.author.name}</strong><time dateTime={message.createdAt}>{date(message.createdAt)}</time></header><p>{message.body}</p>{message.attachments?.map(file => <a className="admin-message-attachment" href={file.downloadUrl} key={file.id} download><Download size={15} />{file.originalName}</a>)}{!!message.unavailableAttachments && <small className="order-small">Une pièce jointe a été retirée.</small>}</article>) : <p className="order-small">Aucun échange pour le moment.</p>}</div><form className="stack" onSubmit={sendMessage}><div className="field"><Label htmlFor="admin-reply">Répondre au client</Label><Textarea id="admin-reply" required maxLength={10000} rows={4} value={body} onChange={e => setBody(e.target.value)} placeholder="Votre message…" /></div><div><Button type="submit" disabled={busy || !body.trim()}><Send size={17} />{busy ? 'Enregistrement…' : 'Envoyer dans son espace'}</Button></div><p className="order-small">Le message est enregistré dans le projet. Aucun e-mail externe n’est envoyé.</p></form></TabsContent>
      <TabsContent value="maquettes"><div className="stack">{previews.length ? previews.map(preview => <article className="admin-preview panel" key={preview.id}><header><div><p className="eyebrow">Version {preview.version}{preview.isLatest ? ' · Actuelle' : ''}</p><h3>{preview.title}</h3></div><span className="badge badge--outline">{statusLabel(preview.status)}</span></header>{preview.file?.previewUrl && <img src={preview.file.previewUrl} alt={preview.title} />}{(preview.url || preview.file?.downloadUrl) && <a className="button button--outline button--sm" href={preview.url || preview.file!.downloadUrl} target="_blank" rel="noreferrer">Ouvrir la version <ArrowRight size={15} /></a>}{preview.approvals.map(approval => <p className="field-success" key={approval.createdAt}>Validée par {approval.name} le {date(approval.createdAt)}</p>)}{preview.feedback.map(feedback => <blockquote key={feedback.id}><strong>{feedback.author.name}</strong><p>{feedback.body}</p></blockquote>)}</article>) : <p className="order-small">Aucune maquette publiée.</p>}
        <form className="admin-content-block stack" onSubmit={publish}><h3>Publier une version</h3><div className="field"><Label htmlFor="preview-title">Titre</Label><Input id="preview-title" required maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder="Accueil et présentation" /></div><div className="field"><Label htmlFor="preview-url">Lien de prévisualisation</Label><Input id="preview-url" type="url" required={!fileId} disabled={!!fileId} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" /><p className="field-help">Un lien HTTPS public, ou un fichier du projet ci-dessous.</p></div><div className="field"><Label htmlFor="preview-file">Fichier du projet</Label><select id="preview-file" className="input" value={fileId} onChange={e => { setFileId(e.target.value); if (e.target.value) setUrl('') }}><option value="">Utiliser le lien ci-dessus</option>{detail.files.map(file => <option value={file.id} key={file.id}>{file.originalName}</option>)}</select></div><div className="field"><Label htmlFor="preview-upload">Ajouter une image ou un PDF</Label><Input id="preview-upload" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" disabled={busy} onChange={e => { void uploadPreview(e.target.files?.[0]); e.target.value = '' }} /><p className="field-help">10 Mo maximum. Le fichier reste privé dans le projet.</p></div><div><Button type="submit" disabled={busy || !title.trim() || (!url.trim() && !fileId)}><Plus size={17} />Publier la version</Button></div><p className="order-small">La version précédente reste conservée. Seul le client peut valider son site.</p></form>
      </div></TabsContent>
      <TabsContent value="dossier"><div className="admin-dossier-grid"><QuoteSummary quote={detail.quote} /><div className="admin-content-block"><h3>Coordonnées enregistrées</h3>{detail.order ? <><dl className="admin-record">{Object.entries(detail.order.billing).filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{billingLabels[key] ?? key}</dt><dd>{value}</dd></div>)}</dl><p className="order-small">Dossier du {date(detail.order.updatedAt)} · {statusLabel(detail.order.status)}</p></> : <p className="order-small">Le client n’a pas encore enregistré de dossier.</p>}<p className="order-small">Paiements désactivés. Un dossier enregistré ne confirme aucun achat.</p></div></div>{detail.orders.length > 1 && <details className="admin-content-page"><summary>Historique des dossiers<ChevronRight size={17} /></summary>{detail.orders.map(order => <div className="admin-order-history" key={order.id}><span>{date(order.createdAt)}</span><span>{order.snapshot.quote.lines.find(line => line.key === 'base')?.label ?? getOffer(order.snapshot.configuration.offerId)?.title}</span><span>{`${formatQuoteTotal({ ...order.snapshot.quote, totalCents: order.totalCents, currency: order.currency })} à la création`}{(order.snapshot.quote.lines.some(line => line.billing === 'monthly') || order.snapshot.configuration.maintenance) && <small>{order.monthlyTotalCents === null ? 'Suivi mensuel à préciser' : formatMoney(order.monthlyTotalCents, order.currency)} / mois</small>}</span><span>{statusLabel(order.status)}</span></div>)}</details>}</TabsContent>
    </Tabs>
  </div>
}

const activityLabels: Record<string, string> = { companyName: 'Entreprise', name: 'Nom', description: 'Présentation', activity: 'Activité', industry: 'Activité', email: 'E-mail', contactEmail: 'E-mail de contact', phone: 'Téléphone', address: 'Adresse', audience: 'Public', goal: 'Objectif', inspiration: 'Inspirations', website: 'Site actuel', socialLinks: 'Réseaux sociaux', sector: 'Secteur' }
const contentLabels: Record<string, string> = { heading: 'Titre principal', body: 'Texte', title: 'Titre', subtitle: 'Sous-titre', services: 'Services', cta: 'Bouton', ctaLabel: 'Bouton', ctaUrl: 'Lien du bouton', introduction: 'Introduction', description: 'Description' }
const billingLabels: Record<string, string> = { fullName: 'Nom', company: 'Entreprise', email: 'E-mail', address: 'Adresse', postalCode: 'Code postal', city: 'Ville', country: 'Pays', vatNumber: 'N° de TVA' }

function AdminPricing() {
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [currency, setCurrency] = useState('EUR')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  function load(value: Pricing) { setPricing(value); setCurrency(value.currency); setAmounts(Object.fromEntries([...Object.entries(value.base), ...Object.entries(value.options)].map(([key, amount]) => [key, amount === null ? '' : String(amount / 100)]))) }
  useEffect(() => { let active = true; api<{ pricing: Pricing }>('/api/admin/pricing').then(result => { if (active) load(result.pricing) }).catch(e => { if (active) setError(errorMessage(e)) }); return () => { active = false } }, [])
  async function save(event: FormEvent) {
    event.preventDefault(); setError(''); setSaved(false); setBusy(true)
    try {
      const money = (key: string) => { const text = amounts[key]?.trim() ?? ''; if (!text) return null; if (!/^\d+(?:[.,]\d{1,2})?$/.test(text)) throw new Error('Utilisez des montants positifs avec deux décimales maximum.'); const value = Math.round(Number(text.replace(',', '.')) * 100); if (!Number.isSafeInteger(value) || value > 1_000_000_000) throw new Error('Ce montant est trop élevé.'); return value }
      const result = await api<{ pricing: Pricing }>('/api/admin/pricing', { method: 'PUT', body: { currency, base: Object.fromEntries(offers.map(offer => [offer.id, offer.id === 'sur-mesure' ? null : money(offer.id)])), options: Object.fromEntries(optionDefinitions.map(option => [option.id, money(option.id)])) } }); load(result.pricing); setSaved(true)
    } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <form className="admin-pricing panel stack" onSubmit={save}><div><h2>Tarifs des forfaits</h2><p className="order-small">Ces montants alimentent le site et le configurateur. Un champ vide reste « À préciser ». Les anciens dossiers conservent leurs montants enregistrés.</p></div><div className="order-notice"><Settings2 size={18} /><p>Les paiements restent désactivés. La devise, la fiscalité et les conditions commerciales devront être validées avant l’ouverture des commandes.</p></div>{!pricing && !error ? <p role="status">Chargement des tarifs…</p> : <><div className="field admin-currency"><Label htmlFor="pricing-currency">Devise</Label><select id="pricing-currency" className="input" value={currency} onChange={e => { setCurrency(e.target.value); setSaved(false) }}><option value="EUR">Euro (EUR)</option><option value="CHF">Franc suisse (CHF)</option></select></div><div className="admin-price-fields">{[...offers.filter(offer => offer.id !== 'sur-mesure').map(offer => ({ id: offer.id, title: offer.title, billing: 'once' as const })), ...optionDefinitions].map(item => <div className="field" key={item.id}><Label htmlFor={`price-${item.id}`}>{item.title}{item.billing === 'monthly' ? ' — par mois' : ''}</Label><div className={item.billing === 'monthly' ? 'admin-money-field admin-money-field--monthly' : 'admin-money-field'}><Input id={`price-${item.id}`} inputMode="decimal" value={amounts[item.id] ?? ''} onChange={e => { setAmounts(values => ({ ...values, [item.id]: e.target.value })); setSaved(false) }} placeholder="À préciser" /><span>{currency === 'EUR' ? '€' : 'CHF'}{item.billing === 'monthly' ? ' / mois' : ''}</span></div></div>)}</div><p className="order-small">Sur mesure : toujours sur devis. Les capacités incluses dans un forfait ne sont jamais ajoutées deux fois. La mise en ligne est ponctuelle ; la maintenance est mensuelle.</p><div><Button type="submit" disabled={busy || !pricing}><Save size={17} />{busy ? 'Enregistrement…' : 'Enregistrer les tarifs'}</Button></div></>}{error && <p role="alert" className="field-error">{error}</p>}{saved && <p role="status" className="field-success">Les tarifs sont enregistrés.</p>}</form>
}

function InquiryDetails({ id, showHeading = false }: { id: string; showHeading?: boolean }) {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setInquiry(null)
    api<{ inquiry: InquiryDetail }>(`/api/admin/inquiries/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setInquiry(result.inquiry) })
      .catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, attempt])
  if (loading) return <div className="admin-inquiry-details" role="status"><p className="admin-inquiry-loading"><LoaderCircle size={18} className="spin" aria-hidden="true" />Chargement du dossier…</p></div>
  if (!inquiry) return <div className="admin-inquiry-details"><p role="alert" className="field-error">{error || 'Le dossier n’a pas pu être chargé.'}</p><Button variant="outline" size="sm" onClick={() => setAttempt(value => value + 1)}><RefreshCw size={15} aria-hidden="true" />Réessayer</Button></div>
  const notificationLabel = inquiry.notification ? ({
    pending: 'En attente d’envoi', processing: 'En cours d’envoi', retry: 'Nouvelle tentative prévue',
    accepted: 'Acceptée par le service d’e-mail', unavailable: 'Envoi indisponible',
    failed: 'Échec d’envoi', expired: 'Délai de nouvelle tentative écoulé',
  }[inquiry.notification.status] ?? inquiry.notification.status) : null
  return <div className="admin-inquiry-details">
    {showHeading && <header><h2>{inquiry.subject}</h2><p className="order-small">{inquiry.name} · {date(inquiry.createdAt)}</p></header>}
    <section className="admin-inquiry-section" aria-label="Coordonnées">
      <h3>Coordonnées</h3>
      <dl className="admin-record">
        {inquiry.schemaVersion === 2 && inquiry.firstName && inquiry.lastName ? <><div><dt>Prénom</dt><dd>{inquiry.firstName}</dd></div><div><dt>Nom</dt><dd>{inquiry.lastName}</dd></div></> : <div><dt>Nom complet</dt><dd>{inquiry.name}</dd></div>}
        <div><dt>E-mail</dt><dd><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></dd></div>
        {inquiry.phone && <div><dt>Téléphone</dt><dd><a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a></dd></div>}
        {inquiry.company && <div><dt>Entreprise</dt><dd>{inquiry.company}</dd></div>}
      </dl>
    </section>
    {inquiry.schemaVersion === 2 && inquiry.sections.length ? inquiry.sections.map((section, index) => (
      <section className="admin-inquiry-section" key={`${section.title}-${index}`}>
        <h3>{section.title}</h3>
        <dl className="admin-inquiry-answers">
          {section.items.map((item, itemIndex) => (
            <div key={`${item.label}-${itemIndex}`}>
              <dt>{item.label}</dt>
              <dd>{item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Ouvrir les fichiers ({new URL(item.url).hostname}, nouvel onglet)
                </a>
              ) : item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    )) : <section className="admin-inquiry-section"><h3>Message reçu</h3><p className="admin-inquiry-original">{inquiry.message}</p></section>}
    {(inquiry.configuration || inquiry.quote) && <section className="admin-inquiry-section" aria-label="Sélection enregistrée">
      <h3>Sélection enregistrée</h3>
      {inquiry.configuration && <dl className="admin-record"><div><dt>Forfait</dt><dd>{inquiry.quote?.lines.find(line => line.key === 'base')?.label ?? getOffer(inquiry.configuration.offerId)?.title ?? inquiry.configuration.offerId}</dd></div><div><dt>Langues</dt><dd>{inquiry.configuration.language === 'fr-en' ? 'Français et anglais' : 'Français'}{inquiry.configuration.extras?.includes('additional-language') ? ' + langue supplémentaire à préciser' : null}</dd></div></dl>}
      {inquiry.quote && <QuoteSummary quote={inquiry.quote} title="Récapitulatif reçu" />}
      <p className="order-small">Configuration et montants enregistrés à la réception de la demande.</p>
    </section>}
    {inquiry.files.length > 0 && <section className="admin-inquiry-section" aria-label="Images jointes">
      <h3>Images jointes <span className="order-small">({inquiry.files.length})</span></h3>
      <ul className="admin-inquiry-images">{inquiry.files.map(file => <li key={file.id}>
        <a className="admin-inquiry-thumbnail" href={file.previewUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir l’image ${file.originalName} dans un nouvel onglet`}><img src={file.previewUrl} alt="" width={file.width} height={file.height} loading="lazy" decoding="async" /></a>
        <div className="admin-inquiry-image-info"><strong>{file.originalName}</strong><span>{file.width} × {file.height} px · {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(file.size / 1024)} Kio</span><Button variant="outline" size="sm" asChild><a href={file.downloadUrl} aria-label={`Télécharger ${file.originalName}`}><Download size={15} aria-hidden="true" />Télécharger</a></Button></div>
      </li>)}</ul>
    </section>}
    {inquiry.notification && <p className="order-small admin-inquiry-notification">Notification au studio : {notificationLabel}.<br />{inquiry.notification.attempts} tentative{inquiry.notification.attempts > 1 ? 's' : ''} · Mise à jour le {date(inquiry.notification.updatedAt)}</p>}
  </div>
}

function AdminInquiries() {
  const [params, setParams] = useSearchParams()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const expandedId = params.get('demande')
  const hasExpandedInquiry = inquiries.some(inquiry => inquiry.id === expandedId)
  useEffect(() => { let active = true; api<{ inquiries: Inquiry[] }>('/api/admin/inquiries').then(result => { if (active) setInquiries(result.inquiries) }).catch(e => { if (active) setError(errorMessage(e)) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  useEffect(() => {
    if (!loading && expandedId && hasExpandedInquiry) document.getElementById(`inquiry-${expandedId}`)?.scrollIntoView({ block: 'start' })
  }, [loading, expandedId, hasExpandedInquiry])
  function toggle(id: string) {
    const next = new URLSearchParams(params)
    if (id === expandedId) next.delete('demande')
    else { next.set('onglet', 'demandes'); next.set('demande', id) }
    setParams(next)
  }
  async function change(inquiry: Inquiry) {
    const status = inquiry.status === 'reviewed' ? 'new' : 'reviewed'; setBusy(inquiry.id); setError('')
    try { await api(`/api/admin/inquiries/${inquiry.id}`, { method: 'PATCH', body: { status } }); setInquiries(list => list.map(item => item.id === inquiry.id ? { ...item, status } : item)) }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(null) }
  }
  return <div className="stack">
    {error && <p role="alert" className="field-error">{error}</p>}
    {!loading && !error && expandedId && !hasExpandedInquiry && <article className="admin-inquiry panel"><Button variant="outline" size="sm" onClick={() => toggle(expandedId)}>Revenir à la liste</Button><InquiryDetails key={expandedId} id={expandedId} showHeading /></article>}
    {loading ? <p role="status">Chargement des demandes…</p> : inquiries.length ? inquiries.map(inquiry => {
      const expanded = expandedId === inquiry.id
      return <article className="admin-inquiry panel" id={`inquiry-${inquiry.id}`} key={inquiry.id}>
        <header><div><span className="eyebrow">{inquiry.name} · {date(inquiry.createdAt)}</span><h2>{inquiry.subject}</h2></div><span className="badge badge--outline">{inquiry.status === 'reviewed' ? 'Traitée' : 'Nouvelle'}</span></header>
        {!expanded && <p className="admin-inquiry-message">{inquiry.message}</p>}
        <div className="cluster admin-inquiry-actions">
          <Button variant="outline" size="sm" aria-expanded={expanded} aria-controls={`inquiry-details-${inquiry.id}`} onClick={() => toggle(inquiry.id)}>{expanded ? 'Réduire le dossier' : 'Voir le dossier'}{expanded ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}</Button>
          <a href={`mailto:${inquiry.email}`} className="button button--outline button--sm">Ouvrir mon e-mail <ArrowRight size={15} /></a>
          <Button variant="ghost" size="sm" disabled={busy === inquiry.id} onClick={() => void change(inquiry)}>{inquiry.status === 'reviewed' ? 'Remettre à traiter' : 'Marquer comme traitée'}</Button>
        </div>
        <p className="order-small">{inquiry.email}</p>
        {expanded && <div id={`inquiry-details-${inquiry.id}`}><InquiryDetails id={inquiry.id} /></div>}
      </article>
    }) : <div className="empty-state"><MessageSquare size={28} /><h2>Aucune demande pour le moment.</h2><p>Les messages du formulaire de contact apparaîtront ici.</p></div>}
  </div>
}

export function AdminPage() {
  const [params, setParams] = useSearchParams()
  const selected = params.get('projet')
  const tab = ['projets', 'demandes', 'tarifs'].includes(params.get('onglet') ?? '') ? params.get('onglet')! : 'projets'
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { let active = true; api<{ projects: AdminProject[] }>('/api/admin/projects').then(result => { if (active) setProjects(result.projects) }).catch(e => { if (active) setError(errorMessage(e)) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  function select(id: string | null) { const next = new URLSearchParams(params); if (id) next.set('projet', id); else next.delete('projet'); setParams(next) }
  const matching = projects.filter(project => [project.name, project.customer.name, project.customer.email].join(' ').toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')))
  return <section className="container page-section admin-page"><div className="admin-title"><div><p className="eyebrow">studio · administration</p><h1 className="page-heading">Les projets, simplement.</h1><p className="page-subtitle">Retrouvez les demandes, les contenus et les échanges.</p></div><Button asChild variant="outline"><Link to="/espace">Mon espace <ArrowRight size={17} /></Link></Button></div><Tabs value={tab} onValueChange={value => { const next = new URLSearchParams(params); next.set('onglet', value); setParams(next) }}><TabsList aria-label="Administration"><TabsTrigger value="projets">Projets</TabsTrigger><TabsTrigger value="demandes">Demandes</TabsTrigger><TabsTrigger value="tarifs">Tarifs</TabsTrigger></TabsList><TabsContent value="projets">{error && <p role="alert" className="field-error">{error}</p>}{selected ? <><Button variant="ghost" className="admin-return" onClick={() => select(null)}><ArrowLeft size={17} />Tous les projets</Button><AdminProjectDetail key={selected} id={selected} /></> : <><div className="admin-search field"><Label htmlFor="admin-search">Rechercher un projet ou un client</Label><Input id="admin-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom du projet, nom ou e-mail…" /></div>{loading ? <p role="status">Chargement des projets…</p> : matching.length ? <div className="admin-project-list">{matching.map(project => <button key={project.id} type="button" className="admin-project-row panel" onClick={() => select(project.id)}><FolderOpen size={22} /><span><strong>{project.name}</strong><small>{project.customer.name} · {project.customer.email}</small></span><span className="admin-project-offer">{getOffer(project.offerId)?.title}</span><span className="badge badge--outline">{statusLabel(project.status)}</span><ChevronRight size={18} /></button>)}</div> : <div className="empty-state"><FolderOpen size={28} /><h2>{query ? 'Aucun projet trouvé.' : 'Les premiers projets apparaîtront ici.'}</h2><p>{query ? 'Essayez un autre nom ou e-mail.' : 'Les dossiers restent privés et rattachés à leur client.'}</p></div>}</>}</TabsContent><TabsContent value="demandes"><AdminInquiries /></TabsContent><TabsContent value="tarifs"><AdminPricing /></TabsContent></Tabs></section>
}
