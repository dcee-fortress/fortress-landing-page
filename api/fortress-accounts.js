import '../server/loadEnv.js'
import { handleFortressAccounts } from '../server/fortressAccounts.js'

export default function handler(req, res) {
  return handleFortressAccounts(req, res)
}
