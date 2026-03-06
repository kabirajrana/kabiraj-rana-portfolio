# Kabiraj Portfolio

Premium full-stack portfolio for Kabiraj Rana.

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, shadcn-style UI
- Backend: FastAPI, Pydantic, SMTP/Resend email sender

## Run Locally

### 1) Frontend

```bash
cd frontend
pnpm install
copy .env.example .env
pnpm dev
```

### 2) Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health`
- `POST /contact`

## Notes

- Update social links and project URLs in `frontend/src/content`.
- Choose email provider in `backend/.env` via `MAIL_PROVIDER=resend|smtp`.
