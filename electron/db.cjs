const fs = require('fs')
const path = require('path')
const { app } = require('electron')
const initSqlJs = require('sql.js')

let db = null
let SQL = null
let dbFile = ''

const persist = () => {
  if (!db || !dbFile) return
  const data = db.export()
  fs.writeFileSync(dbFile, Buffer.from(data))
}

const ensureSchema = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)
  persist()
}

const loadSqlJs = async () => {
  const wasmCandidates = [
    path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    path.join(process.resourcesPath || '', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
  ]
  for (const wasmPath of wasmCandidates) {
    if (wasmPath && fs.existsSync(wasmPath)) {
      return initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) })
    }
  }
  return initSqlJs()
}

const open = async () => {
  if (db) return db
  SQL = await loadSqlJs()
  const dir = app.getPath('userData')
  fs.mkdirSync(dir, { recursive: true })
  dbFile = path.join(dir, 'fortress.sqlite')
  if (fs.existsSync(dbFile)) {
    db = new SQL.Database(fs.readFileSync(dbFile))
  } else {
    db = new SQL.Database()
  }
  ensureSchema()
  return db
}

const getItem = (key) => {
  if (!db) return null
  const stmt = db.prepare('SELECT value FROM kv WHERE key = ?')
  stmt.bind([String(key)])
  if (stmt.step()) {
    const row = stmt.getAsObject()
    stmt.free()
    return row.value ?? null
  }
  stmt.free()
  return null
}

const setItem = (key, value) => {
  if (!db) return
  db.run('INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, ?)', [
    String(key),
    value == null ? '' : String(value),
    Date.now(),
  ])
  persist()
}

const removeItem = (key) => {
  if (!db) return
  db.run('DELETE FROM kv WHERE key = ?', [String(key)])
  persist()
}

const clear = () => {
  if (!db) return
  db.run('DELETE FROM kv')
  persist()
}

const keys = () => {
  if (!db) return []
  const rows = []
  const stmt = db.prepare('SELECT key FROM kv ORDER BY key')
  while (stmt.step()) {
    rows.push(stmt.getAsObject().key)
  }
  stmt.free()
  return rows
}

const close = () => {
  if (!db) return
  persist()
  db.close()
  db = null
}

module.exports = {
  open,
  getItem,
  setItem,
  removeItem,
  clear,
  keys,
  close,
  path: () => dbFile || path.join(app.getPath('userData'), 'fortress.sqlite'),
}
