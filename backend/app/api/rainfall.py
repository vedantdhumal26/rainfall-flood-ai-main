import datetime
import math
import random
from typing import List, Dict, Any
from fastapi import APIRouter
from app.services.simulation_service import simulation_service
from app.simulation.generator import generate_station_readings, generate_gridded_rainfall
from app.api.response_util import api_response

router = APIRouter()

@router.get("/current")
def get_current_rainfall():
    sim_state = simulation_service.get_state()
    phase = sim_state["currentPhase"]
    current_time = datetime.datetime.now(datetime.timezone.utc)

    scenario_type = "extreme_rainfall" if phase and phase["rainfall"] > 30 else "normal"
    raw_stations = generate_station_readings(scenario_type, current_time)

    # Scale to match current phase
    scale = (phase["rainfall"] / 40.0) if phase and phase["rainfall"] > 0 else 0.2
    locations = []
    for s in raw_stations:
        rain = round(s["rainfall_mm"] * scale, 1)
        intensity = round(rain * 1.3, 1)
        locations.append({
            "station_id": s["station_id"],
            "station_name": s["station_name"],
            "lat": s["lat"],
            "lon": s["lon"],
            "rainfall_mm": rain,
            "intensity_mm_hr": intensity,
            "temperature_c": s["temperature_c"],
            "humidity_percent": s["humidity_percent"],
            "quality_score": s["quality_score"]
        })

    # Generate spatial heatmap circles around Pune
    center_lat, center_lon = 18.5204, 73.8567
    circles = [
        {"center": [center_lat, center_lon], "radius": 800, "intensity": round(phase["rainfall"] * 1.0, 1) if phase else 10},
        {"center": [18.5300, 73.8500], "radius": 600, "intensity": round(phase["rainfall"] * 0.85, 1) if phase else 8},
        {"center": [18.5100, 73.8600], "radius": 500, "intensity": round(phase["rainfall"] * 0.70, 1) if phase else 6},
        {"center": [18.5400, 73.8700], "radius": 700, "intensity": round(phase["rainfall"] * 0.90, 1) if phase else 9},
        {"center": [18.5000, 73.8450], "radius": 450, "intensity": round(phase["rainfall"] * 0.55, 1) if phase else 4},
        {"center": [18.5500, 73.8800], "radius": 550, "intensity": round(phase["rainfall"] * 0.50, 1) if phase else 3}
    ]

    return api_response({
        "timestamp": current_time.isoformat(),
        "maximum_intensity_mm_hr": max([l["intensity_mm_hr"] for l in locations]) if locations else 0,
        "average_rainfall_mm": round(sum([l["rainfall_mm"] for l in locations]) / len(locations), 1) if locations else 0,
        "locations": locations,
        "rainfall_circles": circles
    })

@router.get("/forecast")
def get_rainfall_forecast():
    sim_state = simulation_service.get_state()
    phase = sim_state["currentPhase"]
    base_rain = phase["rainfall"] if phase else 10.0

    # 0–6 Hour Nowcast
    nowcast = []
    for h in range(7):
        time_label = "Now" if h == 0 else f"+{h}h"
        wave = math.sin(h / 3.0) * 8.0 + math.cos(h / 5.0) * 5.0
        pred = max(0.0, base_rain + wave + (h * 5.0 if h < 3 else (6 - h) * 4.0))
        obs = max(0.0, pred - 3.0 + random.uniform(-2.0, 3.0)) if h <= 1 else None
        conf = 15.0 - (h * 1.5)

        nowcast.append({
            "time": time_label,
            "hour": h,
            "observed": round(obs, 1) if obs is not None else None,
            "predicted": round(pred, 1),
            "confidenceUpper": round(pred + conf, 1),
            "confidenceLower": round(max(0.0, pred - conf), 1)
        })

    # Short-Term 6–72 Hour Forecast
    short_term = []
    for h in range(0, 73, 2):
        time_label = f"+{h}h"
        decay = math.exp(-h / 30.0)
        pred = max(2.0, (base_rain * 0.7) * decay + math.sin(h / 8.0) * 10.0 + random.uniform(0, 4))
        conf = 10.0 + (h * 0.3)
        short_term.append({
            "time": time_label,
            "hour": h,
            "predicted": round(pred, 1),
            "confidenceUpper": round(pred + conf, 1),
            "confidenceLower": round(max(0.0, pred - conf), 1)
        })

    # Cumulative Rainfall
    cumulative = []
    running_sum = 0.0
    for p in nowcast:
        running_sum += p["predicted"]
        cumulative.append({
            "time": p["time"],
            "hour": p["hour"],
            "value": round(running_sum, 1)
        })

    # Probability
    probability = []
    for p in nowcast:
        prob = min(98.0, 30.0 + (p["predicted"] * 1.4))
        probability.append({
            "time": p["time"],
            "hour": p["hour"],
            "value": round(prob, 1)
        })

    return api_response({
        "current_rainfall": round(base_rain, 1),
        "peak_predicted": round(max([p["predicted"] for p in nowcast]), 1),
        "accumulation_6h": round(cumulative[-1]["value"], 1) if cumulative else 0,
        "coverage_area_sqkm": 482,
        "nowcast": nowcast,
        "shortTerm": short_term,
        "cumulative": cumulative,
        "probability": probability
    })

@router.get("/history")
def get_rainfall_history():
    sim_state = simulation_service.get_state()
    base_rain = sim_state["currentPhase"]["rainfall"] if sim_state["currentPhase"] else 12.0
    history = []
    now = datetime.datetime.now(datetime.timezone.utc)
    for i in range(24, -1, -1):
        t = now - datetime.timedelta(hours=i)
        history.append({
            "timestamp": t.strftime("%H:00"),
            "rainfall_mm": round(max(0, base_rain * (0.3 + 0.7 * math.cos(i / 4.0)) + random.uniform(-2, 2)), 1)
        })
    return api_response({"history": history})

@router.get("/radar/latest")
def get_latest_radar():
    return api_response({
        "source": "IMD Doppler Weather Radar, Pune",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "sweep_angle": "0.5 deg",
        "max_reflectivity_dbz": 54.2,
        "cell_speed_kmh": 22.5,
        "cell_heading_deg": 65,
        "status": "online"
    })

@router.get("/satellite/latest")
def get_latest_satellite():
    return api_response({
        "source": "INSAT-3DR Rapid Scanning Service",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "channel": "TIR-1 (10.8 um)",
        "cloud_top_temperature_k": 218.4,
        "convective_cloud_extent_pct": 74.2,
        "status": "online"
    })
