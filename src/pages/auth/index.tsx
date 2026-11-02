import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { getOffer } from '../../../shared/catalog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { api, errorMessage, safeReturnPath } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { readDraft } from '../../lib/draft'
import { AtelierPreview, ProjectSteps } from '../configurator'
import '../auth.css'

function returnPath(params: URLSearchParams) {
  const target = safeReturnPath(params.get('retour') || params.get('next'), '/espace')
  const pathname = new URL(target, 'https://studio.local').pathname
  return ['/connexion', '/inscription', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe'].includes(pathname) ? '/espace' : target
}
function authHref(route: string, target: string) { return `${route}?retour=${encodeURIComponent(target)}` }

function PasswordInput({ id, name = 'password', value, onChange, autoComplete = 'current-password', minLength, placeholder, disabled = false }: { id: string; name?: string; value: string; onChange: (value: string) => void; autoComplete?: string; minLength?: number; placeholder?: string; disabled?: boolean }) {
  const [visible, setVisible] = useState(false)
  return <div className="password-input"><Input id={id} name={name} type={visible ? 'text' : 'password'} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} required minLength={minLength} maxLength={128} placeholder={placeholder} disabled={disabled} /><button type="button" disabled={disabled} onClick={() => setVisible(current => !current)} aria-pressed={visible} aria-label={`${visible ? 'Masquer' : 'Afficher'} le mot de passe`}>{visible ? 'Masquer' : 'Afficher'}</button></div>
}

export function RegisterPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading, register } = useAuth()
  const target = returnPath(params)
  const [draft] = useState(readDraft)
  const hasSelection = target.startsWith('/configurateur') && draft !== null
  const selected = hasSelection ? getOffer(draft.configuration.offerId) : undefined
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true; setPending(true); setError('')
    try { await register(name.trim(), email.trim(), password); navigate(target, { replace: true }) }
    catch (e) { setError(errorMessage(e)) }
    finally { submitting.current = false; setPending(false) }
  }
  if (loading) return <div className="loading-state auth-loading" role="status"><Loader2 className="spin" size={24} aria-hidden="true" /><span>Ouverture de votre espace…</span></div>
  if (user) return <Navigate to={target} replace />

  return <section className="auth-register-page container">
    {hasSelection ? <ProjectSteps current={2} /> : null}
    <div className="auth-register-grid"><div className="auth-register-intro"><h1 className="page-heading">Votre projet<br />vous attend.</h1><p className="page-subtitle">{hasSelection ? 'Enregistrez vos choix pour les retrouver, déposer vos contenus et suivre la création de votre site.' : 'Préparez votre site, ajoutez vos contenus et retrouvez nos échanges dans votre espace.'}</p><AtelierPreview compact />{selected && draft ? <div className="auth-selection"><div><strong>{selected.title}{draft.configuration.language === 'fr-en' ? ' · Français + anglais' : ''}</strong>{draft.configuration.managedContent ? <span>Textes et images modifiables</span> : null}</div><Link className="text-link" to="/configurateur">Modifier mes choix</Link></div> : <p className="auth-preview-note">Exemple de rendu fictif</p>}</div>
      <div className="auth-register-form"><h2>Créer mon espace</h2><p>Retrouvez votre projet quand vous le souhaitez.</p><form onSubmit={submit} aria-busy={pending}><div className="field"><Label htmlFor="register-name">Votre nom</Label><Input id="register-name" name="name" value={name} onChange={event => setName(event.target.value)} autoComplete="name" required minLength={2} maxLength={120} placeholder="Votre nom complet" disabled={pending} /></div><div className="field"><Label htmlFor="register-email">Votre e-mail</Label><Input id="register-email" name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required maxLength={254} placeholder="votre@email.com" disabled={pending} /></div><div className="field"><Label htmlFor="register-password">Votre mot de passe</Label><PasswordInput id="register-password" value={password} onChange={setPassword} autoComplete="new-password" minLength={12} placeholder="12 caractères minimum" disabled={pending} /></div>{error ? <p className="field-error" role="alert">{error}</p> : null}<Button type="submit" size="lg" className="auth-full-button" disabled={pending}>{pending ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}Créer mon espace<ArrowRight size={18} aria-hidden="true" /></Button></form><p className="auth-other-action">Déjà un compte ? <Link to={authHref('/connexion', target)}>Se connecter</Link></p><p className="auth-privacy-note">Vous pourrez ajouter vos textes, vos photos et votre logo quand ils sont prêts.</p></div>
    </div><Link className="text-link auth-back" to={hasSelection ? '/configurateur' : '/'}><ArrowLeft size={16} aria-hidden="true" />{hasSelection ? 'Revenir à mes choix' : 'Revenir au site'}</Link>
  </section>
}

