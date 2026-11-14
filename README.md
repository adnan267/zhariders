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
   - RESEND_API_KEY, NOTIFY_EMAIL, CRON_SECRET   (optional, email alerts, see below)
4. Redeploy. Open /admin to log in.

## Admin panel (/admin)
Works on phone and computer (on a phone, tap the menu button at the top left).
- **Dashboard**: new bookings, trips today and tomorrow, reviews waiting, and the next 7 days of trips with WhatsApp / Call buttons.
- **Bookings**: tabs by status (New, Contacted, Confirmed...), search by name, phone, reference or place, sort by travel date. Each booking has WhatsApp, Call, Copy and Delete buttons; change the status from its dropdown. The list refreshes itself every minute and shows a message when a new booking arrives.
- **Reviews**: "Waiting" tab first; one tap to Publish or Hide. You can also add a review you received on WhatsApp.
- **Services, Ziyarat tours, Popular routes, Rates, Fleet**: edit the website content. Untick "Show" to hide an item, use the arrows to change the order.
- **Photos & banners**: change the big photo at the top of each page and upload photos (drag and drop works on a computer).

After editing content a bar appears at the bottom: press **Save and publish** (or Ctrl+S). The website updates within about a minute. If you try to leave with unsaved changes the browser warns you.

Photos: press **Choose photo** on any item and pick from the media library (or upload a new one there). Images are resized in the browser to max 1600px (WebP) before upload, stored in Redis (keys `zha:img:*`, list in `zha:imgmeta`, max 300 images) and served from /api/img/<id> with long CDN caching. Photos are optional; without one, the emoji is shown.

Content is stored in Redis under the key `zha:content`. Until you save once, the website shows the default content.
Limitations: text you type in the admin panel is shown in English unless the same text exists in public/js/i18n.js. The booking form's From/To dropdowns are fixed in book.html and index.html.

## Admin password
- Log in at /admin, click **Change password**, enter a new password (at least 12 characters) twice.
- The new password is stored as a salted hash in Redis (key `zha:admin`). After that, the ADMIN_PASSWORD env var is no longer used.
- Forgot the password? In the Upstash console, delete the key `zha:admin`. ADMIN_PASSWORD then works again (redeploy is not needed).
- Too many wrong logins from one IP (10 in 15 minutes) are blocked for 15 minutes.

## Email alerts (new bookings, new reviews, daily rides)
You get an email for every new booking (with a WhatsApp button for the customer) and every new review,
plus every morning at about 6:00 Makkah time a list of today's and tomorrow's rides.
1. Sign up free at https://resend.com **with the email address that should receive the alerts**.
2. In Resend open **API Keys** > Create API key, copy it (starts with `re_`).
3. In Vercel > Settings > Environment Variables add:
   - RESEND_API_KEY = the key
   - NOTIFY_EMAIL   = the email address that receives alerts (several: separate with commas)
   - CRON_SECRET    = any long random text (protects the daily rides email)
4. Redeploy. In /admin > Dashboard press **Send test email**.

Note: without your own domain, Resend can only send to the email address of your Resend account.
To send to other addresses, verify a domain in Resend and add EMAIL_FROM (e.g. `ZHA Riders <alerts@zhariders.com>`).
The daily email is skipped on days with no rides and no unanswered requests. Schedule: "crons" in vercel.json.

## Telegram alerts
1. In Telegram open @BotFather, send /newbot, copy the token it gives you.
2. Open your new bot and press Start / send "hi".
3. Open @userinfobot, it shows your numeric id = TELEGRAM_CHAT_ID.
4. Add both as env vars in Vercel and redeploy. New bookings and new reviews will message you.

## Languages
English, Urdu, Arabic (RTL). Links: /, /ur, /ar. Text lives in public/js/i18n.js.

## Reviews
Customers submit on the Book a Ride page. Reviews stay hidden until you set them to "approved" in /admin > Reviews.
You can also add reviews yourself there (for example ones customers sent on WhatsApp).

## Photos
Put your photos in public/images/ using the names in PUT-YOUR-PHOTOS-HERE.txt, then redeploy.

## After going live (SEO)
Add the site to Google Search Console and submit SITE_URL/sitemap.xml. Create a Google Business Profile for ZHA Riders Makkah.
