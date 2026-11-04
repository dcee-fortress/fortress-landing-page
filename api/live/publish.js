import { handleLiveFeedPublish } from '../../server/liveFeed.js'

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(405).json({ error: 'Use POST to publish' })
    return
  }
  handleLiveFeedPublish(req, res)
}
