import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "credentials.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    monkeypatch.setenv("CREDENTIALS_SEED_ON_EMPTY", "false")

    from app.core.config import get_settings

    get_settings.cache_clear()

    import app.main as main_module

    importlib.reload(main_module)

    with TestClient(main_module.app) as test_client:
        yield test_client


def test_credentials_crud_flow(client: TestClient) -> None:
    list_response = client.get("/v1/credentials")
    assert list_response.status_code == 200
    assert list_response.json() == {"items": [], "total": 0}

    create_payload = {
        "type": "certificate",
        "code": "CT-100",
        "title": "Applied Data Engineering",
        "url": "https://example.com/credential/ct-100",
        "sort_order": 1,
        "visible": True,
    }
    create_response = client.post("/v1/credentials", json=create_payload)
    assert create_response.status_code == 200
    created = create_response.json()

    assert created["id"]
    assert created["type"] == "certificate"
    assert created["code"] == "CT-100"
    assert created["title"] == "Applied Data Engineering"
    assert created["url"] == "https://example.com/credential/ct-100"
    assert created["sort_order"] == 1
    assert created["visible"] is True
    assert created["created_at"]
    assert created["updated_at"]

    list_after_create = client.get("/v1/credentials")
    assert list_after_create.status_code == 200
    listed = list_after_create.json()
    assert listed["total"] == 1
    assert len(listed["items"]) == 1
    assert listed["items"][0]["id"] == created["id"]

    update_payload = {
        "type": "certification",
        "code": "C-200",
        "title": "ML Systems Certification",
        "url": "https://example.com/credential/c-200",
        "sort_order": 5,
        "visible": False,
    }
    update_response = client.put(f"/v1/credentials/{created['id']}", json=update_payload)
    assert update_response.status_code == 200
    updated = update_response.json()

    assert updated["id"] == created["id"]
    assert updated["type"] == "certification"
    assert updated["code"] == "C-200"
    assert updated["title"] == "ML Systems Certification"
    assert updated["url"] == "https://example.com/credential/c-200"
    assert updated["sort_order"] == 5
    assert updated["visible"] is False

    visible_only_response = client.get("/v1/credentials?visible=1")
    assert visible_only_response.status_code == 200
    assert visible_only_response.json() == {"items": [], "total": 0}

    delete_response = client.delete(f"/v1/credentials/{created['id']}")
    assert delete_response.status_code == 200
    assert delete_response.json() == {"count": 1}

    list_after_delete = client.get("/v1/credentials")
    assert list_after_delete.status_code == 200
    assert list_after_delete.json() == {"items": [], "total": 0}


def test_credentials_accepts_legacy_payload_aliases(client: TestClient) -> None:
    payload = {
        "type": "certificate",
        "codeLabel": "LEG-1",
        "title": "Legacy Alias Credential",
        "credentialUrl": "https://example.com/legacy",
        "sortOrder": 2,
        "isVisible": True,
    }

    create_response = client.post("/v1/credentials", json=payload)
    assert create_response.status_code == 200
    created = create_response.json()

    assert created["code"] == "LEG-1"
    assert created["url"] == "https://example.com/legacy"
    assert created["sort_order"] == 2
    assert created["visible"] is True
