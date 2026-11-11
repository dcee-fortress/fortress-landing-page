import { handleDeviceOpen } from '../../server/deviceSessions.js'

export default function handler(req, res) {
  handleDeviceOpen(req, res)
}
