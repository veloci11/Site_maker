import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import type { Configuration } from '../../../shared/catalog'
import {
  briefLimits,
  emptyBrief,
  getContactBriefSections,
  validateContactBrief,
  type BriefAnswers,
  type RequestType,
} from '../../../shared/brief'
import { emptyInquiryContact, validateInquiryContact, type InquiryContact } from '../../../shared/inquiry-contact'
import { ApiError, api, errorMessage } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { BriefNavigationGuard } from './BriefNavigationGuard'
import './brief-form.css'

export type InquiryResult = {
  ok: boolean
  id: string
  notification: 'queued' | 'accepted' | 'unavailable'
}

export type ProjectBriefFormProps = {
  requestType: RequestType
  configuration: Configuration | null
  onSuccess?: (result: InquiryResult) => void
  onBusyChange?: (busy: boolean) => void
}

const contactFields = [
  { key: 'firstName', label: 'Prénom', autoComplete: 'given-name', limit: 80 },
  { key: 'lastName', label: 'Nom', autoComplete: 'family-name', limit: 80 },
  { key: 'email', label: 'E-mail', autoComplete: 'email', limit: 254, type: 'email' },
  { key: 'phone', label: 'Téléphone', autoComplete: 'tel', limit: 40, type: 'tel' },
  { key: 'company', label: 'Entreprise', autoComplete: 'organization', limit: 160 },
] as const
const questions = getContactBriefSections().flatMap(section => section.questions)

