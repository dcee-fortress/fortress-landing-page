import { useEffect, useMemo, useState } from 'react'
import {
  computeSiteProjectsOverview,
  getSiteCeoMetadata,
  saveSiteCeoMetadata,
} from './fortressMetadata'
import { ensureProjectFiles, PERIOD_CHOICES } from './rodcroftCalendar'

const RODCROFT_BRAND = 'Rodcroft'

const fileListCopy = (menuView, period) => {
  const periodWord = period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'
  const placeholders = {
    daily: 'Search daily files by day, date, or id…',
    weekly: 'Search weekly files by week range or id…',
    monthly: 'Search monthly files by month, year, or id…',
  }
  const areas = {
    valuations: {
      daily: ['Daily cost', 'Click a file to open it. Daily files run from the project start through today.'],
      weekly: ['Weekly cost', 'Weekly files are created from the project start date through the current week.'],
      monthly: ['Monthly cost', 'Monthly files are created from the project start date through the current month.'],
    },
    'material-periods': {
      daily: ['Material received', 'Daily material received files from the day the project started.'],
      weekly: ['Material received', 'Weekly material received files from the project start.'],
      monthly: ['Material received', 'Monthly material received files from the project start.'],
    },
    'fuel-periods': {
      daily: ['Daily fuel consumed', 'Daily fuel consumed files from the day the project started.'],
      weekly: ['Fuel consumed', 'Weekly fuel consumed files from the project start.'],
      monthly: ['Fuel consumed', 'Monthly fuel consumed files from the project start.'],
    },
    'worker-periods': {
      daily: ['Workers', 'Daily worker files from the day the project started.'],
      weekly: ['Workers', 'Weekly worker files from the project start.'],
      monthly: ['Workers', 'Monthly worker files from the project start.'],
    },
  }
  const area = areas[menuView]?.[period] || [`${periodWord} files`, 'Files are created from the project start.']
  const materialPlaceholder =
    menuView === 'material-periods' && period === 'daily' ? 'Search daily files by date…' : null
  const fuelPlaceholder =
    menuView === 'fuel-periods' && period === 'daily' ? 'Search daily fuel consumed files' : null
  return {
    eyebrow: area[0],
    blurb: area[1],
    heading: `${periodWord} Files`,
    placeholder: materialPlaceholder || fuelPlaceholder || placeholders[period],
    rowNote: 'Ready for entry. This file stays empty until you write in it.',
  }
}

