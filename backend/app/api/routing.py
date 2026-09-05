from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.routing.engine import get_evacuation_plan

router = APIRouter()

class RouteRequest(BaseModel):
    lat: float
    lon: float

@router.post("/evacuate")
def get_evacuation_route(req: RouteRequest):
    """Calculates an evacuation route from the given coordinates to the nearest safe shelter."""
    plan = get_evacuation_plan(req.lat, req.lon)
    if plan.get("status") == "error":
        raise HTTPException(status_code=404, detail=plan.get("message"))
    return plan
