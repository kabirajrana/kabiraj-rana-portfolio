from pydantic import BaseModel


class HealthResponse(BaseModel):
	status: str
	timestamp: str
	uptime: float


class OkResponse(BaseModel):
	ok: bool
