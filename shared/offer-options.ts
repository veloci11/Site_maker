import {
  isOptionIncluded,
  isOptionSelected,
  normalizeConfiguration,
  optionDefinitions,
  withOption,
  type Configuration,
  type OfferId,
  type OptionId,
} from './catalog.ts'

// Public choices are deliberately narrower than the historical pricing catalogue.
// Vitrine stays a presentation site: accounts belong to Connecté, 3D to Immersif.
// Connecté already includes mobile, accounts and editable content; its additions
// focus on visitor actions. The shop covers catalogue and payment together.
// Immersif already includes mobile and a supplied 3D model; creating that model
// remains optional. Sur mesure lists common complements, with specific features
// described in the brief and scoped in the quote instead of an exhaustive menu.
// Deployment, maintenance and hosting remain three independent optional services.
// Backups stay in the catalogue for existing projects, outside the public menu.
export const PUBLIC_OPTIONS_BY_OFFER = {
  vitrine: [
    'mobile',
    'language-en',
    'managed-content',
    'booking',
    'portfolio-gallery',
    'extra-pages',
    'additional-language',
    'copywriting',
    'local-seo',
    'deployment',
    'maintenance-monthly',
    'hosting-monthly',
  ],
  connecte: [
    'language-en',
    'member-roles',
    'booking',
    'online-store',
    'advanced-forms',
    'blog',
    'extra-pages',
    'copywriting',
    'crm-integration',
    'deployment',
    'maintenance-monthly',
    'hosting-monthly',
  ],
  immersif: [
    'language-en',
    'managed-content',
    'booking',
    'portfolio-gallery',
    'extra-pages',
    'additional-language',
    'copywriting',
    'custom-3d',
    'local-seo',
    'deployment',
    'maintenance-monthly',
    'hosting-monthly',
  ],
  'sur-mesure': [
    'language-en',
    'managed-content',
    'booking',
    'online-store',
    'extra-pages',
    'copywriting',
    'crm-integration',
    'deployment',
    'maintenance-monthly',
    'hosting-monthly',
  ],
} as const satisfies Record<OfferId, readonly OptionId[]>

/** Optional choices only, retaining the catalogue's group and display order. */
export function getPublicOptions(offerId: OfferId) {
  const allowed = new Set<OptionId>(PUBLIC_OPTIONS_BY_OFFER[offerId])
  const base = normalizeConfiguration({ offerId })
  return optionDefinitions.filter(
    (option) => allowed.has(option.id) && !isOptionIncluded(base, option.id),
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
  for (const id of getUnavailableOptions(configuration)) {
    configuration = withOption(configuration, id, false)
  }
  return configuration
}
