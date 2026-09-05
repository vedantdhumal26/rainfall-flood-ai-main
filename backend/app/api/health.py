import datetime
from fastapi import APIRouter
from app.db.database import get_connection
from app.api.response_util import api_response

router = APIRouter()

@router.get("")
@router.get("/")
def health_check():
    db_status = "connected"
    try:
        conn = get_connection()
        conn.execute("SELECT 1")
        conn.close()
    except Exception as e:
        db_status = f"error: {str(e)}"

    return api_response({
        "status": "healthy",
        "database": db_status,
        "ml_service": "available",
        "models": {
            "rainfall_nowcast": "RainfallPredictor-v1.0",
            "flood_inundation": "FloodPredictor-v1.0"
        },
        "mode": "simulation",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    })
