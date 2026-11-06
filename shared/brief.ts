import { isOptionSelected, type Configuration, type OptionId } from './catalog.ts'

export const requestTypes = ['vitrine', 'connecte', 'immersif', 'sur-mesure', 'evolution', 'refonte', 'contact'] as const
export type RequestType = (typeof requestTypes)[number]
export type BriefAnswer = string | string[]
export type BriefAnswers = Record<string, BriefAnswer>
export type Question = {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'url'
  required?: boolean
  options?: { value: string; label: string }[]
  hint?: string
  showWhen?: { field: string; values: string[] }
  showWhenAnswered?: string
  showForOption?: OptionId
  showForAnyOption?: readonly OptionId[]
  exclusiveValues?: string[]
  httpsOnly?: boolean
}
export type BriefSection = { id: string; title: string; questions: Question[] }
export type BriefSummarySection = { title: string; items: { label: string; value: string; url?: string }[] }

export const requestTypeLabels: Record<RequestType, string> = {
  vitrine: 'Vitrine',
  connecte: 'Business',
  immersif: 'Premium / 3D',
  'sur-mesure': 'Sur mesure',
  evolution: 'Évolution',
  refonte: 'Refonte',
  contact: 'Demande générale',
}

export const briefLimits = { text: 500, textarea: 2000, url: 2048, total: 16000 } as const

const activity: Question = {
  id: 'activity', label: 'Quelle est votre activité ?', type: 'text', required: true,
  hint: 'Votre métier, vos services ou votre organisation en quelques mots.',
}
const audience: Question = {
  id: 'audience', label: 'À qui le site doit-il s’adresser ?', type: 'text', required: true,
  hint: 'Par exemple : particuliers de votre région, entreprises, adhérents ou équipe interne. Précisez votre zone d’activité si elle compte.',
}
const primaryAction: Question = {
  id: 'primaryAction', label: 'Que doit faire le visiteur en priorité ?', type: 'text', required: true,
  hint: 'Par exemple : vous contacter, découvrir vos services, réserver ou utiliser un espace personnel.',
}
const pages: Question = {
  id: 'pages', label: 'Quelles pages ou rubriques souhaitez-vous ?', type: 'textarea',
  hint: 'Pour chaque page, indiquez ce qu’elle doit présenter et les services à mettre en avant. Une liste provisoire ou « À définir ensemble » suffit.',
}
const contentReady: Question = {
  id: 'contentReady', label: 'Où en sont vos contenus ?', type: 'select',
  options: [
    { value: 'ready', label: 'Textes et visuels sont prêts' },
    { value: 'partial', label: 'Une partie est prête' },
    { value: 'to-create', label: 'Ils sont à préparer' },
    { value: 'unknown', label: 'À définir ensemble' },
  ],
  hint: 'Textes, logo, photos, vidéos ou documents utiles au site.',
}
const references: Question = {
  id: 'references', label: 'Avez-vous des références visuelles ?', type: 'textarea',
  hint: 'Ajoutez des liens et ce que vous appréciez : style, navigation ou présentation. Facultatif.',
}
const domainHosting: Question = {
  id: 'domainHosting', label: 'Avez-vous déjà un nom de domaine et un hébergement ?', type: 'select',
  options: [
    { value: 'both', label: 'Les deux sont disponibles' },
    { value: 'domain-only', label: 'Le nom de domaine uniquement' },
    { value: 'none', label: 'Pas encore' },
    { value: 'unknown', label: 'Je ne sais pas' },
  ],
}
const deadline: Question = {
  id: 'deadline', label: 'Avez-vous une date souhaitée ou un événement à prendre en compte ?', type: 'text',
  hint: 'Précisez la date et sa raison, ou indiquez « À définir ensemble ».',
}
const constraints: Question = {
  id: 'constraints', label: 'Quelles autres contraintes devons-nous connaître ?', type: 'textarea',
  hint: 'Par exemple : langues, appareils utilisés, accessibilité, validation interne ou obligations métier.',
}
const currentUrl: Question = {
  id: 'currentUrl', label: 'Quelle est l’adresse du site actuel ?', type: 'url',
  hint: 'Facultatif : https://… Si le site est privé ou hors ligne, passez cette question.',
}
const platform: Question = {
  id: 'platform', label: 'Avec quel outil le site actuel a-t-il été construit ?', type: 'select',
  options: [
    { value: 'wordpress', label: 'WordPress' },
    { value: 'wix', label: 'Wix' },
    { value: 'shopify', label: 'Shopify' },
    { value: 'webflow', label: 'Webflow' },
    { value: 'custom', label: 'Développement spécifique' },
    { value: 'other', label: 'Un autre outil' },
    { value: 'unknown', label: 'Je ne sais pas' },
  ],
}
const platformDetails: Question = {
  id: 'platformDetails', label: 'Quel est le nom de cet outil ?', type: 'text',
  hint: 'Le nom de la plateforme et sa version, si vous les connaissez.',
  showWhen: { field: 'platform', values: ['other'] },
}
const availableAccess: Question = {
  id: 'availableAccess', label: 'Quels accès pourrez-vous mettre à disposition ?', type: 'multiselect',
  exclusiveValues: ['unknown'],
  options: [
    { value: 'admin', label: 'Administration du site' },
    { value: 'hosting', label: 'Hébergement' },
    { value: 'domain', label: 'Nom de domaine' },
    { value: 'repository', label: 'Code source ou dépôt' },
    { value: 'not-yet', label: 'Les accès sont à récupérer' },
    { value: 'unknown', label: 'Je ne sais pas' },
  ],
  hint: 'Indiquez uniquement les accès disponibles. N’envoyez aucun mot de passe, code de connexion ou clé secrète.',
}
const dataFields: Question = {
  id: 'dataFields', label: 'Quelles informations les utilisateurs devront-ils retrouver ou modifier ?', type: 'textarea', required: true,
  hint: 'Par exemple : leur profil, leurs réservations, le suivi d’une demande ou des fiches produits. Décrivez un exemple fictif avec vos mots ; « À définir ensemble » convient aussi.',
}
const workflow: Question = {
  id: 'workflow', label: 'Que se passe-t-il lorsqu’un utilisateur réalise l’action principale ?', type: 'textarea',
  hint: 'Que fait-il, que reçoit-il, et qui vérifie ou traite sa demande ? Un exemple concret suffit.',
}
const integrations: Question = {
  id: 'integrations', label: 'Quels outils doivent échanger avec le site ?', type: 'textarea',
  hint: 'Indiquez l’outil, les informations à transmettre et l’action attendue. Par exemple : une réservation ajoute un créneau dans votre agenda. Ne transmettez aucune clé d’accès.',
}

