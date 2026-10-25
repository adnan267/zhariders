const { redis, clean, crypto, notify } = require('./_lib');
module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const [flat] = await redis([['HGETALL', 'zha:reviews']]);
      const list = [];
      for (let i = 1; i < (flat || []).length; i += 2) { const r = JSON.parse(flat[i]); if (r.status === 'approved') list.push(r); }
      list.sort((a, b) => b.created.localeCompare(a.created));
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json(list.slice(0, 12).map(r => ({ name: r.name, rating: r.rating, text: r.text })));
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const key = 'zha:rlr:' + ip;
    const [n] = await redis([['INCR', key], ['EXPIRE', key, 3600, 'NX']]);
    if (n > 5) return res.status(429).json({ error: 'Too many requests.' });
    const d = (req.body && typeof req.body === 'object') ? req.body : {};
    const text = clean(d.text, 400);
    if (text.length < 10) return res.status(400).json({ error: 'Review is too short.' });
    const rating = Math.min(5, Math.max(1, parseInt(d.rating, 10) || 5));
    const rec = { id: crypto.randomUUID(), name: clean(d.name, 60) || 'Guest', rating, text, status: 'pending', created: new Date().toISOString() };
    await redis([['HSET', 'zha:reviews', rec.id, JSON.stringify(rec)]]);
    await notify('New review waiting for approval (' + rating + '/5)\n' + rec.name + ': ' + text + '\nhttps://' + req.headers.host + '/admin');
    return res.status(201).json({ ok: true });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Server error' }); }
};
