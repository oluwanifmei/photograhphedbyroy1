# Bookings and studio backend

The Express application is ready for a Node.js 24 host. The existing GitHub
Pages portfolio stays live while the server is being set up.

## Deploy and connect

### Free Render + Neon configuration

Use the Free compute plan in Render and a separate Free Neon Postgres project.
Use `render-free.yaml` when deploying through a Blueprint, or configure the
same variables in the Web Service form. Do not attach a disk or put SQLite
on free Render compute: its filesystem is temporary.

Set `DATABASE_URL` to the private Neon **pooled connection string**, `NODE_VERSION=24`,
`NODE_ENV=production`, `FRONTEND_URL=https://oluwanifmei.github.io`, and the real
`ADMIN_EMAIL`. Generate a random `JWT_SECRET` of at least 32 characters. Enter
an initial private owner password in `ADMIN_BOOTSTRAP_PASSWORD` (12 characters
minimum, at most 72 bytes). The server creates that owner before accepting
requests and never overwrites an existing account. Remove the bootstrap password
from Render after verifying owner login. Free Render has no service shell.

Build with `npm install --omit=dev`, start with `npm start`, and use `/api/ready`
as the health check. A successful remote connection returns
`{"status":"ready","storage":"postgres"}`. The database remains in Neon
when Render restarts. Free compute can sleep when idle, so the first visit can
take about a minute. The booking form allows 90 seconds and retains details
if it cannot confirm receipt. Free-plan usage limits apply.

Then add the server's HTTPS origin as the GitHub Actions variable `BACKEND_URL`
and rerun **Publish photography website**. Login, Create account and Admin
dashboard links open on the backend host; bookings save to the private database.
The WhatsApp channel remains separate. Free Render blocks common SMTP ports;
the owner bootstrap does not depend on SMTP or a verification email.

### Optional paid service with local SQLite

1. In your Render account, create a Blueprint from this existing repository
   and its `main` branch. Review `render.yaml`: it uses a paid Starter web
   service with a 1 GB persistent disk. Do not deploy SQLite on ephemeral
   storage; that would discard bookings when the instance is replaced.
2. Supply the real `ADMIN_EMAIL`. The Blueprint generates `JWT_SECRET`, sets
   `DATABASE_FILE=/var/data/roy.sqlite`, `NODE_ENV=production`, and permits
   enquiries from `https://oluwanifmei.github.io`. If migrating existing
   records, first back them up and copy the JSON file to persistent storage;
   set `DATA_FILE` to that file before the first start.
3. Create the owner account. With SMTP configured, register and verify the
   owner email. Without SMTP, set a private `ADMIN_PASSWORD`
   of at least 12 characters and at most 72 bytes in the host's environment,
   run `npm run admin:create` in the service shell, and remove that password
   environment variable. Stop the server first only for legacy JSON mode.
   The command never overwrites an existing account. Do not
   commit or send passwords in chat.
4. Open `https://YOUR-SERVICE/api/ready`; it should return
   `{"status":"ready","storage":"sqlite"}`. Sign in at
   `https://YOUR-SERVICE/admin.html`. Test an enquiry through `/book`, then
   verify it appears in the dashboard and remains after a service restart.
5. In GitHub, open repository Settings → Secrets and variables → Actions →
   Variables. Add `BACKEND_URL` with that exact HTTPS server origin, without
   a path, then run **Publish photography website** from the Actions tab.
   The public form will save API enquiries; account/studio links will open
   on the backend host so browser third-party-cookie restrictions do not
   prevent admin sign-in.

Bookings previously sent only through WhatsApp are not automatically imported.
Until the backend is connected, the public site retains its WhatsApp form.

## API contract

| Method and endpoint | Access | Result |
| --- | --- | --- |
| `GET /api/health` | Public | Process liveness |
| `GET /api/ready` | Public | Storage readiness; 503 on failure |
| `POST /api/booking` | Public | Saves a pending enquiry; returns its reference |
| `POST /api/login` | Account | Establishes an HttpOnly session cookie |
| `POST /api/logout` | Account | Clears that browser's cookie |
| `GET /api/me` | Signed in | Own profile and account bookings |
| `GET /api/admin/summary` | Verified owner | Dashboard counts |
| `GET /api/admin/bookings` | Verified owner | Search, status filter and pagination |
| `POST /api/admin/booking/:id/status` | Verified owner | Updates booking status |
| `GET /api/admin/export/bookings` | Verified owner | Filtered CSV export |

Send bookings as JSON with `name`, `email`, `service`, `date` (`YYYY-MM-DD`),
and optional `time`, `phone`, `location`, `message`. Always send a unique
`Idempotency-Key` header (16–100 letters, digits or hyphens); reuse that key
only when retrying the identical enquiry. A changed payload with an existing
key returns 409. The browser form retains details after a failure and shows
success only after the server acknowledges the save.

Admin status values are `pending`, `confirmed`, `completed`, `cancelled`.
List filters are `search`, `status`, `page` and `limit` (maximum 100).
Customer data endpoints require owner authorization. Registration alone
never grants owner access.

## Backups and checks

Use `npm test` for the API, persistence, migration, retry, privacy, dashboard
ordering and public-page tests. Set `BACKUP_FILE` to a private, new filename
and run `npm run data:backup`. Keep an off-host copy of the resulting file.
Database files, environment secrets and backups are excluded from Git and
from the GitHub Pages artifact.

Postgres backups are consistent JSON exports of the customer collections. Run
the backup command locally with the private `DATABASE_URL`; keep the export
off the public site. To restore, initialize a new database with `DATA_FILE`
pointing at that JSON backup, verify it, and switch the service to the new
connection string. Existing initialized databases are never overwritten by import.
