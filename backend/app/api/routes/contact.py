from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.config import Settings, get_settings
from app.schemas.common import OkResponse
from app.schemas.contact import ContactRequest
from app.services.mail_service import send_contact_email
from app.utils.rate_limit import InMemoryRateLimiter

router = APIRouter(tags=["contact"])
_rate_limiter: InMemoryRateLimiter | None = None


def get_rate_limiter(settings: Settings) -> InMemoryRateLimiter:
	global _rate_limiter
	if _rate_limiter is None:
		_rate_limiter = InMemoryRateLimiter(
			max_requests=settings.contact_rate_limit,
			window_seconds=settings.contact_rate_window_sec,
		)
	return _rate_limiter


@router.post("/contact", response_model=OkResponse)
async def submit_contact(
	request: Request,
	payload: ContactRequest,
	settings: Settings = Depends(get_settings),
) -> OkResponse:
	if payload.honeypot:
		return OkResponse(ok=True)

	limiter = get_rate_limiter(settings)
	client_ip = request.client.host if request.client else "unknown"

	if not limiter.allow(client_ip):
		raise HTTPException(
			status_code=status.HTTP_429_TOO_MANY_REQUESTS,
			detail="Too many requests. Please try again later.",
		)

	await send_contact_email(payload, settings)
	return OkResponse(ok=True)
