from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.database import get_connection
from app.api.response_util import api_response

router = APIRouter()

class UpdateTeamStatusRequest(BaseModel):
    status: str  # deployed, active, standby, demobilized
    assigned_zone: str = None

@router.get("/teams")
def get_response_teams():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM response_teams")
    rows = cursor.fetchall()
    conn.close()

    teams = []
    for r in rows:
        teams.append({
            "id": r["id"],
            "name": r["name"],
            "type": r["type"],
            "membersCount": r["members_count"],
            "status": r["status"],
            "assignedZone": r["assigned_zone"],
            "lat": r["lat"],
            "lon": r["lon"],
            "contact": r["contact"]
        })
    return api_response(teams)

@router.patch("/teams/{id}")
def update_team_status(id: str, req: UpdateTeamStatusRequest):
    conn = get_connection()
    cursor = conn.cursor()
    if req.assigned_zone:
        cursor.execute("UPDATE response_teams SET status = ?, assigned_zone = ? WHERE id = ?", (req.status, req.assigned_zone, id))
    else:
        cursor.execute("UPDATE response_teams SET status = ? WHERE id = ?", (req.status, id))
    conn.commit()

    cursor.execute("SELECT * FROM response_teams WHERE id = ?", (id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Team not found")

    return api_response({
        "id": r["id"],
        "name": r["name"],
        "status": r["status"],
        "assignedZone": r["assigned_zone"]
    })

@router.get("/shelters")
def get_shelters():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shelters")
    rows = cursor.fetchall()
    conn.close()

    shelters = []
    for r in rows:
        shelters.append({
            "id": r["id"],
            "name": r["name"],
            "address": r["address"],
            "position": [r["lat"], r["lon"]],
            "lat": r["lat"],
            "lon": r["lon"],
            "capacity": r["capacity"],
            "occupancy": r["occupancy"],
            "risk": r["risk_level"],
            "distance": r["distance_km"],
            "travelTime": r["travel_time_mins"],
            "status": r["status"]
        })
    return api_response(shelters)

@router.get("/infrastructure")
def get_infrastructure():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM infrastructure")
    rows = cursor.fetchall()
    conn.close()

    items = []
    summary = {
        "hospitals": {"total": 0, "atRisk": 0},
        "schools": {"total": 0, "atRisk": 0},
        "bridges": {"total": 0, "atRisk": 0},
        "roads": {"total": 0, "atRisk": 0}
    }

    for r in rows:
        t = r["type"]
        items.append({
            "id": r["id"],
            "name": r["name"],
            "type": t,
            "position": [r["lat"], r["lon"]],
            "lat": r["lat"],
            "lon": r["lon"],
            "count": r["count"],
            "atRisk": r["at_risk"],
            "status": r["status"]
        })
        key = f"{t}s" if not t.endswith("s") else t
        if key in summary:
            summary[key]["total"] += r["count"]
            summary[key]["atRisk"] += r["at_risk"]

    breakdown = [
        {"type": "Hospitals", "count": 3, "atRisk": 1, "icon": "Cross", "color": "text-risk-severe"},
        {"type": "Schools", "count": 12, "atRisk": 4, "icon": "GraduationCap", "color": "text-risk-high"},
        {"type": "Bridges", "count": 7, "atRisk": 3, "icon": "Construction", "color": "text-risk-moderate"},
        {"type": "Roads", "count": 21, "atRisk": 8, "icon": "Road", "color": "text-accent-400"}
    ]

    return api_response({
        "items": items,
        "summary": summary,
        "breakdown": breakdown
    })
