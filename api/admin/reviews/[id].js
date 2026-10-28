const { redis, authed } = require('../../_lib');
module.exports = async (req, res) => {
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  const id = String(req.query.id || '');
  if (!/^[\w-]{10,60}$/.test(id)) return res.status(400).json({ error: 'Bad id' });
  try {
    if (req.method === 'DELETE') { await redis([['HDEL', 'zha:reviews', id]]); return res.status(200).json({ ok: true }); }
    if (req.method === 'PATCH') {
      const s = req.body && req.body.status;
      if (!['pending', 'approved', 'hidden'].includes(s)) return res.status(400).json({ error: 'Bad status' });
      const [raw] = await redis([['HGET', 'zha:reviews', id]]);
      if (!raw) return res.status(404).json({ error: 'Not found' });
      const r = JSON.parse(raw); r.status = s;
      await redis([['HSET', 'zha:reviews', id, JSON.stringify(r)]]);
      return res.status(200).json(r);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};
