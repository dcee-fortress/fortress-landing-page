/**
 * Fortress account database (Supabase prixburg_data).
 * Local UI first, then durable cloud copy so subdomain accounts survive
 * cache clears, logout, and other devices.
 */

import { cleanSlug } from './fortressMetadata'

const SUPABASE_URL = 'https://pgnqepcbexuinunibjel.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ysojUq8s_bI2AY-CN8jrlw_Jl7GWsZQ'
const ACCOUNT_INDEX_KEY = 'fortress-account-index'

const headers = (extra = {}) => ({
  apikey: SUPABASE_KEY,
  Accept: 'application/json',
  ...extra,
})

const accountCloudKey = (email) => `fortress-account:${String(email || '').trim().toLowerCase()}`
const slugOwnerKey = (slug) => `fortress-slug-owner:${cleanSlug(slug)}`

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
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/prixburg_data?on_conflict=key`, {
      method: 'POST',
      headers: headers({
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify({
        key,
        value,
        updated_at: new Date().toISOString(),
      }),
    })
    return response.ok
  } catch {
    return false
  }
}

const deleteRow = async (key) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/prixburg_data?key=eq.${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: headers({ Prefer: 'return=minimal' }),
    })
  } catch {
    /* ignore */
  }
}

const fetchRow = async (key) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prixburg_data?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: headers() },
    )
    if (!response.ok) return null
    const rows = await response.json()
    return rows?.[0]?.value ?? null
  } catch {
    return null
  }
}

const isLiveAccount = (account) =>
  Boolean(
    account?.email &&
      (account.websites || []).some((site) => cleanSlug(site?.slug || site?.catalogId || site?.name || '')),
  )

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

  if (isLiveAccount(payload)) {
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
    .filter((account) => account && isLiveAccount(account))
  const json = JSON.stringify(payload)
  if (json === lastSyncedJson) return
  if (syncTimer) window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(() => {
    lastSyncedJson = json
    payload.forEach((account) => {
      void persistAccountToCloud(account)
    })
  }, 350)
}

export const removeAccountFromCloud = async (email) => {
  const key = accountCloudKey(email)
  if (!email || key === 'fortress-account:') return
  const remote = await fetchAccountFromCloud(email)
  await deleteRow(key)
  if (remote?.websites?.length) {
    await Promise.all(
      remote.websites.map((site) => {
        const slug = cleanSlug(site?.slug || '')
        return slug ? deleteRow(slugOwnerKey(slug)) : Promise.resolve()
      }),
    )
  }
  const index = (await fetchRow(ACCOUNT_INDEX_KEY)) || { emails: [] }
  const emails = (Array.isArray(index.emails) ? index.emails : []).filter(
    (item) => String(item).toLowerCase() !== String(email).trim().toLowerCase(),
  )
  await upsertRow(ACCOUNT_INDEX_KEY, { emails, updatedAt: Date.now() })
}

export const fetchAccountFromCloud = async (email) => {
  const key = accountCloudKey(email)
  if (!email || key === 'fortress-account:') return null
  const value = await fetchRow(key)
  return value?.email ? value : null
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
  const remote = await fetchAccountFromCloud(email)
  if (!remote?.email) return null
  if (String(remote.password || '') !== String(password || '')) return null
  return {
    id: remote.id || `account-${String(remote.email).replace(/[^a-z0-9]+/g, '-')}`,
    email: String(remote.email).toLowerCase(),
    password: remote.password || '',
    websites: (remote.websites || []).map(slimWebsite).filter(Boolean),
  }
}

/** Restore full account that owns a subdomain (e.g. rabgraph). */
export const restoreAccountBySlugFromCloud = async (slug) => {
  const owner = await fetchSlugOwnerFromCloud(slug)
  if (!owner?.email) return null
  return fetchAccountFromCloud(owner.email)
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
  const restored = {
    id: remoteAccount.id || `account-${email.replace(/[^a-z0-9]+/g, '-')}`,
    email,
    password: remoteAccount.password || '',
    websites: (remoteAccount.websites || []).map(slimWebsite).filter(Boolean),
  }
  const local = Array.isArray(localList) ? localList.filter((a) => String(a?.email || '').toLowerCase() !== email) : []
  return [...local, restored]
}

export const pullAccountsFromCloud = async (emails = []) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return []
  const list = Array.isArray(emails) ? emails.filter(Boolean) : []
  if (!list.length) return []
  const results = await Promise.all(list.map((item) => fetchAccountFromCloud(item)))
  return results.filter(Boolean)
}
