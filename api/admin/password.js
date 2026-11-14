const { authed, setStoredAdmin } = require('../_lib');
// POST /api/admin/password  body: { password }  (caller must already be logged in with the current password)
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  const pw = String((req.body && req.body.password) || '');
  if (pw.length < 12) return res.status(400).json({ error: 'Password must be at least 12 characters.' });
  if (pw.length > 200) return res.status(400).json({ error: 'Password is too long.' });
  try {
    await setStoredAdmin(pw);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};
