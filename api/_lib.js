// Shared helpers. Files starting with "_" are not exposed as routes by Vercel.
const crypto = require('crypto');
const { promisify } = require('util');
const pbkdf2 = promisify(crypto.pbkdf2);
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

// ---- Admin password ----
// The password is stored as a salted PBKDF2 hash in Redis (key zha:admin), so it can be
// changed from the admin page. Until it is changed, ADMIN_PASSWORD (env var) is used.
const ITER = 210000;
const MAX_FAILS = 10;      // wrong logins allowed per IP ...
const LOCK_SECONDS = 900;  // ... inside this window before that IP is locked out

async function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await pbkdf2(pw, salt, ITER, 32, 'sha256')).toString('hex');
  return { salt, hash, iter: ITER };
}
async function checkPassword(pw, rec) {
  const h = (await pbkdf2(pw, rec.salt, rec.iter || ITER, 32, 'sha256')).toString('hex');
  return eq(h, rec.hash);
}
async function getStoredAdmin() {
  const [raw] = await redis([['GET', 'zha:admin']]);
  return raw ? JSON.parse(raw) : null;
}
async function setStoredAdmin(pw) {
  await redis([['SET', 'zha:admin', JSON.stringify(await hashPassword(pw))]]);
}

// Returns true only for a correct username + password. Wrong attempts are counted per IP.
async function authed(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const failKey = 'zha:adminfail:' + ip;
  const [fails] = await redis([['GET', failKey]]);
  if (Number(fails) >= MAX_FAILS) return false;

  const s = Buffer.from(h.slice(6), 'base64').toString(), i = s.indexOf(':');
  const user = i > 0 ? s.slice(0, i) : '', pass = i > 0 ? s.slice(i + 1) : '';
  const adminUser = process.env.ADMIN_USER || 'admin';

  let ok = false;
  if (user && eq(user, adminUser) && pass) {
    const stored = await getStoredAdmin();
    if (stored) ok = await checkPassword(pass, stored);
    else if (process.env.ADMIN_PASSWORD) ok = eq(pass, process.env.ADMIN_PASSWORD);
  }
  if (!ok) {
    await redis([['INCR', failKey], ['EXPIRE', failKey, LOCK_SECONDS, 'NX']]);
    return false;
  }
  if (fails) await redis([['DEL', failKey]]);
  return true;
}

module.exports = { redis, clean, STATUS, authed, crypto, setStoredAdmin };
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
