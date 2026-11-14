const { authed, verifyPassword, setPassword } = require('../_lib');
module.exports = async (req, res) => {
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const b = req.body || {}, next = String(b.next || '');
    if (!(await verifyPassword(String(b.current || '')))) return res.status(403).json({ error: 'Current password is wrong.' });
    if (next.length < 10) return res.status(400).json({ error: 'New password must be at least 10 characters.' });
    await setPassword(next);
    res.status(200).json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};
