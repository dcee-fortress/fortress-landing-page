import { cleanSlug } from './fortressMetadata'

const SUPABASE_URL = 'https://pgnqepcbexuinunibjel.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ysojUq8s_bI2AY-CN8jrlw_Jl7GWsZQ'

const tenantKey = (slug) => `fortress-tenant:${cleanSlug(slug)}`

const headers = (extra = {}) => ({
  apikey: SUPABASE_KEY,
  Accept: 'application/json',
  ...extra,
})

export const publishTenantKind = (slug, systemType, name = '') => {
  const key = tenantKey(slug)
  if (!key || key === 'fortress-tenant:' || !systemType) return Promise.resolve()
  return fetch(`${SUPABASE_URL}/rest/v1/prixburg_data?on_conflict=key`, {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify({
      key,
      value: { systemType, name: String(name || '').trim() },
      updated_at: new Date().toISOString(),
    }),
  }).catch(() => {})
}

export const fetchTenantRecord = async (slug) => {
  const key = tenantKey(slug)
  if (!key || key === 'fortress-tenant:') return { systemType: '', name: '' }
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prixburg_data?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: headers() },
    )
    if (!response.ok) return { systemType: '', name: '' }
    const rows = await response.json()
    const value = rows?.[0]?.value || {}
    const kind = value.systemType
    return {
      systemType: kind === 'manufacturing' || kind === 'construction' || kind === 'fabrication' ? kind : '',
      name: String(value.name || '').trim(),
    }
  } catch {
    return { systemType: '', name: '' }
  }
}

export const fetchTenantKind = async (slug) => (await fetchTenantRecord(slug)).systemType
