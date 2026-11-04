export default function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.status(200).json({
    ok: true,
    live: true,
    site: 'fortress-zw',
    geminiConfigured: Boolean(String(process.env.GEMINI_API_KEY || '').trim()),
    drawingLimitPerMinute: 10,
    liveFeed: true,
  })
}
