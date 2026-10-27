import { handleVisionExtract } from '../server/visionHandler.js'

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}

export default async function handler(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      req.body = await readJsonBody(req)
    }
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }
  await handleVisionExtract(req, res)
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16mb',
    },
  },
}
