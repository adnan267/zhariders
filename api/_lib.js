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

// ---- Email alerts (optional) ----
// Uses Resend (resend.com, free plan). Env vars: RESEND_API_KEY, NOTIFY_EMAIL (one or more addresses,
// comma separated) and optionally EMAIL_FROM (needs a verified domain; default is Resend's test sender,
// which can only send to the email address of your own Resend account).
const escHtml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
async function sendEmail(subject, html, text) {
  const key = process.env.RESEND_API_KEY, to = (process.env.NOTIFY_EMAIL || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!key || !to.length) return { ok: false, error: 'RESEND_API_KEY or NOTIFY_EMAIL is not set' };
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || 'ZHA Riders <onboarding@resend.dev>', to, subject, html, text }),
      signal: AbortSignal.timeout(6000) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); console.error('Email failed', r.status, j.message); return { ok: false, error: j.message || ('HTTP ' + r.status) }; }
    return { ok: true };
  } catch (e) { console.error('Email failed'); return { ok: false, error: 'Could not reach the email service' }; }
}
// Shared email layout: title, rows of [label, value], optional buttons [[text, url, color]]
function emailHtml(title, intro, rows, buttons) {
  const tr = rows.filter(r => r[1]).map(r => '<tr><td style="padding:8px 12px;color:#6b6b74;font-size:13px;white-space:nowrap;vertical-align:top">' + escHtml(r[0]) +
    '</td><td style="padding:8px 12px;font-size:15px;color:#17171c;font-weight:600">' + escHtml(r[1]).replace(/\n/g, '<br>') + '</td></tr>').join('');
  const bt = (buttons || []).map(b => '<a href="' + escHtml(b[1]) + '" style="display:inline-block;margin:6px 6px 0 0;padding:12px 20px;border-radius:999px;background:' + (b[2] || '#c9a045') +
    ';color:' + (b[2] ? '#fff' : '#1b1405') + ';font-weight:700;text-decoration:none;font-size:14px">' + escHtml(b[0]) + '</a>').join('');
  return '<div style="background:#f6f3ea;padding:24px 12px;font-family:Arial,Helvetica,sans-serif"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e9e2cf">' +
    '<div style="background:#0b0b0d;color:#ecd08a;padding:18px 22px;font-size:18px;font-weight:700">ZHA Riders Makkah</div>' +
    '<div style="padding:22px"><h2 style="margin:0 0 6px;font-size:20px;color:#17171c">' + escHtml(title) + '</h2>' + (intro ? '<p style="margin:0 0 14px;color:#4b4b53">' + intro + '</p>' : '') +
    (tr ? '<table style="width:100%;border-collapse:collapse;background:#fbf8ef;border-radius:12px">' + tr + '</table>' : '') + (bt ? '<div style="margin-top:16px">' + bt + '</div>' : '') +
    '</div></div></div>';
}
module.exports.sendEmail = sendEmail;
module.exports.emailHtml = emailHtml;
module.exports.escHtml = escHtml;
