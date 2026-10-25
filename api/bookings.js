const { redis, clean, crypto } = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const key = 'zha:rl:' + ip;
    const [n] = await redis([['INCR', key], ['EXPIRE', key, 3600, 'NX']]);
    if (n > 10) return res.status(429).json({ error: 'Too many requests. Please use WhatsApp.' });
    const d = (req.body && typeof req.body === 'object') ? req.body : {};
    const b = { pickup: clean(d.pickup, 80), dropoff: clean(d.dropoff, 80), date: clean(d.date, 10),
      name: clean(d.name, 80), phone: clean(d.phone, 30), passengers: clean(d.passengers, 10),
      vehicle: clean(d.vehicle, 40), notes: clean(d.notes, 300) };
    if (!b.pickup || !b.dropoff || !/^\d{4}-\d{2}-\d{2}$/.test(b.date))
      return res.status(400).json({ error: 'Pickup, drop-off and a valid date are required.' });
    const [seq] = await redis([['INCR', 'zha:seq']]);
    const rec = Object.assign({ id: crypto.randomUUID(), ref: 'ZHA-' + (1000 + seq), status: 'new', created: new Date().toISOString() }, b);
    await redis([['HSET', 'zha:bookings', rec.id, JSON.stringify(rec)]]);
    return res.status(201).json({ ok: true, ref: rec.ref });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error. Please use WhatsApp.' });
  }
};
