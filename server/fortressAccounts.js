/**
 * Shared account store. The database password stays in DATABASE_URL / POSTGRES_URL
 * on the server. The browser only sends an email and password.
 */
import pg from 'pg'

const { Pool } = pg

const cleanSlug = (value = '') =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

let pool
let ready = false

const connectionString = () => {
  const raw = String(process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim()
  if (!raw) return ''
  try {
    const url = new URL(raw)
    url.searchParams.delete('sslmode')
    return url.toString()
  } catch {
    return raw
  }
}

const getPool = () => {
  const value = connectionString()
  if (!value) return null
  if (!pool) {
    pool = new Pool({
      connectionString: value,
      ssl: { rejectUnauthorized: false },
      max: 1,
    })
  }
  return pool
}

const ensure = async (client) => {
  if (ready) return
  await client.query(`
    create table if not exists fortress_accounts (
      email text primary key,
      account jsonb not null,
      updated_at timestamptz not null default now()
    )
  `)
  await client.query(`
    create table if not exists fortress_kv (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `)
  ready = true
}

const readBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return {}
}

const emailOf = (value) => String(value || '').trim().toLowerCase()

const publicAccount = (account) => {
  if (!account?.email) return null
  const { password: _password, ...rest } = account
  return rest
}

export const handleFortressAccounts = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false })
    return
  }
  const db = getPool()
  if (!db) {
    res.status(503).json({ ok: false, error: 'database-unavailable' })
    return
  }

  const body = readBody(req)
  const op = String(body.op || '')
  let client
  try {
    client = await db.connect()
    await ensure(client)

    if (op === 'exists') {
      const email = emailOf(body.email)
      const found = await client.query('select 1 from fortress_accounts where email = $1', [email])
      res.json({ ok: true, exists: found.rowCount > 0 })
      return
    }

    if (op === 'login') {
      const email = emailOf(body.email)
      const password = String(body.password || '')
      const found = await client.query('select account from fortress_accounts where email = $1', [email])
      const account = found.rows[0]?.account
      if (!account?.email || String(account.password || '') !== password) {
        res.json({ ok: true, account: null })
        return
      }
      res.json({ ok: true, account })
      return
    }

    if (op === 'save') {
      const account = body.account
      const email = emailOf(account?.email)
      if (!email || !account?.password) {
        res.status(400).json({ ok: false })
        return
      }
      const stored = { ...account, email }
      const existing = await client.query('select account from fortress_accounts where email = $1', [email])
      const current = existing.rows[0]?.account
      if (current?.password && String(current.password) !== String(stored.password)) {
        res.status(409).json({ ok: false, error: 'exists' })
        return
      }
      await client.query(
        `insert into fortress_accounts (email, account, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (email) do update set account = excluded.account, updated_at = now()`,
        [email, JSON.stringify(stored)],
      )
      res.json({ ok: true })
      return
    }

    if (op === 'remove') {
      const email = emailOf(body.email)
      const password = String(body.password || '')
      const found = await client.query('select account from fortress_accounts where email = $1', [email])
      const account = found.rows[0]?.account
      if (!account?.email || String(account.password || '') !== password) {
        res.status(403).json({ ok: false })
        return
      }
      const slugs = (account.websites || [])
        .map((site) => cleanSlug(site?.slug || ''))
        .filter(Boolean)
      await client.query('delete from fortress_accounts where email = $1', [email])
      if (slugs.length) {
        await client.query('delete from fortress_kv where key = any($1::text[])', [
          slugs.map((slug) => `fortress-slug-owner:${slug}`),
        ])
      }
      res.json({ ok: true })
      return
    }

    if (op === 'sites') {
      const slug = cleanSlug(body.slug || '')
      if (!slug) {
        res.json({ ok: true, account: null })
        return
      }
      const owner = await client.query('select value from fortress_kv where key = $1', [
        `fortress-slug-owner:${slug}`,
      ])
      const email = emailOf(owner.rows[0]?.value?.email)
      if (!email) {
        res.json({ ok: true, account: null })
        return
      }
      const found = await client.query('select account from fortress_accounts where email = $1', [email])
      res.json({ ok: true, account: publicAccount(found.rows[0]?.account) })
      return
    }

    if (op === 'put') {
      const key = String(body.key || '')
      if (!key || key.startsWith('fortress-account:')) {
        res.status(400).json({ ok: false })
        return
      }
      await client.query(
        `insert into fortress_kv (key, value, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (key) do update set value = excluded.value, updated_at = now()`,
        [key, JSON.stringify(body.value ?? null)],
      )
      res.json({ ok: true })
      return
    }

    if (op === 'get') {
      const key = String(body.key || '')
      if (!key || key.startsWith('fortress-account:')) {
        res.status(400).json({ ok: false })
        return
      }
      const found = await client.query('select value from fortress_kv where key = $1', [key])
      res.json({ ok: true, value: found.rows[0]?.value ?? null })
      return
    }

    if (op === 'delete') {
      const key = String(body.key || '')
      if (!key || key.startsWith('fortress-account:')) {
        res.status(400).json({ ok: false })
        return
      }
      await client.query('delete from fortress_kv where key = $1', [key])
      res.json({ ok: true })
      return
    }

    res.status(400).json({ ok: false })
  } catch (error) {
    if (process.env.FORTRESS_DEBUG) console.error(error?.code || '', error?.message || error)
    res.status(500).json({ ok: false })
  } finally {
    client?.release()
  }
}
