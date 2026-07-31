"""One-time import from the legacy admin_store.json into PostgreSQL.

This script is intentionally the only remaining reader of the legacy JSON
file. It is idempotent: existing resource/id pairs and credential IDs are
skipped so it is safe to rerun after an interrupted deployment.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sys

from sqlalchemy import select

from app.db.base import Base
from app.db.models import ContentRecord, Credential
from app.db.session import configure_database, get_engine, open_session
from app.services.postgres_store import ensure_admin_defaults


COLLECTIONS = {
    "messages": "messages",
    "projects": "projects",
    "project_categories": "project_categories",
    "experience": "experience",
    "research": "research",
    "research_filter_tabs": "research_filter_tabs",
    "media": "media",
    "resumes": "resumes",
    "seo_configs": "seo_configs",
    "audit_logs": "audit_logs",
    "revisions": "revisions",
    "health_reports": "health_reports",
    "admin_users": "admin_users",
}

CONFIG_KEYS = {
    "projects_page_config",
    "experience_page_config",
    "research_page_config",
    "github_settings",
    "contact_config",
    "system_settings",
}


def parse_datetime(value: object) -> datetime:
    if isinstance(value, datetime):
        return value
    if value:
        try:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return datetime.now(timezone.utc)


def metadata(payload: dict) -> tuple[str | None, str | None, str | None, int]:
    order = payload.get("sortOrder", payload.get("sort_order", payload.get("displayOrder", 0)))
    try:
        order = int(order or 0)
    except (TypeError, ValueError):
        order = 0
    return (
        str(payload["slug"]) if payload.get("slug") else None,
        str(payload["status"]) if payload.get("status") else None,
        str(payload["type"]) if payload.get("type") else None,
        order,
    )


def import_record(session, resource: str, payload: dict, record_id: str | None = None) -> bool:
    identifier = str(record_id or payload.get("id") or "")
    if not identifier:
        return False
    exists = session.scalar(
        select(ContentRecord).where(
            ContentRecord.resource == resource,
            ContentRecord.record_id == identifier,
        )
    )
    if exists:
        return False
    slug, status, record_type, sort_order = metadata(payload)
    created_at = parse_datetime(payload.get("createdAt", payload.get("created_at")))
    updated_at = parse_datetime(payload.get("updatedAt", payload.get("updated_at")))
    session.add(
        ContentRecord(
            key=f"{resource}:{identifier}",
            resource=resource,
            record_id=identifier,
            slug=slug,
            status=status,
            record_type=record_type,
            sort_order=sort_order,
            payload={**payload, "id": identifier},
            created_at=created_at,
            updated_at=updated_at,
        )
    )
    return True


def import_credential(session, payload: dict) -> bool:
    identifier = str(payload.get("id") or "")
    code = str(payload.get("code") or payload.get("codeLabel") or "").strip()
    title = str(payload.get("title") or "").strip()
    url = str(payload.get("url") or payload.get("credentialUrl") or "").strip()
    if not identifier or not code or not title or not url:
        return False
    if session.get(Credential, identifier):
        return False
    session.add(
        Credential(
            id=identifier,
            type="certificate" if str(payload.get("type", "")).lower() == "certificate" else "certification",
            code=code,
            title=title,
            url=url,
            sort_order=int(payload.get("sortOrder", payload.get("sort_order", 0)) or 0),
            visible=bool(payload.get("isVisible", payload.get("visible", True))),
            created_at=parse_datetime(payload.get("createdAt", payload.get("created_at"))),
            updated_at=parse_datetime(payload.get("updatedAt", payload.get("updated_at"))),
        )
    )
    return True


def run(source: Path) -> tuple[int, int]:
    with source.open("r", encoding="utf-8-sig") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("Legacy admin store must contain a JSON object")

    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL must be set before importing admin content")
    configure_database(database_url)
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    ensure_admin_defaults()
    records = credentials = 0
    with open_session() as session:
        with session.begin():
            for key, resource in COLLECTIONS.items():
                rows = data.get(key, [])
                if isinstance(rows, list):
                    for row in rows:
                        if isinstance(row, dict):
                            records += int(import_record(session, resource, row))

            site_contents = data.get("site_contents", {})
            if isinstance(site_contents, dict):
                for record_id, row in site_contents.items():
                    if isinstance(row, dict):
                        records += int(import_record(session, "site_contents", row, str(record_id)))

            for key in CONFIG_KEYS:
                row = data.get(key)
                if isinstance(row, dict):
                    records += int(import_record(session, "configs", row, key))

            rows = data.get("certifications", [])
            if isinstance(rows, list):
                for row in rows:
                    if isinstance(row, dict):
                        credentials += int(import_credential(session, row))
    return records, credentials


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", type=Path, default=Path(".data/admin_store.json"))
    args = parser.parse_args()
    try:
        records, credentials = run(args.file)
    except Exception as error:
        print(f"Import failed: {error}", file=sys.stderr)
        return 1
    print(f"Imported {records} content records and {credentials} credentials.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
