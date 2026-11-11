/**
 * Presence only. Accounts stay open on as many devices as they are signed in on.
 * Rodcroft, Prixburg, and Zantac are explicitly never locked after two devices.
 */

const WINDOW_MS = 12 * 60 * 60 * 1000
const NEVER_LOCK = new Set(['rodcroft', 'prixburg', 'zantac'])

const store = () => {
  if (!globalThis.__fortressDeviceSessions) {
    globalThis.__fortressDeviceSessions = new Map()
  }
  return globalThis.__fortressDeviceSessions
}

const bodyOf = (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return {}
}

const cors = (res) => {
  res.setHeader?.('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.setHeader?.('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type')
}

export const handleDeviceOpen = (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end?.()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' })
    return
  }
  const body = bodyOf(req)
  const accountId = String(body.accountId || body.email || '').trim()
  const deviceId = String(body.deviceId || '').trim()
  if (!accountId || !deviceId) {
    res.status(400).json({ error: 'Missing account or device' })
    return
  }
  const slugs = Array.isArray(body.slugs) ? body.slugs.map((slug) => String(slug || '').toLowerCase()) : []
  const email = String(body.email || '').toLowerCase()
  const unlimited =
    NEVER_LOCK.has(email.split('@')[0]) ||
    slugs.some((slug) => NEVER_LOCK.has(slug)) ||
    /rodcroft|prixburg|zantac/.test(email)
  const now = Date.now()
  const current = (store().get(accountId) || []).filter((row) => now - row.at < WINDOW_MS)
  const others = current.filter((row) => row.id !== deviceId)
  store().set(accountId, [...others, { id: deviceId, label: String(body.label || 'Device'), at: now }].slice(-12))
  res.status(200).json({
    ok: true,
    locked: false,
    unlimited,
    otherDevices: others.length,
    deviceCount: others.length + 1,
  })
}
