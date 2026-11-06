import assert from 'node:assert/strict'
import test from 'node:test'
import { clearDraft, configurationKey, readDraft, readPublicDraftConfiguration, saveDraftProjectOnce, writeDraft } from '../src/lib/draft.ts'
import { defaultPricing, quoteConfiguration, withOption } from '../shared/catalog.ts'
import { changePublicOffer } from '../shared/offer-options.ts'

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
    assert.equal(configurationKey(configuration), configurationKey({ ...configuration, deployment: true }), 'included deployment does not create a false draft revision')
    assert.notEqual(configurationKey(configuration), configurationKey({ ...configuration, maintenance: true }), 'monthly maintenance changes cannot reuse an already saved project')
    assert.deepEqual(Object.keys(JSON.parse([...localStorage.values.values()][0])).sort(), ['catalogueVersion', 'configuration', 'id', 'updatedAt', 'version'], 'draft stores no name, e-mail, password or content')

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

test('included mobile preserves a draft identity while paid extras change it', async () => {
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
    assert.equal(mobile.id, original.id); assert.equal(mobile.saved.projectId, 'canonical-project-1')
    assert.equal(configurationKey(mobile.configuration), configurationKey(original.configuration))
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
  assert.equal(configurationKey({ offerId: 'connecte', mobile: false, managedContent: false, extras: [] }), configurationKey({ offerId: 'connecte', mobile: true, managedContent: true, extras: ['analytics', 'analytics'] }))
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
    assert.deepEqual(restored.configuration.extras, ['portfolio-gallery', 'analytics', 'local-seo'])
    assert.equal(writeDraft(restored.configuration).id, legacy.id)
    assert.deepEqual(readDraft().saved, legacy.saved)
    legacy.configuration.offerId = 'vitrine'; delete legacy.saved
    localStorage.setItem('studio.project-draft.v1', JSON.stringify(legacy))
    assert.equal(readDraft().configuration.mobile, true); assert.deepEqual(readDraft().configuration.extras, [])
    localStorage.setItem('studio.project-draft.v1', JSON.stringify({ ...legacy, configuration: { offerId: 'vitrine', extras: ['unknown-option'] } }))
    assert.equal(readDraft(), null, 'an invalid option cannot be silently applied from localStorage')
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('old public Connecté drafts do not turn included accounts into a paid Business option', () => {
  const previousWindow = globalThis.window
  const localStorage = new MemoryStorage(); globalThis.window = { localStorage }
  try {
    const legacy = { version: 1, id: 'old-connected-draft', updatedAt: Date.now(), configuration: { offerId: 'connecte', managedContent: true, extras: ['user-accounts'] }, saved: { userId: 'old-account', projectId: 'old-project' } }
    localStorage.setItem('studio.project-draft.v1', JSON.stringify(legacy))
    const privateDraft = readDraft()
    assert.equal(privateDraft.configuration.extras.includes('user-accounts'), true, 'private restoration retains the original configuration')
    assert.deepEqual(privateDraft.saved, legacy.saved)

    const publicConfiguration = readPublicDraftConfiguration()
    assert.equal(publicConfiguration.extras.includes('user-accounts'), false)
    assert.equal(quoteConfiguration(publicConfiguration).totalCents, 149000)
    assert.equal(quoteConfiguration(changePublicOffer(publicConfiguration, 'vitrine')).totalCents, 89000, 'migration happens before changing the public offer')
    assert.equal(localStorage.getItem('studio.project-draft.v1'), JSON.stringify(legacy), 'public restoration does not mutate the saved private draft')

    const migrated = writeDraft(publicConfiguration)
    assert.notEqual(migrated.id, legacy.id, 'a changed public configuration cannot reopen an old saved project')
    assert.equal(migrated.saved, undefined)
    assert.equal(readDraft().catalogueVersion, 'public-2026-11-06-booking-v2')
    assert.deepEqual(readPublicDraftConfiguration(), publicConfiguration, 'reloading the migration is idempotent')

    writeDraft({ ...publicConfiguration, extras: [...publicConfiguration.extras, 'user-accounts'] })
    assert.equal(readPublicDraftConfiguration().extras.includes('user-accounts'), true, 'an explicit new paid selection survives reload')
    assert.equal(quoteConfiguration(readPublicDraftConfiguration()).totalCents, 179000)

    legacy.configuration = { offerId: 'vitrine', extras: ['user-accounts'] }
    localStorage.setItem('studio.project-draft.v1', JSON.stringify(legacy))
    assert.equal(readPublicDraftConfiguration().extras.includes('user-accounts'), true, 'accounts were already a paid choice in Vitrine')
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('retired roles cannot restore paid accounts while migrating an old public Connecté draft', () => {
  const previousWindow = globalThis.window
  const localStorage = new MemoryStorage(); globalThis.window = { localStorage }
  try {
    const legacy = { version: 1, id: 'old-connected-roles', updatedAt: Date.now(), configuration: { offerId: 'connecte', extras: ['user-accounts', 'member-roles', 'newsletter'] } }
    localStorage.setItem('studio.project-draft.v1', JSON.stringify(legacy))
    const migrated = readPublicDraftConfiguration()
    assert.equal(migrated.extras.includes('user-accounts'), false)
    assert.equal(migrated.extras.includes('member-roles'), false)
    assert.equal(migrated.extras.includes('newsletter'), true, 'other chosen options remain selected')
    assert.equal(quoteConfiguration(changePublicOffer(migrated, 'connecte')).totalCents, 158000, 'Business only adds the selected newsletter')
    assert.equal(readDraft().configuration.extras.includes('member-roles'), true, 'the private draft remains untouched')
    assert.equal(localStorage.getItem('studio.project-draft.v1'), JSON.stringify(legacy))
    writeDraft({ ...migrated, extras: [...migrated.extras, 'user-accounts'] })
    assert.equal(readPublicDraftConfiguration().extras.includes('user-accounts'), true, 'versioned explicit paid accounts still survive restoration')
    assert.equal(quoteConfiguration(readPublicDraftConfiguration()).totalCents, 188000)
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('former Business booking inclusions migrate once without losing other paid choices', () => {
  const previousWindow = globalThis.window
  const localStorage = new MemoryStorage(); globalThis.window = { localStorage }
  try {
    for (const catalogueVersion of [undefined, 'public-2026-11-06']) {
      const legacy = {
        version: 1, id: 'former-booking-inclusion', updatedAt: Date.now(),
        ...(catalogueVersion ? { catalogueVersion } : {}),
        configuration: { offerId: 'connecte', extras: ['booking', 'user-accounts', 'additional-language', 'online-store', 'hosting-monthly'] },
        saved: { userId: 'previous-account', projectId: 'previous-project' },
      }
      const raw = JSON.stringify(legacy)
      localStorage.setItem('studio.project-draft.v1', raw)
      const current = readPublicDraftConfiguration()
      assert.equal(current.extras.includes('booking'), false, 'an earlier Business inclusion cannot become a paid selection')
      assert.equal(current.extras.includes('user-accounts'), Boolean(catalogueVersion), 'only the version before accounts became optional loses that inclusion')
      for (const id of ['additional-language', 'online-store', 'hosting-monthly']) assert.equal(current.extras.includes(id), true, id)
      const retainedAccountsPrice = catalogueVersion ? 30000 : 0
      assert.equal(quoteConfiguration(current).totalCents, 149000 + 10000 + 60000 + retainedAccountsPrice)
      assert.equal(quoteConfiguration(current).monthlyTotalCents, 1900)
      for (const target of ['vitrine', 'connecte', 'immersif']) {
        const changed = changePublicOffer(current, target)
        assert.equal(changed.extras.includes('booking'), false, target)
        assert.equal(quoteConfiguration(changed).totalCents, defaultPricing.base[target] + 10000 + 60000 + retainedAccountsPrice)
      }
      assert.equal(localStorage.getItem('studio.project-draft.v1'), raw, 'public reading never rewrites the historical draft')
      assert.equal(readDraft().configuration.extras.includes('booking'), true, 'private restoration still reads the original selection')
      assert.deepEqual(readDraft().saved, legacy.saved)

      writeDraft(current)
      assert.deepEqual(readPublicDraftConfiguration(), current, 'the migrated public selection is stable after saving and reloading')
      assert.equal(readDraft().catalogueVersion, 'public-2026-11-06-booking-v2')
      const explicit = withOption(current, 'booking', true)
      writeDraft(explicit)
      assert.deepEqual(readPublicDraftConfiguration(), explicit, 'an intentional new paid selection survives subsequent reloads')
      assert.equal(quoteConfiguration(readPublicDraftConfiguration()).totalCents, quoteConfiguration(current).totalCents + 9000)
      assert.equal(quoteConfiguration(readPublicDraftConfiguration()).maximumTotalCents, quoteConfiguration(current).maximumTotalCents + 18000)
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('historical booking selections outside Business remain explicit paid choices', () => {
  const previousWindow = globalThis.window
  const localStorage = new MemoryStorage(); globalThis.window = { localStorage }
  try {
    for (const offerId of ['vitrine', 'immersif', 'sur-mesure']) {
      for (const catalogueVersion of [undefined, 'public-2026-11-06']) {
        localStorage.setItem('studio.project-draft.v1', JSON.stringify({
          version: 1, id: 'previous-explicit-booking', updatedAt: Date.now(),
          ...(catalogueVersion ? { catalogueVersion } : {}),
          configuration: { offerId, extras: ['booking', 'user-accounts'] },
        }))
        assert.deepEqual(readPublicDraftConfiguration(), readDraft().configuration)
        assert.equal(readPublicDraftConfiguration().extras.includes('booking'), true)
      }
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('a private auto-save cannot mark a historical Business booking inclusion as a new public choice', () => {
  const previousWindow = globalThis.window
  const localStorage = new MemoryStorage(); globalThis.window = { localStorage }
  try {
    for (const catalogueVersion of [undefined, 'public-2026-11-06']) {
      localStorage.setItem('studio.project-draft.v1', JSON.stringify({
        version: 1, id: 'private-historical-booking', updatedAt: Date.now(),
        ...(catalogueVersion ? { catalogueVersion } : {}),
        configuration: { offerId: 'connecte', extras: ['booking', 'user-accounts'] },
      }))
      const privateDraft = readDraft()
      const saved = writeDraft(privateDraft.configuration, { markCurrentCatalogue: false })
      assert.equal(saved.id, privateDraft.id)
      assert.equal(readDraft().catalogueVersion, catalogueVersion)
      assert.equal(readDraft().configuration.extras.includes('booking'), true)
      assert.equal(readPublicDraftConfiguration().extras.includes('booking'), false)
      assert.equal(readPublicDraftConfiguration().extras.includes('user-accounts'), Boolean(catalogueVersion))
    }
    clearDraft()
    writeDraft({ offerId: 'connecte', extras: ['booking'] }, { markCurrentCatalogue: false })
    assert.equal(readDraft().catalogueVersion, undefined, 'loading a historical project without an existing draft must not declare current public selections')
    assert.equal(readPublicDraftConfiguration().extras.includes('booking'), false)
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})
