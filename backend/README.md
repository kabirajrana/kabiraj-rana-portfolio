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

## Railway Deployment (Backend Service)

Service type: Python FastAPI (not Node/Express/Nest).

Railway service settings:

- Root directory: `backend`
- Install command: `pip install -r requirements.txt`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`

Health check:

- Endpoint: `GET /health`

Migrations:

- This backend currently does not use Prisma or SQL migrations.
- Migration command on Railway: not applicable for the current FastAPI backend.
- If you later add a database layer, use production-safe commands only (for example, deploy-time migration commands, never local dev migration commands).

Required Railway environment variables:

- `APP_ENV=production`
- `PORT=8000` (Railway will inject this automatically)
- `ALLOWED_ORIGINS=https://www.kabirajrana.com.np,https://admin.kabirajrana.com.np,http://localhost:3000`
- `ADMIN_SEED_EMAIL=<your-admin-email>`
- `ADMIN_SEED_PASSWORD=<your-admin-password>`
- `MAIL_PROVIDER` (`resend` or `smtp`)
- Mail provider variables matching `MAIL_PROVIDER` from `.env.example`

## Keep The Same Admin Login In Production

If you want the same credentials to work in both local and production admin panel:

1. Set identical values for `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` in local `.env` and Railway backend env vars.
2. Restart or redeploy the backend service after changing these values.
3. Ensure frontend server env `BACKEND_API_URL` points to your Railway backend base URL.
4. Redeploy frontend after env changes.

Notes:

- Admin identity is resolved from backend storage, so backend env is the source of truth.
- `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_PASSWORD` are supported aliases if you prefer those names.

## Test

```bash
pytest
```
