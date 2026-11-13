/**
 * Local-first account sync: UI always reads local storage first;
 * relevant account + website billing data is upserted to Supabase after.
 */

import { cleanSlug } from './fortressMetadata'

const SUPABASE_URL = 'https://pgnqepcbexuinunibjel.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ysojUq8s_bI2AY-CN8jrlw_Jl7GWsZQ'

const headers = (extra = {}) => ({
  apikey: SUPABASE_KEY,
  Accept: 'application/json',
  ...extra,
})

const accountCloudKey = (email) => `fortress-account:${String(email || '').trim().toLowerCase()}`

const slimWebsite = (site) => {
  if (!site || typeof site !== 'object') return null
  return {
    id: site.id,
    name: site.name,
    type: site.type,
    systemType: site.systemType,
    slug: cleanSlug(site.slug || site.catalogId || site.name || ''),
    link: site.link || '',
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

const upsertRow = (key, value) =>
  fetch(`${SUPABASE_URL}/rest/v1/prixburg_data?on_conflict=key`, {
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
  }).catch(() => null)

const deleteRow = (key) =>
  fetch(`${SUPABASE_URL}/rest/v1/prixburg_data?key=eq.${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: headers({ Prefer: 'return=minimal' }),
  }).catch(() => null)

let syncTimer = null
let lastSyncedJson = ''

/** Debounced sync after local data is already shown / saved. */
export const syncAccountsToCloud = (accounts) => {
  if (typeof window === 'undefined') return
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return
  const payload = (Array.isArray(accounts) ? accounts : []).map(slimAccount).filter(Boolean)
  const json = JSON.stringify(payload)
  if (json === lastSyncedJson) return
  if (syncTimer) window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(() => {
    lastSyncedJson = json
    payload.forEach((account) => {
      void upsertRow(accountCloudKey(account.email), account)
    })
  }, 400)
}

export const removeAccountFromCloud = (email) => {
  const key = accountCloudKey(email)
  if (!key.endsWith(':') && key !== 'fortress-account:') void deleteRow(key)
}

export const fetchAccountFromCloud = async (email) => {
  const key = accountCloudKey(email)
  if (!email || key === 'fortress-account:') return null
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prixburg_data?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: headers() },
    )
    if (!response.ok) return null
    const rows = await response.json()
    const value = rows?.[0]?.value
    return value?.email ? value : null
  } catch {
    return null
  }
}

/** Merge remote accounts under local-first rules: local wins on conflict; fill gaps from cloud. */
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
      // Local-first: keep local fields; only fill missing billing / identity from cloud.
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

export const pullAccountsFromCloud = async (emails = []) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return []
  const list = Array.isArray(emails) ? emails.filter(Boolean) : []
  if (!list.length) return []
  const results = await Promise.all(list.map((email) => fetchAccountFromCloud(email)))
  return results.filter(Boolean)
}
