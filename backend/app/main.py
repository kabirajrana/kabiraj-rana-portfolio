from fastapi import FastAPI

from app.routers import auth, contact, health, projects


def create_app() -> FastAPI:
    app = FastAPI(title="Worldclass Portfolio API")

    app.include_router(health.router, tags=["health"])
    app.include_router(projects.router, prefix="/projects", tags=["projects"])
    app.include_router(contact.router, prefix="/contact", tags=["contact"])
    app.include_router(auth.router, prefix="/auth", tags=["auth"])

    return app


app = create_app()
