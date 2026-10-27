/** Intelligent steel-drawing brain: Vision extract → master template → auto schedule */

export const FAB_MASTER_KEY = 'fortress-fab-master-template-v1'

const SECTION_ALIASES = [
  { test: /h\s*120|120\s*[x×]\s*120/i, priceKey: 'h120PerM', defaultRate: '18', role: 'Columns' },
  { test: /pfc\s*150|150\s*[x×]\s*75/i, priceKey: 'pfc150PerM', defaultRate: '14', role: 'Rafters' },
  { test: /lc\s*150|150\s*lip|c\s*150/i, priceKey: 'lc150PerM', defaultRate: '7.50', role: 'Purlins' },
  { test: /lc\s*125|125\s*lip|c\s*125/i, priceKey: 'lc125PerM', defaultRate: '6.50', role: 'Purlins' },
  { test: /lc\s*100|100\s*lip|c\s*100/i, priceKey: 'lc100PerM', defaultRate: '5.20', role: 'Girts' },
  { test: /l\s*50|50\s*[x×]\s*50/i, priceKey: 'angle50PerM', defaultRate: '3.50', role: 'Braces' },
  { test: /plate|200\s*[x×]\s*200|base\s*plate/i, priceKey: 'platePerKg', defaultRate: '1.80', role: 'Plates' },
  { test: /m16.*8\.8|8\.8.*m16/i, priceKey: 'boltM16_88', defaultRate: '1.20', role: 'Bolts M16 8.8' },
  { test: /m16.*hd|hd.*m16|m16/i, priceKey: 'boltM16', defaultRate: '1.20', role: 'Bolts M16' },
  { test: /m12/i, priceKey: 'boltM12', defaultRate: '0.80', role: 'Bolts M12' },
]

export const emptyMasterTemplate = () => ({
  learned_from: '6x4.7m Workshop',
  learned_count: 1,
  patterns: {
    columns: 'H 120x120',
    rafters: 'PFC 150x75',
    purlins: 'LC 125',
    girts: 'LC 100',
    braces: 'L 50x50x5',
    has_steel_schedule: true,
    has_base_plates: true,
    formula: 'Total_Material = SUM(length * price) * 1.10',
    known_sections: [
      'H 120x120',
      'PFC 150x75',
      'LC 125',
      'LC 100',
      'L 50x50x5',
      '200x200x10',
      'M16 HD',
      'M16 8.8',
      'M12',
    ],
  },
  extractions: [],
  updatedAt: Date.now(),
})

export const loadMasterTemplate = () => {
  if (typeof window === 'undefined') return emptyMasterTemplate()
  try {
    return { ...emptyMasterTemplate(), ...JSON.parse(window.localStorage.getItem(FAB_MASTER_KEY) || '{}') }
  } catch {
    return emptyMasterTemplate()
  }
}

export const saveMasterTemplate = (master) => {
  try {
    window.localStorage.setItem(FAB_MASTER_KEY, JSON.stringify(master))
  } catch {
    /* ignore */
  }
}

const slugId = (text) =>
  String(text || 'item')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24) || 'item'

export const matchSectionMeta = (size = '', roleHint = '') => {
  const hay = `${roleHint} ${size}`
  const hit = SECTION_ALIASES.find((item) => item.test.test(hay) || item.test.test(size))
  if (hit) return hit
  const key = `custom_${slugId(size)}`
  return {
    priceKey: key,
    defaultRate: '5.00',
    role: roleHint || 'Steel member',
    custom: true,
  }
}