const budget: Question = {
  id: 'budget', label: 'Avez-vous une enveloppe à respecter ?', type: 'text',
  hint: 'Une estimation suffit. Vous pouvez aussi en discuter avec nous avant de décider.',
}
const bookingDetails: Question = {
  id: 'bookingDetails', label: 'Que doit-on pouvoir réserver et comment confirmez-vous la réservation ?', type: 'textarea',
  showForOption: 'booking',
  hint: 'Précisez les prestations ou créneaux, les disponibilités et ce qui confirme la réservation. Indiquez un outil existant si vous en utilisez un.',
}
const storeDetails: Question = {
  id: 'storeDetails', label: 'Que souhaitez-vous vendre et comment les commandes seront-elles traitées ?', type: 'textarea',
  showForOption: 'online-store',
  hint: 'Indiquez les produits et leur nombre approximatif, puis la livraison, le retrait ou l’accès au contenu acheté. Aucun export de vos clients.',
}
const newsletterDetails: Question = {
  id: 'newsletterDetails', label: 'Quel outil et quels messages prévoyez-vous pour la newsletter ?', type: 'textarea',
  showForOption: 'newsletter',
  hint: 'Indiquez la plateforme si vous la connaissez, qui préparera les messages et si votre adresse d’envoi est déjà configurée. « À définir ensemble » suffit. Aucune liste de contacts ni clé d’accès.',
}
const analyticsDetails: Question = {
  id: 'analyticsDetails', label: 'Que souhaitez-vous mesurer sur votre site ?', type: 'textarea',
  showForOption: 'analytics',
  hint: 'Par exemple : les visites, les demandes de contact ou les réservations. Indiquez votre outil actuel si vous en avez un, ou « À définir ensemble ».',
}
const languageDetails: Question = {
  id: 'languageDetails', label: 'Quelles langues et quelles pages faut-il prévoir ?', type: 'textarea',
  showForAnyOption: ['language-en', 'additional-language'],
  hint: 'Précisez la langue souhaitée, les pages concernées et si les traductions sont disponibles. L’option couvre une langue supplémentaire, au choix, jusqu’à cinq pages avec les traductions fournies.',
}
const localSeoDetails: Question = {
  id: 'localSeoDetails', label: 'Quelle zone d’activité et quels établissements souhaitez-vous présenter ?', type: 'textarea',
  showForOption: 'local-seo',
  hint: 'Indiquez les villes desservies et votre fiche Google Business si elle existe. Les actions sont définies ensemble, sans promesse de position sur Google.',
}
const optionDetails = [newsletterDetails, analyticsDetails, languageDetails, localSeoDetails]
const fileSection: BriefSection = {
  id: 'project-files', title: 'Vos fichiers', questions: [
    {
      id: 'transferUrl', label: 'Lien de téléchargement de vos fichiers', type: 'url', httpsOnly: true,
      hint: 'Pour vos documents, vidéos, modèles 3D ou fichiers dépassant 20 Mio, collez un lien WeTransfer, SwissTransfer ou un dossier partagé. Vérifiez qu’il est encore disponible ; aucun mot de passe ni donnée de vos clients.',
    },
    {
      id: 'transferDetails', label: 'Que contient ce lien ?', type: 'textarea', showWhenAnswered: 'transferUrl',
      hint: 'Par exemple : textes, logo ou modèle 3D. Précisez le fichier à regarder en premier et la date d’expiration si vous la connaissez.',
    },
  ],
}

