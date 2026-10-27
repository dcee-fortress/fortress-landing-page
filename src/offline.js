/** Online / offline helpers for Fortress. */

export const readOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine)

export const offlineActionMessage = (action = 'do that') =>
  `Connect to the internet to ${action}. Old posts, testimonials, drawings, quotes, and saved files on this phone still open from cache.`

export const NETWORK_ACTIONS = {
  post: 'upload a new post or testimonial',
  drawing: 'upload a new drawing',
  buy: 'buy a system or pay with EcoCash',
  shop: 'add or sync a shop item',
  pay: 'complete EcoCash payment',
  vision: 'run Gemini on a drawing',
  whatsapp: 'send a WhatsApp order',
}
