import {
  isOptionIncluded,
  isPublicOffer,
  isOptionSelected,
  normalizeConfiguration,
  optionDefinitions,
  withOption,
  type Configuration,
  type OfferId,
  type OptionId,
} from './catalog.ts'

// Keep legacy IDs in the catalogue for saved dossiers; expose only approved additions.
// Blog includes its article editor. Shop includes its product editor and payment.
// A monthly plan replaces the previous plan through withOption/normalization.
export const PUBLIC_OPTIONS_BY_OFFER = {
  vitrine: [
    'additional-language', 'managed-content', 'user-accounts', 'online-payment', 'online-store',
    'blog', 'extra-pages', 'content-import', 'custom-3d', 'extra-scene-3d',
    'analytics', 'newsletter', 'hosting-monthly', 'maintenance-monthly', 'serenity-monthly',
  ],
  connecte: [
    'additional-language', 'user-accounts', 'online-payment', 'online-store',
    'blog', 'extra-pages', 'content-import', 'custom-3d', 'extra-scene-3d',
    'newsletter', 'hosting-monthly', 'maintenance-monthly', 'serenity-monthly',
  ],
  immersif: [
    'additional-language', 'user-accounts', 'online-payment', 'online-store',
    'blog', 'extra-pages', 'content-import', 'custom-3d', 'extra-scene-3d',
    'analytics', 'newsletter', 'hosting-monthly', 'maintenance-monthly', 'serenity-monthly',
  ],
  'sur-mesure': [],
} as const satisfies Record<OfferId, readonly OptionId[]>

/** Optional choices only; a selection can also cover another option (shop/payment). */
export function getPublicOptions(offer: OfferId | Configuration) {
  const configuration = normalizeConfiguration(typeof offer === 'string' ? { offerId: offer } : offer)
  const allowed = new Set<OptionId>(PUBLIC_OPTIONS_BY_OFFER[configuration.offerId])
  return optionDefinitions.filter(
    (option) => allowed.has(option.id) && !isOptionIncluded(configuration, option.id),
  )
}

/** Validate new public requests; do not apply this restriction to saved projects. */
export function getUnavailableOptions(configuration: Configuration): OptionId[] {
  const allowed = new Set<OptionId>(PUBLIC_OPTIONS_BY_OFFER[configuration.offerId])
  return optionDefinitions
    .filter(
      (option) =>
        isOptionSelected(configuration, option.id) &&
        !isOptionIncluded(configuration, option.id) &&
        !allowed.has(option.id),
    )
    .map((option) => option.id)
}

/** Prune a new public draft or a changed offer, never a historical project. */
export function prunePublicConfiguration(input: unknown): Configuration {
  let configuration = normalizeConfiguration(input)
  // Existing public drafts may still encode the former English-only choice.
  // Preserve one additional-language selection without assuming its language;
  // private normalization and saved historical dossiers remain unchanged.
  if (isPublicOffer(configuration.offerId) && configuration.language === 'fr-en') {
    configuration = normalizeConfiguration({
      ...configuration,
      language: 'fr',
      extras: [...new Set([...configuration.extras, 'additional-language'])],
    })
  }
  for (const id of getUnavailableOptions(configuration)) {
    configuration = withOption(configuration, id, false)
  }
  return configuration
}

/** Carry chosen additions across offers without turning old inclusions into fees. */
export function changePublicOffer(input: Configuration, offerId: OfferId): Configuration {
  const previous = normalizeConfiguration(input)
  if (previous.offerId === offerId) return prunePublicConfiguration(previous)
  return prunePublicConfiguration({
    ...previous,
    offerId,
    mobile: previous.mobile && !isOptionIncluded(previous, 'mobile'),
    managedContent: previous.managedContent && !isOptionIncluded(previous, 'managed-content'),
    scene3d: previous.scene3d && !isOptionIncluded(previous, 'scene-3d'),
    deployment: previous.deployment && !isOptionIncluded(previous, 'deployment'),
    extras: previous.extras.filter(id =>
      !isOptionIncluded(previous, id) &&
      // Outside Premium, this selects the first integration. Premium already
      // includes it; keeping the choice would silently request a second element.
      !(id === 'extra-scene-3d' && offerId === 'immersif' && previous.offerId !== 'immersif'),
    ),
  })
}
