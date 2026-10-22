# Running the corrected application

## Public website on GitHub Pages

The public portfolio can run without a server. The `Publish photography website`
workflow builds real HTML files for every public page and publishes only the
public assets. The build uses GitHub's configured Pages URL, including the
repository subdirectory, so navigation, story anchors and photo URLs stay on
the correct site. Keep Settings → Pages → Source set to GitHub Actions.

For a local static build, set `SITE_URL` to the full website URL including its
repository path, then run `npm run build:pages`. The output is in `dist/`.
The build preserves original photographs and optimized image variants and
excludes server source, environment files and customer records.

On the server-free Pages site, booking enquiries open a prefilled WhatsApp
draft. The visitor must press Send in WhatsApp; the form never claims that a
booking has been saved or confirmed. The Account menu stays visible with
Login, Create account and Admin dashboard links. Until hosting is connected,
these pages explain availability without collecting unusable credentials.
The original account/dashboard code and API booking flow remain available
when deploying the application with the Express server.

## Express server and online accounts

Use Node.js 24. Install dependencies with `npm install` (or `pnpm install`). Run checks with
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
Without SMTP, supply a private `ADMIN_PASSWORD` environment
variable (at least 12 characters), and run `node tools/create-admin.cjs` once
to provision a new owner account. Remove `ADMIN_PASSWORD` afterward. The tool
refuses to overwrite an existing account. Existing owners must verify through
SMTP or be reviewed before an explicit migration.
With SQLite this command can run from the host's service shell; stop the
server before provisioning only when using legacy JSON storage.
There is no built-in admin password or offline login. Browser authentication
uses an HttpOnly session cookie. Changing a password requires the current
password and invalidates older sessions. Login and registration are limited
to 15 attempts per IP per endpoint in 15 minutes per running instance;
the public booking endpoint uses the same limit.
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

To connect GitHub Pages, add a repository Actions **variable** named
`BACKEND_URL` with the deployed server's HTTPS origin, then rerun the Pages
workflow. The build enables API booking and restores account/studio links.
Those links open the Express-hosted sign-in and dashboard, keeping private
sessions on the server's own site. Guest bookings from Pages do not depend
on third-party cookies. Until this variable is set, Pages keeps the working
WhatsApp enquiry flow and does not advertise unavailable online accounts.
For a manually built separate frontend, set `RENDER_BACKEND_URL` in `config.js`.
Leave it empty when the Express server serves the site.
Set `PUBLIC_URL` to the backend's public URL for email confirmation links.
Render's `RENDER_EXTERNAL_URL` is also recognised automatically.
Set `FRONTEND_URL` to the frontend's exact origin (for this GitHub Pages site,
`https://oluwanifmei.github.io`). The generated studio/account links use
first-party cookies, so `CROSS_SITE_COOKIES` is not needed for that setup.
Keep `NODE_ENV=production` on the HTTPS backend so cookies are Secure.

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

SQLite is now the default, using Node 24's built-in driver. Customer collections
are stored in a versioned database record. Writes commit atomically with WAL
and full synchronization. Stale writes return HTTP 409 instead of silently
overwriting newer records. Run one backend service with its own persistent
disk; independent replicas must not use separate copies of the database.

Set `DATABASE_FILE=/var/data/roy.sqlite` on the mounted persistent disk. Production
refuses to start without an explicit database or legacy data path. Local development
defaults to `data/roy.sqlite`. If an old JSON database exists, leave it at `data.json`
or set `DATA_FILE` to its location. The first SQLite initialization imports its
users, password hashes, bookings and references without modifying that JSON file.
Later restarts never reimport it over the initialized SQLite database. Corrupt
source data causes an error rather than being replaced with empty records.
Setting only `DATA_FILE` retains the legacy single-process JSON mode.

Back up before migrating. Set `BACKUP_FILE` to a new private destination and run
`npm run data:backup` for a consistent SQLite backup (or JSON copy in legacy mode).
Keep backups off the public website and retain a separate off-host copy. To restore,
stop the server and point `DATABASE_FILE` at the recovered SQLite backup.

The Render Blueprint specifies Node 24, `/api/ready` health checks and a 1 GB
persistent disk on a paid Starter service. No hosting account or paid service
has been provisioned. See [BACKEND_SETUP.md](BACKEND_SETUP.md) for deployment.

These code changes do not configure or verify the hosting environment.
The SMTP provider, owner email, public domain and persistent storage still
need valid production settings before launch.

Homepage motion: a brief viewfinder entrance and one-time scroll reveals enhance the existing photographs. Reduced-motion preferences disable the effects; content remains visible without JavaScript.
