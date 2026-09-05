import json
from fastapi import APIRouter
from app.db.database import get_connection
from app.services.simulation_service import simulation_service
from app.api.response_util import api_response

router = APIRouter()

@router.get("/insights")
def get_ai_insights():
    sim_state = simulation_service.get_state()
    phase = sim_state["currentPhase"]

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ai_insights ORDER BY created_at DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    rainfall = phase["rainfall"] if phase else 12.0
    flood_prob = phase["floodProbability"] if phase else 8.0

    if phase and phase["level"] == "red":
        summary = f"CRITICAL HAZARD DETECTED: Convective cloudburst system producing peak precipitation of {rainfall} mm/hr over Mula-Mutha river basin. Severe inundation imminent within {phase['arrivalTime']} minutes."
        recommendations = [
            "Mandate immediate evacuation for Patil Estate slums and riverbank zones.",
            "Deploy NDRF Team 5 with inflatable boats to low-lying river corridors.",
            "Close river crossing bridges (Mula River Bridge, Holkar Bridge).",
            "Prepare backup generators at Sassoon and Deenanath Mangeshkar hospitals."
        ]
    elif phase and phase["level"] == "orange":
        summary = f"ELEVATED RISK ALERT: Sustained rainfall of {rainfall} mm/hr detected across Pune catchment. Soil saturation index exceeds 82%."
        recommendations = [
            "Place SDRF and Municipal Fire Brigade rescue units on high alert.",
            "Issue advisory to citizens in flood-prone wards.",
            "Clear stormwater drainage outfalls along Karve Road and Sinhagad Road."
        ]
    else:
        summary = "Nominal conditions across meteorological network. Atmospheric convective stability index is normal."
        recommendations = [
            "Continue standard Doppler Radar and AWS sensor telemetry monitoring.",
            "Verify telemetry synchronization with IMD regional center."
        ]

    factors = [
        {"factor": "Rainfall Intensity", "contribution": 38},
        {"factor": "Cumulative Catchment Precipitation", "contribution": 26},
        {"factor": "Digital Elevation & Slope Vulnerability", "contribution": 21},
        {"factor": "Urban Drainage Capacity Constraint", "contribution": 15}
    ]

    return api_response({
        "summary": summary,
        "risk_factors": factors,
        "recommendations": recommendations,
        "model_version": "RainShield-AI-v1.0",
        "confidence_score": 0.92 if flood_prob >= 60 else 0.85
    })
