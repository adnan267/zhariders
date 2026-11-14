const { redis, clean, crypto, notify, sendEmail, emailHtml } = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const key = 'zha:rl:' + ip;
    const [n] = await redis([['INCR', key], ['EXPIRE', key, 3600, 'NX']]);
    if (n > 10) return res.status(429).json({ error: 'Too many requests. Please use WhatsApp.' });
    const d = (req.body && typeof req.body === 'object') ? req.body : {};
    const trip = d.trip === 'return' ? 'return' : 'oneway';
    const b = { pickup: clean(d.pickup, 80), dropoff: clean(d.dropoff, 80), date: clean(d.date, 10), time: clean(d.time, 5),
      trip, rdate: trip === 'return' ? clean(d.rdate, 10) : '', rtime: trip === 'return' ? clean(d.rtime, 5) : '',
      flight: clean(d.flight, 15), name: clean(d.name, 80), phone: clean(d.phone, 30), passengers: clean(d.passengers, 10),
      vehicle: clean(d.vehicle, 40), notes: clean(d.notes, 300) };
    const okDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s);
    if (!b.pickup || !b.dropoff || !okDate(b.date) || !/^\d{2}:\d{2}$/.test(b.time) || (trip === 'return' && !okDate(b.rdate)))
      return res.status(400).json({ error: 'Pickup, drop-off, date and time are required.' });
    const [seq] = await redis([['INCR', 'zha:seq']]);
    const rec = Object.assign({ id: crypto.randomUUID(), ref: 'ZHA-' + (1000 + seq), status: 'new', created: new Date().toISOString() }, b);
    await redis([['HSET', 'zha:bookings', rec.id, JSON.stringify(rec)]]);
    await notify('New booking ' + rec.ref + '\n' + b.pickup + ' -> ' + b.dropoff + '\n' + b.date + ' ' + b.time +
      (trip === 'return' ? '\nReturn: ' + b.rdate + ' ' + b.rtime : '') + (b.flight ? '\nFlight: ' + b.flight : '') +
      '\n' + b.passengers + ' pax, ' + b.vehicle + '\n' + (b.name || '-') + ' ' + b.phone +
      (b.notes ? '\nNotes: ' + b.notes : '') + '\nhttps://' + req.headers.host + '/admin');
    await bookingEmail(rec, 'https://' + req.headers.host);
    return res.status(201).json({ ok: true, ref: rec.ref });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error. Please use WhatsApp.' });
  }
};

// Email to the owner for every new booking (does nothing if email is not set up)
async function bookingEmail(b, site) {
  const ph = (b.phone || '').replace(/\D/g, '');
  const wa = ph ? 'https://wa.me/' + ph + '?text=' + encodeURIComponent('Assalamu Alaikum, ZHA Riders Makkah here. Regarding your booking ' + b.ref + ' (' + b.pickup + ' to ' + b.dropoff + ', ' + b.date + ' ' + b.time + ').') : '';
  const rows = [['Reference', b.ref], ['Trip', b.pickup + ' → ' + b.dropoff], ['Date & time', b.date + '  ' + b.time],
    ['Return', b.trip === 'return' ? (b.rdate + '  ' + b.rtime).trim() : 'One way'], ['Flight', b.flight],
    ['Passengers', b.passengers], ['Vehicle', b.vehicle], ['Name', b.name || '-'], ['Phone', b.phone || '-'], ['Notes', b.notes]];
  const buttons = [['Open admin panel', site + '/admin#bookings']];
  if (wa) buttons.unshift(['WhatsApp customer', wa, '#25d366']);
  const text = rows.filter(r => r[1]).map(r => r[0] + ': ' + r[1]).join('\n') + '\n\n' + site + '/admin';
  await sendEmail('New booking ' + b.ref + ': ' + b.pickup + ' → ' + b.dropoff + ' (' + b.date + ' ' + b.time + ')',
    emailHtml('New booking request', 'A customer sent a booking from the website.', rows, buttons), text);
}
