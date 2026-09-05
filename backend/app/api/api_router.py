from fastapi import APIRouter
from app.api import (
    health,
    dashboard,
    rainfall,
    predictions,
    risk_zones,
    alerts,
    response,
    data_sources,
    ai,
    reports,
    incidents,
    simulation,
    routing,
    auth,
)

router = APIRouter()

# Core modules
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
router.include_router(rainfall.router, prefix="/rainfall", tags=["rainfall"])
router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
router.include_router(risk_zones.router, prefix="/risk-zones", tags=["risk-zones"])
router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
router.include_router(response.router, prefix="/response", tags=["response"])
router.include_router(data_sources.router, prefix="/data-sources", tags=["data-sources"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])
router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
router.include_router(routing.router, prefix="/routing", tags=["routing"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Direct path aliases requested in Master Prompt Section 4
@router.get("/infrastructure", tags=["response"])
def get_infrastructure_alias():
    return response.get_infrastructure()

@router.get("/radar/latest", tags=["rainfall"])
def get_radar_alias():
    return rainfall.get_latest_radar()

@router.get("/satellite/latest", tags=["rainfall"])
def get_satellite_alias():
    return rainfall.get_latest_satellite()
