import { apiUrl } from './native.js'
import { storage } from './storage.js'
import { cleanSlug } from './fortressMetadata.js'

const DEVICE_KEY = 'fortress-device-id-v1'

const deviceLabel = () => {
  if (typeof navigator === 'undefined') return 'This device'
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad/i.test(ua)) return 'iPhone'
  if (/Android/i.test(ua)) return 'Android'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac/i.test(ua)) return 'Mac'
  return 'This device'
}

export const getDeviceId = () => {
  if (typeof window === 'undefined') return 'server'
  try {
    const existing = storage.getItem(DEVICE_KEY)
    if (existing) return existing
    const created =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    storage.setItem(DEVICE_KEY, created)
    return created
  } catch {
    return 'this-device'
  }
}

/**
 * Every Fortress account can stay signed in on many devices.
 * Rodcroft, Prixburg, and Zantac are never locked after two devices.
 * Opening the account on another device only notifies the user.
 */
export const noteAccountDevice = async (account) => {
  if (!account?.id) return null
  const deviceId = getDeviceId()
  const known = Array.isArray(account.devices) ? account.devices : []
  const devices = [
    ...known.filter((row) => row?.id && row.id !== deviceId),
    { id: deviceId, label: deviceLabel(), at: Date.now() },
  ].slice(-12)
  const localOthers = known.filter((row) => row?.id && row.id !== deviceId).length
  let remoteOthers = 0
  try {
    const response = await fetch(apiUrl('/api/devices/open'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: account.id,
        email: account.email || '',
        deviceId,
        label: deviceLabel(),
        slugs: (account.websites || []).map((site) =>
          cleanSlug(site?.slug || site?.catalogId || site?.name || ''),
        ),
      }),
    })
    const payload = await response.json().catch(() => ({}))
    remoteOthers = Number(payload.otherDevices) || 0
  } catch {
    remoteOthers = 0
  }
  const notify = localOthers > 0 || remoteOthers > 0
  return {
    devices,
    notify,
    message: notify
      ? 'This account is open on another device. It still works on this device.'
      : '',
  }
}