const flattenExtracted = (extracted = {}) => {
  const rows = []
  const pushGroup = (list, role) => {
    ;(list || []).forEach((item, index) => {
      const size = item.size || item.section || item.grade || 'Unknown'
      const qty = Number(item.qty) || 0
      const total =
        Number(item.total_m) ||
        (Number(item.length_m) && qty ? Number(item.length_m) * qty : 0) ||
        0
      const meta = matchSectionMeta(size, role)
      const isPlate = /plate/i.test(role) || /plate|200x200/i.test(size)
      const isBolt = /bolt/i.test(role) || /^m\d+/i.test(size)
      rows.push({
        id: `${slugId(role)}-${slugId(size)}-${index}`,
        role: meta.role || role,
        section: size,
        unit: isPlate ? 'kg' : isBolt ? 'qty' : 'm',
        qty: String(qty || ''),
        meters: String(total || ''),
        kgEach: isPlate ? '3.14' : '',
        priceKey: meta.priceKey,
        defaultRate: meta.defaultRate,
        custom: Boolean(meta.custom),
      })
    })
  }
  pushGroup(extracted.columns, 'Columns')
  pushGroup(extracted.rafters, 'Rafters')
  pushGroup(extracted.purlins, 'Purlins')
  pushGroup(extracted.girts, 'Girts')
  pushGroup(extracted.braces, 'Braces')
  pushGroup(extracted.plates, 'Plates')
  pushGroup(extracted.bolts, 'Bolts')
  ;(extracted.other || []).forEach((item, index) => {
    const size = item.size || 'Other'
    const meta = matchSectionMeta(size, item.role || 'Other')
    rows.push({
      id: `other-${slugId(size)}-${index}`,
      role: item.role || meta.role,
      section: size,
      unit: item.unit || 'm',
      qty: String(item.qty || ''),
      meters: String(item.total_m || ''),
      kgEach: '',
      priceKey: meta.priceKey,
      defaultRate: meta.defaultRate,
      custom: Boolean(meta.custom),
    })
  })
  return rows
}

export const mergeScheduleWithExtraction = (extracted, previousSchedule = []) => {
  const extractedRows = flattenExtracted(extracted)
  if (!extractedRows.length) {
    return {
      schedule: previousSchedule,
      addedSections: [],
      pricingUpdates: {},
      building: extracted?.building || null,
    }
  }
  const byKey = new Map()
  previousSchedule.forEach((row) => {
    byKey.set(`${row.role}|${row.section}|${row.priceKey}`, row)
  })
  const addedSections = []
  const pricingUpdates = {}
  extractedRows.forEach((row) => {
    const key = `${row.role}|${row.section}|${row.priceKey}`
    const prev = byKey.get(key)
    byKey.set(key, {
      ...(prev || {}),
      ...row,
      qty: row.qty || prev?.qty || '',
      meters: row.meters || prev?.meters || '',
      kgEach: row.kgEach || prev?.kgEach || '',
    })
    if (!prev) addedSections.push(row.section)
    if (row.priceKey) pricingUpdates[row.priceKey] = row.defaultRate
  })
  return {
    schedule: [...byKey.values()],
    addedSections: [...new Set(addedSections)],
    pricingUpdates,
    building: extracted?.building || null,
  }
}

export const updateMasterFromExtraction = (master, extracted, label = 'New drawing') => {
  const next = {
    ...emptyMasterTemplate(),
    ...master,
    patterns: { ...emptyMasterTemplate().patterns, ...(master?.patterns || {}) },
  }
  const known = new Set(next.patterns.known_sections || [])
  const rows = flattenExtracted(extracted)
  rows.forEach((row) => {
    if (row.section) known.add(row.section)
  })
  if (extracted?.columns?.[0]?.size) next.patterns.columns = extracted.columns[0].size
  if (extracted?.rafters?.[0]?.size) next.patterns.rafters = extracted.rafters[0].size
  if (extracted?.purlins?.[0]?.size) next.patterns.purlins = extracted.purlins[0].size
  if (extracted?.girts?.[0]?.size) next.patterns.girts = extracted.girts[0].size
  if (extracted?.braces?.[0]?.size) next.patterns.braces = extracted.braces[0].size
  next.patterns.has_steel_schedule = true
  next.patterns.has_base_plates = Boolean(extracted?.plates?.length || next.patterns.has_base_plates)
  next.patterns.known_sections = [...known]
  next.patterns.formula = 'Total_Material = SUM(length * price) * 1.10'
  next.learned_from = extracted?.building?.name || label || next.learned_from
  next.learned_count = (next.learned_count || 0) + 1
  next.extractions = [
    {
      at: Date.now(),
      label: next.learned_from,
      building: extracted?.building || null,
      sections: rows.map((row) => row.section),
    },
    ...(next.extractions || []).slice(0, 19),
  ]
  next.updatedAt = Date.now()
  saveMasterTemplate(next)
  return next
}

