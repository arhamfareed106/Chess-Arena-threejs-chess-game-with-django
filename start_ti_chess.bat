@echo off
echo ========================================
echo       TI Chess - Complete Startup
echo ========================================
echo.

echo [1/3] Starting Django Backend Server...
cd /d "f:\coding\company project\chess game\backend"
start "TI Chess Backend" cmd /k "python manage.py runserver 0.0.0.0:8001 --noreload"

echo [2/3] Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo [3/3] Opening TI Chess in your default browser...
timeout /t 2 /nobreak >nul
start http://localhost:8001

echo.
echo ========================================
echo     TI Chess is now running!
echo ========================================
echo.
echo Backend Server: http://localhost:8001
echo Game Interface: http://localhost:8001
echo API Documentation: http://localhost:8001/api/docs/
echo.
echo Press any key to exit this launcher...
pause >nul