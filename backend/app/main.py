import os
import time
import logging

from fastapi import FastAPI
import uvicorn

from app.api.router import api_router
from app.core.config import get_settings
from app.core.cors import setup_cors
from app.services.credential_store import init_credential_store
from app.services.postgres_store import ensure_admin_defaults
from app.db.base import Base
from app.db.models import ContentRecord
from app.db.session import get_engine

logger = logging.getLogger(__name__)

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
	try:
		# Read the deployment-provided process environment directly. This avoids
		# relying on dotenv discovery or a stale Settings instance for the DB URL.
		database_url = os.getenv("DATABASE_URL", "").strip()
		logger.info("[startup] DATABASE_URL detected: %s", bool(database_url))
		if not database_url:
			raise RuntimeError("DATABASE_URL is missing from the backend process environment")

		init_credential_store(database_url, seed_on_empty=settings.credentials_seed_on_empty)
		Base.metadata.create_all(bind=get_engine())
		ensure_admin_defaults()
	except Exception:
		logger.exception("[startup] PostgreSQL initialization failed")
		if settings.app_env == "production":
			raise


if __name__ == "__main__":
	uvicorn.run(
		"app.main:app",
		host="0.0.0.0",
		port=int(os.getenv("PORT", "8000")),
	)
