export type InquiryContact = {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
}

export const emptyInquiryContact: InquiryContact = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
}

const contactKeys = ['firstName', 'lastName', 'email', 'phone', 'company'] as const
const controls = /[\p{Cc}\u2028\u2029]/u
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
const phonePattern = /^\+?[0-9 ().-]+$/

function isContactObject(input: unknown): input is Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return false
  const prototype = Object.getPrototypeOf(input)
  return prototype === Object.prototype || prototype === null
}

export function validateInquiryContact(input: unknown): {
  contact: InquiryContact
  fields: Record<string, string>
} {
  const contact = { ...emptyInquiryContact }
  const fields: Record<string, string> = {}
  const source = isContactObject(input) ? input : {}
  if (!isContactObject(input) || Reflect.ownKeys(source).some(key => !contactKeys.some(allowed => allowed === key))) {
    fields.form = 'Coordonnées invalides.'
  }

  function read(key: keyof InquiryContact, limit: number, requiredMessage?: string): string {
    const value = Object.hasOwn(source, key) ? source[key] : undefined
    if (value === undefined && !requiredMessage) return ''
    if (typeof value !== 'string') {
      fields[key] = requiredMessage || 'Indiquez une entreprise valide.'
      return ''
    }
    const trimmed = value.trim()
    if (controls.test(value)) fields[key] = 'Caractères de contrôle interdits.'
    else if (trimmed.length > limit) fields[key] = `${limit} caractères maximum.`
    else if (!trimmed && requiredMessage) fields[key] = requiredMessage
    return trimmed
  }

  contact.firstName = read('firstName', 80, 'Indiquez votre prénom.')
  contact.lastName = read('lastName', 80, 'Indiquez votre nom.')
  contact.email = read('email', 254, 'Indiquez une adresse e-mail valide.').toLowerCase()
  contact.phone = read('phone', 40, 'Indiquez un numéro de téléphone valide.')
  contact.company = read('company', 160)

  if (!fields.email && (contact.email.length > 254 || !emailPattern.test(contact.email))) {
    fields.email = 'Indiquez une adresse e-mail valide.'
  }
  const digits = contact.phone.replace(/[^0-9]/g, '').length
  if (!fields.phone && (!phonePattern.test(contact.phone) || digits < 7 || digits > 15)) {
    fields.phone = 'Indiquez un numéro de téléphone valide.'
  }

  return { contact, fields }
}