export function LoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading, login } = useAuth()
  const target = returnPath(params)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true; setPending(true); setError('')
    try { await login(email.trim(), password); navigate(target, { replace: true }) }
    catch (e) { setError(errorMessage(e)) }
    finally { submitting.current = false; setPending(false) }
  }
  if (loading) return <div className="loading-state auth-loading" role="status"><Loader2 className="spin" size={24} aria-hidden="true" /><span>Ouverture de votre espace…</span></div>
  if (user) return <Navigate to={target} replace />
  return <section className="auth-centered-page container"><div className="auth-centered-form"><h1>Retrouvez votre projet.</h1><p className="auth-intro">Connectez-vous à votre espace client.</p><form onSubmit={submit} aria-busy={pending}><div className="field"><Label htmlFor="login-email">Votre e-mail</Label><Input id="login-email" name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required maxLength={254} placeholder="votre@email.com" disabled={pending} /></div><div className="field"><Label htmlFor="login-password">Votre mot de passe</Label><PasswordInput id="login-password" value={password} onChange={setPassword} disabled={pending} /></div><Link className="auth-forgot-link" to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>{error ? <p className="field-error" role="alert">{error}</p> : null}<Button size="lg" type="submit" className="auth-full-button" disabled={pending}>{pending ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}Se connecter<ArrowRight size={18} aria-hidden="true" /></Button></form><div className="auth-create-account"><p>Vous n’avez pas encore de compte ?</p><Button asChild variant="outline" className="auth-full-button"><Link to={authHref('/inscription', target)}>Créer mon espace</Link></Button></div><p className="auth-contact">Une question ? <Link to="/contact">Nous contacter</Link></p></div></section>
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ message: string; delivery: string } | null>(null)
  const submitting = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true; setPending(true); setError('')
    try { setResult(await api<{ message: string; delivery: string }>('/api/auth/forgot-password', { method: 'POST', body: { email: email.trim() } })) }
    catch (e) { setError(errorMessage(e)) }
    finally { submitting.current = false; setPending(false) }
  }
  return <section className="auth-centered-page container"><div className="auth-centered-form auth-centered-form--small"><h1>Retrouvez votre accès.</h1><p className="auth-intro">Indiquez l’adresse e-mail de votre compte.</p>{result ? <div className="auth-result" role="status"><h2>Votre demande a été prise en compte.</h2><p>{result.message}</p>{result.delivery !== 'configured' ? <Button asChild variant="outline"><Link to="/contact">Contacter le studio<ArrowRight size={16} aria-hidden="true" /></Link></Button> : null}</div> : <form onSubmit={submit} aria-busy={pending}><div className="field"><Label htmlFor="forgot-email">Votre e-mail</Label><Input id="forgot-email" type="email" name="email" required autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="votre@email.com" disabled={pending} /></div>{error ? <p className="field-error" role="alert">{error}</p> : null}<Button type="submit" size="lg" className="auth-full-button" disabled={pending}>{pending ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}Demander un lien<ArrowRight size={18} aria-hidden="true" /></Button></form>}<Link className="text-link auth-back" to="/connexion"><ArrowLeft size={16} aria-hidden="true" />Revenir à la connexion</Link></div></section>
}

export function ResetPasswordPage() {
  const [params, setParams] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const submitting = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    if (password !== confirmation) { setError('Les deux mots de passe ne correspondent pas.'); return }
    submitting.current = true; setPending(true); setError('')
    try { await api('/api/auth/reset-password', { method: 'POST', body: { token, password } }); setSuccess(true); setPassword(''); setConfirmation(''); setParams({}, { replace: true }) }
    catch (e) { setError(errorMessage(e)) }
    finally { submitting.current = false; setPending(false) }
  }
  return <section className="auth-centered-page container"><div className="auth-centered-form auth-centered-form--small"><h1>Un nouveau mot de passe.</h1>{success ? <div className="auth-result" role="status"><Check size={24} aria-hidden="true" /><h2>Votre mot de passe est modifié.</h2><p>Vous pouvez maintenant vous reconnecter.</p><Button asChild size="lg"><Link to="/connexion">Se connecter<ArrowRight size={18} aria-hidden="true" /></Link></Button></div> : !token ? <div className="auth-result" role="alert"><p>Ce lien de réinitialisation est incomplet. Demandez un nouveau lien pour retrouver votre accès.</p><Button asChild variant="outline"><Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link></Button></div> : <><p className="auth-intro">Choisissez au moins 12 caractères.</p><form onSubmit={submit} aria-busy={pending}><div className="field"><Label htmlFor="reset-password">Votre nouveau mot de passe</Label><PasswordInput id="reset-password" value={password} onChange={setPassword} autoComplete="new-password" minLength={12} placeholder="12 caractères minimum" disabled={pending} /></div><div className="field"><Label htmlFor="confirm-password">Confirmez le mot de passe</Label><PasswordInput id="confirm-password" name="confirmation" value={confirmation} onChange={setConfirmation} autoComplete="new-password" minLength={12} disabled={pending} /></div>{error ? <p className="field-error" role="alert">{error}</p> : null}<Button type="submit" size="lg" className="auth-full-button" disabled={pending}>{pending ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}Enregistrer mon mot de passe<ArrowRight size={18} aria-hidden="true" /></Button></form></>}<Link className="text-link auth-back" to="/connexion"><ArrowLeft size={16} aria-hidden="true" />Revenir à la connexion</Link></div></section>
}
