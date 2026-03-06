from pydantic import BaseModel


class HealthResponse(BaseModel):
	status: str


class OkResponse(BaseModel):
	ok: bool
