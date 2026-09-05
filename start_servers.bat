@echo off
echo Starting AI Flood Warning System (Local Mode)

echo Starting Backend...
start cmd /k "cd backend && python -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend...
start cmd /k "cd frontend && npm install && npm run dev"

echo Servers are starting in new windows...
echo Backend API will be available at: http://127.0.0.1:8000/docs
echo Frontend Dashboard will be available at: http://localhost:5173
pause
