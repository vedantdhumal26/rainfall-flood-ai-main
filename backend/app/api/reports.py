import datetime
import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from app.db.database import get_connection
from app.api.response_util import api_response

router = APIRouter()

class GenerateReportRequest(BaseModel):
    title: str
    type: str

@router.get("")
@router.get("/")
def get_reports():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports ORDER BY date DESC")
    rows = cursor.fetchall()
    conn.close()

    reports = []
    for r in rows:
        reports.append({
            "id": r["id"],
            "title": r["title"],
            "type": r["type"],
            "date": r["date"],
            "status": r["status"],
            "size": r["size"]
        })
    return api_response(reports)

@router.post("/generate")
def generate_report(req: GenerateReportRequest):
    conn = get_connection()
    cursor = conn.cursor()
    rep_id = f"r-{uuid.uuid4().hex[:6]}"
    today = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
    cursor.execute("""
    INSERT INTO reports (id, title, type, date, status, size)
    VALUES (?, ?, ?, ?, 'ready', '3.4 MB')
    """, (rep_id, req.title, req.type, today))
    conn.commit()
    conn.close()

    return api_response({
        "id": rep_id,
        "title": req.title,
        "type": req.type,
        "date": today,
        "status": "ready",
        "size": "3.4 MB"
    })
