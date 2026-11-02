import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, Maximize2 } from 'lucide-react'
import { offers, getOffer, examples, faqs, optionDefinitions, defaultPricing, formatMoney, type OfferId, type Pricing } from '../../../shared/catalog'
import { PricingCard } from '../../components/layout/PricingCard'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import { Reveal } from '../../components/layout/motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { api, errorMessage } from '../../lib/api'
import '../public.css'

type Example = typeof examples[number]

function usePageTitle(title: string) {
  useEffect(() => { document.title = `${title} · studio` }, [title])
}

function usePricing() {
  const [pricing, setPricing] = useState<Pricing>(defaultPricing)
  useEffect(() => {
    const controller = new AbortController()
    api<{ pricing?: Pricing }>('/api/catalogue', { signal: controller.signal })
      .then(data => { if (data.pricing?.base && data.pricing?.options) setPricing(data.pricing) })
      .catch(() => { /* The unpriced catalogue remains a valid pre-launch state. */ })
    return () => controller.abort()
  }, [])
  return pricing
}

function startingPrice(offerId: OfferId, pricing: Pricing) {
  if (offerId === 'sur-mesure') return 'Sur devis'
  const amount = pricing.base[offerId]
  return amount == null ? 'À partir de…' : `À partir de ${formatMoney(amount, pricing.currency)}`
}

const configureHref = (offerId: OfferId) => `/forfaits/${getOffer(offerId)!.slug}`

function Intro({ title, description, eyebrow, action }: { title: string; description?: string; eyebrow?: string; action?: ReactNode }) {
  return <section className={`container page-intro public-intro${action ? ' public-intro--split' : ''}`}>
    <div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h1 className="page-heading">{title}</h1>{description ? <p className="page-subtitle">{description}</p> : null}</div>
    {action ? <div className="public-intro__action">{action}</div> : null}
  </section>
}

function Breadcrumb({ children }: { children: ReactNode }) {
  return <nav className="public-breadcrumb" aria-label="Fil d’Ariane"><Link to="/forfaits">Forfaits</Link><ChevronRight size={15} aria-hidden="true" /><span aria-current="page">{children}</span></nav>
}

function FaqList({ items, prefix = 'faq' }: { items: readonly { question: string; answer: string }[]; prefix?: string }) {
  return <Accordion type="single" collapsible className="public-faq-list">{items.map((item, index) => <AccordionItem key={item.question} value={`${prefix}-${index}`}><AccordionTrigger>{item.question}</AccordionTrigger><AccordionContent>{item.answer}</AccordionContent></AccordionItem>)}</Accordion>
}

export function HomePage() {
  usePageTitle('Création de sites internet clé en main')
  const pricing = usePricing()
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [hash])
  const homeFaqs = [faqs[0], faqs[1], faqs[4]]
  return <>
    <section className="container home-hero" aria-labelledby="home-title">
      <Reveal className="home-hero__copy"><h1 id="home-title">Votre site internet.<br />Clé en main.</h1><p className="home-hero__description">Choisissez votre forfait et vos options. Nous créons votre site.</p><div className="home-hero__actions"><Button asChild size="lg"><a href="#forfaits">Choisir mon forfait <ArrowRight size={18} aria-hidden="true" /></a></Button><a className="text-link" href="#fonctionnement">Comment ça se passe <ArrowUpRight size={16} aria-hidden="true" /></a></div></Reveal>
    </section>
    <section className="container home-offers" id="forfaits" aria-labelledby="home-offers-title">
      <Reveal className="home-section-heading"><h2 id="home-offers-title">Choisissez votre forfait.</h2><a className="text-link" href="#comparer">Comparer les forfaits <ArrowRight size={17} aria-hidden="true" /></a></Reveal>
      <div className="pricing-grid">{offers.map((offer, index) => <Reveal key={offer.id} delay={index * 65}><PricingCard slug={offer.slug} title={offer.title} price={startingPrice(offer.id, pricing)} features={offer.features} href={configureHref(offer.id)} variant={offer.variant} cta={offer.id === 'sur-mesure' ? 'Parlons de votre projet' : `Configurer ${offer.title}`} /></Reveal>)}</div>
    </section>
    <section className="container home-method" id="fonctionnement" aria-label="Les étapes de votre projet">
      {[
        ['Choisissez votre forfait', 'Ajoutez les options dont vous avez besoin.'],
        ['Ajoutez vos contenus', 'Déposez vos textes, photos et logo dans votre espace.'],
        ['Validez votre site', 'Consultez la maquette et demandez vos ajustements.'],
      ].map(([title, text], index) => <Reveal className="home-method__step" key={title} delay={index * 80}><span className="home-method__number">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}
    </section>
    <section className="container home-comparison" id="comparer" aria-labelledby="home-comparison-title"><Reveal className="section-heading"><h2 id="home-comparison-title">Comparer les forfaits</h2></Reveal><Reveal><OfferComparison pricing={pricing} id="home-comparison" /></Reveal></section>
    <section className="container home-faq" aria-labelledby="home-faq-title"><Reveal><div className="section-heading"><h2 id="home-faq-title">Questions fréquentes</h2></div><FaqList items={homeFaqs} prefix="home" /><Link className="text-link home-faq__all" to="/faq">Toutes les questions <ArrowRight size={17} aria-hidden="true" /></Link></Reveal></section>
  </>
}

