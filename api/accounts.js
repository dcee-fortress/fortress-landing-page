import { handleAccountsRequest } from '../server/accountsStore.js'

export default function handler(req, res) {
  handleAccountsRequest(req, res)
}
