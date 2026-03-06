from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import get_settings
from app.core.cors import setup_cors

settings = get_settings()

app = FastAPI(
	title="Kabiraj Portfolio API",
	version="1.0.0",
	docs_url="/docs" if settings.app_env != "production" else None,
	redoc_url="/redoc" if settings.app_env != "production" else None,
)

setup_cors(app, settings)
app.include_router(api_router)
