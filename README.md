# ZHA Riders Makkah (Vercel)

- public/        website + admin.html (booking dashboard at /admin)
- api/           serverless backend (bookings.js, admin/bookings.js, admin/bookings/[id].js)
- vercel.json    serves public/ as the site

## Deploy on Vercel
1. Put this folder on GitHub (or run `npx vercel` inside it).
2. Vercel > Add New Project > import it. Framework preset: Other. Deploy.
3. Project > Storage > Marketplace > add **Upstash Redis** (free plan) and connect it to the project.
   Vercel adds KV_REST_API_URL and KV_REST_API_TOKEN automatically.
4. Project > Settings > Environment Variables: add ADMIN_PASSWORD (strong), optional ADMIN_USER (default admin).
5. Redeploy (Deployments > ... > Redeploy). Open /admin and log in.

## Photos
Put your photos in public/images/ with the names in PUT-YOUR-PHOTOS-HERE.txt, then redeploy.
