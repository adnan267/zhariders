# ZHA Riders Makkah (Vercel)

- public/        css, js, images, admin.html (the admin panel at /admin), robots.txt, sitemap.xml
- api/           backend (serverless): bookings, reviews, admin/*, page.js
- api/_template.html   the website page itself (api/page.js adds the SEO title/description from the admin panel)
- build.js       fills the real site address into robots.txt and sitemap.xml

## Deploy on Vercel
1. Push this folder to GitHub, import it in Vercel (Framework preset: Other), Deploy.
2. Storage > Marketplace > add **Upstash Redis** (free) and connect it to the project.
3. Settings > Environment Variables:
   - ADMIN_PASSWORD   (required for the first login; you can change it later inside the admin panel)
   - SITE_URL         (after you buy a domain, e.g. https://zhariders.com)
   - TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID   (optional, instant alerts)
4. Redeploy. Open /admin to log in (user: admin).

## Admin panel (left menu)
Dashboard, Bookings, Reviews, Services (add/edit/remove/reorder), Packages (Ziyarat tours), Rates, SEO (meta title and description in English, Urdu, Arabic), Password.
Changes show on the website within about a minute.
Forgot the admin password? In Upstash delete the key `zha:admin`; login goes back to ADMIN_PASSWORD.

## Photos
Put photos in public/images/ with the names in PUT-YOUR-PHOTOS-HERE.txt (a new service uses service-<id>.jpg, a new package ziyarat-<id>.jpg).

## Telegram alerts
@BotFather > /newbot gives the token. Send "hi" to your bot, then @userinfobot shows your id (TELEGRAM_CHAT_ID).

## Mobile
The website and the admin panel are built for phones: menu button, Call / WhatsApp / Book bar at the bottom, rates shown as cards, 16px form fields (no zoom on iPhone), and a side drawer in the admin panel. After sending a booking, a green "Send on WhatsApp" button appears (it works on every phone, pop-up blockers cannot stop it).
