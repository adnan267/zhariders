const { redis, authed, STATUS } = require('../../_lib');
module.exports = async (req, res) => {
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  const id = String(req.query.id || '');
  if (!/^[\w-]{10,60}$/.test(id)) return res.status(400).json({ error: 'Bad id' });
  try {
    if (req.method === 'DELETE') { await redis([['HDEL', 'zha:bookings', id]]); return res.status(200).json({ ok: true }); }
    if (req.method === 'PATCH') {
      const s = req.body && req.body.status;
      if (!STATUS.includes(s)) return res.status(400).json({ error: 'Bad status' });
      const [raw] = await redis([['HGET', 'zha:bookings', id]]);
      if (!raw) return res.status(404).json({ error: 'Not found' });
      const b = JSON.parse(raw); b.status = s;
      await redis([['HSET', 'zha:bookings', id, JSON.stringify(b)]]);
      return res.status(200).json(b);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};
