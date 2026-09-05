import datetime
import json
import random
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np

from app.db.database import get_connection
from app.simulation.generator import generate_station_readings, generate_gridded_rainfall, WEATHER_STATIONS
from app.preprocessing.pipeline import run_pipeline
from app.ml.rainfall_model import rainfall_model
from app.ml.flood_model import flood_model

# Scenario phase definitions matching the demonstration flow
SCENARIO_CONFIGS = {
    "normal": {
        "id": "normal",
        "name": "Normal Baseline",
        "description": "Clear to mild weather — baseline nominal telemetry",
        "phases": [
            {
                "level": "green",
                "label": "Normal",
                "floodProbability": 8.0,
                "rainfall": 8.0,
                "waterDepth": 0.12,
                "arrivalTime": 0,
                "populationAtRisk": 0,
                "infrastructure": 0,
                "riskLevel": "low"
            }
        ]
    },
    "heavy": {
        "id": "heavy",
        "name": "Heavy Rainfall",
        "description": "Sustained monsoon downpour with rising stream levels",
        "phases": [
            {
                "level": "green",
                "label": "Normal",
                "floodProbability": 8.0,
                "rainfall": 12.0,
                "waterDepth": 0.15,
                "arrivalTime": 0,
                "populationAtRisk": 0,
                "infrastructure": 0,
                "riskLevel": "low"
            },
            {
                "level": "yellow",
                "label": "Moderate Risk",
                "floodProbability": 31.0,
                "rainfall": 45.0,
                "waterDepth": 0.45,
                "arrivalTime": 90,
                "populationAtRisk": 5200,
                "infrastructure": 12,
                "riskLevel": "moderate"
            }
        ]
    },
    "extreme": {
        "id": "extreme",
        "name": "Extreme Cloudburst Event",
        "description": "Intense convective downpour causing critical flash inundation",
        "phases": [
            {
                "level": "green",
                "label": "Normal",
                "floodProbability": 8.0,
                "rainfall": 12.0,
                "waterDepth": 0.15,
                "arrivalTime": 0,
                "populationAtRisk": 0,
                "infrastructure": 0,
                "riskLevel": "low"
            },
            {
                "level": "yellow",
                "label": "Weather Watch",
                "floodProbability": 31.0,
                "rainfall": 45.0,
                "waterDepth": 0.45,
                "arrivalTime": 90,
                "populationAtRisk": 5200,
                "infrastructure": 12,
                "riskLevel": "moderate"
            },
            {
                "level": "orange",
                "label": "High Risk",
                "floodProbability": 67.0,
                "rainfall": 68.0,
                "waterDepth": 0.85,
                "arrivalTime": 65,
                "populationAtRisk": 14800,
                "infrastructure": 27,
                "riskLevel": "high"
            },
            {
                "level": "red",
                "label": "Critical Flood Risk",
                "floodProbability": 89.0,
                "rainfall": 92.0,
                "waterDepth": 1.42,
                "arrivalTime": 42,
                "populationAtRisk": 24680,
                "infrastructure": 43,
                "riskLevel": "severe"
            }
        ]
    },
    "urban": {
        "id": "urban",
        "name": "Urban Drainage Overload",
        "description": "High impervious runoff causing rapid street waterlogging",
        "phases": [
            {
                "level": "green",
                "label": "Normal",
                "floodProbability": 8.0,
                "rainfall": 10.0,
                "waterDepth": 0.10,
                "arrivalTime": 0,
                "populationAtRisk": 0,
                "infrastructure": 0,
                "riskLevel": "low"
            },
            {
                "level": "yellow",
                "label": "Waterlogging Alert",
                "floodProbability": 28.0,
                "rainfall": 38.0,
                "waterDepth": 0.35,
                "arrivalTime": 75,
                "populationAtRisk": 3800,
                "infrastructure": 8,
                "riskLevel": "moderate"
            },
            {
                "level": "orange",
                "label": "Severe Inundation",
                "floodProbability": 58.0,
                "rainfall": 55.0,
                "waterDepth": 0.65,
                "arrivalTime": 55,
                "populationAtRisk": 11200,
                "infrastructure": 22,
                "riskLevel": "high"
            }
        ]
    }
}

