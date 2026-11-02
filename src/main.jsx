import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isElectronApp } from './storage.js'

// Service worker is for the browser PWA; Electron uses SQLite + local files instead.
if (!isElectronApp()) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({ immediate: true })
    })
    .catch(() => {
      /* PWA plugin absent in some builds */
    })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
