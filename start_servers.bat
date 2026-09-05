@echo off
title RAINSHIELD AI - Dual Server Launcher
echo =====================================================================
echo RAINSHIELD AI - Integrated Rainfall and Flood Early Warning System
echo Smart India Hackathon 2026 - Problem Statement 26071
echo =====================================================================

set "PATH=C:\Users\MACHINDRA DHUMAL\nodejs\node-v20.18.0-win-x64;%PATH%"

echo.
echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000...
start "RainShield AI - Backend API" cmd /k "cd /d ""%~dp0backend"" && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo [2/2] Launching Vite Frontend on http://localhost:5173...
start "RainShield AI - Frontend Dashboard" cmd /k "cd /d ""%~dp0"" && set ""PATH=C:\Users\MACHINDRA DHUMAL\nodejs\node-v20.18.0-win-x64;%%PATH%%"" && npm run dev"

echo.
echo =====================================================================
echo Both servers have been launched in separate windows!
echo - Backend Swagger Docs: http://127.0.0.1:8000/docs
echo - Frontend Dashboard:   http://localhost:5173
echo =====================================================================
echo.
pause
