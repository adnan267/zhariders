// Public: site content for the front page. Only items marked visible are returned.
const { redis } = require('./_lib');
const { defaults } = require('./_content');
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  let data;
  try {
    const [raw] = await redis([['GET', 'zha:content']]);
    data = raw ? JSON.parse(raw) : defaults();
  } catch (e) {
    console.error(e);
    data = defaults(); // database unreachable: still show the default content
  }
  const pub = { settings: data.settings || defaults().settings };
  for (const k of Object.keys(data)) if (Array.isArray(data[k])) pub[k] = data[k].filter(x => x.visible);
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(pub);
};
