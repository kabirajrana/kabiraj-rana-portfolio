# Backend (FastAPI)

## Setup

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload
```

## PostgreSQL deployment

Service type: Python FastAPI (not Node/Express/Nest). The backend requires a
PostgreSQL `DATABASE_URL` in every environment.

Render service settings:

- Root directory: `backend`
- Install command: `pip install -r requirements.txt`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Health check:

- Endpoint: `GET /health`

Migrations are documented in `migrations/001_create_content_records.sql`.

Required environment variables:

- `APP_ENV=production`
- `PORT` (Render will inject this automatically)
- `ALLOWED_ORIGINS=https://www.kabirajrana.com.np,https://admin.kabirajrana.com.np,http://localhost:3000`
- `DATABASE_URL=<production-postgresql-url>`
- `ADMIN_SEED_EMAIL=<your-admin-email>`
- `ADMIN_SEED_PASSWORD=<your-admin-password>`
- `MAIL_PROVIDER` (`resend` or `smtp`)
- Mail provider variables matching `MAIL_PROVIDER` from `.env.example`

## Keep The Same Admin Login In Production

If you want the same credentials to work in both local and production admin panel:

1. Set identical values for `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` in local `.env` and Render backend env vars.
2. Restart or redeploy the backend service after changing these values.
3. Ensure frontend server env `BACKEND_API_URL` points to your backend base URL.
4. Redeploy frontend after env changes.

Notes:

- Admin identity and all admin content are resolved from PostgreSQL, so the database is the source of truth.
- `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_PASSWORD` are supported aliases if you prefer those names.

## Test

```bash
pytest
```

## One-time legacy content import

Before the first PostgreSQL deployment, run the idempotent importer from this
directory while `DATABASE_URL` points to production:

```bash
python -m scripts.import_admin_store --file .data/admin_store.json
```

The importer reads the legacy JSON file once, skips existing records safely,
and writes projects, messages, settings, research, experience, revisions,
health reports, users, and credentials to PostgreSQL. The running application
does not read or write `admin_store.json`.
