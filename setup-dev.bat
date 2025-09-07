@echo off
REM TI Chess Development Startup Script for Windows
REM This script starts both backend and frontend in development mode

echo 🚀 Starting TI Chess Development Environment...

REM Check if virtual environment exists
if not exist "backend\venv" (
    echo 📦 Creating Python virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

REM Setup Python backend
echo 🐍 Setting up Python backend...
cd backend

REM Activate virtual environment
call venv\Scripts\activate

REM Install Python dependencies
pip install -r requirements.txt

REM Run migrations
echo 📊 Running database migrations...
python manage.py migrate

REM Create superuser if it doesn't exist
echo 👤 Setting up admin user...
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else print('Superuser already exists')"

cd ..

REM Setup frontend
echo ⚛️ Setting up React frontend...
cd frontend

REM Install frontend dependencies
npm install

REM Build frontend
npm run build

cd ..

echo ✅ Setup complete!
echo.
echo 🎯 To start the application:
echo 1. Backend: cd backend ^&^& python manage.py runserver
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo 📱 Application URLs:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:8000
echo - Admin Panel: http://localhost:8000/admin (admin/admin123)
echo.
echo 🎮 Happy gaming!

pause