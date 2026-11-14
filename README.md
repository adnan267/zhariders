# ZHA Riders Makkah (Vercel)

- public/   website (index.html, css, js, images), admin.html (dashboard at /admin), robots.txt, sitemap.xml
- api/      backend: bookings, reviews, admin/*  (Vercel serverless functions)
- build.js  fills the real site address into SEO tags at deploy time

## Deploy on Vercel
1. Push this folder to GitHub, import it in Vercel (Framework preset: Other), Deploy.
2. Storage > Marketplace > add **Upstash Redis** (free) and connect it to the project.
3. Settings > Environment Variables:
   - ADMIN_PASSWORD   (required, strong password)
   - SITE_URL         (after you buy a domain, e.g. https://zhariders.com)
   - TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID   (optional, for instant booking alerts)
4. Redeploy. Open /admin to log in.

## Managing the website content (/admin)
The left menu opens each section:
- **Services**: cards in "Our Services".
- **Ziyarat tours**: tour packages with price, description and bullet points.
- **Popular routes**: route cards (clicking one fills the booking form).
- **Rates**: the price table (SAR per trip, empty price = "Ask").
- **Fleet**: vehicles in "Our Fleet".

- **Images & banner**: upload photos (JPG, PNG, WebP) and choose the homepage banner.

Add, edit, hide (untick "Show on website") or remove items, then press **Save and publish**. The website updates within about a minute.

Photos: press **Choose image** on any item and pick from the media library (or upload a new one there). Images are resized in the browser to max 1600px (WebP) before upload, stored in Redis (keys `zha:img:*`, list in `zha:imgmeta`, max 300 images) and served from /api/img/<id> with long CDN caching. Photos are optional; without one, the emoji is shown.

Content is stored in Redis under the key `zha:content`. Until you save once, the website shows the default content.
Limitations: managed text is in English only, and the booking form's From/To dropdowns are still fixed in index.html.

## Admin password
- Log in at /admin, click **Change password**, enter a new password (at least 12 characters) twice.
- The new password is stored as a salted hash in Redis (key `zha:admin`). After that, the ADMIN_PASSWORD env var is no longer used.
- Forgot the password? In the Upstash console, delete the key `zha:admin`. ADMIN_PASSWORD then works again (redeploy is not needed).
- Too many wrong logins from one IP (10 in 15 minutes) are blocked for 15 minutes.

## Telegram alerts
1. In Telegram open @BotFather, send /newbot, copy the token it gives you.
2. Open your new bot and press Start / send "hi".
3. Open @userinfobot, it shows your numeric id = TELEGRAM_CHAT_ID.
4. Add both as env vars in Vercel and redeploy. New bookings and new reviews will message you.

## Languages
English, Urdu, Arabic (RTL). Links: /, /ur, /ar. Text lives in public/js/i18n.js.

## Reviews
Customers submit at the bottom of the site. Reviews stay hidden until you set them to "approved" in /admin > Reviews.
You can also add reviews yourself there (for example ones customers sent on WhatsApp).

## Photos
Put your photos in public/images/ using the names in PUT-YOUR-PHOTOS-HERE.txt, then redeploy.

## After going live (SEO)
Add the site to Google Search Console and submit SITE_URL/sitemap.xml. Create a Google Business Profile for ZHA Riders Makkah.