class SimulationService:
    def get_state(self) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM simulation_state WHERE id = 1")
        row = cursor.fetchone()
        conn.close()

        scenario_id = row["scenario_id"] if row else "extreme"
        phase_index = row["phase_index"] if row else 3
        is_running = bool(row["is_running"]) if row else False
        progress = row["progress"] if row else 100.0

        scenario = SCENARIO_CONFIGS.get(scenario_id, SCENARIO_CONFIGS["extreme"])
        phases = scenario["phases"]
        clamped_index = min(phase_index, len(phases) - 1)
        current_phase = phases[clamped_index]

        return {
            "scenarioId": scenario_id,
            "scenario": scenario,
            "phaseIndex": clamped_index,
            "totalPhases": len(phases),
            "currentPhase": current_phase,
            "isRunning": is_running,
            "progress": progress,
            "scenarios": list(SCENARIO_CONFIGS.values())
        }

    def set_scenario(self, scenario_id: str, phase_index: int = 0) -> Dict[str, Any]:
        if scenario_id not in SCENARIO_CONFIGS:
            scenario_id = "extreme"

        phases = SCENARIO_CONFIGS[scenario_id]["phases"]
        clamped_index = min(max(0, phase_index), len(phases) - 1)
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE simulation_state
        SET scenario_id = ?, phase_index = ?, is_running = 0, progress = 100.0, updated_at = ?
        WHERE id = 1
        """, (scenario_id, clamped_index, now))
        conn.commit()
        conn.close()

        # Update models & DB records based on new phase
        self._apply_phase_effects(scenario_id, clamped_index)
        return self.get_state()

    def start_simulation(self, scenario_id: Optional[str] = None) -> Dict[str, Any]:
        state = self.get_state()
        active_scenario_id = scenario_id or state["scenarioId"]
        if active_scenario_id not in SCENARIO_CONFIGS:
            active_scenario_id = "extreme"

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE simulation_state
        SET scenario_id = ?, phase_index = 0, is_running = 1, progress = 0.0, updated_at = ?
        WHERE id = 1
        """, (active_scenario_id, now))
        conn.commit()
        conn.close()

        self._apply_phase_effects(active_scenario_id, 0)
        return self.get_state()

    def pause_simulation(self) -> Dict[str, Any]:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE simulation_state
        SET is_running = 0, updated_at = ?
        WHERE id = 1
        """, (now,))
        conn.commit()
        conn.close()
        return self.get_state()

    def step_simulation(self) -> Dict[str, Any]:
        state = self.get_state()
        phases = state["scenario"]["phases"]
        next_index = state["phaseIndex"] + 1

        is_running = 1
        if next_index >= len(phases):
            next_index = len(phases) - 1
            is_running = 0

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE simulation_state
        SET phase_index = ?, is_running = ?, progress = 100.0, updated_at = ?
        WHERE id = 1
        """, (next_index, is_running, now))
        conn.commit()
        conn.close()

        self._apply_phase_effects(state["scenarioId"], next_index)
        return self.get_state()

    def reset_simulation(self) -> Dict[str, Any]:
        state = self.get_state()
        return self.set_scenario(state["scenarioId"], 0)

    def _apply_phase_effects(self, scenario_id: str, phase_index: int):
        scenario = SCENARIO_CONFIGS.get(scenario_id, SCENARIO_CONFIGS["extreme"])
        phases = scenario["phases"]
        phase = phases[min(phase_index, len(phases) - 1)]
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        conn = get_connection()
        cursor = conn.cursor()

        # 1. Generate new observations according to scenario
        generator_scenario = "extreme_rainfall" if phase["rainfall"] > 30 else "normal"
        observations = generate_station_readings(generator_scenario, datetime.datetime.now(datetime.timezone.utc))

        # Adjust station rainfall to align with current phase
        factor = phase["rainfall"] / 50.0 if phase["rainfall"] > 0 else 0.1
        for obs in observations:
            obs["rainfall_mm"] = round(obs["rainfall_mm"] * factor, 1)

        # 2. Update prediction in DB
        cursor.execute("""
        UPDATE predictions
        SET scenario = ?,
            risk_level = ?,
            flood_probability = ?,
            water_depth_m = ?,
            inundation_area_sqkm = ?,
            arrival_time_mins = ?,
            population_at_risk = ?,
            infrastructure_at_risk = ?,
            confidence_score = ?,
            prediction_time = ?
        WHERE id = 'pred-init'
        """, (
            scenario_id,
            phase["riskLevel"],
            phase["floodProbability"],
            phase["waterDepth"],
            round(phase["floodProbability"] * 0.14, 1),
            phase["arrivalTime"],
            phase["populationAtRisk"],
            phase["infrastructure"],
            0.92 if phase["riskLevel"] in ["high", "severe"] else 0.84,
            now
        ))

        # 3. Create or update active alert when entering severe/orange phase
        if phase["level"] == "red":
            cursor.execute("""
            INSERT OR REPLACE INTO alerts (id, level, title, description, region, eta, status, approved_by, approved_at, broadcasted_at, created_at)
            VALUES (
                'alert-live-red',
                'red',
                'RED ALERT — SEVERE FLOOD RISK',
                'Extreme rainfall and rapid inundation predicted. Water depth exceeding 1.4m. Immediate evacuation required for riverfront areas.',
                'Pune Region',
                '42 minutes',
                'approved',
                'Disaster Management Officer',
                ?,
                ?,
                ?
            )
            """, (now, now, now))
        elif phase["level"] == "orange":
            cursor.execute("""
            INSERT OR REPLACE INTO alerts (id, level, title, description, region, eta, status, approved_by, approved_at, broadcasted_at, created_at)
            VALUES (
                'alert-live-orange',
                'orange',
                'ORANGE ALERT — HIGH FLOOD RISK',
                'Heavy rainfall detected across catchment. Water levels rising rapidly along low-lying riverbanks.',
                'Pune Region',
                '65 minutes',
                'pending_approval',
                NULL,
                NULL,
                NULL,
                ?
            )
            """, (now,))

        conn.commit()
        conn.close()

simulation_service = SimulationService()
