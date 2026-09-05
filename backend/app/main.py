import datetime
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router

app = FastAPI(
    title="AI-Powered Integrated Rainfall & Flood Early Warning System",
    description="SIH 2026 Prototype (Problem Statement 26071)",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": {
                "message": str(exc),
                "type": exc.__class__.__name__
            },
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
    )

app.include_router(api_router.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to the AI Rainfall & Flood Early Warning API"}

