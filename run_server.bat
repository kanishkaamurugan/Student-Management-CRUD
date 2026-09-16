@echo off
title Student Management System - Server
echo ========================================================
echo    Starting Student Management System Backend Server
echo ========================================================
echo.

cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in %~dp0venv!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

echo Activating virtual environment and starting server...
echo Access the application at: http://127.0.0.1:8000/
echo.
echo Press Ctrl+C in this window to stop the server anytime.
echo.

.\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
pause
