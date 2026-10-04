import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def test_health():
    assert client.get("/api/health").status_code == 200

def test_analyze_response_has_required_shape():
    r = client.post("/api/analyze", json={"password": "Password123!"})
    assert r.status_code == 200
    body = r.json()
    assert set(["score", "classification", "findings", "suggestions", "metrics"]).issubset(body)
    assert "Password123!" not in str(body)

def test_generator():
    r = client.post("/api/generate-password", json={"length": 20})
    assert r.status_code == 200
    assert len(r.json()["password"]) == 20
