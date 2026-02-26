import smtplib
from email.message import EmailMessage

from app.core.config import Settings


class MailerError(RuntimeError):
    pass


def send_mail(
    to_email: str,
    subject: str,
    body: str,
    reply_to: str | None = None,
    high_priority: bool = False,
) -> None:
    settings = Settings()

    if not settings.smtp_host:
        raise MailerError("SMTP is not configured. Set SMTP_HOST and SMTP credentials.")

    from_email = settings.mail_from_email or settings.smtp_username
    if not from_email:
        raise MailerError("MAIL_FROM_EMAIL or SMTP_USERNAME must be configured.")

    if settings.smtp_username and not settings.smtp_password:
        raise MailerError("SMTP_PASSWORD is missing. For Gmail, use a 16-character App Password.")

    if settings.smtp_password and not settings.smtp_username:
        raise MailerError("SMTP_USERNAME is missing while SMTP_PASSWORD is set.")

    message = EmailMessage()
    message["From"] = f"{settings.mail_from_name} <{from_email}>"
    message["To"] = to_email
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to
    if high_priority:
        message["X-Priority"] = "1"
        message["X-MSMail-Priority"] = "High"
        message["Importance"] = "High"
    message.set_content(body)

    smtp_cls = smtplib.SMTP_SSL if settings.smtp_use_ssl else smtplib.SMTP

    try:
        with smtp_cls(settings.smtp_host, settings.smtp_port, timeout=settings.smtp_timeout_seconds) as smtp:
            if settings.smtp_use_tls and not settings.smtp_use_ssl:
                smtp.starttls()

            if settings.smtp_username and settings.smtp_password:
                smtp.login(settings.smtp_username, settings.smtp_password)

            smtp.send_message(message)
    except smtplib.SMTPAuthenticationError as exc:
        raise MailerError(
            "SMTP authentication failed. Verify SMTP_USERNAME and SMTP_PASSWORD. "
            "For Gmail, enable 2-Step Verification and use an App Password."
        ) from exc
    except smtplib.SMTPException as exc:
        raise MailerError(f"SMTP error: {exc}") from exc
