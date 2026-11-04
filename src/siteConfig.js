/**
 * Canonical Fortress Zimbabwe live site — same feed for website, PWA, and native apps.
 * Custom domain can point here; keep hosts listed so API uses same-origin.
 */

export const FORTRESS_ZW_ORIGIN = String(
  import.meta.env?.VITE_FORTRESS_ORIGIN || 'https://fortress-zw.vercel.app',
)
  .trim()
  .replace(/\/$/, '')

export const FORTRESS_ZW_HOSTS = new Set(
  [
    'fortress-zw.vercel.app',
    'www.fortress-zw.vercel.app',
    'fortress-zw.com',
    'www.fortress-zw.com',
    'fortress-zw.co.zw',
    'www.fortress-zw.co.zw',
    // Allow override host from origin
    (() => {
      try {
        return new URL(FORTRESS_ZW_ORIGIN).host
      } catch {
        return ''
      }
    })(),
  ].filter(Boolean),
)

export const isFortressZwHost = (host = '') => {
  const h = String(host || '')
    .toLowerCase()
    .split(':')[0]
  return FORTRESS_ZW_HOSTS.has(h)
}

export const fortressZwLink = () => FORTRESS_ZW_ORIGIN

export const fortressZwLabel = () => {
  try {
    return new URL(FORTRESS_ZW_ORIGIN).host
  } catch {
    return 'fortress-zw'
  }
}
