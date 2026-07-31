from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import Engine
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker

_engine: Engine | None = None
_SessionLocal: sessionmaker[Session] | None = None


def normalize_database_url(database_url: str) -> str:
    normalized = database_url.strip()
    if normalized.startswith("postgres://"):
        normalized = "postgresql://" + normalized[len("postgres://") :]
    return normalized


def configure_database(database_url: str) -> bool:
    global _engine
    global _SessionLocal

    normalized_url = normalize_database_url(database_url)
    if not normalized_url:
        _engine = None
        _SessionLocal = None
        return False

    connect_args = {}
    if normalized_url.startswith("postgresql"):
        # Render PostgreSQL requires TLS for external connections. Respect an
        # explicit sslmode, otherwise use the production-safe requirement.
        if "sslmode=" not in normalized_url.lower():
            separator = "&" if "?" in normalized_url else "?"
            normalized_url = f"{normalized_url}{separator}sslmode=require"
        connect_args["connect_timeout"] = 10
    _engine = create_engine(normalized_url, pool_pre_ping=True, connect_args=connect_args)
    _SessionLocal = sessionmaker(bind=_engine, autocommit=False, autoflush=False, expire_on_commit=False)
    return True


def get_engine() -> Engine:
    if _engine is None:
        raise RuntimeError("Database engine is not configured. Set DATABASE_URL on the backend.")
    return _engine


def get_session() -> Generator[Session, None, None]:
    if _SessionLocal is None:
        raise RuntimeError("Database session is not configured. Set DATABASE_URL on the backend.")

    session = _SessionLocal()
    try:
        yield session
    finally:
        session.close()


def open_session() -> Session:
    if _SessionLocal is None:
        raise RuntimeError("Database session is not configured. Set DATABASE_URL on the backend.")
    return _SessionLocal()


def is_database_configured() -> bool:
    return _SessionLocal is not None
