import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from app.db.database import get_connection
from app.services.simulation_service import simulation_service
from app.api.response_util import api_response

router = APIRouter()

@router.get("/latest")
def get_latest_prediction():
    sim_state = simulation_service.get_state()
    phase = sim_state["currentPhase"]

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions WHERE id = 'pred-init'")
    pred = cursor.fetchone()
    conn.close()

    flood_prob = phase["floodProbability"] if phase else (pred["flood_probability"] if pred else 8.0)
    water_depth = phase["waterDepth"] if phase else (pred["water_depth_m"] if pred else 0.12)
    arrival_time = phase["arrivalTime"] if phase else (pred["arrival_time_mins"] if pred else 0)
    population = phase["populationAtRisk"] if phase else (pred["population_at_risk"] if pred else 0)
    inundation_area = round(flood_prob * 0.14, 1)
    risk_level = phase["riskLevel"] if phase else (pred["risk_level"] if pred else "low")

    # Local flood zone breakdown
    flood_zones = [
        {
            "zone": "Mula River Basin",
            "depth": f"{water_depth:.2f} m",
            "severity": risk_level,
            "probability": int(flood_prob)
        },
        {
            "zone": "Pawana River Bank",
            "depth": f"{max(0.1, water_depth * 0.65):.2f} m",
            "severity": "high" if flood_prob >= 60 else "moderate" if flood_prob >= 30 else "low",
            "probability": int(flood_prob * 0.75)
        },
        {
            "zone": "Mula-Mutha Confluence",
            "depth": f"{max(0.05, water_depth * 0.40):.2f} m",
            "severity": "moderate" if flood_prob >= 50 else "low",
            "probability": int(flood_prob * 0.50)
        },
        {
            "zone": "Bavdhan Lowlands",
            "depth": f"{max(0.02, water_depth * 0.20):.2f} m",
            "severity": "low",
            "probability": int(flood_prob * 0.25)
        }
    ]

    return api_response({
        "prediction_id": pred["id"] if pred else "pred-latest",
        "location": "Pune Metropolitan Region",
        "risk_level": risk_level,
        "flood_probability": flood_prob,
        "predicted_water_depth": water_depth,
        "predicted_inundation_area": inundation_area,
        "population_at_risk": population,
        "arrival_time_minutes": arrival_time,
        "confidence": 92 if flood_prob >= 60 else 84,
        "prediction_time": pred["prediction_time"] if pred else datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "forecast_horizon": "0–6 hours",
        "model_version": "RainShield-FloodNet-v1.0",
        "flood_extent_km2": inundation_area,
        "affected_area_km2": round(inundation_area * 38.8, 1),
        "flood_zones": flood_zones
    })

@router.get("/timeline")
def get_prediction_timeline():
    sim_state = simulation_service.get_state()
    phase = sim_state["currentPhase"]
    current_prob = phase["floodProbability"] if phase else 8.0

    timeline = [
        {
            "time": "NOW",
            "hour": 0,
            "observed_rainfall": round(phase["rainfall"] * 0.8, 1) if phase else 8.0,
            "forecast_rainfall": round(phase["rainfall"], 1) if phase else 10.0,
            "flood_probability": int(current_prob * 0.1),
            "level": "low",
            "label": "LOW"
        },
        {
            "time": "+1H",
            "hour": 1,
            "observed_rainfall": None,
            "forecast_rainfall": round(phase["rainfall"] * 1.1, 1) if phase else 15.0,
            "flood_probability": int(min(98, current_prob * 0.45)),
            "level": "moderate" if current_prob >= 30 else "low",
            "label": "MODERATE" if current_prob >= 30 else "LOW"
        },
        {
            "time": "+2H",
            "hour": 2,
            "observed_rainfall": None,
            "forecast_rainfall": round(phase["rainfall"] * 1.3, 1) if phase else 25.0,
            "flood_probability": int(min(98, current_prob * 0.75)),
            "level": "high" if current_prob >= 50 else "moderate",
            "label": "HIGH" if current_prob >= 50 else "MODERATE"
        },
        {
            "time": "+3H",
            "hour": 3,
            "observed_rainfall": None,
            "forecast_rainfall": round(phase["rainfall"] * 1.5, 1) if phase else 35.0,
            "flood_probability": int(current_prob),
            "level": phase["riskLevel"] if phase else "low",
            "label": phase["riskLevel"].upper() if phase else "LOW"
        }
    ]

    return api_response({"timeline": timeline})

@router.get("/metrics")
def get_model_metrics():
    metrics = [
        {"label": "Accuracy", "value": 92, "unit": "%"},
        {"label": "Precision", "value": 89, "unit": "%"},
        {"label": "Recall", "value": 91, "unit": "%"},
        {"label": "F1 Score", "value": 90, "unit": "%"},
        {"label": "False Alarm Rate", "value": 8, "unit": "%"},
        {"label": "Lead Time", "value": 48, "unit": "min"}
    ]
    confidence_factors = [
        {"label": "Rainfall Accumulation", "percentage": 35, "color": "#06b6d4"},
        {"label": "Radar Intensity", "percentage": 24, "color": "#0891b2"},
        {"label": "NWP Forecast", "percentage": 18, "color": "#0e7490"},
        {"label": "Elevation", "percentage": 12, "color": "#3b82f6"},
        {"label": "Drainage Capacity", "percentage": 7, "color": "#6366f1"},
        {"label": "Historical Flood Data", "percentage": 4, "color": "#8b5cf6"}
    ]
    return api_response({
        "metrics": metrics,
        "confidence_factors": confidence_factors,
        "overall_confidence": 91
    })

@router.get("/{id}")
def get_prediction_by_id(id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions WHERE id = ?", (id,))
    pred = cursor.fetchone()
    conn.close()

    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return api_response(dict(pred))
