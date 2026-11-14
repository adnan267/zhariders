const { authed, getConfig, saveSection } = require('../_lib');
module.exports = async (req, res) => {
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  try {
    if (req.method === 'GET') return res.status(200).json(await getConfig());
    if (req.method === 'PUT') {
      const b = req.body || {};
      if (!['seo', 'services', 'packages', 'rates'].includes(b.section)) return res.status(400).json({ error: 'Bad section' });
      return res.status(200).json({ ok: true, data: await saveSection(b.section, b.data) });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { console.error(e); res.status(400).json({ error: 'Could not save' }); }
};
