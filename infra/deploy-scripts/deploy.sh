#!/bin/bash

# TI Chess Production Deployment Script
# This script deploys the application to a production environment

set -e  # Exit on any error

# Configuration
PROJECT_NAME="ti-chess"
BACKEND_IMAGE="ti-chess-backend"
FRONTEND_IMAGE="ti-chess-frontend"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"ghcr.io/your-username"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build -t ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest -f backend/Dockerfile backend/
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest -f frontend/Dockerfile frontend/
    
    log_success "Docker images built successfully"
}

# Push images to registry
push_images() {
    log_info "Pushing images to registry..."
    
    docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest
    docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest
    
    log_success "Images pushed to registry"
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production..."
    
    # Create production environment file if it doesn't exist
    if [ ! -f .env.prod ]; then
        log_warning ".env.prod file not found. Creating template..."
        cat > .env.prod << EOF
# Production Environment Variables
DJANGO_SECRET_KEY=change-this-in-production
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port/db
DEBUG=False
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
SENTRY_DSN=your-sentry-dsn
EOF
        log_warning "Please edit .env.prod with your production values"
        exit 1
    fi
    
    # Deploy using docker-compose
    docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
    
    log_success "Production deployment completed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate
    
    log_success "Database migrations completed"
}

# Collect static files
collect_static() {
    log_info "Collecting static files..."
    
    docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput
    
    log_success "Static files collected"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    if curl -f http://localhost:8000/healthz > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    log_success "All health checks passed"
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres ti_chess > "${BACKUP_FILE}"
    
    log_success "Database backup created: ${BACKUP_FILE}"
}

# Rollback deployment
rollback() {
    log_warning "Rolling back deployment..."
    
    # Pull previous images
    docker pull ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:previous
    docker pull ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:previous
    
    # Tag as latest
    docker tag ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:previous ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest
    docker tag ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:previous ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest
    
    # Redeploy
    deploy_production
    
    log_success "Rollback completed"
}

# Main deployment function
deploy() {
    log_info "Starting TI Chess production deployment"
    
    check_prerequisites
    
    # Create backup before deployment
    if [ "$SKIP_BACKUP" != "true" ]; then
        backup_database
    fi
    
    # Tag current images as previous (for rollback)
    docker tag ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:previous 2>/dev/null || true
    docker tag ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:previous 2>/dev/null || true
    
    build_images
    
    if [ "$SKIP_PUSH" != "true" ]; then
        push_images
    fi
    
    deploy_production
    run_migrations
    collect_static
    
    # Wait for services and run health check
    if ! health_check; then
        log_error "Deployment failed health check. Rolling back..."
        rollback
        exit 1
    fi
    
    log_success "TI Chess deployed successfully!"
    log_info "Backend: http://localhost:8000"
    log_info "Frontend: http://localhost:3000"
    log_info "Admin: http://localhost:8000/admin"
}

# Script usage
usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy          Deploy the application"
    echo "  rollback        Rollback to previous version"
    echo "  health          Run health checks"
    echo "  backup          Create database backup"
    echo "  logs            Show application logs"
    echo ""
    echo "Options:"
    echo "  --skip-backup   Skip database backup"
    echo "  --skip-push     Skip pushing images to registry"
    echo "  --help          Show this help message"
}

# Parse command line arguments
COMMAND=${1:-"deploy"}
shift || true

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backup)
            SKIP_BACKUP="true"
            shift
            ;;
        --skip-push)
            SKIP_PUSH="true"
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Execute command
case $COMMAND in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    health)
        health_check
        ;;
    backup)
        backup_database
        ;;
    logs)
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac