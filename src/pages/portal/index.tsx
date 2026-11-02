import { useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, Download, FileImage, FileText, Loader2, MoreHorizontal, RotateCcw, Trash2, Upload } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { useAuth } from '../../lib/auth'
import { useProject, type Project } from '../../lib/project'
import { api, ApiError, errorMessage } from '../../lib/api'
import { getOffer } from '../../../shared/catalog'
import '../portal.css'

type StoredFile = { id: string; originalName: string; mime: string; size: number; category: string; createdAt: string; deletedAt: string | null; previewUrl: string | null; downloadUrl: string }
type PageContent = { pageKey: string; title: string; data: Record<string, string>; updatedAt: string | null }
type ContentTab = 'activite' | 'textes' | 'fichiers'

function Loading({ label = 'Ouverture de votre projet…' }: { label?: string }) { return <div className="loading-state" role="status"><Loader2 className="spin" size={22} aria-hidden="true" /><span>{label}</span></div> }
function Notice({ children, error = false }: { children?: string | null; error?: boolean }) { if (!children) return null; return <p className={error ? 'field-error portal-notice' : 'portal-notice'} role={error ? 'alert' : 'status'}>{!error ? <Check size={17} aria-hidden="true" /> : null}{children}</p> }
function EmptyProject() { return <section className="portal-empty-project"><p className="eyebrow">Mon projet</p><h1 className="page-heading">Tout commence par votre site.</h1><p className="page-subtitle">Choisissez une forfait et ajoutez les options utiles. Vous retrouverez votre sélection ici.</p><Button asChild><Link to="/configurateur">Composer mon site <ArrowRight size={17} aria-hidden="true" /></Link></Button></section> }
function ProjectError({ error, retry }: { error: string; retry: () => void }) { return <div className="empty-state"><p className="field-error" role="alert">{error}</p><Button variant="outline" onClick={retry}>Réessayer</Button></div> }
function ProjectSelect() {
  const { projects, project, selectProject } = useProject()
  if (projects.length < 2) return null
  return <label className="portal-project-select">Votre projet<select className="input" value={project?.id ?? ''} onChange={event => selectProject(event.target.value)}>{projects.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
}

export function DashboardPage() {
  const { project, loading, error, refresh } = useProject()
  const [content, setContent] = useState<{ files: StoredFile[]; pages: PageContent[] }>({ files: [], pages: [] })
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  useEffect(() => {
    if (!project) return
    const controller = new AbortController()
    setContent({ files: [], pages: [] }); setDetailsLoading(true); setDetailsError('')
    Promise.all([
      api<{ files: StoredFile[] }>(`/api/projects/${project.id}/files`, { signal: controller.signal }),
      api<{ contents: PageContent[] }>(`/api/projects/${project.id}/contents`, { signal: controller.signal }),
    ]).then(([files, pages]) => { if (!controller.signal.aborted) setContent({ files: files.files, pages: pages.contents }) })
      .catch(error => { if (!controller.signal.aborted) setDetailsError(errorMessage(error)) })
      .finally(() => { if (!controller.signal.aborted) setDetailsLoading(false) })
    return () => controller.abort()
  }, [project?.id])
  if (loading) return <Loading />
  if (error) return <ProjectError error={error} retry={() => void refresh()} />
  if (!project) return <EmptyProject />
  const offer = getOffer(project.offerId)
  const activityReady = Boolean(project.activity.companyName?.trim() && project.activity.description?.trim())
  const textsReady = content.pages.some(page => Boolean(page.data.body?.trim() || page.data.services?.trim()))
  const identityReady = content.files.some(file => file.category === 'logo')
  const photosReady = content.files.some(file => file.category === 'photo')
  const allReady = activityReady && textsReady && identityReady && photosReady
  const review = ['review', 'awaiting-review', 'awaiting_review'].includes(project.status)
  const approved = project.status === 'approved'
  const step = ['live', 'completed', 'delivered'].includes(project.status) ? 3 : ['review', 'approved', 'awaiting-review', 'awaiting_review'].includes(project.status) ? 2 : ['in_progress', 'in-progress', 'building', 'creation'].includes(project.status) ? 1 : 0
  const tasks = [
    { name: 'Votre activité', description: activityReady ? 'Les textes de présentation de votre site' : 'Présentez votre entreprise et vos services', ready: activityReady && textsReady, status: !activityReady ? 'À compléter' : textsReady ? 'Enregistré' : 'Textes à ajouter', tab: activityReady ? 'textes' : 'activite' },
    { name: 'Votre identité', description: 'Votre logo pour votre site', ready: identityReady, status: identityReady ? 'Enregistré' : 'À ajouter', tab: 'fichiers' },
    { name: 'Vos photos', description: 'Les images pour votre site, si vous en avez', ready: photosReady, status: photosReady ? 'Enregistré' : 'À ajouter', tab: 'fichiers' },
  ]
  return <section className="portal-dashboard">
    <div className="portal-page-top"><div><p className="eyebrow">Mon projet</p><h1 className="page-heading">Préparons votre site.</h1><p className="page-subtitle">Tout ce dont nous avons besoin, au même endroit.</p></div><ProjectSelect /></div>
    <div className="portal-next-action">
      <div><p className="eyebrow">Prochaine étape</p><h2>{review ? 'Votre maquette est à relire.' : approved ? 'Votre site est validé.' : allReady ? 'Vos contenus sont enregistrés.' : 'Ajoutez vos contenus.'}</h2><p>{review ? 'Découvrez la proposition et partagez vos retours.' : approved ? 'Votre accord est enregistré. Retrouvez la suite du projet dans les messages.' : allReady ? 'Vous pouvez les compléter et nous poser vos questions dans les messages.' : 'Ajoutez vos textes, vos photos et votre logo quand ils sont prêts.'}</p><Button asChild><Link to={review ? '/espace/maquettes' : approved || allReady ? '/espace/messages' : '/espace/contenus'}>{review ? 'Voir la maquette' : approved || allReady ? 'Ouvrir les messages' : 'Ajouter mes contenus'} <ArrowRight size={18} aria-hidden="true" /></Link></Button></div>
    </div>
    <div className="portal-dashboard-grid">
      <div><h2 className="portal-section-title">Vos contenus</h2>{detailsLoading ? <Loading label="Lecture de vos contenus…" /> : detailsError ? <Notice error>{detailsError}</Notice> : <div className="portal-task-list">{tasks.map(task => <Link to={`/espace/contenus?onglet=${task.tab}`} className="portal-task" key={task.name}><div><h3>{task.name}</h3><p>{task.description}</p></div><span className={task.ready ? 'portal-task-status is-complete' : 'portal-task-status'}>{task.ready ? <Check size={14} aria-hidden="true" /> : null}{task.status}</span><ChevronRight size={18} aria-hidden="true" /></Link>)}</div>}</div>
      <aside className="portal-project-summary"><h2 className="portal-section-title">Votre projet</h2><div className="portal-selection"><h3>{offer?.title ?? 'Votre site'}</h3><p>{project.configuration.language === 'fr-en' ? 'Français + anglais' : 'Français'}</p>{project.configuration.managedContent ? <p>Textes et images modifiables après livraison</p> : null}{project.configuration.scene3d ? <p>Élément 3D interactif</p> : null}</div><ol className="portal-timeline" aria-label="Étapes du projet">{['Contenus', 'Création', 'Validation', 'Mise en ligne'].map((label, index) => <li className={index === step ? 'is-current' : index < step ? 'is-done' : ''} key={label} aria-current={index === step ? 'step' : undefined}><span aria-hidden="true">{index < step ? <Check size={12} /> : null}</span>{label}</li>)}</ol><p className="portal-project-help">Une question ?<Link to="/espace/messages">Ouvrir les messages <ArrowRight size={16} aria-hidden="true" /></Link></p></aside>
    </div>
    <Link to="/configurateur?nouveau=1" className="portal-secondary-link">Créer un autre projet <ArrowRight size={16} aria-hidden="true" /></Link>
  </section>
}

function ActivityForm({ project, onSaved }: { project: Project; onSaved: () => void }) {
  const { updateProject } = useProject()
  const [values, setValues] = useState<Record<string, string>>({ companyName: '', industry: '', description: '', contactEmail: '', phone: '', address: '', ...project.activity })
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const update = (key: string, value: string) => setValues(current => ({ ...current, [key]: value }))
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(''); try { await updateProject({ activity: values }); onSaved() } catch (error) { setError(errorMessage(error)) } finally { setBusy(false) } }
  return <form className="portal-activity-form" onSubmit={submit}>
    <div className="form-grid"><div className="field"><Label htmlFor="company-name">Nom de l’entreprise ou du projet</Label><Input id="company-name" value={values.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Votre nom d’entreprise" autoComplete="organization" required maxLength={120} /></div><div className="field"><Label htmlFor="industry">Votre activité</Label><Input id="industry" value={values.industry} onChange={e => update('industry', e.target.value)} placeholder="Par exemple : cuisine, conseil, immobilier…" maxLength={160} /></div></div>
    <div className="field"><Label htmlFor="activity-description">Ce que vous proposez</Label><Textarea id="activity-description" value={values.description} onChange={e => update('description', e.target.value)} placeholder="Décrivez vos services, vos produits et vos clients…" required minLength={10} maxLength={10000} rows={5} /></div>
    <div className="portal-form-section"><h2>Les informations à afficher</h2><div className="form-grid"><div className="field"><Label htmlFor="contact-email">E-mail de contact</Label><Input id="contact-email" type="email" value={values.contactEmail} onChange={e => update('contactEmail', e.target.value)} placeholder="votre@email.fr" autoComplete="email" maxLength={254} /></div><div className="field"><Label htmlFor="contact-phone">Téléphone</Label><Input id="contact-phone" type="tel" value={values.phone} onChange={e => update('phone', e.target.value)} placeholder="Votre numéro de téléphone" autoComplete="tel" maxLength={80} /></div></div><div className="field"><Label htmlFor="contact-address">Adresse ou zone d’intervention</Label><Input id="contact-address" value={values.address} onChange={e => update('address', e.target.value)} placeholder="Votre adresse ou les zones que vous couvrez" autoComplete="street-address" maxLength={400} /></div><p className="portal-field-help">Indiquez les coordonnées que vous souhaitez rendre publiques sur votre site.</p></div>
    <Notice error>{error}</Notice><div className="form-actions"><Button type="submit" disabled={busy}>{busy ? <Loader2 className="spin" size={17} aria-hidden="true" /> : null}Enregistrer et continuer <ArrowRight size={17} aria-hidden="true" /></Button></div>
  </form>
}

function TextEditor({ project, onSaved, onFiles }: { project: Project; onSaved: () => void; onFiles: () => void }) {
  const [pages, setPages] = useState<PageContent[]>([]), [selected, setSelected] = useState('accueil')
  const [data, setData] = useState<Record<string, string>>({ heading: '', body: '', services: '' })
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const [fetchError, setFetchError] = useState(''), [loadAttempt, setLoadAttempt] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false), [newTitle, setNewTitle] = useState(''), [pageError, setPageError] = useState('')
  const [conflict, setConflict] = useState<PageContent | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setFetchError(''); setConflict(null)
    api<{ contents: PageContent[] }>(`/api/projects/${project.id}/contents`, { signal: controller.signal }).then(response => {
      if (controller.signal.aborted) return
      setPages(response.contents)
      const current = response.contents.find(page => page.pageKey === selected)
      setData({ heading: '', body: '', services: '', ...current?.data })
    }).catch(error => { if (!controller.signal.aborted) setFetchError(errorMessage(error)) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [project.id, selected, loadAttempt])
  async function persist(expectedOverride?: string | null) {
    setBusy(true); setError('')
    const page = pages.find(item => item.pageKey === selected)
    try {
      const response = await api<{ content: PageContent }>(`/api/projects/${project.id}/contents/${selected}`, { method: 'PUT', body: { title: page?.title ?? selected, data, expectedUpdatedAt: expectedOverride === undefined ? page?.updatedAt ?? null : expectedOverride } })
      setPages(current => current.map(item => item.pageKey === selected ? response.content : item)); setConflict(null); onSaved()
    } catch (failure) {
      if (failure instanceof ApiError && failure.code === 'CONTENT_CONFLICT') {
        const latest = (failure.data as { content?: PageContent } | undefined)?.content
        if (latest) setConflict(latest)
      }
      setError(errorMessage(failure))
    } finally { setBusy(false) }
  }
  function save(event: FormEvent) { event.preventDefault(); void persist() }
  function useSavedVersion() {
    if (!conflict) return
    setData({ heading: '', body: '', services: '', ...conflict.data })
    setPages(current => current.map(item => item.pageKey === conflict.pageKey ? conflict : item)); setConflict(null); setError('')
  }
  async function addPage(event: FormEvent) { event.preventDefault(); setPageError(''); const slug = newTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64).replace(/-$/g, ''); if (!slug || ['constructor', 'prototype'].includes(slug) || pages.some(page => page.pageKey === slug)) { setPageError('Choisissez un nom de page différent.'); return } setBusy(true); try { const result = await api<{ content: PageContent }>(`/api/projects/${project.id}/contents/${slug}`, { method: 'PUT', body: { title: newTitle.trim(), data: {}, expectedUpdatedAt: null } }); setPages(current => [...current, result.content]); setSelected(slug); setNewTitle(''); setDialogOpen(false) } catch (error) { setPageError(errorMessage(error)) } finally { setBusy(false) } }
  return <div className="portal-text-editor"><div className="portal-text-editor__main"><div className="portal-page-picker" aria-label="Pages du site">{pages.map(page => <button type="button" key={page.pageKey} disabled={busy} className={selected === page.pageKey ? 'is-active' : ''} onClick={() => setSelected(page.pageKey)} aria-pressed={selected === page.pageKey}>{page.title}</button>)}<Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button variant="ghost" size="sm" disabled={busy}>Ajouter une page</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Ajouter une page</DialogTitle><DialogDescription>Donnez un nom à la page que vous souhaitez préparer.</DialogDescription></DialogHeader><form onSubmit={addPage}><div className="field"><Label htmlFor="new-page-title">Nom de la page</Label><Input id="new-page-title" value={newTitle} onChange={event => setNewTitle(event.target.value)} placeholder="Vos réalisations" required maxLength={80} autoFocus /></div><Notice error>{pageError}</Notice><DialogFooter><Button type="submit" disabled={busy}>Ajouter la page</Button></DialogFooter></form></DialogContent></Dialog></div>
      {loading ? <Loading label="Lecture de vos textes…" /> : fetchError ? <ProjectError error={fetchError} retry={() => setLoadAttempt(value => value + 1)} /> : <form onSubmit={save} className="portal-text-form"><div className="field"><Label htmlFor="page-heading">Le titre de votre page</Label><Input disabled={busy} id="page-heading" value={data.heading ?? ''} onChange={e => setData(current => ({ ...current, heading: e.target.value }))} placeholder="Votre activité en quelques mots" maxLength={200} /></div><div className="field"><Label htmlFor="page-body">Présentez votre activité en quelques lignes</Label><Textarea disabled={busy} id="page-body" value={data.body ?? ''} onChange={e => setData(current => ({ ...current, body: e.target.value }))} placeholder="Ce que vous faites, pour qui, et ce qui vous rend différent…" rows={6} maxLength={10000} /></div><div className="field"><Label htmlFor="page-services">Vos services ou vos produits</Label><Textarea disabled={busy} id="page-services" value={data.services ?? ''} onChange={e => setData(current => ({ ...current, services: e.target.value }))} placeholder="Listez les éléments à présenter…" rows={5} maxLength={10000} /></div><Notice error>{error}</Notice><div className="form-actions"><Button type="submit" disabled={busy}>{busy ? <Loader2 className="spin" size={17} aria-hidden="true" /> : null}Enregistrer mes textes</Button><span className="portal-field-help">Vous pouvez revenir les compléter à tout moment.</span></div></form>}</div>
      <Dialog open={Boolean(conflict)} onOpenChange={open => { if (!open && !busy) setConflict(null) }}><DialogContent className="dialog-content--wide"><DialogHeader><DialogTitle>Cette page a été modifiée ailleurs.</DialogTitle><DialogDescription>Vos textes sont conservés. Comparez les deux versions avant de continuer.</DialogDescription></DialogHeader><div className="grid-2" style={{ marginTop: 24 }}>{[{ title: 'Vos modifications', value: data }, { title: 'Version enregistrée', value: conflict?.data ?? {} }].map(version => <section key={version.title}><h3 style={{ fontSize: 20, marginBottom: 16 }}>{version.title}</h3>{[['heading', 'Titre'], ['body', 'Présentation'], ['services', 'Services']].map(([key, label]) => <div key={key} style={{ marginBottom: 16 }}><strong>{label}</strong><p style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto', marginTop: 6 }}>{version.value[key] || '—'}</p></div>)}</section>)}</div><DialogFooter><Button variant="ghost" disabled={busy} onClick={() => setConflict(null)}>Revenir à mes textes</Button><Button variant="outline" disabled={busy} onClick={useSavedVersion}>Utiliser la version enregistrée</Button><Button disabled={busy} onClick={() => { if (conflict) void persist(conflict.updatedAt) }}>Enregistrer ma version</Button></DialogFooter></DialogContent></Dialog>
      <aside className="portal-text-help"><h2>Besoin d’un point de départ ?</h2><p>Quelques questions pour vous aider à écrire.</p><ol><li><strong>Que proposez-vous ?</strong><span>Vos services, vos produits ou votre expertise.</span></li><li><strong>À qui vous adressez-vous ?</strong><span>Vos clients et ce dont ils ont besoin.</span></li><li><strong>Comment vous contacter ?</strong><span>Les coordonnées à afficher sur le site.</span></li></ol><div><h3>J’ai déjà un document</h3><p>Ajoutez votre texte dans les fichiers du projet.</p><Button variant="link" onClick={onFiles}>Ajouter mon fichier <ArrowRight size={16} aria-hidden="true" /></Button></div></aside>
    </div>
}

function formatSize(bytes: number) { return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko` }
function FileLibrary({ project, onTexts }: { project: Project; onTexts: () => void }) {
  const input = useRef<HTMLInputElement>(null), uploadLock = useRef(false), inputId = useId()
  const [files, setFiles] = useState<StoredFile[]>([]), [filter, setFilter] = useState('all'), [category, setCategory] = useState('auto')
  const [loading, setLoading] = useState(true), [uploading, setUploading] = useState(false), [busyFile, setBusyFile] = useState<string | null>(null), [dragging, setDragging] = useState(false)
  const [error, setError] = useState(''), [notice, setNotice] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    api<{ files: StoredFile[] }>(`/api/projects/${project.id}/files?includeDeleted=1`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setFiles(result.files) })
      .catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [project.id])
  async function addFiles(chosen: FileList | File[] | null) {
    if (!chosen?.length || uploadLock.current) return
    const selected = Array.from(chosen)
    if (selected.length > 10 || selected.some(file => file.size > 10 * 1024 * 1024)) { setError('Ajoutez jusqu’à 10 fichiers à la fois, de 10 Mo maximum chacun.'); return }
    uploadLock.current = true; setUploading(true); setError(''); setNotice('')
    try { const body = new FormData(); for (const file of selected) body.append('files', file); if (category !== 'auto') body.append('category', category); const result = await api<{ files: StoredFile[] }>(`/api/projects/${project.id}/files`, { method: 'POST', body }); setFiles(current => [...result.files, ...current.filter(file => !result.files.some(added => added.id === file.id))]); setNotice(result.files.length > 1 ? 'Vos fichiers sont enregistrés.' : 'Votre fichier est enregistré.'); setFilter('all') } catch (error) { setError(errorMessage(error)) } finally { uploadLock.current = false; setUploading(false); if (input.current) input.current.value = '' }
  }
  async function remove(file: StoredFile) { setBusyFile(file.id); setError(''); try { const result = await api<{ file: StoredFile }>(`/api/projects/${project.id}/files/${file.id}`, { method: 'DELETE' }); setFiles(current => current.map(item => item.id === file.id ? result.file : item)); setNotice('Le fichier a été placé dans la corbeille. Vous pouvez le restaurer.') } catch (error) { setError(errorMessage(error)) } finally { setBusyFile(null) } }
  async function restore(file: StoredFile) { setBusyFile(file.id); setError(''); try { const result = await api<{ file: StoredFile }>(`/api/projects/${project.id}/files/${file.id}/restore`, { method: 'POST' }); setFiles(current => current.map(item => item.id === file.id ? result.file : item)); setNotice('Le fichier est restauré.') } catch (error) { setError(errorMessage(error)) } finally { setBusyFile(null) } }
  function drop(event: DragEvent) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files) }
  const visible = files.filter(file => filter === 'trash' ? Boolean(file.deletedAt) : !file.deletedAt && (filter === 'all' || file.category === filter))
  return <div className="portal-file-library"><div className={dragging ? 'portal-upload-zone is-dragging' : 'portal-upload-zone'} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false) }} onDrop={drop} aria-busy={uploading}><h2>{uploading ? 'Enregistrement des fichiers…' : 'Glissez vos fichiers ici'}</h2><Button onClick={() => input.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}Ajouter des fichiers</Button><input ref={input} id={inputId} type="file" multiple accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.doc,.docx,.txt" onChange={event => void addFiles(event.target.files)} className="portal-file-input" aria-label="Choisir des photos, un logo ou des documents" /><p>Photos, logo ou documents · 10 Mo par fichier</p><label className="portal-upload-category" htmlFor="file-category">Catégorie<select id="file-category" value={category} onChange={event => setCategory(event.target.value)} disabled={uploading}><option value="auto">Détecter automatiquement</option><option value="logo">Logo</option><option value="photo">Photo</option><option value="document">Document</option></select></label></div><Notice error>{error}</Notice><Notice>{notice}</Notice>
    <div className="portal-file-toolbar"><h2>Vos fichiers</h2><div className="portal-file-filters" aria-label="Filtrer les fichiers">{[['all', 'Tout'], ['logo', 'Logo'], ['photo', 'Photos'], ['document', 'Documents'], ['trash', 'Corbeille']].map(([value, label]) => <button type="button" key={value} className={filter === value ? 'is-active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
    {loading ? <Loading label="Lecture de vos fichiers…" /> : visible.length ? <div className="portal-file-grid">{visible.map(file => <article className="portal-file" key={file.id}><div className="portal-file-thumbnail">{file.previewUrl ? <img src={file.previewUrl} alt={file.originalName} loading="lazy" /> : <div><FileText size={34} strokeWidth={1.3} aria-hidden="true" /><span>{file.mime === 'image/svg+xml' ? 'Logo SVG' : file.originalName.split('.').pop()?.toUpperCase() || 'Document'}</span></div>}</div><div className="portal-file-info"><div><h3 title={file.originalName}>{file.originalName}</h3><p>{file.category === 'logo' ? 'Logo' : file.category === 'photo' ? 'Photo' : 'Document'} · {formatSize(file.size)}</p></div>{file.deletedAt ? <Button variant="ghost" size="icon" aria-label={`Restaurer ${file.originalName}`} disabled={busyFile === file.id} onClick={() => void restore(file)}><RotateCcw size={18} aria-hidden="true" /></Button> : <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions pour ${file.originalName}`} disabled={busyFile === file.id}><MoreHorizontal size={19} aria-hidden="true" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><a href={file.downloadUrl} download><Download size={16} aria-hidden="true" />Télécharger</a></DropdownMenuItem><DropdownMenuItem onSelect={() => { void remove(file) }}><Trash2 size={16} aria-hidden="true" />Mettre à la corbeille</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div></article>)}</div> : <div className="portal-library-empty"><FileImage size={30} strokeWidth={1.3} aria-hidden="true" /><h3>{filter === 'trash' ? 'La corbeille est vide.' : 'Aucun fichier ici pour le moment.'}</h3><p>{filter === 'trash' ? 'Les fichiers que vous retirez pourront être restaurés ici.' : 'Ajoutez ce que vous avez. Vous pourrez compléter plus tard.'}</p></div>}
    <div className="portal-library-bottom"><p>Un texte n’est pas prêt ? Vous pourrez l’ajouter ensuite.</p><Button variant="outline" onClick={onTexts}>Préparer mes textes <ArrowRight size={16} aria-hidden="true" /></Button></div>
  </div>
}

