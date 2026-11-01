# Netlify deployment

Import the existing GitHub repository and select `main`. Netlify reads `netlify.toml` automatically. Select the Free plan; do not enable paid add-ons.

Set runtime environment variables privately before publishing:

- `DATABASE_URL`: the existing Neon pooled PostgreSQL connection string. Reuse the existing database to preserve accounts, bookings and analytics.
- `JWT_SECRET`: the existing backend signing secret, at least 32 characters.
- `ADMIN_EMAIL`: the existing owner email.
- Any existing SMTP settings used by the backend, if configured.

Do not add `ADMIN_BOOTSTRAP_PASSWORD`, `DATABASE_FILE`, or `DATA_FILE`. Do not carry over Render's `SITE_URL`, `FRONTEND_URL`, `PUBLIC_URL`, or `RENDER_EXTERNAL_URL`. Netlify supplies the production URL automatically. Cookies belong to each host, so users must sign in again at the new address.

Public HTML, photographs and videos are served directly by Netlify. Private collections, account pages and API endpoints run through the Express function and retain their existing access checks. The function refuses to run without database, signing secret and owner settings; it never falls back to temporary disk storage.

Verify the production URL, `/api/ready`, every photo collection, login, owner-only dashboard and a booking before sharing the new address or retiring Render. Verify a booking still appears after a new function instance starts. Keep the previous host available until these checks pass.

Free-plan usage is limited. Monitor Netlify credits and Neon usage. Netlify can pause sites that exhaust their allowance; serverless requests and database connections can also have startup latency. This setup does not promise uninterrupted availability.

Changing hosts does not cancel a Vercel subscription. Review Vercel billing separately if an active paid plan exists.
