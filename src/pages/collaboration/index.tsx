import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Download, FileText, Image, Loader2, MessageSquare, Monitor, Paperclip, RefreshCw, Smartphone, Upload, X } from 'lucide-react'
import { api, ApiError, errorMessage } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useProject } from '../../lib/project'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Textarea } from '../../components/ui/textarea'
import '../collaboration.css'

type ProjectFile = { id: string; originalName: string; mime: string; size: number; category: string; createdAt: string; previewUrl: string | null; downloadUrl: string }
type Author = { id: string; name: string; role: 'customer' | 'admin' }
type Message = { id: string; body: string; author: Author; createdAt: string; attachments: ProjectFile[]; unavailableAttachments: number }
type Feedback = { id: string; body: string; author: Author; createdAt: string }
type Approval = { id: string; userId: string; name: string; createdAt: string }
type Preview = { id: string; title: string; version: number; url: string | null; file: ProjectFile | null; sourceUnavailable: boolean; status: 'review' | 'approved'; isLatest: boolean; feedback: Feedback[]; approvals: Approval[]; createdAt: string; updatedAt: string }

const date = (value: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const size = (bytes: number) => bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1_000))} Ko` : `${(bytes / 1_000_000).toFixed(1)} Mo`
function Loading() { return <div className="loading-state collab-loading" role="status"><Loader2 size={21} className="collab-spinner" aria-hidden="true" /> Chargement de votre espace…</div> }
function NoProject() { return <div className="empty-state collab-empty"><h2>Votre projet commence ici.</h2><p>Choisissez votre forfait pour retrouver vos échanges et vos maquettes dans cet espace.</p><Button asChild><Link to="/forfaits">Choisir mon forfait <ArrowRight size={17} /></Link></Button></div> }
function Notice({ children, success = false }: { children: React.ReactNode; success?: boolean }) { return <p className={`collab-notice${success ? ' collab-notice--success' : ''}`} role={success ? 'status' : 'alert'}>{children}</p> }
function Attachment({ file }: { file: ProjectFile }) { return <a className="collab-file-link" href={file.downloadUrl}><FileText size={17} aria-hidden="true" /><span>{file.originalName}<small>{size(file.size)}</small></span><Download size={15} aria-hidden="true" /></a> }

export function MessagesPage() {
  const { project, loading: projectLoading, error: projectError } = useProject()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<ProjectFile[]>([])
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [filesError, setFilesError] = useState('')
  const [uploading, setUploading] = useState(false)
  const uploadInput = useRef<HTMLInputElement>(null)
  const conversationEnd = useRef<HTMLDivElement>(null)
  const activeProject = useRef(project?.id)
  activeProject.current = project?.id
  const base = project ? `/api/projects/${project.id}` : ''

  useEffect(() => {
    setBody(''); setAttachments([]); setMessages([]); setError(''); setNotice(''); setPickerOpen(false); setFiles([]); setSending(false); setUploading(false); setFilesLoading(false); setFilesError('')
    if (!project) { setLoading(false); return }
    const controller = new AbortController()
    setLoading(true)
    api<{ messages: Message[] }>(`/api/projects/${project.id}/messages`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setMessages(data.messages) })
      .catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [project?.id])
  useEffect(() => { if (messages.length) conversationEnd.current?.scrollIntoView({ block: 'nearest' }) }, [messages.length])

  async function refreshMessages() {
    if (!project) return
    const id = project.id; setError(''); setLoading(true)
    try { const data = await api<{ messages: Message[] }>(`${base}/messages`); if (activeProject.current === id) setMessages(data.messages) }
    catch (e) { if (activeProject.current === id) setError(errorMessage(e)) }
    finally { if (activeProject.current === id) setLoading(false) }
  }
  async function openPicker() {
    if (!project) return
    const id = project.id; setPickerOpen(true); setFilesLoading(true); setFilesError('')
    try { const data = await api<{ files: ProjectFile[] }>(`${base}/files`); if (activeProject.current === id) setFiles(data.files) }
    catch (e) { if (activeProject.current === id) setFilesError(errorMessage(e)) }
    finally { if (activeProject.current === id) setFilesLoading(false) }
  }
  function selectFile(file: ProjectFile, checked: boolean) {
    setFilesError('')
    if (checked && attachments.length >= 10) { setFilesError('Vous pouvez joindre jusqu’à 10 fichiers par message.'); return }
    setAttachments(current => checked ? [...current.filter(item => item.id !== file.id), file] : current.filter(item => item.id !== file.id))
  }
  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? []); event.target.value = ''
    if (!project || !chosen.length) return
    if (chosen.length + attachments.length > 10) { setFilesError('Vous pouvez joindre jusqu’à 10 fichiers par message.'); return }
    if (chosen.some(file => file.size > 10 * 1024 * 1024)) { setFilesError('Chaque fichier peut peser jusqu’à 10 Mo.'); return }
    const id = project.id, form = new FormData(); for (const file of chosen) form.append('files', file)
    setUploading(true); setFilesError('')
    try {
      const data = await api<{ files: ProjectFile[] }>(`${base}/files`, { method: 'POST', body: form })
      if (activeProject.current !== id) return
      setFiles(current => [...data.files, ...current]); setAttachments(current => [...current, ...data.files])
    } catch (e) { if (activeProject.current === id) setFilesError(errorMessage(e)) }
    finally { if (activeProject.current === id) setUploading(false) }
  }
  async function send(event: FormEvent) {
    event.preventDefault(); if (!project || sending || loading || (!body.trim() && !attachments.length)) return
    const id = project.id; setSending(true); setError(''); setNotice('')
    try {
      const { message } = await api<{ message: Message }>(`${base}/messages`, { method: 'POST', body: { body: body.trim(), attachmentIds: attachments.map(file => file.id) } })
      if (activeProject.current !== id) return
      setMessages(current => [...current, message]); setBody(''); setAttachments([]); setNotice('Votre message a été envoyé.')
    } catch (e) { if (activeProject.current === id) setError(errorMessage(e)) }
    finally { if (activeProject.current === id) setSending(false) }
  }

  if (projectLoading) return <Loading />
  if (projectError) return <Notice>{projectError}</Notice>
  if (!project) return <NoProject />
  return <section className="collaboration-page">
    <header className="collab-intro"><h1 className="page-heading">Échangeons sur votre projet.</h1><p className="page-subtitle">Les questions, les réponses et les fichiers restent ici.</p></header>
    <div className="panel collab-conversation">
      <div className="collab-conversation-header"><h2>Conversation du projet</h2><div className="cluster"><Link className="text-link text-small" to="/espace/contenus?onglet=fichiers">Voir les fichiers partagés <ArrowUpRight size={16} /></Link><Button variant="ghost" size="icon" aria-label="Actualiser les messages" disabled={loading || sending} onClick={() => void refreshMessages()}><RefreshCw size={17} /></Button></div></div>
      <div className="collab-transcript" role="log" aria-label="Messages du projet" aria-busy={loading}>
        {loading && !messages.length ? <Loading /> : !messages.length ? <div className="collab-conversation-empty"><MessageSquare size={28} strokeWidth={1.4} aria-hidden="true" /><h3>Une question sur votre site ?</h3><p>Écrivez au studio ici. Vous retrouverez vos réponses et les documents partagés dans cette conversation.</p></div> : messages.map(message => <article className={`collab-message${message.author.id === user?.id ? ' collab-message--self' : ''}`} key={message.id}>
          <span className="collab-avatar" aria-hidden="true">{message.author.role === 'admin' ? 'S' : message.author.name.slice(0, 1).toUpperCase()}</span>
          <div className="collab-message-content"><div className="collab-message-meta"><strong>{message.author.id === user?.id ? 'Vous' : message.author.role === 'admin' ? 'studio' : message.author.name}</strong><time dateTime={message.createdAt}>{date(message.createdAt)}</time></div><div className="collab-message-bubble">{message.body ? <p>{message.body}</p> : null}{message.attachments.length ? <div className="collab-message-files">{message.attachments.map(file => <Attachment file={file} key={file.id} />)}</div> : null}{message.unavailableAttachments > 0 ? <p className="text-caption">{message.unavailableAttachments === 1 ? 'Une pièce jointe a été retirée.' : 'Certaines pièces jointes ont été retirées.'}</p> : null}</div></div>
        </article>)}<div ref={conversationEnd} />
      </div>
      <form className="collab-composer" onSubmit={send}>
        {error ? <Notice>{error}</Notice> : null}{notice ? <span className="sr-only" role="status">{notice}</span> : null}
        <Label htmlFor="project-message" className="sr-only">Votre message</Label><Textarea id="project-message" placeholder="Écrivez votre message…" value={body} onChange={e => { setBody(e.target.value); setNotice('') }} maxLength={10_000} disabled={sending} rows={3} />
        {attachments.length ? <div className="collab-pending-files">{attachments.map(file => <span className="collab-file-chip" key={file.id}><Paperclip size={14} /><span>{file.originalName}</span><button type="button" disabled={sending} onClick={() => setAttachments(current => current.filter(item => item.id !== file.id))} aria-label={`Retirer ${file.originalName}`}><X size={14} /></button></span>)}</div> : null}
        <div className="collab-composer-actions"><Button variant="ghost" onClick={() => void openPicker()} disabled={sending}><Paperclip size={20} /> Joindre un fichier</Button><Button type="submit" disabled={loading || sending || (!body.trim() && !attachments.length)}>{sending ? <><Loader2 size={17} className="collab-spinner" /> Envoi…</> : <>Envoyer <ArrowRight size={18} /></>}</Button></div>
      </form>
    </div>
    <p className="collab-footnote">Retrouvez vos documents dans <Link to="/espace/contenus?onglet=fichiers">Mes contenus</Link>.</p>
    <Dialog open={pickerOpen} onOpenChange={open => { if (!uploading) setPickerOpen(open) }}>
      <DialogContent className="collab-files-dialog"><DialogHeader><DialogTitle>Joindre un fichier</DialogTitle><DialogDescription>Choisissez vos documents ou ajoutez-en de nouveaux. Ils restent aussi disponibles dans Mes contenus.</DialogDescription></DialogHeader>
        <input ref={uploadInput} className="sr-only" type="file" multiple accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.doc,.docx,.txt" onChange={e => void uploadFiles(e)} disabled={uploading} />
        <Button variant="outline" disabled={uploading || attachments.length >= 10} onClick={() => uploadInput.current?.click()}>{uploading ? <Loader2 size={17} className="collab-spinner" /> : <Upload size={17} />} {uploading ? 'Ajout en cours…' : 'Ajouter des fichiers'}</Button><p className="text-caption">Images, SVG, PDF, Word ou texte · 10 Mo par fichier.</p>
        {filesError ? <Notice>{filesError}</Notice> : null}
        <div className="collab-file-picker">{filesLoading ? <Loading /> : !files.length ? <p className="collab-empty-files">Aucun fichier déposé pour le moment.</p> : files.map(file => <label className="collab-picker-row" key={file.id}><Checkbox aria-label={file.originalName} checked={attachments.some(item => item.id === file.id)} onCheckedChange={checked => selectFile(file, checked === true)} disabled={uploading} /><FileText size={19} aria-hidden="true" /><span>{file.originalName}<small>{size(file.size)}</small></span></label>)}</div>
        <DialogFooter><Button onClick={() => setPickerOpen(false)} disabled={uploading}>{attachments.length ? `Joindre ${attachments.length} fichier${attachments.length > 1 ? 's' : ''}` : 'Terminer'} <Check size={17} /></Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
}

export function PreviewsPage() {
  const { project, loading: projectLoading, error: projectError, refresh } = useProject()
  const { user } = useAuth()
  const [previews, setPreviews] = useState<Preview[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [viewport, setViewport] = useState('desktop')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackBody, setFeedbackBody] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [saving, setSaving] = useState(false)
  const [approvalTarget, setApprovalTarget] = useState<Preview | null>(null)
  const [imageFailed, setImageFailed] = useState(false)
  const activeProject = useRef(project?.id)
  activeProject.current = project?.id
  const preview = previews.find(item => item.id === selectedId) ?? previews[0]
  const base = project ? `/api/projects/${project.id}` : ''

  useEffect(() => {
    setPreviews([]); setSelectedId(''); setError(''); setNotice(''); setFeedbackOpen(false); setApprovalTarget(null); setSaving(false); setFeedbackBody(''); setViewport('desktop')
    if (!project) { setLoading(false); return }
    const controller = new AbortController(); setLoading(true)
    api<{ previews: Preview[] }>(`/api/projects/${project.id}/previews`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) { setPreviews(data.previews); setSelectedId(data.previews[0]?.id ?? '') } })
      .catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [project?.id])
  useEffect(() => { setImageFailed(false) }, [preview?.id])

  async function refreshPreviews(selectLatest = false) {
    if (!project) return
    const id = project.id; setError('')
    try {
      const data = await api<{ previews: Preview[] }>(`${base}/previews`)
      if (activeProject.current !== id) return
      setPreviews(data.previews)
      if (selectLatest) setSelectedId(data.previews[0]?.id ?? '')
    } catch (e) { if (activeProject.current === id) setError(errorMessage(e)) }
  }
  async function submitFeedback(event: FormEvent) {
    event.preventDefault(); if (!project || !preview || !feedbackBody.trim() || saving) return
    const id = project.id; setSaving(true); setDialogError('')
    try {
      const data = await api<{ preview: Preview }>(`${base}/previews/${preview.id}/feedback`, { method: 'POST', body: { body: feedbackBody.trim() } })
      if (activeProject.current !== id) return
      setPreviews(current => current.map(item => item.id === data.preview.id ? data.preview : item)); setFeedbackBody(''); setFeedbackOpen(false); setNotice('Votre retour a été transmis au studio.')
    } catch (e) { if (activeProject.current === id) setDialogError(errorMessage(e)) }
    finally { if (activeProject.current === id) setSaving(false) }
  }
  async function approve() {
    if (!project || !approvalTarget || saving) return
    const id = project.id; setSaving(true); setDialogError('')
    try {
      const data = await api<{ preview: Preview }>(`${base}/previews/${approvalTarget.id}/approve`, { method: 'POST', body: { confirmed: true } })
      if (activeProject.current !== id) return
      setPreviews(current => current.map(item => item.id === data.preview.id ? data.preview : item)); setApprovalTarget(null); setNotice(`La version ${data.preview.version} est validée. Votre accord a bien été enregistré.`)
      // The agreement is already persisted. Refresh the shared project status so
      // returning to the dashboard cannot keep offering this version for review.
      void refresh()
    } catch (e) {
      if (activeProject.current !== id) return
      if (e instanceof ApiError && e.code === 'PREVIEW_SUPERSEDED') { setApprovalTarget(null); setError(e.message); await refreshPreviews(true); setError(e.message) }
      else setDialogError(errorMessage(e))
    } finally { if (activeProject.current === id) setSaving(false) }
  }

  if (projectLoading) return <Loading />
  if (projectError) return <Notice>{projectError}</Notice>
  if (!project) return <NoProject />
  const openUrl = preview?.url || preview?.file?.previewUrl || preview?.file?.downloadUrl
  const approvedBy = preview?.approvals[0]
  return <section className="collaboration-page">
    <header className="collab-intro"><h1 className="page-heading">Votre site prend forme.</h1><p className="page-subtitle">Découvrez la proposition et partagez vos retours.</p></header>
    {error ? <Notice>{error}</Notice> : null}{notice ? <Notice success>{notice}</Notice> : null}
    {loading ? <Loading /> : !preview ? <div className="panel collab-preview-empty"><Image size={34} strokeWidth={1.25} aria-hidden="true" /><h2>Votre première maquette arrive ici.</h2><p>Le studio vous présentera une version de votre site dans cet espace. Vous pourrez la consulter, demander des ajustements puis la valider.</p><Button variant="outline" asChild><Link to="/espace/messages">Écrire au studio <ArrowRight size={17} /></Link></Button></div> : <>
      <div className="collab-preview-toolbar">
        <div className="cluster collab-version-group"><Select value={preview.id} onValueChange={id => { setSelectedId(id); setNotice('') }}><SelectTrigger aria-label="Choisir une version" className="collab-version-select"><SelectValue /></SelectTrigger><SelectContent>{previews.map(item => <SelectItem key={item.id} value={item.id}>Version {item.version}{item.isLatest ? ' · dernière' : ''}</SelectItem>)}</SelectContent></Select><span className={`collab-preview-status${preview.status === 'approved' ? ' collab-preview-status--approved' : ''}`}>{preview.status === 'approved' ? <CheckCircle2 size={16} aria-hidden="true" /> : <span className="collab-status-dot" aria-hidden="true" />}{preview.status === 'approved' ? 'Validée' : 'À relire'}</span></div>
        <Tabs value={viewport} onValueChange={setViewport} aria-label="Format de l’aperçu"><TabsList className="collab-viewport-tabs"><TabsTrigger value="desktop"><Monitor size={16} /> Ordinateur</TabsTrigger><TabsTrigger value="mobile"><Smartphone size={16} /> Mobile</TabsTrigger></TabsList></Tabs>
        <div className="collab-preview-links">{openUrl ? <a href={openUrl} target="_blank" rel="noopener noreferrer" className="text-link text-small">Ouvrir en grand <ArrowUpRight size={17} /></a> : null}<Button variant="ghost" size="icon" aria-label="Actualiser les maquettes" onClick={() => void refreshPreviews()}><RefreshCw size={17} /></Button></div>
      </div>
      <div className={`collab-preview-stage${viewport === 'mobile' ? ' collab-preview-stage--mobile' : ''}`}>
        <div className="collab-preview-screen">
          {preview.sourceUnavailable ? <div className="collab-source-empty"><FileText size={29} /><h3>Cette maquette n’est plus disponible.</h3><p>Contactez le studio pour retrouver le bon document.</p><Button variant="outline" asChild><Link to="/espace/messages">Écrire au studio</Link></Button></div> : preview.file?.previewUrl && !imageFailed ? <img src={preview.file.previewUrl} alt={`Maquette : ${preview.title}, version ${preview.version}`} onError={() => setImageFailed(true)} /> : preview.url ? <><iframe src={preview.url} title={`${preview.title} — version ${preview.version}`} sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" loading="lazy" /><p className="collab-iframe-note">L’aperçu ne s’affiche pas ? <a href={preview.url} target="_blank" rel="noopener noreferrer">Ouvrir le site dans un nouvel onglet <ArrowUpRight size={13} /></a></p></> : <div className="collab-source-empty"><FileText size={29} /><h3>{preview.title}</h3><p>{imageFailed ? 'L’image n’a pas pu être chargée. Vous pouvez ouvrir le document directement.' : 'Cette proposition se consulte en téléchargeant le document.'}</p>{preview.file ? <Button variant="outline" asChild><a href={preview.file.downloadUrl}>Télécharger la maquette <Download size={17} /></a></Button> : null}</div>}
        </div>
      </div>
      {viewport === 'mobile' && preview.file?.previewUrl ? <p className="collab-footnote">Vue réduite de la maquette. La version mobile du site sera vérifiée avant sa mise en ligne.</p> : null}
      <div className="collab-review-bar"><div><p><strong>{preview.title}</strong></p><p className="text-caption">Version {preview.version} · publiée le {date(preview.createdAt)}{!preview.isLatest ? ' · version précédente' : ''}</p></div><div className="collab-review-actions"><Button variant="outline" onClick={() => { setDialogError(''); setFeedbackOpen(true) }}>Demander un ajustement</Button>{preview.status === 'approved' ? <span className="collab-approval-label"><CheckCircle2 size={18} /> Version validée</span> : user?.role !== 'admin' ? <Button disabled={!preview.isLatest || preview.sourceUnavailable} onClick={() => { setDialogError(''); setApprovalTarget(preview) }}>Valider cette version <ArrowRight size={18} /></Button> : null}</div></div>
      {!preview.isLatest && preview.status !== 'approved' ? <p className="collab-footnote">Une version plus récente est disponible. <button type="button" onClick={() => setSelectedId(previews.find(item => item.isLatest)?.id ?? previews[0].id)}>Consulter la dernière version</button></p> : null}
      {approvedBy ? <p className="collab-footnote">Accord enregistré par {approvedBy.name} le {date(approvedBy.createdAt)}.</p> : null}
      {preview.feedback.length ? <section className="collab-feedback-history"><h2>Retours sur cette version <span>{preview.feedback.length}</span></h2><div>{preview.feedback.map(item => <article key={item.id}><div className="collab-message-meta"><strong>{item.author.id === user?.id ? 'Vous' : item.author.role === 'admin' ? 'studio' : item.author.name}</strong><time dateTime={item.createdAt}>{date(item.createdAt)}</time></div><p>{item.body}</p></article>)}</div></section> : null}
    </>}
    <Dialog open={feedbackOpen} onOpenChange={open => { if (!saving) setFeedbackOpen(open) }}><DialogContent><form onSubmit={submitFeedback}><DialogHeader><DialogTitle>Votre retour sur la version {preview?.version}</DialogTitle><DialogDescription>Indiquez ce que vous souhaitez ajuster. Ce commentaire ne valide pas la maquette.</DialogDescription></DialogHeader><div className="collab-feedback-form"><Label htmlFor="preview-feedback">Les modifications souhaitées</Label><Textarea id="preview-feedback" placeholder="Par exemple : agrandir le titre de la page d’accueil…" rows={5} maxLength={10_000} value={feedbackBody} onChange={e => setFeedbackBody(e.target.value)} disabled={saving} />{dialogError ? <Notice>{dialogError}</Notice> : null}</div><DialogFooter><Button variant="outline" onClick={() => setFeedbackOpen(false)} disabled={saving}>Revenir</Button><Button type="submit" disabled={saving || !feedbackBody.trim()}>{saving ? <Loader2 size={17} className="collab-spinner" /> : null} Envoyer mon retour <ArrowRight size={17} /></Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={Boolean(approvalTarget)} onOpenChange={open => { if (!saving && !open) setApprovalTarget(null) }}><DialogContent><DialogHeader><DialogTitle>Valider la version {approvalTarget?.version} ?</DialogTitle><DialogDescription>Vous confirmez votre accord sur « {approvalTarget?.title} ». Cette validation sera enregistrée dans votre projet. Si vous souhaitez une modification, partagez votre retour avant de valider.</DialogDescription></DialogHeader>{dialogError ? <Notice>{dialogError}</Notice> : null}<DialogFooter><Button variant="outline" onClick={() => setApprovalTarget(null)} disabled={saving}>Relire la maquette</Button><Button onClick={() => void approve()} disabled={saving}>{saving ? <Loader2 size={17} className="collab-spinner" /> : <Check size={17} />} Confirmer ma validation</Button></DialogFooter></DialogContent></Dialog>
  </section>
}