/** One short form for general requests and configured offers. */
export function ProjectBriefForm({ requestType, configuration, onSuccess, onBusyChange }: ProjectBriefFormProps) {
  const prefix = `project-brief-${useId()}`
  const [answers, setAnswers] = useState<BriefAnswers>(emptyBrief)
  const [contact, setContact] = useState<InquiryContact>(() => ({ ...emptyInquiryContact }))
  const [website, setWebsite] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [failure, setFailure] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<InquiryResult | null>(null)
  const [focusRequest, setFocusRequest] = useState<{ field: string } | null>(null)
  const inFlight = useRef(false)
  const mounted = useRef(true)
  const attempt = useRef<{ signature: string; requestId: string } | null>(null)
  const controls = useRef<Record<string, HTMLElement | null>>({})
  const feedbackRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const callbacks = useRef({ onSuccess, onBusyChange })
  callbacks.current = { onSuccess, onBusyChange }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (inFlight.current) callbacks.current.onBusyChange?.(false)
    }
  }, [])

  useEffect(() => {
    if (!focusRequest) return
    const frame = requestAnimationFrame(() => {
      const control = controls.current[focusRequest.field] ?? feedbackRef.current
      control?.focus({ preventScroll: true })
      control?.scrollIntoView({ block: 'center', behavior: 'auto' })
      setFocusRequest(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [focusRequest])

  useEffect(() => {
    if (result && !onSuccess) successRef.current?.focus()
  }, [result, onSuccess])

  function clearFieldError(key: string) {
    setFields(current => {
      if (!Object.hasOwn(current, key)) return current
      const next = { ...current }
      delete next[key]
      return next
    })
    setFailure('')
  }

  function showErrors(errors: Record<string, string>, message = 'Vérifiez les champs indiqués pour continuer.') {
    setFields(errors)
    setFailure(message)
    const orderedFields = [...contactFields.map(field => field.key), ...questions.map(question => `brief.${question.id}`)]
    setFocusRequest({ field: orderedFields.find(key => errors[key]) ?? '_form' })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || result) return
    const checkedBrief = validateContactBrief(answers)
    const checkedContact = validateInquiryContact(contact)
    const errors = {
      ...checkedContact.fields,
      ...Object.fromEntries(Object.entries(checkedBrief.fields).map(([key, message]) => [`brief.${key}`, message])),
    }
    if (Object.keys(errors).length) {
      showErrors(errors)
      return
    }

    const payload = {
      schemaVersion: 2,
      briefFormat: 'contact',
      requestType,
      ...checkedContact.contact,
      configuration,
      brief: checkedBrief.answers,
      website,
    }
    const signature = JSON.stringify(payload)
    if (!attempt.current || attempt.current.signature !== signature) {
      attempt.current = { signature, requestId: crypto.randomUUID() }
    }

    inFlight.current = true
    setSending(true)
    callbacks.current.onBusyChange?.(true)
    setFields({})
    setFailure('')
    let accepted: InquiryResult | null = null
    try {
      const response = await api<InquiryResult>('/api/inquiries', {
        method: 'POST', body: { ...payload, requestId: attempt.current.requestId },
      })
      if (response?.ok !== true || typeof response.id !== 'string' || !response.id) {
        throw new Error('La confirmation de votre demande n’a pas abouti. Réessayez dans un instant.')
      }
      accepted = {
        ok: true,
        id: response.id,
        notification: response.notification === 'accepted' || response.notification === 'queued'
          ? response.notification : 'unavailable',
      }
    } catch (error) {
      if (mounted.current) {
        const message = errorMessage(error, 'Votre demande n’a pas pu être enregistrée. Réessayez.')
        const questionIds = new Set(questions.map(question => question.id))
        const errors = error instanceof ApiError && error.fields
          ? Object.fromEntries(Object.entries(error.fields).map(([key, value]) => [questionIds.has(key) ? `brief.${key}` : key, value]))
          : {}
        showErrors(errors, message)
      }
    } finally {
      inFlight.current = false
      if (mounted.current) {
        setSending(false)
        callbacks.current.onBusyChange?.(false)
      }
    }
    if (accepted && mounted.current) {
      setResult(accepted)
      callbacks.current.onSuccess?.(accepted)
    }
  }

  if (result) {
    if (onSuccess) return null
    return (
      <div className="project-brief-form__success" ref={successRef} tabIndex={-1} role="status">
        <h3>Votre demande est enregistrée.</h3>
        <p>{result.notification === 'accepted'
          ? 'La notification au studio a été acceptée par le service d’e-mail. Sa livraison n’est pas encore confirmée.'
          : result.notification === 'queued'
            ? 'La notification au studio est en attente d’envoi. Votre demande est conservée.'
            : 'La notification par e-mail est actuellement indisponible. Votre demande reste enregistrée.'}</p>
      </div>
    )
  }

  const knownFields = new Set([...contactFields.map(field => field.key), ...questions.map(question => `brief.${question.id}`)])
  const globalErrors = Object.entries(fields).filter(([key]) => !knownFields.has(key))
  const unfinished = sending || Object.values(contact).some(value => value.trim()) ||
    Object.values(answers).some(value => Array.isArray(value) ? value.length > 0 : value.trim())

  return (
    <form className="project-brief-form" noValidate onSubmit={submit} aria-busy={sending}>
      <p className="project-brief-form__intro">Les champs marqués d’un * sont obligatoires.</p>
      <fieldset className="project-brief-form__fieldset" disabled={sending}>
        <legend className="project-brief-form__sr-only">Votre demande et vos coordonnées</legend>
        <div className="project-brief-form__contact-grid">
          {contactFields.map(field => {
            const required = field.key !== 'company'
            const error = fields[field.key]
            return (
              <div className="field project-brief-form__field" key={field.key}>
                <Label htmlFor={`${prefix}-${field.key}`}>{field.label}{required ? ' *' : <span className="project-brief-form__optional">Facultatif</span>}</Label>
                <Input
                  id={`${prefix}-${field.key}`}
                  name={field.key}
                  type={'type' in field ? field.type : 'text'}
                  autoComplete={field.autoComplete}
                  spellCheck={field.key === 'email' ? false : undefined}
                  maxLength={field.limit}
                  required={required}
                  value={contact[field.key]}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${prefix}-${field.key}-error` : undefined}
                  ref={node => { controls.current[field.key] = node }}
                  onChange={event => {
                    setContact(current => ({ ...current, [field.key]: event.target.value }))
                    clearFieldError(field.key)
                  }}
                />
                {error ? <p className="field-error" id={`${prefix}-${field.key}-error`}>{error}</p> : null}
              </div>
            )
          })}
        </div>
        <div className="project-brief-form__questions">
          {questions.map(question => {
            const id = `${prefix}-${question.id}`
            const error = fields[`brief.${question.id}`]
            const common = {
              id,
              name: `brief.${question.id}`,
              autoComplete: 'off',
              value: typeof answers[question.id] === 'string' ? answers[question.id] as string : '',
              required: question.required,
              'aria-invalid': Boolean(error),
              'aria-describedby': `${id}-hint${error ? ` ${id}-error` : ''}`,
              ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => { controls.current[`brief.${question.id}`] = node },
              onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setAnswers(current => ({ ...current, [question.id]: event.target.value }))
                clearFieldError(`brief.${question.id}`)
              },
            }
            return (
              <div className="field project-brief-form__field" key={question.id}>
                <Label htmlFor={id}>{question.label}{question.required ? ' *' : <span className="project-brief-form__optional">Facultatif</span>}</Label>
                {question.type === 'textarea'
                  ? <Textarea {...common} maxLength={briefLimits.textarea} rows={4} />
                  : <Input {...common} maxLength={briefLimits.text} />}
                <p className="project-brief-form__hint" id={`${id}-hint`}>{question.hint}</p>
                {error ? <p className="field-error" id={`${id}-error`}>{error}</p> : null}
              </div>
            )
          })}
        </div>
        <div className="project-brief-form__honeypot" aria-hidden="true">
          <label htmlFor={`${prefix}-website`}>Site web</label>
          <input id={`${prefix}-website`} name="website" value={website} onChange={event => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
        </div>
      </fieldset>
      {failure ? (
        <div className="project-brief-form__feedback" role="alert" tabIndex={-1} ref={feedbackRef}>
          <p>{failure}</p>
          {globalErrors.length ? <ul>{globalErrors.map(([key, message]) => <li key={key}>{message}</li>)}</ul> : null}
        </div>
      ) : null}
      <Button className="project-brief-form__submit" type="submit" disabled={sending}>
        {sending ? <><LoaderCircle className="spin" size={17} aria-hidden="true" />Enregistrement…</> : 'Envoyer ma demande'}
      </Button>
      <p className="project-brief-form__privacy">Vos coordonnées et votre message servent à étudier votre demande et à vous recontacter. <Link to="/confidentialite" target="_blank" rel="noopener noreferrer" aria-label="Confidentialité (nouvel onglet)">Confidentialité</Link></p>
      <BriefNavigationGuard active={Boolean(unfinished)} pending={sending} />
    </form>
  )
}
