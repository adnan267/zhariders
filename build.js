// Copies public/ to dist/ and fills in the real site address (__SITE__) for SEO tags.
const fs = require('fs'), path = require('path');
let site = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : 'http://localhost:3000');
if (!/^https?:\/\//.test(site)) site = 'https://' + site;
site = site.replace(/\/+$/, '');
fs.rmSync('dist', { recursive: true, force: true });
fs.cpSync('public', 'dist', { recursive: true });
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(html|xml|txt)$/.test(f)) fs.writeFileSync(p, fs.readFileSync(p, 'utf8').split('__SITE__').join(site));
  }
})('dist');
console.log('Built dist/ for ' + site);
