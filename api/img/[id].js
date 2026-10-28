// Public: serve an uploaded image. Image ids never change, so the CDN may cache them for a long time.
const { redis } = require('../_lib');
module.exports = async (req, res) => {
  const id = String(req.query.id || '').replace(/\.\w+$/, '');
  if (!/^[a-f0-9]{24}$/.test(id)) return res.status(404).end('Not found');
  try {
    const [data, meta] = await redis([['GET', 'zha:img:' + id], ['HGET', 'zha:imgmeta', id]]);
    if (!data || !meta) return res.status(404).end('Not found');
    const buf = Buffer.from(data, 'base64');
    res.setHeader('Content-Type', JSON.parse(meta).type);
    res.setHeader('Content-Length', buf.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).end(buf);
  } catch (e) {
    console.error(e);
    return res.status(500).end('Server error');
  }
};
