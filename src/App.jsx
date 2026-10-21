import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const STORE_KEY = 'fortress-phone-app-phase1'
const SESSION_KEY = 'fortress-session-phase1'
const OWNER_LOGIN = {
  email: 'darelchits@gmail.com',
  password: 'Darel2005',
}
const PHASE1_COMPLETE = false
const PHASE1_ECOCASH_NOTE =
  'Phase 1 of Fortress is not complete yet. EcoCash will open after phase 1.'
const PHASE1_LOGIN_NOTE =
  'Only the Fortress owner can sign in until phase 1 is complete.'
const isOwnerEmail = (email) => String(email || '').trim().toLowerCase() === OWNER_LOGIN.email.toLowerCase()
const isOwnerCredentials = (email, password) => isOwnerEmail(email) && password === OWNER_LOGIN.password
const SHELVES = ['Best selling', 'Trending', 'New companies']

const FEATURE_CLASSES = [
  {
    id: 'Best selling',
    label: 'Best selling',
    note: 'Exclusive fee $200/year or $20/month',
  },
  { id: 'Trending', label: 'Trending', note: '' },
  { id: 'New companies', label: 'New companies', note: '' },
]

const shot = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`

const COMMENTS_KEY = 'fortress-comments-v1'
const VIDEO_SECONDS = 10

const REEL = {
  mill: 'https://videos.pexels.com/video-files/2795405/2795405-hd_1920_1080_25fps.mp4',
  weld: 'https://videos.pexels.com/video-files/4483138/4483138-hd_1920_1080_25fps.mp4',
  crane: 'https://videos.pexels.com/video-files/3994446/3994446-uhd_2560_1440_25fps.mp4',
  crew: 'https://videos.pexels.com/video-files/8488593/8488593-hd_1920_1080_30fps.mp4',
  factory: 'https://videos.pexels.com/video-files/7578544/7578544-hd_1920_1080_30fps.mp4',
  timber: 'https://videos.pexels.com/video-files/8961305/8961305-uhd_2560_1440_25fps.mp4',
}

const catalog = [
  {
    id: 'apex',
    name: 'Apex Steelworks',
    category: 'Manufacturing',
    shelf: 'Best selling',
    rating: 4.9,
    hue: '#1f4d45',
    video: REEL.mill,
    videoCaption: 'Mill-floor reel from the current run.',
    location: 'Pittsburgh, PA',
    about: 'Structural steel crews keep punch lists, coil counts, and bay photos on one card.',
    slides: [
      {
        photo: shot('photo-1504917595217-d4dc5ebe6122'),
        testimonial: 'The punch list lives on the phone now, not in the trailer binder.',
      },
      {
        photo: shot('photo-1565043589221-1a6fd9ae45c7'),
        testimonial: 'Bay three sent this coil photo before the shift change.',
      },
      {
        photo: shot('photo-1581091226825-a6a2a5aee158'),
        testimonial: 'Weld stations check in with one picture and the count.',
      },
      {
        photo: shot('photo-1504328345606-18bbc8c9d7d1'),
        testimonial: 'Night crew left the booth photo on the card for the morning handoff.',
      },
      {
        photo: shot('photo-1565008447742-97f6f38c985c'),
        testimonial: 'The floor lead uses this shot when sales asks what shipped.',
      },
    ],
  },
  {
    id: 'ridgeline',
    name: 'Ridgeline Contractors',
    category: 'Construction',
    shelf: 'Best selling',
    rating: 4.8,
    hue: '#9a3412',
    video: REEL.weld,
    videoCaption: 'Deck reel from the crew on site.',
    location: 'Denver, CO',
    about: 'Foremen post deck, crane, and gate photos before they leave the site.',
    slides: [
      {
        photo: shot('photo-1541888946425-d81bb19240f5'),
        testimonial: 'Foremen send site photos before they leave the deck. Owners see the same day.',
      },
      {
        photo: shot('photo-1503387762-592deb58ef4e'),
        testimonial: 'This framing shot closed the owner’s question about the east wall.',
      },
      {
        photo: shot('photo-1504307651254-35680f356dfd'),
        testimonial: 'The crew photo is how we prove who was on the deck at pour time.',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial: 'Crane day stays on the card so the next trade knows the lift is done.',
      },
      {
        photo: shot('photo-1517581177682-a085bb7ffb15'),
        testimonial: 'Gate photo plus a note replaced the Friday trailer meeting.',
      },
    ],
  },
  {
    id: 'ironleaf',
    name: 'Ironleaf Mills',
    category: 'Manufacturing',
    shelf: 'Best selling',
    rating: 4.7,
    hue: '#3f3f46',
    location: 'Gary, IN',
    about: 'Mill leads attach line photos to the same card sales already sends.',
    slides: [
      {
        photo: shot('photo-1581094794329-c8112a89af12'),
        testimonial: 'Coil counts and line photos land in one card the crew already trusts.',
      },
      {
        photo: shot('photo-1581092160562-40aa08e78837'),
        testimonial: 'This press photo answered a shop-drawing question before lunch.',
      },
      {
        photo: shot('photo-1581092918056-0c4c3acd3789'),
        testimonial: 'The line lead uploads the count with the picture. No second system.',
      },
      {
        photo: shot('photo-1504917595217-d4dc5ebe6122'),
        testimonial: 'Yard steel stays visible to the office without a walk-down.',
      },
      {
        photo: shot('photo-1565043666747-69f6646db940'),
        testimonial: 'End-of-shift photo is the record that the run finished clean.',
      },
    ],
  },
  {
    id: 'pylon',
    name: 'Pylon & Co.',
    category: 'Construction',
    shelf: 'Best selling',
    rating: 4.8,
    hue: '#1e3a5f',
    location: 'Austin, TX',
    about: 'Weekly proof is the card: structure, site, and close-out photos together.',
    slides: [
      {
        photo: shot('photo-1504307651254-35680f356dfd'),
        testimonial: 'We stopped mailing site binders. The card is the weekly proof.',
      },
      {
        photo: shot('photo-1541888946425-d81bb19240f5'),
        testimonial: 'Structure photo went to the lender with the draw request.',
      },
      {
        photo: shot('photo-1486406146926-c627a92ad1ab'),
        testimonial: 'This elevation shot is what the owner opens on Monday.',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial: 'Lift day is on the card so the next crew does not guess.',
      },
      {
        photo: shot('photo-1503387762-592deb58ef4e'),
        testimonial: 'Close-out started from this photo, not from a shared drive.',
      },
    ],
  },
  {
    id: 'harbor',
    name: 'Harbor & Beam',
    category: 'Construction',
    shelf: 'Trending',
    rating: 4.9,
    hue: '#0f4c5c',
    video: REEL.crane,
    videoCaption: 'Site reel from the pour.',
    location: 'Seattle, WA',
    about: 'Clients approve the next pour from the same photos the superintendent posts.',
    slides: [
      {
        photo: shot('photo-1503387762-592deb58ef4e'),
        testimonial: 'Clients open the card, see the site, and approve the next pour from their phone.',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial: 'The crane shot is the one clients screenshot for their board.',
      },
      {
        photo: shot('photo-1429497419816-9ca5cfb4571a'),
        testimonial: 'Timber went up and the photo was on the card before we left the site.',
      },
      {
        photo: shot('photo-1541888946425-d81bb19240f5'),
        testimonial: 'Foundation day is the photo we send with the inspection note.',
      },
      {
        photo: shot('photo-1517581177682-a085bb7ffb15'),
        testimonial: 'Street view of the site replaced the weekly progress email.',
      },
    ],
  },
  {
    id: 'voltform',
    name: 'Voltform Industrial',
    category: 'Manufacturing',
    shelf: 'Trending',
    rating: 4.6,
    hue: '#7c2d12',
    video: REEL.factory,
    videoCaption: 'Line reel from the bay.',
    location: 'Detroit, MI',
    about: 'Line leads and sales share one card for counts, booths, and finished runs.',
    slides: [
      {
        photo: shot('photo-1581092160562-40aa08e78837'),
        testimonial: 'Line leads upload a photo with the count. Sales uses the same card.',
      },
      {
        photo: shot('photo-1581091226825-a6a2a5aee158'),
        testimonial: 'This bench photo is what purchasing checks before reordering.',
      },
      {
        photo: shot('photo-1581094794329-c8112a89af12'),
        testimonial: 'The aisle shot shows the run is staged, not still on the line.',
      },
      {
        photo: shot('photo-1565008447742-97f6f38c985c'),
        testimonial: 'Floor photo closed a quality question without a plant visit.',
      },
      {
        photo: shot('photo-1504328345606-18bbc8c9d7d1'),
        testimonial: 'Weld booth check-in is a picture, then the card moves on.',
      },
    ],
  },
  {
    id: 'summit',
    name: 'Summit Siteworks',
    category: 'Construction',
    shelf: 'Trending',
    rating: 4.8,
    hue: '#3f6212',
    video: REEL.crew,
    videoCaption: 'Crew reel from the gate.',
    location: 'Boise, ID',
    about: 'Weather, gate, and crew notes stay attached to the photos from that day.',
    slides: [
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial: 'Weather delays, gate photos, and crew notes stay on one card.',
      },
      {
        photo: shot('photo-1504307651254-35680f356dfd'),
        testimonial: 'Crew check-in photo is the attendance the super actually trusts.',
      },
      {
        photo: shot('photo-1541888946425-d81bb19240f5'),
        testimonial: 'Slab morning is documented here before anyone asks for it.',
      },
      {
        photo: shot('photo-1517581177682-a085bb7ffb15'),
        testimonial: 'The muddy gate shot explained the delay better than a text.',
      },
      {
        photo: shot('photo-1531834685032-c34bf0d84c77'),
        testimonial: 'This progress photo is the one we pin for the owner call.',
      },
    ],
  },
  {
    id: 'northline',
    name: 'Northline Fabrication',
    category: 'Manufacturing',
    shelf: 'New companies',
    rating: 4.5,
    hue: '#134e4a',
    location: 'Milwaukee, WI',
    about: 'Shop photos on the card answer drawing questions before a meeting is booked.',
    slides: [
      {
        photo: shot('photo-1581092918056-0c4c3acd3789'),
        testimonial: 'Shop photos on the card already close shop-drawing questions.',
      },
      {
        photo: shot('photo-1504917595217-d4dc5ebe6122'),
        testimonial: 'Fit-up photo went to the detailer the hour it was taken.',
      },
      {
        photo: shot('photo-1581094794329-c8112a89af12'),
        testimonial: 'The bay looks like this when a job is ready to ship.',
      },
      {
        photo: shot('photo-1565043589221-1a6fd9ae45c7'),
        testimonial: 'Press line photo is the proof we send with the pack list.',
      },
      {
        photo: shot('photo-1581092160562-40aa08e78837'),
        testimonial: 'New booth, first run, already on the company card.',
      },
    ],
  },
  {
    id: 'cedar',
    name: 'Cedar Span Builders',
    category: 'Construction',
    shelf: 'New companies',
    rating: 4.8,
    hue: '#92400e',
    video: REEL.timber,
    videoCaption: 'Build reel from the rooms we closed.',
    location: 'Portland, OR',
    about: 'Homeowners scroll the card and see every room the crew has closed.',
    slides: [
      {
        photo: shot('photo-1429497419816-9ca5cfb4571a'),
        testimonial: 'Homeowners scroll the card like a store listing and see every room we closed.',
      },
      {
        photo: shot('photo-1600585154340-be6161a56a0c'),
        testimonial: 'Front elevation is the photo they send their family.',
      },
      {
        photo: shot('photo-1600607687939-ce8a6c25118c'),
        testimonial: 'Kitchen close-out lives on the card, not in a text thread.',
      },
      {
        photo: shot('photo-1600566753086-00f18fb6b3ea'),
        testimonial: 'This room photo is what sold the next phase.',
      },
      {
        photo: shot('photo-1503387762-592deb58ef4e'),
        testimonial: 'Frame walk happened on the phone with this picture open.',
      },
    ],
  },
  {
    id: 'fieldnote',
    name: 'Fieldnote Builders',
    category: 'Construction',
    shelf: 'New companies',
    rating: 4.7,
    hue: '#365314',
    location: 'Nashville, TN',
    about: 'A new Fortress shop whose phone is already the job trailer.',
    slides: [
      {
        photo: shot('photo-1531834685032-c34bf0d84c77'),
        testimonial: 'New on Fortress and the phone is already the job trailer.',
      },
      {
        photo: shot('photo-1541888946425-d81bb19240f5'),
        testimonial: 'First pour is on the card for the owner who could not be there.',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial: 'Crane set documented before the operator left the street.',
      },
      {
        photo: shot('photo-1504307651254-35680f356dfd'),
        testimonial: 'Crew photo from day one, so the card never starts empty.',
      },
      {
        photo: shot('photo-1517581177682-a085bb7ffb15'),
        testimonial: 'Site overview is the picture we open in the Monday meeting.',
      },
    ],
  },
]

const mallGood = (id, name, photo, price) => ({
  id,
  name,
  photo: shot(photo),
  price,
})

const shopFromHome = (id, items) => {
  const company = catalog.find((entry) => entry.id === id)
  return {
    id: `mall-${id}`,
    name: company.name,
    category: company.category,
    hue: company.hue,
    cover: company.slides[0].photo,
    source: 'home',
    items,
  }
}

const retailShop = (id, name, cover, items) => ({
  id,
  name,
  category: 'Retail',
  hue: '#7c2d12',
  cover: shot(cover),
  source: 'retail',
  items,
})

const mallCatalog = [
  shopFromHome('apex', [
    mallGood('apex-plate', 'Steel plate pack', 'photo-1504917595217-d4dc5ebe6122', 86),
    mallGood('apex-bolt', 'Structural bolt set', 'photo-1504148455328-c376907d081c', 24),
    mallGood('apex-angle', 'Angle iron length', 'photo-1581091226825-a6a2a5aee158', 41),
  ]),
  shopFromHome('harbor', [
    mallGood('harbor-beam', 'Framed beam cut', 'photo-1503387762-592deb58ef4e', 95),
    mallGood('harbor-sheet', 'Plywood sheet', 'photo-1503387762-592deb58ef4e', 32),
    mallGood('harbor-fastener', 'Site fastener tin', 'photo-1517581177682-a085bb7ffb15', 18),
  ]),
  shopFromHome('ridgeline', [
    mallGood('ridge-helmet', 'Site helmet', 'photo-1504307651254-35680f356dfd', 29),
    mallGood('ridge-vest', 'Crew vest', 'photo-1541888946425-d81bb19240f5', 22),
    mallGood('ridge-boot', 'Work boot pair', 'photo-1590496793929-36417d3117de', 74),
  ]),
  shopFromHome('voltform', [
    mallGood('volt-cable', 'Cable drum', 'photo-1519389950473-47ba0277781c', 58),
    mallGood('volt-switch', 'Switch gear pack', 'photo-1581092160562-40aa08e78837', 46),
    mallGood('volt-lamp', 'Bay lamp', 'photo-1504328345606-18bbc8c9d7d1', 37),
  ]),
  shopFromHome('cedar', [
    mallGood('cedar-door', 'Interior door', 'photo-1600585154340-be6161a56a0c', 120),
    mallGood('cedar-tile', 'Kitchen tile crate', 'photo-1600607687939-ce8a6c25118c', 64),
    mallGood('cedar-paint', 'Room paint set', 'photo-1562259949-e8e7689d7828', 39),
  ]),
  retailShop('lantern-home', 'Lantern Home Goods', 'photo-1555041469-a586c61ea9bc', [
    mallGood('lantern-lamp', 'Floor lamp', 'photo-1507473885765-e6ed057f782c', 54),
    mallGood('lantern-throw', 'Wool throw', 'photo-1555041469-a586c61ea9bc', 36),
    mallGood('lantern-vase', 'Ceramic vase', 'photo-1484101403633-562f891dc89a', 21),
  ]),
  retailShop('market-street', 'Market Street Grocers', 'photo-1542838132-92c53300491e', [
    mallGood('market-crate', 'Produce crate', 'photo-1542838132-92c53300491e', 16),
    mallGood('market-bread', 'Bakery loaf', 'photo-1509440159596-0249088772ff', 4),
    mallGood('market-oil', 'Bottle of oil', 'photo-1474979266404-7ea641234fb7', 9),
  ]),
  retailShop('thread-needle', 'Thread & Needle', 'photo-1441986300917-64674bd600d8', [
    mallGood('thread-shirt', 'Cotton shirt', 'photo-1521572163474-6864f9cf17ab', 28),
    mallGood('thread-denim', 'Denim pair', 'photo-1441984904996-e0b6ba687e04', 45),
    mallGood('thread-tote', 'Canvas tote', 'photo-1544816155-12df9643f363', 19),
  ]),
  retailShop('kettle-pantry', 'Copper Kettle Pantry', 'photo-1495474472287-4d71bcdd2085', [
    mallGood('kettle-coffee', 'Roast bag', 'photo-1495474472287-4d71bcdd2085', 12),
    mallGood('kettle-mug', 'Stone mug', 'photo-1514228742587-6b1558fcc303', 11),
    mallGood('kettle-jar', 'Spice jar set', 'photo-1596040033229-a9821ebd058d', 15),
  ]),
]

const formatPrice = (price) =>
  `$${Number(price).toLocaleString('en-US', {
    minimumFractionDigits: Number(price) % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
  { id: 'mall', label: 'Online mall' },
]

const GUEST_NAV = [
  { id: 'home', label: 'Home' },
  { id: 'mall', label: 'Online mall' },
  { id: 'login', label: 'Login' },
]

function IconHome() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3.1 3 10.4h2.2V21h5.3v-6.2h3V21h5.3v-10.6H21L12 3.1z" />
    </svg>
  )
}

