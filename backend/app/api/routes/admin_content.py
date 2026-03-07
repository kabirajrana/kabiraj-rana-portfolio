from __future__ import annotations

from datetime import datetime
from datetime import timezone
import json
from typing import Any

from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Query
from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import EmailStr
from pydantic import Field

from app.services.admin_store import get_admin_store

router = APIRouter(prefix="/v1", tags=["admin-content"])

MESSAGE_STATUSES = {"UNREAD", "READ", "ARCHIVED", "DELETED"}


class MessageCreateRequest(BaseModel):
    sender: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=180)
    body: str = Field(min_length=1, max_length=8000)
    ipAddress: str | None = None
    userAgent: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class MessageStatusRequest(BaseModel):
    status: str


class ContactConfigRequest(BaseModel):
    id: str | None = None
    email: str
    locationText: str
    responseTime: str
    socialLinks: dict[str, Any] = Field(default_factory=dict)
    availabilityEnabled: bool = True
    availabilityHeadline: str = ""
    availabilitySubtext: str = ""


class SystemSettingsRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str | None = None
    siteName: str | None = None
    primaryEmail: str | None = None
    locationText: str | None = None
    responseTimeText: str | None = None
    availabilityEnabled: bool | None = None
    availabilityHeadline: str | None = None
    availabilitySubtext: str | None = None
    githubUrl: str | None = None
    linkedinUrl: str | None = None
    xUrl: str | None = None
    accentColor: str | None = None
    glowIntensity: float | None = None
    borderRadiusScale: float | None = None
    themeMode: str | None = None
    enableProjects: bool = True
    enableResearch: bool = True
    enableGitHub: bool | None = None
    enableExperience: bool = True
    socialLinks: dict[str, Any] | None = None
    maintenanceMode: bool | None = None


class ListResponse(BaseModel):
    model_config = ConfigDict(extra="allow")
    items: list[dict[str, Any]]
    total: int


def _parse_json_query(value: str | None) -> dict[str, Any] | None:
    if not value:
        return None
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


@router.get("/admin/messages")
async def list_messages(status: str | None = Query(default=None)) -> ListResponse:
    if status is not None and status not in MESSAGE_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid message status")

    store = get_admin_store()
    items = store.list_messages(status=status)
    return ListResponse(items=items, total=len(items))


@router.post("/admin/messages")
async def create_message(payload: MessageCreateRequest) -> dict[str, Any]:
    store = get_admin_store()
    return store.create_message(payload.model_dump())


@router.patch("/admin/messages/{message_id}/status")
async def update_message_status(message_id: str, payload: MessageStatusRequest) -> dict[str, Any]:
    if payload.status not in MESSAGE_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid message status")

    store = get_admin_store()
    updated = store.update_message_status(message_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Message not found")
    return updated


@router.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str) -> dict[str, Any]:
    store = get_admin_store()
    deleted = store.delete_message(message_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"id": message_id, "deleted": True}


@router.get("/admin/dashboard/kpis")
async def get_dashboard_kpis() -> dict[str, Any]:
    store = get_admin_store()
    unread = store.count_unread_messages()
    return {
        "projects": len(store.list_projects()),
        "research": len(store.list_research()),
        "experience": len(store.list_experience()),
        "unreadMessages": unread,
        "cvDownloads": sum(int(item.get("downloadCount", 0)) for item in store.list_resumes()),
        "visitors7d": 0,
        "visitors30d": 0,
    }


@router.get("/admin/dashboard/recent-activity")
async def get_recent_activity() -> ListResponse:
    store = get_admin_store()
    rows = store.list_audit_logs()
    return ListResponse(items=rows[:20], total=len(rows))


@router.get("/admin/dashboard/topbar-notifications")
async def get_topbar_notifications() -> dict[str, Any]:
    store = get_admin_store()
    unread = store.count_unread_messages()
    latest_health = store.get_latest_health_report()
    github = store.get_github_settings()
    return {
        "unreadMessages": unread,
        "githubError": github.get("lastError"),
        "githubLastSyncAt": github.get("lastSyncAt"),
        "healthSummary": latest_health.get("summary") if latest_health else None,
        "healthWarnings": int((latest_health or {}).get("warnings", 0)),
        "healthErrors": int((latest_health or {}).get("errors", 0)),
        "dueScheduled": 0,
    }