type ComparisonStatus = 'included' | 'optional' | 'custom' | 'monthly'
type ComparisonRow = { title: string; values: readonly ComparisonStatus[]; hint?: string }
const comparisonRows: readonly ComparisonRow[] = [
  { title: 'Un site réalisé pour vous', values: ['included', 'included', 'included', 'included'] },
  { title: 'Adapté à votre activité et au mobile', values: ['included', 'included', 'included', 'included'] },
  { title: 'Espace client de préparation', values: ['included', 'included', 'included', 'included'], hint: 'Vos fichiers, vos échanges et vos validations.' },
  { title: 'Gestion des textes et images', values: ['optional', 'included', 'optional', 'custom'], hint: 'Pour modifier vous-même votre site après sa mise en ligne.' },
  { title: 'Élément 3D interactif', values: ['optional', 'optional', 'included', 'custom'] },
]
const comparisonDetails: readonly ComparisonRow[] = [
  { title: 'Site en français', values: ['included', 'included', 'included', 'custom'] },
  { title: 'Français + anglais', values: ['optional', 'optional', 'optional', 'custom'] },
  { title: 'Mise en ligne par nos soins', values: ['optional', 'optional', 'optional', 'custom'], hint: 'Une option ponctuelle.' },
  { title: 'Maintenance après la mise en ligne', values: ['monthly', 'monthly', 'monthly', 'custom'], hint: 'Un suivi mensuel facultatif, présenté séparément.' },
  { title: 'Fonctions et intégrations spécifiques', values: ['custom', 'custom', 'custom', 'custom'] },
]

function ComparisonCell({ status }: { status: ComparisonStatus }) {
  if (status === 'included') return <span className="comparison-included"><Check size={19} strokeWidth={1.8} aria-hidden="true" /><span className="public-sr-only">Inclus</span></span>
  return <span className={`comparison-status comparison-status--${status}`}>{status === 'optional' ? 'En option' : status === 'monthly' ? <>En option<span>/ mois</span></> : 'À définir'}</span>
}

function OfferComparison({ pricing, id }: { pricing: Pricing; id: string }) {
  const [details, setDetails] = useState(false)
  const rows = details ? [...comparisonRows, ...comparisonDetails] : comparisonRows
  return <div className="offer-comparison">
    <div className="comparison-controls"><span className="comparison-legend"><Check size={16} aria-hidden="true" /> Inclus</span><div className="comparison-details-toggle"><Checkbox id={`${id}-details`} checked={details} onCheckedChange={value => setDetails(value === true)} aria-controls={`${id}-table`} /><Label htmlFor={`${id}-details`}>Afficher les détails</Label></div></div>
    <div className="table-scroll comparison-scroll" tabIndex={0} role="region" aria-label="Comparatif des quatre forfaits, défilement horizontal sur petit écran"><table id={`${id}-table`} className="comparison-table"><caption className="public-sr-only">Comparer les quatre forfaits de création de sites internet. Les coches indiquent les fonctions incluses.</caption><thead><tr><th scope="col"><span>Fonctions</span></th>{offers.map(offer => <th key={offer.id} scope="col"><div className="comparison-offer"><h3>{offer.title}</h3><p>{startingPrice(offer.id, pricing)}</p><Link className="text-link" to={configureHref(offer.id)}>{offer.id === 'sur-mesure' ? 'Parlons-en' : 'Configurer'}<ArrowUpRight size={15} aria-hidden="true" /></Link></div></th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.title}><th scope="row">{row.title}{details && row.hint ? <span className="comparison-row-hint">{row.hint}</span> : null}</th>{row.values.map((value, index) => <td key={offers[index].id}><ComparisonCell status={value} /></td>)}</tr>)}</tbody></table></div>
    <p className="comparison-footnote">Les options s’ajoutent au prix de création. La maintenance reste un montant mensuel distinct.</p>
  </div>
}

