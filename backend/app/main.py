from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.init_db import init_db
from app.routers import auth, contact, health, projects


def create_app() -> FastAPI:
    app = FastAPI(title="Worldclass Portfolio API")

    allowed_origins = [origin.strip() for origin in settings.cors_allow_origins.split(",") if origin.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, tags=["health"])
    app.include_router(projects.router, prefix="/projects", tags=["projects"])
    app.include_router(contact.router, prefix="/contact", tags=["contact"])
    app.include_router(auth.router, prefix="/auth", tags=["auth"])

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    return app


app = create_app()
