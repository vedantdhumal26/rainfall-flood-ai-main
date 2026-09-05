import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    endpoints = [
        ("GET", "/api/health"),
        ("GET", "/api/dashboard/summary"),
        ("GET", "/api/rainfall/current"),
        ("GET", "/api/rainfall/forecast"),
        ("GET", "/api/predictions/latest"),
        ("GET", "/api/predictions/timeline"),
        ("GET", "/api/risk-zones"),
        ("GET", "/api/alerts"),
        ("GET", "/api/response/teams"),
        ("GET", "/api/response/shelters"),
        ("GET", "/api/infrastructure"),
        ("GET", "/api/data-sources"),
        ("GET", "/api/ai/insights"),
        ("GET", "/api/reports"),
        ("GET", "/api/simulation/state"),
        ("GET", "/api/radar/latest"),
        ("GET", "/api/satellite/latest"),
    ]

    for method, path in endpoints:
        resp = client.get(path)
        assert resp.status_code == 200, f"Failed {path}: {resp.status_code} {resp.text}"
        data = resp.json()
        assert data.get("success") is True, f"Failed success in {path}: {data}"
        print(f"PASS: {method} {path}")

    # Test alert workflow: create -> approve -> broadcast
    alert_resp = client.post("/api/alerts", json={
        "title": "TEST MONSOON ALERT",
        "description": "High runoff expected in ward 4",
        "level": "orange"
    })
    assert alert_resp.status_code == 200
    alert_id = alert_resp.json()["data"]["id"]
    print(f"PASS: Created alert {alert_id}")

    approve_resp = client.post(f"/api/alerts/{alert_id}/approve", json={"approved_by": "Test Officer"})
    assert approve_resp.status_code == 200
    assert approve_resp.json()["data"]["status"] == "approved"
    print(f"PASS: Approved alert {alert_id}")

    broadcast_resp = client.post(f"/api/alerts/{alert_id}/broadcast")
    assert broadcast_resp.status_code == 200
    assert broadcast_resp.json()["data"]["status"] == "broadcasted"
    print(f"PASS: Broadcast alert {alert_id}")

    # Test evacuation route calculation
    route_resp = client.post("/api/routing/evacuate", json={"lat": 18.5204, "lon": 73.8567})
    assert route_resp.status_code == 200
    assert route_resp.json()["data"]["status"] == "success"
    print("PASS: POST /api/routing/evacuate")

    # Test simulation controller
    sim_set = client.post("/api/simulation/set-scenario", json={"scenario_id": "heavy", "phase_index": 1})
    assert sim_set.status_code == 200
    assert sim_set.json()["data"]["scenarioId"] == "heavy"
    print("PASS: POST /api/simulation/set-scenario")

    sim_step = client.post("/api/simulation/step")
    assert sim_step.status_code == 200
    print("PASS: POST /api/simulation/step")

    # Reset back to extreme for demo
    client.post("/api/simulation/set-scenario", json={"scenario_id": "extreme", "phase_index": 3})

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
