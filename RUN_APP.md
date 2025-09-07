# 🚀 TI Chess - Complete App Startup Guide

## Quick Start (Recommended)

### Option 1: Using Makefile (Easiest)
```bash
# Start everything at once
make dev

# Or individual services
make backend      # Start Django backend only
make frontend     # Start React frontend only
make docker       # Start with Docker Compose
```

### Option 2: Manual Setup (Step by Step)

#### 1. Backend Setup & Start
```bash
# Navigate to backend directory
cd backend

# Install dependencies (choose based on your Python version)
python -m pip install -r requirements.txt
# OR for Python 3.13 compatibility:
python -m pip install -r requirements-py313.txt
# OR use automated installer:
python fix_dependencies.py

# Apply database migrations
python manage.py migrate

# Start Django development server
python manage.py runserver 8001
```

#### 2. Frontend Setup & Start (New Terminal)
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm run dev
```

### Option 3: Docker Setup (Production-like)
```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📋 Complete Command Reference

### Backend Commands (Django)

#### Initial Setup
```bash
cd backend

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# For Python 3.13 users (Windows):
python -m pip install -r requirements-py313.txt
# OR run automated installer:
python fix_dependencies.py
# OR use Windows batch script:
setup_windows.bat
```

#### Database Operations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Reset database (if needed)
del db.sqlite3
python manage.py migrate
```

#### Development Server
```bash
# Start development server (default port 8000)
python manage.py runserver

# Start on specific port
python manage.py runserver 8001

# Start with specific host
python manage.py runserver 0.0.0.0:8001
```

#### Testing & Quality
```bash
# Run tests
python manage.py test

# Check for issues
python manage.py check

# Collect static files (production)
python manage.py collectstatic

# Django shell
python manage.py shell
```

### Frontend Commands (React)

#### Initial Setup
```bash
cd frontend

# Install dependencies
npm install

# Update dependencies (optional)
npm update
```

#### Development
```bash
# Start development server
npm run dev

# Start on specific port
npm run dev -- --port 3001

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Testing & Quality
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npx tsc --noEmit
```

### Docker Commands

#### Development Environment
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build
```

#### Production Environment
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

## 🔗 Access URLs

After starting the services:

### Development URLs
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001/api/
- **Backend Root**: http://localhost:8001/ (API information)
- **Django Admin**: http://localhost:8001/admin/
- **API Documentation**: http://localhost:8001/api/docs/
- **Health Check**: http://localhost:8001/healthz/
- **WebSocket**: ws://localhost:8001/ws/

### Docker URLs (if using docker-compose)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## 🚨 Troubleshooting Commands

### Common Issues & Solutions

#### Backend Issues
```bash
# Check Django configuration
python manage.py check

# Reset migrations (if needed)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate

# Clear Python cache
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +

# Check installed packages
pip list
pip show django
```

#### Frontend Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

#### Port Conflicts
```bash
# Check what's using a port (Windows)
netstat -ano | findstr :8001
netstat -ano | findstr :3001

# Kill process by PID (Windows)
taskkill /PID <process_id> /F

# Use different ports
python manage.py runserver 8002
npm run dev -- --port 3002
```

## 🔧 Environment Variables

Create `.env` file in backend directory:
```bash
# Backend .env file
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 📱 Production Deployment

### Quick Production Commands
```bash
# Build frontend for production
cd frontend
npm run build

# Collect Django static files
cd ../backend
python manage.py collectstatic --noinput

# Start production server (example with gunicorn)
pip install gunicorn
gunicorn ti_chess.wsgi:application --bind 0.0.0.0:8000
```

## 🎮 Testing the Complete App

1. **Start Backend**: `cd backend && python manage.py runserver 8001`
2. **Start Frontend**: `cd frontend && npm run dev` (new terminal)
3. **Open Browser**: http://localhost:3001
4. **Test Features**:
   - Create a new game
   - Join with multiple browser tabs
   - Test real-time gameplay
   - Check 3D board interactions

## 📚 Additional Resources

- **Full Documentation**: `/docs/`
- **API Reference**: http://localhost:8001/api/schema/swagger-ui/
- **Architecture Guide**: `/docs/architecture.md`
- **Deployment Guide**: `/docs/deployment.md`
- **Troubleshooting**: `SETUP_TROUBLESHOOTING.md`

---

**🎯 Quick Start Summary:**
1. `cd backend && python manage.py runserver 8001`
2. `cd frontend && npm run dev` (new terminal)
3. Open http://localhost:3001
4. Start playing TI Chess! 🎮