function IconProfile() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12.2a4.2 4.2 0 1 0-4.2-4.2 4.2 4.2 0 0 0 4.2 4.2zm0 2.1c-3.6 0-7.2 1.8-7.2 4.4V21h14.4v-2.3c0-2.6-3.6-4.4-7.2-4.4z"
      />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.4 13.5a7.7 7.7 0 0 0 .1-1.5 7.7 7.7 0 0 0-.1-1.5l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2.6-1.5l-.4-2.6h-4l-.4 2.6a7.4 7.4 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.6a7.7 7.7 0 0 0-.1 1.5 7.7 7.7 0 0 0 .1 1.5l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5z"
      />
    </svg>
  )
}

function IconMall() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 9.2 6.2 4h11.6L20 9.2V20H4V9.2zm2.4 0h11.2l-1.2-3.2H7.6L6.4 9.2zM7 11.5V18h2.2v-6.5H7zm3.8 0V18h2.4v-6.5h-2.4zm4 0V18H17v-6.5h-2.2z"
      />
    </svg>
  )
}

function IconLogin() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 17v-3H3v-4h7V7l5 5-5 5zm9-14H12v2h7v14h-7v2h9V3h-2z"
      />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 17l5-5-5-5v3H3v4h7v3zm9-14h-9v2h9v14h-9v2h11V3h-2z"
      />
    </svg>
  )
}

const NAV_ICONS = {
  home: IconHome,
  profile: IconProfile,
  settings: IconSettings,
  mall: IconMall,
  login: IconLogin,
  logout: IconLogout,
}

function IconGrid() {
  return (
    <svg className="ig-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
      />
    </svg>
  )
}

function IconStoreTab() {
  return (
    <svg className="ig-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 9.2 6.2 4h11.6L20 9.2V20H4V9.2zm2.4 0h11.2l-1.2-3.2H7.6L6.4 9.2z"
      />
    </svg>
  )
}

function IconCompanyTab() {
  return (
    <svg className="ig-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 21V7l8-4 8 4v14h-6v-6h-4v6H4zm8-9.2A1.8 1.8 0 1 0 10.2 10 1.8 1.8 0 0 0 12 11.8z"
      />
    </svg>
  )
}

const makeId = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('failed'))
    reader.readAsDataURL(file)
  })

const SYSTEM_TYPES = [
  {
    id: 'construction',
    label: 'Construction',
    slides: [
      {
        photo: shot('photo-1541888946425-d81bb19240f5'),
        testimonial: 'The site card is the daily record the crew already checks.',
      },
      {
        photo: shot('photo-1503387762-592deb58ef4e'),
        testimonial: 'Framing photos land on the website the same day they are taken.',
      },
      {
        photo: shot('photo-1504307651254-35680f356dfd'),
        testimonial: 'Owners see who was on the deck without calling the trailer.',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial: 'Lift day stays on the site so the next trade is not guessing.',
      },
      {
        photo: shot('photo-1517581177682-a085bb7ffb15'),
        testimonial: 'The gate photo replaced the Friday progress email.',
      },
    ],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    slides: [
      {
        photo: shot('photo-1504917595217-d4dc5ebe6122'),
        testimonial: 'Bay photos and counts now live on the company website.',
      },
      {
        photo: shot('photo-1565043589221-1a6fd9ae45c7'),
        testimonial: 'The line lead uploads the run before the shift changes.',
      },
      {
        photo: shot('photo-1581091226825-a6a2a5aee158'),
        testimonial: 'Sales opens the same site the floor already updated.',
      },
      {
        photo: shot('photo-1504328345606-18bbc8c9d7d1'),
        testimonial: 'Booth check-in is a photo, then the site moves on.',
      },
      {
        photo: shot('photo-1565008447742-97f6f38c985c'),
        testimonial: 'End-of-shift proof is already on the website.',
      },
    ],
  },
  {
    id: 'retail',
    label: 'Retail',
    slides: [
      {
        photo: shot('photo-1441986300917-64674bd600d8'),
        testimonial: 'The shop floor is on the website before the doors open.',
      },
      {
        photo: shot('photo-1441984904996-e0b6ba687e04'),
        testimonial: 'New stock photos replace the group chat.',
      },
      {
        photo: shot('photo-1472851294608-062f824d29cc'),
        testimonial: 'Customers see what is on the floor today.',
      },
      {
        photo: shot('photo-1483985988355-763728e1935b'),
        testimonial: 'The window display is the first picture on the site.',
      },
      {
        photo: shot('photo-1555529669-e69e7aa0ba9a'),
        testimonial: 'The counter close is posted with the day’s note.',
      },
    ],
  },
]

const systemIdFromCompany = (company) => {
  if (company?.systemType && SYSTEM_TYPES.some((item) => item.id === company.systemType)) {
    return company.systemType
  }
  if (company?.isShop) return 'retail'
  const label = `${company?.category || ''} ${company?.type || ''}`.toLowerCase()
  if (label.includes('retail') || label.includes('shop')) return 'retail'
  if (label.includes('manufactur')) return 'manufacturing'
  return 'construction'
}

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'website'

const brandTheme = (name = '') => {
  const brand = String(name).trim() || 'Company'
  let hash = 0
  for (let i = 0; i < brand.length; i += 1) hash = (hash * 31 + brand.charCodeAt(i)) >>> 0
  const hue = hash % 360
  const mark = brand.charAt(0).toUpperCase()
  return {
    name: brand,
    mark,
    slug: slugify(brand),
    cssName: slugify(brand).replace(/-/g, '') || 'company',
    hue,
    vars: {
      '--brand-name': `"${brand.replace(/"/g, '')}"`,
      '--brand-hue': String(hue),
      '--brand-ink': `hsl(${hue} 10% 8%)`,
      '--brand-canvas': `hsl(${hue} 8% 96%)`,
      '--brand-paper': '#ffffff',
      '--brand-line': `hsl(${hue} 8% 86%)`,
      '--brand-muted': `hsl(${hue} 6% 42%)`,
      '--brand-fill': `hsl(${hue} 12% 12%)`,
    },
  }
}

const makeWebsite = ({
  name,
  type = 'Business',
  systemType = '',
  slug = '',
  link = '',
  profilePhoto = '',
  gallery = [],
  photoCaptions = [],
  testimonial = '',
  slides = [],
  isShop = false,
  items = [],
  brandName = '',
  cssName = '',
}) => ({
  id: makeId('site'),
  name,
  type,
  systemType,
  slug,
  link,
  profilePhoto,
  gallery,
  photoCaptions,
  testimonial,
  slides,
  isShop,
  items,
  brandName: brandName || name,
  cssName: cssName || slugify(brandName || name).replace(/-/g, ''),
})

const makeAccount = (email, password, companyName, { withWebsite = true } = {}) => ({
  id: makeId('account'),
  email,
  password,
  websites: withWebsite ? [makeWebsite({ name: companyName || 'My company', type: 'Business' })] : [],
})

const withOwnerLogin = (list) => {
  const accounts = Array.isArray(list) ? list.map((account) => ({ ...account })) : []
  const ownerIndex = accounts.findIndex((account) => account.email?.toLowerCase() === OWNER_LOGIN.email)
  if (ownerIndex >= 0) {
    accounts[ownerIndex] = { ...accounts[ownerIndex], ...OWNER_LOGIN }
    return accounts
  }
  const demoIndex = accounts.findIndex((account) => account.email?.toLowerCase() === 'demo@fortress.com')
  if (demoIndex >= 0) {
    accounts[demoIndex] = { ...accounts[demoIndex], ...OWNER_LOGIN }
    return accounts
  }
  return [makeAccount(OWNER_LOGIN.email, OWNER_LOGIN.password, '', { withWebsite: false }), ...accounts]
}

const readHashPath = () => {
  if (typeof window === 'undefined') return '/home'
  const raw = window.location.hash.replace(/^#/, '')
  return raw && raw !== '/' ? raw : '/home'
}

const encodeId = (id) => encodeURIComponent(String(id))

const pathFromNav = ({ tab, settingsView, overlay }) => {
  if (overlay?.type === 'gallery' && overlay.company?.id) {
    return `/${tab || 'home'}/card/${encodeId(overlay.company.id)}`
  }
  if (overlay?.type === 'profile' && overlay.company?.id) {
    const base = `/${tab || 'home'}/card/${encodeId(overlay.company.id)}/profile`
    return overlay.postIndex != null ? `${base}/${overlay.postIndex}` : base
  }
  if (overlay?.type === 'gate') {
    const id = overlay.company?.id
    return id ? `/${tab || 'home'}/card/${encodeId(id)}/gate` : `/${tab || 'home'}/gate`
  }
  if (overlay?.type === 'shop' && overlay.company?.id) {
    return `/mall/open/${encodeId(overlay.company.id)}`
  }
  if (overlay?.type === 'own-photo') return '/profile/photo'
  if (overlay?.type === 'own-post') return `/profile/post/${overlay.postIndex}`
  if (overlay?.type === 'shop-item-add') return '/profile/shop/add'
  if (overlay?.type === 'shop-item' && overlay.itemId) return `/profile/shop/item/${encodeId(overlay.itemId)}`
  if (overlay?.type === 'buy-system') return '/settings/buy'
  if (overlay?.type === 'live-link') return '/profile/live'
  if (overlay?.type === 'add-media') return '/profile/add'
  if (overlay?.type === 'compose') return '/profile/compose'
  if (overlay?.type === 'feature-ecocash') return '/profile/feature-pay'
  if (tab === 'settings' && settingsView && settingsView !== 'home') {
    return `/settings/${encodeURIComponent(settingsView)}`
  }
  return `/${tab || 'home'}`
}

const parseHashPath = (path, findCompany) => {
  const parts = String(path || '/home')
    .split('/')
    .filter(Boolean)
  const [a, b, c, d, e] = parts

  if (a === 'site' && b) {
    return {
      tab: 'home',
      settingsView: 'home',
      overlay: null,
      route: { kind: 'site', slug: decodeURIComponent(b) },
    }
  }
  if (a === 'shop' && b) {
    return {
      tab: 'mall',
      settingsView: 'home',
      overlay: null,
      route: { kind: 'shop', slug: decodeURIComponent(b) },
    }
  }

  const tab = ['home', 'profile', 'settings', 'mall', 'login'].includes(a) ? a : 'home'
  let settingsView = tab === 'settings' && b ? decodeURIComponent(b) : 'home'
  if (tab === 'settings' && (!b || b === 'card' || b === 'open' || b === 'add')) settingsView = 'home'
  let overlay = null

  if (b === 'card' && c) {
    const company = findCompany(decodeURIComponent(c))
    if (d === 'profile' && company) {
      let postIndex = null
      if (e === 'avatar') postIndex = 'avatar'
      else if (e !== undefined && e !== '' && Number.isFinite(Number(e))) postIndex = Number(e)
      overlay = { type: 'profile', company, postIndex }
    }
    else if (d === 'gate') overlay = { type: 'gate', company }
    else if (company) overlay = { type: 'gallery', company }
  } else if (a === 'mall' && b === 'open' && c) {
    const shop = findCompany(decodeURIComponent(c))
    if (shop) overlay = { type: 'shop', company: shop }
  }   else if (a === 'profile' && b === 'photo') overlay = { type: 'own-photo' }
  else if (a === 'profile' && b === 'post' && c !== undefined) {
    overlay = { type: 'own-post', postIndex: Number(c) || 0 }
  }
  else if (a === 'profile' && b === 'shop' && c === 'add') overlay = { type: 'shop-item-add' }
  else if (a === 'profile' && b === 'shop' && c === 'item' && d) {
    overlay = { type: 'shop-item', itemId: decodeURIComponent(d) }
  }
  else if (a === 'profile' && b === 'live') overlay = { type: 'live-link' }
  else if (a === 'profile' && b === 'add') overlay = { type: 'add-media' }
  else if (a === 'profile' && b === 'compose') overlay = { type: 'compose' }
  else if (a === 'profile' && b === 'feature-pay') overlay = { type: 'feature-ecocash' }
  else if (a === 'home' && b === 'gate') overlay = { type: 'gate' }

  return { tab, settingsView, overlay, route: { kind: '', slug: '' } }
}

const uniqueSlug = (name, accounts) => {
  const base = slugify(name)
  const taken = new Set(accounts.flatMap((account) => account.websites.map((site) => site.slug).filter(Boolean)))
  if (!taken.has(base)) return base
  let count = 2
  while (taken.has(`${base}-${count}`)) count += 1
  return `${base}-${count}`
}

const siteHref = (slug) => {
  const url = new URL(window.location.href)
  url.hash = `/site/${slug}`
  return url.toString()
}

const shopHref = (slug) => {
  const url = new URL(window.location.origin + window.location.pathname)
  url.hash = `/shop/${slug}`
  return url.toString()
}

const shopBySlug = (slug, accountList) => {
  const fromUser = accountList
    .flatMap((account) => account.websites)
    .find((site) => site.slug === slug && site.systemType === 'retail')
  if (fromUser) {
    return {
      id: fromUser.id,
      name: fromUser.name,
      slug: fromUser.slug,
      brandName: fromUser.brandName || fromUser.name,
      systemType: fromUser.systemType || 'retail',
      isShop: true,
      category: fromUser.type || 'Retail',
      cover: fromUser.items?.[0]?.photo || fromUser.profilePhoto || fromUser.gallery?.[0] || '',
      items: fromUser.items || [],
    }
  }
  return (
    mallCatalog.find((shop) => shop.id === slug || shop.id === `mall-${slug}` || shop.id.replace(/^mall-/, '') === slug) ||
    null
  )
}

const slidesForSite = (site) => {
  const slides = [...(site.slides || [])]
  const seen = new Set(slides.map((slide) => slide.photo).filter(Boolean))
  if (site.profilePhoto && !seen.has(site.profilePhoto)) {
    slides.unshift({
      photo: site.profilePhoto,
      testimonial: site.testimonial || 'Profile photo from the company card.',
    })
    seen.add(site.profilePhoto)
  }
  ;(site.gallery || []).forEach((photo, index) => {
    if (photo && !seen.has(photo)) {
      slides.push({
        photo,
        testimonial: site.photoCaptions?.[index] || site.testimonial || 'Site photo from the company card.',
      })
      seen.add(photo)
    }
  })
  return slides
}

const firstSlide = (company) => company.slides?.[0] || null

const withVideoSlides = (company) => {
  if (!company) return company
  if (!company.video) return company
  const slides = [...(company.slides || [])]
  if (slides.some((slide) => slide.video === company.video)) return company
  slides.splice(Math.min(1, slides.length), 0, {
    video: company.video,
    testimonial: company.videoCaption || 'Ten-second clip from the company card.',
  })
  return { ...company, slides }
}

const featureMedia = (companies) =>
  companies.flatMap((company) => {
    const items = []
    const frame = firstSlide(company)
    if (frame?.photo) items.push({ company, kind: 'photo', src: frame.photo, caption: frame.testimonial })
    if (company.video) {
      items.push({
        company,
        kind: 'video',
        src: company.video,
        poster: frame?.photo || '',
        caption: company.videoCaption,
      })
    }
    return items
  })

function GoldStar({ rating }) {
  if (rating < 4.8) return null
  return (
    <span className="gold-star" aria-label="Rated 4.8 or higher">
      ★
    </span>
  )
}

function StarRanking({ rating }) {
  const value = Number(rating) || 0
  const filled = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <p className="star-ranking" aria-label={`Rated ${value.toFixed(1)} of 5`}>
      <span className="star-ranking-value">{value.toFixed(1)}</span>
      <span className="star-ranking-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= filled ? 'star on' : 'star'}>
            ★
          </span>
        ))}
      </span>
    </p>
  )
}