export function ContentsPage() {
  const { project, loading, error, refresh } = useProject()
  const [params, setParams] = useSearchParams(), [notice, setNotice] = useState('')
  const selected = params.get('onglet'), tab: ContentTab = selected === 'textes' || selected === 'fichiers' ? selected : 'activite'
  function setTab(value: string) { const next = new URLSearchParams(params); next.set('onglet', value); setParams(next); setNotice('') }
  if (loading) return <Loading />
  if (error) return <ProjectError error={error} retry={() => void refresh()} />
  if (!project) return <EmptyProject />
  return <section className="portal-contents"><div className="portal-page-top"><div><h1 className="page-heading">{tab === 'activite' ? 'Présentez votre activité.' : tab === 'textes' ? 'Préparons vos textes.' : 'Vos contenus, au même endroit.'}</h1><p className="page-subtitle">{tab === 'activite' ? 'Ces informations nous aident à préparer votre site.' : tab === 'textes' ? 'Écrivez simplement. Nous organiserons le contenu pour votre site.' : 'Ajoutez ce que vous avez. Vous pourrez compléter plus tard.'}</p></div><ProjectSelect /></div><Tabs value={tab} onValueChange={setTab}><TabsList aria-label="Contenus du projet"><TabsTrigger value="activite">Mon activité</TabsTrigger><TabsTrigger value="textes">Mes textes</TabsTrigger><TabsTrigger value="fichiers">Photos et logo</TabsTrigger></TabsList><Notice>{notice}</Notice><TabsContent value="activite"><ActivityForm key={project.id} project={project} onSaved={() => { setTab('textes'); setNotice('Vos informations sont enregistrées.') }} /></TabsContent><TabsContent value="textes"><TextEditor key={project.id} project={project} onSaved={() => setNotice('Vos textes sont enregistrés.')} onFiles={() => setTab('fichiers')} /></TabsContent><TabsContent value="fichiers"><FileLibrary key={project.id} project={project} onTexts={() => setTab('textes')} /></TabsContent></Tabs></section>
}

