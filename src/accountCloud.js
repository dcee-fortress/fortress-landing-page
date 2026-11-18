/**
 * Fortress account database.
 * The browser keeps a local copy for speed. The same-origin account API
 * writes Postgres so the email and password work on any device.
 */

import { cleanSlug } from './fortressMetadata'

const ACCOUNT_INDEX_KEY = 'fortress-account-index'

const postApi = async (body) => {
  try {
    const response = await fetch('/api/fortress-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json().catch(() => null)
    return { ok: response.ok, data }
  } catch {
    return { ok: false, data: null }
  }
}

const accountCloudKey = (email) => `fortress-account:${String(email || '').trim().toLowerCase()}`
const slugOwnerKey = (slug) => `fortress-slug-owner:${cleanSlug(slug)}`
const ceoMetaCloudKey = (slug) => `fortress-ceo-meta:${cleanSlug(slug)}`

const slimWebsite = (site) => {
  if (!site || typeof site !== 'object') return null
  const slug = cleanSlug(site.slug || site.catalogId || site.name || '')
  if (!slug) return null
  return {
    id: site.id,
    name: site.name,
    type: site.type,
    systemType: site.systemType,
    slug,
    link: site.link || `https://${slug}.fortress.vercel.app/`,
    catalogId: site.catalogId || '',
    fabPlan: site.fabPlan || '',
    paidUntil: Number(site.paidUntil) || 0,
    trialEndsAt: Number(site.trialEndsAt) || 0,
    watermarkLocked: Boolean(site.watermarkLocked),
    ceo: site.ceo || '',
    brandName: site.brandName || site.name || '',
    cssName: site.cssName || '',
    drawings: Array.isArray(site.drawings) ? site.drawings : [],
    gallery: Array.isArray(site.gallery) ? site.gallery : [],
    photoCaptions: Array.isArray(site.photoCaptions) ? site.photoCaptions : [],
    slides: Array.isArray(site.slides) ? site.slides : [],
    profilePhoto: site.profilePhoto || '',
    testimonial: site.testimonial || '',
    isShop: Boolean(site.isShop),
    items: Array.isArray(site.items) ? site.items : [],
  }
}

const slimAccount = (account) => {
  if (!account?.email) return null
  return {
    id: account.id,
    email: String(account.email).trim().toLowerCase(),
    password: account.password || '',
    websites: (account.websites || []).map(slimWebsite).filter(Boolean),
    updatedAt: Date.now(),
  }
}

const upsertRow = async (key, value) => {
  if (String(key).startsWith('fortress-account:')) {
    const result = await postApi({ op: 'save', account: value })
    return Boolean(result.ok && result.data?.ok)
  }
  const result = await postApi({ op: 'put', key, value })
  return Boolean(result.ok && result.data?.ok)
}

const deleteRow = async (key) => {
  await postApi({ op: 'delete', key })
}

const fetchRow = async (key) => {
  const result = await postApi({ op: 'get', key })
  if (!result.ok) return null
  return result.data?.value ?? null
}

/** Write one account + every subdomain ownership row into the Fortress database. */
export const persistAccountToCloud = async (account) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false
  const payload = slimAccount(account)
  if (!payload) return false

  const ok = await upsertRow(accountCloudKey(payload.email), payload)
  await Promise.all(
    (payload.websites || []).map((site) =>
      upsertRow(slugOwnerKey(site.slug), {
        email: payload.email,
        accountId: payload.id,
        slug: site.slug,
        name: site.name || site.brandName || site.slug,
        systemType: site.systemType || '',
        fabPlan: site.fabPlan || '',
        paidUntil: site.paidUntil || 0,
        trialEndsAt: site.trialEndsAt || 0,
        updatedAt: Date.now(),
      }),
    ),
  )

  if (payload.email && payload.password) {
    const index = (await fetchRow(ACCOUNT_INDEX_KEY)) || { emails: [] }
    const emails = Array.isArray(index.emails) ? index.emails.map((e) => String(e).toLowerCase()) : []
    if (!emails.includes(payload.email)) {
      emails.push(payload.email)
      await upsertRow(ACCOUNT_INDEX_KEY, { emails, updatedAt: Date.now() })
    }
  }
  return ok
}

let syncTimer = null
let lastSyncedJson = ''

/** Debounced sync after local data is already shown. */
export const syncAccountsToCloud = (accounts) => {
  if (typeof window === 'undefined') return
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return
  const payload = (Array.isArray(accounts) ? accounts : [])
    .map(slimAccount)
    .filter((account) => account?.email && account?.password)
  const json = JSON.stringify(payload)
  if (json === lastSyncedJson) return
  if (syncTimer) window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(() => {
    Promise.all(payload.map((account) => persistAccountToCloud(account))).then((results) => {
      if (results.every(Boolean)) lastSyncedJson = json
    })
  }, 350)
}

export const removeAccountFromCloud = async (email, password) => {
  const key = accountCloudKey(email)
  if (!email || key === 'fortress-account:') return
  await postApi({ op: 'remove', email, password })
}

/** Every Fortress account stored in the database, for this device. */
export const listAccountsFromCloud = async (email, password) => {
  const result = await postApi({ op: 'list', email, password })
  if (!result.ok || !Array.isArray(result.data?.accounts)) return []
  return result.data.accounts
    .filter((account) => account?.email)
    .map((account) => ({
      ...account,
      email: String(account.email).trim().toLowerCase(),
      websites: (account.websites || []).map(slimWebsite).filter(Boolean),
    }))
}

export const fetchAccountFromCloud = async (email) => {
  const key = accountCloudKey(email)
  if (!email || key === 'fortress-account:') return null
  const result = await postApi({ op: 'exists', email })
  if (!result.ok || !result.data?.exists) return null
  return { email: String(email).trim().toLowerCase() }
}

