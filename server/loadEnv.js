/**
 * Load GEMINI_API_KEY (and friends) from project `.env` / `server/.env`.
 * Safe to import from Express and from the Vercel serverless entry.
 * On Vercel, project Environment Variables still win when `.env` is absent.
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

dotenv.config({ path: path.join(rootDir, '.env') })
dotenv.config({ path: path.join(rootDir, 'server', '.env'), override: false })
