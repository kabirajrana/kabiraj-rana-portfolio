from fastapi import APIRouter

from app.api.routes.admin_content import router as admin_content_router
from app.api.routes.contact import router as contact_router
from app.api.routes.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(contact_router)
api_router.include_router(admin_content_router)
