// Sends a test email so the owner can check that email alerts are set up.
const { authed, sendEmail, emailHtml } = require('../_lib');
module.exports = async (req, res) => {
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const r = await sendEmail('Test email from ZHA Riders admin', emailHtml('Email alerts are working', 'You will get an email like this for every new booking and new review, and a list of rides every morning.', [], []),
    'Email alerts are working.');
  return res.status(r.ok ? 200 : 400).json(r.ok ? { ok: true, to: process.env.NOTIFY_EMAIL } : { error: r.error });
};
