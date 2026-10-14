# Backend (local demo)

This repository includes a minimal Express backend for demoing signups and booking requests.

Prerequisites
- Node.js 16+ installed

Install and run

```bash
cd "C:/Users/user/Pictures/NIFEMI PHOTOGRAPHIC WEBSITE"
npm install
# copy .env.example to .env and update values (SMTP, JWT_SECRET, ADMIN_EMAIL)
copy .env.example .env
npm start
```

Then open http://localhost:3000/signup.html to test the forms. The server serves the static files and exposes API endpoints:

- `POST /api/register` — register a user (sends confirmation email if SMTP configured)
- `GET /api/confirm?token=...` — confirm email token (visited from email)
- `POST /api/login` — login to receive a JWT token
- `POST /api/booking` — accepts JSON booking body
- `GET /api/signups` — returns saved signup records (public)
- `GET /api/bookings` — returns saved booking records (public)

Admin-protected endpoints (require `Authorization: Bearer <token>` with an admin user):

- `GET /api/admin/signups`
- `GET /api/admin/bookings`

Data is saved to `data.json` in the project root.
