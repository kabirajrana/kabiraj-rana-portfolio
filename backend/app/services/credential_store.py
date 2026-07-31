from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from datetime import timezone
from typing import Any

from sqlalchemy import Select
from sqlalchemy import delete
from sqlalchemy import func
from sqlalchemy import select

from app.db.base import Base
from app.db.models import Credential
from app.db.models import CredentialType
from app.db.session import configure_database
from app.db.session import get_engine
from app.db.session import is_database_configured
from app.db.session import open_session


@dataclass(frozen=True)
class CredentialPayload:
    type: str
    code: str
    title: str
    url: str
    sort_order: int = 0
    visible: bool = True


SEED_DEFAULT_CREDENTIALS: tuple[CredentialPayload, ...] = (
    CredentialPayload(
        type=CredentialType.CERTIFICATE.value,
        code="CT1",
        title="Data Analysis with Python",
        url="https://coursera.org/share/d10000f3f38062a33e79d7e3f942ef32",
        sort_order=0,
        visible=True,
    ),
    CredentialPayload(
        type=CredentialType.CERTIFICATION.value,
        code="C1",
        title="IBM Data Science Certificate",
        url="https://coursera.org/share/d10000f3f38062a33e79d7e3f942ef32",
        sort_order=1,
        visible=True,
    ),
)


class CredentialStore:
    def list_credentials(self, visible_only: bool = False, credential_type: str | None = None) -> list[Credential]:
        with open_session() as session:
            query: Select[tuple[Credential]] = select(Credential)

            normalized_type = self._normalize_type(credential_type) if credential_type else None
            if normalized_type:
                query = query.where(Credential.type == normalized_type)

            if visible_only:
                query = query.where(Credential.visible.is_(True))

            query = query.order_by(Credential.sort_order.asc(), Credential.created_at.asc())
            return list(session.scalars(query).all())

    def create_credential(self, payload: CredentialPayload) -> Credential:
        now = datetime.now(timezone.utc)
        row = Credential(
            type=self._normalize_type(payload.type),
            code=payload.code,
            title=payload.title,
            url=payload.url,
            sort_order=int(payload.sort_order),
            visible=bool(payload.visible),
            created_at=now,
            updated_at=now,
        )

        with open_session() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return row

    def update_credential(self, credential_id: str, payload: CredentialPayload) -> Credential | None:
        with open_session() as session:
            row = session.get(Credential, credential_id)
            if row is None:
                return None

            row.type = self._normalize_type(payload.type)
            row.code = payload.code
            row.title = payload.title
            row.url = payload.url
            row.sort_order = int(payload.sort_order)
            row.visible = bool(payload.visible)
            row.updated_at = datetime.now(timezone.utc)
            session.commit()
            session.refresh(row)
            return row

    def delete_credential(self, credential_id: str) -> bool:
        with open_session() as session:
            result = session.execute(delete(Credential).where(Credential.id == credential_id))
            session.commit()
            return int(result.rowcount or 0) > 0

    def seed_defaults_if_empty(self) -> int:
        with open_session() as session:
            total = session.scalar(select(func.count(Credential.id)))
            if int(total or 0) > 0:
                return 0

            now = datetime.now(timezone.utc)
            rows = [
                Credential(
                    type=self._normalize_type(item.type),
                    code=item.code,
                    title=item.title,
                    url=item.url,
                    sort_order=item.sort_order,
                    visible=item.visible,
                    created_at=now,
                    updated_at=now,
                )
                for item in SEED_DEFAULT_CREDENTIALS
            ]
            session.add_all(rows)
            session.commit()
            return len(rows)

    def _normalize_type(self, value: str | None) -> str:
        return CredentialType.CERTIFICATE.value if str(value or "").strip().lower() == CredentialType.CERTIFICATE.value else CredentialType.CERTIFICATION.value


_store: CredentialStore | None = None


def init_credential_store(database_url: str, seed_on_empty: bool = False) -> bool:
    global _store

    configured = configure_database(database_url)
    if not configured:
        _store = None
        return False

    engine = get_engine()
    Base.metadata.create_all(bind=engine, tables=[Credential.__table__])
    _store = CredentialStore()

    if seed_on_empty:
        _store.seed_defaults_if_empty()

    return True


def get_credential_store() -> CredentialStore:
    if _store is None or not is_database_configured():
        raise RuntimeError("Credential database is not configured. Set DATABASE_URL on the backend.")
    return _store


def serialize_credential(row: Credential) -> dict[str, Any]:
    return {
        "id": row.id,
        "type": row.type,
        "code": row.code,
        "title": row.title,
        "url": row.url,
        "sort_order": int(row.sort_order),
        "visible": bool(row.visible),
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


def serialize_credential_legacy(row: Credential) -> dict[str, Any]:
    payload = serialize_credential(row)
    return {
        "id": payload["id"],
        "type": payload["type"],
        "codeLabel": payload["code"],
        "title": payload["title"],
        "credentialUrl": payload["url"],
        "sortOrder": payload["sort_order"],
        "isVisible": payload["visible"],
        "createdAt": payload["created_at"],
        "updatedAt": payload["updated_at"],
    }
