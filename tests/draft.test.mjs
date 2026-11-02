import assert from 'node:assert/strict'
import test from 'node:test'
import { clearDraft, configurationKey, readDraft, saveDraftProjectOnce, writeDraft } from '../src/lib/draft.ts'

class MemoryStorage {
  values = new Map()
  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, value) }
  removeItem(key) { this.values.delete(key) }
}

test('configuration draft survives sign-in and deduplicates concurrent save attempts', async () => {
  const previousWindow = globalThis.window
  const localStorage = new MemoryStorage()
  globalThis.window = { localStorage }
  try {
    const configuration = { offerId: 'connecte', language: 'fr-en', managedContent: false, scene3d: false }
    const draft = writeDraft(configuration)
    assert.equal(draft.configuration.managedContent, true, 'included option is normalized')
    assert.equal(readDraft().id, draft.id)
    assert.equal(writeDraft(configuration).id, draft.id, 'unchanged choices keep their save identity')

    let creates = 0
    const create = async () => {
      creates++
      await new Promise(resolve => setTimeout(resolve, 5))
      return { id: `project-${creates}` }
    }
    const ids = await Promise.all([
      saveDraftProjectOnce('account-a', draft, create),
      saveDraftProjectOnce('account-a', draft, create),
      saveDraftProjectOnce('account-a', draft, create),
    ])
    assert.deepEqual(ids, ['project-1', 'project-1', 'project-1'])
    assert.equal(creates, 1, 'React effect replay and double submission share one creation')
    assert.equal(await saveDraftProjectOnce('account-a', readDraft(), create), 'project-1')
    assert.equal(creates, 1, 'saved configuration reopens its project')
    assert.equal(await saveDraftProjectOnce('account-b', readDraft(), create), 'project-2')
    assert.equal(creates, 2, 'another account cannot reuse the original project')

    const changed = writeDraft({ ...configuration, language: 'fr' })
    assert.notEqual(changed.id, draft.id)
    assert.equal(changed.saved, undefined)
    assert.equal(configurationKey(configuration), configurationKey({ ...configuration, managedContent: true }))
    assert.notEqual(configurationKey(configuration), configurationKey({ ...configuration, deployment: true }), 'deployment changes cannot reuse an already saved project')
    assert.notEqual(configurationKey(configuration), configurationKey({ ...configuration, maintenance: true }), 'monthly maintenance changes cannot reuse an already saved project')
    assert.deepEqual(Object.keys(JSON.parse([...localStorage.values.values()][0])).sort(), ['configuration', 'id', 'updatedAt', 'version'], 'draft stores no name, e-mail, password or content')

    let attempts = 0
    const retryableCreate = async () => {
      attempts++
      if (attempts === 1) throw new Error('temporary network failure')
      return { id: 'retried-project' }
    }
    await assert.rejects(saveDraftProjectOnce('account-a', changed, retryableCreate), /temporary network failure/)
    assert.equal(await saveDraftProjectOnce('account-a', changed, retryableCreate), 'retried-project')
    assert.equal(attempts, 2, 'failed requests leave a manual retry available')

    localStorage.setItem('studio.project-draft.v1', '{invalid')
    assert.equal(readDraft(), null)
    clearDraft()
    assert.equal(readDraft(), null)
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('mobile and extras change a draft identity while canonical equivalents preserve it', async () => {
  const previousWindow = globalThis.window
  globalThis.window = { localStorage: new MemoryStorage() }
  try {
    const original = writeDraft({ offerId: 'vitrine', extras: ['blog', 'booking', 'blog'] })
    assert.deepEqual(original.configuration.extras, ['booking', 'blog'])
    const equivalent = writeDraft({ offerId: 'vitrine', mobile: false, extras: ['booking', 'blog'] })
    assert.equal(equivalent.id, original.id)
    assert.equal(configurationKey(original.configuration), configurationKey({ offerId: 'vitrine', extras: ['blog', 'booking'] }))
    let creates = 0
    const create = async () => ({ id: 'canonical-project-' + ++creates })
    await saveDraftProjectOnce('canonical-account', original, create)
    const remembered = writeDraft({ offerId: 'vitrine', extras: ['booking', 'booking', 'blog'] })
    assert.equal(remembered.id, original.id); assert.equal(remembered.saved.projectId, 'canonical-project-1')
    assert.equal(await saveDraftProjectOnce('canonical-account', remembered, create), 'canonical-project-1')
    assert.equal(creates, 1)
    const mobile = writeDraft({ ...remembered.configuration, mobile: true })
    assert.notEqual(mobile.id, original.id); assert.equal(mobile.saved, undefined)
    assert.notEqual(configurationKey(mobile.configuration), configurationKey(original.configuration))
    const extra = writeDraft({ ...mobile.configuration, extras: [...mobile.configuration.extras, 'analytics'] })
    assert.notEqual(extra.id, mobile.id); assert.equal(extra.saved, undefined)
    assert.equal(await saveDraftProjectOnce('canonical-account', extra, create), 'canonical-project-2')
    assert.equal(creates, 2, 'a new feature selection does not silently reopen an older project')
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('included and covered options do not produce false draft revisions', () => {
  assert.equal(configurationKey({ offerId: 'connecte', mobile: false, managedContent: false, extras: [] }), configurationKey({ offerId: 'connecte', mobile: true, managedContent: true, extras: ['user-accounts', 'user-accounts'] }))
  assert.equal(configurationKey({ offerId: 'immersif', mobile: false, scene3d: false }), configurationKey({ offerId: 'immersif', mobile: true, scene3d: true, extras: [] }))
  assert.equal(configurationKey({ offerId: 'vitrine', extras: ['online-store'] }), configurationKey({ offerId: 'vitrine', extras: ['online-payment', 'online-store', 'product-catalog'] }))
  assert.equal(configurationKey({ offerId: 'vitrine', extras: ['member-roles'] }), configurationKey({ offerId: 'vitrine', extras: ['user-accounts', 'member-roles'] }))
})

test('legacy drafts gain default fields without losing their saved project identity', () => {
  const previousWindow = globalThis.window
  const localStorage = new MemoryStorage(); globalThis.window = { localStorage }
  try {
    const legacy = { version: 1, id: 'legacy-draft', updatedAt: Date.now(), configuration: { offerId: 'connecte', language: 'fr-en', managedContent: false, scene3d: false, deployment: false, maintenance: false }, saved: { userId: 'legacy-account', projectId: 'legacy-project' } }
    localStorage.setItem('studio.project-draft.v1', JSON.stringify(legacy))
    const restored = readDraft()
    assert.equal(restored.id, legacy.id); assert.deepEqual(restored.saved, legacy.saved)
    assert.equal(restored.configuration.mobile, true); assert.equal(restored.configuration.managedContent, true)
    assert.deepEqual(restored.configuration.extras, ['user-accounts'])
    assert.equal(writeDraft(restored.configuration).id, legacy.id)
    assert.deepEqual(readDraft().saved, legacy.saved)
    legacy.configuration.offerId = 'vitrine'; delete legacy.saved
    localStorage.setItem('studio.project-draft.v1', JSON.stringify(legacy))
    assert.equal(readDraft().configuration.mobile, false); assert.deepEqual(readDraft().configuration.extras, [])
    localStorage.setItem('studio.project-draft.v1', JSON.stringify({ ...legacy, configuration: { offerId: 'vitrine', extras: ['unknown-option'] } }))
    assert.equal(readDraft(), null, 'an invalid option cannot be silently applied from localStorage')
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})
