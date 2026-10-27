import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { NETWORK_ACTIONS, offlineActionMessage, readOnline } from './offline'
import {
  extractSteelSchedule,
  loadMasterTemplate,
  mergeScheduleWithExtraction,
  updateMasterFromExtraction,
} from './steelVision'

const STORE_KEY = 'fortress-phone-app-phase1'
const SESSION_KEY = 'fortress-session-phase1'
const OWNER_LOGIN = {
  email: 'darelchits@gmail.com',
  password: 'Darel2005',
}
const PHASE1_COMPLETE = true
const PHASE1_ECOCASH_NOTE = 'Phase 2 will be unlocked for exclusive CEOs soon.'
const isOwnerEmail = (email) => String(email || '').trim().toLowerCase() === OWNER_LOGIN.email.toLowerCase()
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
const pexel = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`

const COMMENTS_KEY = 'fortress-comments-v4'
const VIDEO_SECONDS = 10

const REEL = {
  mill: 'https://videos.pexels.com/video-files/2795405/2795405-hd_1920_1080_25fps.mp4',
  weld: 'https://videos.pexels.com/video-files/4483138/4483138-hd_1920_1080_25fps.mp4',
  crane: 'https://videos.pexels.com/video-files/3994446/3994446-uhd_2560_1440_25fps.mp4',
  factory: 'https://videos.pexels.com/video-files/7578544/7578544-hd_1920_1080_30fps.mp4',
}

const MEDIA = {
  rodcroft1: '/media/rodcroft/rodcroft1.mp4',
  rodcroftPhoto1: '/media/rodcroft/rodcroft-1.jpeg',
  rodcroftPhoto2: '/media/rodcroft/rodcroft-2.jpeg',
  rodcroftPhoto3: '/media/rodcroft/rodcroft-3.jpeg',
  rodcroftPhoto4: '/media/rodcroft/rodcroft-4.jpeg',
  prixburg1: '/media/prixburg/prixburg1.jpeg',
  prixburg2: '/media/prixburg/prixburg2.jpeg',
  prixburg3: '/media/prixburg/prixburg3.jpeg',
  prixburg4: '/media/prixburg/prixburg4.jpeg',
  prixburg5: '/media/prixburg/prixburg5.jpeg',
  prixburg6: '/media/prixburg/prixburg6.mp4',
}

const catalog = [
  {
    id: 'rodcroft',
    name: 'Rodcroft',
    category: 'Construction',
    shelf: 'Best selling',
    rating: 4.9,
    hue: '#9a3412',
    showOnGrid: true,
    nativeFrame: true,
    featurePhotos: true,
    featurePhotoCount: 2,
    video: MEDIA.rodcroft1,
    videoCaption: 'Rodcroft site reel.',
    location: 'Zimbabwe',
    ceo: 'Patrick Mbizvo',
    about:
      'Fortress cut QS and engineering admin at Rodcroft, grew sites and tenders, and gave the CEO a live view of every site.',
    slides: [
      {
        photo: MEDIA.rodcroftPhoto1,
        testimonial:
          'I’m the CEO. Fortress cut the paperwork for our QS and engineers — ndatenda. Measurements and claims now sit pano on one website.',
      },
      {
        photo: MEDIA.rodcroftPhoto2,
        testimonial:
          'With that time back we took on more sites and more tenders. Zvinhu zviri kufamba, and the same team runs a bigger book from the phone. — Patrick Mbizvo, CEO',
      },
      {
        photo: MEDIA.rodcroftPhoto3,
        testimonial:
          'Theft is down because Fortress tracks storeroom stock. Zvechokwadi, cement and fuel now have a log before they leave the yard. — Patrick Mbizvo, CEO',
      },
      {
        photo: MEDIA.rodcroftPhoto4,
        testimonial:
          'Valuations land on a cumulative dashboard with SHEQ. Ndinoona every site from the phone without calling the trailer. — Patrick Mbizvo, CEO',
      },
      {
        video: MEDIA.rodcroft1,
        testimonial:
          'From the gate to the storeroom, this is our live picture of the job. Zvakanaka — QS, engineers, and I finally share one site. — Patrick Mbizvo, CEO',
      },
    ],
  },
  {
    id: 'prixburg',
    name: 'Prixburg',
    category: 'Manufacturing',
    shelf: 'Best selling',
    rating: 4.9,
    hue: '#1f4d45',
    showOnGrid: true,
    nativeFrame: true,
    featurePhotos: true,
    featurePhotoCount: 2,
    location: 'Zimbabwe',
    ceo: 'Tawanda Chitukutuku',
    about:
      'Prixburg is a chemical manufacturing factory. Fortress tracks storeroom materials, consumed stock, and sales of dishwasher, toilet cleaner, and fabric softener.',
    slides: [
      {
        photo: MEDIA.prixburg1,
        testimonial:
          'I’m the CEO of this chemical plant. Fortress keeps the floor and the office on one website so production is not chasing paper. Ndatenda. — Tawanda Chitukutuku, CEO',
      },
      {
        photo: MEDIA.prixburg2,
        testimonial:
          'Raw materials sit in the storeroom. Fortress calculates consumed stock as batches run, so we always know what left the shelf. — Tawanda Chitukutuku, CEO',
      },
      {
        photo: MEDIA.prixburg3,
        testimonial:
          'The system tracks those materials from delivery to mix. Stock is managed by live counts, not a book that is a week behind.',
      },
      {
        photo: MEDIA.prixburg4,
        testimonial:
          'Sales dashboards track dishwasher, toilet cleaner, and fabric softener as they leave. The market grew — zvinhu zviri kufamba. — Tawanda Chitukutuku, CEO',
      },
      {
        photo: MEDIA.prixburg5,
        testimonial:
          'For a factory like this, the calculating system that keeps formulas intact is the asset. Fortress holds the recipes while output keeps rising. — Tawanda Chitukutuku, CEO',
      },
      {
        video: MEDIA.prixburg6,
        testimonial:
          'Ndinoona the storeroom, the formulas, and sales pano on one site. Zvakanaka for a chemical plant. — Tawanda Chitukutuku, CEO',
      },
    ],
  },
  {
    id: 'apex',
    name: 'PaChikonaz Pvt',
    category: 'Manufacturing',
    shelf: 'Best selling',
    rating: 4.9,
    hue: '#1f4d45',
    showOnGrid: true,
    featurePhotos: true,
    featurePhotoCount: 2,
    video: REEL.mill,
    videoCaption: 'Mill-floor reel from the current run.',
    location: 'Zimbabwe',
    ceo: 'Nyasha Mutasa',
    about: 'PaChikonaz Pvt uses Fortress to track mill stock, consumed steel, and sales from the same dashboard.',
    slides: [
      {
        photo: shot('photo-1504917595217-d4dc5ebe6122'),
        testimonial:
          'I’m the mill CEO. Fortress cut paperwork for the engineers so beams and heat numbers live pano on one website. Ndatenda. — Nyasha Mutasa, CEO',
      },
      {
        photo: shot('photo-1565043589221-1a6fd9ae45c7'),
        testimonial:
          'Raw steel sits in the storeroom. Fortress calculates consumed stock as I-beams and plate leave the rack. Zvakanaka — shortages show before a bay runs dry. — Nyasha Mutasa, CEO',
      },
      {
        photo: pexel(3912981),
        testimonial:
          'The system tracks those materials from delivery to mill. Stock is managed pano by live counts, not a book that is a week behind. Ndatenda. — Nyasha Mutasa, CEO',
      },
      {
        photo: shot('photo-1504328345606-18bbc8c9d7d1'),
        testimonial:
          'Sales dashboards update as steel leaves the plant. Ndinoona the mill from the phone. — Nyasha Mutasa, CEO',
      },
      {
        photo: shot('photo-1565008447742-97f6f38c985c'),
        testimonial:
          'For a mill like this, the calculating system is the asset. Zvechokwadi, counts and output now sit in one place. — Nyasha Mutasa, CEO',
      },
    ],
  },
  {
    id: 'ridgeline',
    name: 'it Wasu Contractors',
    category: 'Construction',
    shelf: 'Best selling',
    rating: 4.8,
    hue: '#9a3412',
    showOnGrid: true,
    featurePhotos: true,
    featurePhotoCount: 2,
    video: REEL.weld,
    videoCaption: 'Deck reel from the crew on site.',
    location: 'Zimbabwe',
    ceo: 'Tawanda Ncube',
    about: 'it Wasu Contractors QS and engineers work from Fortress, with storeroom tracking and live site valuations.',
    slides: [
      {
        photo: shot('photo-1621905252507-b35492cc74b4'),
        testimonial:
          'I’m the CEO. Fortress cut the paperwork for QS and engineers. Ndatenda — claims now sit pano instead of in the trailer. — Tawanda Ncube, CEO',
      },
      {
        photo: pexel(8487367),
        testimonial:
          'With that time back, it Wasu Contractors took on more sites and more tenders. Zvinhu zviri kufamba — the same crew runs a bigger book from the phone. — Tawanda Ncube, CEO',
      },
      {
        photo: pexel(27647858),
        testimonial:
          'Theft is down because Fortress tracks storeroom stock. Zvechokwadi, cement and fuel have a log before they leave the yard. — Tawanda Ncube, CEO',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial:
          'Valuations land pano on a cumulative dashboard. SHEQ files sit on the same system. Ndatenda. — Tawanda Ncube, CEO',
      },
      {
        photo: shot('photo-1517581177682-a085bb7ffb15'),
        testimonial:
          'I open Fortress and ndinoona every deck — stock, valuations, and SHEQ — without calling the trailer. Zvakanaka. — Tawanda Ncube, CEO',
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
    about: 'Ironleaf tracks mill materials, consumed stock, and sales estimates on Fortress dashboards.',
    slides: [
      {
        photo: pexel(1181519),
        testimonial:
          'I’m the CEO of this coil mill. Fortress cut the paperwork so engineers post the run pano. Ndatenda. — Chiedza Dube, CEO',
      },
      {
        photo: pexel(3184292),
        testimonial:
          'Coil and sheet sit in the storeroom. Fortress calculates consumed stock as the press runs, so the mill always knows what left the rack.',
      },
      {
        photo: shot('photo-1581092918056-0c4c3acd3789'),
        testimonial:
          'The system tracks those materials from yard to press. Stock is managed by live counts, not a weekly walk.',
      },
      {
        photo: shot('photo-1504917595217-d4dc5ebe6122'),
        testimonial:
          'It estimates sales on dashboards as coil and formed parts leave the plant. The mill and the office read one number for what shipped.',
      },
      {
        photo: shot('photo-1565043666747-69f6646db940'),
        testimonial:
          'SHEQ and I open Fortress and see the floor without a walk-down. Zvechokwadi, the records stay intact. — Chiedza Dube, CEO',
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
    about: 'Pylon uses Fortress for QS workload, site valuations, and storeroom control on every job.',
    slides: [
      {
        photo: pexel(8487724),
        testimonial:
          'I’m the CEO. Fortress cut QS paperwork. Measures and claims sit pano — ndatenda. — Simba Mhlanga, CEO',
      },
      {
        photo: shot('photo-1621905252472-943afaa20e20'),
        testimonial:
          'With that time back, Pylon has taken on more sites and more tenders. Valuations are recorded on site and the cumulative dashboard is already up to date.',
      },
      {
        photo: shot('photo-1486406146926-c627a92ad1ab'),
        testimonial:
          'Theft is down because Fortress tracks storeroom stock. Cement and fuel movements are logged before they leave the yard.',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial:
          'SHEQ files live next to the lift photos. Safety and production stopped using two different folders.',
      },
      {
        photo: pexel(8487371),
        testimonial:
          'Ndinoona the structure, the stock, and the valuation from the phone. Handichafona the trailer. — Simba Mhlanga, CEO',
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
    ceo: 'Rudo Nyathi',
    about: 'Harbor & Beam runs pours, tenders, and storeroom stock from the Fortress website.',
    slides: [
      {
        photo: pexel(8487363),
        testimonial:
          'I’m the CEO. Fortress cut QS paperwork, and clients approve the next pour from the same site. Zvakanaka. — Rudo Nyathi, CEO',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial:
          'With that time back, Harbor has taken on more sites and more tenders. Valuations sit on a cumulative dashboard, not in email.',
      },
      {
        photo: shot('photo-1429497419816-9ca5cfb4571a'),
        testimonial:
          'Theft is down because Fortress tracks storeroom stock. Cement and fuel movements are on the website before the gate closes.',
      },
      {
        photo: pexel(8487760),
        testimonial:
          'The website records pour valuations on site and rolls them into the dashboard. SHEQ files live with the same records.',
      },
      {
        photo: shot('photo-1517581177682-a085bb7ffb15'),
        testimonial:
          'Ndinoona the deck, the stock, and the valuation from the phone. Fortress is the control room for the site. — Rudo Nyathi, CEO',
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
    ceo: 'Tafadzwa Sibanda',
    about: 'Voltform tracks consumed stock, line output, and sales estimates on Fortress.',
    slides: [
      {
        photo: shot('photo-1621905251918-48416bd8575a'),
        testimonial:
          'I’m the plant CEO. Line leads post the bay pano instead of a second spreadsheet. Ndatenda. — Tafadzwa Sibanda, CEO',
      },
      {
        photo: pexel(3912981),
        testimonial:
          'Paint, parts, and solvents sit in the storeroom. Fortress calculates consumed stock as the booth runs, so purchasing reorders from the site.',
      },
      {
        photo: pexel(27647858),
        testimonial:
          'The system tracks those materials from delivery to booth. Stock is managed by live counts, not a guess at shift change.',
      },
      {
        photo: shot('photo-1565008447742-97f6f38c985c'),
        testimonial:
          'It estimates sales on dashboards as finished work leaves the plant. Quality and production share one formula file, and the market for the line has grown.',
      },
      {
        photo: shot('photo-1504328345606-18bbc8c9d7d1'),
        testimonial:
          'I open Fortress and ndinoona booth, stock, and sales. Zvechokwadi, the process records stay intact. — Tafadzwa Sibanda, CEO',
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
    about: 'Fieldnote started on Fortress so QS, stock, and the CEO already share one site.',
    slides: [
      {
        photo: pexel(8487371),
        testimonial:
          'I’m the CEO. From day one the phone is the job trailer. Ndatenda. — Tatenda Chirwa, CEO',
      },
      {
        photo: pexel(8487724),
        testimonial:
          'With that time back, Fieldnote can grow first pours and first tenders without growing paperwork.',
      },
      {
        photo: shot('photo-1590496793929-36417d3117de'),
        testimonial:
          'Theft has nowhere to hide because Fortress tracks storeroom stock. Cement and fuel have a log from the first delivery.',
      },
      {
        photo: pexel(8487760),
        testimonial:
          'Valuations are recorded on site and roll into a cumulative dashboard. Monday meetings now open that same screen.',
      },
      {
        photo: shot('photo-1517581177682-a085bb7ffb15'),
        testimonial:
          'SHEQ and my CEO view were built in from the start. Ndinoona whatever is happening on site. Zvakanaka. — Tatenda Chirwa, CEO',
      },
    ],
  },
]

const mallGood = (id, name, photo, price, description = '') => ({
  id,
  name,
  photo: photo.startsWith('http') ? photo : shot(photo),
  price,
  description,
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
    mallGood('apex-plate', 'Steel plate pack', 'photo-1504917595217-d4dc5ebe6122', 86, 'Mild steel plates for mill and yard work.'),
    mallGood('apex-bolt', 'Structural bolt set', 'photo-1504148455328-c376907d081c', 24, 'Grade 8.8 bolts with washers for frames.'),
    mallGood('apex-angle', 'Angle iron length', pexel(3912981), 41, '6 m angle iron cut for lintels and racks.'),
  ]),
  shopFromHome('harbor', [
    mallGood('harbor-beam', 'Framed beam cut', pexel(8487363), 95, 'Framed timber beam ready for a site pour.'),
    mallGood('harbor-sheet', 'Plywood sheet', 'photo-1517581177682-a085bb7ffb15', 32, '18 mm shuttering plywood, one full sheet.'),
    mallGood('harbor-fastener', 'Site fastener tin', 'photo-1517581177682-a085bb7ffb15', 18, 'Mixed nails and screws for formwork.'),
  ]),
  shopFromHome('ridgeline', [
    mallGood('ridge-helmet', 'Site helmet', shot('photo-1621905252472-943afaa20e20'), 29, 'Hard hat for crew on the scaffold.'),
    mallGood('ridge-vest', 'Crew vest', pexel(8487367), 22, 'Hi-vis vest with reflective bands.'),
    mallGood('ridge-boot', 'Work boot pair', 'photo-1590496793929-36417d3117de', 74, 'Steel-toe boots sized for site crews.'),
  ]),
  shopFromHome('voltform', [
    mallGood('volt-cable', 'Cable drum', shot('photo-1621905251918-48416bd8575a'), 58, 'Armoured cable on a drum for plant rooms.'),
    mallGood('volt-switch', 'Switch gear pack', pexel(3184292), 46, 'Breakers and switches for a small board.'),
    mallGood('volt-lamp', 'Bay lamp', 'photo-1504328345606-18bbc8c9d7d1', 37, 'High-bay lamp for mill and warehouse lighting.'),
  ]),
  retailShop('lantern-home', 'Lantern Home Goods', 'photo-1555041469-a586c61ea9bc', [
    mallGood('lantern-lamp', 'Floor lamp', 'photo-1507473885765-e6ed057f782c', 54, 'Standing lamp with a linen shade.'),
    mallGood('lantern-throw', 'Wool throw', 'photo-1555041469-a586c61ea9bc', 36, 'Warm throw for a lounge or guest room.'),
    mallGood('lantern-vase', 'Ceramic vase', 'photo-1484101403633-562f891dc89a', 21, 'Hand-glazed vase for a table or shelf.'),
  ]),
  retailShop('market-street', 'Market Street Grocers', 'photo-1542838132-92c53300491e', [
    mallGood('market-crate', 'Produce crate', 'photo-1542838132-92c53300491e', 16, 'Mixed vegetables packed for the week.'),
    mallGood('market-bread', 'Bakery loaf', 'photo-1509440159596-0249088772ff', 4, 'Fresh loaf from the morning bake.'),
    mallGood('market-oil', 'Bottle of oil', 'photo-1474979266404-7ea641234fb7', 9, 'Cooking oil in a 750 ml bottle.'),
  ]),
  retailShop('thread-needle', 'Thread & Needle', 'photo-1441986300917-64674bd600d8', [
    mallGood('thread-shirt', 'Cotton shirt', 'photo-1441984904996-e0b6ba687e04', 28, 'Plain cotton shirt, regular fit.'),
    mallGood('thread-denim', 'Denim pair', 'photo-1441984904996-e0b6ba687e04', 45, 'Mid-wash jeans for everyday wear.'),
    mallGood('thread-tote', 'Canvas tote', 'photo-1544816155-12df9643f363', 19, 'Sturdy tote for market and site runs.'),
  ]),
  retailShop('kettle-pantry', 'Copper Kettle Pantry', 'photo-1495474472287-4d71bcdd2085', [
    mallGood('kettle-coffee', 'Roast bag', 'photo-1495474472287-4d71bcdd2085', 12, '250 g roasted beans for the office pot.'),
    mallGood('kettle-mug', 'Stone mug', 'photo-1514228742587-6b1558fcc303', 11, 'Heavy mug that keeps tea hot.'),
    mallGood('kettle-jar', 'Spice jar set', 'photo-1596040033229-a9821ebd058d', 15, 'Six jars with lids for a kitchen shelf.'),
  ]),
]

const seedNote = (id, author, text, replies = []) => ({
  id,
  authorId: 'seed',
  author,
  text,
  replies: replies.map((reply, index) => ({
    id: `${id}-r${index}`,
    authorId: 'seed',
    author: reply.author,
    text: reply.text,
  })),
})

const DEMO_COMMENTS = {
  'photo:rodcroft:0': [
    seedNote('rc0a', 'Patrick Mbizvo, CEO', 'Ndatenda. This is the picture I open every mangwanani before I call anyone.'),
    seedNote(
      'rc0b',
      'Rudo Nyathi, CEO',
      'Makorokoto to the QS team. Zvakanaka — the site is already on the website.',
      [{ author: 'Tawanda Chitukutuku, CEO', text: 'Tinotenda. We run the same habit at the plant.' }],
    ),
  ],
  'photo:rodcroft:2': [
    seedNote('rc2a', 'Patrick Mbizvo, CEO', 'Zvechokwadi, cement and fuel now have a log. Theft has nowhere to hide.'),
  ],
  'photo:prixburg:0': [
    seedNote('pb0a', 'Tawanda Chitukutuku, CEO', 'Ndatenda. Floor and office finally share one site. Zvinhu zviri kufamba.'),
    seedNote('pb0b', 'Nyasha Mutasa, CEO', 'Same for our mill. Ndinoona the run without walking the bay.'),
  ],
  'photo:prixburg:3': [
    seedNote('pb3a', 'Tawanda Chitukutuku, CEO', 'Dishwasher and softener sales sit pano. Makorokoto to the mixing team.'),
  ],
  'photo:apex:0': [
    seedNote('ap0a', 'Nyasha Mutasa, CEO', 'Ndatenda. Heat numbers live pano now, not on clipboards.'),
    seedNote('ap0b', 'Tawanda Chitukutuku, CEO', 'Makorokoto. Same habit as Prixburg — ndinoona the mill from the phone.'),
  ],
  'photo:apex:1': [
    seedNote('ap1a', 'Nyasha Mutasa, CEO', 'Storeroom steel is on the website. Zvakanaka — shortages show before the bay runs dry.'),
  ],
  'photo:ridgeline:0': [
    seedNote('rg0a', 'Tawanda Ncube, CEO', 'I’m the CEO of it Wasu Contractors. Ndatenda — claims sit pano instead of in the trailer.'),
    seedNote('rg0b', 'Patrick Mbizvo, CEO', 'Makorokoto. Rodcroft and Wasu now run the same basa from the phone.'),
  ],
  'photo:ridgeline:1': [
    seedNote('rg1a', 'Tawanda Ncube, CEO', 'More sites, more tenders. Zvinhu zviri kufamba at it Wasu Contractors.'),
    seedNote('rg1b', 'Rudo Nyathi, CEO', 'Zvakanaka. The crew already updates the website before I call.'),
  ],
  'photo:ridgeline:2': [
    seedNote('rg2a', 'Tawanda Ncube, CEO', 'Zvechokwadi, cement and fuel now have a log. Theft has nowhere to hide.'),
  ],
  'photo:ridgeline:3': [
    seedNote('rg3a', 'Tawanda Ncube, CEO', 'Valuations sit pano with SHEQ. Ndatenda.'),
  ],
  'photo:ridgeline:4': [
    seedNote('rg4a', 'Tawanda Ncube, CEO', 'Ndinoona every deck from the phone. Handichafona the trailer.'),
    seedNote('rg4b', 'Patrick Mbizvo, CEO', 'Tinotenda. Same picture we wanted at Rodcroft.'),
  ],
  'photo:ironleaf:0': [
    seedNote('il0a', 'Chiedza Dube, CEO', 'Engineers post the run pano. Ndatenda — clipboards are done.'),
  ],
  'photo:pylon:0': [
    seedNote('py0a', 'Simba Mhlanga, CEO', 'Makorokoto. Measures and claims sit pano. Handichafona the trailer.'),
  ],
  'photo:harbor:0': [
    seedNote('hb0a', 'Rudo Nyathi, CEO', 'Clients approve the next pour from this picture. Zvakanaka.'),
  ],
  'photo:voltform:0': [
    seedNote('vf0a', 'Tafadzwa Sibanda, CEO', 'Line leads post the bay pano. Ndatenda.'),
  ],
  'photo:fieldnote:0': [
    seedNote('fn0a', 'Tatenda Chirwa, CEO', 'From day one the phone is the trailer. Zvakanaka.'),
    seedNote('fn0b', 'Patrick Mbizvo, CEO', 'Makorokoto. Start like this and the basa stays clean.'),
  ],
  'item:mall-apex:apex-plate': [
    seedNote('itap', 'Nyasha Mutasa, CEO', 'This plate pack is what left the rack nhasi. Ndatenda.'),
  ],
  'item:mall-ridgeline:ridge-vest': [
    seedNote('itrg', 'Tawanda Ncube, CEO', 'Crew vest from the yard. Zvakanaka for the mall card.'),
  ],
  'item:market-street:market-bread': [
    seedNote('itmb', 'Chiedza Dube, CEO', 'Fresh loaf pano. Ndatenda to the baker.'),
  ],
}

const withDemoComments = (saved) => {
  const next = { ...DEMO_COMMENTS }
  Object.entries(saved || {}).forEach(([key, thread]) => {
    if (Array.isArray(thread) && thread.length) next[key] = thread
  })
  return next
}

const formatPrice = (price) =>
  `$${Number(price).toLocaleString('en-US', {
    minimumFractionDigits: Number(price) % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`

const MENU_ACTIONS = [
  { id: 'buy', label: 'Buy a CEO website' },
]

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'mall', label: 'Online mall' },
  ...MENU_ACTIONS,
  { id: 'settings', label: 'Settings' },
]

const GUEST_NAV = [
  { id: 'home', label: 'Home' },
  { id: 'mall', label: 'Online mall' },
  ...MENU_ACTIONS,
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

function IconCalc() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm1 3v4h10V6H7zm0 6h3v2H7v-2zm5 0h5v2h-5v-2zm-5 3h3v3H7v-3zm5 0h5v3h-5v-3z"
      />
    </svg>
  )
}

function IconBuy() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.4 9h-3.1a15 15 0 0 0-1.4-5.4A8.1 8.1 0 0 1 19.4 11zM12 4.1c.9 1.2 1.7 3.3 2 6.9H10c.3-3.6 1.1-5.7 2-6.9zM4.6 13h3.1a15 15 0 0 0 1.4 5.4A8.1 8.1 0 0 1 4.6 13zm3.1-2H4.6A8.1 8.1 0 0 1 9.1 5.6 15 15 0 0 0 7.7 11zM12 19.9c-.9-1.2-1.7-3.3-2-6.9h4c-.3 3.6-1.1 5.7-2 6.9zm2.9-1.5A15 15 0 0 0 16.3 13h3.1a8.1 8.1 0 0 1-4.5 5.4z"
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
  calc: IconCalc,
  buy: IconBuy,
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

const isVideoSrc = (src = '') =>
  /^data:video\/|^blob:|\.(mp4|webm|mov|m4v)(\?|$)/i.test(String(src))

const compressImageFile = (file, maxEdge = 1400, quality = 0.78) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      readFileAsDataUrl(file).then(resolve, reject)
    }
    image.src = url
  })

const readMediaFile = async (file) => {
  if (!file) return null
  if (file.type.startsWith('video/') || isVideoSrc(file.name)) {
    if (file.size > 3.5 * 1024 * 1024) {
      throw new Error('Choose a shorter video (about 3 MB or less).')
    }
    return { kind: 'video', src: await readFileAsDataUrl(file) }
  }
  return { kind: 'photo', src: await compressImageFile(file) }
}

const gallerySlides = (site) => {
  const fromSlides = (site?.slides || []).filter((slide) => slide.photo || slide.video)
  if (fromSlides.length) return fromSlides
  return (site?.gallery || []).map((photo, index) => ({
    photo,
    video: isVideoSrc(photo) ? photo : '',
    testimonial: site.photoCaptions?.[index] || site.testimonial || '',
  }))
}

const FAB_PLANS = [
  { id: 'week', label: '1 week', price: 1, days: 7 },
  { id: 'month', label: '1 month', price: 3.5, days: 30 },
  { id: 'year', label: '1 year', price: 22, days: 365 },
]

const GATE_COMPLEXITY = [
  { id: 'simple', label: 'Simple design', rate: 45, copy: 'Straight frame, rails, and standard infill.' },
  { id: 'medium', label: 'Medium design', rate: 78, copy: 'Spears, mixed panels, and extra rails.' },
  { id: 'laser', label: 'Complex design', rate: 128, copy: 'Laser-cut or decorative ironwork on this gate type.' },
]

const GATE_TYPES = [
  { id: 'sliding', name: 'Sliding gate', copy: 'Leaf rolls aside on a track.' },
  { id: 'swing', name: 'Swing gate', copy: 'Leaves hinge open like a door.' },
  { id: 'cantilever', name: 'Cantilever gate', copy: 'Hangs on rollers. No track across the driveway.' },
  { id: 'bifold', name: 'Bi-fold gate', copy: 'Panels fold in half to save swing space.' },
  { id: 'telescopic', name: 'Telescopic gate', copy: 'Leaves stack into each other as they open.' },
  { id: 'pedestrian', name: 'Pedestrian gate', copy: 'A person-sized side gate with a latch.' },
  { id: 'automatic', name: 'Automatic electric gate', copy: 'Motor, rack, and safety beams on the leaf.' },
  { id: 'wrought', name: 'Wrought iron decorative gate', copy: 'Scrolls, rings, and spear tops in iron.' },
]

const GATE_CONSTRUCTIONS = [
  { id: 'bars', label: 'Simple gate with vertical bars', copy: 'Middle bars after every interval you enter.' },
  { id: 'infill', label: 'Simple gate with infill cladding', copy: 'IBR sheet or square-tube palisade.' },
]

const FAB_CALC_TYPES = [
  { id: 'sliding', name: 'Sliding Gate', copy: '1 gate slides' },
  { id: 'swing-double', name: 'Swing Gate Double', copy: '2 gates' },
  { id: 'swing-single', name: 'Single Swing Gate', copy: '' },
]

const FAB_CALC_DESIGNS = [
  { id: 'palisade', title: 'Palisade', copy: '25x25 tubes with gaps' },
  { id: 'solid', title: 'Solid Private', copy: 'IBR Sheet - No see through' },
  { id: 'half', title: 'Half & Half', copy: 'Sheet bottom, tubes top' },
]

const FAB_STOCK = 6
const FAB_OVERLAP = 0.4
const FAB_DEFAULT_SPACING = 0.12
const FAB_BAR_CLEARANCE = 0.1
const FAB_TUBE_WASTAGE = 1.1
const FAB_MIDDLE_VERTICALS = 3
const FAB_SHEET_WIDTH = 0.9
const FAB_HALF_SHEET_H = 1.0
const FAB_QUOTES_KEY = 'fortress-fab-quotes-v1'
const FAB_PROJECTS_KEY = 'fortress-fab-projects-v1'
const FAB_DRAWING_TEMPLATES_KEY = 'fortress-fab-drawing-templates-v1'
const FAB_STEEL_WASTE = 1.1
const JOB_TYPES = [
  { id: 'gate', label: 'Gate / Burglar', copy: 'Small jobs · L × W formula' },
  { id: 'structure', label: 'Steel Structure / Carport / Warehouse', copy: 'From steel schedule' },
]

const defaultStructureSchedule = () => [
  { id: 'col', role: 'Columns', section: 'H 120x120', unit: 'm', qty: '6', meters: '29.7', priceKey: 'h120PerM' },
  { id: 'raf', role: 'Rafters', section: 'PFC 150x75', unit: 'm', qty: '7', meters: '28.38', priceKey: 'pfc150PerM' },
  { id: 'pur', role: 'Purlins', section: 'LC 125', unit: 'm', qty: '7', meters: '49.0', priceKey: 'lc125PerM' },
  { id: 'gir', role: 'Girts', section: 'LC 100', unit: 'm', qty: '20', meters: '88.59', priceKey: 'lc100PerM' },
  { id: 'bra', role: 'Braces', section: 'L 50x50x5', unit: 'm', qty: '', meters: '11.9', priceKey: 'angle50PerM' },
  { id: 'plt', role: 'Plates', section: '200x200x10', unit: 'kg', qty: '12', meters: '', kgEach: '3.14', priceKey: 'platePerKg' },
  { id: 'b16hd', role: 'Bolts M16 HD', section: 'M16 HD', unit: 'qty', qty: '24', meters: '', priceKey: 'boltM16' },
  { id: 'b1688', role: 'Bolts M16 8.8', section: 'M16 8.8', unit: 'qty', qty: '20', meters: '', priceKey: 'boltM16_88' },
  { id: 'b12', role: 'Bolts M12', section: 'M12', unit: 'qty', qty: '84', meters: '', priceKey: 'boltM12' },
]

const GATE_DESIGNS = [
  { id: 'spear', name: 'Spear-top driveway', photo: pexel(277572) },
  { id: 'scroll', name: 'Scroll iron double leaf', photo: pexel(277559) },
  { id: 'palisade', name: 'Palisade yard gate', photo: pexel(206172) },
  { id: 'pedestrian', name: 'Pedestrian side gate', photo: pexel(1301856) },
  { id: 'tube', name: 'Tube-frame sliding', photo: pexel(1115804) },
  { id: 'arch', name: 'Arch-top entrance', photo: pexel(221433) },
  { id: 'laser-leaf', name: 'Laser leaf panel', photo: shot('photo-1505843513577-22bb7d21e007') },
  { id: 'steel-sheet', name: 'Steel sheet sliding', photo: shot('photo-1472220625704-91e1462799b2') },
]

const HOME_ADS = [
  {
    id: 'ad-fab',
    kicker: 'Ad',
    title: 'Fabrication calculator',
    copy: '$1 a week · $3.50 a month · $22 a year',
  },
  {
    id: 'ad-site',
    kicker: 'Ad',
    title: 'Buy a Fortress website',
    copy: 'Construction, manufacturing, or a shop in the online mall.',
  },
]

const SYSTEM_TYPES = [
  {
    id: 'fabrication',
    label: 'Fabrication calculator',
    style: 'Free to open',
    how: 'Open the calculator webpage. Pick a gate design, enter width and height, then choose simple, medium, or complex laser cut. Use it for $1 a week, $3.50 a month, or $22 a year.',
    preview: GATE_DESIGNS.slice(0, 4).map((gate) => gate.photo),
    slides: GATE_DESIGNS.slice(0, 5).map((gate, index) => ({
      photo: gate.photo,
      testimonial: [
        'A fabricator quotes from memory and loses jobs. This calculator starts with a gate design so the customer sees the same picture you will build.',
        'Width and height in metres turn into area. The quote is not a guess — it is the size of the gate times the design rate.',
        'Simple, medium, or laser-cut complexity changes the rate. A spear-top driveway is not priced like a laser leaf.',
        'Saved quotations sit on your fabrication webpage so the workshop can open the same numbers on the phone.',
        'Pay $1 a week, $3.50 a month, or $22 a year. The exclusive calculator link stays on the owner profile; other people do not see it.',
      ][index],
    })),
  },
  {
    id: 'construction',
    label: 'Construction website',
    style: 'Rodcroft style',
    how: 'A private Rodcroft-style website for the CEO. The phone shows sites, valuations, storeroom stock, and SHEQ. Crews enter the live numbers on the domain Fortress gives you after EcoCash. Nobody else can open this link.',
    preview: [MEDIA.rodcroftPhoto1, MEDIA.rodcroftPhoto2, MEDIA.rodcroftPhoto3, MEDIA.rodcroftPhoto4],
    slides: [
      {
        photo: MEDIA.rodcroftPhoto1,
        testimonial:
          'On a construction company, QS and engineers lose days to paper. This website puts measurements and claims on one phone so the job is not waiting on a trailer file.',
      },
      {
        photo: MEDIA.rodcroftPhoto2,
        testimonial:
          'That time back lets the same crew take more sites and more tenders. The construction website grows the book without growing the admin team.',
      },
      {
        photo: MEDIA.rodcroftPhoto3,
        testimonial:
          'Theft hides in an open storeroom. Cement and fuel get a log before they leave the yard, so shortages show on the CEO phone, not after the pour.',
      },
      {
        photo: MEDIA.rodcroftPhoto4,
        testimonial:
          'Valuations and SHEQ used to live in email. They now land on a live dashboard so the CEO sees every site without calling the foreman.',
      },
      {
        photo: MEDIA.rodcroftPhoto3,
        video: MEDIA.rodcroft1,
        testimonial:
          'From the gate to the storeroom, this is the live picture of a construction company. The exclusive link stays on the owner’s profile. Other people only see posts.',
      },
    ],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing website',
    style: 'Prixburg style',
    how: 'A private Prixburg-style website for the CEO. The phone shows storeroom materials, consumed stock, and sales. The plant enters those numbers on the live domain. Nobody else can open this link.',
    preview: [MEDIA.prixburg1, MEDIA.prixburg2, MEDIA.prixburg3, MEDIA.prixburg4, MEDIA.prixburg5],
    slides: [
      {
        photo: MEDIA.prixburg1,
        testimonial:
          'A chemical plant loses product when the floor and the office keep two books. This manufacturing website puts mixing and the CEO view on one phone.',
      },
      {
        photo: MEDIA.prixburg2,
        testimonial:
          'Raw materials sit in the storeroom. Fortress calculates consumed stock as batches run, so a shortage shows before a line stops.',
      },
      {
        photo: MEDIA.prixburg3,
        testimonial:
          'The system tracks those materials from delivery to mix. Stock is managed by live counts, not a book that is a week behind.',
      },
      {
        photo: MEDIA.prixburg4,
        testimonial:
          'Sales of dishwasher, toilet cleaner, and fabric softener update as goods leave the plant. The CEO sees output without walking the bay.',
      },
      {
        photo: MEDIA.prixburg5,
        testimonial:
          'Formulas stay intact on the live domain. For a factory like this, the calculating system is the asset — exclusive to the owner, not on a public profile.',
      },
    ],
  },
  {
    id: 'retail',
    label: 'Retail website',
    style: 'Shop inside Fortress',
    how: 'This is not an outside website. It is your shop control inside Fortress. Add items and prices here. Buyers see them on the online mall and pay with EcoCash.',
    preview: [
      shot('photo-1441986300917-64674bd600d8'),
      shot('photo-1441984904996-e0b6ba687e04'),
      shot('photo-1472851294608-062f824d29cc'),
    ],
    slides: [
      {
        photo: shot('photo-1441986300917-64674bd600d8'),
        testimonial:
          'A shop that only lives on WhatsApp loses prices and photos. This retail system is shop control inside Fortress, not an outside website.',
      },
      {
        photo: shot('photo-1441984904996-e0b6ba687e04'),
        testimonial:
          'You add the product, the price, and a short description. Buyers see those cards on the online mall instead of hunting a shop name.',
      },
      {
        photo: shot('photo-1472851294608-062f824d29cc'),
        testimonial:
          'When a buyer searches the mall they find the item, the shop name, and the EcoCash price in one grid.',
      },
      {
        photo: shot('photo-1555529669-e69e7aa0ba9a'),
        testimonial:
          'Payment is EcoCash from the product card. Sold notes stay on the shop so the owner sees what left the shelf.',
      },
      {
        photo: shot('photo-1555041469-a586c61ea9bc'),
        testimonial:
          'The exclusive shop link stays on your profile. Other people browsing Fortress only see public posts, not your shop control.',
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
  fabPlan = '',
  paidUntil = 0,
  drawings = [],
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
  fabPlan,
  paidUntil,
  drawings,
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
  if (overlay?.type === 'product' && overlay.company?.id && overlay.item?.id) {
    return `/mall/item/${encodeId(overlay.company.id)}/${encodeId(overlay.item.id)}`
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
  if (a === 'calc') {
    const panel = b || 'home'
    return {
      tab: 'home',
      settingsView: 'home',
      overlay: null,
      route: { kind: 'calc', panel },
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
  } else if (a === 'mall' && b === 'item' && c && d) {
    const shop = findCompany(decodeURIComponent(c))
    const itemId = decodeURIComponent(d)
    const item = shop?.items?.find((entry) => entry.id === itemId)
    if (shop && item) {
      overlay = {
        type: 'product',
        company: shop,
        item: { ...item, shopId: shop.id, shopName: shop.name, shop },
      }
    }
  } else if (a === 'profile' && b === 'photo') overlay = { type: 'own-photo' }
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
  const seen = new Set(slides.flatMap((slide) => [slide.photo, slide.video].filter(Boolean)))
  if (site.profilePhoto && !seen.has(site.profilePhoto)) {
    slides.push({
      photo: site.profilePhoto,
      testimonial: site.testimonial || 'Profile photo from the company card.',
    })
    seen.add(site.profilePhoto)
  }
  ;(site.gallery || []).forEach((photo, index) => {
    if (!photo || seen.has(photo)) return
    slides.push(
      isVideoSrc(photo)
        ? {
            video: photo,
            testimonial: site.photoCaptions?.[index] || site.testimonial || 'Site video from the company card.',
          }
        : {
            photo,
            testimonial: site.photoCaptions?.[index] || site.testimonial || 'Site photo from the company card.',
          },
    )
    seen.add(photo)
  })
  return slides
}

const firstSlide = (company) => company.slides?.[0] || null

const withVideoSlides = (company) => {
  if (!company) return company
  const slides = [...(company.slides || [])]
  const extraVideos = [
    ...(company.videos || []),
    ...(company.video ? [{ src: company.video, caption: company.videoCaption }] : []),
  ]
  extraVideos.forEach((clip) => {
    if (!clip?.src || slides.some((slide) => slide.video === clip.src)) return
    slides.splice(Math.min(1, slides.length), 0, {
      video: clip.src,
      testimonial: clip.caption || 'Ten-second clip from the company card.',
    })
  })
  return slides === company.slides ? company : { ...company, slides }
}

const featureMedia = (companies) => {
  const seen = new Set()
  const items = []

  companies.forEach((company) => {
    const photos = (company.slides || []).filter((slide) => slide.photo)
    const poster = photos[0]?.photo || ''
    const push = (kind, src, caption) => {
      if (!src || seen.has(src)) return
      seen.add(src)
      items.push({ company, kind, src, poster: kind === 'video' ? poster : '', caption })
    }

    if (company.featurePhotos) {
      const limit = Number.isFinite(company.featurePhotoCount) ? company.featurePhotoCount : photos.length
      photos.slice(0, Math.max(limit, 0)).forEach((slide) => push('photo', slide.photo, slide.testimonial))
      return
    }

    if (company.video) {
      push('video', company.video, company.videoCaption)
      return
    }

    if (photos[0]) push('photo', photos[0].photo, photos[0].testimonial)
  })

  return items
}

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
  if (site.systemType === 'retail' || site.isShop) return 'Shop control'
  if (site.systemType === 'fabrication') return site.slug ? `#/site/${site.slug}` : '#/calc'
  return `#/site/${site.slug}`
}

const liveDomain = (site) => {
  const slug = site?.slug || slugify(site?.name || 'site')
  return `${slug}.fortress.site`
}

const ceoFigures = (name = '') => {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 33 + name.charCodeAt(i)) >>> 0
  const pick = (mod, base) => base + (hash % mod)
  return {
    sites: pick(6, 3),
    valuation: pick(80, 40) * 1000,
    sheq: pick(12, 4),
    stock: pick(20, 8),
    consumed: pick(15, 5),
    sales: pick(90, 20) * 100,
  }
}

const PRICING_KEY = 'fortress-fab-pricing-v4'
const emptyFabPricing = () => ({
  // Gate / small job rates
  tube50PerM: '4.50',
  tube25PerM: '2.20',
  uChannelPerM: '8.00',
  sheetPerM2: '12.00',
  // Structure schedule rates (S-201 style)
  h120PerM: '18',
  pfc150PerM: '14',
  lc125PerM: '6.50',
  lc100PerM: '5.20',
  angle50PerM: '3.50',
  platePerKg: '1.80',
  boltM16: '1.20',
  boltM16_88: '1.20',
  boltM12: '0.80',
  ibrPerM2: '12.00',
  foundationPad: '45',
  lc150PerM: '7.50',
  labourPercent: '65',
  consumablesPercent: '15',
  marginPercent: '30',
  whatsapp: '',
  visionProvider: 'tesseract',
})
const emptyDrawingDraft = () => ({
  photo: '',
  name: '',
  gateType: '',
  design: '',
  gateId: '',
  complexity: '',
  construction: '',
  barInterval: '',
  spacing: String(FAB_DEFAULT_SPACING),
  infillMaterial: '',
  palisadeGap: '',
  tubeDiameter: '',
  width: '',
  height: '',
  qty: '1',
  qty50: '',
  qty25: '',
  qtyBeam: '',
  qtySheet: '',
  labourPercent: '',
  consumablesPercent: '',
  marginPercent: '',
})

const emptyProject = () => ({
  id: '',
  name: '',
  client: '',
  jobType: '',
  drawing: '',
  drawingName: '',
  drawingFingerprint: '',
  drawingKind: '',
  gate: emptyDrawingDraft(),
  schedule: defaultStructureSchedule(),
  roofLength: '7.0',
  roofWidth: '5.566',
  wallArea: '40',
  foundationPads: '6',
  labourPercent: '',
  consumablesPercent: '',
  marginPercent: '',
  quoteTotal: 0,
  at: 0,
})

const loadDrawingTemplates = () => {
  if (typeof window === 'undefined') return []
  try {
    const rows = JSON.parse(window.localStorage.getItem(FAB_DRAWING_TEMPLATES_KEY) || '[]')
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

const saveDrawingTemplates = (rows) => {
  try {
    window.localStorage.setItem(FAB_DRAWING_TEMPLATES_KEY, JSON.stringify(rows.slice(0, 40)))
  } catch {
    /* ignore quota */
  }
}

const fingerprintFile = async (file) => {
  const buffer = await file.arrayBuffer()
  if (window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', buffer)
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  let hash = 0
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i += 1) hash = (hash * 31 + bytes[i]) >>> 0
  return `${file.name}-${file.size}-${hash}`
}

const findDrawingTemplate = (fingerprint) =>
  loadDrawingTemplates().find((item) => item.fingerprint === fingerprint) || null

const rememberDrawingTemplate = (project) => {
  if (!project?.drawingFingerprint || !project.jobType) return
  const template = {
    id: project.drawingFingerprint,
    fingerprint: project.drawingFingerprint,
    fileName: project.drawingName || 'drawing',
    drawingKind: project.drawingKind || '',
    preview: project.drawingKind === 'image' && project.drawing ? project.drawing : '',
    jobType: project.jobType,
    gate: project.jobType === 'gate' ? { ...(project.gate || {}) } : null,
    schedule:
      project.jobType === 'structure'
        ? JSON.parse(JSON.stringify(project.schedule || defaultStructureSchedule()))
        : null,
    roofLength: project.roofLength,
    roofWidth: project.roofWidth,
    wallArea: project.wallArea,
    foundationPads: project.foundationPads,
    label: project.name || project.drawingName || 'Saved drawing formula',
    at: Date.now(),
  }
  // Avoid storing huge previews twice — keep a short flag if preview too large
  if (template.preview && template.preview.length > 400000) template.preview = ''
  const next = [template, ...loadDrawingTemplates().filter((item) => item.fingerprint !== template.fingerprint)]
  saveDrawingTemplates(next)
}

const loadFabPricing = () => {
  if (typeof window === 'undefined') return emptyFabPricing()
  try {
    const saved = { ...emptyFabPricing(), ...JSON.parse(window.localStorage.getItem(PRICING_KEY) || '{}') }
    if (saved.visionProvider === 'openai') saved.visionProvider = 'gemini'
    if (!saved.visionProvider) saved.visionProvider = 'tesseract'
    delete saved.visionApiKey
    return saved
  } catch {
    return emptyFabPricing()
  }
}

const loadFabQuotes = () => {
  if (typeof window === 'undefined') return []
  try {
    const rows = JSON.parse(window.localStorage.getItem(FAB_QUOTES_KEY) || '[]')
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

const loadFabProjects = () => {
  if (typeof window === 'undefined') return []
  try {
    const rows = JSON.parse(window.localStorage.getItem(FAB_PROJECTS_KEY) || '[]')
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

const saveFabProjects = (rows) => {
  try {
    window.localStorage.setItem(FAB_PROJECTS_KEY, JSON.stringify(rows))
  } catch {
    /* ignore */
  }
}

const structureQuote = (project, pricing = emptyFabPricing()) => {
  if (!project || project.jobType !== 'structure') return null
  const labourPercent = pickPercent(project, 'labourPercent', pricing.labourPercent)
  const consumablesPercent = pickPercent(project, 'consumablesPercent', pricing.consumablesPercent)
  const marginPercent = pickPercent(project, 'marginPercent', pricing.marginPercent)
  const lines = (project.schedule || []).map((row) => {
    const rate = moneyAmount(pricing[row.priceKey])
    let amount = 0
    let detail = ''
    if (row.unit === 'm') {
      const meters = moneyAmount(row.meters)
      amount = meters * rate
      detail = `${meters.toFixed(2)}m × ${formatPrice(rate)}/m`
    } else if (row.unit === 'kg') {
      const qty = moneyAmount(row.qty)
      const kgEach = moneyAmount(row.kgEach) || 3.14
      const kg = qty * kgEach
      amount = kg * rate
      detail = `${qty} pcs · ${kg.toFixed(1)}kg × ${formatPrice(rate)}/kg`
    } else {
      const qty = moneyAmount(row.qty)
      amount = qty * rate
      detail = `${qty} pcs × ${formatPrice(rate)}`
    }
    return { name: `${row.role} · ${row.section}`, detail, cost: amount, raw: amount }
  })
  const roofL = moneyAmount(project.roofLength)
  const roofW = moneyAmount(project.roofWidth)
  const wallArea = moneyAmount(project.wallArea)
  const roofArea = roofL * roofW
  const ibrArea = roofArea + wallArea
  const ibrRate = moneyAmount(pricing.ibrPerM2 || pricing.sheetPerM2)
  if (ibrArea > 0) {
    lines.push({
      name: 'IBR Sheets (roof + walls)',
      detail: `${ibrArea.toFixed(2)} sqm`,
      cost: ibrArea * ibrRate,
      raw: ibrArea * ibrRate,
    })
  }
  const pads = moneyAmount(project.foundationPads)
  const padRate = moneyAmount(pricing.foundationPad)
  if (pads > 0) {
    lines.push({
      name: 'Foundation F1 Pads',
      detail: `${pads} pads`,
      cost: pads * padRate,
      raw: pads * padRate,
    })
  }
  const steelSum = lines.reduce((sum, line) => sum + line.raw, 0)
  const materials = steelSum * FAB_STEEL_WASTE
  const labour = materials * (labourPercent / 100)
  const consumables = materials * (consumablesPercent / 100)
  const subtotal = materials + labour + consumables
  const margin = subtotal * (marginPercent / 100)
  const total = subtotal + margin
  return {
    kind: 'structure',
    title: project.name || 'Steel structure',
    client: project.client,
    lines: lines.map((line) => ({ ...line, cost: line.cost })),
    steelSum,
    wasteFactor: FAB_STEEL_WASTE,
    materials,
    labour,
    consumables,
    subtotal,
    margin,
    labourPercent,
    consumablesPercent,
    marginPercent,
    roofArea,
    wallArea,
    ibrArea,
    total,
    quote: total,
  }
}

const moneyAmount = (value) => {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

const stockCuts = (meters) => {
  if (!(meters > 0)) return { meters: 0, lengths: 0, label: '0m' }
  const lengths = Math.max(1, Math.ceil(meters / FAB_STOCK))
  return {
    meters,
    lengths,
    label: `${meters.toFixed(1)}m (${lengths} length${lengths === 1 ? '' : 's'} of ${FAB_STOCK}m)`,
  }
}

const pickQty = (draft, key, computed) => {
  const raw = draft[key]
  if (raw === '' || raw == null) return computed
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : computed
}

const pickPercent = (draft, key, fallback) => {
  const raw = draft[key]
  if (raw === '' || raw == null) return moneyAmount(fallback)
  return moneyAmount(raw)
}

/**
 * L = W + 0.4 for sliding, else W.
 * Swing double: each leaf = L/2.
 * frame_50 = (2L)+(2H)+(3H)+L
 * count_25 = round(L/S); length_25 = count*(H-0.1)*1.1
 */
const calculateGate = (W, H, gateType, design, spacing = FAB_DEFAULT_SPACING) => {
  const openingL = gateType === 'sliding' ? W + FAB_OVERLAP : W
  const leaves = gateType === 'swing-double' ? 2 : 1
  const leafL = gateType === 'swing-double' ? openingL / 2 : openingL
  const S = spacing > 0 ? spacing : FAB_DEFAULT_SPACING
  const middleVerticals = FAB_MIDDLE_VERTICALS
  const frame50One = leafL * 2 + H * 2 + middleVerticals * H + leafL
  // User examples: 4.4/1.0 → 4 bars, 4.4/0.12 → 36 bars
  const barCountOne = Math.floor(leafL / S + 1e-9)
  const barClearH = Math.max(0, H - FAB_BAR_CLEARANCE)
  const sheetH = Math.min(FAB_HALF_SHEET_H, H)
  const topH = Math.max(0, H - sheetH)
  let tube25One = 0
  let sheetOne = 0
  if (design === 'palisade') {
    tube25One = barCountOne * barClearH * FAB_TUBE_WASTAGE
  } else if (design === 'solid') {
    sheetOne = leafL * H
  } else if (design === 'half') {
    sheetOne = leafL * sheetH
    tube25One = barCountOne * topH * FAB_TUBE_WASTAGE
  }
  const uChannel = gateType === 'sliding' ? openingL : 0
  return {
    L: openingL,
    leafL,
    leaves,
    spacing: S,
    middleVerticals,
    barCount: barCountOne * leaves,
    sheetH,
    topH,
    computed50: frame50One * leaves,
    computed25: tube25One * leaves,
    computedSheet: sheetOne * leaves,
    computedBeam: uChannel,
    sheetLength: (sheetOne * leaves) / FAB_SHEET_WIDTH,
  }
}

const fabQuote = (draft, pricing = emptyFabPricing()) => {
  const W = Number(draft.width)
  const H = Number(draft.height || draft.length)
  if (!(W > 0) || !(H > 0) || !draft.gateType || !draft.design) return null
  const type = FAB_CALC_TYPES.find((item) => item.id === draft.gateType)
  const design = FAB_CALC_DESIGNS.find((item) => item.id === draft.design)
  const spacing = Number(draft.spacing)
  const built = calculateGate(W, H, draft.gateType, draft.design, spacing > 0 ? spacing : FAB_DEFAULT_SPACING)
  const total50 = pickQty(draft, 'qty50', built.computed50)
  const tube25 = pickQty(draft, 'qty25', built.computed25)
  const sheetArea = pickQty(draft, 'qtySheet', built.computedSheet)
  const beam = pickQty(draft, 'qtyBeam', built.computedBeam)
  const tube50Rate = moneyAmount(pricing.tube50PerM)
  const tube25Rate = moneyAmount(pricing.tube25PerM)
  const beamRate = moneyAmount(pricing.uChannelPerM)
  const sheetRate = moneyAmount(pricing.sheetPerM2)
  const labourPercent = pickPercent(draft, 'labourPercent', pricing.labourPercent)
  const consumablesPercent = pickPercent(draft, 'consumablesPercent', pricing.consumablesPercent)
  const marginPercent = pickPercent(draft, 'marginPercent', pricing.marginPercent)
  const cost50 = total50 * tube50Rate
  const cost25 = tube25 * tube25Rate
  const costBeam = beam * beamRate
  const costSheet = sheetArea * sheetRate
  const materials = cost50 + cost25 + costBeam + costSheet
  const labour = materials * (labourPercent / 100)
  const consumables = materials * (consumablesPercent / 100)
  const subtotal = materials + labour + consumables
  const margin = subtotal * (marginPercent / 100)
  const total = subtotal + margin
  const hardwareLabel =
    draft.gateType === 'sliding'
      ? 'Track, 2 Rollers, Stopper'
      : draft.gateType === 'swing-double'
        ? '4 Hinges, 2 Drop bolts, Lock'
        : '2 Hinges, Drop bolt, Lock'
  const lines = [
    { name: '50x50x2mm Tube', detail: stockCuts(total50).label, cost: cost50 },
    tube25 > 0 ? { name: '25x25mm Tube', detail: stockCuts(tube25).label, cost: cost25 } : null,
    beam > 0 ? { name: 'U-Channel 80x40', detail: stockCuts(beam).label, cost: costBeam } : null,
    sheetArea > 0
      ? {
          name: 'IBR Sheet',
          detail: `${sheetArea.toFixed(1)} sqm`,
          cost: costSheet,
        }
      : null,
  ].filter(Boolean)
  return {
    W,
    H,
    L: built.L,
    leafL: built.leafL,
    leaves: built.leaves,
    type,
    design,
    title: `${built.L.toFixed(1)}m x ${H.toFixed(1)}m - ${design?.title || 'Design'}`,
    computed50: built.computed50,
    computed25: built.computed25,
    computedBeam: built.computedBeam,
    computedSheet: built.computedSheet,
    total50,
    tube25,
    beam,
    sheetArea,
    sheetLength: sheetArea / FAB_SHEET_WIDTH,
    spacing: built.spacing,
    palisadeCount: built.barCount,
    middleVerticals: built.middleVerticals,
    hardwareLabel,
    cost50,
    cost25,
    costBeam,
    costSheet,
    materials,
    labour,
    consumables,
    subtotal,
    margin,
    labourPercent,
    consumablesPercent,
    marginPercent,
    total,
    quote: total,
    lines,
  }
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
  const [dir, setDir] = useState(1)
  const videoRef = useRef(null)
  const count = media.length

  const go = (step) => {
    if (count < 2) return
    const nextDir = step >= 0 ? 1 : -1
    setDir(nextDir)
    setIndex((current) => current + nextDir)
  }

  useEffect(() => {
    setIndex(0)
    setDir(1)
  }, [companyKey])

  useEffect(() => {
    if (count < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const activeIndex = ((index % count) + count) % count
    const current = media[activeIndex]
    const wait = current?.kind === 'video' ? VIDEO_SECONDS * 1000 : 8000
    const timer = window.setTimeout(() => {
      setDir(1)
      setIndex((currentIndex) => currentIndex + 1)
    }, wait)
    return () => window.clearTimeout(timer)
  }, [companyKey, index, count, media])

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

  const active = ((index % count) + count) % count
  const visible = media[active] || media[0]
  const visibleCompany = visible.company
  const slideOffset = (slideIndex) => {
    let delta = slideIndex - active
    if (dir >= 0 && delta < 0) delta += count
    if (dir < 0 && delta > 0) delta -= count
    return delta
  }

  return (
    <div className="feature-card">
      <div className={visibleCompany.nativeFrame ? 'feature-shot feature-shot-fill' : 'feature-shot'}>
        {media.map((item, slideIndex) => (
          <div
            className="feature-slide"
            key={`${item.company.id}-${item.kind}-${slideIndex}`}
            style={{ transform: `translate3d(${slideOffset(slideIndex) * 100}%, 0, 0)` }}
          >
            {item.kind === 'video' ? (
              <video
                ref={slideIndex === active ? videoRef : null}
                src={item.src}
                poster={item.poster || undefined}
                muted
                playsInline
                autoPlay={slideIndex === active}
                preload={slideIndex === active ? 'auto' : 'metadata'}
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
          onClick={() => onOpen(visibleCompany, visible.src)}
          aria-label={visibleCompany.name}
        />
      </div>
      <button className="feature-meta" type="button" onClick={() => onOpen(visibleCompany, visible.src)}>
        <span className="store-logo" style={{ background: visibleCompany.hue }}>
          {visibleCompany.name.slice(0, 1)}
        </span>
        <div>
          <strong>{visibleCompany.name}</strong>
          <p>{visibleCompany.category}</p>
        </div>
        <GoldStar rating={visibleCompany.rating} />
      </button>
      {visible.caption ? <p className="feature-quote">{visible.caption}</p> : null}
    </div>
  )
}

function HomeTile({ company, onOpen }) {
  const slide = firstSlide(company)
  const reel = slide?.video || company.video
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

function PhaseSeal({ kicker, title, message }) {
  return (
    <div className="phase-seal" role="status">
      <span className="phase-seal-drops" aria-hidden="true" />
      <span className="phase-seal-mark">Sealed</span>
      {kicker ? <p className="phase-seal-kicker">{kicker}</p> : null}
      <p className="phase-seal-title">{title}</p>
      <p className="phase-seal-copy">{message}</p>
    </div>
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

function SystemExplainCards({ system }) {
  const slides = system.slides?.length
    ? system.slides
    : (system.preview || []).map((photo) => ({ photo, testimonial: system.how }))
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const startX = useRef(0)
  const dragging = useRef(false)

  useEffect(() => {
    setIndex(0)
    setDir(1)
  }, [system.id])

  const go = (step) => {
    if (count < 2) return
    const nextDir = step >= 0 ? 1 : -1
    setDir(nextDir)
    setIndex((current) => current + nextDir)
  }

  const onPointerDown = (event) => {
    if (event.target.closest('button')) return
    dragging.current = true
    startX.current = event.clientX
  }

  const onPointerUp = (event) => {
    if (!dragging.current) return
    dragging.current = false
    const delta = event.clientX - startX.current
    if (delta <= -40) go(1)
    if (delta >= 40) go(-1)
  }

  const active = count ? ((index % count) + count) % count : 0
  const slide = slides[active]
  const slideOffset = (slideIndex) => {
    let delta = slideIndex - active
    if (dir >= 0 && delta < 0) delta += count
    if (dir < 0 && delta > 0) delta -= count
    return delta
  }

  if (!count) return <p className="shop-copy">{system.how}</p>

  return (
    <div className="explain-cards">
      <div
        className="explain-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragging.current = false
        }}
      >
        {slides.map((entry, slideIndex) => (
          <div
            className="explain-slide"
            key={`${system.id}-explain-${slideIndex}`}
            style={{ transform: `translate3d(${slideOffset(slideIndex) * 100}%, 0, 0)` }}
          >
            {entry.video ? (
              <video src={entry.video} muted playsInline autoPlay={slideIndex === active} controls={false} />
            ) : (
              <img src={entry.photo} alt="" />
            )}
          </div>
        ))}
        {count > 1 ? (
          <>
            <button
              className="card-arrow left"
              type="button"
              aria-label="Previous"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                go(-1)
              }}
            >
              ‹
            </button>
            <button
              className="card-arrow right"
              type="button"
              aria-label="Next"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                go(1)
              }}
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      <p className="explain-count">{active + 1} / {count}</p>
      <p className="explain-copy">{slide?.testimonial || system.how}</p>
    </div>
  )
}

function OpenedCard({
  company,
  onClose,
  onViewProfile,
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
  const count = slides.length
  const [index, setIndex] = useState(() => Number(startIndex) || 0)
  const [dir, setDir] = useState(1)
  const startX = useRef(0)
  const dragging = useRef(false)

  useEffect(() => {
    setIndex(Number(startIndex) || 0)
    setDir(1)
  }, [company.id, startIndex])

  const go = (step) => {
    if (count < 2) return
    const nextDir = step >= 0 ? 1 : -1
    setDir(nextDir)
    setIndex((current) => current + nextDir)
  }

  const onPointerDown = (event) => {
    if (event.target.closest('button')) return
    dragging.current = true
    startX.current = event.clientX
  }

  const onPointerUp = (event) => {
    if (!dragging.current) return
    dragging.current = false
    const delta = event.clientX - startX.current
    if (delta <= -40) go(1)
    if (delta >= 40) go(-1)
  }

  const active = count ? ((index % count) + count) % count : 0
  const slide = slides[active]
  const slideOffset = (slideIndex) => {
    let delta = slideIndex - active
    if (dir >= 0 && delta < 0) delta += count
    if (dir < 0 && delta > 0) delta -= count
    return delta
  }

  return (
    <section
      className="detail-sheet opened-sheet"
      aria-label={company.name}
      onClick={onClose}
    >
      <div className="opened-card" onClick={(event) => event.stopPropagation()}>
        <div
          className={company.nativeFrame ? 'opened-stage opened-stage-fill' : 'opened-stage'}
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
          {slides.map((entry, slideIndex) => (
            <div
              className="opened-slide"
              key={`${company.id}-open-${slideIndex}`}
              style={{ transform: `translate3d(${slideOffset(slideIndex) * 100}%, 0, 0)` }}
            >
              {entry.video ? (
                <video src={entry.video} muted playsInline autoPlay={slideIndex === active} controls={false} />
              ) : entry.photo ? (
                <img src={entry.photo} alt={`${company.name} photo ${slideIndex + 1}`} />
              ) : null}
            </div>
          ))}
          {count > 1 && (
            <>
              <button
                className="card-arrow left"
                type="button"
                aria-label="Previous"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  go(-1)
                }}
              >
                ‹
              </button>
              <button
                className="card-arrow right"
                type="button"
                aria-label="Next"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  go(1)
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
        <div className="opened-copy">
          {company.shelf ? <p className="card-class">{company.shelf}</p> : null}
          <h2>{company.name}</h2>
          <p className="opened-count">
            {count ? `${active + 1} / ${count}` : '0 / 0'}
          </p>
          {slide?.testimonial ? (
            <p className="detail-quote card-caption">{slide.testimonial}</p>
          ) : (
            <p className="empty-note">No photos yet.</p>
          )}
        </div>
        {canDelete ? (
          <button type="button" className="danger-button card-delete" onClick={() => onDelete(active)}>
            Delete picture
          </button>
        ) : null}
        {onViewProfile ? (
          <div className="card-actions opened-actions">
            <button className="view-profile-button" type="button" onClick={onViewProfile}>
              View profile
            </button>
          </div>
        ) : null}
        {comments && onAddComment ? (
          <CommentThread
            targetId={`photo:${company.id}:${active}`}
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

function MallProductSheet({ product, onClose, comments, onAddComment, onReplyComment, viewer, onNeedAccount }) {
  if (!product) return null
  return (
    <section className="detail-sheet shop-sheet" aria-label={product.name} onClick={onClose}>
      <div className="opened-card shop-item-card" onClick={(event) => event.stopPropagation()}>
        <div className="opened-stage shop-item-stage">
          <button type="button" className="card-x" aria-label="Close" onClick={onClose}>
            ×
          </button>
          {product.photo ? <img src={product.photo} alt={product.name} /> : null}
        </div>
        <div className="shop-item-fields">
          <p className="eyebrow">{product.shopName}</p>
          <h2>{product.name}</h2>
          <p className="fab-quote">{formatPrice(product.price)}</p>
          {product.description ? <p className="shop-copy">{product.description}</p> : null}
          <MallEcoCash item={product} />
          <CommentThread
            targetId={`item:${product.shopId}:${product.id}`}
            comments={comments}
            viewer={viewer}
            onAdd={onAddComment}
            onReply={onReplyComment}
            onNeedAccount={onNeedAccount}
          />
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
                <MallEcoCash item={item} />
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

function MallEcoCash({ item }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ number: '', password: '', name: '' })
  const [note, setNote] = useState('')
  const [sold, setSold] = useState(false)

  const pay = (event) => {
    event.preventDefault()
    if (!readOnline()) {
      setNote(offlineActionMessage(NETWORK_ACTIONS.pay))
      return
    }
    const number = form.number.replace(/\s/g, '')
    if (!/^07\d{8}$/.test(number)) {
      setNote('Enter a 10-digit EcoCash number starting with 07.')
      return
    }
    if (!form.password.trim() || !form.name.trim()) {
      setNote('Enter the EcoCash password and the name on the account.')
      return
    }
    setNote('')
    setSold(true)
    setOpen(false)
  }

  if (sold) return <p className="sold-note">Sold via EcoCash · {formatPrice(item.price)}</p>

  return (
    <div className="mall-pay">
      <button
        type="button"
        className="primary-button"
        onClick={() => {
          if (!readOnline()) {
            setNote(offlineActionMessage(NETWORK_ACTIONS.pay))
            setOpen(true)
            return
          }
          setOpen((value) => !value)
        }}
      >
        Buy with EcoCash
      </button>
      {open && (
        <form className="ecocash-card mall-ecocash" onSubmit={pay}>
          <p className="ecocash-kicker">EcoCash</p>
          <input
            type="tel"
            placeholder="07xxxxxxxx"
            value={form.number}
            onChange={(event) => setForm((value) => ({ ...value, number: event.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
          />
          <input
            type="text"
            placeholder="Name on EcoCash"
            value={form.name}
            onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
          />
          {note ? <p className="form-error">{note}</p> : null}
          <button type="submit" className="primary-button">
            Pay {formatPrice(item.price)}
          </button>
        </form>
      )}
    </div>
  )
}

function CeoDashboard({ site, onBack, embedded = false }) {
  const brand = brandTheme(site?.brandName || site?.name || 'Company')
  const figures = ceoFigures(brand.name)
  const manufacturing = site?.systemType === 'manufacturing'
  const domain = liveDomain(site)
  const body = (
    <main className="clone-page ceo-page">
      <p className="eyebrow">{manufacturing ? 'Prixburg style' : 'Rodcroft style'}</p>
      <h1>{brand.name}</h1>
      <p className="clone-muted">
        CEO control area. Live data entry stays on {domain}. This page only shows the dashboards.
      </p>
      <div className="ceo-grid">
        {manufacturing ? (
          <>
            <article>
              <span>Storeroom lines</span>
              <strong>{figures.stock}</strong>
            </article>
            <article>
              <span>Consumed today</span>
              <strong>{figures.consumed}</strong>
            </article>
            <article>
              <span>Sales</span>
              <strong>{formatPrice(figures.sales)}</strong>
            </article>
          </>
        ) : (
          <>
            <article>
              <span>Live sites</span>
              <strong>{figures.sites}</strong>
            </article>
            <article>
              <span>Valuations</span>
              <strong>{formatPrice(figures.valuation)}</strong>
            </article>
            <article>
              <span>SHEQ files</span>
              <strong>{figures.sheq}</strong>
            </article>
            <article>
              <span>Storeroom lines</span>
              <strong>{figures.stock}</strong>
            </article>
          </>
        )}
      </div>
      <p className="clone-muted">Domain for data entry: {domain}</p>
      {onBack ? (
        <button type="button" className="clone-text-btn" onClick={onBack}>
          Back to Fortress
        </button>
      ) : null}
    </main>
  )

  if (embedded) return <div className="ceo-embedded">{body}</div>

  return (
    <div className={`clone-app ${manufacturing ? 'clone-prixburg' : 'clone-rodcroft'}`} style={brand.vars}>
      <header className="clone-topbar">
        <div className="clone-topbar-inner">
          <HistoryNav />
          <button type="button" className="clone-brand" onClick={onBack}>
            <span className="clone-brand-mark">{brand.mark}</span>
            <span className="clone-brand-name">{brand.name}</span>
          </button>
        </div>
      </header>
      {body}
    </div>
  )
}

function HistoryNav({ className = '' }) {
  return (
    <div className={`history-nav ${className}`.trim()}>
      <button type="button" className="history-nav-btn" aria-label="Go back" onClick={() => window.history.back()}>
        ←
      </button>
      <button type="button" className="history-nav-btn" aria-label="Go forward" onClick={() => window.history.forward()}>
        →
      </button>
    </div>
  )
}

const calcPanelFromState = (view, step) => {
  if (view === 'pricing') return 'list'
  if (view === 'subscriptions') return 'subs'
  if (view === 'documents') return 'docs'
  if (step === 1) return 'new'
  if (step === 2) return 'drawing'
  if (step === 3) return 'prices'
  if (step === 4) return 'quote'
  return 'home'
}

const calcStateFromPanel = (panel = 'home') => {
  if (panel === 'list') return { view: 'pricing', step: 0 }
  if (panel === 'subs') return { view: 'subscriptions', step: 0 }
  if (panel === 'docs') return { view: 'documents', step: 0 }
  if (panel === 'new') return { view: 'home', step: 1 }
  if (panel === 'drawing') return { view: 'home', step: 2 }
  if (panel === 'prices') return { view: 'home', step: 3 }
  if (panel === 'quote') return { view: 'home', step: 4 }
  return { view: 'home', step: 0 }
}

function FabMenuIcon({ name }) {
  const paths = {
    home: ['M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3z'],
    subscriptions: ['M4 7h16v10H4z', 'M4 11h16', 'M8 15h4'],
    documents: ['M7 3h7l5 5v13H7z', 'M14 3v5h5'],
    pricing: ['M12 3v18', 'M16.5 7.5H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H7'],
  }
  return (
    <svg className="fab-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {(paths[name] || []).map((d) => (
        <path key={d} fill="currentColor" d={d} />
      ))}
    </svg>
  )
}

function FabTypeIcon({ name }) {
  if (name === 'swing-double') {
    return (
      <svg className="fab-card-icon" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="6" y="8" width="16" height="32" rx="2" />
        <rect x="26" y="8" width="16" height="32" rx="2" />
        <path d="M14 24h8M26 24h8" />
      </svg>
    )
  }
  if (name === 'swing-single') {
    return (
      <svg className="fab-card-icon" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="14" y="8" width="20" height="32" rx="2" />
        <circle cx="16" cy="24" r="2" />
        <path d="M34 16v16" />
      </svg>
    )
  }
  return (
    <svg className="fab-card-icon" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="8" y="10" width="28" height="24" rx="2" />
      <path d="M8 38h36M14 38v-4M24 38v-4M34 38v-4" />
    </svg>
  )
}

function FabDesignImage({ name }) {
  if (name === 'solid') {
    return (
      <svg className="fab-design-art" viewBox="0 0 220 120" aria-hidden="true">
        <rect x="18" y="14" width="184" height="92" rx="6" fill="#6b645c" />
        {[28, 48, 68, 88, 108].map((y) => (
          <path key={y} d={`M22 ${y} q18 -8 36 0 t36 0 t36 0 t36 0`} fill="none" stroke="#d7cfc4" strokeWidth="3" />
        ))}
      </svg>
    )
  }
  if (name === 'half') {
    return (
      <svg className="fab-design-art" viewBox="0 0 220 120" aria-hidden="true">
        <rect x="18" y="14" width="184" height="92" rx="6" fill="#fff" stroke="#1c1915" />
        {[40, 62, 84, 106, 128, 150, 172].map((x) => (
          <rect key={x} x={x} y="18" width="8" height="42" fill="#1c1915" />
        ))}
        <rect x="22" y="62" width="176" height="40" fill="#6b645c" />
      </svg>
    )
  }
  return (
    <svg className="fab-design-art" viewBox="0 0 220 120" aria-hidden="true">
      <rect x="18" y="14" width="184" height="92" rx="6" fill="#fff" stroke="#1c1915" />
      {[40, 58, 76, 94, 112, 130, 148, 166].map((x) => (
        <rect key={x} x={x} y="20" width="8" height="80" fill="#1c1915" />
      ))}
    </svg>
  )
}

function DrawingPaper({ caption, children }) {
  return (
    <svg className="fab-drawing" viewBox="0 0 320 228" aria-hidden="true">
      <rect className="fab-drawing-sheet" x="6" y="6" width="308" height="216" rx="10" />
      <text className="fab-drawing-caption" x="18" y="24">
        {caption}
      </text>
      <line x1="36" y1="36" x2="284" y2="36" />
      <line x1="36" y1="32" x2="36" y2="40" />
      <line x1="284" y1="32" x2="284" y2="40" />
      <text x="160" y="34" textAnchor="middle">
        W
      </text>
      {children}
    </svg>
  )
}

function bars(xs, y1, y2, spear) {
  return xs.map((x) => (
    <g key={x}>
      <line x1={x} y1={y1} x2={x} y2={y2} />
      {spear ? <path d={`M${x - 6} ${y1} L${x} ${y1 - 14} L${x + 6} ${y1}`} /> : null}
    </g>
  ))
}

function scrolls(points) {
  return points.map(([x, y], index) => (
    <path key={`${x}-${y}-${index}`} d={`M${x} ${y} c12 -16 28 16 8 22 c-22 8 -18 -28 6 -22`} />
  ))
}

function GateEngineeringDrawing({ type, kind }) {
  const fancy = kind === 'laser'
  const mid = kind === 'medium' || fancy
  const caption =
    kind === 'laser' ? 'COMPLEX' : kind === 'medium' ? 'MEDIUM' : 'SIMPLE'

  const leaf = (x, w, y = 48, h = 132) => (
    <>
      <rect x={x} y={y} width={w} height={h} />
      <line x1={x} y1={y + 16} x2={x + w} y2={y + 16} />
      <line x1={x} y1={y + h - 16} x2={x + w} y2={y + h - 16} />
      {bars(
        Array.from({ length: Math.max(3, Math.round(w / 22)) }, (_, i) => x + 12 + i * (w / Math.max(3, Math.round(w / 22)))),
        y + 16,
        y + h - 16,
        mid,
      )}
      {fancy ? scrolls([[x + 18, y + 70], [x + w - 34, y + 88]]) : null}
    </>
  )

  if (type === 'swing') {
    return (
      <DrawingPaper caption={`SWING · ${caption}`}>
        <rect x="28" y="48" width="14" height="140" />
        <rect x="278" y="48" width="14" height="140" />
        {leaf(46, 110)}
        {leaf(164, 110)}
        <circle cx="46" cy="70" r="4" />
        <circle cx="46" cy="160" r="4" />
        <circle cx="274" cy="70" r="4" />
        <circle cx="274" cy="160" r="4" />
        <path d="M156 180 A70 36 0 0 1 46 196" />
        <path d="M164 180 A70 36 0 0 0 274 196" />
        <text className="fab-drawing-caption" x="160" y="216" textAnchor="middle">
          HINGE
        </text>
      </DrawingPaper>
    )
  }

  if (type === 'cantilever') {
    return (
      <DrawingPaper caption={`CANTILEVER · ${caption}`}>
        <rect x="40" y="48" width="14" height="132" />
        <rect x="118" y="48" width="14" height="132" />
        <rect x="54" y="56" width="230" height="116" />
        <line x1="54" y1="72" x2="284" y2="72" />
        <line x1="54" y1="156" x2="284" y2="156" />
        {bars([74, 98, 122, 146, 170, 194, 218, 242, 266], 72, 156, mid)}
        {fancy ? scrolls([[80, 100], [200, 118]]) : null}
        <rect x="54" y="56" width="70" height="116" className="fab-drawing-hatch" />
        <circle cx="47" cy="168" r="8" />
        <circle cx="125" cy="168" r="8" />
        <line x1="36" y1="188" x2="200" y2="188" />
        <text className="fab-drawing-caption" x="160" y="216" textAnchor="middle">
          ROLLERS · NO GROUND TRACK
        </text>
      </DrawingPaper>
    )
  }

  if (type === 'bifold') {
    return (
      <DrawingPaper caption={`BI-FOLD · ${caption}`}>
        <rect x="30" y="48" width="12" height="140" />
        <rect x="278" y="48" width="12" height="140" />
        <rect x="48" y="56" width="52" height="124" />
        <rect x="100" y="62" width="48" height="118" transform="rotate(-18 100 180)" />
        <rect x="172" y="62" width="48" height="118" transform="rotate(18 220 180)" />
        <rect x="220" y="56" width="52" height="124" />
        {mid ? bars([58, 72, 86], 72, 164, true) : bars([62, 82], 72, 164, false)}
        {fancy ? scrolls([[56, 110], [230, 118]]) : null}
        <text className="fab-drawing-caption" x="160" y="216" textAnchor="middle">
          FOLD
        </text>
      </DrawingPaper>
    )
  }

  if (type === 'telescopic') {
    return (
      <DrawingPaper caption={`TELESCOPIC · ${caption}`}>
        <rect x="36" y="54" width="90" height="120" />
        <rect x="86" y="62" width="90" height="112" />
        <rect x="136" y="70" width="90" height="104" />
        {fancy ? <rect x="186" y="78" width="80" height="96" /> : null}
        {bars([50, 70, 100, 120, 150, 170], 78, 160, mid)}
        {fancy ? scrolls([[148, 112]]) : null}
        <path d="M40 190 H250" />
        <text className="fab-drawing-caption" x="160" y="216" textAnchor="middle">
          LEAVES STACK
        </text>
      </DrawingPaper>
    )
  }

  if (type === 'pedestrian') {
    return (
      <DrawingPaper caption={`PEDESTRIAN · ${caption}`}>
        <rect x="88" y="44" width="16" height="148" />
        <rect x="216" y="44" width="16" height="148" />
        <rect x="104" y="52" width="112" height="132" />
        <line x1="104" y1="68" x2="216" y2="68" />
        <line x1="104" y1="168" x2="216" y2="168" />
        {bars([120, 138, 156, 174, 192], 68, 168, mid)}
        {fancy ? scrolls([[118, 108]]) : null}
        <circle cx="200" cy="118" r="7" />
        <line x1="104" y1="118" x2="200" y2="118" />
        <text className="fab-drawing-caption" x="160" y="216" textAnchor="middle">
          LATCH
        </text>
      </DrawingPaper>
    )
  }

  if (type === 'automatic') {
    return (
      <DrawingPaper caption={`AUTOMATIC · ${caption}`}>
        <rect x="28" y="50" width="18" height="128" />
        <rect x="46" y="58" width="200" height="112" />
        <line x1="46" y1="74" x2="246" y2="74" />
        <line x1="46" y1="154" x2="246" y2="154" />
        {bars([66, 90, 114, 138, 162, 186, 210, 232], 74, 154, mid)}
        {fancy ? scrolls([[70, 104], [180, 120]]) : null}
        <rect x="28" y="86" width="36" height="28" />
        <line x1="46" y1="170" x2="246" y2="170" />
        {[70, 100, 130, 160, 190, 220].map((x) => (
          <path key={x} d={`M${x} 170 L${x + 8} 176 L${x} 182`} />
        ))}
        <circle cx="40" cy="196" r="5" />
        <circle cx="250" cy="196" r="5" />
        <line x1="40" y1="196" x2="250" y2="196" />
        <text className="fab-drawing-caption" x="160" y="216" textAnchor="middle">
          MOTOR · RACK · BEAM
        </text>
      </DrawingPaper>
    )
  }

  if (type === 'wrought') {
    return (
      <DrawingPaper caption={`WROUGHT IRON · ${caption}`}>
        <rect x="40" y="52" width="12" height="136" />
        <rect x="268" y="52" width="12" height="136" />
        <path d="M52 58 Q160 18 268 58" />
        {leaf(52, 216, 58, 122)}
        <circle cx="100" cy="118" r="12" />
        <circle cx="160" cy="118" r="12" />
        <circle cx="220" cy="118" r="12" />
        {fancy ? scrolls([[70, 90], [140, 140], [210, 90]]) : mid ? scrolls([[90, 100], [190, 100]]) : null}
        <text className="fab-drawing-caption" x="160" y="216" textAnchor="middle">
          SCROLLS · SPEARS
        </text>
      </DrawingPaper>
    )
  }

  return (
    <DrawingPaper caption={`SLIDING · ${caption}`}>
      <rect x="24" y="52" width="16" height="128" />
      <rect x="44" y="60" width="220" height="108" />
      <line x1="44" y1="76" x2="264" y2="76" />
      <line x1="44" y1="152" x2="264" y2="152" />
      {bars([64, 88, 112, 136, 160, 184, 208, 232, 252], 76, 152, mid)}
      {fancy ? scrolls([[72, 108], [190, 120]]) : null}
      <line x1="36" y1="176" x2="280" y2="176" />
      <line x1="36" y1="184" x2="280" y2="184" />
      <circle cx="70" cy="180" r="6" />
      <circle cx="130" cy="180" r="6" />
      <circle cx="190" cy="180" r="6" />
      <path d="M250 112 H290 M278 104 L290 112 L278 120" />
      <text className="fab-drawing-caption" x="160" y="216" textAnchor="middle">
        TRACK · ROLLERS
      </text>
    </DrawingPaper>
  )
}

function FabricationCalculator({
  site,
  draft,
  onChange,
  onSave,
  onRenew,
  onBack,
  pricing,
  onSavePricing,
  routePanel = 'home',
  onNavigate,
}) {
  const initial = calcStateFromPanel(routePanel)
  const [view, setView] = useState(initial.view)
  const [step, setStep] = useState(initial.step)
  const [gateStep, setGateStep] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)
  const [note, setNote] = useState('')
  const [priceForm, setPriceForm] = useState(() => ({ ...emptyFabPricing(), ...(pricing || {}) }))
  const [projects, setProjects] = useState(() => loadFabProjects())
  const [project, setProject] = useState(() => emptyProject())
  const [drawingViewer, setDrawingViewer] = useState(null)
  const [drawingNote, setDrawingNote] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [master, setMaster] = useState(() => loadMasterTemplate())
  const [online, setOnline] = useState(() => readOnline())
  const rates = { ...emptyFabPricing(), ...(pricing || {}), ...(priceForm || {}) }

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const needOnline = (action) => {
    if (online || readOnline()) return false
    setDrawingNote(offlineActionMessage(action))
    setNote(offlineActionMessage(action))
    return true
  }
  const gateDraft = { ...emptyDrawingDraft(), ...(project.gate || {}) }
  const gateQuote = project.jobType === 'gate' ? fabQuote({ ...gateDraft, ...project.gate }, rates) : null
  const structQuote = project.jobType === 'structure' ? structureQuote(project, rates) : null
  const quote = project.jobType === 'structure' ? structQuote : gateQuote

  const navigatePanel = (panel, { replace = false } = {}) => {
    const next = calcStateFromPanel(panel)
    setView(next.view)
    setStep(next.step)
    setMenuOpen(false)
    onNavigate?.(panel === 'home' ? '/calc' : `/calc/${panel}`, { replace })
  }

  useEffect(() => {
    const next = calcStateFromPanel(routePanel || 'home')
    setView(next.view)
    setStep(next.step)
  }, [routePanel])

  const goView = (next) => {
    if (next === 'home') navigatePanel('home')
    else if (next === 'pricing') navigatePanel('list')
    else if (next === 'subscriptions') navigatePanel('subs')
    else if (next === 'documents') navigatePanel('docs')
  }

  const goStep = (nextStep) => navigatePanel(calcPanelFromState('home', nextStep))

  const updateProject = (patch) => setProject((prev) => ({ ...prev, ...patch }))

  const updateGate = (patch) => {
    const nextGate = { ...(project.gate || emptyDrawingDraft()), ...patch }
    updateProject({ gate: nextGate })
    onChange({ ...draft, ...nextGate, jobType: 'gate' })
  }

  const updateScheduleRow = (id, patch) => {
    updateProject({
      schedule: (project.schedule || []).map((row) => (row.id === id ? { ...row, ...patch } : row)),
    })
  }

  const persistProjects = (rows) => {
    setProjects(rows)
    saveFabProjects(rows)
  }

  const saveCurrentProject = (finalQuote) => {
    const entry = {
      ...project,
      id: project.id || makeId('proj'),
      quoteTotal: finalQuote?.total || 0,
      at: Date.now(),
      gate: project.jobType === 'gate' ? { ...(project.gate || {}), name: finalQuote?.title || project.name } : project.gate,
    }
    const next = [entry, ...projects.filter((item) => item.id !== entry.id)].slice(0, 24)
    persistProjects(next)
    rememberDrawingTemplate(entry)
    setProject(entry)
    if (site?.id && project.jobType === 'gate') onSave?.()
    return entry
  }

  const startNewProject = () => {
    setProject(emptyProject())
    onChange(emptyDrawingDraft())
    setNote('')
    setGateStep(1)
    goStep(1)
  }

  const openProject = (item) => {
    setProject({ ...emptyProject(), ...item, schedule: item.schedule?.length ? item.schedule : defaultStructureSchedule() })
    if (item.jobType === 'gate' && item.gate) onChange({ ...emptyDrawingDraft(), ...item.gate })
    setNote('')
    setGateStep(1)
    goStep(4)
  }

  const nextFromProject = () => {
    if (!project.name.trim()) {
      setNote('Enter a project name.')
      return
    }
    if (!project.jobType) {
      setNote('Choose Gate / Burglar or Steel Structure.')
      return
    }
    setNote('')
    setGateStep(1)
    goStep(2)
  }

  const nextFromDrawing = () => {
    if (project.jobType === 'gate') {
      const g = project.gate || {}
      if (!Number(g.width) || !Number(g.height)) {
        setNote('Enter gate width and height.')
        return
      }
      if (!g.gateType) {
        setNote('Choose a gate type.')
        return
      }
      if (!g.design) {
        setNote('Choose a gate design.')
        return
      }
      if ((g.design === 'palisade' || g.design === 'half') && !(Number(g.spacing) > 0)) {
        setNote('Enter palisade spacing.')
        return
      }
    } else if (!(project.schedule || []).length) {
      setNote('Add steel schedule lines.')
      return
    }
    rememberDrawingTemplate(project)
    setNote('')
    setDrawingNote(project.drawingFingerprint ? 'Formula saved for this drawing. Next upload will restore it.' : '')
    setPriceForm({ ...emptyFabPricing(), ...(pricing || {}) })
    goStep(3)
  }

  const nextFromPrices = () => {
    onSavePricing?.(priceForm)
    setNote('')
    goStep(4)
  }

  const finishQuote = () => {
    if (!quote) {
      setNote('Complete the drawing details first.')
      return
    }
    saveCurrentProject(quote)
    setNote('')
  }

  const printQuote = () => {
    if (!quote) return
    const lines = quote.lines.map((line) => `<li>${line.name}: ${line.detail} — ${formatPrice(line.cost)}</li>`).join('')
    const page = `<!doctype html><html><head><title>Quote</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;color:#1c1915}h1{font-size:22px}.box{border:1px solid #ccc;padding:16px;margin:12px 0;border-radius:12px}.green{background:#ecfdf3}.total{font-size:28px;font-weight:800}</style>
      </head><body>
      <h1>Fabrication Quote</h1>
      <p><strong>${project.name || quote.title}</strong>${project.client ? ` · Client: ${project.client}` : ''}</p>
      <p>${project.jobType === 'structure' ? 'Steel Structure' : 'Gate / Burglar'}</p>
      <div class="box"><strong>Materials</strong><ul>${lines}</ul>
      ${quote.wasteFactor ? `<p>Includes ×${quote.wasteFactor} steel wastage on material total.</p>` : ''}
      </div>
      <div class="box">
        <p>Materials: ${formatPrice(quote.materials)}</p>
        <p>Labour (${quote.labourPercent}%): ${formatPrice(quote.labour)}</p>
        <p>Consumables (${quote.consumablesPercent}%): ${formatPrice(quote.consumables)}</p>
        <p>Margin (${quote.marginPercent}%): ${formatPrice(quote.margin)}</p>
      </div>
      <div class="box green"><div class="total">FINAL PRICE: ${formatPrice(quote.total)}</div></div>
      </body></html>`
    const popup = window.open('', '_blank')
    if (!popup) return
    popup.document.write(page)
    popup.document.close()
    popup.focus()
    popup.print()
  }

  const orderWhatsApp = () => {
    if (!quote) return
    if (needOnline(NETWORK_ACTIONS.whatsapp)) return
    const lines = quote.lines.map((line) => `- ${line.name}: ${line.detail}`).join('\n')
    const text = `Quote: ${project.name || quote.title}\nClient: ${project.client || '-'}\n${lines}\nMaterials: ${formatPrice(quote.materials)}\nLabour: ${formatPrice(quote.labour)}\nConsumables: ${formatPrice(quote.consumables)}\nMargin: ${formatPrice(quote.margin)}\nFinal: ${formatPrice(quote.total)}`
    const number = String(pricing?.whatsapp || '').replace(/\D/g, '')
    const href = number
      ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const openDrawing = () => {
    if (!project.drawing) return
    setDrawingViewer({
      src: project.drawing,
      name: project.drawingName || 'Drawing',
      kind: project.drawingKind || (project.drawing.startsWith('data:application/pdf') ? 'pdf' : 'image'),
    })
  }

  const applyVisionExtraction = (extracted, baseProject) => {
    const merged = mergeScheduleWithExtraction(extracted, baseProject.schedule || defaultStructureSchedule())
    const nextMaster = updateMasterFromExtraction(master, extracted, baseProject.name || baseProject.drawingName)
    setMaster(nextMaster)
    const pricingPatch = { ...rates }
    Object.entries(merged.pricingUpdates || {}).forEach(([key, value]) => {
      if (pricingPatch[key] === undefined || pricingPatch[key] === '') pricingPatch[key] = value
    })
    setPriceForm(pricingPatch)
    onSavePricing?.(pricingPatch)
    const building = merged.building || {}
    const nextProject = {
      ...baseProject,
      jobType: 'structure',
      schedule: merged.schedule,
      roofLength: building.length_m ? String(building.length_m) : baseProject.roofLength,
      roofWidth: building.width_m ? String(building.width_m) : baseProject.roofWidth,
    }
    setProject(nextProject)
    rememberDrawingTemplate(nextProject)
    const added = merged.addedSections?.length
      ? ` Template grew: added ${merged.addedSections.join(', ')}.`
      : ' Pattern matched master workshop template.'
    setDrawingNote(`AI read the drawing and filled the steel schedule.${added}`)
    setNote('')
    return nextProject
  }

  const onDrawingFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const fingerprint = await fingerprintFile(file)
    const dataUrl = await readFileAsDataUrl(file)
    const kind = file.type.includes('pdf') ? 'pdf' : 'image'
    const remembered = findDrawingTemplate(fingerprint)
    if (remembered && (!project.jobType || project.jobType === remembered.jobType)) {
      const restored = {
        drawing: dataUrl,
        drawingName: file.name,
        drawingFingerprint: fingerprint,
        drawingKind: kind,
        jobType: project.jobType || remembered.jobType,
        gate: remembered.jobType === 'gate' ? { ...emptyDrawingDraft(), ...(remembered.gate || {}) } : project.gate,
        schedule:
          remembered.jobType === 'structure'
            ? JSON.parse(JSON.stringify(remembered.schedule || defaultStructureSchedule()))
            : project.schedule,
        roofLength: remembered.roofLength ?? project.roofLength,
        roofWidth: remembered.roofWidth ?? project.roofWidth,
        wallArea: remembered.wallArea ?? project.wallArea,
        foundationPads: remembered.foundationPads ?? project.foundationPads,
      }
      setProject((prev) => ({ ...prev, ...restored }))
      if (restored.jobType === 'gate') onChange({ ...emptyDrawingDraft(), ...restored.gate })
      setDrawingNote(`Remembered formula loaded for “${remembered.label || file.name}”.`)
      setNote('')
      return
    }

    if (needOnline(NETWORK_ACTIONS.drawing)) return

    const base = {
      ...project,
      drawing: dataUrl,
      drawingName: file.name,
      drawingFingerprint: fingerprint,
      drawingKind: kind,
    }
    setProject(base)

    const wantsStructure = project.jobType === 'structure' || (!project.jobType && kind)
    const provider = rates.visionProvider === 'openai' ? 'gemini' : rates.visionProvider || 'tesseract'
    if (wantsStructure) {
      setAiBusy(true)
      setDrawingNote(
        provider === 'tesseract'
          ? 'Tesseract OCR reading drawing on this phone…'
          : 'Server Gemini reading drawing… (max 10 / minute).',
      )
      try {
        const extracted = await extractSteelSchedule(dataUrl, { provider })
        applyVisionExtraction(extracted, { ...base, jobType: 'structure' })
      } catch (error) {
        setDrawingNote(
          error?.message
            ? `Auto-read failed: ${error.message}. Fill the schedule once — it will still remember this file.`
            : 'Auto-read failed. Fill the schedule once — it will still remember this file.',
        )
      } finally {
        setAiBusy(false)
      }
      return
    }

    setDrawingNote(
      remembered
        ? 'This drawing was saved for a different job type. Formula not applied.'
        : 'New drawing. Fill the formula once — the app will remember it for this file.',
    )
  }

  const runAiReadAgain = async () => {
    if (!project.drawing) return
    const provider = rates.visionProvider === 'openai' ? 'gemini' : rates.visionProvider || 'tesseract'
    if (provider === 'gemini' && needOnline(NETWORK_ACTIONS.vision)) return
    setAiBusy(true)
    setDrawingNote(
      provider === 'tesseract' ? 'Tesseract OCR reading drawing…' : 'Server Gemini reading drawing… (max 10 / minute).',
    )
    try {
      const extracted = await extractSteelSchedule(project.drawing, { provider })
      applyVisionExtraction(extracted, { ...project, jobType: 'structure' })
    } catch (error) {
      setDrawingNote(error?.message || 'Auto-read failed.')
    } finally {
      setAiBusy(false)
    }
  }

  const DrawingAttach = () =>
    project.drawing ? (
      <div className="fab-drawing-attach">
        {project.drawingKind === 'image' || project.drawing.startsWith('data:image') ? (
          <button type="button" className="fab-drawing-preview-btn" onClick={openDrawing}>
            <img className="fab-drawing-preview" src={project.drawing} alt={project.drawingName || 'Drawing'} />
          </button>
        ) : (
          <div className="fab-pdf-chip">
            <strong>{project.drawingName || 'Drawing.pdf'}</strong>
            <span>PDF attached</span>
          </div>
        )}
        <div className="fab-drawing-actions">
          <button type="button" className="fab-next-btn fab-btn-outline" onClick={openDrawing}>
            Open {project.drawingKind === 'pdf' ? 'PDF' : 'photo'}
          </button>
          {(project.jobType === 'structure' || !project.jobType) && (
            <button type="button" className="fab-go-btn" disabled={aiBusy} onClick={runAiReadAgain}>
              {aiBusy
                ? 'READING DRAWING…'
                : (rates.visionProvider || 'tesseract') === 'tesseract'
                  ? 'OCR READ → FILL SCHEDULE'
                  : 'GEMINI READ → FILL SCHEDULE'}
            </button>
          )}
        </div>
        {drawingNote ? <p className="fab-note fab-remember-note">{drawingNote}</p> : null}
      </div>
    ) : null

  const usesPalisadeSpacing = (project.gate?.design === 'palisade' || project.gate?.design === 'half')
  const wizard = view === 'home'

  return (
    <div className="fab-app">
      <header className="fab-app-bar">
        <button type="button" className="fab-menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          ☰
        </button>
        <HistoryNav />
        <div>
          <p className="eyebrow">Fabrication calc{online ? '' : ' · offline'}</p>
          <strong>{project.name || 'Fabrication calc'}</strong>
        </div>
        {onBack ? (
          <button type="button" className="text-back" onClick={onBack}>
            Fortress
          </button>
        ) : (
          <span />
        )}
      </header>

      {!online ? (
        <p className="fab-offline-banner" role="status">
          Offline — open saved projects, prices, and remembered drawings. New drawing uploads, Gemini, WhatsApp, and
          EcoCash need internet.
        </p>
      ) : null}

      {menuOpen ? (
        <div className="fab-menu-sheet" onClick={() => setMenuOpen(false)}>
          <nav className="fab-menu" aria-label="Calculator menu" onClick={(event) => event.stopPropagation()}>
            <p className="eyebrow">Menu</p>
            <button
              type="button"
              className={wizard && step === 0 ? 'active' : ''}
              onClick={() => goView('home')}
            >
              <FabMenuIcon name="home" />
              Home
            </button>
            <button
              type="button"
              className={view === 'pricing' ? 'active' : ''}
              onClick={() => {
                setPriceForm({ ...emptyFabPricing(), ...(pricing || {}) })
                goView('pricing')
              }}
            >
              <FabMenuIcon name="pricing" />
              Price list
            </button>
            <button
              type="button"
              className={view === 'subscriptions' ? 'active' : ''}
              onClick={() => goView('subscriptions')}
            >
              <FabMenuIcon name="subscriptions" />
              Subscriptions
            </button>
            <button type="button" className={view === 'documents' ? 'active' : ''} onClick={() => goView('documents')}>
              <FabMenuIcon name="documents" />
              Documents
            </button>
          </nav>
        </div>
      ) : null}

      {wizard && step === 0 ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Fabrication calc</h1>
            <p>Two templates: Gate / Burglar jobs, or Steel Structure from a schedule. Upload a structure drawing and the AI brain fills the schedule from your master template.</p>
            <button type="button" className="fab-hero-btn" onClick={startNewProject}>
              CREATE PROJECT
            </button>
            <div className="fab-master-card">
              <strong>Master template</strong>
              <small>
                Learned from: {master.learned_from || 'Workshop'} · {master.learned_count || 1} drawing
                {(master.learned_count || 1) === 1 ? '' : 's'}
              </small>
              <p>
                {(master.patterns?.known_sections || []).slice(0, 8).join(' · ') ||
                  'H 120x120 · PFC 150x75 · LC 125 · LC 100'}
              </p>
              <span>{master.patterns?.formula}</span>
            </div>
          </section>
          <section className="fab-section">
            <h2>Recent projects</h2>
            {projects.length ? (
              <div className="fab-recent">
                {projects.map((item) => (
                  <button key={item.id} type="button" onClick={() => openProject(item)}>
                    <strong>{item.name || 'Project'}</strong>
                    <small>
                      {item.client ? `${item.client} · ` : ''}
                      {item.jobType === 'structure' ? 'Steel structure' : 'Gate / Burglar'}
                    </small>
                    <span>{formatPrice(item.quoteTotal)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty-note">No projects yet.</p>
            )}
          </section>
        </main>
      ) : null}

      {wizard && step === 1 ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Step 1 — Create project</h1>
            <label className="fab-field">
              Project name
              <input
                value={project.name}
                placeholder="e.g. Mbare Workshop"
                onChange={(event) => updateProject({ name: event.target.value })}
              />
            </label>
            <label className="fab-field">
              Client
              <input
                value={project.client}
                placeholder="Client name"
                onChange={(event) => updateProject({ client: event.target.value })}
              />
            </label>
            <h2>Job type</h2>
            <div className="fab-choice-list">
              {JOB_TYPES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`fab-type-card ${project.jobType === item.id ? 'active' : ''}`}
                  onClick={() => updateProject({ jobType: item.id })}
                >
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.copy}</small>
                  </span>
                </button>
              ))}
            </div>
            {note ? <p className="form-error">{note}</p> : null}
            <button type="button" className="fab-next-btn" onClick={nextFromProject}>
              NEXT → ADD DRAWING
            </button>
          </section>
        </main>
      ) : null}

      {wizard && step === 2 && project.jobType === 'gate' ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Step 2 — Gate drawing</h1>
            <label className="fab-field">
              Upload photo / PDF
              <input type="file" accept="image/*,application/pdf" onChange={onDrawingFile} />
            </label>
            <DrawingAttach />

            {gateStep === 1 ? (
              <>
                <h2>Size</h2>
                <label className="fab-field">
                  Width (m)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g 4.0"
                    value={project.gate?.width || ''}
                    onChange={(event) => updateGate({ width: event.target.value })}
                  />
                </label>
                <label className="fab-field">
                  Height (m)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g 2.0"
                    value={project.gate?.height || ''}
                    onChange={(event) => updateGate({ height: event.target.value })}
                  />
                </label>
                <label className="fab-field">
                  Palisade Spacing (m)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={project.gate?.spacing || String(FAB_DEFAULT_SPACING)}
                    onChange={(event) => updateGate({ spacing: event.target.value })}
                  />
                  <small>0.10m = High Security, 0.15m = Normal. Default: 0.12m. Used for Palisade / Half & Half.</small>
                </label>
                <button type="button" className="fab-next-btn" onClick={() => setGateStep(2)}>
                  NEXT → TYPE
                </button>
              </>
            ) : null}

            {gateStep === 2 ? (
              <>
                <h2>Gate type</h2>
                <div className="fab-choice-list">
                  {FAB_CALC_TYPES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`fab-type-card ${project.gate?.gateType === item.id ? 'active' : ''}`}
                      onClick={() => updateGate({ gateType: item.id })}
                    >
                      <FabTypeIcon name={item.id} />
                      <span>
                        <strong>{item.name}</strong>
                        {item.copy ? <small>{item.copy}</small> : null}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="fab-result-actions">
                  <button type="button" className="fab-next-btn fab-btn-outline" onClick={() => setGateStep(1)}>
                    BACK
                  </button>
                  <button type="button" className="fab-next-btn" onClick={() => setGateStep(3)}>
                    NEXT → DESIGN
                  </button>
                </div>
              </>
            ) : null}

            {gateStep === 3 ? (
              <>
                <h2>Design</h2>
                <div className="fab-design-grid">
                  {FAB_CALC_DESIGNS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`fab-design-card ${project.gate?.design === item.id ? 'active' : ''}`}
                      onClick={() => updateGate({ design: item.id })}
                    >
                      <FabDesignImage name={item.id} />
                      <strong>{item.title}</strong>
                      <small>{item.copy}</small>
                    </button>
                  ))}
                </div>
                {usesPalisadeSpacing ? (
                  <label className="fab-field">
                    Palisade Spacing (m)
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={project.gate?.spacing || String(FAB_DEFAULT_SPACING)}
                      onChange={(event) => updateGate({ spacing: event.target.value })}
                    />
                  </label>
                ) : null}
                {note ? <p className="form-error">{note}</p> : null}
                <div className="fab-result-actions">
                  <button type="button" className="fab-next-btn fab-btn-outline" onClick={() => setGateStep(2)}>
                    BACK
                  </button>
                  <button type="button" className="fab-go-btn" onClick={nextFromDrawing}>
                    NEXT → PRICES
                  </button>
                </div>
              </>
            ) : null}
          </section>
        </main>
      ) : null}

      {wizard && step === 2 && project.jobType === 'structure' ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Step 2 — Structure schedule</h1>
            <p className="fab-note">
              Upload a photo/PDF. With a Vision API key the app auto-reads the steel schedule, compares it to the master
              workshop template, adds new sizes (e.g. LC 150), then you price and quote.
            </p>
            <label className="fab-field">
              Upload photo / PDF
              <input type="file" accept="image/*,application/pdf" onChange={onDrawingFile} />
            </label>
            <DrawingAttach />

            <div className="fab-schedule">
              {(project.schedule || []).map((row) => (
                <article key={row.id} className="fab-schedule-row">
                  <strong>
                    {row.role} · {row.section}
                  </strong>
                  <div className="fab-size-row">
                    {row.unit !== 'm' || row.qty !== '' ? (
                      <label>
                        Qty
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={row.qty}
                          onChange={(event) => updateScheduleRow(row.id, { qty: event.target.value })}
                        />
                      </label>
                    ) : (
                      <span />
                    )}
                    {row.unit === 'm' ? (
                      <label>
                        Total m
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.meters}
                          onChange={(event) => updateScheduleRow(row.id, { meters: event.target.value })}
                        />
                      </label>
                    ) : null}
                    {row.unit === 'kg' ? (
                      <label>
                        kg each
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.kgEach}
                          onChange={(event) => updateScheduleRow(row.id, { kgEach: event.target.value })}
                        />
                      </label>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <h2>Cladding & foundation</h2>
            <div className="fab-size-row">
              <label>
                Roof length (m)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={project.roofLength}
                  onChange={(event) => updateProject({ roofLength: event.target.value })}
                />
              </label>
              <label>
                Roof width (m)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={project.roofWidth}
                  onChange={(event) => updateProject({ roofWidth: event.target.value })}
                />
              </label>
            </div>
            <div className="fab-size-row">
              <label>
                Wall area (sqm)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={project.wallArea}
                  onChange={(event) => updateProject({ wallArea: event.target.value })}
                />
              </label>
              <label>
                Foundation F1 pads
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={project.foundationPads}
                  onChange={(event) => updateProject({ foundationPads: event.target.value })}
                />
              </label>
            </div>
            {note ? <p className="form-error">{note}</p> : null}
            <button type="button" className="fab-next-btn" onClick={nextFromDrawing}>
              NEXT → PRICES
            </button>
          </section>
        </main>
      ) : null}

      {wizard && step === 3 ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Step 3 — Material prices</h1>
            <p className="fab-note">Your price list — saved once, used on every quote. Edit anytime.</p>
            {project.jobType === 'gate' ? (
              <>
                <div className="fab-size-row">
                  <label>
                    50x50 per m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.tube50PerM}
                      onChange={(event) => setPriceForm({ ...priceForm, tube50PerM: event.target.value })}
                    />
                  </label>
                  <label>
                    25x25 per m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.tube25PerM}
                      onChange={(event) => setPriceForm({ ...priceForm, tube25PerM: event.target.value })}
                    />
                  </label>
                </div>
                <div className="fab-size-row">
                  <label>
                    U-Channel per m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.uChannelPerM}
                      onChange={(event) => setPriceForm({ ...priceForm, uChannelPerM: event.target.value })}
                    />
                  </label>
                  <label>
                    IBR per sqm
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.sheetPerM2}
                      onChange={(event) => setPriceForm({ ...priceForm, sheetPerM2: event.target.value })}
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="fab-size-row">
                  <label>
                    H 120x120 / m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.h120PerM}
                      onChange={(event) => setPriceForm({ ...priceForm, h120PerM: event.target.value })}
                    />
                  </label>
                  <label>
                    PFC 150x75 / m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.pfc150PerM}
                      onChange={(event) => setPriceForm({ ...priceForm, pfc150PerM: event.target.value })}
                    />
                  </label>
                </div>
                <div className="fab-size-row">
                  <label>
                    LC 125 / m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.lc125PerM}
                      onChange={(event) => setPriceForm({ ...priceForm, lc125PerM: event.target.value })}
                    />
                  </label>
                  <label>
                    LC 100 / m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.lc100PerM}
                      onChange={(event) => setPriceForm({ ...priceForm, lc100PerM: event.target.value })}
                    />
                  </label>
                </div>
                <div className="fab-size-row">
                  <label>
                    L 50x50x5 / m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.angle50PerM}
                      onChange={(event) => setPriceForm({ ...priceForm, angle50PerM: event.target.value })}
                    />
                  </label>
                  <label>
                    Plate / kg
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.platePerKg}
                      onChange={(event) => setPriceForm({ ...priceForm, platePerKg: event.target.value })}
                    />
                  </label>
                </div>
                <div className="fab-size-row">
                  <label>
                    M16 bolt
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.boltM16}
                      onChange={(event) => setPriceForm({ ...priceForm, boltM16: event.target.value })}
                    />
                  </label>
                  <label>
                    M12 bolt
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.boltM12}
                      onChange={(event) => setPriceForm({ ...priceForm, boltM12: event.target.value })}
                    />
                  </label>
                </div>
                <div className="fab-size-row">
                  <label>
                    IBR / sqm
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.ibrPerM2}
                      onChange={(event) => setPriceForm({ ...priceForm, ibrPerM2: event.target.value })}
                    />
                  </label>
                  <label>
                    F1 pad each
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.foundationPad}
                      onChange={(event) => setPriceForm({ ...priceForm, foundationPad: event.target.value })}
                    />
                  </label>
                </div>
                <div className="fab-size-row">
                  <label>
                    LC 150 / m
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceForm.lc150PerM}
                      onChange={(event) => setPriceForm({ ...priceForm, lc150PerM: event.target.value })}
                    />
                  </label>
                  <span />
                </div>
              </>
            )}
            <div className="fab-size-row">
              <label>
                Labour %
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priceForm.labourPercent}
                  onChange={(event) => setPriceForm({ ...priceForm, labourPercent: event.target.value })}
                />
              </label>
              <label>
                Consumables %
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priceForm.consumablesPercent}
                  onChange={(event) => setPriceForm({ ...priceForm, consumablesPercent: event.target.value })}
                />
              </label>
            </div>
            <div className="fab-size-row">
              <label>
                Profit %
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priceForm.marginPercent}
                  onChange={(event) => setPriceForm({ ...priceForm, marginPercent: event.target.value })}
                />
              </label>
              <label>
                WhatsApp
                <input
                  type="tel"
                  value={priceForm.whatsapp}
                  onChange={(event) => setPriceForm({ ...priceForm, whatsapp: event.target.value })}
                />
              </label>
            </div>
            <button type="button" className="fab-go-btn" onClick={nextFromPrices}>
              SAVE PRICES → CALCULATE
            </button>
          </section>
        </main>
      ) : null}

      {wizard && step === 4 ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Step 4 — Quote</h1>
            {quote ? (
              <>
                <div className="fab-result-blue">
                  {project.name || quote.title}
                  {project.client ? ` · ${project.client}` : ''}
                  <small>
                    {project.jobType === 'structure' ? 'Steel structure schedule' : quote.title}
                  </small>
                </div>
                <DrawingAttach />
                <div className="fab-cost-list">
                  {quote.lines.map((line) => (
                    <div key={line.name}>
                      <span>
                        {line.name}
                        <small className="fab-line-detail"> {line.detail}</small>
                      </span>
                      <strong>{formatPrice(line.cost)}</strong>
                    </div>
                  ))}
                  {quote.wasteFactor ? (
                    <div>
                      <span>Steel wastage ×{quote.wasteFactor}</span>
                      <strong>included</strong>
                    </div>
                  ) : null}
                  <div className="fab-cost-total">
                    <span>Materials</span>
                    <strong>{formatPrice(quote.materials)}</strong>
                  </div>
                  <div>
                    <span>Labour ({quote.labourPercent}%)</span>
                    <strong>{formatPrice(quote.labour)}</strong>
                  </div>
                  <div>
                    <span>Consumables ({quote.consumablesPercent}%)</span>
                    <strong>{formatPrice(quote.consumables)}</strong>
                  </div>
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(quote.subtotal)}</strong>
                  </div>
                  <div>
                    <span>Profit ({quote.marginPercent}%)</span>
                    <strong>{formatPrice(quote.margin)}</strong>
                  </div>
                </div>
                <div className="fab-result-green">
                  <p>FINAL ESTIMATED PRICE: {formatPrice(quote.total)}</p>
                </div>
                <div className="fab-result-actions">
                  <button type="button" className="fab-next-btn fab-btn-outline" onClick={() => goStep(2)}>
                    EDIT DRAWING
                  </button>
                  <button
                    type="button"
                    className="fab-next-btn fab-btn-outline"
                    onClick={() => {
                      finishQuote()
                      printQuote()
                    }}
                  >
                    GENERATE PDF QUOTE
                  </button>
                  <button
                    type="button"
                    className="fab-wa-btn"
                    onClick={() => {
                      finishQuote()
                      orderWhatsApp()
                    }}
                  >
                    ORDER ON WHATSAPP
                  </button>
                  <button type="button" className="fab-next-btn" onClick={finishQuote}>
                    SAVE PROJECT
                  </button>
                </div>
              </>
            ) : (
              <p className="form-error">Missing drawing details. Go back and complete Step 2.</p>
            )}
          </section>
        </main>
      ) : null}

      {view === 'subscriptions' ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Subscriptions</h1>
            <div className="fab-subs">
              {FAB_PLANS.map((plan) => (
                <article key={plan.id}>
                  <strong>{plan.label}</strong>
                  <p>{formatPrice(plan.price)}</p>
                  {onRenew ? (
                    <button type="button" className="primary-button" onClick={() => onRenew(plan.id)}>
                      Pay with EcoCash
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </main>
      ) : null}

      {view === 'pricing' ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Price list</h1>
            <h2>Material rates</h2>
            <div className="fab-size-row">
              <label>
                50x50 / m
                <input
                  type="number"
                  value={priceForm.tube50PerM}
                  onChange={(event) => setPriceForm({ ...priceForm, tube50PerM: event.target.value })}
                />
              </label>
              <label>
                H 120x120 / m
                <input
                  type="number"
                  value={priceForm.h120PerM}
                  onChange={(event) => setPriceForm({ ...priceForm, h120PerM: event.target.value })}
                />
              </label>
            </div>
            <div className="fab-size-row">
              <label>
                LC 150 / m
                <input
                  type="number"
                  value={priceForm.lc150PerM}
                  onChange={(event) => setPriceForm({ ...priceForm, lc150PerM: event.target.value })}
                />
              </label>
              <label>
                Labour %
                <input
                  type="number"
                  value={priceForm.labourPercent}
                  onChange={(event) => setPriceForm({ ...priceForm, labourPercent: event.target.value })}
                />
              </label>
            </div>
            <div className="fab-size-row">
              <label>
                Profit %
                <input
                  type="number"
                  value={priceForm.marginPercent}
                  onChange={(event) => setPriceForm({ ...priceForm, marginPercent: event.target.value })}
                />
              </label>
              <label>
                Consumables %
                <input
                  type="number"
                  value={priceForm.consumablesPercent}
                  onChange={(event) => setPriceForm({ ...priceForm, consumablesPercent: event.target.value })}
                />
              </label>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                onSavePricing?.(priceForm)
                goView('home')
              }}
            >
              Save price list
            </button>
          </section>
        </main>
      ) : null}

      {view === 'documents' ? (
        <main className="fab-home">
          <section className="fab-section">
            <h1>Documents</h1>
            {projects.length ? (
              <div className="fab-saved">
                {projects.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.client || '—'} · {item.jobType === 'structure' ? 'Structure' : 'Gate'}
                      </span>
                    </div>
                    <span>{formatPrice(item.quoteTotal)}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-note">No saved projects yet.</p>
            )}
            <h2>Remembered drawing formulas</h2>
            <p className="fab-note">Upload the same photo/PDF again and the linked formula fills the template.</p>
            {loadDrawingTemplates().length ? (
              <div className="fab-saved">
                {loadDrawingTemplates().map((item) => (
                  <article key={item.fingerprint}>
                    <div>
                      <strong>{item.label || item.fileName}</strong>
                      <span>
                        {item.fileName} · {item.jobType === 'structure' ? 'Structure schedule' : 'Gate formula'}
                      </span>
                    </div>
                    {item.preview ? (
                      <button
                        type="button"
                        className="fab-mini-preview"
                        onClick={() =>
                          setDrawingViewer({ src: item.preview, name: item.fileName, kind: item.drawingKind || 'image' })
                        }
                      >
                        <img src={item.preview} alt="" />
                      </button>
                    ) : (
                      <span>Saved</span>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-note">No remembered drawings yet. Complete Step 2 with an upload to save one.</p>
            )}
          </section>
        </main>
      ) : null}

      {drawingViewer ? (
        <div className="fab-viewer-sheet" onClick={() => setDrawingViewer(null)}>
          <div className="fab-viewer" onClick={(event) => event.stopPropagation()}>
            <div className="fab-viewer-bar">
              <strong>{drawingViewer.name}</strong>
              <button type="button" className="text-back" onClick={() => setDrawingViewer(null)}>
                Close
              </button>
            </div>
            {drawingViewer.kind === 'pdf' ? (
              <iframe className="fab-viewer-frame" title={drawingViewer.name} src={drawingViewer.src} />
            ) : (
              <img className="fab-viewer-image" src={drawingViewer.src} alt={drawingViewer.name} />
            )}
            <a className="fab-next-btn fab-btn-outline" href={drawingViewer.src} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </div>
        </div>
      ) : null}
    </div>
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
          <HistoryNav />
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

function PublicCompanyProfile({
  company,
  comments = {},
  onClose,
  onOpenPost,
  onOpenPhoto,
  viewer,
  onAddComment,
  onReplyComment,
  onNeedAccount,
}) {
  const photo = company.profilePhoto || firstSlide(company)?.photo || ''
  const slides = company.slides || []

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
          <p>{company.ceo || company.name}</p>
          <p>CEO</p>
          <p>{company.category}</p>
          {company.location ? <p>{company.location}</p> : null}
          <StarRanking rating={company.rating} />
        </div>
      </div>
      <div className="gallery-grid">
        {slides.length ? (
          slides.map((slide, index) => (
            <button
              key={`${company.id}-grid-${index}`}
              type="button"
              className={`gallery-tile${slide.video ? ' is-reel' : ''}`}
              onClick={() => onOpenPost(index)}
            >
              {slide.video ? (
                <video src={slide.video} muted playsInline preload="metadata" />
              ) : (
                <img src={slide.photo} alt={slide.testimonial || `${company.name} photo ${index + 1}`} />
              )}
              {slide.video ? <span className="reel-mark">Reel</span> : null}
            </button>
          ))
        ) : (
          <p className="empty-note gallery-empty">No photos on this profile yet.</p>
        )}
      </div>
      <div className="public-comments">
        <h4>Comments</h4>
        {slides.map((slide, index) => (
          <div key={`${company.id}-thread-${index}`} className="public-post-comments">
            <button type="button" className="text-back" onClick={() => onOpenPost(index)}>
              {slide.testimonial ? slide.testimonial.slice(0, 72) : `Post ${index + 1}`}
            </button>
            <CommentThread
              targetId={`photo:${company.id}:${index}`}
              comments={comments}
              viewer={viewer}
              onAdd={onAddComment}
              onReply={onReplyComment}
              onNeedAccount={onNeedAccount}
            />
          </div>
        ))}
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
  const [online, setOnline] = useState(() => readOnline())
  const [offlineNotice, setOfflineNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mallQuery, setMallQuery] = useState('')
  const [homeQuery, setHomeQuery] = useState('')
  const [comments, setComments] = useState(() => {
    if (typeof window === 'undefined') return { ...DEMO_COMMENTS }
    try {
      return withDemoComments(JSON.parse(window.localStorage.getItem(COMMENTS_KEY) || '{}'))
    } catch {
      return { ...DEMO_COMMENTS }
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
  const [fabPlan, setFabPlan] = useState('month')
  const [dashCursor, setDashCursor] = useState(0)
  const [drawingDraft, setDrawingDraft] = useState(emptyDrawingDraft)
  const [fabPricing, setFabPricing] = useState(loadFabPricing)
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
  const drawingInputRef = useRef(null)
  const skipPushRef = useRef(false)
  const lastPathRef = useRef(readHashPath())
  const findCompanyRef = useRef(() => null)
  const [shopItemDraft, setShopItemDraft] = useState({ name: '', price: '', photo: '', description: '' })

  useEffect(() => {
    setAccounts((previous) => withOwnerLogin(previous))
  }, [])

  useEffect(() => {
    if (profileTab === 'buy') setProfileTab('gallery')
  }, [profileTab])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(accounts))
    } catch {
      /* Photos stay on this session if the phone storage is full. */
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
    const goOnline = () => {
      setOnline(true)
      setOfflineNotice('')
    }
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const requireOnline = (action = NETWORK_ACTIONS.post) => {
    if (online || readOnline()) return true
    setOfflineNotice(offlineActionMessage(action))
    setMenuOpen(false)
    return false
  }

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
          const latest = slides[0]

          return {
            id: site.id,
            name: site.name,
            category: site.type || 'Business',
            shelf: site.shelf || 'New companies',
            rating: 5,
            hue: accountIndex % 2 === 0 ? '#ff7b54' : '#51b6a0',
            location: 'On Fortress',
            about: site.testimonial || `${site.name} keeps its site photos on this card.`,
            slides,
            featured: slides.some((slide) => slide.photo || slide.video),
            video: latest?.video || '',
            videoCaption: latest?.video ? latest.testimonial : '',
            isShop: Boolean(site.isShop && site.systemType === 'retail'),
            slug: site.slug,
            link: site.link,
            systemType: site.systemType,
            items: site.items || [],
            cover: latest?.photo || site.profilePhoto || '',
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
    if (replace) history.replaceState({ fortress: true, path: next }, '', url)
    else history.pushState({ fortress: true, path: next }, '', url)
  }

  const navigateApp = (path, { replace = false } = {}) => {
    const next = path.startsWith('/') ? path : `/${path}`
    const parsed = parseHashPath(next, findCompanyRef.current)
    skipPushRef.current = true
    setTab(parsed.tab)
    if (parsed.tab === 'settings') setSettingsView(parsed.settingsView)
    else if (parsed.route?.kind !== 'calc') setSettingsView('home')
    setOverlay(parsed.overlay)
    setAppRoute(parsed.route)
    pushPath(next, { replace })
  }

  const goSettingsView = (view, { replace = false } = {}) => {
    setSettingsView(view)
    pushPath(!view || view === 'home' ? '/settings' : `/settings/${view}`, { replace })
  }

  const shopProfile =
    signedInAccount?.websites.find((site) => site.isShop && site.systemType === 'retail') || null
  const privateSystems = (signedInAccount?.websites || []).filter((site) =>
    ['construction', 'manufacturing', 'retail', 'fabrication'].includes(site.systemType),
  )
  const dashSite = privateSystems[dashCursor % Math.max(privateSystems.length, 1)] || null
  const canSwitchDash =
    privateSystems.some((site) => site.systemType === 'retail') &&
    privateSystems.some((site) => site.systemType === 'construction' || site.systemType === 'manufacturing')

  const mallProducts = useMemo(() => {
    const needle = mallQuery.trim().toLowerCase()
    const userShops = builtCards.filter((company) => company.isShop)
    const source = [...mallCatalog, ...userShops]
    const products = source.flatMap((shop) =>
      (shop.items || []).map((item) => ({
        ...item,
        shopId: shop.id,
        shopName: shop.name,
        shop,
      })),
    )
    if (!needle) return products
    return products.filter((product) =>
      `${product.name} ${product.shopName} ${product.description || ''} ${product.price}`
        .toLowerCase()
        .includes(needle),
    )
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
      (company) => company.featured && !catalog.some((item) => item.id === company.id),
    )
    const showcase = catalog.filter((company) => company.showOnGrid)
    const rest = catalog.filter((company) => company.shelf !== 'Best selling' && !company.showOnGrid)
    return [...showcase, ...rest, ...extras].filter((company) => companyMatchesQuery(company, homeQuery))
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
    const existing = accounts.find((account) => account.email.toLowerCase() === email.toLowerCase())
    if (!existing || existing.password !== password) {
      setAuthError('That email or password does not match an account.')
      return
    }
    finishLogin(existing)
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
      if (existing.password !== password) {
        setAuthError('That email or password does not match an account.')
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
    if (!requireOnline(NETWORK_ACTIONS.pay)) {
      setPaymentNote(offlineActionMessage(NETWORK_ACTIONS.pay))
      return
    }
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
    const isFabrication = type.id === 'fabrication'
    const plan = FAB_PLANS.find((item) => item.id === fabPlan) || FAB_PLANS[1]
    const slides = type.id === 'construction' || type.id === 'manufacturing' ? type.slides : []
    const [first, ...rest] = slides
    const slug = uniqueSlug(name, accounts)
    const site = makeWebsite({
      name,
      type: type.label,
      systemType: type.id,
      slug,
      link: isRetailShop ? '' : siteHref(slug),
      profilePhoto: first?.photo || '',
      testimonial: first?.testimonial || type.how,
      gallery: rest.map((slide) => slide.photo).filter(Boolean),
      photoCaptions: rest.map((slide) => slide.testimonial),
      slides,
      isShop: isRetailShop,
      items: [],
      brandName: name,
      cssName: slugify(name).replace(/-/g, ''),
      fabPlan: isFabrication ? plan.id : '',
      paidUntil: isFabrication ? Date.now() + plan.days * 86400000 : 0,
      drawings: [],
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
    setProfileTab(isRetailShop ? 'store' : isFabrication ? 'dash' : 'dash')
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
    video: '',
    caption: '',
    shelf: '',
    feePlan: '',
    note: '',
  })

  const defaultAccountSite = (account) =>
    makeWebsite({
      name: String(account?.email || 'My company').split('@')[0] || 'My company',
      type: 'Business',
      systemType: '',
      gallery: [],
      slides: [],
    })

  const publishAccountSlide = (slide, extra = {}) => {
    if (!signedInAccount) return false
    let publishedId = ''
    setAccounts((previous) =>
      previous.map((account) => {
        if (account.id !== signedInAccount.id) return account
        const websites = account.websites?.length ? [...account.websites] : [defaultAccountSite(account)]
        const currentId = activeProfileId || websites[0]?.id
        const index = Math.max(
          0,
          websites.findIndex((site) => site.id === currentId),
        )
        const site = websites[index]
        publishedId = site.id
        const caption = slide.testimonial || ''
        websites[index] = {
          ...site,
          ...extra,
          slides: [slide, ...(site.slides || [])],
          gallery: slide.photo || slide.video ? [slide.photo || slide.video, ...(site.gallery || [])] : site.gallery || [],
          photoCaptions: slide.photo || slide.video ? [caption, ...(site.photoCaptions || [])] : site.photoCaptions || [],
          testimonial: caption || site.testimonial,
        }
        return { ...account, websites }
      }),
    )
    if (publishedId) setActiveProfileId(publishedId)
    return true
  }

  const openAddMedia = () => {
    if (!requireOnline(NETWORK_ACTIONS.post)) return
    setCompose(emptyCompose())
    setOverlay({ type: 'add-media' })
    pushPath('/profile/add')
  }

  const pickComposeFile = (mode) => {
    if (!requireOnline(NETWORK_ACTIONS.post)) return
    composeModeRef.current = mode
    setCompose({ ...emptyCompose(), mode })
    composeInputRef.current?.click()
  }

  const handleComposeFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    const mode = composeModeRef.current
    if (!file || !mode) return
    try {
      const media = await readMediaFile(file)
      setCompose({
        ...emptyCompose(),
        mode,
        photo: media.kind === 'photo' ? media.src : '',
        video: media.kind === 'video' ? media.src : '',
      })
      setOverlay({ type: 'compose' })
      pushPath('/profile/compose')
    } catch (error) {
      setCompose({
        ...emptyCompose(),
        mode,
        note: error?.message || 'Could not read that photo or video.',
      })
      setOverlay({ type: 'compose' })
      pushPath('/profile/compose')
    }
  }

  const composeSlide = () => {
    const caption = compose.caption.trim()
    if (compose.video) {
      return {
        video: compose.video,
        photo: '',
        testimonial: caption || 'Video from the company card.',
        shelf: compose.shelf || '',
        feePlan: compose.feePlan || '',
      }
    }
    if (!compose.photo) return null
    return {
      photo: compose.photo,
      testimonial: caption || 'Photo from the company card.',
      shelf: compose.shelf || '',
      feePlan: compose.feePlan || '',
    }
  }

  const publishFeaturePost = () => {
    const slide = composeSlide()
    if (!slide) return
    publishAccountSlide({
      ...slide,
      shelf: compose.shelf || 'New companies',
    })
    setCompose(emptyCompose())
    setOverlay(null)
    setProfileTab('gallery')
    setTab('profile')
    pushPath('/profile')
  }

  const submitCompose = (event) => {
    event.preventDefault()
    if (!requireOnline(NETWORK_ACTIONS.post)) {
      setCompose((previous) => ({ ...previous, note: offlineActionMessage(NETWORK_ACTIONS.post) }))
      return
    }
    const slide = composeSlide()
    if (!slide) {
      setCompose((previous) => ({
        ...previous,
        note: previous.note || 'Choose a photo or video from your gallery.',
      }))
      return
    }

    if (compose.mode === 'gallery') {
      publishAccountSlide({
        ...slide,
        testimonial: compose.caption.trim() || slide.testimonial,
      })
      setCompose(emptyCompose())
      setOverlay(null)
      setProfileTab('gallery')
      setTab('profile')
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
    if (!requireOnline(NETWORK_ACTIONS.pay)) {
      setPaymentNote(offlineActionMessage(NETWORK_ACTIONS.pay))
      return
    }
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
    if (nextTab === 'calc') {
      openCalc()
      return
    }
    if (nextTab === 'buy') {
      openBuyWebsite()
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

  const openGallery = (company, mediaSrc) => {
    const source =
      catalog.find((item) => item.id === company.id || item.name === company.name) || company
    const opened = withVideoSlides(source)
    const startIndex = opened.slides?.findIndex((slide) => slide.photo === mediaSrc || slide.video === mediaSrc)
    setOverlay({
      type: 'gallery',
      company: opened,
      postIndex: startIndex >= 0 ? startIndex : 0,
    })
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
    const slides = gallerySlides(currentProfile)
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

  const openMallProduct = (product) => {
    setOverlay({ type: 'product', company: product.shop, item: product })
    pushPath(`/mall/item/${encodeId(product.shopId)}/${encodeId(product.id)}`)
  }

  const viewCompanyProfile = (company) => {
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
    setMenuOpen(false)
    if (typeId === 'fabrication') {
      openCalc()
      return
    }
    setTab('settings')
    goSettingsView('preview')
  }

  const continuePreview = () => {
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
    navigateApp(isRetailShop ? `/shop/${slug}` : `/site/${slug}`)
  }

  const updateWebsite = (siteId, updates) => {
    if (!signedInAccount || !siteId) return
    setAccounts((previous) =>
      previous.map((account) => {
        if (account.id !== signedInAccount.id) return account
        return {
          ...account,
          websites: account.websites.map((site) => (site.id === siteId ? { ...site, ...updates } : site)),
        }
      }),
    )
  }

  const openPrivateSystem = (site) => {
    if (!site) return
    setOverlay(null)
    if (site.systemType === 'retail' || site.isShop) {
      setActiveProfileId(site.id)
      setProfileTab('store')
      setTab('profile')
      setAppRoute({ kind: '', slug: '' })
      pushPath('/profile')
      return
    }
    openGeneratedSite(site)
  }

  const openBuyWebsite = () => {
    if (!requireOnline(NETWORK_ACTIONS.buy)) return
    setOverlay(null)
    setMenuOpen(false)
    if (!signedInAccount) {
      goLogin()
      return
    }
    openSettingsPage('system')
  }

  const handleDrawingFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const photo = await readFileAsDataUrl(file)
    setDrawingDraft((previous) => ({ ...previous, photo }))
  }

  const openCalc = (site) => {
    setOverlay(null)
    setMenuOpen(false)
    setDrawingDraft(emptyDrawingDraft())
    if (site?.slug) {
      navigateApp(`/site/${site.slug}`)
      return
    }
    navigateApp('/calc')
  }

  const saveDrawing = (site) => {
    const quote = fabQuote(drawingDraft, fabPricing)
    if (!site?.id || !quote) return
    const drawing = {
      id: makeId('draw'),
      name: drawingDraft.name.trim() || quote.title,
      gateType: drawingDraft.gateType,
      design: drawingDraft.design,
      width: Number(drawingDraft.width),
      height: Number(drawingDraft.height),
      length: quote.L,
      materials: quote.materials,
      labour: quote.labour,
      consumables: quote.consumables,
      margin: quote.margin,
      quote: quote.total,
      at: Date.now(),
    }
    updateWebsite(site.id, { drawings: [drawing, ...(site.drawings || [])] })
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
    const posts = gallerySlides(currentProfile)
    const target = posts[index]
    if (!target) return
    const src = target.photo || target.video
    updateCurrentWebsite({
      slides: (currentProfile.slides || []).filter(
        (slide, slideIndex) =>
          slideIndex !== index && slide.photo !== src && slide.video !== src,
      ),
      gallery: (currentProfile.gallery || []).filter((item) => item !== src),
      photoCaptions: (currentProfile.photoCaptions || []).filter((_, captionIndex) => captionIndex !== index),
      profilePhoto: currentProfile.profilePhoto === src ? '' : currentProfile.profilePhoto,
    })
    setOverlay(null)
    pushPath('/profile')
  }

  const openAddShopItem = () => {
    if (!requireOnline(NETWORK_ACTIONS.shop)) return
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
    if (!requireOnline(NETWORK_ACTIONS.shop)) return
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

  const calcSite =
    publishedSite?.systemType === 'fabrication'
      ? publishedSite
      : signedInAccount?.websites.find((item) => item.systemType === 'fabrication') || {
          id: '',
          name: 'Fabrication calculator',
          drawings: [],
        }

  const openFabPay = (planId) => {
    if (!requireOnline(NETWORK_ACTIONS.buy)) return
    setSystemType('fabrication')
    setFabPlan(planId || 'month')
    setAppRoute({ kind: '', slug: '' })
    setTab('settings')
    goSettingsView('preview')
  }

  if (appRoute.kind === 'calc' || publishedSite?.systemType === 'fabrication') {
    return (
      <FabricationCalculator
        site={calcSite}
        draft={drawingDraft}
        onChange={setDrawingDraft}
        onSave={calcSite.id ? () => saveDrawing(calcSite) : undefined}
        onRenew={openFabPay}
        onBack={leavePublished}
        pricing={fabPricing}
        routePanel={appRoute.panel || 'home'}
        onNavigate={navigateApp}
        onSavePricing={(next) => {
          const merged = { ...emptyFabPricing(), ...next }
          delete merged.visionApiKey
          setFabPricing(merged)
          try {
            window.localStorage.setItem(PRICING_KEY, JSON.stringify(merged))
          } catch {
            /* ignore */
          }
        }}
      />
    )
  }

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
    if (publishedSite?.systemType === 'construction' || publishedSite?.systemType === 'manufacturing') {
      return (
        <CeoDashboard
          site={publishedSite}
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
            <div className="title-lead">
              <HistoryNav />
              <div>
                <p className="eyebrow">Run sites from phone{online ? '' : ' · offline'}</p>
                <h1>Fortress</h1>
              </div>
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
                      active={item.id === 'calc' ? appRoute.kind === 'calc' : tab === item.id}
                      onSelect={goTab}
                      className={`${
                        (item.id === 'calc' ? appRoute.kind === 'calc' : tab === item.id) ? 'menu-link active' : 'menu-link'
                      }${item.id === 'logout' ? ' logout-link' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {!online || offlineNotice ? (
          <div className="app-offline-banner" role="status">
            <p>
              {!online
                ? 'Offline mode — browse saved posts, sites, drawings, and quotes from this phone. Upload posts, new drawings, or buy a system when you reconnect.'
                : offlineNotice}
            </p>
            {offlineNotice ? (
              <button type="button" className="text-back" onClick={() => setOfflineNotice('')}>
                Dismiss
              </button>
            ) : null}
          </div>
        ) : null}

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
                <div className="home-grid" aria-label="Company reels and testimonials">
                  {homeGridCards.flatMap((company, index) => {
                    const tiles = [
                      <HomeTile key={company.id} company={company} onOpen={openGallery} />,
                    ]
                    if ((index + 1) % 6 === 0) {
                      const ad = HOME_ADS[Math.floor(index / 6) % HOME_ADS.length]
                      tiles.push(
                        <button
                          key={ad.id + index}
                          type="button"
                          className="home-ad"
                          onClick={() => (ad.id === 'ad-fab' ? openCalc() : openBuyWebsite())}
                        >
                          <span>{ad.kicker}</span>
                          <strong>{ad.title}</strong>
                          <small>{ad.copy}</small>
                        </button>,
                      )
                    }
                    return tiles
                  })}
                </div>
              ) : null}
            </div>
          )}

          {tab === 'login' && (
            <section className="panel-box settings-page">
              <form className="create-account-form" onSubmit={handleLogin}>
                <h3>Login</h3>
                <p className="shop-copy">Enter your account email and password.</p>
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
                </div>

                <div className="profile-copy">
                  <h3>{currentProfile?.name || 'My account'}</h3>
                  <p>{signedInAccount.email}</p>
                </div>
              </div>

              {privateSystems.length ? (
                privateSystems.map((site, index) => (
                  <button
                    key={site.id}
                    type="button"
                    className="profile-live-link"
                    onClick={() => openPrivateSystem(site)}
                  >
                    {index + 1}) {liveDomain(site)}
                  </button>
                ))
              ) : (
                <p className="profile-live-link muted">
                  Your private system link appears here after you buy a website. Other people cannot see it.
                </p>
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

              <div className={`ig-tabs${privateSystems.length ? ' has-dash' : ''}`} role="tablist" aria-label="Profile sections">
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
                  aria-selected={profileTab === 'dash'}
                  className={profileTab === 'dash' ? 'ig-tab active' : 'ig-tab'}
                  onClick={() => setProfileTab('dash')}
                  aria-label="CEO dashboards"
                >
                  <IconCompanyTab />
                </button>
              </div>

              {profileTab === 'gallery' && (
                <div className="gallery-grid">
                  {gallerySlides(currentProfile).length ? (
                    gallerySlides(currentProfile).map((slide, index) => (
                      <div className="gallery-tile-wrap" key={`${slide.video || slide.photo || 'post'}-${index}`}>
                        <button
                          type="button"
                          className={`gallery-tile${slide.video ? ' is-reel' : ''}`}
                          onClick={() => openOwnGalleryPost(index)}
                        >
                          {slide.video ? (
                            <video src={slide.video} muted playsInline preload="metadata" />
                          ) : (
                            <img src={slide.photo} alt={slide.testimonial || `Gallery ${index + 1}`} />
                          )}
                          {slide.video ? <span className="reel-mark">Reel</span> : null}
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
                    <p className="empty-note gallery-empty">Tap + to add a photo or video from your gallery.</p>
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

              {profileTab === 'dash' && (
                <div className="profile-tab-panel">
                  {dashSite ? (
                    <>
                      <div className="dash-switch">
                        <button
                          type="button"
                          className="card-arrow left"
                          aria-label="Previous company dashboard"
                          disabled={!canSwitchDash && privateSystems.length < 2}
                          onClick={() =>
                            setDashCursor((current) => (current - 1 + privateSystems.length) % privateSystems.length)
                          }
                        >
                          ‹
                        </button>
                        <div>
                          <strong>{dashSite.name}</strong>
                          <p>{dashSite.systemType}</p>
                        </div>
                        <button
                          type="button"
                          className="card-arrow right"
                          aria-label="Next company dashboard"
                          disabled={!canSwitchDash && privateSystems.length < 2}
                          onClick={() => setDashCursor((current) => (current + 1) % privateSystems.length)}
                        >
                          ›
                        </button>
                      </div>
                      {dashSite.systemType === 'fabrication' ? (
                        <div className="ceo-embedded">
                          <p className="shop-copy">
                            The fabrication calculator is its own webpage. Choose a gate, enter size, and quote it there.
                          </p>
                          <button type="button" className="primary-button" onClick={() => openCalc(dashSite)}>
                            Open calculator
                          </button>
                        </div>
                      ) : dashSite.systemType === 'retail' ? (
                        <div className="ceo-embedded">
                          <p className="shop-copy">
                            Shop control stays inside Fortress. Items you price here show on the online mall.
                          </p>
                          <button type="button" className="primary-button" onClick={() => setProfileTab('store')}>
                            Open shop control
                          </button>
                        </div>
                      ) : (
                        <CeoDashboard site={dashSite} embedded />
                      )}
                    </>
                  ) : (
                    <p className="empty-note">Buy a website to open the CEO dashboard.</p>
                  )}
                  <input ref={drawingInputRef} type="file" accept="image/*" hidden onChange={handleDrawingFile} />
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
              <button type="button" className="buy-website-btn" onClick={() => goSettingsView('system')}>
                Buy website
              </button>
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
                          if (!requireOnline(NETWORK_ACTIONS.buy)) return
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
                        <small>{type.style}</small>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="text-back" onClick={cancelPendingSignup}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h3>Buy a website</h3>
                  <p className="shop-copy">
                    Choose construction, manufacturing, a shop inside Fortress, or the fabrication calculator.
                    Swipe the pictures to see how that website solves problems at that kind of company.
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
                        <small>{type.style}</small>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {tab === 'settings' && settingsView === 'system' && (
            <section className="panel-box settings-page">
              <button
                type="button"
                className="text-back"
                onClick={() => goSettingsView(pendingSignup ? 'buy' : 'home')}
              >
                Back
              </button>
              <h3>Buy a website</h3>
              <p className="shop-copy">
                Choose a type, then swipe the pictures. Each picture explains how that website solves problems at that kind of company.
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
                    <small>{type.style}</small>
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

          {tab === 'settings' && settingsView === 'preview' && chosenSystem && (
            <section className="panel-box settings-page">
              <button type="button" className="text-back" onClick={() => goSettingsView('system')}>
                Back
              </button>
              <h3>{chosenSystem.label}</h3>
              <p className="eyebrow">{chosenSystem.style}</p>
              <SystemExplainCards system={chosenSystem} />
              {chosenSystem.id === 'fabrication' && (
                <div className="settings-actions">
                  {FAB_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      className={fabPlan === plan.id ? 'system-choice active' : 'system-choice'}
                      onClick={() => setFabPlan(plan.id)}
                    >
                      {plan.label}
                      <small>{formatPrice(plan.price)}</small>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="primary-button" onClick={continuePreview}>
                Continue to EcoCash
              </button>
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
              <form className={`ecocash-card${!PHASE1_COMPLETE ? ' is-sealed' : ''}`} onSubmit={approvePayment}>
                {!PHASE1_COMPLETE ? (
                  <PhaseSeal kicker="Waterproof lock" title="Phase 2 is locked" message={PHASE1_ECOCASH_NOTE} />
                ) : null}
                <p className="ecocash-kicker">EcoCash</p>
                <h3>{chosenSystem ? chosenSystem.label : 'Fortress system'}</h3>
                {systemType === 'fabrication' ? (
                  <p className="shop-copy">
                    {formatPrice((FAB_PLANS.find((plan) => plan.id === fabPlan) || FAB_PLANS[1]).price)} ·{' '}
                    {(FAB_PLANS.find((plan) => plan.id === fabPlan) || FAB_PLANS[1]).label}
                  </p>
                ) : null}
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
                  {systemType === 'fabrication'
                    ? 'Name on the calculator'
                    : systemType === 'retail' || shopFlowRef.current
                      ? 'Name of shop'
                      : 'Name of website'}
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
                  {systemType === 'fabrication'
                    ? 'Open calculator'
                    : systemType === 'retail' || shopFlowRef.current
                      ? 'Create shop'
                      : 'Create website'}
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
                  placeholder="Search a product"
                  onChange={(event) => setMallQuery(event.target.value)}
                />
              </form>
              <div className="mall-product-grid">
                {mallProducts.map((product) => (
                  <button
                    key={`${product.shopId}-${product.id}`}
                    type="button"
                    className="mall-product-card"
                    onClick={() => openMallProduct(product)}
                  >
                    {product.photo ? (
                      <img src={product.photo} alt="" />
                    ) : (
                      <span className="mall-item-fallback">{product.name.slice(0, 1)}</span>
                    )}
                    <div className="mall-product-copy">
                      <strong>{product.name}</strong>
                      <span>{formatPrice(product.price)}</span>
                      <small>{product.shopName}</small>
                      {product.description ? <p>{product.description}</p> : null}
                    </div>
                  </button>
                ))}
              </div>
              {!mallProducts.length && (
                <p className="empty-note">
                  {mallQuery.trim()
                    ? 'No products match that search.'
                    : 'Products appear here from shops on Fortress.'}
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

        {overlay?.type === 'product' && overlay.item && (
          <MallProductSheet
            product={overlay.item}
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
            startIndex={overlay.postIndex || 0}
            onClose={closeOverlay}
            onViewProfile={() => viewCompanyProfile(overlayCompany)}
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
            comments={comments}
            onClose={closeOverlay}
            onOpenPost={(index) => openCompanyPost(overlayCompany, index)}
            onOpenPhoto={() => openCompanyPost(overlayCompany, 'avatar')}
            viewer={signedInAccount}
            onAddComment={addComment}
            onReplyComment={replyToComment}
            onNeedAccount={needAccountForComment}
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
                Construction, manufacturing, a shop inside Fortress, or the fabrication calculator.
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
                    <small>{type.style}</small>
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
              <p className="live-link-url">{liveDomain(overlay.site || currentProfile)}</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => openPrivateSystem(overlay.site || currentProfile)}
              >
                Open
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
                <span>Pick a photo or video from your phone. It goes on your Fortress gallery and this company’s home card.</span>
              </button>
              <button type="button" className="add-media-option" onClick={() => pickComposeFile('feature')}>
                <strong>Feature post</strong>
                <span>The same photo or video posts to your gallery and as a new picture on the home-page company card.</span>
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
            <form className={`add-media-card ecocash-card${!PHASE1_COMPLETE ? ' is-sealed' : ''}`} onSubmit={submitFeatureEcoCash}>
              {!PHASE1_COMPLETE ? (
                <PhaseSeal kicker="Waterproof lock" title="Phase 2 is locked" message={PHASE1_ECOCASH_NOTE} />
              ) : null}
              <p className="ecocash-kicker">EcoCash</p>
              <h2>Best selling exclusive</h2>
              <p className="shop-copy">
                {compose.feePlan === 'month' ? '$20/month' : '$200/year'} for the Best selling card.
              </p>
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
              {compose.video ? (
                <video className="compose-preview" src={compose.video} controls playsInline />
              ) : compose.photo ? (
                <img className="compose-preview" src={compose.photo} alt="" />
              ) : null}
              {compose.note ? <p className="form-error">{compose.note}</p> : null}
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
                  (!compose.photo && !compose.video) ||
                  (compose.mode === 'feature' &&
                    (!compose.shelf || (compose.shelf === 'Best selling' && !compose.feePlan)))
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
              ref={composeInputRef}
              type="file"
              accept="image/*,video/*,.mp4,.mov,.webm,.m4v"
              className="file-input-hidden"
              onChange={handleComposeFile}
            />
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
