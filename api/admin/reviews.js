const { redis, authed, clean, crypto } = require('../_lib');
module.exports = async (req, res) => {
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  try {
    if (req.method === 'GET') {
      const [flat] = await redis([['HGETALL', 'zha:reviews']]);
      const list = [];
      for (let i = 1; i < (flat || []).length; i += 2) list.push(JSON.parse(flat[i]));
      list.sort((a, b) => b.created.localeCompare(a.created));
      return res.status(200).json(list);
    }
    if (req.method === 'POST') { // admin adds a review (e.g. one received on WhatsApp), published at once
      const d = req.body || {}, text = clean(d.text, 400);
      if (text.length < 10) return res.status(400).json({ error: 'Review is too short.' });
      const rec = { id: crypto.randomUUID(), name: clean(d.name, 60) || 'Guest', rating: Math.min(5, Math.max(1, parseInt(d.rating, 10) || 5)), text, status: 'approved', created: new Date().toISOString() };
      await redis([['HSET', 'zha:reviews', rec.id, JSON.stringify(rec)]]);
      return res.status(201).json(rec);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};
