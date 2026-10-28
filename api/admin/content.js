// Admin: read and save all site content (services, ziyarat tours, routes, rates, fleet).
const { redis, authed } = require('../_lib');
const { defaults, sanitize } = require('../_content');
module.exports = async (req, res) => {
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  try {
    if (req.method === 'GET') {
      const [raw] = await redis([['GET', 'zha:content']]);
      const data = raw ? JSON.parse(raw) : defaults();
      if (!data.settings) data.settings = defaults().settings;
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      const clean = sanitize(req.body);
      await redis([['SET', 'zha:content', JSON.stringify(clean)]]);
      return res.status(200).json(clean);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};
