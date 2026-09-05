from fastapi import APIRouter
from app.db.database import get_connection
from app.api.response_util import api_response

router = APIRouter()

@router.get("")
@router.get("/")
def get_data_sources():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM data_sources")
    rows = cursor.fetchall()
    conn.close()

    sources = []
    for r in rows:
        sources.append({
            "id": r["id"],
            "name": r["name"],
            "type": r["type"],
            "status": r["status"],
            "lastSync": r["last_sync"],
            "coverage": r["coverage_pct"]
        })

    return api_response({
        "sources": sources,
        "active_sensors": 1247,
        "throughput_mb_s": 8.4,
        "api_latency_ms": 42,
        "system_status": "OPERATIONAL"
    })