const sectionsByRequest: Record<RequestType, BriefSection[]> = {
  vitrine: [
    { id: 'project', title: 'Votre activité et vos visiteurs', questions: [activity, audience, primaryAction] },
    { id: 'content', title: 'Les pages et les contenus', questions: [{ ...pages, required: true }, contentReady, references] },
    { id: 'setup', title: 'La mise en place', questions: [
      bookingDetails,
      ...optionDetails,
      domainHosting,
      {
        id: 'hostingDetails', label: 'Que souhaitez-vous conserver ?', type: 'text',
        hint: 'Le nom de domaine et, si vous le connaissez, le nom de l’hébergeur. Aucun identifiant ni mot de passe.',
        showWhen: { field: 'domainHosting', values: ['both', 'domain-only'] },
      },
      {
        id: 'contentManagement', label: 'Qui modifiera les contenus après la livraison ?', type: 'select',
        options: [
          { value: 'team', label: 'Moi ou mon équipe' },
          { value: 'studio', label: 'Je souhaite en discuter avec le studio' },
          { value: 'rare', label: 'Les contenus changeront rarement' },
          { value: 'unknown', label: 'À définir ensemble' },
        ],
      },
    ] },
    { id: 'timing', title: 'Le calendrier et les contraintes', questions: [deadline, constraints] },
  ],
  connecte: [
    { id: 'project', title: 'Votre activité et vos visiteurs', questions: [activity, audience, primaryAction] },
    { id: 'users', title: 'Les utilisateurs et leurs actions', questions: [
      {
        id: 'userTypes', label: 'Qui utilisera les comptes ou les espaces du site ?', type: 'text', required: true,
        hint: 'Par exemple : clients, adhérents, partenaires, équipe interne et administrateurs.',
      },
      {
        id: 'userActions', label: 'Que doit pouvoir faire chaque type d’utilisateur ?', type: 'textarea', required: true,
        hint: 'Décrivez les actions concrètes : réserver, déposer un document, consulter un suivi, modifier une fiche…',
      },
      {
        id: 'registration', label: 'Comment les utilisateurs obtiendront-ils leur compte ?', type: 'select',
        options: [
          { value: 'self', label: 'Inscription par l’utilisateur' },
          { value: 'approval', label: 'Inscription avec validation par mon équipe' },
          { value: 'invite', label: 'Invitation ou création par mon équipe' },
          { value: 'unknown', label: 'À définir ensemble' },
        ],
      },
      {
        id: 'roles', label: 'Quels droits ou restrictions faut-il prévoir ?', type: 'textarea',
        hint: 'Précisez qui peut voir, créer, modifier, valider ou supprimer quelles informations. « À définir ensemble » convient aussi.',
      },
    ] },
    { id: 'data', title: 'Les données et le fonctionnement', questions: [
      dataFields,
      workflow,
      {
        id: 'expectedVolume', label: 'Combien de personnes et de contenus prévoyez-vous au lancement ?', type: 'text',
        hint: 'Une estimation suffit : par exemple 50 membres ou 200 produits. Vous pouvez indiquer « Je ne sais pas ».',
      },
      {
        id: 'imports', label: 'Des informations existantes sont-elles à importer ?', type: 'textarea',
        hint: 'Indiquez leur origine, leur format et un ordre de grandeur : tableur, ancien site, logiciel… Ne joignez pas de données personnelles ici.',
      },
      integrations,
      bookingDetails,
      storeDetails,
      ...optionDetails,
    ] },
    { id: 'delivery', title: 'Les contenus et le calendrier', questions: [pages, contentReady, references, domainHosting, deadline, constraints] },
  ],
  immersif: [
    { id: 'project', title: 'Votre activité et vos visiteurs', questions: [activity, { ...audience, required: false }, primaryAction] },
    { id: 'object', title: 'L’élément 3D', questions: [
      {
        id: 'object3d', label: 'Quel objet ou univers souhaitez-vous présenter en 3D ?', type: 'textarea', required: true,
        hint: 'Par exemple : un produit, un bâtiment, une pièce ou un élément de votre identité visuelle.',
      },
      {
        id: 'immersionGoal', label: 'Que doit apporter la 3D au visiteur ?', type: 'text', required: true,
        hint: 'Par exemple : comprendre un produit, observer des détails, explorer un lieu ou découvrir une ambiance.',
      },
      {
        id: 'modelStatus', label: 'Disposez-vous déjà d’un modèle 3D ?', type: 'select', required: true,
        options: [
          { value: 'ready', label: 'Oui, un modèle est disponible' },
          { value: 'in-progress', label: 'Il est en cours de préparation' },
          { value: 'to-create', label: 'Non, il est à créer' },
          { value: 'unknown', label: 'Je ne sais pas' },
        ],
      },
      {
        id: 'modelDetails', label: 'Avez-vous des précisions sur le fichier 3D ?', type: 'textarea',
        hint: 'Si vous les connaissez : format, textures, animations et autorisation d’utilisation. Vous pouvez partager le fichier dans « Vos fichiers » pour que nous l’examinions.',
        showWhen: { field: 'modelStatus', values: ['ready', 'in-progress'] },
      },
      {
        id: 'objectCount', label: 'Combien d’objets ou de scènes souhaitez-vous présenter ?', type: 'text',
        hint: 'Une estimation suffit, ou indiquez ce qui reste à définir.',
      },
    ] },
    { id: 'experience', title: 'L’expérience souhaitée', questions: [
      {
        id: 'interactions3d', label: 'Quelles interactions souhaitez-vous explorer ?', type: 'multiselect',
        exclusiveValues: ['unknown'],
        options: [
          { value: 'rotate', label: 'Faire tourner l’objet' },
          { value: 'zoom', label: 'Zoomer sur les détails' },
          { value: 'hotspots', label: 'Afficher des points d’information' },
          { value: 'animation', label: 'Déclencher une animation' },
          { value: 'variants', label: 'Changer une couleur ou une variante' },
          { value: 'unknown', label: 'À définir ensemble' },
        ],
      },
      {
        id: 'variants3d', label: 'Quelles variantes ou informations faut-il présenter ?', type: 'textarea',
        hint: 'Par exemple : couleurs, matériaux, configurations, dimensions ou légendes. Laissez vide si ce n’est pas nécessaire.',
      },
      {
        id: 'placement3d', label: 'Où la 3D doit-elle apparaître ?', type: 'select',
        options: [
          { value: 'home', label: 'Sur l’accueil' },
          { value: 'product', label: 'Sur une page produit ou projet' },
          { value: 'dedicated', label: 'Dans une expérience dédiée' },
          { value: 'unknown', label: 'À définir ensemble' },
        ],
      },
    ] },
    { id: 'delivery', title: 'Le site autour de la 3D', questions: [pages, contentReady, references, bookingDetails, ...optionDetails, domainHosting, deadline, constraints] },
  ],
  'sur-mesure': [
    { id: 'project', title: 'Votre activité et votre objectif', questions: [activity, { ...audience, required: false }, { ...primaryAction, required: false }] },
    { id: 'scenario', title: 'Un cas d’usage concret', questions: [
      {
        id: 'scenario', label: 'Décrivez une utilisation du début à la fin.', type: 'textarea', required: true,
        hint: 'Par exemple : un visiteur découvre un univers visuel, explore les projets puis vous contacte ; ou une personne fait une demande et retrouve son suivi dans un espace.',
      },
      {
        id: 'actors', label: 'Qui intervient et que fait chaque personne ?', type: 'textarea', required: true,
        hint: 'Un visiteur qui explore le site peut suffire. Si plusieurs personnes interviennent, précisez leurs actions et leurs droits : client, collaborateur, partenaire…',
      },
      {
        ...workflow,
        label: 'Quelles validations ou exceptions particulières faut-il prévoir ?',
        hint: 'Par exemple : une demande à approuver, un paiement refusé, une annulation ou une modification après validation.',
      },
    ] },
    { id: 'data', title: 'Les données et les outils', questions: [
      {
        id: 'dataNeeds', label: 'Le site doit-il enregistrer ou gérer des informations ?', type: 'select',
        options: [
          { value: 'yes', label: 'Oui' },
          { value: 'no', label: 'Non' },
          { value: 'unknown', label: 'À définir ensemble' },
        ],
      },
      { ...dataFields, required: false, showWhen: { field: 'dataNeeds', values: ['yes'] } },
      integrations, bookingDetails, storeDetails, ...optionDetails, contentReady, domainHosting,
    ] },
    { id: 'priorities', title: 'Les priorités et le résultat attendu', questions: [
      {
        id: 'priorities', label: 'Qu’est-ce qui est indispensable au lancement et qu’est-ce qui peut attendre ?', type: 'textarea', required: true,
        hint: 'Deux listes courtes suffisent. Si tout n’est pas encore décidé, indiquez-le.',
      },
      {
        id: 'successCriteria', label: 'À quoi verrez-vous que le projet répond à votre besoin ?', type: 'textarea',
        hint: 'Par exemple : des réalisations faciles à explorer, un univers visuel fidèle à votre identité, un parcours plus court ou une tâche réalisable sans tableur.',
      },
      pages, references, budget, deadline, constraints,
    ] },
  ],
  evolution: [
    { id: 'existing', title: 'Votre site actuel', questions: [activity, { ...audience, required: false }, primaryAction, currentUrl] },
    { id: 'changes', title: 'Les changements souhaités', questions: [
      {
        id: 'requestedChanges', label: 'Que souhaitez-vous modifier ou ajouter précisément ?', type: 'textarea', required: true,
        hint: 'Pour chaque changement : la page ou fonction concernée, ce qui se passe aujourd’hui et le résultat souhaité. Indiquez ce qui est prioritaire.',
      },
      {
        id: 'preserve', label: 'Que faut-il conserver tel quel ?', type: 'textarea', required: true,
        hint: 'Par exemple : identité visuelle, textes, parcours, fonctions ou données. Vous pouvez indiquer « À préciser ensemble ».',
      },
      pages,
    ] },
    { id: 'technical', title: 'Les outils et les accès', questions: [
      platform, platformDetails,
      {
        id: 'dataTools', label: 'Quelles données ou quels outils sont liés aux changements ?', type: 'textarea',
        hint: 'Par exemple : comptes, formulaires, réservations, paiement, CRM ou imports. Décrivez les types de données sans transmettre de données personnelles.',
      },
      availableAccess,
    ] },
    { id: 'delivery', title: 'Les contenus et les contraintes', questions: [contentReady, references, budget, deadline,
      { ...constraints, hint: 'Indiquez notamment les périodes ou fonctions à ne pas interrompre : réservations, commandes, campagne en cours…' },
    ] },
  ],
  refonte: [
    { id: 'existing', title: 'Votre activité et votre site actuel', questions: [activity, { ...audience, required: false }, primaryAction, currentUrl] },
    { id: 'direction', title: 'Ce qui doit changer et rester', questions: [
      {
        id: 'currentProblems', label: 'Quels problèmes motivent la refonte ?', type: 'textarea', required: true,
        hint: 'Précisez des situations concrètes : navigation difficile, présentation dépassée, contenus difficiles à gérer, fonction manquante…',
      },
      {
        id: 'preserve', label: 'Qu’est-ce qui fonctionne et doit être conservé ?', type: 'textarea', required: true,
        hint: 'Par exemple : pages utiles, identité, contenus, fonctions ou habitudes des utilisateurs. Indiquez aussi ce qui reste à évaluer.',
      },
      {
        id: 'newStructure', label: 'Avez-vous une nouvelle organisation des pages en tête ?', type: 'textarea',
        hint: 'Listez les pages à garder, regrouper, ajouter ou supprimer, ou indiquez « À définir ensemble ».',
      },
      {
        id: 'contentMigration', label: 'Quels contenus faut-il reprendre ou préparer ?', type: 'textarea',
        hint: 'Textes, photos, articles, documents, traductions… Précisez ce qui peut être repris et ce qui est à revoir.',
      },
      {
        id: 'migrationVolume', label: 'Quelle quantité de contenus faut-il reprendre environ ?', type: 'text',
        hint: 'Pages, articles, produits ou documents. Une estimation ou « Je ne sais pas » suffit.',
      },
      references,
    ] },
    { id: 'migration', title: 'La reprise du site et du référencement', questions: [
      platform, platformDetails,
      availableAccess,
      {
        id: 'existingUrls', label: 'Quelles adresses de pages sont importantes à conserver ou à rediriger ?', type: 'textarea',
        hint: 'Ajoutez les liens connus, notamment ceux partagés ou bien référencés. Si le nom de domaine doit changer, indiquez la nouvelle adresse envisagée. Vous pouvez laisser cette liste à préparer avec nous.',
      },
      {
        id: 'seoTools', label: 'Disposez-vous d’informations sur le trafic ou le référencement actuel ?', type: 'select',
        options: [
          { value: 'available', label: 'Oui, des outils ou rapports sont disponibles' },
          { value: 'none', label: 'Non' },
          { value: 'unknown', label: 'Je ne sais pas' },
        ],
      },
      {
        id: 'seoDetails', label: 'Quels outils ou résultats faut-il prendre en compte ?', type: 'textarea',
        hint: 'Par exemple : Search Console, outil de mesure d’audience, pages importantes ou recherches qui vous apportent des visites. Aucun identifiant ni code d’accès.',
        showWhen: { field: 'seoTools', values: ['available'] },
      },
    ] },
    { id: 'continuity', title: 'Les données et la continuité', questions: [
      {
        id: 'dataTools', label: 'Le site contient-il des comptes, des données ou des outils connectés à reprendre ?', type: 'select',
        options: [
          { value: 'yes', label: 'Oui' },
          { value: 'no', label: 'Non' },
          { value: 'unknown', label: 'Je ne sais pas' },
        ],
      },
      {
        id: 'dataDetails', label: 'Que faut-il reprendre et avec quels outils ?', type: 'textarea', required: true,
        hint: 'Types de comptes et de données, volumes approximatifs, logiciel, paiement ou autres connexions. Aucun mot de passe, clé secrète ou donnée personnelle.',
        showWhen: { field: 'dataTools', values: ['yes'] },
      },
      {
        id: 'continuity', label: 'Quelles fonctions doivent rester disponibles pendant la transition ?', type: 'textarea',
        hint: 'Par exemple : formulaires, commandes, accès membres ou messagerie liée au domaine. Précisez les périodes à éviter.',
      },
      budget,
      deadline,
      constraints,
    ] },
  ],
  contact: [
    { id: 'request', title: 'Votre demande', questions: [
      { ...activity, required: false },
      {
        id: 'message', label: 'Décrivez brièvement votre projet', type: 'textarea', required: true,
        hint: 'Quelques mots sur votre activité, votre besoin ou votre question.',
      },
    ] },
    { id: 'timing', title: 'Votre calendrier', questions: [deadline] },
  ],
}

