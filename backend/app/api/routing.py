from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.routing.engine import get_evacuation_plan
from app.api.response_util import api_response

router = APIRouter()

from typing import Optional, List

class RouteRequest(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None
    current_location: Optional[List[float]] = None

@router.post("/evacuate")
def get_evacuation_route(req: RouteRequest):
    """Calculates an evacuation route from the given coordinates to the nearest safe shelter."""
    lat = req.lat
    lon = req.lon
    if (lat is None or lon is None) and req.current_location and len(req.current_location) >= 2:
        lat = req.current_location[0]
        lon = req.current_location[1]
    if lat is None or lon is None:
        raise HTTPException(status_code=400, detail="Latitude and Longitude required")
    plan = get_evacuation_plan(lat, lon)
    if plan.get("status") == "error":
        raise HTTPException(status_code=404, detail=plan.get("message"))
    return api_response(plan)
