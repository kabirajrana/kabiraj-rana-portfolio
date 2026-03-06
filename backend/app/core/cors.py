from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import Settings


def setup_cors(app: FastAPI, settings: Settings) -> None:
	app.add_middleware(
		CORSMiddleware,
		allow_origins=[settings.frontend_origin],
		allow_credentials=True,
		allow_methods=["GET", "POST", "OPTIONS"],
		allow_headers=["*"],
	)