export function isRequestType(value: unknown): value is RequestType {
  return typeof value === 'string' && (requestTypes as readonly string[]).includes(value)
}

export function getBriefSections(requestType: RequestType): BriefSection[] {
  return isRequestType(requestType) ? [...sectionsByRequest[requestType], fileSection] : []
}

/** The public contact form is shared by the three offers and the contact page.
 * Historical questionnaires remain available to read previously saved requests.
 */
export function getContactBriefSections(): BriefSection[] {
  return [sectionsByRequest.contact[0]]
}

export function validateContactBrief(input: unknown): { answers: BriefAnswers; fields: Record<string, string> } {
  return validateBrief('contact', input, null, { contactForm: true })
}

export function emptyBrief(): BriefAnswers {
  return {}
}

export function isBriefQuestionVisible(
  question: Question,
  answers: BriefAnswers,
  configuration: Configuration | null = null,
): boolean {
  if (
    question.showForOption &&
    (!configuration || !isOptionSelected(configuration, question.showForOption))
  ) return false
  if (
    question.showForAnyOption &&
    (!configuration || !question.showForAnyOption.some(id => isOptionSelected(configuration, id)))
  ) return false
  if (question.showWhenAnswered) {
    const answer = Object.hasOwn(answers, question.showWhenAnswered) ? answers[question.showWhenAnswered] : undefined
    if (!containsAnswer(answer)) return false
  }
  const condition = question.showWhen
  if (!condition) return true
  const answer = Object.hasOwn(answers, condition.field) ? answers[condition.field] : undefined
  return typeof answer === 'string'
    ? condition.values.includes(answer)
    : Array.isArray(answer) && answer.some(value => condition.values.includes(value))
}

