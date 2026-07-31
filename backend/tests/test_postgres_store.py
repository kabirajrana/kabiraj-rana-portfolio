import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "content.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    monkeypatch.setenv("CREDENTIALS_SEED_ON_EMPTY", "false")

    from app.core.config import get_settings

    get_settings.cache_clear()
    import app.main as main_module

    importlib.reload(main_module)
    with TestClient(main_module.app) as test_client:
        yield test_client


def test_project_and_config_crud_is_database_backed(client: TestClient) -> None:
    payload = {
        "id": "project-1",
        "slug": "project-1",
        "title": "Database Project",
        "status": "PUBLISHED",
        "sortOrder": 1,
    }
    response = client.post("/v1/admin/content/projects", json=payload)
    assert response.status_code == 200
    assert response.json()["title"] == "Database Project"

    listed = client.get("/v1/content/projects").json()
    assert listed["total"] == 1
    assert listed["items"][0]["id"] == "project-1"

    by_slug = client.get("/v1/content/projects/by-slug/project-1")
    assert by_slug.status_code == 200
    assert by_slug.json()["id"] == "project-1"

    config = client.put("/v1/admin/content/site/home", json={"heroTitle": "Persistent hero"})
    assert config.status_code == 200
    assert client.get("/v1/content/site/home").json()["heroTitle"] == "Persistent hero"

    deleted = client.delete("/v1/admin/content/projects/project-1")
    assert deleted.json() == {"id": "project-1", "deleted": True}
