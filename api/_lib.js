// Shared helpers. Files starting with "_" are not exposed as routes by Vercel.
const crypto = require('crypto');
const DB_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const DB_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Upstash Redis REST pipeline: send [[cmd,...],[cmd,...]] -> array of results
async function redis(cmds) {
  if (!DB_URL || !DB_TOKEN) throw new Error('Database not configured');
  const r = await fetch(DB_URL + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + DB_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  const j = await r.json();
  if (!r.ok) throw new Error('Database error');
  return j.map(x => { if (x.error) throw new Error(x.error); return x.result; });
}
const clean = (v, n) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n);
const STATUS = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');

// Password: a changed password lives (hashed) in the database; until then ADMIN_PASSWORD from Vercel is used.
async function verifyPassword(pw) {
  const [rec] = await redis([['GET', 'zha:admin']]);
  if (rec) { const r = JSON.parse(rec); return eq(hashPw(pw, r.salt), r.hash); }
  const env = process.env.ADMIN_PASSWORD;
  return !!env && eq(pw, env);
}
async function setPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  await redis([['SET', 'zha:admin', JSON.stringify({ salt, hash: hashPw(pw, salt) })]]);
}
async function authed(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const s = Buffer.from(h.slice(6), 'base64').toString(), i = s.indexOf(':');
  if (i < 1) return false;
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const key = 'zha:rla:' + ip;
  const [fails] = await redis([['GET', key]]);
  if (Number(fails) >= 20) return false; // too many wrong attempts, wait 15 minutes
  const ok = eq(s.slice(0, i), process.env.ADMIN_USER || 'admin') && await verifyPassword(s.slice(i + 1));
  if (!ok) await redis([['INCR', key], ['EXPIRE', key, 900]]);
  return ok;
}

// ----- website content settings (SEO, services, packages, rates) -----
async function getConfig() {
  const [raw] = await redis([['GET', 'zha:config']]);
  return raw ? JSON.parse(raw) : {};
}
const LANGS = ['en', 'ur', 'ar'];
const ml = (o, n) => { o = o || {}; const r = {}; LANGS.forEach(l => { r[l] = clean(o[l], n); }); return r; };
const price = v => { if (v === '' || v == null) return null; const n = Number(v); return isFinite(n) && n >= 0 && n <= 99999 ? Math.round(n) : null; };
const slug = () => 'x' + crypto.randomBytes(4).toString('hex');
function sanitize(section, data) {
  if (section === 'seo') {
    const r = {}; LANGS.forEach(l => { const s = (data || {})[l] || {}; r[l] = { title: clean(s.title, 120), description: clean(s.description, 320) }; }); return r;
  }
  if (section === 'services' || section === 'packages') {
    if (!Array.isArray(data)) throw new Error('bad data');
    return data.slice(0, 20).map(x => {
      const o = { id: /^[\w-]{1,30}$/.test(x.id || '') ? x.id : slug(), icon: clean(x.icon, 8), t: ml(x.t, 80), d: ml(x.d, 220) };
      if (section === 'packages') { const p = price(x.price); o.price = p == null ? '' : p; o.f = (Array.isArray(x.f) ? x.f : []).slice(0, 8).map(s => clean(s, 80)).filter(Boolean); }
      return o;
    }).filter(o => o.t.en);
  }
  if (section === 'rates') {
    const rows = (data && Array.isArray(data.rows)) ? data.rows : [];
    return { rows: rows.slice(0, 40).map(r => ({ n: clean(r.n, 80), p: [0, 1, 2, 3].map(i => price((r.p || [])[i])) })).filter(r => r.n) };
  }
  throw new Error('bad section');
}
async function saveSection(section, data) {
  const clean_ = sanitize(section, data), cfg = await getConfig();
  cfg[section] = clean_;
  await redis([['SET', 'zha:config', JSON.stringify(cfg)]]);
  return clean_;
}

// Telegram alert (optional). Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.
async function notify(text) {
  const t = process.env.TELEGRAM_BOT_TOKEN, c = process.env.TELEGRAM_CHAT_ID;
  if (!t || !c) return;
  try {
    await fetch('https://api.telegram.org/bot' + t + '/sendMessage', { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: c, text }),
      signal: AbortSignal.timeout(4000) });
  } catch (e) { console.error('Telegram alert failed'); }
}
module.exports = { redis, clean, STATUS, authed, crypto, notify, getConfig, saveSection, verifyPassword, setPassword };
