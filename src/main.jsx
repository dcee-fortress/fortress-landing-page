import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerFortressUpdates } from './registerUpdates.js'
import { fetchTenantKind } from './tenantRegistry'

const hostSlug = () => {
  if (typeof window === 'undefined') return ''
  return window.__fortressHostSlug || ''
}

const openManufacturingSite = (slug) => {
  const next = `/prixburg-live/index.html?tenant=${encodeURIComponent(slug)}`
  window.location.replace(next)
}

const start = async () => {
  const slug = hostSlug()
  if (slug) {
    let kind = ''
    try {
      kind = await fetchTenantKind(slug)
    } catch {
      kind = ''
    }
    if (!kind || kind === 'manufacturing') {
      openManufacturingSite(slug)
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
