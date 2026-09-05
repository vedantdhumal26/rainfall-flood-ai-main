import datetime
from typing import Dict, List, Any
from app.db.database import get_connection
from app.services.simulation_service import simulation_service

class DashboardService:
    def get_summary(self) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()

        # Get latest prediction
        cursor.execute("SELECT * FROM predictions WHERE id = 'pred-init'")
        pred_row = cursor.fetchone()

        # Count active alerts
        cursor.execute("SELECT COUNT(*) as cnt FROM alerts WHERE status IN ('approved', 'broadcasted')")
        active_alerts_cnt = cursor.fetchone()["cnt"]

        # Count critical alerts
        cursor.execute("SELECT COUNT(*) as cnt FROM alerts WHERE level = 'red' AND status != 'archived'")
        critical_alerts_cnt = cursor.fetchone()["cnt"]

        # Count risk zones
        cursor.execute("SELECT COUNT(*) as cnt FROM risk_zones WHERE risk_level IN ('high', 'severe')")
        high_risk_zones_cnt = cursor.fetchone()["cnt"]

        # Infrastructure at risk count
        cursor.execute("SELECT SUM(at_risk) as total_at_risk FROM infrastructure")
        infra_row = cursor.fetchone()
        infra_at_risk = infra_row["total_at_risk"] if infra_row and infra_row["total_at_risk"] else 0

        conn.close()

        sim_state = simulation_service.get_state()
        phase = sim_state["currentPhase"]

        flood_prob = phase["floodProbability"] if phase else (pred_row["flood_probability"] if pred_row else 8.0)
        rainfall_val = phase["rainfall"] if phase else 8.0
        water_depth = phase["waterDepth"] if phase else 0.12
        arrival_time = phase["arrivalTime"] if phase else 0
        population_at_risk = phase["populationAtRisk"] if phase else 0
        inundation_area = round(flood_prob * 0.14, 1)

        risk_level = phase["riskLevel"] if phase else "low"

        # Format KPI Cards directly for frontend consumption
        kpis = [
            {
                "id": "rainfall",
                "label": "Rainfall",
                "value": str(rainfall_val),
                "unit": "mm",
                "sublabel": "Next 3 Hours",
                "trend": 24 if rainfall_val > 20 else 2,
                "trendDirection": "up" if rainfall_val > 20 else "down",
                "icon": "CloudRain",
                "riskLevel": risk_level
            },
            {
                "id": "flood-prob",
                "label": "Flood Probability",
                "value": str(int(flood_prob)),
                "unit": "%",
                "sublabel": "HIGH" if flood_prob >= 60 else "MODERATE" if flood_prob >= 30 else "LOW",
                "trend": 15 if flood_prob > 30 else 1,
                "trendDirection": "up" if flood_prob > 30 else "down",
                "icon": "Waves",
                "riskLevel": risk_level
            },
            {
                "id": "water-depth",
                "label": "Water Depth",
                "value": f"{water_depth:.2f}",
                "unit": "m",
                "sublabel": "Maximum predicted",
                "trend": 12 if water_depth > 0.5 else 0,
                "trendDirection": "up" if water_depth > 0.5 else "down",
                "icon": "Meter",
                "riskLevel": "high" if water_depth > 0.8 else "moderate" if water_depth > 0.3 else "low"
            },
            {
                "id": "arrival",
                "label": "Flood Arrival",
                "value": str(arrival_time) if arrival_time > 0 else "—",
                "unit": "min" if arrival_time > 0 else "",
                "sublabel": "Earliest predicted" if arrival_time > 0 else "No flood expected",
                "trend": 8 if arrival_time > 0 else 0,
                "trendDirection": "down",
                "icon": "Timer",
                "riskLevel": "severe" if arrival_time > 0 else "low"
            },
            {
                "id": "population",
                "label": "Population at Risk",
                "value": f"{population_at_risk:,}",
                "unit": "",
                "sublabel": "People",
                "trend": 18 if population_at_risk > 0 else 0,
                "trendDirection": "up" if population_at_risk > 0 else "down",
                "icon": "Users",
                "riskLevel": "severe" if population_at_risk > 10000 else "high" if population_at_risk > 0 else "low"
            },
            {
                "id": "infrastructure",
                "label": "Infrastructure",
                "value": str(phase["infrastructure"] if phase else infra_at_risk),
                "unit": "",
                "sublabel": "Critical assets",
                "trend": 5 if (phase and phase["infrastructure"] > 0) else 0,
                "trendDirection": "up",
                "icon": "Building2",
                "riskLevel": "high" if (phase and phase["infrastructure"] > 10) else "low"
            }
        ]

        # Check for active alert banner
        active_banner = None
        if phase and phase["level"] in ["red", "orange"]:
            active_banner = {
                "level": phase["level"],
                "title": f"{phase['level'].upper()} ALERT — {phase['label'].upper()}",
                "description": f"{'Extreme' if phase['level'] == 'red' else 'Heavy'} rainfall ({rainfall_val}mm) and rapid inundation predicted.",
                "region": "Pune Metropolitan Region",
                "eta": f"{arrival_time} minutes" if arrival_time > 0 else "Immediate"
            }

        return {
            "system_status": "OPERATIONAL",
            "active_alerts": active_alerts_cnt,
            "critical_alerts": critical_alerts_cnt,
            "high_risk_zones": high_risk_zones_cnt,
            "predicted_inundation_area": inundation_area,
            "maximum_rainfall": rainfall_val,
            "population_at_risk": population_at_risk,
            "infrastructure_at_risk": phase["infrastructure"] if phase else infra_at_risk,
            "risk_level": risk_level,
            "flood_probability": flood_prob,
            "water_depth": water_depth,
            "arrival_time": arrival_time,
            "kpis": kpis,
            "active_banner": active_banner,
            "is_simulation_mode": True,
            "last_updated": datetime.datetime.now(datetime.timezone.utc).strftime("%H:%M:%S UTC")
        }

dashboard_service = DashboardService()
