import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerFortressUpdates } from './registerUpdates.js'
import { fetchTenantRecord } from './tenantRegistry'

const hostSlug = () => {
  if (typeof window === 'undefined') return ''
  return window.__fortressHostSlug || ''
}

const openManufacturingSite = (slug, name) => {
  const brand = name ? `&name=${encodeURIComponent(name)}` : ''
  const next = `/prixburg-live/index.html?tenant=${encodeURIComponent(slug)}${brand}`
  window.location.replace(next)
}

const start = async () => {
  const slug = hostSlug()
  if (slug) {
    let record = { systemType: '', name: '' }
    try {
      record = await fetchTenantRecord(slug)
    } catch {
      record = { systemType: '', name: '' }
    }
    if (!record.systemType || record.systemType === 'manufacturing') {
      openManufacturingSite(slug, record.name)
      return
    }
    document.documentElement.classList.remove('tenant-pending')
  }
  try {
    await (window.fortressVaultReady || Promise.resolve())
  } catch {
    /* The device vault is optional if this browser blocks it. */
  }
  registerFortressUpdates()
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

start()
