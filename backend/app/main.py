import os
import time

from fastapi import FastAPI
import uvicorn

from app.api.router import api_router
from app.core.config import get_settings
from app.core.cors import setup_cors
from app.services.credential_store import init_credential_store

settings = get_settings()

app = FastAPI(
	title="Kabiraj Portfolio API",
	version="1.0.0",
	docs_url="/docs" if settings.app_env != "production" else None,
	redoc_url="/redoc" if settings.app_env != "production" else None,
)

setup_cors(app, settings)
app.include_router(api_router)

# Track process start time for health probe uptime reporting.
app.state.started_at = time.time()


@app.on_event("startup")
def bootstrap_data_stores() -> None:
	init_credential_store(settings.database_url, seed_on_empty=settings.credentials_seed_on_empty)


if __name__ == "__main__":
	uvicorn.run(
		"app.main:app",
		host="0.0.0.0",
		port=int(os.getenv("PORT", "8000")),
	)