const money = (value) =>
  `$${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const rateMoney = (value) => {
  if (value === null || value === undefined || !(Number(value) > 0)) return '—'
  return `$${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`
}

const numFmt = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

function ChoiceIcon({ name }) {
  if (name === 'hard-hat') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
        <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
        <path d="M4 15v-3a6 6 0 0 1 6-6h0" />
        <path d="M14 6h0a6 6 0 0 1 6 6v3" />
      </svg>
    )
  }
  if (name === 'users') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (name === 'package') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16.5 9.4 7.55 4.24" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" y1="22" x2="12" y2="12" />
      </svg>
    )
  }
  if (name === 'fuel') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="22" x2="15" y2="22" />
        <line x1="4" y1="9" x2="14" y2="9" />
        <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
        <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
      </svg>
    )
  }
  if (name === 'shield') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}

export default function RodcroftTemplate({
  site,
  initialProjectId = '',
  initialView = 'home',
  onBack,
  onMetadataUpdated,
}) {
  const [meta, setMeta] = useState(() => getSiteCeoMetadata(site))
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState(
    () => initialProjectId || getSiteCeoMetadata(site).projects?.[0]?.id || '',
  )
  const [view, setView] = useState(() => (initialProjectId ? initialView || 'project-home' : initialView))
  const [fileQuery, setFileQuery] = useState('')
  const [fileActiveQuery, setFileActiveQuery] = useState('')
  const [showAllFiles, setShowAllFiles] = useState(false)
  const [statusNote, setStatusNote] = useState('')
  const [valQuery, setValQuery] = useState('')
  const [fuelDetailCostMode, setFuelDetailCostMode] = useState(false)
  const [entryFile, setEntryFile] = useState(null)

  // New project form
  const [newProjName, setNewProjName] = useState('')
  const [newProjStart, setNewProjStart] = useState(() => new Date().toISOString().slice(0, 10))

  // Entry drafts
  const [valDraft, setValDraft] = useState({
    description: '',
    valueEarned: '',
    production: '',
  })
  const [matDraft, setMatDraft] = useState({
    description: '',
    unit: 'm3',
    requestedQuantity: '',
    receivedQuantity: '',
    materialUsed: '',
  })
  const [fuelDraft, setFuelDraft] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: 'Diesel',
    unit: 'L',
    quantity: '',
    unitPrice: '2.05',
  })
  const [bulkFuelDraft, setBulkFuelDraft] = useState({
    liters: '',
    unitPrice: '1.96',
  })
  const [workerDraft, setWorkerDraft] = useState({
    name: '',
    role: '',
    register: 'induction',
    plant: '',
  })

  useEffect(() => {
    const loaded = getSiteCeoMetadata(site)
    setMeta(loaded)
    if (initialProjectId) {
      setActiveProjectId(initialProjectId)
      setView(initialView === 'home' ? 'project-home' : initialView)
    } else if (initialView && initialView !== 'home') {
      if (loaded.projects?.[0]?.id) setActiveProjectId(loaded.projects[0].id)
      setView(initialView)
    }
  }, [site?.id, site?.slug, initialProjectId, initialView])

  useEffect(() => {
    setFileQuery('')
    setFileActiveQuery('')
    setShowAllFiles(false)
  }, [view])

  useEffect(() => {
    document.title = RODCROFT_BRAND
    return () => {
      document.title = 'Fortress'
    }
  }, [])

  const persistMeta = (nextMeta) => {
    const saved = saveSiteCeoMetadata(site || nextMeta.slug, nextMeta)
    setMeta(saved)
    onMetadataUpdated?.(saved)
    return saved
  }

  const projects = meta.projects || []
  const activeProjects = projects.filter((p) => p.status !== 'ended')
  const currentProject =
    projects.find((p) => p.id === activeProjectId) || activeProjects[0] || projects[0] || null

  useEffect(() => {
    if (!currentProject?.id || !currentProject.startDate) return
    const files = ensureProjectFiles(currentProject.files, currentProject.startDate)
    if (files === currentProject.files) return
    const nextProjects = projects.map((project) =>
      project.id === currentProject.id ? { ...project, files } : project,
    )
    persistMeta({ ...meta, projects: nextProjects })
  }, [currentProject?.id, currentProject?.startDate, currentProject?.files, projects, meta])

  const overviews = useMemo(() => computeSiteProjectsOverview(meta), [meta])
  const currentOverview = overviews.find((o) => o.id === currentProject?.id) || overviews[0] || null

  const updateCurrentProject = (updater) => {
    if (!currentProject) return
    const nextProjects = projects.map((p) => (p.id === currentProject.id ? updater(p) : p))
    persistMeta({ ...meta, projects: nextProjects })
  }

  const handleCreateProject = (event) => {
    event.preventDefault()
    const name = newProjName.trim()
    if (!name) return
    const created = {
      id: `p-${Date.now()}`,
      name,
      code: `RC-0${projects.length + 1}`,
      location: meta.location || 'Zimbabwe',
      client: '',
      manager: meta.ceo || 'Engineer',
      status: 'active',
      startDate: newProjStart || new Date().toISOString().slice(0, 10),
      files: ensureProjectFiles(null, newProjStart || new Date().toISOString().slice(0, 10)),
      endDate: null,
      summary: `Construction and site works for ${name}.`,
      valuations: [],
      materialAnalysis: [],
      workers: [],
      fuel: {
        bulkInsertedLiters: 0,
        bulkInsertedCost: 0,
        entries: [],
      },
      sheqReports: [],
    }
    const nextProjects = [created, ...projects]
    persistMeta({ ...meta, projects: nextProjects })
    setActiveProjectId(created.id)
    setShowNewProjectModal(false)
    setNewProjName('')
    setView('project-home')
  }

  const handleAddValuation = (event) => {
    event.preventDefault()
    const desc = valDraft.description.trim()
    if (!desc) return
    const valueEarned = Number(valDraft.valueEarned) || 0
    const production = Number(valDraft.production) || 0
    updateCurrentProject((proj) => ({
      ...proj,
      valuations: [
        ...(proj.valuations || []),
        {
          id: `val-${Date.now()}`,
          fileId: entryFile?.detailView === 'work-valued' ? entryFile.id : '',
          description: desc,
          valueEarned,
          production,
        },
      ],
    }))
    setValDraft({ description: '', valueEarned: '', production: '' })
  }

  const handleAddMaterialAnalysis = (event) => {
    event.preventDefault()
    const desc = matDraft.description.trim()
    if (!desc) return
    const req = Number(matDraft.requestedQuantity) || 0
    const rec = Number(matDraft.receivedQuantity) || 0
    const used = Number(matDraft.materialUsed) || 0
    updateCurrentProject((proj) => ({
      ...proj,
      materialAnalysis: [
        ...(proj.materialAnalysis || []),
        {
          id: `ma-${Date.now()}`,
          fileId: entryFile?.detailView === 'material-analysis' || entryFile?.detailView === 'materials-overview' ? entryFile.id : '',
          description: desc,
          unit: matDraft.unit || 'm3',
          requestedQuantity: req,
          receivedQuantity: rec,
          materialLeft: req - rec,
          broughtOnSite: rec,
          materialUsed: used,
          onSiteLeft: Math.max(0, rec - used),
        },
      ],
    }))
    setMatDraft({ description: '', unit: 'm3', requestedQuantity: '', receivedQuantity: '', materialUsed: '' })
  }

  const handleAddFuel = (event) => {
    event.preventDefault()
    const qty = Number(fuelDraft.quantity) || 0
    const price = Number(fuelDraft.unitPrice) || 2.05
    if (!(qty > 0)) return
    updateCurrentProject((proj) => ({
      ...proj,
      fuel: {
        ...(proj.fuel || { bulkInsertedLiters: 0, bulkInsertedCost: 0 }),
        entries: [
          {
            id: `gr-${Date.now()}`,
            fileId: entryFile?.detailView === 'fuel-analysis' ? entryFile.id : '',
            date:
              entryFile?.detailView === 'fuel-analysis' && /^\d{4}-\d{2}-\d{2}$/.test(entryFile.id)
                ? entryFile.id
                : fuelDraft.date || new Date().toISOString().slice(0, 10),
            description: fuelDraft.description.trim() || 'Diesel',
            unit: fuelDraft.unit || 'L',
            quantity: qty,
            unitPrice: price,
            totalCost: Math.round(qty * price * 100) / 100,
          },
          ...(proj.fuel?.entries || []),
        ],
      },
    }))
    setFuelDraft({
      date: new Date().toISOString().slice(0, 10),
      description: 'Diesel',
      unit: 'L',
      quantity: '',
      unitPrice: '2.05',
    })
  }

  const handleAddBulkFuel = (event) => {
    event.preventDefault()
    const liters = Number(bulkFuelDraft.liters) || 0
    const unitPrice = Number(bulkFuelDraft.unitPrice) || 1.96
    if (!(liters > 0)) return
    updateCurrentProject((proj) => {
      const prevLiters = Number(proj.fuel?.bulkInsertedLiters) || 0
      const prevCost = Number(proj.fuel?.bulkInsertedCost) || 0
      return {
        ...proj,
        fuel: {
          ...(proj.fuel || { entries: [] }),
          bulkInsertedLiters: Math.round((prevLiters + liters) * 100) / 100,
          bulkInsertedCost: Math.round((prevCost + liters * unitPrice) * 100) / 100,
        },
      }
    })
    setBulkFuelDraft({ liters: '', unitPrice: '1.96' })
  }

  const handleAddWorker = (event) => {
    event.preventDefault()
    const name = workerDraft.name.trim()
    if (!name) return
    updateCurrentProject((proj) => ({
      ...proj,
      workers: [
        ...(proj.workers || []),
        {
          id: `w-${Date.now()}`,
          fileId: entryFile?.detailView === 'workers' ? entryFile.id : '',
          name,
          role: workerDraft.role.trim() || 'Site Crew',
          register: workerDraft.register || 'induction',
          plant: workerDraft.plant.trim(),
          presentDays: 1,
        },
      ],
    }))
    setWorkerDraft({ name: '', role: '', register: 'induction', plant: '' })
  }

  const rowsForOpenFile = (rows, detailView) => {
    if (!entryFile?.id || entryFile.detailView !== detailView) return rows || []
    return (rows || []).filter((row) => row.fileId === entryFile.id)
  }

  const valuationsList = rowsForOpenFile(currentProject?.valuations, 'work-valued')
  const filteredValuations = useMemo(() => {
    const q = valQuery.trim().toLowerCase()
    if (!q) return valuationsList
    return valuationsList.filter((r) => String(r.description || '').toLowerCase().includes(q))
  }, [valuationsList, valQuery])
  const valuationTotal = filteredValuations.reduce((sum, row) => sum + (Number(row.valueEarned) || 0), 0)
  const valuationProduction = filteredValuations.reduce((sum, row) => sum + (Number(row.production) || 0), 0)

  // Group fuel consumed by fuel description (project-to-date rollup & Fuel Analysis rows)
  const fuelAnalysisRows = useMemo(() => {
    const entries = rowsForOpenFile(currentProject?.fuel?.entries, 'fuel-analysis')
    const bulkTotalLiters = Number(currentProject?.fuel?.bulkInsertedLiters) || 0
    const bulkTotalCost = Number(currentProject?.fuel?.bulkInsertedCost) || 0
    const map = new Map()
    entries.forEach((e) => {
      const key = String(e.description || 'Diesel').trim().toLowerCase()
      const cur = map.get(key) || {
        id: key,
        description: e.description || 'Diesel',
        unit: e.unit || 'L',
        consumedQty: 0,
        consumedCost: 0,
      }
      cur.consumedQty = Math.round((cur.consumedQty + (Number(e.quantity || e.liters) || 0)) * 100) / 100
      cur.consumedCost = Math.round((cur.consumedCost + (Number(e.totalCost) || 0)) * 100) / 100
      map.set(key, cur)
    })
    return [...map.values()].map((row) => {
      const isDiesel = row.id === 'diesel'
      const bulkInsertedQty = isDiesel ? bulkTotalLiters : 0
      const bulkInsertedCost = isDiesel ? bulkTotalCost : 0
      return {
        ...row,
        bulkInsertedQty,
        bulkInsertedCost,
        fuelLeftQty: Math.round((row.consumedQty - bulkInsertedQty) * 100) / 100,
        fuelLeftCost: Math.round((row.consumedCost - bulkInsertedCost) * 100) / 100,
      }
    })
  }, [currentProject, entryFile])

  const materialRows = rowsForOpenFile(
    currentProject?.materialAnalysis,
    entryFile?.detailView === 'materials-overview' ? 'materials-overview' : 'material-analysis',
  )
  const workerRows = rowsForOpenFile(currentProject?.workers, 'workers')
  const calendarFiles = currentProject?.files || { daily: [], weekly: [], monthly: [] }

  const openArea = (menuView) => {
    setEntryFile(null)
    setView(menuView)
  }

  const openCalendarFile = (file, listView, detailView) => {
    setEntryFile({ id: file.id, label: file.label, listView, detailView })
    setView(detailView)
  }

  const leaveDetail = (fallback) => {
    if (entryFile?.listView) {
      const next = entryFile.listView
      setEntryFile(null)
      setView(next)
      return
    }
    setView(fallback)
  }

  const periodMenu = (menuView, title, detailView) => (
    <div className="rc-content-shell">
      <button type="button" className="rc-back-link" onClick={() => setView(menuView === 'valuations' || menuView === 'fuel-periods' ? 'ceo-dashboards' : menuView === 'worker-periods' ? 'project-home' : 'qs-engineering')}>
        ← Back
      </button>
      <header className="rc-section-header">
        <p className="rc-eyebrow">{currentProject?.name}</p>
        <h1>{title}</h1>
        <p className="rc-sub">
          Daily, weekly, and monthly files are created from {currentProject?.startDate}. They stay empty until you enter data.
        </p>
      </header>
      <div className="rc-choice-grid">
        {PERIOD_CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="rc-choice-card"
            onClick={() => {
              if (choice.id === 'project-to-date') openCalendarFile({ id: '', label: 'Project to date' }, menuView, detailView)
              else setView(`${menuView}-${choice.id}`)
            }}
          >
            <div>
              <h2>{choice.id === 'project-to-date' ? 'Project to date' : `${choice.label} files`}</h2>
              <p>{choice.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const periodFiles = (menuView, period, detailView) => {
    const files = calendarFiles[period] || []
    const copy = fileListCopy(menuView, period)
    const needle = fileActiveQuery.trim().toLowerCase()
    const matched = needle
      ? files.filter((file) =>
          [file.label, file.id, file.date, file.completedAt].filter(Boolean).join(' ').toLowerCase().includes(needle),
        )
      : files
    const visible = needle || showAllFiles ? matched : matched.slice(0, 21)
    const hiddenCount = Math.max(matched.length - visible.length, 0)
    const singleMatch = needle && matched.length === 1 ? matched[0] : null
    const countLabel = ` (${visible.length}${hiddenCount > 0 ? ` of ${matched.length}` : ''}${
      needle ? ` matching of ${files.length}` : ''
    })`
    return (
      <div className="rc-content-shell">
        <header className="rc-section-header">
          <button type="button" className="rc-back-link" onClick={() => setView(menuView)}>
            ← Back
          </button>
          <p className="rc-eyebrow">{copy.eyebrow}</p>
          <h1>{currentProject?.name}</h1>
          <p className="rc-sub">{copy.blurb}</p>
        </header>
        <section className="rc-file-panel">
          <div className="rc-file-panel-head">
            <h2>
              {copy.heading}
              {countLabel}
            </h2>
          </div>
          <form
            className="rc-file-search"
            onSubmit={(event) => {
              event.preventDefault()
              setFileActiveQuery(fileQuery.trim())
            }}
          >
            <input
              type="search"
              value={fileQuery}
              placeholder={copy.placeholder}
              aria-label="Search files"
              onChange={(event) => setFileQuery(event.target.value)}
            />
            <button type="submit">Search</button>
            {fileActiveQuery ? (
              <button
                type="button"
                className="rc-file-search-clear"
                onClick={() => {
                  setFileQuery('')
                  setFileActiveQuery('')
                }}
              >
                Clear
              </button>
            ) : null}
          </form>
          {fileActiveQuery ? (
            <p className="rc-file-search-note">
              {matched.length === 0
                ? `No files match "${fileActiveQuery}".`
                : `${matched.length} file${matched.length === 1 ? '' : 's'} found for "${fileActiveQuery}".`}
            </p>
          ) : null}
          {singleMatch ? (
            <div className="rc-file-match">
              <div>
                <p>Match found</p>
                <strong>{singleMatch.label}</strong>
              </div>
              <button type="button" onClick={() => openCalendarFile(singleMatch, `${menuView}-${period}`, detailView)}>
                Open dashboard
              </button>
            </div>
          ) : null}
          {visible.length ? (
            <ul className="rc-file-list">
              {visible.map((file) => (
                <li key={file.id}>
                  <button
                    type="button"
                    className="rc-file-row"
                    onClick={() => openCalendarFile(file, `${menuView}-${period}`, detailView)}
                  >
                    <span className="rc-file-mark" aria-hidden="true">
                      {period === 'daily' ? 'D' : period === 'weekly' ? 'W' : 'M'}
                    </span>
                    <span className="rc-file-copy">
                      <strong>{file.label}</strong>
                      <span>{copy.rowNote}</span>
                    </span>
                    <span className={`rc-file-status${file.inProgress ? ' is-progress' : ''}`}>
                      {file.inProgress ? 'In progress' : 'Awaiting entry'}
                    </span>
                    <span className="rc-file-chevron" aria-hidden="true">›</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rc-file-empty">
              {needle ? `No files match your search.` : `No ${period} files yet.`}
            </p>
          )}
          {hiddenCount > 0 ? (
            <div className="rc-file-more">
              <button type="button" onClick={() => setShowAllFiles(true)}>
                Show all {matched.length} {period} files
              </button>
            </div>
          ) : null}
        </section>
      </div>
    )
  }

  return (
    <div className="rc-app">
      {/* Exact Rodcroft Fixed Header (`ProjectMenu.jsx`) */}
      <header className="rc-site-header">
        <div className="rc-header-inner">
          <div className="rc-header-left">
            <div className="rc-menu-wrap">
              <button
                type="button"
                className="rc-header-btn"
                aria-label="Open projects menu"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {menuOpen && (
                <div className="rc-projects-dropdown">
                  <div className="rc-dropdown-head">
                    <p className="rc-dropdown-kicker">Projects</p>
                    <p className="rc-dropdown-sub">Select a project to open dashboards</p>
                  </div>
                  <ul className="rc-dropdown-list">
                    {activeProjects.length === 0 ? (
                      <li className="rc-dropdown-empty">
                        No active projects. Click + New project to create one.
                      </li>
                    ) : (
                      activeProjects.map((proj) => {
                        const isCurrent = currentProject?.id === proj.id && view !== 'home'
                        return (
                          <li key={proj.id}>
                            <button
                              type="button"
                              className={isCurrent ? 'rc-dropdown-item active' : 'rc-dropdown-item'}
                              onClick={() => {
                                setActiveProjectId(proj.id)
                                setView('project-home')
                                setMenuOpen(false)
                              }}
                            >
                              <span>{proj.name}</span>
                              {isCurrent ? (
                                <span className="rc-pill-open">Open</span>
                              ) : (
                                <span className="rc-chevron">›</span>
                              )}
                            </button>
                          </li>
                        )
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="button"
              className="rc-brand-link"
              onClick={() => {
                setView('home')
                setMenuOpen(false)
              }}
            >
              <span className="rc-brand-f">F</span>
              <span className="rc-brand-name">{RODCROFT_BRAND}</span>
            </button>
          </div>

          <div className="rc-header-right">
            <button
              type="button"
              className="rc-header-btn rc-header-btn-wide"
              onClick={() => {
                setMenuOpen(false)
                setShowNewProjectModal(true)
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="rc-header-label">New project</span>
            </button>

            <button
              type="button"
              className="rc-header-btn rc-header-btn-wide rc-header-btn-muted"
              onClick={() => {
                setMenuOpen(false)
                setView('settings')
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <span className="rc-header-label">Settings</span>
            </button>

            {onBack && (
              <button
                type="button"
                className="tpl-action-btn tpl-back-fortress"
                onClick={onBack}
              >
                ← Fortress
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Frame */}
      <div className="rc-page-frame">
        {/* Exact Rodcroft Home (`GroveLanding.jsx`) */}
        {view === 'home' && (
          <div className="rc-landing-stage">
            <h1 className="rc-brand-wordmark" aria-label={RODCROFT_BRAND}>
              {RODCROFT_BRAND}
            </h1>
          </div>
        )}

        {/* Exact Rodcroft Project Home (`HomeMenu.jsx`) */}
        {currentProject && view === 'project-home' && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <p className="rc-eyebrow">{currentProject.name}</p>
              <h1>Select a department</h1>
              <p className="rc-sub">
                Open Quantity Survey or Engineering for current project tools, or Safety &amp; Health for upcoming modules.
              </p>
            </header>

            <div className="rc-choice-grid">
              <button
                type="button"
                className="rc-choice-card"
                onClick={() => setView('ceo-dashboards')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="chart-bar" />
                </span>
                <div>
                  <h2>Engineering</h2>
                  <p>Executive overview: Cumulative Valuations, Material Analysis, Fuel Analysis, and Workers</p>
                </div>
              </button>

              <button
                type="button"
                className="rc-choice-card"
                onClick={() => setView('qs-engineering')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="hard-hat" />
                </span>
                <div>
                  <h2>Quantity Survey</h2>
                  <p>Valuations, QS schedules, plant on site, and rate analysis</p>
                </div>
              </button>

              <button
                type="button"
                className="rc-choice-card"
                onClick={() => setView('safety-health')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="shield" />
                </span>
                <div>
                  <h2>Safety &amp; Health</h2>
                  <p>Site staff attendance, induction &amp; plant registers, and safety modules</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Exact Rodcroft Engineering / CEO Dashboards (`CeoDashboardsView.jsx`) */}
        {currentProject && view === 'ceo-dashboards' && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button
                type="button"
                className="rc-back-link"
                onClick={() => setView('project-home')}
              >
                ← Back to project home
              </button>
              <p className="rc-eyebrow">Engineering</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">Executive overview of project performance.</p>
            </header>

            <div className="rc-choice-grid">
              <button
                type="button"
                className="rc-choice-card"
                onClick={() => openArea('valuations')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="hard-hat" />
                </span>
                <div>
                  <h2>Total work valued</h2>
                  <p>Project to date activities, cost, production and rate</p>
                </div>
              </button>

              <button
                type="button"
                className="rc-choice-card"
                onClick={() => openArea('worker-periods')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="users" />
                </span>
                <div>
                  <h2>Total number of workers</h2>
                  <p>Workers on site, admin members and registers</p>
                </div>
              </button>

              <button
                type="button"
                className="rc-choice-card"
                onClick={() => openArea('material-periods')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="package" />
                </span>
                <div>
                  <h2>Materials overview</h2>
                  <p>Material analysis and project to date material on site</p>
                </div>
              </button>

              <button
                type="button"
                className="rc-choice-card"
                onClick={() => openArea('fuel-periods')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="fuel" />
                </span>
                <div>
                  <h2>Fuel consumed to date</h2>
                  <p>Project to date fuel consumed quantities and costs from every daily entry</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Exact Rodcroft Quantity Survey Hub (`qs-engineering`) */}
        {currentProject && view === 'qs-engineering' && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button
                type="button"
                className="rc-back-link"
                onClick={() => setView('project-home')}
              >
                ← Back to project home
              </button>
              <p className="rc-eyebrow">Quantity Survey</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">Open valuations, QS schedules, plant on site, and rate analysis for this project.</p>
            </header>

            <div className="rc-choice-grid">
              <button type="button" className="rc-choice-card" onClick={() => openArea('valuations')}>
                <span className="rc-icon-tile"><ChoiceIcon name="chart-bar" /></span>
                <div>
                  <h2>Valuations</h2>
                  <p>Open earned value dashboards for monthly, weekly, and daily reports</p>
                </div>
              </button>
              <button type="button" className="rc-choice-card" onClick={() => setView('qs-schedules')}>
                <span className="rc-icon-tile"><ChoiceIcon name="package" /></span>
                <div>
                  <h2>QS Schedules</h2>
                  <p>Material schedule and fuel schedule</p>
                </div>
              </button>
              <button type="button" className="rc-choice-card" onClick={() => setView('plant-on-site')}>
                <span className="rc-icon-tile"><ChoiceIcon name="fuel" /></span>
                <div>
                  <h2>Plant on Site</h2>
                  <p>Register plant operators, record plant hours, and track fuel costs</p>
                </div>
              </button>
              <button type="button" className="rc-choice-card" onClick={() => setView('rate-analysis')}>
                <span className="rc-icon-tile"><ChoiceIcon name="chart-bar" /></span>
                <div>
                  <h2>Rate Analysis</h2>
                  <p>Daily, weekly, and monthly plant rates compared against Excel BOQ items</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {currentProject && view === 'qs-schedules' && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button type="button" className="rc-back-link" onClick={() => setView('qs-engineering')}>
                ← Back to Quantity Survey
              </button>
              <p className="rc-eyebrow">QS Schedules</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">Open the material schedule or the fuel schedule.</p>
            </header>
            <div className="rc-choice-grid">
              <button type="button" className="rc-choice-card" onClick={() => openArea('material-periods')}>
                <span className="rc-icon-tile"><ChoiceIcon name="package" /></span>
                <div>
                  <h2>Material schedule</h2>
                  <p>Bulk material request, material received, material on site, and material analysis</p>
                </div>
              </button>
              <button type="button" className="rc-choice-card" onClick={() => openArea('fuel-periods')}>
                <span className="rc-icon-tile"><ChoiceIcon name="fuel" /></span>
                <div>
                  <h2>Fuel schedule</h2>
                  <p>Fuel consumed project to date and daily files</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {currentProject && (view === 'plant-on-site' || view === 'rate-analysis') && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button type="button" className="rc-back-link" onClick={() => setView('qs-engineering')}>
                ← Back to Quantity Survey
              </button>
              <p className="rc-eyebrow">{view === 'plant-on-site' ? 'Plant on Site' : 'Rate Analysis'}</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">
                {view === 'plant-on-site'
                  ? 'Register plant operators, record plant hours, and track fuel costs. Files stay empty until you enter them.'
                  : 'Daily, weekly, and monthly plant rates. This page stays empty until rates are entered.'}
              </p>
            </header>
          </div>
        )}

        {currentProject && view === 'valuations' && periodMenu('valuations', 'Valuations', 'work-valued')}
        {currentProject && view === 'valuations-daily' && periodFiles('valuations', 'daily', 'work-valued')}
        {currentProject && view === 'valuations-weekly' && periodFiles('valuations', 'weekly', 'work-valued')}
        {currentProject && view === 'valuations-monthly' && periodFiles('valuations', 'monthly', 'work-valued')}
        {currentProject && view === 'fuel-periods' && periodMenu('fuel-periods', 'Fuel schedule & Fuel analysis', 'fuel-analysis')}
        {currentProject && view === 'fuel-periods-daily' && periodFiles('fuel-periods', 'daily', 'fuel-analysis')}
        {currentProject && view === 'fuel-periods-weekly' && periodFiles('fuel-periods', 'weekly', 'fuel-analysis')}
        {currentProject && view === 'fuel-periods-monthly' && periodFiles('fuel-periods', 'monthly', 'fuel-analysis')}
        {currentProject && view === 'material-periods' && periodMenu('material-periods', 'Material schedule & Material analysis', 'material-analysis')}
        {currentProject && view === 'material-periods-daily' && periodFiles('material-periods', 'daily', 'material-analysis')}
        {currentProject && view === 'material-periods-weekly' && periodFiles('material-periods', 'weekly', 'material-analysis')}
        {currentProject && view === 'material-periods-monthly' && periodFiles('material-periods', 'monthly', 'material-analysis')}
        {currentProject && view === 'worker-periods' && periodMenu('worker-periods', 'Workers', 'workers')}
        {currentProject && view === 'worker-periods-daily' && periodFiles('worker-periods', 'daily', 'workers')}
        {currentProject && view === 'worker-periods-weekly' && periodFiles('worker-periods', 'weekly', 'workers')}
        {currentProject && view === 'worker-periods-monthly' && periodFiles('worker-periods', 'monthly', 'workers')}

        {/* Exact Rodcroft Total Work Valued / Cumulative Valuations (`CeoWorkValuedPageClient.jsx` & `ProjectToDateReport.jsx`) */}
        {currentProject && view === 'work-valued' && (
          <div className="rc-content-shell">
            <button
              type="button"
              className="rc-back-link"
              onClick={() => leaveDetail('ceo-dashboards')}
            >
              ← Back
            </button>

            <header className="rc-section-header">
              <p className="rc-eyebrow">{entryFile?.label || 'Project to Date Report · Cumulative Valuations'}</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">
                Cumulative from project start ({currentProject.startDate}) to date.
              </p>
            </header>

            <article className="rc-report-card">
              <div className="rc-report-banner">
                <p className="rc-eyebrow">Project to Date Report</p>
                <h2>{currentProject.name}</h2>
                <p className="rc-sub">
                  Total Actual Cost on Site: <strong>{money(valuationTotal)}</strong>
                </p>
              </div>

              <div className="rc-report-body">
                <h3>Activities Completed on Site</h3>
                <p className="rc-sub" style={{ marginBottom: 12 }}>
                  Cumulative from project start to date. Activities with the same or similar narrative are grouped under one narrative.
                </p>

                <input
                  type="search"
                  className="rc-search-input"
                  placeholder="Search activity description or quantity…"
                  value={valQuery}
                  onChange={(e) => setValQuery(e.target.value)}
                />

                <div className="tpl-table-wrap">
                  <table className="rc-ev-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th className="text-right">Actual Cost on Site</th>
                        <th className="text-right">Production</th>
                        <th className="text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredValuations.map((row) => {
                        const rate =
                          Number(row.production) > 0
                            ? Number(row.valueEarned) / Number(row.production)
                            : null
                        return (
                          <tr key={row.id}>
                            <td><strong>{row.description}</strong></td>
                            <td className="text-right">{money(row.valueEarned)}</td>
                            <td className="text-right">{numFmt(row.production)}</td>
                            <td className="text-right">{rateMoney(rate)}</td>
                          </tr>
                        )
                      })}
                      <tr className="rc-ev-total-row">
                        <td>Total</td>
                        <td className="text-right">{money(valuationTotal)}</td>
                        <td className="text-right">{numFmt(valuationProduction)}</td>
                        <td className="text-right">{rateMoney(valuationProduction > 0 ? valuationTotal / valuationProduction : null)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4}>
                          Rate = actual cost on site ÷ production for each row and the dashboard total.
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <form className="tpl-inline-form" onSubmit={handleAddValuation}>
                  <h4>Add Daily Valuation Entry</h4>
                  <div className="tpl-form-row">
                    <input
                      type="text"
                      placeholder="Activity description"
                      value={valDraft.description}
                      onChange={(e) => setValDraft({ ...valDraft, description: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Actual Cost on Site ($)"
                      value={valDraft.valueEarned}
                      onChange={(e) => setValDraft({ ...valDraft, valueEarned: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Production quantity"
                      value={valDraft.production}
                      onChange={(e) => setValDraft({ ...valDraft, production: e.target.value })}
                      required
                    />
                    <button type="submit" className="tpl-primary-btn">Save Valuation</button>
                  </div>
                </form>
              </div>
            </article>
          </div>
        )}

        {/* Exact Rodcroft Materials Overview (`CeoMaterialsOverviewView.jsx`) */}
        {currentProject && view === 'materials-overview' && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button
                type="button"
                className="rc-back-link"
                onClick={() => setView('ceo-dashboards')}
              >
                ← Back to Engineering
              </button>
              <p className="rc-eyebrow">Materials overview</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">
                Open material analysis or the project to date material on site dashboard.
              </p>
            </header>

            <div className="rc-choice-grid">
              <button
                type="button"
                className="rc-choice-card"
                onClick={() => setView('material-analysis')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="chart-bar" />
                </span>
                <div>
                  <h2>Material analysis</h2>
                  <p>Read-only project to date of material requested, received, and the balance left</p>
                </div>
              </button>

              <button
                type="button"
                className="rc-choice-card"
                onClick={() => setView('material-on-site')}
              >
                <span className="rc-icon-tile">
                  <ChoiceIcon name="package" />
                </span>
                <div>
                  <h2>Project to date material on site</h2>
                  <p>Storeroom quantities, material used, and material left for the whole project</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Exact Rodcroft Material Analysis (`MaterialAnalysisView.jsx`) */}
        {currentProject && view === 'material-analysis' && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button
                type="button"
                className="rc-back-link"
                onClick={() => leaveDetail('ceo-dashboards')}
              >
                ← Back
              </button>
              <p className="rc-eyebrow">{entryFile?.detailView === 'material-analysis' ? entryFile.label : 'Material analysis'}</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">
                Read-only project to date. Similar descriptions are one line. Balance of material left is bulk material requested minus cumulative material received.
              </p>
            </header>

            <div className="tpl-head-pills">
              <button
                type="button"
                className="tpl-primary-btn"
                onClick={() => setView('material-analysis')}
              >
                Material analysis
              </button>
              <button
                type="button"
                className="tpl-secondary-btn"
                onClick={() => setView('material-on-site')}
              >
                Project to date material on site
              </button>
            </div>

            <section className="rc-report-card">
              <div className="rc-card-head">
                <h2>Project to date</h2>
              </div>
              {materialRows.length === 0 ? (
                <p className="rc-empty-msg">No bulk material request or material received yet.</p>
              ) : (
                <div className="tpl-table-wrap">
                  <table className="tpl-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th className="text-right">Bulk material requested</th>
                        <th className="text-right">Cumulative material received</th>
                        <th className="text-right">Balance of material left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialRows.map((row) => (
                        <tr key={row.id}>
                          <td><strong>{row.description}</strong></td>
                          <td className="text-right">{numFmt(row.requestedQuantity)}</td>
                          <td className="text-right">{numFmt(row.receivedQuantity)}</td>
                          <td className="text-right">
                            <strong>{numFmt(row.materialLeft)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="rc-card-body">
                <form className="tpl-inline-form" onSubmit={handleAddMaterialAnalysis}>
                  <h4>Add Bulk Material Request / Received Line</h4>
                  <div className="tpl-form-row">
                    <input
                      type="text"
                      placeholder="Material description"
                      value={matDraft.description}
                      onChange={(e) => setMatDraft({ ...matDraft, description: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Bulk requested"
                      value={matDraft.requestedQuantity}
                      onChange={(e) => setMatDraft({ ...matDraft, requestedQuantity: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Cumulative received"
                      value={matDraft.receivedQuantity}
                      onChange={(e) => setMatDraft({ ...matDraft, receivedQuantity: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Material used on site"
                      value={matDraft.materialUsed}
                      onChange={(e) => setMatDraft({ ...matDraft, materialUsed: e.target.value })}
                    />
                    <button type="submit" className="tpl-primary-btn">Save Material</button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* Exact Rodcroft Project to Date Material on Site */}
        {currentProject && view === 'material-on-site' && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button
                type="button"
                className="rc-back-link"
                onClick={() => setView('material-analysis')}
              >
                ← Back to Material analysis
              </button>
              <p className="rc-eyebrow">Project to date material on site</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">
                Storeroom quantities brought on site, material used, and material left for the whole project.
              </p>
            </header>

            <section className="rc-report-card">
              <div className="rc-card-head">
                <h2>Project to date material on site</h2>
              </div>
              {materialRows.length === 0 ? (
                <p className="rc-empty-msg">No material on site entries yet.</p>
              ) : (
                <div className="tpl-table-wrap">
                  <table className="tpl-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th className="text-right">Material brought on site</th>
                        <th className="text-right">Material used</th>
                        <th className="text-right">Material left on site</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialRows.map((row) => {
                        const brought = Number(row.broughtOnSite ?? row.receivedQuantity) || 0
                        const used = Number(row.materialUsed) || 0
                        const left = Number(row.onSiteLeft ?? brought - used) || 0
                        return (
                          <tr key={row.id}>
                            <td><strong>{row.description}</strong></td>
                            <td className="text-right">{numFmt(brought)}</td>
                            <td className="text-right">{numFmt(used)}</td>
                            <td className="text-right">
                              <strong>{numFmt(left)}</strong>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Exact Rodcroft Fuel Analysis & Fuel Consumed (`GoodsAnalysisView.jsx` & `GoodsReceivedRollupView.jsx`) */}
        {currentProject && (view === 'fuel-analysis' || view === 'fuel-consumed-to-date') && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button
                type="button"
                className="rc-back-link"
                onClick={() => leaveDetail('ceo-dashboards')}
              >
                ← Back
              </button>
              <p className="rc-eyebrow">{entryFile?.detailView === 'fuel-analysis' ? entryFile.label : 'Fuel analysis & Fuel consumed to date'}</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">
                Read-only project to date. Each fuel name is one line comparing fuel consumed against bulk fuel inserted in tank.
              </p>
            </header>

            <div className="rc-headcount-grid">
              <div className="rc-headcount-card">
                <p className="rc-eyebrow">Bulk Fuel Inserted in Tank</p>
                <strong className="rc-headcount-num">
                  {numFmt(currentOverview?.metrics.bulkFuelLiters)} L
                </strong>
                <p className="rc-sub">{money(currentOverview?.metrics.bulkFuelCost)}</p>
              </div>
              <div className="rc-headcount-card">
                <p className="rc-eyebrow">Project to Date Fuel Consumed</p>
                <strong className="rc-headcount-num">
                  {numFmt(currentOverview?.metrics.fuelConsumedLiters)} L
                </strong>
                <p className="rc-sub">{money(currentOverview?.metrics.fuelConsumedCost)}</p>
              </div>
            </div>

            <div className="tpl-head-pills">
              <button
                type="button"
                className={!fuelDetailCostMode ? 'tpl-primary-btn' : 'tpl-secondary-btn'}
                onClick={() => setFuelDetailCostMode(false)}
              >
                Fuel Quantities (Liters)
              </button>
              <button
                type="button"
                className={fuelDetailCostMode ? 'tpl-primary-btn' : 'tpl-secondary-btn'}
                onClick={() => setFuelDetailCostMode(true)}
              >
                Details (Fuel Costs $)
              </button>
            </div>

            <section className="rc-report-card">
              <div className="rc-card-head">
                <h2>{fuelDetailCostMode ? 'Fuel analysis details (Costs)' : 'Fuel left in tank (Quantities)'}</h2>
              </div>
              {fuelAnalysisRows.length === 0 ? (
                <p className="rc-empty-msg">
                  No petrol, diesel, oil, or blend has been entered yet. Add entries below.
                </p>
              ) : (
                <div className="tpl-table-wrap">
                  <table className="tpl-table">
                    <thead>
                      {!fuelDetailCostMode ? (
                        <tr>
                          <th>Description</th>
                          <th className="text-right">Fuel consumed</th>
                          <th className="text-right">Bulk fuel inserted in tank</th>
                          <th className="text-right">Fuel left in tank</th>
                        </tr>
                      ) : (
                        <tr>
                          <th>Description</th>
                          <th className="text-right">Fuel consumed cost</th>
                          <th className="text-right">Bulk fuel inserted in tank cost</th>
                          <th className="text-right">Fuel left in tank cost</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {fuelAnalysisRows.map((row) =>
                        !fuelDetailCostMode ? (
                          <tr key={row.id}>
                            <td><strong>{row.description}</strong></td>
                            <td className="text-right">{numFmt(row.consumedQty)}</td>
                            <td className="text-right">{numFmt(row.bulkInsertedQty)}</td>
                            <td className="text-right">
                              <strong>{numFmt(row.fuelLeftQty)}</strong>
                            </td>
                          </tr>
                        ) : (
                          <tr key={row.id}>
                            <td><strong>{row.description}</strong></td>
                            <td className="text-right">{money(row.consumedCost)}</td>
                            <td className="text-right">{money(row.bulkInsertedCost)}</td>
                            <td className="text-right">
                              <strong>{money(row.fuelLeftCost)}</strong>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="rc-card-body">
                <form className="tpl-inline-form" onSubmit={handleAddFuel}>
                  <h4>Add Daily Fuel Consumed Entry</h4>
                  <div className="tpl-form-row">
                    <input
                      type="date"
                      value={fuelDraft.date}
                      onChange={(e) => setFuelDraft({ ...fuelDraft, date: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Fuel description (Diesel, Petrol, Blend)"
                      value={fuelDraft.description}
                      onChange={(e) => setFuelDraft({ ...fuelDraft, description: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Quantity (L)"
                      value={fuelDraft.quantity}
                      onChange={(e) => setFuelDraft({ ...fuelDraft, quantity: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit price ($)"
                      value={fuelDraft.unitPrice}
                      onChange={(e) => setFuelDraft({ ...fuelDraft, unitPrice: e.target.value })}
                      required
                    />
                    <button type="submit" className="tpl-primary-btn">Save Fuel Consumed</button>
                  </div>
                </form>

                <form className="tpl-inline-form" onSubmit={handleAddBulkFuel} style={{ marginTop: 12 }}>
                  <h4>Add Bulk Fuel Inserted in Tank</h4>
                  <div className="tpl-form-row">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Bulk diesel inserted (L)"
                      value={bulkFuelDraft.liters}
                      onChange={(e) => setBulkFuelDraft({ ...bulkFuelDraft, liters: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit price ($/L)"
                      value={bulkFuelDraft.unitPrice}
                      onChange={(e) => setBulkFuelDraft({ ...bulkFuelDraft, unitPrice: e.target.value })}
                      required
                    />
                    <button type="submit" className="tpl-secondary-btn">Add Bulk Fuel to Tank</button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* Exact Rodcroft Total Number of Workers (`CeoWorkersPageClient.jsx`) */}
        {currentProject && (view === 'workers' || view === 'safety-health') && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button
                type="button"
                className="rc-back-link"
                onClick={() => (view === 'safety-health' ? setView('project-home') : leaveDetail('ceo-dashboards'))}
              >
                ← Back to {view === 'safety-health' ? 'project home' : 'Engineering'}
              </button>
              <p className="rc-eyebrow">Total number of workers · Admin &amp; Site Registers</p>
              <h1>{currentProject.name}</h1>
              <p className="rc-sub">
                People on site this month from the induction, site staff and operator registers. A name listed in more than one register is counted once.
              </p>
            </header>

            <div className="rc-headcount-grid">
              <div className="rc-headcount-card">
                <p className="rc-eyebrow">Total workers on site</p>
                <strong className="rc-headcount-num">{currentOverview?.metrics.workersOnSite || 0}</strong>
                <p className="rc-sub">
                  {currentOverview?.metrics.inductionCount || 0} induction register +{' '}
                  {currentOverview?.metrics.adminCount || 0} admin members +{' '}
                  {currentOverview?.metrics.operatorCount || 0} operator register
                </p>
              </div>
              <div className="rc-headcount-card">
                <p className="rc-eyebrow">Total admin members</p>
                <strong className="rc-headcount-num">{currentOverview?.metrics.adminCount || 0}</strong>
                <p className="rc-sub">Site Staff attendance register</p>
              </div>
            </div>

            <section className="rc-report-card">
              <div className="rc-card-head">
                <h2>Site Staff (Admin), Induction &amp; Plant Operator Registers</h2>
              </div>
              {workerRows.length === 0 ? (
                <p className="rc-empty-msg">No workers registered on this project yet.</p>
              ) : (
                <div className="tpl-table-wrap">
                  <table className="tpl-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role / Position</th>
                        <th>Register</th>
                        <th>Plant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workerRows.map((w) => (
                        <tr key={w.id}>
                          <td><strong>{w.name}</strong></td>
                          <td>{w.role}</td>
                          <td>
                            <span className="tpl-code-badge">
                              {w.register === 'admin'
                                ? 'Site Staff (admin)'
                                : w.register === 'operators'
                                  ? 'Operator'
                                  : 'Induction'}
                            </span>
                          </td>
                          <td>{w.plant || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="rc-card-body">
                <form className="tpl-inline-form" onSubmit={handleAddWorker}>
                  <h4>Add Person to Register</h4>
                  <div className="tpl-form-row">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={workerDraft.name}
                      onChange={(e) => setWorkerDraft({ ...workerDraft, name: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role / Position"
                      value={workerDraft.role}
                      onChange={(e) => setWorkerDraft({ ...workerDraft, role: e.target.value })}
                    />
                    <select
                      value={workerDraft.register}
                      onChange={(e) => setWorkerDraft({ ...workerDraft, register: e.target.value })}
                    >
                      <option value="induction">Induction register</option>
                      <option value="admin">Site Staff (admin)</option>
                      <option value="operators">Plant register</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Plant (if operator)"
                      value={workerDraft.plant}
                      onChange={(e) => setWorkerDraft({ ...workerDraft, plant: e.target.value })}
                    />
                    <button type="submit" className="tpl-primary-btn">Add to Register</button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* Settings (`SettingsPanel.jsx`) */}
        {view === 'settings' && (
          <div className="rc-content-shell">
            <header className="rc-section-header">
              <button
                type="button"
                className="rc-back-link"
                onClick={() => setView('home')}
              >
                ← Back to {RODCROFT_BRAND}
              </button>
              <h1>Settings</h1>
              <p className="rc-sub">Manage projects on this website.</p>
            </header>

            {statusNote ? <p className="tpl-notice-ok">{statusNote}</p> : null}

            <section className="rc-report-card">
              <div className="rc-card-head">
                <h2>Projects ({projects.length})</h2>
              </div>
              <div className="rc-card-body">
                {projects.length === 0 ? (
                  <p className="rc-sub">No projects on this tenant yet.</p>
                ) : (
                  <ul className="rc-settings-proj-list">
                    {projects.map((proj) => (
                      <li key={proj.id} className="rc-settings-proj-item">
                        <div>
                          <strong>{proj.name}</strong>
                          <span className="rc-sub"> · Started {proj.startDate}</span>
                        </div>
                        <div className="tpl-row-btns">
                          <button
                            type="button"
                            className="tpl-secondary-btn"
                            onClick={() => {
                              setActiveProjectId(proj.id)
                              setView('project-home')
                            }}
                          >
                            Open project
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Create New Project Modal (`CreateProjectModal.jsx`) */}
      {showNewProjectModal && (
        <div className="tpl-modal-backdrop" onClick={() => setShowNewProjectModal(false)}>
          <div className="tpl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tpl-modal-head">
              <h3>Create new project</h3>
              <button type="button" className="tpl-close-x" onClick={() => setShowNewProjectModal(false)}>
                ×
              </button>
            </div>
            <form className="tpl-settings-form" onSubmit={handleCreateProject}>
              <label>
                Project name
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  required
                />
              </label>
              <label>
                Project start date
                <input
                  type="date"
                  value={newProjStart}
                  onChange={(e) => setNewProjStart(e.target.value)}
                  required
                />
              </label>
              <div className="tpl-modal-actions">
                <button
                  type="button"
                  className="tpl-secondary-btn"
                  onClick={() => setShowNewProjectModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="tpl-primary-btn">
                  Create project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
