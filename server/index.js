/**
 * Fortress Vision backend.
 * Put your key in `.env` as GEMINI_API_KEY=...
 * Run: npm run server  (also started automatically by `npm run dev`)
 */

import './loadEnv.js'
import express from 'express'
import { handleVisionExtract } from './visionHandler.js'
import { handleFabBrain } from './fabBrain.js'
import { handleLiveFeedGet, handleLiveFeedPublish } from './liveFeed.js'

const app = express()
const port = Number(process.env.VISION_PORT || process.env.PORT || 8787)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  next()
})

app.use(express.json({ limit: '16mb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(String(process.env.GEMINI_API_KEY || '').trim()),
    drawingLimitPerMinute: 10,
    liveFeed: true,
  })
})

app.get('/api/live/feed', (req, res) => {
  handleLiveFeedGet(req, res)
})

app.post('/api/live/publish', (req, res) => {
  handleLiveFeedPublish(req, res)
})

app.post('/api/vision-extract', (req, res) => {
  handleVisionExtract(req, res)
})

app.post('/api/fab-brain', (req, res) => {
  handleFabBrain(req, res)
})

app.listen(port, () => {
  const hasKey = Boolean(String(process.env.GEMINI_API_KEY || '').trim())
  console.log(`Fortress Vision API on http://localhost:${port}`)
  console.log(hasKey ? 'GEMINI_API_KEY loaded from .env' : 'WARNING: GEMINI_API_KEY is missing — add it to .env')
})
