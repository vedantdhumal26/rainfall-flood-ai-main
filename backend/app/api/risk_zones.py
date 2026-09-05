import json
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from app.db.database import get_connection
from app.services.simulation_service import simulation_service
from app.api.response_util import api_response

router = APIRouter()

@router.get("")
@router.get("/")
def get_risk_zones():
    sim_state = simulation_service.get_state()
    phase = sim_state["currentPhase"]

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM risk_zones")
    rows = cursor.fetchall()
    conn.close()

    features = []
    # Dynamic styling depending on simulation phase severity
    phase_level = phase["riskLevel"] if phase else "low"
    water_depth = phase["waterDepth"] if phase else 0.12
    prob = phase["floodProbability"] if phase else 8.0

    for idx, r in enumerate(rows):
        geom = json.loads(r["geometry_json"])
        
        # Scale depth and risk with active simulation phase
        if idx == 0:
            risk = phase_level
            depth = water_depth
            cell_prob = prob
        elif idx == 1:
            risk = "high" if phase_level == "severe" else "moderate" if phase_level in ["high", "moderate"] else "low"
            depth = round(water_depth * 0.65, 2)
            cell_prob = round(prob * 0.75, 1)
        else:
            risk = "moderate" if phase_level in ["severe", "high"] else "low"
            depth = round(water_depth * 0.35, 2)
            cell_prob = round(prob * 0.45, 1)

        features.append({
            "type": "Feature",
            "id": r["id"],
            "properties": {
                "id": r["id"],
                "name": r["name"],
                "risk": risk,
                "flood_probability": cell_prob,
                "water_depth": depth,
                "depth": depth,
                "updated_at": r["updated_at"]
            },
            "geometry": geom
        })

    geojson_collection = {
        "type": "FeatureCollection",
        "features": features
    }

    # Also return in standard api envelope
    return api_response(geojson_collection)

@router.get("/{id}")
def get_risk_zone_by_id(id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM risk_zones WHERE id = ?", (id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Risk zone not found")

    return api_response({
        "type": "Feature",
        "id": r["id"],
        "properties": {
            "id": r["id"],
            "name": r["name"],
            "risk": r["risk_level"],
            "flood_probability": r["flood_probability"],
            "water_depth": r["water_depth_m"],
            "updated_at": r["updated_at"]
        },
        "geometry": json.loads(r["geometry_json"])
    })
