from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.auth_service import auth_service
from app.api.response_util import api_response

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    result = auth_service.login(req.username, req.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid username or password. Demo accounts: officer/officer123, admin/admin123")
    return api_response(result)

@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        # Provide default officer for demo seamless experience if no token provided
        return api_response({
            "id": "u1",
            "username": "officer",
            "name": "Disaster Management Officer",
            "role": "officer"
        })

    token = authorization.replace("Bearer ", "")
    user = auth_service.verify_token(token)
    if not user:
        return api_response({
            "id": "u1",
            "username": "officer",
            "name": "Disaster Management Officer",
            "role": "officer"
        })

    return api_response(user)