const displayLivePath = (site) => {
  if (!site?.slug) return ''
  if (site.systemType === 'retail' || site.isShop) return `#/shop/${site.slug}`
  return `#/site/${site.slug}`
}

const companyShopHref = (company) => {
  if (company?.link) return company.link
  if ((company?.systemType === 'retail' || company?.isShop) && company.slug) return shopHref(company.slug)
  if (company?.slug) return siteHref(company.slug)
  const shop =
    mallCatalog.find((item) => item.id === `mall-${company.id}` || item.id === company.id) ||
    (company.items?.length ? company : null)
  if (shop) return shopHref(String(shop.id).replace(/^mall-/, ''))
  return ''
}

function MenuButton({ item, active, onSelect, className }) {
  const Icon = NAV_ICONS[item.id]
  return (
    <button
      type="button"
      className={className}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item.id)}
    >
      {Icon ? <Icon /> : null}
      <span>{item.label}</span>
    </button>
  )
}

function FeatureFlip({ companies, onOpen }) {
  const companyKey = companies.map((company) => company.id).join('|')
  const media = useMemo(() => featureMedia(companies), [companyKey])
  const [index, setIndex] = useState(0)
  const videoRef = useRef(null)

  const go = (step) => {
    if (media.length < 2) return
    setIndex((current) => (current + step + media.length) % media.length)
  }

  useEffect(() => {
    setIndex(0)
  }, [companyKey])

  useEffect(() => {
    if (media.length < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const current = media[index]
    const wait = current?.kind === 'video' ? VIDEO_SECONDS * 1000 : 8000
    const timer = window.setTimeout(() => {
      setIndex((currentIndex) => (currentIndex + 1) % media.length)
    }, wait)
    return () => window.clearTimeout(timer)
  }, [companyKey, index, media.length])

  useEffect(() => {
    const node = videoRef.current
    if (!node) return undefined
    node.currentTime = 0
    const play = node.play()
    if (play?.catch) play.catch(() => {})
    const limit = () => {
      if (node.currentTime >= VIDEO_SECONDS) node.pause()
    }
    node.addEventListener('timeupdate', limit)
    return () => {
      node.pause()
      node.removeEventListener('timeupdate', limit)
    }
  }, [index])

  if (!media.length) return null

  const visible = media[index] || media[0]
  const visibleCompany = visible.company

  return (
    <div className="feature-card">
      <div className="feature-shot">
        {media.map((item, slideIndex) => (
          <div
            className="feature-slide"
            key={`${item.company.id}-${item.kind}-${slideIndex}`}
            style={{ transform: `translate3d(${(slideIndex - index) * 100}%, 0, 0)` }}
          >
            {item.kind === 'video' ? (
              <video
                ref={slideIndex === index ? videoRef : null}
                src={item.src}
                poster={item.poster || undefined}
                muted
                playsInline
                autoPlay={slideIndex === index}
                preload={slideIndex === index ? 'auto' : 'metadata'}
              />
            ) : (
              <img src={item.src} alt="" />
            )}
          </div>
        ))}
        {media.length > 1 && (
          <>
            <button className="card-arrow left" type="button" aria-label="Previous" onClick={() => go(-1)}>
              ‹
            </button>
            <button className="card-arrow right" type="button" aria-label="Next" onClick={() => go(1)}>
              ›
            </button>
          </>
        )}
        <button
          className="feature-shot-hit"
          type="button"
          onClick={() => onOpen(withVideoSlides(visibleCompany))}
          aria-label={visibleCompany.name}
        />
      </div>
      <button className="feature-meta" type="button" onClick={() => onOpen(withVideoSlides(visibleCompany))}>
        <span className="store-logo" style={{ background: visibleCompany.hue }}>
          {visibleCompany.name.slice(0, 1)}
        </span>
        <div>
          <strong>{visibleCompany.name}</strong>
          <p>{visibleCompany.category}</p>
        </div>
        <GoldStar rating={visibleCompany.rating} />
      </button>
    </div>
  )
}

function HomeTile({ company, onOpen }) {
  const slide = firstSlide(company)
  const reel = company.video
  return (
    <button type="button" className={`gallery-tile home-tile${reel ? ' is-reel' : ''}`} onClick={() => onOpen(company)}>
      {reel ? (
        <video src={reel} poster={slide?.photo || undefined} muted loop playsInline autoPlay />
      ) : slide?.photo ? (
        <img src={slide.photo} alt="" />
      ) : (
        <span className="home-tile-fallback" style={{ background: company.hue }}>
          {company.name.slice(0, 1)}
        </span>
      )}
      {reel ? <span className="reel-mark">Reel</span> : null}
      <span className="home-tile-name">{company.name}</span>
    </button>
  )
}

function CommentThread({ targetId, comments, viewer, onAdd, onReply, onNeedAccount }) {
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [replyDraft, setReplyDraft] = useState('')
  const thread = comments[targetId] || []

  const submit = (event) => {
    event.preventDefault()
    if (!viewer) {
      onNeedAccount?.()
      return
    }
    const text = draft.trim()
    if (!text) return
    onAdd(targetId, text)
    setDraft('')
  }

  const submitReply = (event, commentId) => {
    event.preventDefault()
    if (!viewer) {
      onNeedAccount?.()
      return
    }
    const text = replyDraft.trim()
    if (!text) return
    onReply(targetId, commentId, text)
    setReplyTo('')
    setReplyDraft('')
  }

  return (
    <div className="comment-thread">
      <h4>Comments</h4>
      {thread.length ? (
        thread.map((comment) => (
          <article className="comment-item" key={comment.id}>
            <strong>{comment.author}</strong>
            <p>{comment.text}</p>
            {(comment.replies || []).map((reply) => (
              <div className="comment-reply" key={reply.id}>
                <strong>{reply.author}</strong>
                <p>{reply.text}</p>
              </div>
            ))}
            {viewer ? (
              replyTo === comment.id ? (
                <form className="comment-form" onSubmit={(event) => submitReply(event, comment.id)}>
                  <input
                    type="text"
                    value={replyDraft}
                    placeholder="Reply"
                    onChange={(event) => setReplyDraft(event.target.value)}
                  />
                  <button type="submit">Send</button>
                </form>
              ) : (
                <button type="button" className="comment-reply-btn" onClick={() => setReplyTo(comment.id)}>
                  Reply
                </button>
              )
            ) : null}
          </article>
        ))
      ) : (
        <p className="empty-note">No comments yet.</p>
      )}
      {viewer ? (
        <form className="comment-form" onSubmit={submit}>
          <input
            type="text"
            value={draft}
            placeholder="Add a comment"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit">Post</button>
        </form>
      ) : (
        <button type="button" className="comment-reply-btn" onClick={() => onNeedAccount?.()}>
          Sign in to comment
        </button>
      )}
    </div>
  )
}

function IconLock() {
  return (
    <svg className="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17 9.2V7.4A5 5 0 0 0 7 7.4v1.8H5.2V20h13.6V9.2H17zM8.8 7.4a3.2 3.2 0 0 1 6.4 0v1.8H8.8V7.4zM12 15.8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
      />
    </svg>
  )
}

function OpenedCard({
  company,
  onClose,
  onViewProfile,
  onBuySystem,
  startIndex = 0,
  comments,
  onAddComment,
  onReplyComment,
  viewer,
  onNeedAccount,
  canDelete,
  onDelete,
}) {
  const slides = company.slides || []
  const [index, setIndex] = useState(() => {
    const max = Math.max(slides.length - 1, 0)
    return Math.min(Math.max(Number(startIndex) || 0, 0), max)
  })

  useEffect(() => {
    const max = Math.max((company.slides || []).length - 1, 0)
    setIndex(Math.min(Math.max(Number(startIndex) || 0, 0), max))
  }, [company.id, startIndex])
  const startX = useRef(0)
  const dragging = useRef(false)

  const go = (step) => {
    if (slides.length < 2) return
    setIndex((current) => (current + step + slides.length) % slides.length)
  }

  const onPointerDown = (event) => {
    dragging.current = true
    startX.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerUp = (event) => {
    if (!dragging.current) return
    dragging.current = false
    const delta = event.clientX - startX.current
    if (delta <= -40) go(1)
    if (delta >= 40) go(-1)
  }

  const slide = slides[index]

  return (
    <section
      className="detail-sheet opened-sheet"
      aria-label={company.name}
      onClick={onClose}
    >
      <div className="opened-card" onClick={(event) => event.stopPropagation()}>
        <div
          className="opened-stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragging.current = false
          }}
        >
          <button
            type="button"
            className="card-x"
            aria-label="Close"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onClose()
            }}
          >
            ×
          </button>
          {slide?.video ? (
            <video src={slide.video} muted playsInline autoPlay controls={false} />
          ) : slide?.photo ? (
            <img src={slide.photo} alt={`${company.name} photo ${index + 1}`} />
          ) : null}
          {slides.length > 1 && (
            <>
              <button className="card-arrow left" type="button" aria-label="Previous" onClick={() => go(-1)}>
                ‹
              </button>
              <button className="card-arrow right" type="button" aria-label="Next" onClick={() => go(1)}>
                ›
              </button>
            </>
          )}
        </div>
        <div className="opened-copy">
          {company.shelf ? <p className="card-class">{company.shelf}</p> : null}
          <h2>{company.name}</h2>
          <p className="opened-count">
            {slides.length ? `${index + 1} / ${slides.length}` : '0 / 0'}
          </p>
          {slide?.testimonial ? (
            <p className="detail-quote card-caption">{slide.testimonial}</p>
          ) : (
            <p className="empty-note">No photos yet.</p>
          )}
        </div>
        {canDelete ? (
          <button type="button" className="danger-button card-delete" onClick={() => onDelete(index)}>
            Delete picture
          </button>
        ) : null}
        {onViewProfile || onBuySystem ? (
          <div className="card-actions opened-actions">
            {onViewProfile ? (
              <button className="view-profile-button" type="button" onClick={onViewProfile}>
                View profile
              </button>
            ) : null}
            {onBuySystem ? (
              <button className="buy-system-button" type="button" onClick={onBuySystem}>
                Buy system
              </button>
            ) : null}
          </div>
        ) : null}
        {comments && onAddComment ? (
          <CommentThread
            targetId={`photo:${company.id}:${index}`}
            comments={comments}
            viewer={viewer}
            onAdd={onAddComment}
            onReply={onReplyComment}
            onNeedAccount={onNeedAccount}
          />
        ) : null}
      </div>
    </section>
  )
}