export function OffersPage() {
  usePageTitle('Comparer les forfaits de création de sites')
  const pricing = usePricing()
  return <><Intro title="Comparer les forfaits" description="Les fonctions incluses et les options de chaque site." /><section className="container public-comparison" aria-label="Comparaison des forfaits"><OfferComparison pricing={pricing} id="forfaits-comparison" /></section></>
}

function OptionRows({ offerId = 'vitrine' }: { offerId?: OfferId }) {
  const pricing = usePricing()
  return <div className="public-option-list">{optionDefinitions.map(option => {
    const included = (option.id === 'managed-content' && offerId === 'connecte') || (option.id === 'scene-3d' && offerId === 'immersif')
    return <div className="public-option" key={option.id}><div><h3>{option.title}</h3><p>{option.description}</p></div><div className="public-option__action"><span>{included ? 'Inclus' : `+ ${formatMoney(pricing.options[option.id], pricing.currency)}${option.billing === 'monthly' ? ' / mois' : ''}`}</span>{included ? <Check size={22} aria-label="Inclus" /> : <Button asChild variant="outline" size="sm"><Link aria-label={`Choisir ${option.title}`} to={`${configureHref(offerId)}?option=${option.id}`}>Choisir <ArrowRight size={16} aria-hidden="true" /></Link></Button>}</div></div>
  })}</div>
}

