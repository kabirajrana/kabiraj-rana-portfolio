from datetime import UTC, datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.deps import get_db
from app.models.message import Message
from app.schemas.message import MessageCreate
from app.services.mailer import send_mail


router = APIRouter()


def _send_owner_notification(
    inbox_email: str,
    owner_subject: str,
    owner_body: str,
    sender_email: str,
) -> None:
    try:
        send_mail(
            to_email=inbox_email,
            subject=owner_subject,
            body=owner_body,
            reply_to=sender_email,
            high_priority=True,
        )
    except Exception:
        return


def _send_sender_auto_reply(
    sender_email: str,
    sender_subject: str,
    sender_body: str,
    inbox_email: str,
) -> None:
    try:
        send_mail(
            to_email=sender_email,
            subject=sender_subject,
            body=sender_body,
            reply_to=inbox_email,
        )
    except Exception:
        return


@router.get("/messages")
def list_messages(limit: int = 50, db: Session = Depends(get_db)):
    safe_limit = min(max(limit, 1), 200)
    rows = db.scalars(select(Message).order_by(Message.id.desc()).limit(safe_limit)).all()

    return {
        "ok": True,
        "count": len(rows),
        "items": [
            {
                "id": row.id,
                "name": row.name,
                "email": row.email,
                "subject": row.subject,
                "body": row.body,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in rows
        ],
    }


@router.post("")
def submit_contact(
    payload: MessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    current_settings = Settings()
    inbox_email = current_settings.contact_inbox_email

    sender_name = (payload.name or "Visitor").strip()
    sender_email = payload.email.strip().lower()
    subject = (payload.subject or "New contact message").strip()
    message_body = payload.body.strip()

    submitted_at = datetime.now(UTC)
    owner_subject = f"[NEW CONTACT 🔔] {subject}"

    sender_subject = "Thanks for your message — I received it"
    sender_body = (
        f"Hi {sender_name},\n\n"
        "Thanks for reaching out through my portfolio. I received your message and will get back to you within 24–48 hours.\n\n"
        "Your submission summary:\n"
        f"- Subject: {subject}\n"
        f"- Message: {message_body}\n\n"
        "Best regards,\n"
        "Kabiraj Rana\n"
    )

    record = Message(email=sender_email, name=sender_name or None, subject=subject, body=message_body)
    try:
        db.add(record)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save contact message: {exc}",
        ) from exc

    delivery_issue: str | None = None

    if inbox_email:
        owner_body = (
            "You received a new contact form submission.\n\n"
            f"Message ID: {record.id}\n"
            f"Name: {sender_name}\n"
            f"Email: {sender_email}\n"
            f"Subject: {subject}\n"
            f"Received At (UTC): {submitted_at.isoformat()}\n\n"
            "Message:\n"
            f"{message_body}\n"
        )
        background_tasks.add_task(
            _send_owner_notification,
            inbox_email,
            owner_subject,
            owner_body,
            sender_email,
        )

        background_tasks.add_task(
            _send_sender_auto_reply,
            sender_email,
            sender_subject,
            sender_body,
            inbox_email,
        )
    else:
        delivery_issue = "CONTACT_INBOX_EMAIL is not configured on the server."

    response_message = "Thanks for reaching out. Your message was sent successfully."
    if delivery_issue:
        response_message = "Thanks for reaching out. Your message was received and saved."

    return {
        "ok": True,
        "email_notification_sent": bool(inbox_email),
        "auto_reply_sent": bool(inbox_email),
        "delivery_issue": delivery_issue,
        "message": response_message,
    }
