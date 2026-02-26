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
```

Notes:
- For Gmail, use an App Password (not your normal password).
- Contact endpoint: `POST /contact`
- On success, backend sends:
	- Owner notification to `CONTACT_INBOX_EMAIL`
	- Auto-reply confirmation to the sender email
- The API response includes `auto_reply_sent` so you can track whether sender confirmation was delivered.