function ExamplePreview({ example, heading = 'Un exemple pour vous projeter.' }: { example: Example; heading?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [live, setLive] = useState(false)
  useEffect(() => { setExpanded(false); setLive(false) }, [example.id])
  return <figure className="public-example-block">
    <div className="public-example-heading"><h2>{heading}</h2><a className="text-link" href={example.url} target="_blank" rel="noreferrer">Ouvrir le site <ArrowUpRight size={17} aria-hidden="true" /></a></div>
    <div className="preview-frame public-example-frame">
      {live && example.embeddable ? <iframe className="public-live-example" title={`Expérience ${example.title}`} src={example.url} loading="lazy" sandbox="allow-scripts allow-same-origin allow-pointer-lock" allow="fullscreen" allowFullScreen /> : <button type="button" className="public-example-image-button" onClick={() => setExpanded(true)} aria-label={`Agrandir l’aperçu ${example.title}`}><img src={example.image} alt={`Aperçu de référence du site ${example.title}`} className="public-example-image" width="1672" height="940" loading="lazy" /></button>}
      {example.embeddable && !live ? <Button className="public-example-launch" variant="secondary" onClick={() => setLive(true)}>Explorer la démo <ArrowRight size={17} aria-hidden="true" /></Button> : null}
    </div>
    <figcaption className="public-example-caption"><span>Référence externe · <a href={example.sourceUrl} target="_blank" rel="noreferrer">{example.creator}</a></span><Button variant="ghost" size="sm" onClick={() => setExpanded(true)}><Maximize2 size={16} aria-hidden="true" />Agrandir</Button></figcaption>
    <Dialog open={expanded} onOpenChange={setExpanded}><DialogContent className="dialog-content--wide public-preview-dialog"><DialogHeader><DialogTitle>{example.title}</DialogTitle><DialogDescription>Une référence externe pour illustrer ce format de site.</DialogDescription></DialogHeader><img src={example.image} alt={`Aperçu agrandi du site ${example.title}`} width="1672" height="940" /><a className="text-link" href={example.url} target="_blank" rel="noreferrer">Ouvrir le site <ArrowUpRight size={17} aria-hidden="true" /></a></DialogContent></Dialog>
  </figure>
}

function MissingPage({ title = 'Cette page n’est pas disponible.' }: { title?: string }) {
  return <section className="container page-section public-missing"><h1>{title}</h1><p>Retrouvez les forfaits et les exemples pour continuer votre visite.</p><Button asChild><Link to="/forfaits">Voir les forfaits <ArrowRight size={18} aria-hidden="true" /></Link></Button></section>
}

export function CustomProjectPage() {
  usePageTitle('Création de site sur mesure')
  const example = examples.find(item => item.offerId === 'sur-mesure')!
  return <>
    <section className="container page-intro public-offer-hero"><Reveal><Breadcrumb>Sur mesure</Breadcrumb><h1>Un site sur mesure.</h1><p className="page-subtitle">Des fonctions dédiées, des outils à connecter ou une expérience particulière.</p></Reveal><Reveal delay={100} className="public-offer-price"><p>Sur devis</p><Button asChild size="lg"><a href="#projet">Décrire mon projet <ArrowRight size={18} aria-hidden="true" /></a></Button></Reveal></section>
    <section className="container public-custom-project"><Reveal className="public-custom-example"><img src={example.image} alt="Référence d’expérience sur mesure : Addiction Agency" width="1600" height="1000" loading="lazy" /><div><h2>Un périmètre défini avec vous.</h2><p>Présentez votre activité et les fonctions souhaitées. Nous précisons le projet avant de vous proposer un devis.</p><p className="text-small text-muted">Référence externe : {example.title}<br />{example.creator}</p><a className="text-link" href={example.sourceUrl} target="_blank" rel="noreferrer">Voir la référence <ArrowUpRight size={17} aria-hidden="true" /></a></div></Reveal><div className="public-custom-form" id="projet"><h2>Votre projet</h2><InquiryForm custom /></div></section>
  </>
}

/** Kept only for older lazy imports; public routes now open the configurator directly. */
export function OfferDetailPage() {
  const { slug } = useParams()
  const offer = getOffer(slug)
  return offer ? <Navigate to={configureHref(offer.id)} replace /> : <MissingPage />
}

export function OptionsPage() {
  usePageTitle('Les options de votre site')
  return <><Intro title="Options du site" description="À ajouter à votre forfait selon vos besoins." /><section className="container public-options-page"><OptionRows /><p className="public-reference-note">Certaines fonctions sont déjà incluses selon le forfait. La mise en ligne est ponctuelle ; la maintenance est mensuelle.</p><Button asChild><Link to="/forfaits">Choisir mon forfait <ArrowRight size={18} aria-hidden="true" /></Link></Button></section></>
}

export function ExamplesPage() {
  usePageTitle('Les exemples de sites')
  return <><Intro title="Exemples de sites" description="Des références externes pour découvrir les formats proposés." /><section className="container public-examples-page"><div className="public-examples-grid">{examples.map(example => <Link className="public-example-tile" key={example.id} to={`/exemples/${example.id}`}><div className="public-example-tile__image"><img src={example.image} alt={`Aperçu du site ${example.title}`} width="1672" height="940" loading="lazy" /></div><div className="public-example-tile__title"><h2>{example.title}</h2><ArrowRight size={22} aria-hidden="true" /></div><p>{example.category}{example.id === 'tiny-heaven' || example.id === 'addiction-agency' ? ' · Raphaël Ferreira' : ''}</p></Link>)}</div></section></>
}

export function ExampleDetailPage() {
  const { slug } = useParams()
  const example = examples.find(item => item.id === slug)
  usePageTitle(example?.title ?? 'Exemple')
  if (!example) return <MissingPage title="Cet exemple n’est pas disponible." />
  const offer = getOffer(example.offerId)!
  return <section className="container public-example-detail"><Link className="text-link public-back-link" to="/exemples"><ArrowLeft size={18} aria-hidden="true" />Tous les exemples</Link><div className="public-example-detail__heading"><div><h1>{example.title}</h1><p>{example.description}</p></div><Button asChild><a href={example.url} target="_blank" rel="noreferrer">Ouvrir le site <ArrowUpRight size={18} aria-hidden="true" /></a></Button></div><ExamplePreview example={example} heading="Aperçu du site" /><div className="public-example-detail__footer"><Link className="text-link" to={`/forfaits/${offer.slug}`}>Configurer {offer.title} <ArrowRight size={18} aria-hidden="true" /></Link></div></section>
}

export function FaqPage() {
  usePageTitle('Questions fréquentes')
  return <><Intro title="Questions fréquentes" /><section className="container public-faq-page"><FaqList items={faqs} prefix="faq" /><div className="public-faq-contact"><p>Vous avez une autre question ?</p><Button asChild variant="outline"><Link to="/contact">Nous contacter <ArrowRight size={17} aria-hidden="true" /></Link></Button></div></section></>
}

function InquiryForm({ custom = false }: { custom?: boolean }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(custom ? 'Projet sur mesure' : '')
  const [message, setMessage] = useState('')
  const [inspiration, setInspiration] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [failure, setFailure] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'loading') return
    setStatus('loading'); setFailure('')
    try {
      await api('/api/inquiries', { method: 'POST', body: { name: name.trim(), email: email.trim(), subject: custom ? 'Projet sur mesure' : subject, message: `${message.trim()}${inspiration.trim() ? `\n\nLien d’inspiration : ${inspiration.trim()}` : ''}` } })
      setStatus('success')
    } catch (error) { setStatus('error'); setFailure(errorMessage(error, 'Votre demande n’a pas pu être enregistrée. Réessayez.')) }
  }
  if (status === 'success') return <div className="public-inquiry-success" role="status"><span className="public-success-icon"><Check size={25} aria-hidden="true" /></span><h3>Votre demande est enregistrée.</h3><Button variant="outline" onClick={() => { setStatus('idle'); setMessage(''); setInspiration('') }}>Écrire un autre message</Button></div>
  return <form className="public-inquiry-form" onSubmit={submit} aria-busy={status === 'loading'}>
    <div className="form-grid"><div className="field"><Label htmlFor={custom ? 'custom-name' : 'contact-name'}>Votre nom</Label><Input id={custom ? 'custom-name' : 'contact-name'} name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Votre nom" value={name} onChange={event => setName(event.target.value)} /></div><div className="field"><Label htmlFor={custom ? 'custom-email' : 'contact-email'}>Votre e-mail</Label><Input id={custom ? 'custom-email' : 'contact-email'} name="email" autoComplete="email" type="email" required maxLength={254} placeholder="votre@email.com" value={email} onChange={event => setEmail(event.target.value)} /></div></div>
    {!custom ? <div className="field"><Label htmlFor="contact-subject">Votre demande</Label><select id="contact-subject" name="subject" className="input public-native-select" required value={subject} onChange={event => setSubject(event.target.value)}><option value="" disabled>Choisir un sujet</option>{['Une question sur Vitrine', 'Une question sur Connecté', 'Une question sur la 3D', 'Projet sur mesure', 'Une autre question'].map(item => <option key={item}>{item}</option>)}</select></div> : null}
    <div className="field"><Label htmlFor={custom ? 'custom-message' : 'contact-message'}>{custom ? 'Ce que vous souhaitez créer' : 'Votre message'}</Label><Textarea id={custom ? 'custom-message' : 'contact-message'} name="message" required minLength={10} maxLength={4000} rows={6} placeholder={custom ? 'Le type de site, les fonctions souhaitées, vos inspirations…' : 'Dites-nous ce que vous avez en tête…'} value={message} onChange={event => setMessage(event.target.value)} /></div>
    {custom ? <div className="field"><Label htmlFor="custom-inspiration">Lien d’inspiration <span className="text-muted">(facultatif)</span></Label><Input id="custom-inspiration" type="url" maxLength={500} placeholder="https://" value={inspiration} onChange={event => setInspiration(event.target.value)} /></div> : null}
    {status === 'error' ? <p className="field-error" role="alert">{failure}</p> : null}
    <div className="public-inquiry-actions"><Button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Enregistrement…' : custom ? 'Envoyer ma demande' : 'Envoyer mon message'}{status !== 'loading' ? <ArrowRight size={18} aria-hidden="true" /> : null}</Button><p>{custom ? 'Le périmètre est précisé avant de vous proposer un devis.' : 'Vos informations servent à répondre à votre demande.'}</p></div>
  </form>
}

export function ContactPage() {
  usePageTitle('Contacter le studio')
  return <><Intro title="Contacter le studio" description="Décrivez votre projet ou posez votre question." /><section className="container public-contact-page"><div className="public-contact-copy"><div><h2>Choisir un forfait</h2><p>Comparez les fonctions et les options avant de nous écrire.</p><Link className="text-link" to="/forfaits">Comparer les forfaits <ArrowRight size={18} aria-hidden="true" /></Link></div></div><InquiryForm /></section></>
}
