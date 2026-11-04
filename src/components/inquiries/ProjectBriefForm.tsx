import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle, X } from 'lucide-react'
import type { Configuration } from '../../../shared/catalog'
import {
  briefLimits,
  emptyBrief,
  getBriefSections,
  isBriefQuestionVisible,
  toggleBriefChoice,
  validateBrief,
  type BriefAnswer,
  type BriefAnswers,
  type Question,
  type RequestType,
} from '../../../shared/brief'
import { emptyInquiryContact, validateInquiryContact, type InquiryContact } from '../../../shared/inquiry-contact'
import { ApiError, api, errorMessage } from '../../lib/api'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  BRIEF_IMAGE_ACCEPT,
  imageFileSize,
  imageSelectionError,
  type BriefImage,
} from './brief-form-files'
import './brief-form.css'
import { BriefNavigationGuard } from './BriefNavigationGuard'

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

/** Keep unfinished answers while removing every hidden question, including nested children. */
function visibleAnswers(requestType: RequestType, source: BriefAnswers, configuration: Configuration | null): BriefAnswers {
  const answers: BriefAnswers = {}
  for (const section of getBriefSections(requestType)) {
    for (const question of section.questions) {
      if (isBriefQuestionVisible(question, answers, configuration) && Object.hasOwn(source, question.id)) {
        answers[question.id] = source[question.id]
      }
    }
  }
  return answers
}

function answerSummary(question: Question, answer: BriefAnswer | undefined): string {
  const optionLabel = (value: string) => question.options?.find(option => option.value === value)?.label ?? value
  if (Array.isArray(answer)) return answer.map(optionLabel).join(', ')
  if (typeof answer !== 'string') return ''
  const value = optionLabel(answer.trim())
  return !question.options && value.length > 140 ? `${value.slice(0, 137)}…` : value
}

type QuestionFieldProps = {
  question: Question
  id: string
  answer: BriefAnswer | undefined
  error: string | undefined
  onChange: (answer: BriefAnswer) => void
  register: (node: HTMLElement | null) => void
}

