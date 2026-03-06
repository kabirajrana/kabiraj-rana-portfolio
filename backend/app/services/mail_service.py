from email.message import EmailMessage
import smtplib
import logging

import httpx
from fastapi import HTTPException

from app.core.config import Settings
from app.schemas.contact import ContactRequest

logger = logging.getLogger(__name__)


def _build_text_message(payload: ContactRequest) -> str:
	return (
		"New portfolio contact request\n\n"
		f"Name: {payload.name}\n"
		f"Email: {payload.email}\n"
		f"Subject: {payload.subject}\n\n"
		"Message:\n"
		f"{payload.message}\n"
	)


def send_via_smtp(payload: ContactRequest, settings: Settings) -> None:
	if not all([settings.smtp_host, settings.smtp_from, settings.smtp_to]):
		raise HTTPException(status_code=500, detail="SMTP is not configured")

	message = EmailMessage()
	message["Subject"] = f"Portfolio Contact: {payload.subject}"
	message["From"] = settings.smtp_from
	message["To"] = settings.smtp_to
	message["Reply-To"] = str(payload.email)
	message.set_content(_build_text_message(payload))

	with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
		server.starttls()
		if settings.smtp_user and settings.smtp_pass:
			server.login(settings.smtp_user, settings.smtp_pass)
		server.send_message(message)


async def send_via_resend(payload: ContactRequest, settings: Settings) -> None:
	if not all([settings.resend_api_key, settings.resend_from, settings.resend_to]):
		raise HTTPException(status_code=500, detail="Resend is not configured")

	async with httpx.AsyncClient(timeout=15) as client:
		response = await client.post(
			"https://api.resend.com/emails",
			headers={
				"Authorization": f"Bearer {settings.resend_api_key}",
				"Content-Type": "application/json",
			},
			json={
				"from": settings.resend_from,
				"to": [settings.resend_to],
				"subject": f"Portfolio Contact: {payload.subject}",
				"text": _build_text_message(payload),
				"reply_to": str(payload.email),
			},
		)
	if response.status_code >= 400:
		raise HTTPException(status_code=502, detail="Failed to send email")


def _smtp_configured(settings: Settings) -> bool:
	return bool(settings.smtp_host and settings.smtp_from and settings.smtp_to)


def _resend_configured(settings: Settings) -> bool:
	return bool(settings.resend_api_key and settings.resend_from and settings.resend_to)


async def send_contact_email(payload: ContactRequest, settings: Settings) -> None:
	provider = settings.mail_provider.lower()

	if settings.app_env != "production":
		if provider == "smtp" and not _smtp_configured(settings):
			logger.warning("SMTP not configured in non-production; skipping send.")
			return
		if provider == "resend" and not _resend_configured(settings):
			logger.warning("Resend not configured in non-production; skipping send.")
			return

	if provider == "resend":
		await send_via_resend(payload, settings)
		return

	if provider == "smtp":
		send_via_smtp(payload, settings)
		return

	raise HTTPException(status_code=500, detail="MAIL_PROVIDER must be resend or smtp")
