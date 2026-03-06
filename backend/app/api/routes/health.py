from datetime import datetime
from datetime import timezone
import time

from fastapi import APIRouter
from fastapi import Request

from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request) -> HealthResponse:
	started_at = getattr(request.app.state, "started_at", time.time())
	uptime = max(0.0, time.time() - started_at)
	return HealthResponse(
		status="ok",
		timestamp=datetime.now(timezone.utc).isoformat(),
		uptime=round(uptime, 3),
	)
