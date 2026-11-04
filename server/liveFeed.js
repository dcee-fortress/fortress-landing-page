/**
 * Live public feed — shared by fortress-zw website, PWA, Electron, and Capacitor.
 * File-backed locally; on Vercel uses /tmp + in-memory so warm instances keep the feed.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MAX_ITEMS = 120
const MAX_MEDIA_CHARS = 180_000

const dataPath = () => {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'fortress-live-feed.json')
  }
  return path.join(__dirname, 'data', 'live-feed.json')
}

/** Warm-instance memory so serverless reads stay consistent within a region. */
const globalStore = () => {
  if (!globalThis.__fortressLiveFeed) {
    globalThis.__fortressLiveFeed = { items: null }
  }
  return globalThis.__fortressLiveFeed
}

const ensureStore = () => {
  const DATA_PATH = dataPath()
  const dir = path.dirname(DATA_PATH)
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      /* /tmp always exists on Vercel */
    }
  }
  if (!fs.existsSync(DATA_PATH)) {
    try {
      fs.writeFileSync(DATA_PATH, '[]', 'utf8')
    } catch {
      /* memory-only fallback */
    }
  }
}

const readFeed = () => {
  const mem = globalStore()
  if (Array.isArray(mem.items)) return mem.items
  try {
    ensureStore()
    const raw = JSON.parse(fs.readFileSync(dataPath(), 'utf8'))
    mem.items = Array.isArray(raw) ? raw : []
    return mem.items
  } catch {
    mem.items = []
    return mem.items
  }
}

const writeFeed = (items) => {
  const next = (items || []).slice(0, MAX_ITEMS)
  globalStore().items = next
  try {
    ensureStore()
    fs.writeFileSync(dataPath(), JSON.stringify(next), 'utf8')
  } catch {
    /* memory still holds the feed for this instance */
  }
}

const slimMedia = (value) => {
  const s = String(value || '')
  if (!s) return ''
  if (s.length <= MAX_MEDIA_CHARS) return s
  return ''
}

const cors = (res) => {
  res.setHeader?.('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.setHeader?.('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type')
}

const queryOf = (req) => {
  if (req.query && typeof req.query === 'object') return req.query
  try {
    const url = new URL(req.url || '', 'http://localhost')
    return Object.fromEntries(url.searchParams.entries())
  } catch {
    return {}
  }
}

export const handleLiveFeedGet = (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end?.()
    return
  }
  const since = Number(queryOf(req).since || 0)
  const items = readFeed().filter((row) => !since || Number(row.at) > since)
  res.status(200).json({
    ok: true,
    at: Date.now(),
    items,
    live: true,
    shared: true,
  })
}

export const handleLiveFeedPublish = (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end?.()
    return
  }
  const body = req.body || {}
  const id = String(body.id || `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const item = {
    id,
    at: Date.now(),
    authorId: String(body.authorId || '').slice(0, 80),
    authorName: String(body.authorName || 'Fortress user').slice(0, 80),
    caption: String(body.caption || body.testimonial || '').slice(0, 500),
    shelf: String(body.shelf || 'General').slice(0, 40),
    kind: String(body.kind || body.type || 'photo').slice(0, 20),
    photo: slimMedia(body.photo || body.src || ''),
    video: slimMedia(body.video || ''),
  }
  if (!item.photo && !item.video && !item.caption) {
    res.status(400).json({ error: 'Empty live upload' })
    return
  }
  const next = [item, ...readFeed().filter((row) => row.id !== id)].slice(0, MAX_ITEMS)
  writeFeed(next)
  res.status(200).json({ ok: true, item, shared: true })
}
