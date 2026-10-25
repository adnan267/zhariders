const { redis, authed } = require('../_lib');
module.exports = async (req, res) => {
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set' });
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const [flat] = await redis([['HGETALL', 'zha:bookings']]);
    const list = [];
    for (let i = 1; i < (flat || []).length; i += 2) list.push(JSON.parse(flat[i]));
    list.sort((a, b) => b.created.localeCompare(a.created));
    res.status(200).json(list);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};