export function AccountPage() {
  const { user, refresh, logout } = useAuth(), navigate = useNavigate()
  const [name, setName] = useState(user?.name ?? ''), [email, setEmail] = useState(user?.email ?? ''), [currentPassword, setCurrentPassword] = useState('')
  const [profileBusy, setProfileBusy] = useState(false), [profileError, setProfileError] = useState(''), [profileNotice, setProfileNotice] = useState('')
  const [passwordOpen, setPasswordOpen] = useState(false), [oldPassword, setOldPassword] = useState(''), [newPassword, setNewPassword] = useState(''), [confirmation, setConfirmation] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false), [passwordError, setPasswordError] = useState(''), [passwordNotice, setPasswordNotice] = useState(''), [logoutError, setLogoutError] = useState('')
  const emailChanged = email.trim().toLowerCase() !== user?.email.toLowerCase()
  if (!user) return <Loading />
  async function saveProfile(event: FormEvent) { event.preventDefault(); setProfileBusy(true); setProfileError(''); setProfileNotice(''); try { await api('/api/auth/me', { method: 'PATCH', body: { name, email, ...(emailChanged ? { currentPassword } : {}) } }); await refresh(); setCurrentPassword(''); setProfileNotice('Vos informations sont enregistrées.') } catch (error) { setProfileError(errorMessage(error)) } finally { setProfileBusy(false) } }
  async function savePassword(event: FormEvent) { event.preventDefault(); setPasswordError(''); setPasswordNotice(''); if (newPassword !== confirmation) { setPasswordError('Les deux nouveaux mots de passe doivent être identiques.'); return } setPasswordBusy(true); try { await api('/api/auth/change-password', { method: 'POST', body: { currentPassword: oldPassword, newPassword } }); setOldPassword(''); setNewPassword(''); setConfirmation(''); setPasswordOpen(false); setPasswordNotice('Votre mot de passe est modifié.') } catch (error) { setPasswordError(errorMessage(error)) } finally { setPasswordBusy(false) } }
  async function signOut() { setLogoutError(''); try { await logout(); navigate('/') } catch (error) { setLogoutError(errorMessage(error)) } }
  return <section className="portal-account"><h1 className="page-heading">Mon compte.</h1><p className="page-subtitle">Retrouvez et modifiez vos informations.</p><div className="portal-account-sections"><section><h2>Mes informations</h2><form onSubmit={saveProfile}><div className="form-grid"><div className="field"><Label htmlFor="account-name">Votre nom</Label><Input id="account-name" value={name} onChange={e => setName(e.target.value)} required maxLength={120} autoComplete="name" /></div><div className="field"><Label htmlFor="account-email">Votre e-mail</Label><Input id="account-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} autoComplete="email" /></div></div>{emailChanged ? <div className="field portal-account-current-password"><Label htmlFor="account-current-password">Votre mot de passe actuel</Label><Input id="account-current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required maxLength={128} autoComplete="current-password" /><p className="portal-field-help">Il est nécessaire pour changer votre adresse e-mail.</p></div> : null}<Notice error>{profileError}</Notice><Notice>{profileNotice}</Notice><Button type="submit" disabled={profileBusy}>{profileBusy ? <Loader2 className="spin" size={17} aria-hidden="true" /> : null}Enregistrer les modifications</Button></form></section><section><h2>Mot de passe</h2><p>Modifiez le mot de passe de votre espace.</p><Notice>{passwordNotice}</Notice>{passwordOpen ? <form className="portal-password-form" onSubmit={savePassword}><div className="field"><Label htmlFor="old-password">Mot de passe actuel</Label><Input id="old-password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required maxLength={128} autoComplete="current-password" /></div><div className="form-grid"><div className="field"><Label htmlFor="new-password">Nouveau mot de passe</Label><Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={12} maxLength={128} autoComplete="new-password" /><p className="portal-field-help">12 caractères minimum.</p></div><div className="field"><Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label><Input id="confirm-password" type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required minLength={12} maxLength={128} autoComplete="new-password" /></div></div><Notice error>{passwordError}</Notice><div className="cluster"><Button type="submit" disabled={passwordBusy}>{passwordBusy ? <Loader2 className="spin" size={17} aria-hidden="true" /> : null}Enregistrer le mot de passe</Button><Button variant="ghost" onClick={() => { setPasswordOpen(false); setPasswordError(''); setOldPassword(''); setNewPassword(''); setConfirmation('') }} disabled={passwordBusy}>Annuler</Button></div></form> : <Button variant="outline" onClick={() => setPasswordOpen(true)}>Changer mon mot de passe</Button>}</section><section><h2>Facturation</h2><p>Vos informations et documents sont dans votre commande.</p><Link to="/espace/commande" className="portal-secondary-link">Voir ma commande <ArrowRight size={17} aria-hidden="true" /></Link></section><section><Notice error>{logoutError}</Notice><Button variant="link" onClick={() => void signOut()}>Se déconnecter</Button></section></div></section>
}
