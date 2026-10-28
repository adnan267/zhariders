// Site content (services, ziyarat tours, routes, rates, fleet). Stored in Redis as one JSON document.
// Files starting with "_" are not exposed as routes by Vercel.
const clean = (v, n) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n);

// Field list per collection: [name, max length | 'num' | 'lines']. The first field is required.
const SHAPE = {
  services: [['title', 60], ['desc', 300], ['emoji', 8], ['image', 120]],
  ziyarat:  [['title', 60], ['from', 'num'], ['emoji', 8], ['image', 120], ['desc', 300], ['points', 'lines']],
  routes:   [['from', 40], ['to', 40], ['price', 'num'], ['emoji', 8], ['image', 120]],
  rates:    [['route', 80], ['sedan', 'num'], ['suv', 'num'], ['staria', 'num'], ['hiace', 'num']],
  fleet:    [['name', 60], ['desc', 200], ['emoji', 8], ['image', 120]]
};
const MAX_ITEMS = 30;

function defaults() {
  const pts = ['Driver explains every location', 'Private family tours available', 'Pickup and drop-off included', 'Clean and comfortable vehicle'];
  const rate = (route, a, b, c, d) => ({ route, sedan: a ?? '', suv: b ?? '', staria: c ?? '', hiace: d ?? '', visible: true });
  return {
    settings: { hero: '/images/hero.jpg' },
    services: [
      { title: 'Airport Transfers', desc: 'Hassle-free pickups and drop-offs from Jeddah Airport.', emoji: '✈️', image: '/images/service-airport.jpg', visible: true },
      { title: 'Umrah & Hotel Transfers', desc: 'Comfortable transfers to and from your hotel and Masjid.', emoji: '🕋', image: '/images/service-umrah.jpg', visible: true },
      { title: 'Makkah Ziyarat', desc: 'Explore the holy sites of Makkah with ease.', emoji: '🕌', image: '/images/service-ziyarat.jpg', visible: true },
      { title: 'Makkah-Madinah Intercity', desc: 'Safe and comfortable travel between the two cities.', emoji: '🛣️', image: '/images/service-intercity.jpg', visible: true }
    ],
    ziyarat: [
      { title: 'Makkah Ziyarat', from: 160, emoji: '🕋', image: '/images/ziyarat-makkah.jpg', desc: 'Visit the important Islamic landmarks of Makkah.', points: pts, visible: true },
      { title: 'Madinah Ziyarat', from: 160, emoji: '🕌', image: '/images/ziyarat-madinah.jpg', desc: 'Visit the important Islamic landmarks of Madinah.', points: pts, visible: true },
      { title: 'Badr Ziyarat', from: '', emoji: '🌄', image: '/images/ziyarat-badr.jpg', desc: 'Visit Badr, the site of the famous Battle of Badr.', points: pts, visible: true }
    ],
    routes: [
      { from: 'Jeddah Airport', to: 'Makkah', price: 200, emoji: '✈️', image: '/images/route-jeddah-makkah.jpg', visible: true },
      { from: 'Makkah', to: 'Madinah', price: 350, emoji: '🕌', image: '/images/route-makkah-madinah.jpg', visible: true },
      { from: 'Madinah', to: 'Jeddah Airport', price: '', emoji: '🛣️', image: '/images/route-madinah-jeddah.jpg', visible: true },
      { from: 'Makkah', to: 'Ziyarat Tour', price: 160, emoji: '🕋', image: '/images/route-ziyarat.jpg', visible: true }
    ],
    rates: [
      rate('Jeddah Airport → Makkah', 200, 400, 280, 300),
      rate('Makkah → Jeddah Airport', 160, 320, 200, 280),
      rate('Makkah → Madinah', 350, 640, 450, 500),
      rate('Madinah → Makkah', null, null, 450, null),
      rate('Madinah Hotel → Madinah Airport', 100, 240, 150, 180),
      rate('Madinah Airport → Madinah Hotel', 150, 280, 200, 250),
      rate('Makkah Ziyarat', 160, 320, 220, 280),
      rate('Madinah Ziyarat', 160, 320, 200, 250),
      rate('Badr Ziyarat', null, null, null, null),
      rate('Taif Ziyarat / Tour', 300, 760, 350, 450),
      rate('Makkah Hotel → Miqat', 100, 240, 150, 180),
      rate('Makkah → Jeddah Tours', 280, 440, 350, 450),
      rate('Kiswa Factory + Museum Ziyarat', 200, 400, 250, 350)
    ],
    fleet: [
      { name: 'Luxury Sedan', desc: '1-3 Passengers', emoji: '🚗', image: '/images/fleet-sedan.jpg', visible: true },
      { name: 'Family Van', desc: 'Hyundai Staria, 7-9 Passengers, 9-12 Bags', emoji: '🚐', image: '/images/fleet-van.jpg', visible: true },
      { name: 'Premium SUV', desc: '4-6 Passengers', emoji: '🚙', image: '/images/fleet-suv.jpg', visible: true },
      { name: 'Group Minibus', desc: 'Toyota HiAce High Roof, up to 12 Passengers, 14 Bags', emoji: '🚌', image: '/images/fleet-minibus.jpg', visible: true }
    ]
  };
}

const num = v => {
  if (v === '' || v == null) return '';
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 && n <= 100000 ? n : '';
};
// Allowed image sources: files in public/images or images uploaded through the admin media library.
const imgPath = v => { const s = clean(v, 120); return /^\/images\/[A-Za-z0-9._\/-]+$/.test(s) || /^\/api\/img\/[a-f0-9]{24}$/.test(s) ? s : ''; };
const lines = v => (Array.isArray(v) ? v : String(v || '').split(/\n/)).map(x => clean(x, 120)).filter(Boolean).slice(0, 10);

// Accepts anything the admin page sends and returns a safe, complete document.
function sanitize(d) {
  const out = {};
  for (const k of Object.keys(SHAPE)) {
    const src = d && Array.isArray(d[k]) ? d[k].slice(0, MAX_ITEMS) : [];
    const first = SHAPE[k][0][0];
    out[k] = src.map(it => {
      const o = { visible: !!(it && it.visible) };
      for (const [f, t] of SHAPE[k]) {
        const v = it ? it[f] : '';
        if (t === 'num') o[f] = num(v);
        else if (t === 'lines') o[f] = lines(v);
        else if (f === 'image') o[f] = imgPath(v);
        else o[f] = clean(v, t);
      }
      return o;
    }).filter(o => o[first]);
  }
  const s = (d && d.settings) || {};
  out.settings = { hero: imgPath(s.hero) };
  return out;
}

module.exports = { defaults, sanitize };
