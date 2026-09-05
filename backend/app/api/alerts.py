from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.alert_service import alert_service
from app.api.response_util import api_response

router = APIRouter()

class CreateAlertRequest(BaseModel):
    level: str = "yellow"
    title: str
    description: str
    region: str = "Pune Region"
    eta: str = "60 minutes"

class ApproveRequest(BaseModel):
    approved_by: str = "Disaster Management Officer"

@router.get("")
@router.get("/")
def list_alerts():
    alerts = alert_service.get_alerts()
    return api_response(alerts)

@router.post("")
@router.post("/")
def create_alert(req: CreateAlertRequest):
    alert = alert_service.create_alert(req.model_dump())
    return api_response(alert)

@router.get("/{id}")
def get_alert(id: str):
    alert = alert_service.get_alert_by_id(id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return api_response(alert)

@router.post("/{id}/approve")
def approve_alert(id: str, req: ApproveRequest = None):
    officer = req.approved_by if req else "Disaster Management Officer"
    alert = alert_service.approve_alert(id, officer)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return api_response(alert)

@router.post("/{id}/broadcast")
def broadcast_alert(id: str):
    alert = alert_service.broadcast_alert(id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return api_response(alert)
