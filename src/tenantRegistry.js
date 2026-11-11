import { cleanSlug } from './fortressMetadata'

const SUPABASE_URL = 'https://pgnqepcbexuinunibjel.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ysojUq8s_bI2AY-CN8jrlw_Jl7GWsZQ'

const tenantKey = (slug) => `fortress-tenant:${cleanSlug(slug)}`

const headers = (extra = {}) => ({
  apikey: SUPABASE_KEY,
  Accept: 'application/json',
  ...extra,
})

export const publishTenantKind = (slug, systemType) => {
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
      value: { systemType },
      updated_at: new Date().toISOString(),
    }),
  }).catch(() => {})
}

export const fetchTenantKind = async (slug) => {
  const key = tenantKey(slug)
  if (!key || key === 'fortress-tenant:') return ''
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prixburg_data?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: headers() },
    )
    if (!response.ok) return ''
    const rows = await response.json()
    const kind = rows?.[0]?.value?.systemType
    return kind === 'manufacturing' || kind === 'construction' || kind === 'fabrication' ? kind : ''
  } catch {
    return ''
  }
}
