.PHONY: build up down test clean restart logs migrate seed dev backend frontend docker-dev

# Quick development start (recommended)
dev:
	@echo "🚀 Starting TI Chess Development Environment..."
	@echo "📱 Frontend will be at: http://localhost:3001"
	@echo "🔧 Backend will be at: http://localhost:8001"
	@echo "Starting backend in background..."
	@cd backend && python manage.py runserver 8001 &
	@echo "Starting frontend..."
	@cd frontend && npm run dev

# Start backend only
backend:
	@echo "🔧 Starting Django backend at http://localhost:8001"
	cd backend && python manage.py runserver 8001

# Start frontend only
frontend:
	@echo "📱 Starting React frontend at http://localhost:3001"
	cd frontend && npm run dev

# Docker-based development
docker-dev: build up

# Build all services
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Run tests
test:
	docker-compose exec backend python manage.py test
	docker-compose exec frontend npm test

# Clean everything
clean:
	docker-compose down -v
	docker system prune -f

# Restart services
restart: down up

# Run migrations
migrate:
	docker-compose exec backend python manage.py migrate

# Seed demo game
seed:
	docker-compose exec backend python manage.py seed_demo_game

# Backend shell
shell:
	docker-compose exec backend python manage.py shell

# Frontend shell
frontend-shell:
	docker-compose exec frontend sh

# Create superuser
superuser:
	docker-compose exec backend python manage.py createsuperuser

# Install dependencies
install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

# Development setup
dev-setup: build up migrate superuser seed

# Production build
prod-build:
	docker build -t ti-chess-backend ./backend
	docker build -t ti-chess-frontend ./frontend