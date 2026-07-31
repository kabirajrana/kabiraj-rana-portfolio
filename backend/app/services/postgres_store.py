from __future__ import annotations

from datetime import datetime, timezone
import os
from typing import Any
from uuid import uuid4

from sqlalchemy import and_, delete, or_, select

from app.db.models import ContentRecord
from app.db.session import open_session


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: Any) -> str | None:
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value) if value else None


def _json_safe(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    return value


def _contains(value: Any, query: str) -> bool:
    return query.lower() in str(value or "").lower()


def _resource_name(key: str) -> str:
    return key.replace("-", "_")


class PostgresAdminStore:
    """PostgreSQL-backed implementation of the former admin store contract."""

    def _key(self, resource: str, record_id: str) -> str:
        return f"{resource}:{record_id}"

    def _row_payload(self, row: ContentRecord) -> dict[str, Any]:
        payload = dict(row.payload or {})
        payload.setdefault("id", row.record_id)
        payload.setdefault("createdAt", _iso(row.created_at))
        payload.setdefault("updatedAt", _iso(row.updated_at))
        return payload

    def _record_metadata(self, payload: dict[str, Any]) -> tuple[str | None, str | None, str | None, int]:
        slug = payload.get("slug")
        status = payload.get("status")
        record_type = payload.get("type")
        sort_order = payload.get("sortOrder", payload.get("sort_order", payload.get("displayOrder", 0)))
        try:
            sort_order = int(sort_order or 0)
        except (TypeError, ValueError):
            sort_order = 0
        return (
            str(slug) if slug else None,
            str(status) if status else None,
            str(record_type) if record_type else None,
            sort_order,
        )

    def _find(self, session, resource: str, record_id: str) -> ContentRecord | None:
        return session.scalar(
            select(ContentRecord).where(
                ContentRecord.resource == resource,
                ContentRecord.record_id == str(record_id),
            )
        )

    def _serialize(self, row: ContentRecord | None) -> dict[str, Any] | None:
        return self._row_payload(row) if row else None

    def _upsert(self, resource: str, payload: dict[str, Any], record_id: str | None = None) -> dict[str, Any]:
        clean = _json_safe(dict(payload))
        identifier = str(record_id or clean.get("id") or uuid4())
        clean["id"] = identifier
        with open_session() as session:
            with session.begin():
                row = self._find(session, resource, identifier)
                if row is None:
                    now = _now()
                    row = ContentRecord(
                        key=self._key(resource, identifier),
                        resource=resource,
                        record_id=identifier,
                        payload=clean,
                        created_at=now,
                        updated_at=now,
                    )
                    session.add(row)
                else:
                    merged = dict(row.payload or {})
                    merged.update(clean)
                    merged["updatedAt"] = _now().isoformat()
                    row.payload = merged
                    row.updated_at = _now()
                slug, status, record_type, sort_order = self._record_metadata(clean)
                row.slug = slug
                row.status = status
                row.record_type = record_type
                row.sort_order = sort_order
            return self._row_payload(row)

    def _list(self, resource: str) -> list[dict[str, Any]]:
        with open_session() as session:
            rows = session.scalars(
                select(ContentRecord)
                .where(ContentRecord.resource == resource)
                .order_by(ContentRecord.sort_order.asc(), ContentRecord.created_at.asc())
            ).all()
            return [self._row_payload(row) for row in rows]

    def _delete(self, resource: str, record_id: str) -> bool:
        with open_session() as session:
            with session.begin():
                row = self._find(session, resource, record_id)
                if row is None:
                    return False
                session.delete(row)
            return True

    def _config(self, record_id: str, default: dict[str, Any]) -> dict[str, Any]:
        row = self._get("configs", record_id)
        return row or {"id": record_id, **default}

    def _get(self, resource: str, record_id: str) -> dict[str, Any] | None:
        with open_session() as session:
            return self._serialize(self._find(session, resource, record_id))

    def list_messages(self, status: str | None = None) -> list[dict[str, Any]]:
        rows = self._list("messages")
        return [row for row in rows if status is None or row.get("status") == status]

    def count_unread_messages(self) -> int:
        return sum(1 for row in self.list_messages("UNREAD"))

    def create_message(self, payload: dict[str, Any]) -> dict[str, Any]:
        now = _now().isoformat()
        return self._upsert("messages", {**payload, "id": payload.get("id") or str(uuid4()), "createdAt": now, "updatedAt": now})

    def update_message_status(self, message_id: str, status: str) -> dict[str, Any] | None:
        row = self._get("messages", message_id)
        if row is None:
            return None
        return self._upsert("messages", {**row, "status": status, "updatedAt": _now().isoformat()}, message_id)

    def delete_message(self, message_id: str) -> bool:
        return self._delete("messages", message_id)

    def list_projects(self, where: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        rows = self._list("projects")
        if not where:
            return rows
        return [row for row in rows if all(row.get(key) == value for key, value in where.items())]

    def list_projects_paged(self, query: str | None, category: str | None, status: str | None, page: int, page_size: int) -> tuple[list[dict[str, Any]], int]:
        rows = self.list_projects()
        if query:
            rows = [row for row in rows if any(_contains(row.get(key), query) for key in ("title", "summary", "description", "slug"))]
        if category:
            rows = [row for row in rows if row.get("category") == category]
        if status:
            rows = [row for row in rows if row.get("status") == status]
        total = len(rows)
        start = max(0, page - 1) * max(1, page_size)
        return rows[start : start + max(1, page_size)], total

    def upsert_project(self, payload: dict[str, Any], project_id: str | None = None) -> dict[str, Any]:
        return self._upsert("projects", payload, project_id)

    def delete_project(self, project_id: str) -> bool:
        return self._delete("projects", project_id)

    def reorder_projects(self, ids: list[str]) -> list[dict[str, Any]]:
        for index, item_id in enumerate(ids):
            row = self._get("projects", item_id)
            if row:
                self._upsert("projects", {**row, "sortOrder": index}, item_id)
        return self.list_projects()

    def find_project_by_slug(self, slug: str) -> dict[str, Any] | None:
        with open_session() as session:
            row = session.scalar(select(ContentRecord).where(ContentRecord.resource == "projects", ContentRecord.slug == slug))
            return self._serialize(row)

    def list_project_categories(self) -> list[dict[str, Any]]:
        return self._list("project_categories")

    def upsert_project_category(self, payload: dict[str, Any], category_id: str | None = None) -> dict[str, Any]:
        return self._upsert("project_categories", payload, category_id)

    def delete_project_category(self, category_id: str) -> bool:
        return self._delete("project_categories", category_id)

    def reorder_project_categories(self, ids: list[str]) -> list[dict[str, Any]]:
        for index, item_id in enumerate(ids):
            row = self._get("project_categories", item_id)
            if row:
                self._upsert("project_categories", {**row, "sortOrder": index}, item_id)
        return self.list_project_categories()

    def get_home_content(self) -> dict[str, Any]:
        return self._config("home", {"slug": "home", "status": "DRAFT", "draftJson": {}})

    def upsert_home_content(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("configs", {**payload, "id": "home", "slug": "home"}, "home")

    def get_about_content(self) -> dict[str, Any]:
        return self._config("about", {"slug": "about", "status": "DRAFT", "draftJson": {}})

    def upsert_about_content(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("configs", {**payload, "id": "about", "slug": "about"}, "about")

    def get_projects_page_config(self) -> dict[str, Any]:
        return self._config("projects_page_config", {"title": "Projects", "subtitle": "Selected work and experiments."})

    def upsert_projects_page_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("configs", payload, "projects_page_config")

    def list_experience(self) -> list[dict[str, Any]]:
        return self._list("experience")

    def upsert_experience(self, payload: dict[str, Any], experience_id: str | None = None) -> dict[str, Any]:
        return self._upsert("experience", payload, experience_id)

    def delete_experience(self, experience_id: str) -> bool:
        return self._delete("experience", experience_id)

    def reorder_experience(self, ids: list[str]) -> list[dict[str, Any]]:
        for index, item_id in enumerate(ids):
            row = self._get("experience", item_id)
            if row:
                self._upsert("experience", {**row, "sortOrder": index}, item_id)
        return self.list_experience()

    def get_experience_page_config(self) -> dict[str, Any]:
        return self._config("experience_page_config", {"smallLabel": "EXPERIENCE", "title": "Experience timeline", "showTimeline": True, "showCertifications": True})

    def upsert_experience_page_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("configs", payload, "experience_page_config")

    def list_research(self, where: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        rows = self._list("research")
        return rows if not where else [row for row in rows if all(row.get(key) == value for key, value in where.items())]

    def list_research_paged(self, query: str | None, status: str | None, entry_type: str | None, year: int | None, tag: str | None, page: int, page_size: int) -> tuple[list[dict[str, Any]], int]:
        rows = self.list_research()
        if query:
            rows = [row for row in rows if any(_contains(row.get(key), query) for key in ("title", "summary", "description", "slug"))]
        if status:
            rows = [row for row in rows if str(row.get("status", "")).upper() == status.upper()]
        if entry_type:
            rows = [row for row in rows if str(row.get("type", "")).upper() == entry_type.upper()]
        if year is not None:
            rows = [row for row in rows if int(row.get("year", 0) or 0) == year]
        if tag:
            rows = [row for row in rows if tag in (row.get("tags") or [])]
        total = len(rows)
        start = max(0, page - 1) * max(1, page_size)
        return rows[start : start + max(1, page_size)], total

    def get_research_by_slug(self, slug: str) -> dict[str, Any] | None:
        with open_session() as session:
            return self._serialize(session.scalar(select(ContentRecord).where(ContentRecord.resource == "research", ContentRecord.slug == slug)))

    def get_research_by_id(self, entry_id: str) -> dict[str, Any] | None:
        return self._get("research", entry_id)

    def list_related_research(self, slugs: list[str], exclude_id: str | None = None) -> list[dict[str, Any]]:
        return [row for row in self.list_research() if row.get("slug") in slugs and row.get("id") != exclude_id]

    def get_adjacent_research(self, payload: dict[str, Any]) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
        rows = self.list_research()
        current = next((index for index, row in enumerate(rows) if row.get("id") == payload.get("id") or row.get("slug") == payload.get("slug")), -1)
        target_id = str(payload.get("id") or "")
        target_year = int(payload.get("year") or 0)
        status = str(payload.get("status") or "")
        rows = self.list_research()
        if status:
            rows = [row for row in rows if str(row.get("status", "")).upper() == status.upper()]
        rows.sort(key=lambda row: (int(row.get("year", 0) or 0), str(row.get("publishedAt") or ""), str(row.get("createdAt") or "")))
        current = next((index for index, row in enumerate(rows) if str(row.get("id")) == target_id), -1)
        if current < 0 and target_year:
            current = next((index for index, row in enumerate(rows) if int(row.get("year", 0) or 0) == target_year), -1)
        return (rows[current - 1] if current > 0 else None, rows[current + 1] if 0 <= current < len(rows) - 1 else None)

    def upsert_research(self, payload: dict[str, Any], entry_id: str | None = None) -> dict[str, Any]:
        return self._upsert("research", payload, entry_id)

    def delete_research(self, entry_id: str) -> bool:
        return self._delete("research", entry_id)

    def reorder_research(self, ids: list[str]) -> list[dict[str, Any]]:
        for index, item_id in enumerate(ids):
            row = self._get("research", item_id)
            if row:
                self._upsert("research", {**row, "sortOrder": index}, item_id)
        return self.list_research()

    def get_research_page_config(self) -> dict[str, Any]:
        return self._config("research_page_config", {"title": "Research", "subtitle": "Applied AI/ML research and systems."})

    def upsert_research_page_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("configs", payload, "research_page_config")

    def list_research_filter_tabs(self, visible_only: bool = False) -> list[dict[str, Any]]:
        rows = self._list("research_filter_tabs")
        return [row for row in rows if not visible_only or bool(row.get("isVisible", row.get("visible", True)))]

    def upsert_research_filter_tab(self, payload: dict[str, Any], tab_id: str | None = None) -> dict[str, Any]:
        return self._upsert("research_filter_tabs", payload, tab_id)

    def delete_research_filter_tab(self, tab_id: str) -> bool:
        return self._delete("research_filter_tabs", tab_id)

    def list_media(self, search: str | None = None) -> list[dict[str, Any]]:
        rows = self._list("media")
        return rows if not search else [row for row in rows if any(_contains(row.get(key), search) for key in ("name", "url", "filename", "alt"))]

    def create_media(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("media", payload)

    def list_resumes(self) -> list[dict[str, Any]]:
        return self._list("resumes")

    def create_resume(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("resumes", payload)

    def activate_resume(self, resume_id: str) -> dict[str, Any] | None:
        row = self._get("resumes", resume_id)
        if row is None:
            return None
        for item in self.list_resumes():
            self._upsert("resumes", {**item, "isActive": item.get("id") == resume_id}, str(item.get("id")))
        return self._get("resumes", resume_id)

    def list_seo_configs(self) -> list[dict[str, Any]]:
        return self._list("seo_configs")

    def upsert_seo_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("seo_configs", payload, str(payload.get("pageKey") or payload.get("id") or "default"))

    def get_github_settings(self) -> dict[str, Any]:
        return self._config("github_settings", {"githubUsername": os.getenv("GITHUB_USERNAME", ""), "enableGitHubDashboard": True})

    def upsert_github_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("configs", payload, "github_settings")

    def get_contact_config(self) -> dict[str, Any]:
        return self._config("contact_config", {"email": "", "locationText": "Kathmandu, Nepal", "responseTime": "24-48 hours", "availabilityEnabled": True})

    def upsert_contact_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("configs", payload, "contact_config")

    def get_system_settings(self) -> dict[str, Any]:
        return self._config("system_settings", {"siteName": "Kabiraj Rana", "enableProjects": True, "enableResearch": True, "enableExperience": True})

    def upsert_system_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("configs", payload, "system_settings")

    def list_audit_logs(self, entity_type: str | None = None, action: str | None = None, start_date: datetime | None = None, end_date: datetime | None = None) -> list[dict[str, Any]]:
        rows = self._list("audit_logs")
        if entity_type:
            rows = [row for row in rows if row.get("entityType") == entity_type or row.get("resource") == entity_type]
        if action:
            rows = [row for row in rows if row.get("action") == action]
        return rows

    def create_audit_log(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("audit_logs", payload)

    def create_revision(self, payload: dict[str, Any]) -> dict[str, Any]:
        entity_type = payload.get("entityType")
        entity_id = payload.get("entityId")
        versions = [row for row in self._list("revisions") if row.get("entityType") == entity_type and row.get("entityId") == entity_id]
        return self._upsert("revisions", {**payload, "versionNumber": len(versions) + 1})

    def list_revisions(self, entity_type: str, entity_id: str) -> list[dict[str, Any]]:
        return [row for row in self._list("revisions") if row.get("entityType") == entity_type and row.get("entityId") == entity_id]

    def restore_revision(self, revision_id: str, actor_admin_id: str | None = None) -> dict[str, Any] | None:
        revision = self._get("revisions", revision_id)
        if not revision or not isinstance(revision.get("snapshot"), dict):
            return None
        target = str(revision.get("entityType", "")).lower()
        resources = {"project": "projects", "experience": "experience", "research": "research", "sitecontent": "site_contents"}
        resource = resources.get(target)
        if not resource:
            return None
        entity_id = str(revision.get("entityId") or revision["snapshot"].get("id") or uuid4())
        restored = self._upsert(resource, revision["snapshot"], entity_id)
        self.create_revision({"entityType": revision.get("entityType"), "entityId": entity_id, "action": "RESTORE", "actorAdminId": actor_admin_id, "snapshot": restored})
        return {"entityType": revision.get("entityType"), "entityId": revision.get("entityId")}

    def create_health_report(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._upsert("health_reports", payload)

    def get_latest_health_report(self) -> dict[str, Any] | None:
        rows = sorted(self._list("health_reports"), key=lambda row: str(row.get("createdAt") or ""), reverse=True)
        return rows[0] if rows else None

    def get_admin_user_by_email(self, email: str) -> dict[str, Any] | None:
        target = email.strip().lower()
        return next((row for row in self._list("admin_users") if str(row.get("email", "")).strip().lower() == target), None)

    def touch_admin_last_login(self, user_id: str) -> dict[str, Any] | None:
        row = self._get("admin_users", user_id)
        return self._upsert("admin_users", {**row, "lastLoginAt": _now().isoformat()}, user_id) if row else None

    def auto_publish_scheduled_content(self) -> dict[str, int]:
        now = _now()
        counts = {"projects": 0, "experiences": 0, "research": 0, "siteContents": 0}
        for resource, key in (("projects", "projects"), ("experience", "experiences"), ("research", "research"), ("site_contents", "siteContents")):
            for row in self._list(resource):
                scheduled = row.get("scheduledAt")
                try:
                    due = scheduled and datetime.fromisoformat(str(scheduled).replace("Z", "+00:00")) <= now
                except ValueError:
                    due = False
                if str(row.get("status", "")).upper() == "SCHEDULED" and due:
                    self._upsert(resource, {**row, "status": "PUBLISHED", "publishedAt": now.isoformat()}, str(row.get("id")))
                    counts[key] += 1
        counts["total"] = sum(counts.values())
        return counts


_store: PostgresAdminStore | None = None


def get_admin_store() -> PostgresAdminStore:
    global _store
    if _store is None:
        _store = PostgresAdminStore()
    return _store


def ensure_admin_defaults() -> None:
    store = get_admin_store()
    if store._list("admin_users"):
        return
    import bcrypt

    email = (os.getenv("ADMIN_SEED_EMAIL") or os.getenv("ADMIN_LOGIN_EMAIL") or "admin@example.com").strip().lower()
    password = os.getenv("ADMIN_SEED_PASSWORD") or os.getenv("ADMIN_LOGIN_PASSWORD") or ""
    password_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
    if not password_hash and password:
        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    store._upsert("admin_users", {"id": "admin-1", "email": email, "name": "Admin", "role": "ADMIN", "passwordHash": password_hash})
