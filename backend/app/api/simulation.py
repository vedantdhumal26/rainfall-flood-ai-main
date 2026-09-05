from fastapi import APIRouter
from pydantic import BaseModel
import datetime
from app.simulation.generator import generate_station_readings, generate_gridded_rainfall, WEATHER_STATIONS
from app.simulation.infrastructure import get_demo_infrastructure
from app.preprocessing.pipeline import run_pipeline
from app.ml.rainfall_model import rainfall_model
from app.ml.flood_model import flood_model
import pandas as pd
import numpy as np

router = APIRouter()

class SimulationRequest(BaseModel):
    scenario: str = "normal"  # options: normal, extreme_rainfall
    run_preprocessing: bool = True
    run_ml: bool = True

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
            
            # Run Rainfall Nowcasting
            df_rain_preds = rainfall_model.predict(df_features)
            
            # Run Flood Inundation Prediction
            df_flood_preds = flood_model.predict(df_rain_preds)
            
            # Convert NaN to None for JSON
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
    return {"stations": WEATHER_STATIONS}

@router.get("/infrastructure")
def get_infrastructure():
    """Returns static infrastructure data for the demo."""
    return get_demo_infrastructure()
