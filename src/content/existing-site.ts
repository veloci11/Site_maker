// Shared by the navigation, service cards and contextual contact form.
export const existingSiteOffers = [
  {
    id: 'evolution',
    title: 'Évolution',
    href: '/contact?besoin=evolution',
    subject: 'Évolution d’un site existant',
    description: 'Ajoutez des pages ou des fonctionnalités à votre site actuel.',
    cta: 'Faire évoluer mon site',
    contactTitle: 'Faites évoluer votre site.',
    contactDescription: 'Présentez-nous votre site actuel et les ajouts souhaités.',
    messageLabel: 'Ce que vous souhaitez ajouter',
    messagePlaceholder: 'Nouvelles pages, réservation, espace utilisateur… Décrivez les ajouts souhaités.',
  },
  {
    id: 'refonte',
    title: 'Refonte',
    href: '/contact?besoin=refonte',
    subject: 'Refonte d’un site existant',
    description: 'Repensez le design et la structure de votre site actuel.',
    cta: 'Refondre mon site',
    contactTitle: 'Repensez votre site.',
    contactDescription: 'Présentez-nous votre site actuel et ce que vous souhaitez transformer.',
    messageLabel: 'Ce que vous souhaitez repenser',
    messagePlaceholder: 'Design, organisation des pages, navigation… Décrivez ce qui doit changer.',
  },
] as const

export function getExistingSiteOffer(id: unknown) {
  return existingSiteOffers.find((offer) => offer.id === id)
}
