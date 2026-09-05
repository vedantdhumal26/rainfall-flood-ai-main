import datetime
import uuid
from typing import Dict, List, Any, Optional
from app.db.database import get_connection

class AlertService:
    def get_alerts(self) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()

        alerts = []
        for r in rows:
            alerts.append({
                "id": r["id"],
                "level": r["level"],
                "title": r["title"],
                "description": r["description"],
                "region": r["region"],
                "eta": r["eta"],
                "status": r["status"],
                "approvedBy": r["approved_by"],
                "approvedAt": r["approved_at"],
                "broadcastedAt": r["broadcasted_at"],
                "createdAt": r["created_at"],
                "time": r["created_at"][11:16] if len(r["created_at"]) >= 16 else "18:42"
            })
        return alerts

    def create_alert(self, data: Dict[str, Any]) -> Dict[str, Any]:
        alert_id = f"alert-{uuid.uuid4().hex[:8]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO alerts (id, level, title, description, region, eta, status, approved_by, approved_at, broadcasted_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending_approval', NULL, NULL, NULL, ?)
        """, (
            alert_id,
            data.get("level", "yellow"),
            data.get("title", "WEATHER ALERT"),
            data.get("description", "Potential flood risk detected."),
            data.get("region", "Pune Region"),
            data.get("eta", "60 minutes"),
            now
        ))
        conn.commit()
        conn.close()
        return self.get_alert_by_id(alert_id)

    def get_alert_by_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
        r = cursor.fetchone()
        conn.close()
        if not r:
            return None
        return {
            "id": r["id"],
            "level": r["level"],
            "title": r["title"],
            "description": r["description"],
            "region": r["region"],
            "eta": r["eta"],
            "status": r["status"],
            "approvedBy": r["approved_by"],
            "approvedAt": r["approved_at"],
            "broadcastedAt": r["broadcasted_at"],
            "createdAt": r["created_at"],
            "time": r["created_at"][11:16] if len(r["created_at"]) >= 16 else "18:42"
        }

    def approve_alert(self, alert_id: str, approved_by: str = "Disaster Management Officer") -> Optional[Dict[str, Any]]:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE alerts
        SET status = 'approved', approved_by = ?, approved_at = ?
        WHERE id = ?
        """, (approved_by, now, alert_id))
        conn.commit()
        conn.close()
        return self.get_alert_by_id(alert_id)

    def broadcast_alert(self, alert_id: str) -> Optional[Dict[str, Any]]:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE alerts
        SET status = 'broadcasted', broadcasted_at = ?
        WHERE id = ?
        """, (now, alert_id))
        conn.commit()
        conn.close()
        return self.get_alert_by_id(alert_id)

alert_service = AlertService()
