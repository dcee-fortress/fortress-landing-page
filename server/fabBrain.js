/**
 * Fabrication brain — Gemini text Q&A for gate/drawing formula explanations
 * and correction assessment (learns preferred calculation methods).
 */

export const GEMINI_BRAIN_MODEL = String(process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim()

const parseJsonLoose = (text) => {
  const raw = String(text || '').trim()
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = fenced ? fenced[1] : raw
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('AI did not return JSON')
  return JSON.parse(body.slice(start, end + 1))
}

export const callGeminiFabBrain = async ({
  apiKey,
  mode = 'explain',
  question = '',
  context = {},
} = {}) => {
  const model = GEMINI_BRAIN_MODEL || 'gemini-3.5-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

  const gate = context.gate || {}
  const lines = Array.isArray(context.lines) ? context.lines : []
  const lineBlurb = lines
    .map((row) => `- ${row.material}: ${row.quantity} ${row.unitLabel || ''} · formula: ${row.formula || '—'}`)
    .join('\n')

  const system = `You are Fortress fabrication brain (Zimbabwe steel / gate QS), speaking like a careful ChatGPT / Perplexity / Gemini fabricator tutor.
Always explain WHY a formula term exists (e.g. why 3×height middle verticals appear in a 50×50 frame).
Be concrete with the user's numbers. Prefer short paragraphs + bullet steps.
If assessing a correction, judge whether the user's formula is a valid alternate take-off method for a gate frame (not just "wrong"), and propose how Fortress should calculate next time.

Return ONLY JSON:
{
  "reply": "markdown-friendly explanation for the user",
  "adopt": true|false,
  "reason": "why adopt or reject",
  "methodPatch": {
    "tube50": {
      "middleVerticals": number|null,
      "formulaHint": "string human formula template",
      "notes": "string"
    }
  }|null
}
For mode=explain, set adopt=false and methodPatch=null unless the user clearly teaches a new method.
For mode=assess_correction, set adopt=true when the correction is a coherent fabrication method (even if different from Fortress default).`

  const userBlock =
    mode === 'assess_correction'
      ? `Mode: assess_correction
User correction / preferred formula:
${question}

Current gate: width=${gate.width}m height=${gate.height}m type=${gate.gateType} design=${gate.design} spacing=${gate.spacing}
Current materials:
${lineBlurb || '(none)'}

Assess the correction. If it should become the new default for 50×50 frame (or named material), set adopt=true and fill methodPatch.tube50 (e.g. middleVerticals: 0 if they removed the three mid uprights).`
      : `Mode: explain
User question:
${question}

Current gate: width=${gate.width}m height=${gate.height}m type=${gate.gateType} design=${gate.design} spacing=${gate.spacing}
Current materials:
${lineBlurb || '(none)'}

Default Fortress 50×50 frame method (one leaf):
leafL×2 (top + bottom rails) + height×2 (two end posts) + 3×height (three intermediate verticals for stiffness) + leafL (one extra mid/lock rail).
Sliding adds 0.4m overlap to opening length. Swing-double doubles leaf quantities.

Answer the question with that method, using THIS gate's numbers. If they propose an alternate, explain the difference clearly.`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${system}\n\n${userBlock}` }] }],
      generationConfig: { temperature: 0.2 },
    }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini fab-brain request failed')
  }
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n') || ''
  return parseJsonLoose(text)
}

export const handleFabBrain = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim()
  if (!apiKey) {
    res.status(503).json({ error: 'GEMINI_API_KEY missing on server' })
    return
  }
  const body = req.body || {}
  try {
    const result = await callGeminiFabBrain({
      apiKey,
      mode: body.mode === 'assess_correction' ? 'assess_correction' : 'explain',
      question: body.question || body.text || '',
      context: body.context || {},
    })
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Fab brain failed' })
  }
}
