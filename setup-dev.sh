#!/bin/bash

# TI Chess Development Startup Script
# This script starts both backend and frontend in development mode

echo "🚀 Starting TI Chess Development Environment..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "🐍 Setting up Python backend..."
cd backend

# Activate virtual environment (Windows)
if [[ "$OSTYPE" == "msys" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
echo "📊 Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist
echo "👤 Setting up admin user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

cd ..

# Setup frontend
echo "⚛️ Setting up React frontend..."
cd frontend

# Install frontend dependencies
npm install

# Build frontend for development
npm run build

cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application:"
echo "1. Backend: cd backend && python manage.py runserver"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "📱 Application URLs:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:8000"
echo "- Admin Panel: http://localhost:8000/admin (admin/admin123)"
echo ""
echo "🎮 Happy gaming!"