// Serves the website with SEO title/description taken from the admin panel.
const fs = require('fs'), path = require('path');
const { getConfig } = require('./_lib');
const TPL = fs.readFileSync(path.join(__dirname, '_template.html'), 'utf8');
const DEF = {
  en: ['Makkah Taxi & Umrah Transfers | Jeddah Airport to Makkah | ZHA Riders', 'Private taxi and transfers in Makkah, Madinah, Jeddah and Taif. Jeddah Airport to Makkah, Makkah to Madinah and Ziyarat tours. Get a quote on WhatsApp.'],
  ur: ['مکہ ٹیکسی اور عمرہ ٹرانسفر | جدہ ایئرپورٹ سے مکہ | ZHA Riders', 'مکہ، مدینہ، جدہ اور طائف میں پرائیویٹ ٹیکسی اور ٹرانسفر۔ جدہ ایئرپورٹ سے مکہ، مکہ سے مدینہ اور زیارات۔ واٹس ایپ پر قیمت معلوم کریں۔'],
  ar: ['توصيل وتاكسي مكة والعمرة | من مطار جدة إلى مكة | ZHA Riders', 'توصيل خاص في مكة والمدينة وجدة والطائف. من مطار جدة إلى مكة ومن مكة إلى المدينة وجولات الزيارات. اطلب عرض سعر عبر واتساب.']
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
module.exports = async (req, res) => {
  const lang = ['ur', 'ar'].includes(req.query && req.query.lang) ? req.query.lang : 'en';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  let site = process.env.SITE_URL || ('https://' + host);
  if (!/^https?:\/\//.test(site)) site = 'https://' + site;
  site = site.replace(/\/+$/, '');
  let cfg = {};
  try { cfg = await getConfig(); } catch (e) { console.error('config unavailable', e.message); }
  const s = (cfg.seo && cfg.seo[lang]) || {};
  const title = s.title || DEF[lang][0], desc = s.description || DEF[lang][1];
  const data = JSON.stringify({ seo: cfg.seo, services: cfg.services, packages: cfg.packages, rates: cfg.rates })
    .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const html = TPL
    .replace('<link rel="canonical" href="__SITE__/">', () => '<link rel="canonical" href="__SITE__' + (lang === 'en' ? '/' : '/' + lang) + '">')
    .replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + esc(title) + '</title>')
    .replace(/(<meta name="description" content=")[^"]*(")/, (m, a, b) => a + esc(desc) + b)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, (m, a, b) => a + esc(title) + b)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, (m, a, b) => a + esc(desc) + b)
    .replace('<html lang="en">', () => '<html lang="' + lang + '"' + (lang === 'en' ? '' : ' dir="rtl"') + '>')
    .replace('<!--CFG-->', () => '<script>window.__CFG=' + data + ';</script>')
    .split('__SITE__').join(site);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
};
