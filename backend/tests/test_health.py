from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_returns_ok() -> None:
	client = TestClient(app)
	for path in ("/health", "/v1/health"):
		response = client.get(path)

		assert response.status_code == 200
		body = response.json()
		assert body["status"] == "ok"
		assert isinstance(body["timestamp"], str)
		assert isinstance(body["uptime"], float)
		assert body["uptime"] >= 0