@router.get("/content/site/home")
async def get_home_content() -> dict[str, Any]:
    store = get_admin_store()
    return store.get_home_content()


@router.put("/admin/content/site/home")
async def upsert_home_content(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_home_content(payload)


@router.get("/content/site/about")
async def get_about_content() -> dict[str, Any]:
    store = get_admin_store()
    return store.get_about_content()


@router.put("/admin/content/site/about")
async def upsert_about_content(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_about_content(payload)


@router.get("/content/projects")
async def list_projects(where: str | None = Query(default=None)) -> ListResponse:
    store = get_admin_store()
    parsed_where = _parse_json_query(where)
    rows = store.list_projects(parsed_where)
    return ListResponse(items=rows, total=len(rows))


@router.get("/content/projects/paged")
async def list_projects_paged(
    query: str | None = Query(default=None),
    category: str | None = Query(default=None),
    status: str | None = Query(default=None),
    page: int = Query(default=1),
    pageSize: int = Query(default=10),
) -> ListResponse:
    store = get_admin_store()
    rows, total = store.list_projects_paged(query, category, status, page, pageSize)
    return ListResponse(items=rows, total=total)


@router.get("/content/projects/by-slug/{slug}")
async def get_project_by_slug(slug: str) -> dict[str, Any] | None:
    store = get_admin_store()
    return store.find_project_by_slug(slug)


@router.post("/admin/content/projects")
async def create_project(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_project(payload)


@router.put("/admin/content/projects/{project_id}")
async def update_project(project_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_project(payload, project_id)


@router.delete("/admin/content/projects/{project_id}")
async def delete_project(project_id: str) -> dict[str, Any]:
    store = get_admin_store()
    deleted = store.delete_project(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": project_id, "deleted": True}


@router.post("/admin/content/projects/reorder")
async def reorder_projects(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    ids = [str(item) for item in payload.get("ids", []) if str(item)] if isinstance(payload.get("ids"), list) else []
    rows = store.reorder_projects(ids)
    return {"items": rows, "total": len(rows)}


@router.get("/content/projects/categories")
async def list_project_categories() -> ListResponse:
    store = get_admin_store()
    rows = store.list_project_categories()
    return ListResponse(items=rows, total=len(rows))


@router.post("/admin/content/project-categories")
async def create_project_category(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_project_category(payload)


@router.put("/admin/content/project-categories/{category_id}")
async def update_project_category(category_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_project_category(payload, category_id)


@router.delete("/admin/content/project-categories/{category_id}")
async def delete_project_category(category_id: str) -> dict[str, Any]:
    store = get_admin_store()
    deleted = store.delete_project_category(category_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project category not found")
    return {"id": category_id, "deleted": True}


@router.post("/admin/content/project-categories/reorder")
async def reorder_project_categories(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    ids = [str(item) for item in payload.get("ids", []) if str(item)] if isinstance(payload.get("ids"), list) else []
    rows = store.reorder_project_categories(ids)
    return {"items": rows, "total": len(rows)}


@router.get("/content/projects/page-config")
async def get_projects_page_config() -> dict[str, Any]:
    store = get_admin_store()
    return store.get_projects_page_config()


@router.put("/admin/content/projects/page-config")
async def upsert_projects_page_config(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_projects_page_config(payload)


@router.get("/content/experience")
async def list_experience() -> ListResponse:
    store = get_admin_store()
    rows = store.list_experience()
    return ListResponse(items=rows, total=len(rows))


@router.post("/admin/content/experience")
async def create_experience(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_experience(payload)


@router.put("/admin/content/experience/{experience_id}")
async def update_experience(experience_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_experience(payload, experience_id)


@router.delete("/admin/content/experience/{experience_id}")
async def delete_experience(experience_id: str) -> dict[str, Any]:
    store = get_admin_store()
    deleted = store.delete_experience(experience_id)
    return {"count": 1 if deleted else 0}


@router.post("/admin/content/experience/reorder")
async def reorder_experience(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    ids = [str(item) for item in payload.get("ids", []) if str(item)] if isinstance(payload.get("ids"), list) else []
    rows = store.reorder_experience(ids)
    return {"items": rows, "total": len(rows)}


@router.get("/content/experience/page-config")
async def get_experience_page_config() -> dict[str, Any]:
    store = get_admin_store()
    return store.get_experience_page_config()


@router.put("/admin/content/experience/page-config")
async def upsert_experience_page_config(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_experience_page_config(payload)


@router.get("/content/certifications")
async def list_certifications(visible: int | None = Query(default=None)) -> ListResponse:
    store = get_admin_store()
    rows = store.list_certifications(visible_only=bool(visible))
    return ListResponse(items=rows, total=len(rows))


@router.post("/admin/content/certifications")
async def create_certification(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_certification(payload)


@router.put("/admin/content/certifications/{certification_id}")
async def update_certification(certification_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_certification(payload, certification_id)


@router.delete("/admin/content/certifications/{certification_id}")
async def delete_certification(certification_id: str) -> dict[str, Any]:
    store = get_admin_store()
    deleted = store.delete_certification(certification_id)
    return {"count": 1 if deleted else 0}


@router.get("/content/research")
async def list_research(where: str | None = Query(default=None)) -> ListResponse:
    store = get_admin_store()
    parsed_where = _parse_json_query(where)
    rows = store.list_research(parsed_where)
    return ListResponse(items=rows, total=len(rows))


@router.get("/content/research/paged")
async def list_research_paged(
    query: str | None = Query(default=None),
    status: str | None = Query(default=None),
    type: str | None = Query(default=None),
    year: int | None = Query(default=None),
    tag: str | None = Query(default=None),
    page: int = Query(default=1),
    pageSize: int = Query(default=10),
) -> ListResponse:
    store = get_admin_store()
    rows, total = store.list_research_paged(query, status, type, year, tag, page, pageSize)
    return ListResponse(items=rows, total=total)


@router.get("/content/research/by-slug/{slug}")
async def get_research_by_slug(slug: str) -> dict[str, Any] | None:
    store = get_admin_store()
    return store.get_research_by_slug(slug)


@router.get("/content/research/by-id/{entry_id}")
async def get_research_by_id(entry_id: str) -> dict[str, Any] | None:
    store = get_admin_store()
    return store.get_research_by_id(entry_id)


@router.post("/content/research/adjacent")
async def get_research_adjacent(payload: dict[str, Any]) -> list[dict[str, Any] | None]:
    store = get_admin_store()
    prev_row, next_row = store.get_adjacent_research(payload)
    return [prev_row, next_row]


@router.post("/content/research/related")
async def get_research_related(payload: dict[str, Any]) -> list[dict[str, Any]]:
    store = get_admin_store()
    slugs = [str(item) for item in payload.get("slugs", []) if str(item)] if isinstance(payload.get("slugs"), list) else []
    exclude_id = str(payload.get("excludeId")) if payload.get("excludeId") else None
    return store.list_related_research(slugs, exclude_id)


@router.post("/admin/content/research")
async def create_research(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_research(payload)


@router.put("/admin/content/research/{entry_id}")
async def update_research(entry_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_research(payload, entry_id)


@router.delete("/admin/content/research/{entry_id}")
async def delete_research(entry_id: str) -> dict[str, Any]:
    store = get_admin_store()
    deleted = store.delete_research(entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Research entry not found")
    return {"id": entry_id, "deleted": True}


@router.post("/admin/content/research/reorder")
async def reorder_research(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    ids = [str(item) for item in payload.get("ids", []) if str(item)] if isinstance(payload.get("ids"), list) else []
    rows = store.reorder_research(ids)
    return {"items": rows, "total": len(rows)}


@router.get("/content/research/page-config")
async def get_research_page_config() -> dict[str, Any]:
    store = get_admin_store()
    return store.get_research_page_config()


@router.put("/admin/content/research/page-config")
async def upsert_research_page_config(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_research_page_config(payload)


@router.get("/content/research/filter-tabs")
async def list_research_filter_tabs(visible: int | None = Query(default=None)) -> ListResponse:
    store = get_admin_store()
    rows = store.list_research_filter_tabs(visible_only=bool(visible))
    return ListResponse(items=rows, total=len(rows))


@router.post("/admin/content/research/filter-tabs")
async def create_research_filter_tab(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_research_filter_tab(payload)


@router.put("/admin/content/research/filter-tabs/{tab_id}")
async def update_research_filter_tab(tab_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_research_filter_tab(payload, tab_id)


@router.delete("/admin/content/research/filter-tabs/{tab_id}")
async def delete_research_filter_tab(tab_id: str) -> dict[str, Any]:
    store = get_admin_store()
    deleted = store.delete_research_filter_tab(tab_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Research filter tab not found")
    return {"id": tab_id, "deleted": True}


@router.get("/admin/media")
async def list_media(search: str | None = Query(default=None)) -> ListResponse:
    store = get_admin_store()
    rows = store.list_media(search)
    return ListResponse(items=rows, total=len(rows))


@router.post("/admin/media")
async def create_media(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.create_media(payload)


@router.get("/admin/resumes")
async def list_resumes() -> ListResponse:
    store = get_admin_store()
    rows = store.list_resumes()
    return ListResponse(items=rows, total=len(rows))


@router.post("/admin/resumes")
async def create_resume(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.create_resume(payload)


@router.post("/admin/resumes/{resume_id}/activate")
async def activate_resume(resume_id: str) -> dict[str, Any]:
    store = get_admin_store()
    row = store.activate_resume(resume_id)
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found")
    return row


@router.get("/admin/seo/configs")
async def list_seo_configs() -> ListResponse:
    store = get_admin_store()
    rows = store.list_seo_configs()
    return ListResponse(items=rows, total=len(rows))


@router.put("/admin/seo/configs")
async def upsert_seo_config(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_seo_config(payload)


@router.get("/admin/github/settings")
async def get_github_settings() -> dict[str, Any]:
    store = get_admin_store()
    return store.get_github_settings()


@router.put("/admin/github/settings")
async def upsert_github_settings(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_github_settings(payload)


@router.get("/content/contact/config")
async def get_contact_config() -> dict[str, Any]:
    store = get_admin_store()
    return store.get_contact_config()


@router.put("/admin/content/contact/config")
async def upsert_contact_config(payload: ContactConfigRequest) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_contact_config(payload.model_dump())


@router.get("/content/system/settings")
async def get_system_settings() -> dict[str, Any]:
    store = get_admin_store()
    return store.get_system_settings()


@router.put("/admin/system/settings")
async def upsert_system_settings(payload: SystemSettingsRequest) -> dict[str, Any]:
    store = get_admin_store()
    return store.upsert_system_settings(payload.model_dump(exclude_none=True))


@router.get("/admin/audit-logs")
async def list_audit_logs(
    entityType: str | None = Query(default=None),
    action: str | None = Query(default=None),
    startDate: str | None = Query(default=None),
    endDate: str | None = Query(default=None),
) -> ListResponse:
    store = get_admin_store()
    rows = store.list_audit_logs(entityType, action, _parse_datetime(startDate), _parse_datetime(endDate))
    return ListResponse(items=rows, total=len(rows))


@router.post("/admin/audit-logs")
async def create_audit_log(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.create_audit_log(payload)


@router.post("/admin/revisions")
async def create_revision(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.create_revision(payload)


@router.get("/admin/revisions")
async def list_revisions(entityType: str = Query(...), entityId: str = Query(...)) -> list[dict[str, Any]]:
    store = get_admin_store()
    return store.list_revisions(entityType, entityId)


@router.post("/admin/revisions/{revision_id}/restore")
async def restore_revision(revision_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    restored = store.restore_revision(revision_id, str(payload.get("actorAdminId") or "") or None)
    if not restored:
        raise HTTPException(status_code=404, detail="Revision not found")
    return restored


@router.post("/admin/health/reports")
async def create_health_report(payload: dict[str, Any]) -> dict[str, Any]:
    store = get_admin_store()
    return store.create_health_report(payload)


@router.get("/admin/health/reports/latest")
async def get_health_report_latest() -> dict[str, Any]:
    store = get_admin_store()
    latest = store.get_latest_health_report()
    if latest:
        return latest
    return {
        "id": "local-health",
        "status": "ok",
        "summary": "No report yet.",
        "warnings": 0,
        "errors": 0,
        "checks": [],
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/admin/content/publish-scheduled")
async def publish_scheduled_content() -> dict[str, Any]:
    store = get_admin_store()
    return store.auto_publish_scheduled_content()


@router.get("/admin/users/by-email")
async def get_admin_user_by_email(email: str = Query(...)) -> dict[str, Any] | None:
    store = get_admin_store()
    return store.get_admin_user_by_email(email)


@router.post("/admin/users/{user_id}/touch-login")
async def touch_admin_user_login(user_id: str) -> dict[str, Any]:
    store = get_admin_store()
    user = store.touch_admin_last_login(user_id)
    if not user:
        return {"id": user_id, "updated": False}
    return user
