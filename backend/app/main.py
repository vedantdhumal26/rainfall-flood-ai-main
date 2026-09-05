from fastapi import FastAPI
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
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to the AI Rainfall & Flood Early Warning API"}
