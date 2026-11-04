/** Detect packaged Fortress runtimes (Electron desktop / Capacitor phone). */

import { FORTRESS_ZW_ORIGIN, isFortressZwHost } from './siteConfig.js'

export const isElectronApp = () =>
  Boolean(typeof window !== 'undefined' && window.electronAPI?.isElectron)

export const isCapacitorApp = () => {
  if (typeof window === 'undefined') return false
  const cap = window.Capacitor
  if (!cap) return false
  try {
    if (typeof cap.isNativePlatform === 'function') return Boolean(cap.isNativePlatform())
  } catch {
    /* ignore */
  }
  return Boolean(cap.isNative || cap.Platform)
}

export const isNativeShell = () => isElectronApp() || isCapacitorApp()

/** Prefer packaged relative assets; Electron/Capacitor load from local files. */
export const usesFileProtocolAssets = () => isNativeShell()

/**
 * API base for vision / fab-brain / live feed.
 * Website on fortress-zw → same origin (one shared live feed).
 * Native / Electron → VITE_API_BASE or the live fortress-zw origin.
 * Local Vite → relative `/api` (proxied to :8787).
 */
export const apiBaseUrl = () => {
  const fromEnv = String(import.meta.env?.VITE_API_BASE || '').trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv

  if (typeof window !== 'undefined') {
    const host = window.location?.hostname || ''
    const protocol = window.location?.protocol || ''
    // Live website / PWA on fortress-zw — Instagram-style: site and API are one place.
    if (protocol !== 'file:' && isFortressZwHost(host)) return ''
    // Local web dev
    if (host === 'localhost' || host === '127.0.0.1') return ''
  }

  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    // Packaged desktop without env → hit the public live API so uploads match the website.
    return FORTRESS_ZW_ORIGIN
  }

  if (isCapacitorApp() || isElectronApp()) {
    return FORTRESS_ZW_ORIGIN
  }

  // Production web build on an unknown host — still prefer fortress-zw API so feeds match.
  if (import.meta.env?.PROD) return FORTRESS_ZW_ORIGIN

  return ''
}

export const apiUrl = (path = '/api/health') => {
  const base = apiBaseUrl()
  const clean = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${clean}` : clean
}