function ShopItemSheet({ draft, isNew, onClose, onChange, onSave, onPickPhoto }) {
  return (
    <section className="detail-sheet opened-sheet" aria-label={isNew ? 'Add shop item' : draft.name || 'Shop item'} onClick={onClose}>
      <div className="opened-card shop-item-card" onClick={(event) => event.stopPropagation()}>
        <div className="opened-stage shop-item-stage">
          <button
            type="button"
            className="card-x"
            aria-label="Close"
            onClick={(event) => {
              event.stopPropagation()
              onClose()
            }}
          >
            ×
          </button>
          {draft.photo ? (
            <img src={draft.photo} alt={draft.name || 'Shop item'} />
          ) : (
            <button type="button" className="shop-item-photo-wait" onClick={onPickPhoto}>
              Upload image
              <small>Optional</small>
            </button>
          )}
          {draft.photo ? (
            <button type="button" className="shop-change-photo" onClick={onPickPhoto}>
              Change photo
            </button>
          ) : null}
        </div>
        <div className="shop-item-fields">
          <input
            type="text"
            placeholder="Item name"
            value={draft.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
          <label className="price-card">
            <span>Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={draft.price}
              onChange={(event) => onChange({ price: event.target.value })}
            />
          </label>
          <textarea
            rows="4"
            placeholder="Description"
            value={draft.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />
          {isNew ? (
            <button type="button" className="primary-button" onClick={onSave}>
              Add item
            </button>
          ) : (
            <p className="shop-copy">Changes save to the shop and this grid as you type.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function MallShopSheet({ shop, onClose, comments, onAddComment, onReplyComment, viewer, onNeedAccount }) {
  const items = shop.items || []
  return (
    <section className="detail-sheet shop-sheet" aria-label={`${shop.name} shop`}>
      <button type="button" className="detail-close" onClick={onClose}>
        Close
      </button>
      <div className="mall-shop-head">
        {shop.cover ? <img src={shop.cover} alt="" /> : null}
        <div>
          <p className="eyebrow">{shop.category}</p>
          <h2>{shop.name}</h2>
        </div>
      </div>
      <div className="mall-goods">
        {items.length ? (
          items.map((item) => (
            <article className="mall-good" key={item.id}>
              <img src={item.photo} alt="" />
              <div className="mall-good-copy">
                <strong>{item.name}</strong>
                <span>{formatPrice(item.price)}</span>
                {item.description ? <p>{item.description}</p> : null}
              </div>
              <CommentThread
                targetId={`item:${shop.id}:${item.id}`}
                comments={comments}
                viewer={viewer}
                onAdd={onAddComment}
                onReply={onReplyComment}
                onNeedAccount={onNeedAccount}
              />
            </article>
          ))
        ) : (
          <p className="empty-note">This shop has no items yet.</p>
        )}
      </div>
    </section>
  )
}

function CloneIcon({ paths }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

function CloneBrandBar({ brand, onMenu, onHome, onNew, onSettings, newLabel, settingsLabel }) {
  return (
    <header className="clone-topbar">
      <div className="clone-topbar-inner">
        <div className="clone-topbar-lead">
          <button type="button" className="clone-icon-btn" aria-label="Open projects menu" onClick={onMenu}>
            <CloneIcon paths={['M3 12h18', 'M3 18h18', 'M3 6h18']} />
          </button>
          <button type="button" className="clone-brand" onClick={onHome} aria-label={brand.name}>
            <span className="clone-brand-mark">{brand.mark}</span>
            <span className="clone-brand-name">{brand.name}</span>
          </button>
        </div>
        <button type="button" className="clone-icon-btn clone-icon-wide" aria-label={newLabel} onClick={onNew}>
          <CloneIcon paths={['M5 12h14', 'M12 5v14']} />
          <span className="clone-icon-label">{newLabel}</span>
        </button>
        <button type="button" className="clone-icon-btn clone-icon-wide clone-icon-muted" aria-label={settingsLabel} onClick={onSettings}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 17H5" />
            <path d="M19 7h-9" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
          </svg>
          <span className="clone-icon-label">{settingsLabel}</span>
        </button>
      </div>
    </header>
  )
}

function ShopStorefront({ shop, owner, onBack }) {
  const brand = brandTheme(shop?.name || shop?.brandName || 'Shop')
  const isRetail = shop?.systemType === 'retail' || shop?.isShop
  const authKey = `fortress-clone-auth-${brand.slug}`
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(authKey) === '1'
    } catch {
      return false
    }
  })
  const [panel, setPanel] = useState('home')
  const [login, setLogin] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    document.title = shop ? `${brand.name}` : 'Shop'
    return () => {
      document.title = 'Fortress'
    }
  }, [shop, brand.name])

  const persistAuth = (value) => {
    setAuthed(value)
    try {
      if (value) sessionStorage.setItem(authKey, '1')
      else sessionStorage.removeItem(authKey)
    } catch {
      /* ignore */
    }
  }

  const submitLogin = (event) => {
    event.preventDefault()
    const user = login.username.trim()
    const pass = login.password
    if (!user || !pass) {
      setLoginError('Enter username and password.')
      return
    }
    const userOk =
      user.toLowerCase() === brand.name.toLowerCase() ||
      user.toLowerCase() === brand.slug ||
      (owner?.email && user.toLowerCase() === owner.email.toLowerCase())
    const passOk = owner?.password ? pass === owner.password : pass.length >= 1
    if (!userOk || !passOk) {
      setLoginError('Invalid username or password.')
      return
    }
    setLoginError('')
    persistAuth(true)
    setPanel('home')
  }

  if (!shop) {
    return (
      <div className="clone-app clone-prixburg">
        <main className="clone-login-page">
          <h1>Shop not found</h1>
          <p>This link does not match a shop on this domain.</p>
          <button type="button" className="clone-login-btn" onClick={onBack}>
            Back to Fortress
          </button>
        </main>
      </div>
    )
  }

  if (!authed) {
    return (
      <div
        className={`clone-app clone-prixburg clone-${brand.slug} brand-${brand.cssName}`}
        style={brand.vars}
        data-company={brand.name}
        data-css-name={brand.cssName}
      >
        <main className="clone-login-page">
          <div className="clone-login-card">
            <div className="clone-login-header">
              <h1>
                {isRetail ? brand.name : `${brand.name} Stock Production System`}
              </h1>
              <p>Secure Login Portal</p>
            </div>
            <form onSubmit={submitLogin}>
              <label>
                Username
                <input
                  type="text"
                  autoComplete="username"
                  value={login.username}
                  onChange={(event) => setLogin((value) => ({ ...value, username: event.target.value }))}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={login.password}
                  onChange={(event) => setLogin((value) => ({ ...value, password: event.target.value }))}
                  required
                />
              </label>
              {loginError ? <p className="clone-login-error">{loginError}</p> : null}
              <button type="submit" className="clone-login-btn">
                Login
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      className={`clone-app clone-prixburg clone-${brand.slug} brand-${brand.cssName}`}
      style={brand.vars}
      data-company={brand.name}
      data-css-name={brand.cssName}
    >
      <CloneBrandBar
        brand={brand}
        newLabel="New stock"
        settingsLabel="Settings"
        onMenu={() => setPanel((value) => (value === 'menu' ? 'home' : 'menu'))}
        onHome={() => setPanel('home')}
        onNew={() => setPanel('stock')}
        onSettings={() => setPanel('settings')}
      />
      {panel === 'menu' && (
        <div className="clone-menu">
          <button type="button" onClick={() => setPanel('home')}>
            Home
          </button>
          <button type="button" onClick={() => setPanel('stock')}>
            Stock
          </button>
          <button type="button" onClick={onBack}>
            Back to Fortress
          </button>
        </div>
      )}
      {panel === 'home' && (
        <div className="clone-home-stage">
          <h1 className="clone-prixburg-wordmark" aria-label={brand.name}>
            {brand.name}
          </h1>
        </div>
      )}
      {panel === 'stock' && (
        <main className="clone-page">
          <div className="clone-top-row">
            <h2>{brand.name} stock</h2>
          </div>
          <div className="mall-goods clone-stock-grid">
            {(shop.items || []).length ? (
              shop.items.map((item) => (
                <article className="mall-good" key={item.id}>
                  {item.photo ? <img src={item.photo} alt="" /> : null}
                  <div className="mall-good-copy">
                    <strong>{item.name}</strong>
                    <span>{formatPrice(item.price)}</span>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-note">No stock items yet. Add them from the Fortress shop profile.</p>
            )}
          </div>
        </main>
      )}
      {panel === 'settings' && (
        <main className="clone-page">
          <h2>Settings</h2>
          <p className="clone-muted">Company class: {brand.cssName}</p>
          <p className="clone-muted">Shop domain: {brand.slug}</p>
          <button type="button" className="clone-login-btn" onClick={() => persistAuth(false)}>
            Log out
          </button>
          <button type="button" className="clone-text-btn" onClick={onBack}>
            Back to Fortress
          </button>
        </main>
      )}
    </div>
  )
}

function GeneratedWebsite({ site, onBack }) {
  const brand = brandTheme(site?.brandName || site?.name || 'Company')
  const slides = site ? slidesForSite(site) : []
  const [panel, setPanel] = useState('home')
  const [projects, setProjects] = useState(() =>
    slides.map((slide, index) => ({
      id: `job-${index + 1}`,
      name: `Project ${index + 1}`,
      photo: slide.photo,
      note: slide.testimonial,
    })),
  )
  const [draftName, setDraftName] = useState('')
  const [openJob, setOpenJob] = useState(null)
  const kindLabel = site?.systemType === 'manufacturing' ? 'Manufacturing' : 'Construction'

  useEffect(() => {
    document.title = site ? brand.name : 'Website'
    return () => {
      document.title = 'Fortress'
    }
  }, [site, brand.name])

  if (!site) {
    return (
      <div className="clone-app clone-rodcroft">
        <main className="clone-page">
          <h1>Website not found</h1>
          <p>This link does not match a website on this device.</p>
          <button type="button" className="clone-login-btn" onClick={onBack}>
            Back to Fortress
          </button>
        </main>
      </div>
    )
  }

  const addProject = (event) => {
    event.preventDefault()
    const name = draftName.trim()
    if (!name) return
    setProjects((previous) => [
      { id: `job-${Date.now()}`, name, photo: slides[0]?.photo || '', note: `${brand.name} ${kindLabel.toLowerCase()} job.` },
      ...previous,
    ])
    setDraftName('')
    setPanel('projects')
  }

  return (
    <div
      className={`clone-app clone-rodcroft clone-${brand.slug} brand-${brand.cssName}`}
      style={brand.vars}
      data-company={brand.name}
      data-css-name={brand.cssName}
    >
      <CloneBrandBar
        brand={brand}
        newLabel="New project"
        settingsLabel="Settings"
        onMenu={() => setPanel((value) => (value === 'menu' ? 'home' : 'menu'))}
        onHome={() => {
          setOpenJob(null)
          setPanel('home')
        }}
        onNew={() => {
          setOpenJob(null)
          setPanel('new')
        }}
        onSettings={() => {
          setOpenJob(null)
          setPanel('settings')
        }}
      />
      {panel === 'menu' && (
        <div className="clone-menu">
          <button type="button" onClick={() => setPanel('projects')}>
            Open projects
          </button>
          <button type="button" onClick={() => setPanel('home')}>
            Home
          </button>
          <button type="button" onClick={onBack}>
            Back to Fortress
          </button>
        </div>
      )}
      {panel === 'home' && !openJob && (
        <div className="clone-home-stage">
          <h1 className="clone-wordmark" aria-label={brand.name}>
            {brand.name}
          </h1>
        </div>
      )}
      {panel === 'new' && (
        <main className="clone-page">
          <h2>Create new project</h2>
          <form className="clone-form" onSubmit={addProject}>
            <label>
              Project name
              <input value={draftName} onChange={(event) => setDraftName(event.target.value)} required />
            </label>
            <button type="submit" className="clone-login-btn">
              Create project
            </button>
          </form>
        </main>
      )}
      {(panel === 'projects' || openJob) && (
        <main className="clone-page">
          {openJob ? (
            <>
              <button type="button" className="clone-text-btn" onClick={() => setOpenJob(null)}>
                All projects
              </button>
              <h2>{openJob.name}</h2>
              {openJob.photo ? <img className="clone-job-photo" src={openJob.photo} alt="" /> : null}
              {openJob.note ? <p>{openJob.note}</p> : null}
            </>
          ) : (
            <>
              <h2>{brand.name} projects</h2>
              <div className="clone-project-list">
                {projects.map((job) => (
                  <button key={job.id} type="button" className="clone-project-card" onClick={() => setOpenJob(job)}>
                    {job.photo ? <img src={job.photo} alt="" /> : <span className="clone-brand-mark">{brand.mark}</span>}
                    <strong>{job.name}</strong>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      )}
      {panel === 'settings' && (
        <main className="clone-page">
          <h2>Settings</h2>
          <p className="clone-muted">{kindLabel} earned-value reporting and project dashboards.</p>
          <p className="clone-muted">Company class: {brand.cssName}</p>
          <p className="clone-muted">Domain: {brand.slug}</p>
          <button type="button" className="clone-text-btn" onClick={onBack}>
            Back to Fortress
          </button>
        </main>
      )}
    </div>
  )
}

function PublicCompanyProfile({ company, onClose, onOpenPost, onOpenPhoto, onOpenLive }) {
  const photo = company.profilePhoto || firstSlide(company)?.photo || ''
  const slides = company.slides || []
  const shopLink = companyShopHref(company)
  const liveLabel = shopLink.includes('#') ? shopLink.slice(shopLink.indexOf('#')) : shopLink

  return (
    <section className="detail-sheet public-profile-sheet" aria-label={`${company.name} profile`}>
      <button type="button" className="detail-close" onClick={onClose}>
        Close
      </button>
      <div className="profile-summary ig-profile-head public-profile-head">
        <button
          type="button"
          className="public-profile-avatar"
          onClick={() => photo && onOpenPhoto?.()}
          aria-label={`Open ${company.name} profile picture`}
        >
          {photo ? <img src={photo} alt="" /> : <span>{company.name.slice(0, 1)}</span>}
        </button>
        <div className="profile-copy">
          <h3>{company.name}</h3>
          <p>{company.category}</p>
          <StarRanking rating={company.rating} />
        </div>
      </div>
      {shopLink ? (
        <button
          type="button"
          className="profile-live-link"
          onClick={() => (onOpenLive ? onOpenLive(company) : undefined)}
        >
          {liveLabel}
        </button>
      ) : (
        <p className="profile-live-link muted">This company has no live website yet.</p>
      )}
      <div className="gallery-grid">
        {slides.length ? (
          slides.map((slide, index) => (
            <button
              key={`${company.id}-grid-${index}`}
              type="button"
              className="gallery-tile"
              onClick={() => onOpenPost(index)}
            >
              <img src={slide.photo} alt={slide.testimonial || `${company.name} photo ${index + 1}`} />
            </button>
          ))
        ) : (
          <p className="empty-note gallery-empty">No photos on this profile yet.</p>
        )}
      </div>
    </section>
  )
}

function App() {
  const [accounts, setAccounts] = useState(() => {
    if (typeof window === 'undefined') return []
    const saved = window.localStorage.getItem(STORE_KEY)
    if (!saved) {
      return [makeAccount(OWNER_LOGIN.email, OWNER_LOGIN.password, '', { withWebsite: false })]
    }
    try {
      return withOwnerLogin(JSON.parse(saved))
    } catch {
      return [makeAccount(OWNER_LOGIN.email, OWNER_LOGIN.password, '', { withWebsite: false })]
    }
  })
  const [signedInId, setSignedInId] = useState(() => {
    if (typeof window === 'undefined') return ''
    return window.localStorage.getItem(SESSION_KEY) || ''
  })
  const [activeProfileId, setActiveProfileId] = useState('')
  const [tab, setTab] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mallQuery, setMallQuery] = useState('')
  const [homeQuery, setHomeQuery] = useState('')
  const [comments, setComments] = useState(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(window.localStorage.getItem(COMMENTS_KEY) || '{}')
    } catch {
      return {}
    }
  })
  const [profileTab, setProfileTab] = useState('gallery')
  const [compose, setCompose] = useState({
    mode: '',
    photo: '',
    caption: '',
    shelf: '',
    feePlan: '',
  })
  const [overlay, setOverlay] = useState(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [settingsView, setSettingsView] = useState('home')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [busyLabel, setBusyLabel] = useState('')
  const [systemType, setSystemType] = useState('')
  const [ecocash, setEcocash] = useState({ number: '', password: '', name: '' })
  const [paymentNote, setPaymentNote] = useState('')
  const [websiteName, setWebsiteName] = useState('')
  const [pendingSignup, setPendingSignup] = useState(null)
  const [appRoute, setAppRoute] = useState(() => parseHashPath(readHashPath(), () => null).route)

  const menuRef = useRef(null)
  const flowToken = useRef(0)
  const avatarMenuRef = useRef(null)
  const avatarInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const composeInputRef = useRef(null)
  const composeModeRef = useRef('')
  const fromHomeCardRef = useRef(false)
  const shopFlowRef = useRef(false)
  const skipShopChoiceRef = useRef(false)
  const cardBuyRef = useRef(false)
  const shopItemInputRef = useRef(null)
  const skipPushRef = useRef(false)
  const lastPathRef = useRef(readHashPath())
  const findCompanyRef = useRef(() => null)
  const [shopItemDraft, setShopItemDraft] = useState({ name: '', price: '', photo: '', description: '' })

  useEffect(() => {
    setAccounts((previous) => withOwnerLogin(previous))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(accounts))
    }
  }, [accounts])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
    }
  }, [comments])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (signedInId) window.localStorage.setItem(SESSION_KEY, signedInId)
    else window.localStorage.removeItem(SESSION_KEY)
  }, [signedInId])

  useEffect(() => {
    const account = accounts.find((item) => item.id === signedInId)
    if (!signedInId) return
    if (!account || !isOwnerEmail(account.email)) {
      setSignedInId('')
      setActiveProfileId('')
    }
  }, [accounts, signedInId])

  useEffect(() => {
    const sync = () => {
      const path = readHashPath()
      if (path === lastPathRef.current) return
      lastPathRef.current = path
      const parsed = parseHashPath(path, findCompanyRef.current)
      skipPushRef.current = true
      setTab(parsed.tab)
      if (parsed.tab === 'settings') setSettingsView(parsed.settingsView)
      setOverlay(parsed.overlay)
      setAppRoute(parsed.route)
      setMenuOpen(false)
    }
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    const initial = readHashPath()
    if (!window.location.hash || window.location.hash === '#') {
      history.replaceState({ fortress: true }, '', '#/home')
      lastPathRef.current = '/home'
    } else {
      history.replaceState({ fortress: true }, '', `#${initial}`)
      lastPathRef.current = initial
      const parsed = parseHashPath(initial, findCompanyRef.current)
      skipPushRef.current = true
      setTab(parsed.tab)
      if (parsed.tab === 'settings') setSettingsView(parsed.settingsView)
      setOverlay(parsed.overlay)
      setAppRoute(parsed.route)
    }
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target) &&
        !event.target.closest('.profile-avatar-button')
      ) {
        setAvatarMenuOpen(false)
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  const signedInAccount = accounts.find((account) => account.id === signedInId) || null

  useEffect(() => {
    if (!signedInAccount) {
      setActiveProfileId('')
      return
    }

    if (!activeProfileId || !signedInAccount.websites.some((site) => site.id === activeProfileId)) {
      setActiveProfileId(signedInAccount.websites[0]?.id || '')
    }
  }, [signedInAccount, activeProfileId])

  const currentProfile =
    signedInAccount?.websites.find((site) => site.id === activeProfileId) ||
    signedInAccount?.websites[0] ||
    null

  useEffect(() => {
    if (!signedInAccount || !currentProfile) return
    const slug = currentProfile.slug || uniqueSlug(currentProfile.name, accounts)
    const isRetailShop = currentProfile.systemType === 'retail' || currentProfile.isShop
    const nextLink = isRetailShop ? shopHref(slug) : siteHref(slug)
    if (currentProfile.slug === slug && currentProfile.link === nextLink) return
    if (isRetailShop || !currentProfile.slug || !currentProfile.link) {
      updateCurrentWebsite({ slug, link: nextLink })
    }
  }, [signedInAccount, currentProfile, accounts])

  useEffect(() => {
    if (signedInAccount) return
    const accountOverlays = [
      'own-photo',
      'own-post',
      'add-media',
      'compose',
      'shop-item',
      'shop-item-add',
      'feature-ecocash',
      'feature-loading',
    ]
    if (overlay && accountOverlays.includes(overlay.type)) {
      setOverlay(null)
    }
    const guestSettings = ['create', 'loading', 'buy', 'system', 'ecocash', 'tailor']
    const buying = Boolean(pendingSignup) || overlay?.type === 'buy-system'
    if (tab === 'profile' && !buying) {
      setTab('login')
      pushPath('/login')
    }
    if (tab === 'settings' && !guestSettings.includes(settingsView) && !buying) {
      setTab('login')
      pushPath('/login')
    }
  }, [signedInAccount, tab, settingsView, overlay, pendingSignup])

  useEffect(() => {
    if (PHASE1_COMPLETE) return
    if (tab === 'settings' && (settingsView === 'tailor' || settingsView === 'loading')) {
      setBusyLabel('')
      setSettingsView('ecocash')
      setPaymentNote(PHASE1_ECOCASH_NOTE)
      pushPath('/settings/ecocash', { replace: true })
    }
  }, [tab, settingsView])

  const builtCards = useMemo(
    () =>
      accounts.flatMap((account, accountIndex) =>
        account.websites.map((site) => {
          const slides = slidesForSite(site)

          return {
            id: site.id,
            name: site.name,
            category: site.type || 'Business',
            shelf: 'Your shops',
            rating: 5,
            hue: accountIndex % 2 === 0 ? '#ff7b54' : '#51b6a0',
            location: 'On Fortress',
            about: site.testimonial || `${site.name} keeps its site photos on this card.`,
            slides,
            featured: (site.slides || []).some((slide) => slide.photo || slide.video),
            isShop: Boolean(site.isShop && site.systemType === 'retail'),
            slug: site.slug,
            link: site.link,
            systemType: site.systemType,
            items: site.items || [],
            cover: slides[0]?.photo || site.profilePhoto || '',
            accountIndex,
            ownerId: account.id,
            kind: 'profile',
          }
        }),
      ),
    [accounts],
  )

  const featureCards = useMemo(
    () =>
      accounts.flatMap((account, accountIndex) =>
        account.websites.flatMap((site) =>
          (site.slides || []).map((slide, index) => ({
            id: `${site.id}-feat-${index}`,
            name: site.name,
            category: site.type || 'Business',
            shelf: slide.shelf || 'New companies',
            rating: 5,
            hue: accountIndex % 2 === 0 ? '#ff7b54' : '#51b6a0',
            slides: [slide],
            kind: 'feature',
          })),
        ),
      ),
    [accounts],
  )

  findCompanyRef.current = (id) => {
    if (!id) return null
    return (
      catalog.find((item) => item.id === id) ||
      mallCatalog.find((item) => item.id === id) ||
      builtCards.find((item) => item.id === id) ||
      featureCards.find((item) => item.id === id) ||
      null
    )
  }

  const pushPath = (path, { replace = false } = {}) => {
    const next = path.startsWith('/') ? path : `/${path}`
    if (next === lastPathRef.current && !replace) return
    lastPathRef.current = next
    const url = `${window.location.pathname}${window.location.search}#${next}`
    if (replace) history.replaceState({ fortress: true }, '', url)
    else history.pushState({ fortress: true }, '', url)
  }

  const goSettingsView = (view, { replace = false } = {}) => {
    setSettingsView(view)
    pushPath(!view || view === 'home' ? '/settings' : `/settings/${view}`, { replace })
  }

  const shopProfile =
    signedInAccount?.websites.find((site) => site.isShop && site.systemType === 'retail') || null

  const mallShops = useMemo(() => {
    const needle = mallQuery.trim().toLowerCase()
    const userShops = builtCards.filter((company) => company.isShop)
    const source = [...mallCatalog, ...userShops]
    if (!needle) return source
    return source.filter((shop) => {
      const itemText = (shop.items || []).map((item) => item.name).join(' ')
      return `${shop.name} ${shop.category} ${itemText}`.toLowerCase().includes(needle)
    })
  }, [builtCards, mallQuery])

  const companyMatchesQuery = (company, query) => {
    const needle = query.trim().toLowerCase()
    if (!needle) return true
    const text = [
      company.name,
      company.category,
      company.shelf,
      ...(company.slides || []).map((slide) => slide.testimonial || ''),
    ]
      .join(' ')
      .toLowerCase()
    return text.includes(needle)
  }

  const bestSelling = [
    ...catalog.filter((company) => company.shelf === 'Best selling' && company.slides?.[0]),
    ...featureCards.filter((company) => company.shelf === 'Best selling'),
  ].filter((company) => companyMatchesQuery(company, homeQuery))

  const homeGridCards = useMemo(() => {
    const extras = builtCards.filter(
      (company) =>
        company.featured &&
        !catalog.some((item) => item.id === company.id || item.name === company.name),
    )
    return [...catalog.filter((company) => company.shelf !== 'Best selling'), ...extras].filter((company) =>
      companyMatchesQuery(company, homeQuery),
    )
  }, [builtCards, homeQuery])

  const updateCurrentWebsite = (updates) => {
    if (!signedInAccount || !currentProfile) return

    setAccounts((previous) =>
      previous.map((account) => {
        if (account.id !== signedInAccount.id) return account

        return {
          ...account,
          websites: account.websites.map((site) => {
            if (site.id !== currentProfile.id) return site
            return { ...site, ...updates }
          }),
        }
      }),
    )
  }

  const openSettingsPage = (view = 'home') => {
    setTab('settings')
    setSettingsView(view)
    setMenuOpen(false)
    setOverlay(null)
    setAuthError('')
    pushPath(view && view !== 'home' ? `/settings/${view}` : '/settings')
  }

  const handleCreateAccount = (event) => {
    event.preventDefault()
    const email = authForm.email.trim()
    const password = authForm.password

    if (!email || !password.trim()) {
      setAuthError('Enter your email and password.')
      return
    }
    if (accounts.some((account) => account.email.toLowerCase() === email.toLowerCase())) {
      setAuthError('An account with that email already exists. Use Login.')
      return
    }

    setAuthError('')
    fromHomeCardRef.current = false
    setSignedInId('')
    setActiveProfileId('')
    setPendingSignup({ email, password })
    setAuthForm({ email: '', password: '' })
    setSystemType(shopFlowRef.current ? 'retail' : '')
    setTab('settings')
    setSettingsView('buy')
    setOverlay({ type: 'buy-system' })
    pushPath('/settings/buy')
  }

  const finishLogin = (account) => {
    setSignedInId(account.id)
    setActiveProfileId(account.websites[0]?.id || '')
    setAuthForm({ email: '', password: '' })
    setAuthError('')
    setMenuOpen(false)
    setOverlay(null)
    if (cardBuyRef.current || shopFlowRef.current) {
      setTab('settings')
      goSettingsView('shop-account')
      return
    }
    setTab('home')
    setSettingsView('home')
    pushPath('/home')
  }

  const handleLogin = (event) => {
    event.preventDefault()
    const email = authForm.email.trim()
    const password = authForm.password
    if (!email || !password.trim()) {
      setAuthError('Enter your email and password.')
      return
    }
    if (!isOwnerCredentials(email, password)) {
      setAuthError(isOwnerEmail(email) ? 'That password does not match this account.' : PHASE1_LOGIN_NOTE)
      return
    }
    const owner = accounts.find((account) => isOwnerEmail(account.email))
    if (!owner) {
      setAuthError(PHASE1_LOGIN_NOTE)
      return
    }
    finishLogin({ ...owner, ...OWNER_LOGIN })
  }

  const handleAddAccount = (event) => {
    event.preventDefault()
    const email = authForm.email.trim()
    const password = authForm.password

    if (!email || !password.trim()) {
      setAuthError('Enter the email and password.')
      return
    }

    const existing = accounts.find((account) => account.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      if (!isOwnerCredentials(email, password)) {
        setAuthError(isOwnerEmail(email) ? 'That password does not match this account.' : PHASE1_LOGIN_NOTE)
        return
      }
      finishLogin(existing)
      return
    }

    setAuthError('')
    setSignedInId('')
    setActiveProfileId('')
    setPendingSignup({ email, password })
    setAuthForm({ email: '', password: '' })
    setTab('settings')
    setSettingsView('buy')
    setOverlay({ type: 'buy-system' })
    pushPath('/settings/buy')
  }

  const approvePayment = (event) => {
    event.preventDefault()
    if (!PHASE1_COMPLETE) {
      setPaymentNote(PHASE1_ECOCASH_NOTE)
      return
    }
    const number = ecocash.number.replace(/\s/g, '')
    const name = ecocash.name.trim()
    const password = ecocash.password

    if (!/^07\d{8}$/.test(number)) {
      setPaymentNote('Enter your 10-digit EcoCash number starting with 07.')
      return
    }
    if (!password.trim()) {
      setPaymentNote('Enter the EcoCash password.')
      return
    }
    if (!name) {
      setPaymentNote('Enter the name on EcoCash.')
      return
    }

    const token = flowToken.current + 1
    flowToken.current = token
    setEcocash({ number: '', password: '', name: '' })
    setPaymentNote('')
    setBusyLabel('Approving payment…')
    goSettingsView('loading', { replace: true })

    window.setTimeout(() => {
      if (flowToken.current !== token) return
      setBusyLabel('')
      setPaymentNote('Payment approved')
      goSettingsView('tailor')
    }, 900)
  }

  const createGeneratedWebsite = (event) => {
    event.preventDefault()
    const name = websiteName.trim()
    const type = SYSTEM_TYPES.find((item) => item.id === systemType) || SYSTEM_TYPES.find((item) => item.id === 'retail')
    if (!name || !type) return
    if (!signedInAccount && !pendingSignup) return

    const isRetailShop = type.id === 'retail'
    const slides = type.id === 'construction' ? type.slides : []
    const [first, ...rest] = slides
    const slug = uniqueSlug(name, accounts)
    const site = makeWebsite({
      name,
      type: type.label,
      systemType: type.id,
      slug,
      link: isRetailShop ? shopHref(slug) : siteHref(slug),
      profilePhoto: first?.photo || '',
      testimonial: first?.testimonial || '',
      gallery: rest.map((slide) => slide.photo),
      photoCaptions: rest.map((slide) => slide.testimonial),
      slides,
      isShop: isRetailShop,
      items: [],
      brandName: name,
      cssName: slugify(name).replace(/-/g, ''),
    })

    if (pendingSignup) {
      const nextAccount = {
        ...makeAccount(pendingSignup.email, pendingSignup.password, '', { withWebsite: false }),
        websites: [site],
      }
      setAccounts((previous) => [...previous, nextAccount])
      setSignedInId(nextAccount.id)
      setActiveProfileId(site.id)
      setPendingSignup(null)
    } else if (signedInAccount) {
      setAccounts((previous) =>
        previous.map((account) =>
          account.id === signedInAccount.id ? { ...account, websites: [...account.websites, site] } : account,
        ),
      )
      setActiveProfileId(site.id)
    }

    setWebsiteName('')
    setPaymentNote('')
    shopFlowRef.current = false
    skipShopChoiceRef.current = false
    cardBuyRef.current = false
    setSettingsView('home')
    setProfileTab(isRetailShop ? 'store' : 'gallery')
    setTab('profile')
    setMenuOpen(false)
    setOverlay({ type: 'live-link', site })
    pushPath('/profile/live')
    setSystemType('')
  }

  const deleteSignedInAccount = () => {
    if (!signedInAccount) return
    const removedId = signedInAccount.id
    setAccounts((previous) => previous.filter((account) => account.id !== removedId))
    setSignedInId('')
    setActiveProfileId('')
    goSettingsView('manage')
  }

  const emptyCompose = () => ({
    mode: '',
    photo: '',
    caption: '',
    shelf: '',
    feePlan: '',
  })

  const openAddMedia = () => {
    setCompose(emptyCompose())
    setOverlay({ type: 'add-media' })
    pushPath('/profile/add')
  }

  const pickComposeFile = (mode) => {
    composeModeRef.current = mode
    setCompose({ ...emptyCompose(), mode })
    composeInputRef.current?.click()
  }

  const handleComposeFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    const mode = composeModeRef.current
    if (!file || !mode) return
    const photo = await readFileAsDataUrl(file)
    setCompose({ ...emptyCompose(), mode, photo })
    setOverlay({ type: 'compose' })
    pushPath('/profile/compose')
  }

  const publishFeaturePost = () => {
    if (!currentProfile || !compose.photo) return
    const caption = compose.caption.trim()
    updateCurrentWebsite({
      gallery: [...(currentProfile.gallery || []), compose.photo],
      photoCaptions: [...(currentProfile.photoCaptions || []), caption],
      slides: [
        ...(currentProfile.slides || []),
        {
          photo: compose.photo,
          testimonial: caption,
          shelf: compose.shelf || 'New companies',
          feePlan: compose.feePlan || '',
        },
      ],
    })
    setCompose(emptyCompose())
    setOverlay(null)
    setProfileTab('gallery')
    pushPath('/profile')
  }

  const submitCompose = (event) => {
    event.preventDefault()
    if (!currentProfile || !compose.photo) return

    if (compose.mode === 'gallery') {
      const caption = compose.caption.trim()
      updateCurrentWebsite({
        gallery: [...(currentProfile.gallery || []), compose.photo],
        photoCaptions: [...(currentProfile.photoCaptions || []), caption],
        slides: [
          ...(currentProfile.slides || []),
          { photo: compose.photo, testimonial: caption || 'Gallery photo from the company card.' },
        ],
      })
      setCompose(emptyCompose())
      setOverlay(null)
      setProfileTab('gallery')
      pushPath('/profile')
      return
    }

    if (compose.mode !== 'feature' || !compose.shelf) return
    if (compose.shelf === 'Best selling') {
      if (!compose.feePlan) return
      setEcocash({ number: '', password: '', name: '' })
      setPaymentNote('')
      setOverlay({ type: 'feature-ecocash' })
      pushPath('/profile/feature-pay')
      return
    }

    publishFeaturePost()
  }

  const submitFeatureEcoCash = (event) => {
    event.preventDefault()
    if (!PHASE1_COMPLETE) {
      setPaymentNote(PHASE1_ECOCASH_NOTE)
      return
    }
    const number = ecocash.number.replace(/\s/g, '')
    const name = ecocash.name.trim()
    const password = ecocash.password

    if (!/^07\d{8}$/.test(number)) {
      setPaymentNote('Enter your 10-digit EcoCash number starting with 07.')
      return
    }
    if (!password.trim()) {
      setPaymentNote('Enter the EcoCash password.')
      return
    }
    if (!name) {
      setPaymentNote('Enter the name on EcoCash.')
      return
    }

    setPaymentNote('')
    setBusyLabel('Approving payment…')
    setOverlay({ type: 'feature-loading' })
    pushPath('/profile/feature-pay', { replace: true })
    window.setTimeout(() => {
      setBusyLabel('')
      setEcocash({ number: '', password: '', name: '' })
      publishFeaturePost()
    }, 900)
  }

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const src = await readFileAsDataUrl(file)
    updateCurrentWebsite({
      profilePhoto: src,
      gallery: currentProfile?.gallery?.includes(src)
        ? currentProfile.gallery
        : [src, ...(currentProfile?.gallery || [])],
    })
    setAvatarMenuOpen(false)
    event.target.value = ''
  }

  const handleProfilePictureAction = async (action) => {
    if (action === 'view') {
      openOwnProfilePhoto()
      return
    }

    const target = {
      gallery: avatarInputRef,
      files: fileInputRef,
      camera: cameraInputRef,
    }[action]

    target?.current?.click()
    setAvatarMenuOpen(false)
  }

  const goLogin = () => {
    setTab('login')
    setMenuOpen(false)
    setOverlay(null)
    setPendingSignup(null)
    setAuthError('')
    setAuthForm({ email: '', password: '' })
    setAppRoute({ kind: '', slug: '' })
    pushPath('/login')
  }

  const logout = () => {
    setSignedInId('')
    setActiveProfileId('')
    setMenuOpen(false)
    setOverlay(null)
    setAuthForm({ email: '', password: '' })
    setAuthError('')
    setSettingsView('home')
    setProfileTab('gallery')
    shopFlowRef.current = false
    skipShopChoiceRef.current = false
    cardBuyRef.current = false
    setPendingSignup(null)
    setAppRoute({ kind: '', slug: '' })
    setTab('home')
    pushPath('/home')
  }

  const goTab = (nextTab) => {
    if (nextTab === 'logout') {
      logout()
      return
    }
    if (nextTab === 'login') {
      goLogin()
      return
    }
    if (!signedInAccount && (nextTab === 'profile' || nextTab === 'settings')) {
      if (pendingSignup && nextTab === 'settings') {
        setTab('settings')
        setSettingsView('buy')
        setOverlay({ type: 'buy-system' })
        setMenuOpen(false)
        setAppRoute({ kind: '', slug: '' })
        pushPath('/settings/buy')
        return
      }
      goLogin()
      return
    }
    setTab(nextTab)
    setMenuOpen(false)
    setOverlay(null)
    setAppRoute({ kind: '', slug: '' })
    if (nextTab === 'settings') {
      flowToken.current += 1
      setBusyLabel('')
      setSettingsView('home')
    }
    pushPath(`/${nextTab}`)
  }

  const closeOverlay = () => {
    setOverlay(null)
    pushPath(pathFromNav({ tab, settingsView, overlay: null }))
  }

  const leavePublished = () => {
    setAppRoute({ kind: '', slug: '' })
    setTab('home')
    pushPath('/home')
  }

  const openGallery = (company) => {
    const source =
      catalog.find((item) => item.id === company.id || item.name === company.name) || company
    setOverlay({ type: 'gallery', company: withVideoSlides(source) })
    pushPath(`/${tab}/card/${encodeId(source.id)}`)
  }

  const switchAccount = (accountId) => {
    const account = accounts.find((item) => item.id === accountId)
    if (!account) return
    setSignedInId(account.id)
    setActiveProfileId(account.websites[0]?.id || '')
    setOverlay(null)
    setMenuOpen(false)
  }

  const ownGalleryCompany = () => {
    if (!currentProfile) return null
    const slides = (currentProfile.gallery || []).map((photo, index) => ({
      photo,
      testimonial: currentProfile.photoCaptions?.[index] || currentProfile.testimonial || '',
    }))
    return {
      id: currentProfile.id,
      name: currentProfile.name || 'My account',
      slides,
    }
  }

  const openOwnProfilePhoto = () => {
    const src = currentProfile?.profilePhoto || currentProfile?.gallery?.[0]
    if (!src) {
      setAvatarMenuOpen(true)
      return
    }
    setAvatarMenuOpen(false)
    setOverlay({
      type: 'own-photo',
      company: {
        id: currentProfile.id,
        name: currentProfile.name || 'My account',
        slides: [{ photo: src, testimonial: currentProfile.name || 'Profile picture' }],
      },
    })
    pushPath('/profile/photo')
  }

  const openOwnGalleryPost = (postIndex) => {
    const company = ownGalleryCompany()
    if (!company?.slides?.length) return
    setOverlay({ type: 'own-post', company, postIndex })
    pushPath(`/profile/post/${postIndex}`)
  }

  const openMallShop = (shop) => {
    setOverlay({ type: 'shop', company: shop })
    pushPath(`/mall/open/${encodeId(shop.id)}`)
  }

  const viewCompanyProfile = (company) => {
    if (!signedInAccount) {
      setOverlay({ type: 'gate', company })
      pushPath(`/${tab}/card/${encodeId(company.id)}/gate`)
      return
    }
    setOverlay({ type: 'profile', company, postIndex: null })
    pushPath(`/${tab}/card/${encodeId(company.id)}/profile`)
  }

  const openCompanyPost = (company, postIndex) => {
    setOverlay({ type: 'profile', company, postIndex })
    pushPath(`/${tab}/card/${encodeId(company.id)}/profile/${postIndex}`)
  }

  const closeCompanyPost = () => {
    if (!overlayCompany) return
    setOverlay({ type: 'profile', company: overlayCompany, postIndex: null })
    pushPath(`/${tab}/card/${encodeId(overlayCompany.id)}/profile`)
  }

  const startShopAccount = () => {
    shopFlowRef.current = true
    skipShopChoiceRef.current = false
    cardBuyRef.current = false
    setSystemType('retail')
    setEcocash({ number: '', password: '', name: '' })
    setPaymentNote('')
    setWebsiteName('')
    setProfileTab('store')
    setAuthError('')
    if (!signedInAccount) {
      goLogin()
      return
    }
    openSettingsPage('shop-account')
  }

  const startBuySystem = (company) => {
    const typeId = systemIdFromCompany(company)
    const type = SYSTEM_TYPES.find((item) => item.id === typeId) || SYSTEM_TYPES[0]
    cardBuyRef.current = true
    shopFlowRef.current = type.id === 'retail'
    skipShopChoiceRef.current = false
    setSystemType(type.id)
    setEcocash({ number: '', password: '', name: '' })
    setPaymentNote('')
    setWebsiteName('')
    setAuthError('')
    setAuthForm({ email: '', password: '' })
    if (type.id === 'retail') setProfileTab('store')
    if (!signedInAccount) {
      goLogin()
      return
    }
    openSettingsPage('shop-account')
  }

  const chooseShopAccount = (choice) => {
    if (choice === 'new') {
      skipShopChoiceRef.current = true
      setAuthForm({ email: '', password: '' })
      setAuthError('')
      goSettingsView('create')
      return
    }
    skipShopChoiceRef.current = true
    setEcocash({ number: '', password: '', name: '' })
    setPaymentNote('')
    goSettingsView('ecocash')
  }

  const continueFromSystem = (typeId) => {
    setSystemType(typeId)
    setEcocash({ number: '', password: '', name: '' })
    setPaymentNote('')
    shopFlowRef.current = typeId === 'retail'
    setOverlay(null)
    if (pendingSignup) {
      goSettingsView('ecocash')
      return
    }
    if (signedInAccount && !skipShopChoiceRef.current) {
      goSettingsView('shop-account')
      return
    }
    goSettingsView('ecocash')
  }

  const cancelPendingSignup = () => {
    const keepSession = Boolean(signedInAccount)
    setPendingSignup(null)
    setSystemType('')
    setOverlay(null)
    setWebsiteName('')
    setEcocash({ number: '', password: '', name: '' })
    setPaymentNote('')
    if (keepSession) {
      setTab('settings')
      goSettingsView('manage')
      return
    }
    goLogin()
  }

  const openGeneratedSite = (site) => {
    if (!site) return
    const slug = site.slug || String(site.id || '').replace(/^mall-/, '')
    if (!slug) return
    const isRetailShop = site.systemType === 'retail' || site.isShop
    setOverlay(null)
    setAppRoute({ kind: isRetailShop ? 'shop' : 'site', slug })
    const next = isRetailShop ? `/shop/${slug}` : `/site/${slug}`
    lastPathRef.current = next
    window.location.hash = next
  }

  const updateShopWebsite = (updates) => {
    if (!signedInAccount || !shopProfile) return
    setAccounts((previous) =>
      previous.map((account) => {
        if (account.id !== signedInAccount.id) return account
        return {
          ...account,
          websites: account.websites.map((site) => (site.id === shopProfile.id ? { ...site, ...updates } : site)),
        }
      }),
    )
  }

  const handleShopItemPhoto = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const photo = await readFileAsDataUrl(file)
    const fromFile = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
    setShopItemDraft((previous) => ({
      ...previous,
      photo,
      name: previous.name.trim() ? previous.name : fromFile,
    }))
  }

  const addComment = (targetId, text) => {
    if (!signedInAccount) return
    const entry = {
      id: makeId('comment'),
      authorId: signedInAccount.id,
      author: signedInAccount.email,
      text,
      replies: [],
    }
    setComments((previous) => ({
      ...previous,
      [targetId]: [...(previous[targetId] || []), entry],
    }))
  }

  const replyToComment = (targetId, commentId, text) => {
    if (!signedInAccount) return
    const reply = {
      id: makeId('reply'),
      authorId: signedInAccount.id,
      author: signedInAccount.email,
      text,
    }
    setComments((previous) => ({
      ...previous,
      [targetId]: (previous[targetId] || []).map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...(comment.replies || []), reply] } : comment,
      ),
    }))
  }

  const needAccountForComment = () => {
    fromHomeCardRef.current = false
    goLogin()
  }

  const deleteOwnPhoto = (index) => {
    if (!currentProfile) return
    const gallery = [...(currentProfile.gallery || [])]
    const captions = [...(currentProfile.photoCaptions || [])]
    const photo = gallery[index]
    if (!photo) return
    gallery.splice(index, 1)
    captions.splice(index, 1)
    updateCurrentWebsite({
      gallery,
      photoCaptions: captions,
      slides: (currentProfile.slides || []).filter((slide) => slide.photo !== photo),
      profilePhoto: currentProfile.profilePhoto === photo ? gallery[0] || '' : currentProfile.profilePhoto,
    })
    setOverlay(null)
    pushPath('/profile')
  }

  const openAddShopItem = () => {
    if (!shopProfile) {
      startShopAccount()
      return
    }
    setShopItemDraft({ name: '', price: '', photo: '', description: '' })
    setProfileTab('store')
    setOverlay({ type: 'shop-item-add' })
    pushPath('/profile/shop/add')
  }

  const openShopItem = (item) => {
    setShopItemDraft({
      name: item.name || '',
      price: item.price === 0 || item.price ? String(item.price) : '',
      photo: item.photo || '',
      description: item.description || '',
    })
    setProfileTab('store')
    setOverlay({ type: 'shop-item', itemId: item.id })
    pushPath(`/profile/shop/item/${encodeId(item.id)}`)
  }

  const writeShopItemDraft = (updates) => {
    setShopItemDraft((previous) => ({ ...previous, ...updates }))
  }

  const addShopItem = () => {
    if (!shopProfile) return
    const name = shopItemDraft.name.trim()
    if (!name && !shopItemDraft.photo) return
    const price = Number(shopItemDraft.price)
    if (!Number.isFinite(price) || price < 0) return
    const item = {
      id: makeId('item'),
      name: name || 'Item',
      photo: shopItemDraft.photo,
      price,
      description: shopItemDraft.description.trim(),
    }
    updateShopWebsite({
      items: [...(shopProfile.items || []), item],
    })
    setShopItemDraft({ name: '', price: '', photo: '', description: '' })
    setOverlay(null)
    setProfileTab('store')
    pushPath('/profile')
  }

  useEffect(() => {
    if (overlay?.type !== 'shop-item' || !overlay.itemId || !shopProfile) return
    const item = (shopProfile.items || []).find((entry) => entry.id === overlay.itemId)
    if (!item) return
    const looksEmpty =
      !shopItemDraft.name && !shopItemDraft.photo && !shopItemDraft.description && shopItemDraft.price === ''
    if (looksEmpty) {
      setShopItemDraft({
        name: item.name || '',
        price: item.price === 0 || item.price ? String(item.price) : '',
        photo: item.photo || '',
        description: item.description || '',
      })
      return
    }
    const price = Number(shopItemDraft.price)
    const nextPrice = Number.isFinite(price) && price >= 0 ? price : item.price
    if (
      item.name === shopItemDraft.name &&
      item.photo === shopItemDraft.photo &&
      (item.description || '') === (shopItemDraft.description || '') &&
      item.price === nextPrice
    ) {
      return
    }
    updateShopWebsite({
      items: (shopProfile.items || []).map((entry) =>
        entry.id === overlay.itemId
          ? {
              ...entry,
              name: shopItemDraft.name,
              photo: shopItemDraft.photo,
              description: shopItemDraft.description,
              price: nextPrice,
            }
          : entry,
      ),
    })
  }, [overlay?.type, overlay?.itemId, shopItemDraft, shopProfile])

  const overlayCompany = overlay?.company
  const chosenSystem = SYSTEM_TYPES.find((item) => item.id === systemType) || null
  const publishedSite =
    appRoute.kind === 'site'
      ? accounts.flatMap((account) => account.websites).find((site) => site.slug === appRoute.slug) || null
      : null
  const publishedShop = appRoute.kind === 'shop' ? shopBySlug(appRoute.slug, accounts) : null

  if (appRoute.kind === 'shop') {
    const shopOwner = accounts.find((account) =>
      account.websites.some((site) => site.slug === appRoute.slug && (site.systemType === 'retail' || site.isShop)),
    )
    return (
      <ShopStorefront
        shop={publishedShop}
        owner={shopOwner || null}
        onBack={() => {
          leavePublished()
        }}
      />
    )
  }

  if (appRoute.kind === 'site') {
    const siteOwner = accounts.find((account) =>
      account.websites.some((site) => site.slug === appRoute.slug),
    )
    if (publishedSite?.systemType === 'manufacturing') {
      return (
        <ShopStorefront
          shop={publishedSite}
          owner={siteOwner || null}
          onBack={() => {
            leavePublished()
          }}
        />
      )
    }
    return (
      <GeneratedWebsite
        site={publishedSite}
        onBack={() => {
          leavePublished()
        }}
      />
    )
  }

  return (
    <div className="phone-app-shell">
      <div className="phone-frame">
        <header className="phone-header">
          <div className="title-row">
            <div>
              <p className="eyebrow">Run sites from phone</p>
              <h1>Fortress</h1>
            </div>
            <div className="menu-wrap" ref={menuRef}>
              <button
                type="button"
                className="menu-button"
                aria-label="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                ☰
              </button>
              {menuOpen && (
                <div className="header-menu">
                  {(signedInAccount ? [...NAV, { id: 'logout', label: 'Logout' }] : GUEST_NAV).map((item) => (
                    <MenuButton
                      key={item.id}
                      item={item}
                      active={tab === item.id}
                      onSelect={goTab}
                      className={`${tab === item.id ? 'menu-link active' : 'menu-link'}${item.id === 'logout' ? ' logout-link' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="phone-content">
          {tab === 'home' && (
            <div className="store-home">
              <form className="store-search" role="search" onSubmit={(event) => event.preventDefault()}>
                <input
                  type="search"
                  value={homeQuery}
                  placeholder="Search a testimonial"
                  onChange={(event) => setHomeQuery(event.target.value)}
                />
              </form>
              {bestSelling.length > 0 ? <FeatureFlip companies={bestSelling} onOpen={openGallery} /> : (
                homeQuery.trim() ? <p className="empty-note">No testimonials match that search.</p> : null
              )}
              {homeGridCards.length > 0 ? (
                <div className="home-grid" aria-label="Company cards">
                  {homeGridCards.map((company) => (
                    <HomeTile key={company.id} company={company} onOpen={openGallery} />
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {tab === 'login' && (
            <section className="panel-box settings-page">
              <form className="create-account-form" onSubmit={handleLogin}>
                <h3>Login</h3>
                <p className="shop-copy">
                  Enter your account email and password. Until phase 1 is complete, only the Fortress owner can open a
                  profile.
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((value) => ({ ...value, email: event.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm((value) => ({ ...value, password: event.target.value }))}
                  required
                />
                {authError && <p className="form-error">{authError}</p>}
                <button type="submit" className="primary-button">
                  Login
                </button>
              </form>
              <button
                type="button"
                className="text-back"
                onClick={() => {
                  setAuthError('')
                  setAuthForm({ email: '', password: '' })
                  openSettingsPage('create')
                }}
              >
                Create account
              </button>
            </section>
          )}

          {tab === 'profile' && !signedInAccount && (
            <section className="profile-panel">
              <div className="gate-copy">
                <h2>Create an account to view more</h2>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    fromHomeCardRef.current = false
                    openSettingsPage('create')
                  }}
                >
                  Create account
                </button>
              </div>
            </section>
          )}

          {tab === 'profile' && signedInAccount && (
            <section className="profile-panel">
              <div className="profile-summary ig-profile-head">
                <div className="profile-avatar-wrap" ref={avatarMenuRef}>
                  <button
                    type="button"
                    className="profile-avatar-button"
                    onClick={openOwnProfilePhoto}
                    aria-label="Open profile photo"
                  >
                    {currentProfile?.profilePhoto ? (
                      <img src={currentProfile.profilePhoto} alt="Profile" />
                    ) : (
                      <span>{(currentProfile?.name || signedInAccount.email)?.[0]?.toUpperCase() || 'F'}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="avatar-edit"
                    onClick={() => setAvatarMenuOpen((value) => !value)}
                  >
                    Edit
                  </button>

                  {avatarMenuOpen && (
                    <div className="avatar-menu">
                      <button type="button" onClick={() => handleProfilePictureAction('view')}>
                        View profile picture
                      </button>
                      <button type="button" onClick={() => handleProfilePictureAction('gallery')}>
                        Open gallery
                      </button>
                      <button type="button" onClick={() => handleProfilePictureAction('files')}>
                        Files
                      </button>
                      <button type="button" onClick={() => handleProfilePictureAction('camera')}>
                        Take a photo
                      </button>
                    </div>
                  )}

                  <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarSelect} />
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarSelect} />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={handleAvatarSelect}
                  />
                  <input ref={composeInputRef} type="file" accept="image/*" hidden onChange={handleComposeFile} />
                </div>

                <div className="profile-copy">
                  <h3>{currentProfile?.name || 'My account'}</h3>
                  <p>{signedInAccount.email}</p>
                </div>
              </div>

              {currentProfile?.slug ? (
                <button
                  type="button"
                  className="profile-live-link"
                  onClick={() => openGeneratedSite(currentProfile)}
                >
                  {displayLivePath(currentProfile)}
                </button>
              ) : (
                <p className="profile-live-link muted">Live website appears here after it is created.</p>
              )}

              {currentProfile && signedInAccount.websites.length > 1 && (
                <div className="profile-switcher highlight-row">
                  {signedInAccount.websites.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      className={site.id === currentProfile.id ? 'highlight-dot active' : 'highlight-dot'}
                      onClick={() => setActiveProfileId(site.id)}
                      aria-label={site.name}
                    >
                      {(site.name || 'S')[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              <div className="ig-tabs" role="tablist" aria-label="Profile sections">
                <button
                  type="button"
                  role="tab"
                  aria-selected={profileTab === 'gallery'}
                  className={profileTab === 'gallery' ? 'ig-tab active' : 'ig-tab'}
                  onClick={() => setProfileTab('gallery')}
                  aria-label="Gallery"
                >
                  <IconGrid />
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={profileTab === 'store'}
                  className={profileTab === 'store' ? 'ig-tab active' : 'ig-tab'}
                  onClick={() => setProfileTab('store')}
                  aria-label="Store"
                >
                  <IconStoreTab />
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={profileTab === 'company'}
                  className={profileTab === 'company' ? 'ig-tab active' : 'ig-tab'}
                  onClick={() => setProfileTab('company')}
                  aria-label="Company"
                >
                  <IconCompanyTab />
                </button>
              </div>

              {profileTab === 'gallery' && (
                <div className="gallery-grid">
                  {(currentProfile?.gallery || []).length ? (
                    (currentProfile.gallery || []).map((image, index) => (
                      <div className="gallery-tile-wrap" key={`${image.slice(0, 24)}-${index}`}>
                        <button
                          type="button"
                          className="gallery-tile"
                          onClick={() => openOwnGalleryPost(index)}
                        >
                          <img src={image} alt={currentProfile.photoCaptions?.[index] || `Gallery ${index + 1}`} />
                        </button>
                        <button
                          type="button"
                          className="tile-delete"
                          onClick={() => deleteOwnPhoto(index)}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="empty-note gallery-empty">Tap + to add a photo to gallery.</p>
                  )}
                </div>
              )}

              {profileTab === 'store' && (
                <div className="profile-tab-panel shop-profile-tab">
                  {shopProfile ? (
                    <div className="shop-profile">
                      <input
                        className="shop-name-field"
                        type="text"
                        value={shopProfile.name || ''}
                        placeholder=""
                        aria-label="Shop name"
                        onChange={(event) => updateShopWebsite({ name: event.target.value })}
                      />
                      <button
                        type="button"
                        className="view-mall-mini"
                        onClick={() =>
                          openMallShop({
                            ...shopProfile,
                            cover: shopProfile.items?.[0]?.photo || shopProfile.profilePhoto || '',
                            category: shopProfile.type || 'Retail',
                          })
                        }
                      >
                        View in online mall
                      </button>
                      <div className="gallery-grid shop-grid">
                        {(shopProfile.items || []).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="gallery-tile shop-tile"
                            onClick={() => openShopItem(item)}
                          >
                            {item.photo ? (
                              <img src={item.photo} alt="" />
                            ) : (
                              <span className="shop-tile-fallback">{(item.name || 'I').slice(0, 1)}</span>
                            )}
                            <span className="shop-tile-price">{formatPrice(item.price)}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          className="gallery-tile shop-add-tile"
                          onClick={openAddShopItem}
                          aria-label="Add item"
                        >
                          <span>+</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="lock-card shop-lock">
                      <IconLock />
                      <h2>User does not have a shop account. Click to create account.</h2>
                      <button type="button" className="primary-button" onClick={startShopAccount}>
                        Create shop account
                      </button>
                    </div>
                  )}
                </div>
              )}

              {profileTab === 'company' && (
                <div className="profile-tab-panel">
                  {currentProfile?.link ? (
                    <a className="website-link" href={currentProfile.link}>
                      <strong>{currentProfile.name}</strong>
                      <span>{currentProfile.link}</span>
                    </a>
                  ) : (
                    <p className="empty-note">Create a website to open the company page.</p>
                  )}
                </div>
              )}
            </section>
          )}

          {tab === 'settings' && settingsView === 'home' && (
            <section className="panel-box settings-page">
              <h3>Settings</h3>
              <div className="logged-as">
                <p>Logged in as</p>
                {signedInAccount ? (
                  <strong>{signedInAccount.email}</strong>
                ) : (
                  <strong>Not signed in</strong>
                )}
              </div>
              {accounts.length > 0 && (
                <div className="account-switch">
                  <p className="shop-copy">Switch accounts</p>
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      className={account.id === signedInId ? 'account-chip active' : 'account-chip'}
                      onClick={() => switchAccount(account.id)}
                    >
                      <span>{account.email}</span>
                      <small>{account.id === signedInId ? 'Current' : 'Switch'}</small>
                    </button>
                  ))}
                </div>
              )}
              <p className="shop-copy">Manage the account that runs your Fortress website.</p>
              <button type="button" className="primary-button" onClick={() => goSettingsView('manage')}>
                Manage accounts
              </button>
            </section>
          )}

          {tab === 'settings' && settingsView === 'manage' && (
            <section className="panel-box settings-page">
              <button type="button" className="text-back" onClick={() => goSettingsView('home')}>
                Back
              </button>
              <h3>Manage accounts</h3>
              <div className="settings-actions">
                <button type="button" onClick={() => goSettingsView('my-account')}>
                  My account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('')
                    setAuthForm({ email: '', password: '' })
                    goSettingsView('create')
                  }}
                >
                  Create account
                </button>
                <button type="button" onClick={() => goSettingsView('delete')}>
                  Delete account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('')
                    setAuthForm({ email: '', password: '' })
                    goSettingsView('add')
                  }}
                >
                  Add account
                </button>
              </div>
            </section>
          )}

          {tab === 'settings' && settingsView === 'my-account' && (
            <section className="panel-box settings-page">
              <button type="button" className="text-back" onClick={() => goSettingsView('manage')}>
                Back
              </button>
              <h3>My account</h3>
              {signedInAccount ? (
                <div className="settings-card">
                  <p>{signedInAccount.email}</p>
                  {signedInAccount.websites.some((site) => site.link) ? (
                    <div className="website-links">
                      {signedInAccount.websites
                        .filter((site) => site.link)
                        .map((site) => (
                          <a className="website-link" key={site.id} href={site.link}>
                            <strong>{site.name}</strong>
                            <span>{site.link}</span>
                          </a>
                        ))}
                    </div>
                  ) : (
                    <p className="empty-note">No website on this account yet.</p>
                  )}
                  {(() => {
                    const owned = new Set(
                      signedInAccount.websites.map((site) => site.systemType).filter(Boolean),
                    )
                    if (owned.has('retail') && owned.has('construction') && owned.has('manufacturing')) {
                      return null
                    }
                    return (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          if (!owned.has('retail') && (owned.has('construction') || owned.has('manufacturing'))) {
                            shopFlowRef.current = true
                            setSystemType('retail')
                          }
                          goSettingsView('buy')
                        }}
                      >
                        Buy Fortress system
                      </button>
                    )
                  })()}
                  <button type="button" className="primary-button" onClick={() => goTab('profile')}>
                    Open profile
                  </button>
                  <button type="button" className="text-back" onClick={logout}>
                    Logout
                  </button>
                </div>
              ) : (
                <p className="empty-note">No account is signed in. Create an account or add an account.</p>
              )}
            </section>
          )}

          {tab === 'settings' && settingsView === 'create' && (
            <section className="panel-box settings-page">
              <button
                type="button"
                className="text-back"
                onClick={() => {
                  if (shopFlowRef.current || cardBuyRef.current) {
                    skipShopChoiceRef.current = false
                    goSettingsView(signedInAccount ? 'shop-account' : 'manage')
                    return
                  }
                  if (!signedInAccount) {
                    goLogin()
                    return
                  }
                  goSettingsView('manage')
                }}
              >
                Back
              </button>
              <form className="create-account-form" onSubmit={handleCreateAccount}>
                <h3>Create account</h3>
                <p className="shop-copy">Enter your login credentials.</p>
                <input
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((value) => ({ ...value, email: event.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm((value) => ({ ...value, password: event.target.value }))}
                  required
                />
                {authError && <p className="form-error">{authError}</p>}
                <button type="submit" className="primary-button">
                  Create account
                </button>
              </form>
            </section>
          )}

          {tab === 'settings' && settingsView === 'add' && (
            <section className="panel-box settings-page">
              <button type="button" className="text-back" onClick={() => goSettingsView('manage')}>
                Back
              </button>
              <form className="create-account-form" onSubmit={handleAddAccount}>
                <h3>Add account</h3>
                <p className="shop-copy">Enter the email and password for the account to add.</p>
                <input
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((value) => ({ ...value, email: event.target.value }))}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm((value) => ({ ...value, password: event.target.value }))}
                  required
                />
                {authError && <p className="form-error">{authError}</p>}
                <button type="submit" className="primary-button">
                  Add account
                </button>
              </form>
            </section>
          )}

          {tab === 'settings' && settingsView === 'delete' && (
            <section className="panel-box settings-page">
              <button type="button" className="text-back" onClick={() => goSettingsView('manage')}>
                Back
              </button>
              <h3>Delete account</h3>
              {signedInAccount ? (
                <div className="settings-card">
                  <p>Delete {signedInAccount.email} and the websites on this account?</p>
                  <button type="button" className="danger-button" onClick={deleteSignedInAccount}>
                    Delete account
                  </button>
                </div>
              ) : (
                <p className="empty-note">Sign in from My account or Add account before deleting an account.</p>
              )}
            </section>
          )}

          {tab === 'settings' && settingsView === 'loading' && (
            <section className="panel-box settings-page">
              <p className="loading-note">{busyLabel}</p>
            </section>
          )}

          {tab === 'settings' && settingsView === 'buy' && (
            <section className="panel-box settings-page">
              {pendingSignup ? (
                <>
                  <h3>Buy a Fortress system</h3>
                  <p className="shop-copy">
                    Your login details are held until you buy construction, manufacturing, or retail. If you leave
                    without buying, no account is created.
                  </p>
                  <div className="settings-actions">
                    {SYSTEM_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={systemType === type.id ? 'system-choice active' : 'system-choice'}
                        onClick={() => continueFromSystem(type.id)}
                      >
                        {type.label}
                        {type.id === 'retail' ? <small>Shop in the online mall</small> : null}
                        {type.id === 'construction' ? <small>Rodcroft-style website</small> : null}
                        {type.id === 'manufacturing' ? <small>Prixburg-style website</small> : null}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="text-back" onClick={cancelPendingSignup}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h3>Account ready</h3>
                  <p className="shop-copy">Your account is signed in. Buy a Fortress system to generate the website.</p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      if (shopFlowRef.current) setSystemType('retail')
                      goSettingsView('system')
                    }}
                  >
                    Buy Fortress system
                  </button>
                </>
              )}
            </section>
          )}

          {tab === 'settings' && settingsView === 'system' && (
            <section className="panel-box settings-page">
              <button type="button" className="text-back" onClick={() => goSettingsView('buy')}>
                Back
              </button>
              <h3>Choose a system</h3>
              <p className="shop-copy">Construction, manufacturing, or retail. Retail is selected for a shop account.</p>
              <div className="settings-actions">
                {SYSTEM_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={systemType === type.id ? 'system-choice active' : 'system-choice'}
                    onClick={() => continueFromSystem(type.id)}
                  >
                    {type.label}
                    {type.id === 'retail' ? <small>Default for shops</small> : null}
                  </button>
                ))}
              </div>
            </section>
          )}

          {tab === 'settings' && settingsView === 'shop-account' && (
            <section className="panel-box settings-page">
              <button
                type="button"
                className="text-back"
                onClick={() => {
                  if (cardBuyRef.current) {
                    goSettingsView('home')
                    return
                  }
                  goSettingsView('system')
                }}
              >
                Back
              </button>
              <h3>{chosenSystem ? `Buy ${chosenSystem.label} system` : 'Buy system'}</h3>
              <p className="shop-copy">
                Use the account you are signed in with, or create a new account to buy this system.
              </p>
              <div className="settings-actions">
                <button type="button" onClick={() => chooseShopAccount('current')}>
                  Use current running account
                </button>
                <button type="button" onClick={() => chooseShopAccount('new')}>
                  Create a new account
                </button>
              </div>
            </section>
          )}

          {tab === 'settings' && settingsView === 'ecocash' && (
            <section className="panel-box settings-page">
              <button
                type="button"
                className="text-back"
                onClick={() => {
                  setEcocash({ number: '', password: '', name: '' })
                  setPaymentNote('')
                  if (pendingSignup) {
                    goSettingsView('buy')
                    setOverlay({ type: 'buy-system' })
                    return
                  }
                  if (
                    (shopFlowRef.current || cardBuyRef.current) &&
                    skipShopChoiceRef.current &&
                    signedInAccount
                  ) {
                    skipShopChoiceRef.current = false
                    goSettingsView('shop-account')
                    return
                  }
                  if (cardBuyRef.current) {
                    goSettingsView(signedInAccount ? 'shop-account' : 'create')
                    return
                  }
                  goSettingsView('system')
                }}
              >
                Back
              </button>
              <form className="ecocash-card" onSubmit={approvePayment}>
                <p className="ecocash-kicker">EcoCash</p>
                <h3>{chosenSystem ? `${chosenSystem.label} system` : 'Fortress system'}</h3>
                {!PHASE1_COMPLETE ? <p className="shop-copy">{PHASE1_ECOCASH_NOTE}</p> : null}
                <label>
                  EcoCash number
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="07xxxxxxxx"
                    value={ecocash.number}
                    disabled={!PHASE1_COMPLETE}
                    onChange={(event) => setEcocash((value) => ({ ...value, number: event.target.value }))}
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    autoComplete="off"
                    placeholder="Password"
                    value={ecocash.password}
                    disabled={!PHASE1_COMPLETE}
                    onChange={(event) => setEcocash((value) => ({ ...value, password: event.target.value }))}
                  />
                </label>
                <label>
                  Name on EcoCash
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Name on EcoCash"
                    value={ecocash.name}
                    disabled={!PHASE1_COMPLETE}
                    onChange={(event) => setEcocash((value) => ({ ...value, name: event.target.value }))}
                  />
                </label>
                {paymentNote && <p className="form-error">{paymentNote}</p>}
                <button type="submit" className="primary-button" disabled={!PHASE1_COMPLETE}>
                  Approve payment
                </button>
              </form>
            </section>
          )}

          {tab === 'settings' && settingsView === 'tailor' && (
            <section className="panel-box settings-page">
              <p className="payment-approved">Payment approved</p>
              <form className="create-account-form" onSubmit={createGeneratedWebsite}>
                <h3>Tailor making details</h3>
                <label>
                  {systemType === 'retail' || shopFlowRef.current ? 'Name of shop' : 'Name of website'}
                  <input
                    type="text"
                    placeholder={
                      systemType === 'retail' || shopFlowRef.current
                        ? 'Name of shop'
                        : 'Name of the website'
                    }
                    value={websiteName}
                    onChange={(event) => setWebsiteName(event.target.value)}
                    required
                  />
                </label>
                <button type="submit" className="primary-button">
                  {systemType === 'retail' || shopFlowRef.current ? 'Create shop' : 'Create website'}
                </button>
              </form>
            </section>
          )}

          {tab === 'mall' && (
            <section className="panel-box shop-panel">
              <h3>Online mall</h3>
              <form className="store-search" role="search" onSubmit={(event) => event.preventDefault()}>
                <input
                  type="search"
                  value={mallQuery}
                  placeholder="Search a shop"
                  onChange={(event) => setMallQuery(event.target.value)}
                />
              </form>
              <div className="mall-list">
                {mallShops.map((shop) => (
                  <button key={shop.id} type="button" className="mall-item" onClick={() => openMallShop(shop)}>
                    {shop.cover ? (
                      <img src={shop.cover} alt="" />
                    ) : (
                      <span className="mall-item-fallback">{shop.name.slice(0, 1)}</span>
                    )}
                    <span>
                      {shop.name}
                      <small>{shop.category}</small>
                    </span>
                  </button>
                ))}
              </div>
              {!mallShops.length && (
                <p className="empty-note">
                  {mallQuery.trim()
                    ? 'No shops match that search.'
                    : 'Shops appear here after you create a shop in profile or settings.'}
                </p>
              )}
              <button type="button" className="primary-button" onClick={startShopAccount}>
                New shop profile
              </button>
            </section>
          )}
        </main>

        {overlay?.type === 'shop' && overlayCompany && (
          <MallShopSheet
            shop={overlayCompany}
            onClose={closeOverlay}
            comments={comments}
            onAddComment={addComment}
            onReplyComment={replyToComment}
            viewer={signedInAccount}
            onNeedAccount={needAccountForComment}
          />
        )}

        {overlay?.type === 'gallery' && overlayCompany && (
          <OpenedCard
            company={overlayCompany}
            onClose={closeOverlay}
            onViewProfile={() => viewCompanyProfile(overlayCompany)}
            onBuySystem={() => startBuySystem(overlayCompany)}
            comments={comments}
            onAddComment={addComment}
            onReplyComment={replyToComment}
            viewer={signedInAccount}
            onNeedAccount={needAccountForComment}
          />
        )}

        {overlay?.type === 'profile' && overlayCompany && (
          <PublicCompanyProfile
            company={overlayCompany}
            onClose={closeOverlay}
            onOpenPost={(index) => openCompanyPost(overlayCompany, index)}
            onOpenPhoto={() => openCompanyPost(overlayCompany, 'avatar')}
            onOpenLive={openGeneratedSite}
          />
        )}

        {overlay?.type === 'profile' && overlayCompany && overlay.postIndex != null && overlay.postIndex !== 'avatar' && (
          <OpenedCard
            company={overlayCompany}
            startIndex={overlay.postIndex}
            onClose={closeCompanyPost}
            comments={comments}
            onAddComment={addComment}
            onReplyComment={replyToComment}
            viewer={signedInAccount}
            onNeedAccount={needAccountForComment}
          />
        )}

        {overlay?.type === 'profile' && overlayCompany && overlay.postIndex === 'avatar' && (
          <OpenedCard
            company={{
              ...overlayCompany,
              slides: [
                {
                  photo: overlayCompany.profilePhoto || firstSlide(overlayCompany)?.photo,
                  testimonial: overlayCompany.name,
                },
              ],
            }}
            onClose={closeCompanyPost}
            comments={comments}
            onAddComment={addComment}
            onReplyComment={replyToComment}
            viewer={signedInAccount}
            onNeedAccount={needAccountForComment}
          />
        )}

        {(overlay?.type === 'own-photo' || overlay?.type === 'own-post') &&
          (overlay.company || currentProfile) && (
          <OpenedCard
            company={
              overlay.company ||
              (overlay.type === 'own-photo'
                ? {
                    id: currentProfile.id,
                    name: currentProfile.name || 'My account',
                    slides: [
                      {
                        photo: currentProfile.profilePhoto || currentProfile.gallery?.[0],
                        testimonial: currentProfile.name || 'Profile picture',
                      },
                    ],
                  }
                : ownGalleryCompany())
            }
            startIndex={overlay.postIndex || 0}
            onClose={closeOverlay}
            comments={comments}
            onAddComment={addComment}
            onReplyComment={replyToComment}
            viewer={signedInAccount}
            onNeedAccount={needAccountForComment}
            canDelete={overlay.type === 'own-post'}
            onDelete={deleteOwnPhoto}
          />
        )}

        {overlay?.type === 'buy-system' && (
          <section
            className="detail-sheet gate-sheet"
            aria-label="Buy a Fortress system"
            onClick={(event) => {
              if (event.target === event.currentTarget && pendingSignup) cancelPendingSignup()
            }}
          >
            <button
              type="button"
              className="detail-close"
              onClick={() => (pendingSignup ? cancelPendingSignup() : closeOverlay())}
            >
              Close
            </button>
            <div className="lock-card buy-system-card">
              <h2>Buy a Fortress system</h2>
              <p className="shop-copy">
                Choose construction, manufacturing, or retail. Your account is created only after this purchase.
              </p>
              <div className="settings-actions">
                {SYSTEM_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={systemType === type.id ? 'system-choice active' : 'system-choice'}
                    onClick={() => continueFromSystem(type.id)}
                  >
                    {type.label}
                    {type.id === 'retail' ? <small>Shop in the online mall</small> : null}
                    {type.id === 'construction' ? <small>Rodcroft-style website</small> : null}
                    {type.id === 'manufacturing' ? <small>Prixburg-style website</small> : null}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {overlay?.type === 'live-link' && (overlay.site || currentProfile) && (
          <section className="detail-sheet gate-sheet" aria-label="Generated website link">
            <button
              type="button"
              className="detail-close"
              onClick={() => {
                setOverlay(null)
                pushPath('/profile')
              }}
            >
              Close
            </button>
            <div className="lock-card live-link-card">
              <h2>Your system is live</h2>
              <p className="shop-copy">Fortress generated this website from the tailor-made name.</p>
              <p className="live-link-url">{displayLivePath(overlay.site || currentProfile)}</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => openGeneratedSite(overlay.site || currentProfile)}
              >
                Open website
              </button>
            </div>
          </section>
        )}

        {overlay?.type === 'gate' && (
          <section className="detail-sheet gate-sheet" aria-label="Create an account">
            <button type="button" className="detail-close" onClick={closeOverlay}>
              Close
            </button>
            <div className="lock-card">
              <IconLock />
              <h2>Login to open profiles</h2>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  fromHomeCardRef.current = true
                  goLogin()
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="text-back"
                onClick={() => {
                  fromHomeCardRef.current = true
                  openSettingsPage('create')
                }}
              >
                Create account
              </button>
            </div>
          </section>
        )}

        {overlay?.type === 'add-media' && (
          <section className="detail-sheet add-media-sheet" aria-label="Add media">
            <button type="button" className="detail-close" onClick={closeOverlay}>
              Close
            </button>
            <div className="add-media-card">
              <h2>Add media</h2>
              <button type="button" className="add-media-option" onClick={() => pickComposeFile('gallery')}>
                <strong>Gallery upload</strong>
                <span>The photo from gallery or file goes to the profile gallery in Fortress.</span>
              </button>
              <button type="button" className="add-media-option" onClick={() => pickComposeFile('feature')}>
                <strong>Feature post</strong>
                <span>Photo goes to the home screen company card.</span>
              </button>
            </div>
          </section>
        )}

        {overlay?.type === 'feature-ecocash' && (
          <section className="detail-sheet add-media-sheet" aria-label="Best selling EcoCash">
            <button
              type="button"
              className="detail-close"
              onClick={closeOverlay}
            >
              Close
            </button>
            <form className="add-media-card ecocash-card" onSubmit={submitFeatureEcoCash}>
              <p className="ecocash-kicker">EcoCash</p>
              <h2>Best selling exclusive</h2>
              <p className="shop-copy">
                {compose.feePlan === 'month' ? '$20/month' : '$200/year'} for the Best selling card.
              </p>
              {!PHASE1_COMPLETE ? <p className="shop-copy">{PHASE1_ECOCASH_NOTE}</p> : null}
              <label>
                EcoCash number
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="07xxxxxxxx"
                  value={ecocash.number}
                  disabled={!PHASE1_COMPLETE}
                  onChange={(event) => setEcocash((value) => ({ ...value, number: event.target.value }))}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete="off"
                  placeholder="Password"
                  value={ecocash.password}
                  disabled={!PHASE1_COMPLETE}
                  onChange={(event) => setEcocash((value) => ({ ...value, password: event.target.value }))}
                />
              </label>
              <label>
                Name on EcoCash
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Name on EcoCash"
                  value={ecocash.name}
                  disabled={!PHASE1_COMPLETE}
                  onChange={(event) => setEcocash((value) => ({ ...value, name: event.target.value }))}
                />
              </label>
              {paymentNote && <p className="form-error">{paymentNote}</p>}
              <button type="submit" className="primary-button" disabled={!PHASE1_COMPLETE}>
                Approve payment
              </button>
            </form>
          </section>
        )}

        {overlay?.type === 'feature-loading' && (
          <section className="detail-sheet add-media-sheet" aria-label="Approving payment">
            <div className="add-media-card">
              <p className="loading-note">{busyLabel || 'Approving payment…'}</p>
            </div>
          </section>
        )}

        {overlay?.type === 'compose' && (
          <section className="detail-sheet add-media-sheet" aria-label="Add caption">
            <button type="button" className="detail-close" onClick={closeOverlay}>
              Close
            </button>
            <form className="add-media-card" onSubmit={submitCompose}>
              <h2>{compose.mode === 'feature' ? 'Feature post' : 'Gallery upload'}</h2>
              {compose.photo && <img className="compose-preview" src={compose.photo} alt="" />}
              <label>
                Testimonial
                <textarea
                  rows="3"
                  value={compose.caption}
                  placeholder="Add a testimonial like a caption"
                  onChange={(event) =>
                    setCompose((previous) => ({ ...previous, caption: event.target.value }))
                  }
                />
              </label>
              {compose.mode === 'feature' && (
                <fieldset className="class-picker">
                  <legend>Choose where this post appears</legend>
                  {FEATURE_CLASSES.map((item) => (
                    <label key={item.id} className={compose.shelf === item.id ? 'class-option active' : 'class-option'}>
                      <input
                        type="radio"
                        name="feature-class"
                        value={item.id}
                        checked={compose.shelf === item.id}
                        onChange={() =>
                          setCompose((previous) => ({
                            ...previous,
                            shelf: item.id,
                            feePlan: item.id === 'Best selling' ? previous.feePlan : '',
                          }))
                        }
                      />
                      <span>
                        <strong>{item.label}</strong>
                        {item.note ? <small>{item.note}</small> : null}
                      </span>
                    </label>
                  ))}
                  {compose.shelf === 'Best selling' && (
                    <div className="fee-picker">
                      <label className={compose.feePlan === 'year' ? 'class-option active' : 'class-option'}>
                        <input
                          type="radio"
                          name="feature-fee"
                          value="year"
                          checked={compose.feePlan === 'year'}
                          onChange={() => setCompose((previous) => ({ ...previous, feePlan: 'year' }))}
                        />
                        <span>
                          <strong>$200/year</strong>
                        </span>
                      </label>
                      <label className={compose.feePlan === 'month' ? 'class-option active' : 'class-option'}>
                        <input
                          type="radio"
                          name="feature-fee"
                          value="month"
                          checked={compose.feePlan === 'month'}
                          onChange={() => setCompose((previous) => ({ ...previous, feePlan: 'month' }))}
                        />
                        <span>
                          <strong>$20/month</strong>
                        </span>
                      </label>
                    </div>
                  )}
                </fieldset>
              )}
              <button
                type="submit"
                className="primary-button"
                disabled={
                  compose.mode === 'feature' &&
                  (!compose.shelf || (compose.shelf === 'Best selling' && !compose.feePlan))
                }
              >
                {compose.mode === 'feature' && compose.shelf === 'Best selling' ? 'Pay with EcoCash' : 'Post'}
              </button>
            </form>
          </section>
        )}

        {(overlay?.type === 'shop-item-add' || overlay?.type === 'shop-item') && (
          <ShopItemSheet
            draft={shopItemDraft}
            isNew={overlay.type === 'shop-item-add'}
            onClose={closeOverlay}
            onChange={writeShopItemDraft}
            onSave={addShopItem}
            onPickPhoto={() => shopItemInputRef.current?.click()}
          />
        )}

        {tab === 'profile' && signedInAccount && (
          <>
            <input
              ref={shopItemInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleShopItemPhoto}
            />
            <button
              type="button"
              className="profile-fab"
              aria-label={profileTab === 'store' ? 'Add item' : 'Add media'}
              onClick={() => {
                if (profileTab === 'store') {
                  openAddShopItem()
                  return
                }
                openAddMedia()
              }}
            >
              +
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default App
