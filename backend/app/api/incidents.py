import datetime
import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.database import get_connection
from app.api.response_util import api_response

router = APIRouter()

class CreateIncidentRequest(BaseModel):
    title: str
    description: str
    location: str
    lat: float
    lon: float
    severity: str = "high"

@router.get("")
@router.get("/")
def get_incidents():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY reported_at DESC")
    rows = cursor.fetchall()
    conn.close()

    incidents = []
    for r in rows:
        incidents.append({
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "location": r["location"],
            "lat": r["lat"],
            "lon": r["lon"],
            "severity": r["severity"],
            "status": r["status"],
            "reportedAt": r["reported_at"]
        })
    return api_response(incidents)

@router.post("")
@router.post("/")
def report_incident(req: CreateIncidentRequest):
    inc_id = f"inc-{uuid.uuid4().hex[:6]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO incidents (id, title, description, location, lat, lon, severity, status, reported_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'investigating', ?)
    """, (inc_id, req.title, req.description, req.location, req.lat, req.lon, req.severity, now))
    conn.commit()
    conn.close()

    return api_response({
        "id": inc_id,
        "title": req.title,
        "description": req.description,
        "location": req.location,
        "lat": req.lat,
        "lon": req.lon,
        "severity": req.severity,
        "status": "investigating",
        "reportedAt": now
    })