/** An uncertainty choice replaces precise choices; a later precise choice replaces it. */
export function toggleBriefChoice(question: Question, selected: readonly string[], value: string, checked: boolean): string[] {
  if (!checked) return selected.filter(item => item !== value)
  if (question.exclusiveValues?.includes(value)) return [value]
  return [...selected.filter(item => item !== value && !question.exclusiveValues?.includes(item)), value]
}

// Line breaks are meaningful in long answers. Other control characters, including tabs,
// are rejected before trimming so they cannot disappear during normalization.
const forbiddenControls = /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f-\u009f]/u
const lineBreaks = /[\r\n\u2028\u2029]/u

function containsAnswer(value: unknown): boolean {
  return !(value === undefined || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0))
}

function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value) || /[\s\\]/u.test(value)) return false
  const authority = value.match(/^https?:\/\/([^/?#]*)/i)?.[1]
  if (!authority || authority.includes('@')) return false
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname) && !url.username && !url.password
  } catch {
    return false
  }
}

export function validateBrief(requestType: RequestType, input: unknown, configuration: Configuration | null = null, { contactForm = false }: { contactForm?: boolean } = {}): { answers: BriefAnswers; fields: Record<string, string> } {
  const errors = new Map<string, string>()
  const answers: BriefAnswers = {}
  const result = () => ({ answers, fields: Object.fromEntries(errors) })
  if (!isRequestType(requestType)) {
    errors.set('_form', 'Choisissez un type de demande valide.')
    return result()
  }
  if (input === null || typeof input !== 'object' || Array.isArray(input)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) {
    errors.set('_form', 'Les réponses doivent être un objet de champs.')
    return result()
  }

  const questions = (contactForm ? getContactBriefSections() : getBriefSections(requestType)).flatMap(section => section.questions)
  const allowed = new Set(questions.map(question => question.id))
  const descriptors = Object.getOwnPropertyDescriptors(input)
  let totalLength = 0
  if (Object.getOwnPropertySymbols(input).length) errors.set('_form', 'Les réponses contiennent un champ inconnu.')
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!allowed.has(key)) errors.set(key, 'Ce champ ne correspond pas à cette demande.')
    if (!Object.hasOwn(descriptor, 'value')) {
      errors.set(key, 'Cette réponse doit être une valeur simple.')
      continue
    }
    const value: unknown = descriptor.value
    if (typeof value === 'string') totalLength += value.trim().length
    else if (Array.isArray(value)) {
      for (const item of value) if (typeof item === 'string') totalLength += item.trim().length
    }
  }
  if (totalLength > briefLimits.total) errors.set('_form', `L’ensemble des réponses est limité à ${briefLimits.total} caractères.`)

  // Conditions refer to earlier questions, so only validated parent values can reveal a field.
  for (const question of questions) {
    const descriptor = Object.hasOwn(descriptors, question.id) ? descriptors[question.id] : undefined
    const raw: unknown = descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined
    if (question.showWhenAnswered && errors.has(question.showWhenAnswered)) continue
    if (!isBriefQuestionVisible(question, answers, configuration)) {
      if (containsAnswer(raw)) errors.set(question.id, 'Cette question ne s’applique pas à vos réponses. Effacez sa réponse.')
      continue
    }
    if (errors.has(question.id)) continue
    if (raw === undefined) {
      if (question.required) errors.set(question.id, 'Répondez à cette question.')
      continue
    }
    if (question.type === 'multiselect') {
      if (!Array.isArray(raw) || raw.some(value => typeof value !== 'string')) {
        errors.set(question.id, 'Sélectionnez les choix proposés.')
        continue
      }
      const values = raw as string[]
      if (values.some(value => forbiddenControls.test(value) || lineBreaks.test(value))) {
        errors.set(question.id, 'Cette réponse contient un caractère non autorisé.')
        continue
      }
      const trimmed = values.map(value => value.trim())
      const options = question.options ?? []
      if (trimmed.length > options.length || trimmed.some(value => !options.some(option => option.value === value))) {
        errors.set(question.id, 'Sélectionnez uniquement les choix proposés.')
        continue
      }
      if (new Set(trimmed).size !== trimmed.length) {
        errors.set(question.id, 'Sélectionnez chaque choix une seule fois.')
        continue
      }
      if (trimmed.length > 1 && trimmed.some(value => question.exclusiveValues?.includes(value))) {
        errors.set(question.id, 'Choisissez la réponse d’incertitude seule, ou les réponses précises.')
        continue
      }
      if (trimmed.length) answers[question.id] = options.filter(option => trimmed.includes(option.value)).map(option => option.value)
      else if (question.required) errors.set(question.id, 'Sélectionnez au moins un choix.')
      continue
    }
    if (typeof raw !== 'string') {
      errors.set(question.id, 'Saisissez une réponse textuelle.')
      continue
    }
    if (forbiddenControls.test(raw) || (question.type !== 'textarea' && lineBreaks.test(raw))) {
      errors.set(question.id, 'Cette réponse contient un caractère non autorisé.')
      continue
    }
    const value = raw.replace(/\r\n?/g, '\n').trim()
    const maxLength = question.type === 'textarea' ? briefLimits.textarea : question.type === 'url' ? briefLimits.url : briefLimits.text
    if (value.length > maxLength) {
      errors.set(question.id, `Limitez cette réponse à ${maxLength} caractères.`)
      continue
    }
    if (!value) {
      if (question.required) errors.set(question.id, 'Répondez à cette question.')
      continue
    }
    if (question.type === 'select' && !question.options?.some(option => option.value === value)) {
      errors.set(question.id, 'Sélectionnez un choix proposé.')
      continue
    }
    if (question.type === 'url' && !isHttpUrl(value)) {
      errors.set(question.id, 'Indiquez une adresse http:// ou https:// sans identifiant ni mot de passe.')
      continue
    }
    if (question.httpsOnly && !/^https:\/\//i.test(value)) {
      errors.set(question.id, 'Utilisez un lien https:// pour partager vos fichiers.')
      continue
    }
    answers[question.id] = value
  }
  return result()
}

