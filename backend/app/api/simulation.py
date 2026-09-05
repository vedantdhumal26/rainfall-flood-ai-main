from fastapi import APIRouter
from pydantic import BaseModel
import datetime
from typing import Optional
from app.simulation.generator import generate_station_readings, generate_gridded_rainfall, WEATHER_STATIONS
from app.simulation.infrastructure import get_demo_infrastructure
from app.preprocessing.pipeline import run_pipeline
from app.ml.rainfall_model import rainfall_model
from app.ml.flood_model import flood_model
from app.services.simulation_service import simulation_service
from app.api.response_util import api_response
import pandas as pd
import numpy as np

router = APIRouter()

class SimulationRequest(BaseModel):
    scenario: str = "normal"  # options: normal, extreme_rainfall
    run_preprocessing: bool = True
    run_ml: bool = True

class SetScenarioRequest(BaseModel):
    scenario_id: Optional[str] = None
    scenario: Optional[str] = None
    phase_index: int = 0

class StartRequest(BaseModel):
    scenario_id: Optional[str] = None

@router.get("/state")
def get_simulation_state():
    state = simulation_service.get_state()
    return api_response(state)

@router.post("/set-scenario")
def set_scenario(req: SetScenarioRequest):
    target = req.scenario_id or req.scenario or "NORMAL"
    state = simulation_service.set_scenario(target, req.phase_index)
    return api_response(state)

@router.post("/start")
def start_simulation(req: StartRequest = None):
    scenario_id = req.scenario_id if req else None
    state = simulation_service.start_simulation(scenario_id)
    return api_response(state)

@router.post("/pause")
def pause_simulation():
    state = simulation_service.pause_simulation()
    return api_response(state)

@router.post("/step")
def step_simulation():
    state = simulation_service.step_simulation()
    return api_response(state)

@router.post("/reset")
def reset_simulation():
    state = simulation_service.reset_simulation()
    return api_response(state)

@router.post("/trigger")
def trigger_simulation(req: SimulationRequest):
    """
    Triggers a data simulation step, runs preprocessing, and executes ML models.
    """
    current_time = datetime.datetime.now(datetime.timezone.utc)
    
    observations = generate_station_readings(req.scenario, current_time)
    gridded_data = generate_gridded_rainfall(req.scenario)
    
    response_data = {
        "observations": observations,
        "gridded_rainfall": gridded_data
    }
    
    summary = {
        "stations_updated": len(observations),
        "grid_cells_updated": len(gridded_data)
    }
    
    if req.run_preprocessing:
        fused_features = run_pipeline(observations, gridded_data)
        response_data["fused_features"] = fused_features
        summary["fused_cells"] = len(fused_features)
        
        if req.run_ml and len(fused_features) > 0:
            df_features = pd.DataFrame(fused_features)
            df_rain_preds = rainfall_model.predict(df_features)
            df_flood_preds = flood_model.predict(df_rain_preds)
            df_flood_preds = df_flood_preds.replace({np.nan: None})
            
            response_data["predictions"] = df_flood_preds.to_dict(orient="records")
            summary["predictions_generated"] = len(response_data["predictions"])
    
    return {
        "status": "success",
        "scenario": req.scenario,
        "timestamp": current_time.isoformat(),
        "summary": summary,
        "data": response_data
    }

@router.get("/stations")
def get_stations():
    """Returns the list of static weather stations."""
    return api_response({"stations": WEATHER_STATIONS})

@router.get("/infrastructure")
def get_infrastructure():
    """Returns static infrastructure data for the demo."""
    return api_response(get_demo_infrastructure())
