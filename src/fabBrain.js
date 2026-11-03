/** Client for Fortress fab-brain (Gemini explain + correction learning). */

const fabBrainUrl = () => {
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    return 'http://127.0.0.1:8787/api/fab-brain'
  }
  return '/api/fab-brain'
}

export const askFabBrain = async ({ mode = 'explain', question = '', context = {} } = {}) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('Offline — local reason will be used.')
  }
  let response
  try {
    response = await fetch(fabBrainUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, question, context }),
    })
  } catch {
    throw new Error('Could not reach fab-brain. Is `npm run dev` running?')
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.error || 'Fab brain failed')
  return payload
}

export const looksLikeCalculationQuestion = (text = '') => {
  const t = String(text).toLowerCase()
  return (
    /\bwhy\b|\breason\b|\bexplain\b|\bhow (did|do|does)\b|\bwhere (did|does)\b|\bisn'?t it|\bshould(n'?t)? it\b|\b3\s*[x×]\s*|middle vertical|formula|calculation|calc\b/.test(
      t,
    )
  )
}

export const looksLikeFormulaCorrection = (text = '') => {
  const t = String(text).toLowerCase()
  // Pure "why 3×6" → question only. "isn't it supposed to be 8.4×2+…" → correction.
  return (
    /should be|suppose[d]? to be|isn'?t it (suppose[d]?|meant)|instead of|correct (it|to|formula)|change (it )?to|use\s+[0-9]|drop (the )?middle|without middle|no middle vertical/.test(
      t,
    ) && (/[0-9]/.test(t) || /middle/.test(t))
  )
}
