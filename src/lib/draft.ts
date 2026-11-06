import { normalizeConfiguration, type Configuration } from '../../shared/catalog.ts'

const KEY = 'studio.project-draft.v1'
const MAX_AGE = 30 * 24 * 60 * 60 * 1000
const PREVIOUS_CATALOGUE_VERSION = 'public-2026-11-06'
const CATALOGUE_VERSION = 'public-2026-11-06-booking-v2'
type DraftSaved = { userId: string; projectId: string }
export type ProjectDraft = { version: 1; id: string; configuration: Configuration; updatedAt: number; catalogueVersion?: typeof CATALOGUE_VERSION | typeof PREVIOUS_CATALOGUE_VERSION; saved?: DraftSaved }

function storage(): Storage | null {
  try { return typeof window === 'undefined' ? null : window.localStorage } catch { return null }
}
export function configurationKey(configuration: Configuration) {
  const config = normalizeConfiguration(configuration)
  return JSON.stringify([config.offerId, config.language, config.mobile, config.managedContent, config.scene3d, config.deployment, config.maintenance, config.extras])
}
export function readDraft(): ProjectDraft | null {
  try {
    const raw = storage()?.getItem(KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    if (value?.version !== 1 || typeof value.id !== 'string' || value.id.length > 120 || typeof value.updatedAt !== 'number' || Date.now() - value.updatedAt > MAX_AGE) return null
    const configuration = normalizeConfiguration(value.configuration)
    const saved = value.saved && typeof value.saved.userId === 'string' && typeof value.saved.projectId === 'string'
      ? { userId: value.saved.userId, projectId: value.saved.projectId } : undefined
    const catalogueVersion = ([PREVIOUS_CATALOGUE_VERSION, CATALOGUE_VERSION] as const).find(version => version === value.catalogueVersion)
    return { version: 1, id: value.id, configuration, updatedAt: value.updatedAt, ...(catalogueVersion ? { catalogueVersion } : {}), ...(saved ? { saved } : {}) }
  } catch { return null }
}
/** Restore current public choices without charging for an old included feature. */
export function readPublicDraftConfiguration(): Configuration | null {
  const draft = readDraft()
  if (!draft) return null
  if (draft.catalogueVersion === CATALOGUE_VERSION || draft.configuration.offerId !== 'connecte') return draft.configuration
  // Unversioned Connecté drafts had included accounts. The previous public
  // catalogue made accounts optional but still included booking in Business.
  // Remove only those former inclusions, without changing private restoration.
  const accountsWereIncluded = draft.catalogueVersion !== PREVIOUS_CATALOGUE_VERSION
  return normalizeConfiguration({
    ...draft.configuration,
    extras: draft.configuration.extras.filter(id =>
      id !== 'booking' && (!accountsWereIncluded || (id !== 'user-accounts' && id !== 'member-roles')),
    ),
  })
}
function persist(draft: ProjectDraft) { try { storage()?.setItem(KEY, JSON.stringify(draft)) } catch { /* Configuration remains usable when storage is unavailable. */ } }
export function writeDraft(configuration: Configuration, { markCurrentCatalogue = true }: { markCurrentCatalogue?: boolean } = {}): ProjectDraft {
  const normalized = normalizeConfiguration(configuration)
  const previous = readDraft()
  const draft: ProjectDraft = previous && configurationKey(previous.configuration) === configurationKey(normalized)
    ? { ...previous, ...(markCurrentCatalogue ? { catalogueVersion: CATALOGUE_VERSION } : {}), updatedAt: Date.now() }
    : { version: 1, id: crypto.randomUUID(), configuration: normalized, ...(markCurrentCatalogue ? { catalogueVersion: CATALOGUE_VERSION } : {}), updatedAt: Date.now() }
  persist(draft)
  return draft
}
export function clearDraft() { try { storage()?.removeItem(KEY) } catch { /* Storage is optional. */ } }

// A mount/StrictMode replay joins the same promise. Only non-sensitive configuration
// and the resulting project identifier are stored; credentials and content never are.
const pending = new Map<string, Promise<string>>()
const completed = new Map<string, string>()
export async function saveDraftProjectOnce(userId: string, draft: ProjectDraft, create: (configuration: Configuration) => Promise<{ id: string }>): Promise<string> {
  const key = `${userId}:${draft.id}`
  if (draft.saved?.userId === userId) return draft.saved.projectId
  const remembered = completed.get(key)
  if (remembered) return remembered
  const existing = pending.get(key)
  if (existing) return existing
  const promise = Promise.resolve().then(() => create(draft.configuration)).then(project => {
    completed.set(key, project.id)
    if (completed.size > 30) completed.delete(completed.keys().next().value!)
    const current = readDraft()
    if (current?.id === draft.id) persist({ ...current, saved: { userId, projectId: project.id }, updatedAt: Date.now() })
    return project.id
  }).finally(() => { pending.delete(key) })
  pending.set(key, promise)
  return promise
}
