from fastapi import APIRouter
from app.services.dashboard_service import dashboard_service
from app.api.response_util import api_response

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary():
    summary = dashboard_service.get_summary()
    return api_response(summary)
