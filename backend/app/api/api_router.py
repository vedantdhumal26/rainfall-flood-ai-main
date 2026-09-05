from fastapi import APIRouter
from app.api import simulation
from app.api import routing

router = APIRouter()

router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
router.include_router(routing.router, prefix="/routing", tags=["routing"])

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running properly."}
