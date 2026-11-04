import { handleLiveFeedGet } from '../../server/liveFeed.js'

export default function handler(req, res) {
  handleLiveFeedGet(req, res)
}
