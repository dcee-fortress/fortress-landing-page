/**
 * Backend Vision extract — Gemini key stays in process.env.GEMINI_API_KEY.
 * Rate limit: 10 drawings per minute per client IP.
 */

import { STEEL_VISION_PROMPT } from './visionPrompt.js'

export const DRAWING_RATE_LIMIT = 10
export const DRAWING_RATE_WINDOW_MS = 60_000
/** 3.8 Flash-Lite is TTS-only; use 3.5 Flash-Lite for vision/generateContent. Override with GEMINI_MODEL. */
export const GEMINI_VISION_MODEL = String(process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim()

const hitBuckets = new Map()

const parseJsonLoose = (text) => {
  const raw = String(text || '').trim()
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = fenced ? fenced[1] : raw
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('AI did not return JSON schedule')
  return JSON.parse(body.slice(start, end + 1))
}

const splitDataUrl = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('Invalid drawing data')
  return { mime: match[1], base64: match[2] }
}

export const clientIpFromRequest = (req) => {
  const forwarded = req.headers?.['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim()
  if (Array.isArray(forwarded) && forwarded[0]) return String(forwarded[0]).split(',')[0].trim()
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown'
}

export const takeDrawingSlot = (ip) => {
  const key = String(ip || 'unknown')
  const now = Date.now()
  const recent = (hitBuckets.get(key) || []).filter((stamp) => now - stamp < DRAWING_RATE_WINDOW_MS)
  if (recent.length >= DRAWING_RATE_LIMIT) {
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + DRAWING_RATE_WINDOW_MS - now) / 1000))
    return {
      ok: false,
      status: 429,
      retryAfterSec,
      remaining: 0,
      error: `Drawing limit reached: ${DRAWING_RATE_LIMIT} per minute. Try again in ${retryAfterSec}s.`,
    }
  }
  recent.push(now)
  hitBuckets.set(key, recent)
  return {
    ok: true,
    remaining: DRAWING_RATE_LIMIT - recent.length,
    limit: DRAWING_RATE_LIMIT,
  }
}

export const callGeminiVision = async (dataUrl, apiKey, corrections = '') => {
  const { mime, base64 } = splitDataUrl(dataUrl)
  const model = GEMINI_VISION_MODEL || 'gemini-3.5-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const correctionBlock = String(corrections || '').trim()
    ? `\n\nFabricator objections / corrections about a previous read of THIS drawing:\n${String(corrections).trim()}\nRevise the JSON to fix those mistakes. Prefer these corrections over the previous guess. Do not keep wrong materials from another drawing type.`
    : ''
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${STEEL_VISION_PROMPT}${correctionBlock}` },
            { inline_data: { mime_type: mime, data: base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1 },
    }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini Vision request failed')
  }
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n') || ''
  return parseJsonLoose(text)
}

/**
 * Shared request handler for Express and Vercel.
 * Expects req.method, req.body ({ dataUrl }), req headers / socket for IP.
 * Uses res.status().json() / res.setHeader() Express-style API.
 */
export const handleVisionExtract = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' })
    return
  }

  const apiKey = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim()
  if (!apiKey) {
    res.status(503).json({
      error:
        'Gemini is not configured on the server. Add GEMINI_API_KEY to the project .env (local) or Vercel Environment Variables (live).',
    })
    return
  }

  const dataUrl = req.body?.dataUrl
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    res.status(400).json({ error: 'Send { dataUrl: "data:...;base64,..." }' })
    return
  }

  // Cap payload ~12MB base64 to protect the server
  if (dataUrl.length > 16_000_000) {
    res.status(413).json({ error: 'Drawing file is too large. Use a smaller photo or compress the PDF page.' })
    return
  }

  const ip = clientIpFromRequest(req)
  const slot = takeDrawingSlot(ip)
  res.setHeader('X-RateLimit-Limit', String(DRAWING_RATE_LIMIT))
  res.setHeader('X-RateLimit-Remaining', String(slot.remaining ?? 0))
  if (!slot.ok) {
    res.setHeader('Retry-After', String(slot.retryAfterSec))
    res.status(429).json({ error: slot.error, retryAfterSec: slot.retryAfterSec })
    return
  }

  try {
    const corrections = typeof req.body?.corrections === 'string' ? req.body.corrections : ''
    const schedule = await callGeminiVision(dataUrl, apiKey, corrections)
    res.status(200).json({
      schedule,
      rateLimit: { limit: DRAWING_RATE_LIMIT, remaining: slot.remaining, windowSeconds: 60 },
    })
  } catch (error) {
    res.status(502).json({ error: error?.message || 'Vision extract failed' })
  }
}
