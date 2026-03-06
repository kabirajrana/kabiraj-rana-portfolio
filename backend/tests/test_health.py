from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_returns_ok() -> None:
	client = TestClient(app)
	response = client.get("/health")

	assert response.status_code == 200
	body = response.json()
	assert body["status"] == "ok"
	assert isinstance(body["timestamp"], str)
	assert isinstance(body["uptime"], float)
	assert body["uptime"] >= 0
