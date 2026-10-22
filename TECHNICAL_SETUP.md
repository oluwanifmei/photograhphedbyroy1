# Running the corrected application

Install dependencies with `npm install` (or `pnpm install`). Run checks with
`npm test`, then start with `npm start` and open http://localhost:3000.

Create a local `.env` from `.env.example`. Replace `JWT_SECRET` with a random
secret of at least 32 characters; the server deliberately refuses to start
with a missing or short secret. Generate one with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Set `ADMIN_EMAIL` to the owner's real email. With SMTP configured, register
that account and confirm its email before signing in through `admin.html`.
Public signup with local auto-confirmation never grants administrator access.
Without SMTP, stop the server, supply a private `ADMIN_PASSWORD` environment
variable (at least 12 characters), and run `node tools/create-admin.cjs` once
to provision a new owner account. Remove `ADMIN_PASSWORD` afterward. The tool
refuses to overwrite an existing account. Existing owners must verify through
SMTP or be reviewed before an explicit migration.
There is no built-in admin password or offline login. Browser authentication
uses an HttpOnly session cookie. Changing a password requires the current
password and invalidates older sessions. Login and registration are limited
to 15 attempts per IP per endpoint in 15 minutes per running instance.
Verification links expire after 24 hours; the login page offers resending.

The single booking form at `/book` saves a pending request to the server.
Legacy `booking.html` links lead to that form. Only name, email, session type
and preferred date are required. Package links preselect the session type.
WhatsApp is a separate channel and does not automatically create dashboard
records. Booking submissions can be made without an account; authenticated
submissions also appear in that customer's account.

The owner dashboard supports summary counts, search, status filters,
pagination, status updates and filtered CSV export. Customer details are
rendered as text, and spreadsheet formula prefixes are neutralised in CSV.
Package prices and testimonial quotations are retained from the original
repository; no new customer reviews or ratings have been invented.

## Photo stories and client spotlights

The homepage links to three editorial photo stories at `/stories`, includes
three photo spotlights, and retains the confirmed genuine client quotes with
their original attributions. Spotlight photos are not paired with quotes
whose subjects have not been identified.

Run `node tools/build-stories.cjs` after editing `photo-stories.json` to rebuild
the story pages and homepage features. The gimbal section currently contains
a two-photo on-set diary. To add actual footage, place an MP4 or WebM file in
`videos/`, set `behindTheScenesVideo` in `photo-stories.json` to its relative
path (for example `videos/roy-on-set.mp4`), then run the story builder. The
section will use a real video player with controls instead of the photo diary.
The filename may contain letters, numbers, underscores and hyphens.

For a separate frontend host, set `RENDER_BACKEND_URL` in `config.js` to the
backend's HTTPS URL. Leave it empty when the Express server serves the site.
Set `PUBLIC_URL` to the backend's public URL for email confirmation links.
Render's `RENDER_EXTERNAL_URL` is also recognised automatically.
For separate frontend and backend sites, set `FRONTEND_URL` to the frontend's
exact origin and `CROSS_SITE_COOKIES=true` on the backend, served over HTTPS
with `NODE_ENV=production`. Third-party-cookie restrictions can still prevent
cross-site sessions; serving frontend and API on the same site is preferred.

Set `SITE_URL` to the real public website origin for canonical URLs, Open
Graph images and the generated `/sitemap.xml` and `/robots.txt`. The Express
server renders direct routes including `/portfolio`, `/services`, `/book`,
`/about` and `/contact`; deploy using this server to retain those routes.

The portfolio is a curated selection of 55 photos. Original photographs
remain in the repository. Run `node tools/optimize-images.cjs` after changing
the source collection in `script.js` to rebuild the static portfolio and
480/960/1600-pixel WebP variants. The generated images are committed and do
not require Sharp on the production server. Install development dependencies
when rebuilding images.

## Storage and deployment

The existing small-site JSON storage is retained. Writes use a temporary
file and rename, return errors on failure, and never replace corrupt data
with an empty database. Run **one Node process/instance** only; this storage
does not coordinate writes across multiple instances. Account creation hashes
passwords asynchronously before reading the latest records, so concurrent
registrations cannot overwrite one another. Move to a transactional database
before running multiple processes or scaling the service.

On Render, attach persistent storage and set `DATA_FILE` to a file on its
mounted path, for example `/var/data/roy/data.json`. Create the parent folder
before starting the app. The default `data.json` beside `server.js` is useful
locally but is not durable on ephemeral hosting. The supplied Render YAML
does not provision paid storage. Back up existing records before changing
this path and copy them to the new path when migrating.

These code changes do not configure or verify the hosting environment.
The SMTP provider, owner email, public domain and persistent storage still
need valid production settings before launch.

Homepage motion: a brief viewfinder entrance and one-time scroll reveals enhance the existing photographs. Reduced-motion preferences disable the effects; content remains visible without JavaScript.
