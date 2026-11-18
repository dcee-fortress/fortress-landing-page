/** Local persistence: SQLite via Electron IPC, or browser localStorage on the web.
 * Account keys are dual-written (primary + backup) and mirrored to IndexedDB so
 * data is never dropped until the user explicitly deletes it.
 */

const electronStorage = () =>
  typeof window !== 'undefined' && window.electronAPI?.storage ? window.electronAPI.storage : null

const BACKUP_SUFFIX = '::backup'
const IDB_NAME = 'fortress-durable-v1'
const IDB_STORE = 'kv'
const ACCOUNT_STORE_KEY = 'fortress-phone-app-phase1'

let migrated = false
let idbPromise = null

const migrateFromLocalStorage = (api) => {
  if (migrated || typeof window === 'undefined' || !window.localStorage) return
  migrated = true
  try {
    const existing = api.keys?.() || []
    if (existing.length) return
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key || !key.startsWith('fortress-')) continue
      const value = window.localStorage.getItem(key)
      if (value != null) api.setItem(key, value)
    }
  } catch {
    /* ignore migration errors */
  }
}

const backend = () => {
  const api = electronStorage()
  if (api) {
    migrateFromLocalStorage(api)
    return api
  }
  return typeof window !== 'undefined' ? window.localStorage : null
}

const openIdb = () => {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  if (idbPromise) return idbPromise
  idbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return idbPromise
}

const idbSet = async (key, value) => {
  const db = await openIdb()
  if (!db) return
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put(String(value ?? ''), String(key))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    /* ignore */
  }
}

const idbGet = async (key) => {
  const db = await openIdb()
  if (!db) return null
  try {
    return await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(String(key))
      req.onsuccess = () => resolve(req.result == null ? null : String(req.result))
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

const idbDelete = async (key) => {
  const db = await openIdb()
  if (!db) return
  try {
    await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).delete(String(key))
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    /* ignore */
  }
}

const readBackend = (key) => {
  try {
    return backend()?.getItem(String(key)) ?? null
  } catch {
    return null
  }
}

const writeBackend = (key, value) => {
  try {
    backend()?.setItem(String(key), value == null ? '' : String(value))
  } catch {
    /* ignore quota / ipc errors */
  }
}

const removeBackend = (key) => {
  try {
    backend()?.removeItem(String(key))
  } catch {
    /* ignore */
  }
}

const isEmptyAccountPayload = (value) => {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) && parsed.length === 0
  } catch {
    return false
  }
}

export const isElectronApp = () => Boolean(typeof window !== 'undefined' && window.electronAPI?.isElectron)

export const storage = {
  getItem(key) {
    const k = String(key)
    const primary = readBackend(k)
    if (primary != null && primary !== '') return primary
    const backup = readBackend(k + BACKUP_SUFFIX)
    if (backup != null && backup !== '') return backup
    return primary
  },
  setItem(key, value) {
    const k = String(key)
    const v = value == null ? '' : String(value)
    // Never wipe the account store with an empty list while a backup still has data.
    if (k === ACCOUNT_STORE_KEY && isEmptyAccountPayload(v)) {
      const existing = readBackend(k) || readBackend(k + BACKUP_SUFFIX)
      if (existing && !isEmptyAccountPayload(existing)) return
    }
    writeBackend(k, v)
    writeBackend(k + BACKUP_SUFFIX, v)
    void idbSet(k, v)
  },
  removeItem(key) {
    const k = String(key)
    removeBackend(k)
    removeBackend(k + BACKUP_SUFFIX)
    void idbDelete(k)
  },
  clear() {
    try {
      backend()?.clear?.()
    } catch {
      /* ignore */
    }
  },
}

/** Restore fortress keys from IndexedDB when localStorage/Electron store is empty. */
export const hydrateFromDurable = async (keys = [ACCOUNT_STORE_KEY]) => {
  const restored = {}
  for (const key of keys) {
    const current = storage.getItem(key)
    if (current != null && current !== '' && !(key === ACCOUNT_STORE_KEY && isEmptyAccountPayload(current))) {
      restored[key] = current
      continue
    }
    const fromIdb = await idbGet(key)
    if (fromIdb == null || fromIdb === '') continue
    if (key === ACCOUNT_STORE_KEY && isEmptyAccountPayload(fromIdb)) continue
    writeBackend(key, fromIdb)
    writeBackend(key + BACKUP_SUFFIX, fromIdb)
    restored[key] = fromIdb
  }
  return restored
}

export default storage
