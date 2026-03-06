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
- `MAIL_PROVIDER` (`resend` or `smtp`)
- Mail provider variables matching `MAIL_PROVIDER` from `.env.example`

## Test

```bash
pytest
```
