@echo off
echo.
echo 🚀 TI Chess - Single Server Startup
echo ===================================
echo.

echo 📋 Starting integrated TI Chess server...
echo Frontend + Backend running together!
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: backend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo ✅ Project structure verified
echo.

echo 🔧 Starting TI Chess (Backend + Frontend)...
echo Available at: http://localhost:8001/app/
echo.

REM Start integrated server
cd backend
python manage.py runserver 8001

echo.
echo Press any key to exit...
pause >nul