const splitDataUrl = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('Invalid drawing data')
  return { mime: match[1], base64: match[2] }
}

/** Calls Fortress backend — Gemini API key never leaves the server. Limit: 10 drawings / min. */
export const extractSteelScheduleWithGemini = async (dataUrl) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('Gemini needs internet. Switch to Tesseract (free, on-device) for offline reads.')
  }
  splitDataUrl(dataUrl) // validate early
  const response = await fetch('/api/vision-extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.error || 'Vision server failed')
  }
  if (!payload?.schedule) throw new Error('Vision server returned no schedule')
  return payload.schedule
}

/** Pull steel schedule rows from OCR / table text (Tesseract). */
export const parseSteelScheduleFromOcrText = (rawText = '') => {
  const text = String(rawText || '')
    .replace(/\r/g, '\n')
    .replace(/[×✕✖]/g, 'x')
    .replace(/[–—]/g, '-')
  const lines = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const buckets = {
    columns: [],
    rafters: [],
    purlins: [],
    girts: [],
    braces: [],
    plates: [],
    bolts: [],
    other: [],
  }

  const building = { length_m: null, width_m: null, height_m: null, name: null }
  const dimHit = text.match(
    /(?:span|size|building|footprint|overall)?\s*(\d+(?:\.\d+)?)\s*m\s*[x×]\s*(\d+(?:\.\d+)?)\s*m(?:\s*[x×]\s*(\d+(?:\.\d+)?)\s*m)?/i,
  )
  if (dimHit) {
    building.length_m = Number(dimHit[1]) || null
    building.width_m = Number(dimHit[2]) || null
    building.height_m = dimHit[3] ? Number(dimHit[3]) || null : null
  }
  const nameHit = text.match(/(?:project|building|workshop|carport|warehouse)[:\s-]+([A-Za-z0-9 /-]{3,40})/i)
  if (nameHit) building.name = nameHit[1].trim()

  const sectionRe =
    /\b((?:H|UB|UC|PFC|CHS|RHS|SHS|LC|L|EA|UA)\s*\d{2,3}(?:\s*[x×]\s*\d{2,3}(?:\s*[x×]\s*\d{1,2}(?:\.\d)?)?)?|\d{2,3}\s*[x×]\s*\d{2,3}\s*[x×]\s*\d{1,2}(?:\.\d)?|M\s*\d{1,2}(?:\s*(?:HD|8\.8))?)\b/i
  const numsRe = /(\d+(?:\.\d+)?)/g

  const roleFromHint = (line, size) => {
    const hay = `${line} ${size}`.toLowerCase()
    if (/column|col\b|stanchion/.test(hay) || /^h\s*\d/i.test(size) || /^ub|uc/i.test(size)) return 'columns'
    if (/rafter|beam|pfc/.test(hay)) return 'rafters'
    if (/purlin/.test(hay) || /lc\s*1[25]/i.test(size)) return 'purlins'
    if (/girt|rail/.test(hay) || /lc\s*100/i.test(size)) return 'girts'
    if (/brace|angle|cleat/.test(hay) || /^l\s*\d/i.test(size)) return 'braces'
    if (/plate|base\s*pl/.test(hay) || /\d+\s*[x×]\s*\d+\s*[x×]\s*\d+/i.test(size)) return 'plates'
    if (/bolt|m\s*\d{1,2}/i.test(hay) || /^m\s*\d/i.test(size)) return 'bolts'
    const meta = matchSectionMeta(size, '')
    if (/column/i.test(meta.role)) return 'columns'
    if (/rafter/i.test(meta.role)) return 'rafters'
    if (/purlin/i.test(meta.role)) return 'purlins'
    if (/girt/i.test(meta.role)) return 'girts'
    if (/brace/i.test(meta.role)) return 'braces'
    if (/plate/i.test(meta.role)) return 'plates'
    if (/bolt/i.test(meta.role)) return 'bolts'
    return 'other'
  }

  lines.forEach((line) => {
    if (/steel schedule|material list|bill of|drawing no|rev\b|sheet\b/i.test(line) && !sectionRe.test(line)) {
      return
    }
    const sizeMatch = line.match(sectionRe)
    if (!sizeMatch) return
    const size = sizeMatch[1].replace(/\s+/g, ' ').trim()
    const after = line.slice(sizeMatch.index + sizeMatch[0].length)
    const before = line.slice(0, sizeMatch.index)
    // Only numbers after the section size are qty / length / total (ignore mark digits like C1).
    const nums = [...after.matchAll(numsRe)].map((m) => Number(m[1])).filter((n) => Number.isFinite(n))
    let qty = 0
    let length_m = 0
    let total_m = 0
    if (nums.length >= 3) {
      qty = nums[0]
      length_m = nums[1]
      total_m = nums[2]
    } else if (nums.length === 2) {
      qty = nums[0]
      total_m = nums[1]
      length_m = qty ? Number((total_m / qty).toFixed(3)) : 0
    } else if (nums.length === 1) {
      qty = nums[0]
    }
    const bucket = roleFromHint(line, size)
    const row = {
      mark: (before.match(/\b([A-Z]{1,3}\d{0,3})\b/) || [])[1] || '',
      size,
      qty: qty || 0,
      length_m: length_m || 0,
      total_m: total_m || (qty && length_m ? qty * length_m : 0),
    }
    if (bucket === 'plates') {
      buckets.plates.push({
        mark: row.mark,
        size,
        qty: row.qty,
        thickness_mm: (size.match(/[x×]\s*(\d{1,2}(?:\.\d)?)\s*$/) || [])[1]
          ? Number((size.match(/[x×]\s*(\d{1,2}(?:\.\d)?)\s*$/) || [])[1])
          : null,
      })
      return
    }
    if (bucket === 'bolts') {
      buckets.bolts.push({ grade: /8\.8/i.test(size) ? '8.8' : /hd/i.test(size) ? 'HD' : '', size, qty: row.qty })
      return
    }
    if (bucket === 'other') {
      buckets.other.push({ role: 'Steel member', size, qty: row.qty, total_m: row.total_m, unit: 'm' })
      return
    }
    buckets[bucket].push(row)
  })

  const found =
    buckets.columns.length +
    buckets.rafters.length +
    buckets.purlins.length +
    buckets.girts.length +
    buckets.braces.length +
    buckets.plates.length +
    buckets.bolts.length +
    buckets.other.length

  if (!found) {
    throw new Error(
      'Tesseract could not find steel sizes in this drawing. Use a clearer photo of the schedule table, or try free Gemini.',
    )
  }

  return {
    building,
    ...buckets,
    notes: 'Parsed on-device with Tesseract OCR (free). Check quantities against the drawing.',
  }
}

export const extractSteelScheduleWithTesseract = async (dataUrl) => {
  const { mime } = splitDataUrl(dataUrl)
  if (/pdf/i.test(mime)) {
    throw new Error('Tesseract reads photos. Snap a picture of the schedule page, or use free Gemini for PDFs.')
  }
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  try {
    const {
      data: { text },
    } = await worker.recognize(dataUrl)
    return parseSteelScheduleFromOcrText(text)
  } finally {
    await worker.terminate()
  }
}

export const extractSteelSchedule = async (dataUrl, { provider = 'tesseract' } = {}) => {
  const mode = provider === 'openai' ? 'gemini' : provider || 'tesseract'
  if (mode === 'tesseract') return extractSteelScheduleWithTesseract(dataUrl)
  return extractSteelScheduleWithGemini(dataUrl)
}
