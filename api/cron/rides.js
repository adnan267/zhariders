// Daily email with today's and tomorrow's rides. Called by Vercel Cron (see "crons" in vercel.json),
// every morning at about 6:00 Makkah time. Protected by CRON_SECRET (Vercel sends it automatically).
const { redis, sendEmail, emailHtml, escHtml } = require('../_lib');
const day = n => new Date(Date.now() + 3 * 3600e3 + n * 864e5).toISOString().slice(0, 10); // Saudi time (UTC+3)

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const okCron = secret ? req.headers.authorization === 'Bearer ' + secret : /vercel-cron/i.test(req.headers['user-agent'] || '');
  if (!okCron) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const [flat] = await redis([['HGETALL', 'zha:bookings']]);
    const all = [];
    for (let i = 1; i < (flat || []).length; i += 2) all.push(JSON.parse(flat[i]));
    const live = all.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
    const today = day(0), tmr = day(1);
    // a return trip counts on its return date too
    const legs = d => live.flatMap(b => [b.date === d ? { b, t: b.time, label: b.pickup + ' → ' + b.dropoff } : null,
      b.trip === 'return' && b.rdate === d ? { b, t: b.rtime || '', label: b.dropoff + ' → ' + b.pickup + ' (return)' } : null].filter(Boolean))
      .sort((x, y) => (x.t || '').localeCompare(y.t || ''));
    const T = legs(today), M = legs(tmr);
    const pending = live.filter(b => b.status === 'new').length;
    if (!T.length && !M.length && !pending) return res.status(200).json({ ok: true, sent: false, reason: 'nothing to report' });
    const site = 'https://' + req.headers.host;
    const block = (title, list) => '<h3 style="margin:18px 0 8px;font-size:16px;color:#17171c">' + escHtml(title) + ' (' + list.length + ')</h3>' +
      (list.length ? list.map(x => '<div style="border:1px solid #e9e2cf;border-left:4px solid ' + (x.b.status === 'new' ? '#e0a800' : '#1a7f3c') + ';border-radius:10px;padding:10px 12px;margin-bottom:8px">' +
        '<b style="font-size:15px">' + escHtml(x.t || '--:--') + ' &nbsp; ' + escHtml(x.label) + '</b><br><span style="color:#4b4b53;font-size:13px">' +
        escHtml(x.b.ref) + ' · ' + escHtml(x.b.vehicle) + ' · ' + escHtml(x.b.passengers) + ' pax · ' + escHtml(x.b.name || '-') + ' ' + escHtml(x.b.phone || '') +
        (x.b.flight ? ' · Flight ' + escHtml(x.b.flight) : '') + ' · <i>' + escHtml(x.b.status) + '</i></span>' +
        (x.b.notes ? '<br><span style="color:#6b6b74;font-size:13px">' + escHtml(x.b.notes) + '</span>' : '') + '</div>').join('')
        : '<p style="color:#6b6b74;margin:0">No rides.</p>');
    const intro = (pending ? '<b>' + pending + ' booking request' + (pending > 1 ? 's are' : ' is') + ' still "new" (not answered yet).</b><br>' : '') + 'Rides for ' + today + ' and ' + tmr + '.';
    const html = emailHtml('Daily rides', intro, [], [['Open bookings', site + '/admin#bookings']])
      .replace('</p><div style="margin-top:16px">', '</p>' + block('Today, ' + today, T) + block('Tomorrow, ' + tmr, M) + '<div style="margin-top:16px">');
    const text = ['TODAY ' + today].concat(T.map(x => (x.t || '') + ' ' + x.label + ' - ' + x.b.ref + ' ' + (x.b.name || '') + ' ' + (x.b.phone || '')),
      ['', 'TOMORROW ' + tmr], M.map(x => (x.t || '') + ' ' + x.label + ' - ' + x.b.ref + ' ' + (x.b.name || '') + ' ' + (x.b.phone || ''))).join('\n');
    const r = await sendEmail('Rides today: ' + T.length + ', tomorrow: ' + M.length + (pending ? ' · ' + pending + ' new request(s)' : ''), html, text);
    return res.status(200).json({ ok: r.ok, sent: r.ok, error: r.error });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Server error' }); }
};