export const fetchSlugOwnerFromCloud = async (slug) => {
  const cleaned = cleanSlug(slug)
  if (!cleaned) return null
  const value = await fetchRow(slugOwnerKey(cleaned))
  if (!value?.email) return null
  return value
}

/** Login against Fortress database when this device has no local copy (cache cleared / new phone). */
export const loginAccountFromCloud = async (email, password) => {
  const result = await postApi({ op: 'login', email, password })
  const remote = result.data?.account
  if (!remote?.email) return null
  return {
    id: remote.id || `account-${String(remote.email).replace(/[^a-z0-9]+/g, '-')}`,
    email: String(remote.email).toLowerCase(),
    password: remote.password || '',
    websites: (remote.websites || []).map(slimWebsite).filter(Boolean),
  }
}

/** Restore full account that owns a subdomain (e.g. rabgraph). */
export const restoreAccountBySlugFromCloud = async (slug) => {
  const result = await postApi({ op: 'sites', slug })
  const remote = result.data?.account
  if (!remote?.email) return null
  return {
    id: remote.id,
    email: String(remote.email).toLowerCase(),
    websites: (remote.websites || []).map(slimWebsite).filter(Boolean),
  }
}

/** Merge remote accounts under local-first rules; fill gaps from cloud. */
export const mergeAccountsLocalFirst = (localList, remoteList) => {
  const local = Array.isArray(localList) ? [...localList] : []
  const remote = Array.isArray(remoteList) ? remoteList : []
  const byEmail = new Map(
    local
      .filter((a) => a?.email)
      .map((a) => [String(a.email).toLowerCase(), a]),
  )

  remote.forEach((remoteAccount) => {
    if (!remoteAccount?.email) return
    const email = String(remoteAccount.email).toLowerCase()
    const existing = byEmail.get(email)
    if (!existing) {
      byEmail.set(email, {
        id: remoteAccount.id || `account-${email.replace(/[^a-z0-9]+/g, '-')}`,
        email,
        password: remoteAccount.password || '',
        websites: (remoteAccount.websites || []).map(slimWebsite).filter(Boolean),
      })
      return
    }
    const localSites = [...(existing.websites || [])]
    ;(remoteAccount.websites || []).forEach((remoteSite) => {
      const slug = cleanSlug(remoteSite?.slug || remoteSite?.catalogId || remoteSite?.name || '')
      const idx = localSites.findIndex(
        (site) =>
          site.id === remoteSite.id ||
          cleanSlug(site.slug || site.catalogId || site.name) === slug,
      )
      if (idx < 0) {
        localSites.push(slimWebsite(remoteSite))
        return
      }
      const localSite = localSites[idx]
      localSites[idx] = {
        ...slimWebsite(remoteSite),
        ...localSite,
        paidUntil: Number(localSite.paidUntil) || Number(remoteSite.paidUntil) || 0,
        trialEndsAt: Number(localSite.trialEndsAt) || Number(remoteSite.trialEndsAt) || 0,
        watermarkLocked:
          localSite.watermarkLocked != null
            ? Boolean(localSite.watermarkLocked)
            : Boolean(remoteSite.watermarkLocked),
        fabPlan: localSite.fabPlan || remoteSite.fabPlan || '',
        drawings: localSite.drawings?.length ? localSite.drawings : remoteSite.drawings || [],
        gallery: localSite.gallery?.length ? localSite.gallery : remoteSite.gallery || [],
        slides: localSite.slides?.length ? localSite.slides : remoteSite.slides || [],
      }
    })
    byEmail.set(email, {
      ...existing,
      password: existing.password || remoteAccount.password || '',
      websites: localSites,
    })
  })

  return Array.from(byEmail.values())
}

/**
 * After cloud login / restore: cloud websites win so a wiped device gets every subdomain back.
 */
export const restoreCloudAccount = (localList, remoteAccount) => {
  if (!remoteAccount?.email) return Array.isArray(localList) ? localList : []
  const email = String(remoteAccount.email).toLowerCase()
  const local = Array.isArray(localList) ? localList : []
  const previous = local.find((account) => String(account?.email || '').toLowerCase() === email)
  const restored = {
    id: remoteAccount.id || previous?.id || `account-${email.replace(/[^a-z0-9]+/g, '-')}`,
    email,
    password: remoteAccount.password || previous?.password || '',
    websites: (remoteAccount.websites || []).map(slimWebsite).filter(Boolean),
  }
  return [...local.filter((account) => String(account?.email || '').toLowerCase() !== email), restored]
}

export const pullAccountsFromCloud = async (emails = []) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return []
  const list = Array.isArray(emails) ? emails.filter(Boolean) : []
  if (!list.length) return []
  const results = await Promise.all(list.map((item) => fetchAccountFromCloud(item)))
  return results.filter(Boolean)
}

/** Persist Rodcroft/Prixburg tenant project data so it survives logout and cache clear. */
export const persistCeoMetadataToCloud = async (slug, metadata) => {
  const cleaned = cleanSlug(slug)
  if (!cleaned || cleaned === 'rodcroft' || cleaned === 'prixburg') return false
  if (!metadata || typeof metadata !== 'object') return false
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false
  return upsertRow(ceoMetaCloudKey(cleaned), {
    ...metadata,
    slug: cleaned,
    updatedAt: Date.now(),
  })
}

export const fetchCeoMetadataFromCloud = async (slug) => {
  const cleaned = cleanSlug(slug)
  if (!cleaned) return null
  const value = await fetchRow(ceoMetaCloudKey(cleaned))
  return value && typeof value === 'object' ? value : null
}