function QuestionField({ question, id, answer, error, onChange, register }: QuestionFieldProps) {
  const hintId = question.hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const label = <>{question.label}{question.required ? ' *' : <span className="project-brief-form__optional">Facultatif</span>}</>
  const feedback = <>
    {question.hint ? <p className="project-brief-form__hint" id={hintId}>{question.hint}</p> : null}
    {error ? <p className="field-error" id={errorId}>{error}</p> : null}
  </>

  if (question.type === 'multiselect') {
    const selected = Array.isArray(answer) ? answer : []
    return (
      <fieldset className="project-brief-form__choice-field project-brief-form__field" aria-describedby={describedBy} aria-invalid={Boolean(error)} aria-required={question.required || undefined}>
        <legend className="label">{label}</legend>
        {feedback}
        <div className="project-brief-form__choices">
          {question.options?.map((option, index) => (
            <label className="project-brief-form__choice" data-selected={selected.includes(option.value)} key={option.value} htmlFor={`${id}-${option.value}`}>
              <Checkbox
                id={`${id}-${option.value}`}
                name={`brief.${question.id}`}
                value={option.value}
                checked={selected.includes(option.value)}
                ref={index === 0 ? register : undefined}
                aria-describedby={describedBy}
                aria-invalid={Boolean(error)}
                onCheckedChange={checked => onChange(toggleBriefChoice(question, selected, option.value, checked === true))}
              />
              <span className="project-brief-form__choice-copy">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  const common = {
    id,
    name: `brief.${question.id}`,
    autoComplete: 'off',
    value: typeof answer === 'string' ? answer : '',
    required: question.required,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
  }
  return (
    <div className="field project-brief-form__field">
      <Label htmlFor={id}>{label}</Label>
      {question.type === 'select' ? (
        <select {...common} ref={register} className="input" onChange={event => onChange(event.target.value)}>
          <option value="">Choisir une réponse</option>
          {question.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : question.type === 'textarea' ? (
        <Textarea {...common} ref={register} maxLength={briefLimits.textarea} rows={4} onChange={event => onChange(event.target.value)} />
      ) : (
        <Input
          {...common}
          ref={register}
          type={question.type === 'url' ? 'url' : 'text'}
          maxLength={question.type === 'url' ? briefLimits.url : briefLimits.text}
          autoCapitalize={question.type === 'url' ? 'none' : undefined}
          autoCorrect={question.type === 'url' ? 'off' : undefined}
          spellCheck={question.type === 'url' ? false : undefined}
          onChange={event => onChange(event.target.value)}
        />
      )}
      {feedback}
    </div>
  )
}

export function ProjectBriefForm({ requestType, configuration, onSuccess, onBusyChange }: ProjectBriefFormProps) {
  const prefix = `project-brief-${useId()}`
  const sections = useMemo(() => getBriefSections(requestType), [requestType])
  const questionSections = sections.filter(section => section.id !== 'project-files')
  const fileQuestions = sections.find(section => section.id === 'project-files')?.questions ?? []
  const [answers, setAnswers] = useState<BriefAnswers>(emptyBrief)
  const [contact, setContact] = useState<InquiryContact>(() => ({ ...emptyInquiryContact }))
  const [images, setImages] = useState<BriefImage[]>([])
  const [website, setWebsite] = useState('')
  const [openSection, setOpenSection] = useState(sections[0]?.id ?? 'contact-details')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [failure, setFailure] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<InquiryResult | null>(null)
  const [focusRequest, setFocusRequest] = useState<{ field: string } | null>(null)
  const inFlight = useRef(false)
  const mounted = useRef(true)
  const attempt = useRef<{ signature: string; requestId: string } | null>(null)
  const controls = useRef<Record<string, HTMLElement | null>>({})
  const previewUrls = useRef(new Set<string>())
  const feedbackRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const callbacks = useRef({ onSuccess, onBusyChange })
  callbacks.current = { onSuccess, onBusyChange }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      previewUrls.current.forEach(url => URL.revokeObjectURL(url))
      previewUrls.current.clear()
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
  }, [focusRequest, openSection])

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

  function changeAnswer(question: Question, answer: BriefAnswer) {
    const next = visibleAnswers(requestType, { ...answers, [question.id]: answer }, configuration)
    setAnswers(next)
    const visibleIds = new Set(sections.flatMap(section => section.questions)
      .filter(item => isBriefQuestionVisible(item, next, configuration)).map(item => `brief.${item.id}`))
    setFields(current => Object.fromEntries(Object.entries(current).filter(([key]) =>
      key !== `brief.${question.id}` && (!key.startsWith('brief.') || visibleIds.has(key)))))
    setFailure('')
  }

  function changeContact(key: keyof InquiryContact, value: string) {
    setContact(current => ({ ...current, [key]: value }))
    clearFieldError(key)
  }

  function chooseImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!selected.length) return
    const error = imageSelectionError([...images.map(image => image.file), ...selected])
    if (error) {
      setFields(current => ({ ...current, files: error }))
      return
    }
    const added = selected.map(file => {
      const preview = URL.createObjectURL(file)
      previewUrls.current.add(preview)
      return { id: crypto.randomUUID(), file, preview }
    })
    setImages(current => [...current, ...added])
    clearImageErrors()
  }

  function clearImageErrors() {
    setFields(current => Object.fromEntries(Object.entries(current).filter(([key]) => key !== 'files' && !key.startsWith('files.'))))
    setFailure('')
  }

  function removeImage(id: string) {
    const image = images.find(item => item.id === id)
    if (image) {
      URL.revokeObjectURL(image.preview)
      previewUrls.current.delete(image.preview)
    }
    setImages(current => current.filter(item => item.id !== id))
    clearImageErrors()
  }

  function normalizeServerFields(source: Record<string, string>): Record<string, string> {
    const questionIds = new Set(sections.flatMap(section => section.questions.map(question => question.id)))
    return Object.fromEntries(Object.entries(source).map(([key, message]) => {
      if (questionIds.has(key)) return [`brief.${key}`, message]
      if (key.startsWith('brief[') && key.endsWith(']')) return [`brief.${key.slice(6, -1)}`, message]
      if (key === 'attachments') return ['files', message]
      return [key, message]
    }))
  }

  function showErrors(errors: Record<string, string>, message = 'Vérifiez les champs indiqués pour continuer.') {
    setFields(errors)
    setFailure(message)
    for (const section of sections) {
      const question = section.questions.find(item => errors[`brief.${item.id}`])
      if (question && isBriefQuestionVisible(question, answers, configuration)) {
        setOpenSection(section.id)
        setFocusRequest({ field: `brief.${question.id}` })
        return
      }
    }
    const contactError = contactFields.find(field => errors[field.key])
    if (contactError) {
      setOpenSection('contact-details')
      setFocusRequest({ field: contactError.key })
    } else if (Object.keys(errors).some(key => key === 'files' || key.startsWith('files.'))) {
      setOpenSection('project-files')
      setFocusRequest({ field: 'files' })
    } else {
      setFocusRequest({ field: '_form' })
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || result) return
    const cleanedAnswers = visibleAnswers(requestType, answers, configuration)
    setAnswers(cleanedAnswers)
    const checkedBrief = validateBrief(requestType, cleanedAnswers, configuration)
    const checkedContact = validateInquiryContact(contact)
    const imageError = imageSelectionError(images.map(image => image.file))
    const errors = {
      ...Object.fromEntries(Object.entries(checkedBrief.fields).map(([key, message]) => [`brief.${key}`, message])),
      ...checkedContact.fields,
      ...(imageError ? { files: imageError } : {}),
    }
    if (Object.keys(errors).length) {
      showErrors(errors)
      return
    }

    const payload = {
      schemaVersion: 2,
      requestType,
      ...checkedContact.contact,
      configuration,
      brief: checkedBrief.answers,
      website,
    }
    // The nonce follows the File instance. A same-name, same-size replacement gets
    // another identity, while an unchanged retry retains exactly the same UUID.
    const signature = JSON.stringify([payload, images.map(image => image.id)])
    if (!attempt.current || attempt.current.signature !== signature) {
      attempt.current = { signature, requestId: crypto.randomUUID() }
    }
    const body = { ...payload, requestId: attempt.current.requestId }
    let transport: typeof body | FormData = body
    if (images.length) {
      transport = new FormData()
      transport.append('payload', JSON.stringify(body))
      images.forEach(image => (transport as FormData).append('files', image.file, image.file.name))
    }

    inFlight.current = true
    setSending(true)
    callbacks.current.onBusyChange?.(true)
    setFields({})
    setFailure('')
    let accepted: InquiryResult | null = null
    try {
      const response = await api<InquiryResult>('/api/inquiries', { method: 'POST', body: transport })
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
        if (error instanceof ApiError && (/^INQUIRY_(IMAGE|UPLOAD)/.test(error.code ?? '') || error.code === 'STORAGE_LIMIT')) {
          showErrors({ files: message }, message)
        } else if (error instanceof ApiError && error.fields) showErrors(normalizeServerFields(error.fields), message)
        else showErrors({}, message)
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

  const knownFields = new Set([
    ...sections.flatMap(section => section.questions.filter(question => isBriefQuestionVisible(question, answers, configuration)).map(question => `brief.${question.id}`)),
    ...contactFields.map(field => field.key),
    'files',
  ])
  const globalErrors = Object.entries(fields).filter(([key]) => !knownFields.has(key) && !key.startsWith('files.'))
  const imageErrors = Object.entries(fields).filter(([key]) => key === 'files' || key.startsWith('files.'))
  const contactSummary = [contact.firstName.trim(), contact.lastName.trim()].filter(Boolean).join(' ')
  const unfinished = sending || images.length > 0 || Object.values(contact).some(value => value.trim()) ||
    Object.values(answers).some(value => Array.isArray(value) ? value.length > 0 : value.trim())

  function heading(title: string, index: number, summary: string) {
    return (
      <span className="project-brief-form__section-copy">
        <span className="project-brief-form__section-heading">
          <span className="project-brief-form__section-number">{String(index + 1).padStart(2, '0')}</span>
          <span>{title}</span>
        </span>
        {summary ? <span className="project-brief-form__summary">{summary}</span> : null}
      </span>
    )
  }

  function renderQuestion(question: Question) {
    return (
      <QuestionField
        key={question.id}
        question={question}
        id={`${prefix}-${question.id}`}
        answer={answers[question.id]}
        error={fields[`brief.${question.id}`]}
        register={node => { controls.current[`brief.${question.id}`] = node }}
        onChange={answer => changeAnswer(question, answer)}
      />
    )
  }

  return (
    <form className="project-brief-form" noValidate onSubmit={submit} aria-busy={sending}>
      <p className="project-brief-form__intro">Les champs marqués d’un * sont obligatoires.</p>
      <fieldset className="project-brief-form__fieldset" disabled={sending}>
        <legend className="project-brief-form__sr-only">Votre projet et vos coordonnées</legend>
        <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection} className="project-brief-form__sections">
          {questionSections.map((section, index) => {
            const questions = section.questions.filter(question => isBriefQuestionVisible(question, answers, configuration))
            const summary = questions.map(question => answerSummary(question, answers[question.id])).filter(Boolean).join(' · ')
            return (
              <AccordionItem key={section.id} value={section.id} className="project-brief-form__section">
                <AccordionTrigger>{heading(section.title, index, summary)}</AccordionTrigger>
                <AccordionContent>
                  <div className="project-brief-form__questions">
                    {questions.map(renderQuestion)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
          <AccordionItem value="contact-details" className="project-brief-form__section">
            <AccordionTrigger>{heading('Vos coordonnées', questionSections.length, [contactSummary, contact.email.trim(), contact.phone.trim(), contact.company.trim()].filter(Boolean).join(' · '))}</AccordionTrigger>
            <AccordionContent>
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
                        onChange={event => changeContact(field.key, event.target.value)}
                      />
                      {error ? <p className="field-error" id={`${prefix}-${field.key}-error`}>{error}</p> : null}
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="project-files" className="project-brief-form__section">
            <AccordionTrigger>{heading('Vos fichiers · facultatif', questionSections.length + 1, [...images.map(image => image.file.name), ...(answers.transferUrl ? ['Lien de partage ajouté'] : [])].join(' · '))}</AccordionTrigger>
            <AccordionContent>
              <div className="project-brief-form__questions project-brief-form__file-links">
                {fileQuestions.filter(question => isBriefQuestionVisible(question, answers, configuration)).map(renderQuestion)}
              </div>
              <div className="field project-brief-form__field">
                <Label htmlFor={`${prefix}-files`}>Ajouter des images<span className="project-brief-form__optional">Facultatif</span></Label>
                <p className="project-brief-form__hint" id={`${prefix}-files-hint`}>Un logo, des photos ou des captures utiles au projet. Jusqu’à 6 images JPEG, PNG ou WebP, 5 Mio par image et 20 Mio au total.</p>
                <Input
                  id={`${prefix}-files`}
                  name="files"
                  type="file"
                  multiple
                  accept={BRIEF_IMAGE_ACCEPT}
                  className="project-brief-form__file-input"
                  ref={node => { controls.current.files = node }}
                  aria-invalid={imageErrors.length > 0}
                  aria-describedby={`${prefix}-files-hint${imageErrors.length ? ` ${prefix}-files-error` : ''}`}
                  onChange={chooseImages}
                />
                {imageErrors.length ? <div id={`${prefix}-files-error`} role="alert">{imageErrors.map(([key, message]) => <p className="field-error" key={key}>{message}</p>)}</div> : null}
              </div>
              {images.length ? (
                <ul className="project-brief-form__images" aria-label="Images jointes">
                  {images.map(image => (
                    <li className="project-brief-form__image" key={image.id}>
                      <img src={image.preview} alt={`Aperçu de ${image.file.name}`} />
                      <div className="project-brief-form__image-copy">
                        <span className="project-brief-form__image-name">{image.file.name}</span>
                        <span className="project-brief-form__image-size">{imageFileSize(image.file.size)}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="project-brief-form__remove" aria-label={`Retirer ${image.file.name}`} onClick={() => removeImage(image.id)}>
                        <X size={17} aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
      <p className="project-brief-form__privacy">Vos coordonnées et vos réponses servent à étudier votre demande et à vous recontacter. <Link to="/confidentialite" target="_blank" rel="noopener noreferrer" aria-label="Confidentialité (nouvel onglet)">Confidentialité</Link></p>
      <BriefNavigationGuard active={Boolean(unfinished)} pending={sending} />
    </form>
  )
}
