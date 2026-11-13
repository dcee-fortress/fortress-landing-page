import { cleanSlug } from './fortressMetadata'
import { storage } from './storage'

const SUPABASE_URL = 'https://pgnqepcbexuinunibjel.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ysojUq8s_bI2AY-CN8jrlw_Jl7GWsZQ'

const tenantKey = (slug) => `fortress-tenant:${cleanSlug(slug)}`
const localTenantKey = (slug) => `fortress-tenant-local:${cleanSlug(slug)}`

const headers = (extra = {}) => ({
  apikey: SUPABASE_KEY,
  Accept: 'application/json',
  ...extra,
})

const normalizeKind = (kind) =>
  kind === 'manufacturing' || kind === 'construction' || kind === 'fabrication' ? kind : ''

/** Sync local mirror so subdomain boots know fabrication vs manufacturing without waiting on network. */
export const rememberLocalTenant = (slug, systemType, name = '', billing = {}) => {
  const key = localTenantKey(slug)
  if (!key || key === 'fortress-tenant-local:' || !normalizeKind(systemType)) return
  try {
    storage.setItem(
      key,
      JSON.stringify({
        systemType: normalizeKind(systemType),
        name: String(name || '').trim(),
        fabPlan: billing.fabPlan || '',
        paidUntil: Number(billing.paidUntil) || 0,
        trialEndsAt: Number(billing.trialEndsAt) || 0,
      }),
    )
  } catch {
    /* ignore */
  }
}

export const readLocalTenant = (slug) => {
  const key = localTenantKey(slug)
  if (!key || key === 'fortress-tenant-local:') {
    return { systemType: '', name: '', fabPlan: '', paidUntil: 0, trialEndsAt: 0 }
  }
  try {
    const raw = storage.getItem(key)
    if (!raw) return { systemType: '', name: '', fabPlan: '', paidUntil: 0, trialEndsAt: 0 }
    const value = JSON.parse(raw)
    return {
      systemType: normalizeKind(value?.systemType),
      name: String(value?.name || '').trim(),
      fabPlan: String(value?.fabPlan || '').trim(),
      paidUntil: Number(value?.paidUntil) || 0,
      trialEndsAt: Number(value?.trialEndsAt) || 0,
    }
  } catch {
    return { systemType: '', name: '', fabPlan: '', paidUntil: 0, trialEndsAt: 0 }
  }
}

/** Browser-inline bootstrap (index/main) can read before React storage module loads. */
export const readLocalTenantKindSync = (slug) => {
  const cleaned = cleanSlug(slug)
  if (!cleaned || typeof localStorage === 'undefined') return ''
  try {
    const raw = localStorage.getItem(`fortress-tenant-local:${cleaned}`)
    if (!raw) return ''
    return normalizeKind(JSON.parse(raw)?.systemType)
  } catch {
    return ''
  }
}

export const publishTenantKind = (slug, systemType, name = '', billing = {}) => {
  const cleaned = cleanSlug(slug)
  const kind = normalizeKind(systemType)
  const key = tenantKey(cleaned)
  if (!key || key === 'fortress-tenant:' || !kind) return Promise.resolve()
  rememberLocalTenant(cleaned, kind, name, billing)
  return fetch(`${SUPABASE_URL}/rest/v1/prixburg_data?on_conflict=key`, {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify({
      key,
      value: {
        systemType: kind,
        name: String(name || '').trim(),
        fabPlan: billing.fabPlan || '',
        paidUntil: Number(billing.paidUntil) || 0,
        trialEndsAt: Number(billing.trialEndsAt) || 0,
      },
      updated_at: new Date().toISOString(),
    }),
  }).catch(() => {})
}

export const fetchTenantRecord = async (slug) => {
  const cleaned = cleanSlug(slug)
  const local = readLocalTenant(cleaned)
  const key = tenantKey(cleaned)
  if (!key || key === 'fortress-tenant:') return local
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prixburg_data?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: headers() },
    )
    if (!response.ok) return local
    const rows = await response.json()
    const value = rows?.[0]?.value || {}
    const kind = normalizeKind(value.systemType)
    if (!kind) return local
    const record = {
      systemType: kind,
      name: String(value.name || local.name || '').trim(),
      fabPlan: String(value.fabPlan || local.fabPlan || '').trim(),
      paidUntil: Number(value.paidUntil) || Number(local.paidUntil) || 0,
      trialEndsAt: Number(value.trialEndsAt) || Number(local.trialEndsAt) || 0,
    }
    rememberLocalTenant(cleaned, record.systemType, record.name, record)
    return record
  } catch {
    return local
  }
}

export const fetchTenantKind = async (slug) => (await fetchTenantRecord(slug)).systemType
