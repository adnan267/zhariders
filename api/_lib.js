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
const eq = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
function authed(req) {
  const pass = process.env.ADMIN_PASSWORD, user = process.env.ADMIN_USER || 'admin';
  if (!pass) return false;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const s = Buffer.from(h.slice(6), 'base64').toString(), i = s.indexOf(':');
  return i > 0 && eq(s.slice(0, i), user) && eq(s.slice(i + 1), pass);
}
module.exports = { redis, clean, STATUS, authed, crypto };
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
module.exports.notify = notify;
