import { apiUrl } from './native.js'
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
  const normalized = cleanSlug(slug)
  const key = tenantKey(normalized)
  if (!key || key === 'fortress-tenant:' || !systemType) return Promise.resolve()

  fetch(apiUrl('/api/accounts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantSlug: normalized,
      tenant: {
        slug: normalized,
        systemType,
        companyName: String(name || normalized).trim(),
        brandName: String(name || normalized).trim(),
      },
    }),
  }).catch(() => {})

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
  const normalized = cleanSlug(slug)
  const key = tenantKey(normalized)
  if (!key || key === 'fortress-tenant:') return { systemType: '', name: '' }

  try {
    const localRes = await fetch(
      `${apiUrl('/api/accounts')}?tenant=${encodeURIComponent(normalized)}`,
      { headers: { Accept: 'application/json' } },
    )
    if (localRes.ok) {
      const payload = await localRes.json().catch(() => ({}))
      const tenant = payload?.tenant
      if (tenant?.systemType) {
        return {
          systemType: tenant.systemType,
          name: String(tenant.companyName || tenant.brandName || '').trim(),
        }
      }
    }
  } catch {
    /* fall through to supabase */
  }

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
