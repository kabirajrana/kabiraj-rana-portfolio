# backend

FastAPI application.

## Contact Email Setup

To receive contact form messages in your email, configure these environment variables in `backend/.env`:

```env
CONTACT_INBOX_EMAIL=your-email@example.com

MAIL_FROM_EMAIL=your-email@example.com
MAIL_FROM_NAME=Worldclass Portfolio

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
SMTP_USE_SSL=false
SMTP_TIMEOUT_SECONDS=20

CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_ORIGIN_REGEX=^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$
```

Notes:
- For Gmail, use an App Password (not your normal password).
- Contact endpoint: `POST /contact`
- If frontend is opened via LAN URL (for example from a phone), set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` to your backend LAN URL (example: `http://192.168.137.1:8002`).
- On success, backend sends:
	- Owner notification to `CONTACT_INBOX_EMAIL`
	- Auto-reply confirmation to the sender email
- The API response includes `auto_reply_sent` so you can track whether sender confirmation was delivered.
