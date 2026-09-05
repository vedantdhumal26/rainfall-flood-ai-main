import datetime
import uuid
from typing import Dict, Any, Optional
from app.db.database import get_connection

# In-memory active tokens for simple prototype auth
ACTIVE_TOKENS: Dict[str, Dict[str, Any]] = {}

class AuthService:
    def login(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", (username, password))
        user = cursor.fetchone()
        conn.close()

        if not user:
            return None

        token = f"token_{uuid.uuid4().hex}"
        user_info = {
            "id": user["id"],
            "username": user["username"],
            "name": user["name"],
            "role": user["role"]
        }
        ACTIVE_TOKENS[token] = user_info
        return {
            "token": token,
            "user": user_info
        }

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        return ACTIVE_TOKENS.get(token)

auth_service = AuthService()
