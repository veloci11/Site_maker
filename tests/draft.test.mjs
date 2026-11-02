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
