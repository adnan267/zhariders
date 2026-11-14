// Admin media library. Images are stored in Redis (already resized in the browser before upload).
//   GET            -> list of images [{id,name,type,size,created,url}]
//   POST {name,type,data(base64)} -> upload, returns the new image
//   DELETE ?id=... -> remove
const { redis, authed, clean, crypto } = require('../_lib');
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_IMAGES = 300;

module.exports = async (req, res) => {
  if (!(await authed(req))) return res.status(401).json({ error: 'Unauthorized' });
  try {
    if (req.method === 'GET') {
      const [flat] = await redis([['HGETALL', 'zha:imgmeta']]);
      const list = [];
      for (let i = 1; i < (flat || []).length; i += 2) list.push(JSON.parse(flat[i]));
      list.sort((a, b) => b.created.localeCompare(a.created));
      return res.status(200).json(list);
    }
    if (req.method === 'POST') {
      const d = req.body || {};
      const type = String(d.type || '');
      if (!TYPES.includes(type)) return res.status(400).json({ error: 'Only JPG, PNG or WebP images are allowed.' });
      const data = String(d.data || '');
      if (!/^[A-Za-z0-9+/=]+$/.test(data)) return res.status(400).json({ error: 'Bad image data.' });
      const size = Buffer.byteLength(data, 'base64');
      if (size > MAX_BYTES) return res.status(400).json({ error: 'Image is too large (max 1.5 MB after resizing).' });
      const [count] = await redis([['HLEN', 'zha:imgmeta']]);
      if (count >= MAX_IMAGES) return res.status(400).json({ error: 'Media library is full. Delete some old images first.' });
      const id = crypto.randomBytes(12).toString('hex');
      const meta = { id, name: clean(d.name, 80) || 'image', type, size, created: new Date().toISOString(), url: '/api/img/' + id };
      await redis([['SET', 'zha:img:' + id, data], ['HSET', 'zha:imgmeta', id, JSON.stringify(meta)]]);
      return res.status(201).json(meta);
    }
    if (req.method === 'DELETE') {
      const id = String(req.query.id || '');
      if (!/^[a-f0-9]{24}$/.test(id)) return res.status(400).json({ error: 'Bad id' });
      await redis([['DEL', 'zha:img:' + id], ['HDEL', 'zha:imgmeta', id]]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};