export function summarizeBrief(requestType: RequestType, input: BriefAnswers, { configuration = null, historical = false, contactForm = false }: { configuration?: Configuration | null; historical?: boolean; contactForm?: boolean } = {}): BriefSummarySection[] {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return []
  // Saved answers predate today's conditions and exclusivity rules. Never revalidate
  // those snapshots or require a newly introduced parent to display an old answer.
  if (!isRequestType(requestType)) return []
  // New offer requests store the same message field as contact requests. Existing
  // snapshots have no message field and retain their complete questionnaire.
  const compact = contactForm || (historical && requestType !== 'contact' && Object.hasOwn(input, 'message'))
  const answers = historical ? input : validateBrief(requestType, input, configuration, { contactForm: compact }).answers
  return (compact ? getContactBriefSections() : getBriefSections(requestType)).map(section => ({
    title: section.title,
    items: section.questions.flatMap(question => {
      const answer = Object.getOwnPropertyDescriptor(answers, question.id)?.value
      if (typeof answer !== 'string' && !(Array.isArray(answer) && answer.every(value => typeof value === 'string'))) return []
      if (!containsAnswer(answer) || (!historical && !isBriefQuestionVisible(question, answers, configuration))) return []
      const labelFor = (value: string) => question.options?.find(option => option.value === value)?.label ?? value
      const value = Array.isArray(answer) ? answer.map(labelFor).join(', ') : labelFor(answer.trim())
      const url = question.id === 'transferUrl' && typeof answer === 'string' && isHttpUrl(answer.trim()) && /^https:\/\//i.test(answer.trim()) ? answer.trim() : undefined
      return [{ label: question.label, value, ...(url ? { url } : {}) }]
    }),
  })).filter(section => section.items.length > 0)
}
