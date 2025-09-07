# TI Chess Deployment Guide

## Quick Start (Local Development)

```bash
# Clone the repository
git clone <repo-url>
cd ti-chess

# Start all services
docker-compose up

# Navigate to http://localhost:3000
```

That's it! The application will be running with:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- Domain name (for HTTPS)
- Cloud provider account (Render, Railway, Heroku, etc.)
- Email service (for notifications)

### Environment Variables

Create `.env` files for production:

#### Backend (.env)
```bash
# Required
DJANGO_SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port/db

# Security
DEBUG=False
ALLOWED_HOSTS=your-domain.com,api.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Optional
SENTRY_DSN=your-sentry-dsn
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=https://api.your-domain.com
VITE_WS_BASE_URL=wss://api.your-domain.com
VITE_SENTRY_DSN=your-sentry-dsn
```

## Deployment Options

### Option 1: Render (Recommended)

#### Backend Deployment on Render

1. **Create Web Service**:
   - Connect your GitHub repository
   - Choose "Docker" as the environment
   - Set build command: `docker build -f backend/Dockerfile backend`
   - Set start command: `daphne -b 0.0.0.0 -p $PORT ti_chess.asgi:application`

2. **Environment Variables**:
   Add all backend environment variables in Render dashboard

3. **Database**:
   - Create PostgreSQL database in Render
   - Copy connection string to `DATABASE_URL`

4. **Redis**:
   - Create Redis instance in Render
   - Copy connection string to `REDIS_URL`

#### Frontend Deployment on Vercel

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy from frontend directory
   cd frontend
   vercel --prod
   ```

2. **Environment Variables**:
   Add frontend environment variables in Vercel dashboard

3. **Custom Domain**:
   Configure custom domain in Vercel settings

### Option 2: Railway

#### Backend on Railway

1. **Deploy with Railway CLI**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway deploy
   ```

2. **Add Services**:
   - Add PostgreSQL plugin
   - Add Redis plugin
   - Configure environment variables

#### Frontend on Netlify

1. **Deploy via Git**:
   - Connect GitHub repository
   - Set build directory: `frontend`
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Option 3: Self-Hosted (VPS)

#### Server Setup

1. **Prepare Server**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application**:
   ```bash
   # Clone repository
   git clone <repo-url>
   cd ti-chess
   
   # Create production compose file
   cp docker-compose.yml docker-compose.prod.yml
   # Edit docker-compose.prod.yml for production settings
   
   # Start services
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Setup Nginx Reverse Proxy**:
   ```nginx
   # /etc/nginx/sites-available/ti-chess
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api/ {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /ws/ {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

4. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Database Migration

### Initial Setup
```bash
# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run migrations
docker-compose exec backend python manage.py migrate

# Create demo game (optional)
docker-compose exec backend python manage.py seed_demo_game
```

### Updates
```bash
# Backup database
docker-compose exec db pg_dump -U postgres ti_chess > backup.sql

# Apply migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

## Wix Integration

### Embedding in Wix

1. **Add HTML Element**:
   - Add an HTML iframe element to your Wix page
   - Use the embed code:

```html
<iframe 
  src="https://your-frontend-domain.com/play/{game_uuid}"
  width="100%" 
  height="800px" 
  style="border:none;"
  allowfullscreen>
</iframe>
```

2. **CORS Configuration**:
   Ensure your backend CORS settings include Wix domains:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://your-wix-site.wixsite.com",
       "https://your-frontend-domain.com",
   ]
   ```

3. **Frame Headers**:
   Configure X-Frame-Options to allow Wix embedding:
   ```python
   X_FRAME_OPTIONS = 'SAMEORIGIN'
   # Or use CSP:
   # SECURE_CONTENT_TYPE_NOSNIFF = True
   ```

## Monitoring & Maintenance

### Health Checks

```bash
# Check backend health
curl https://api.your-domain.com/healthz

# Check frontend
curl https://your-domain.com

# Check WebSocket
wscat -c wss://api.your-domain.com/ws/game/test/
```

### Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U postgres ti_chess > "backup_${DATE}.sql"

# Upload to cloud storage
# aws s3 cp "backup_${DATE}.sql" s3://your-backups/
```

### Log Management

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rotate logs
docker-compose exec backend python manage.py flush_logs
```

### Performance Monitoring

1. **Setup Sentry**:
   - Create Sentry project
   - Add DSN to environment variables
   - Monitor errors and performance

2. **Database Monitoring**:
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

3. **WebSocket Monitoring**:
   - Monitor connection count
   - Track message frequency
   - Monitor reconnection rates

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**:
   ```bash
   # Check Redis connection
   docker-compose exec redis redis-cli ping
   
   # Check backend logs
   docker-compose logs backend
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database status
   docker-compose exec db pg_isready
   
   # Check connection string
   docker-compose exec backend python manage.py dbshell
   ```

3. **Frontend Build Errors**:
   ```bash
   # Clear cache and rebuild
   cd frontend
   rm -rf node_modules dist
   npm install
   npm run build
   ```

4. **CORS Errors**:
   - Verify CORS_ALLOWED_ORIGINS includes frontend domain
   - Check browser console for exact error
   - Ensure both HTTP and HTTPS variants are included

### Performance Issues

1. **Slow API Responses**:
   ```python
   # Add database indexes
   python manage.py dbshell
   CREATE INDEX idx_game_status ON game_game(status);
   CREATE INDEX idx_piece_position ON game_piece(position_x, position_y);
   ```

2. **High Memory Usage**:
   ```bash
   # Monitor memory
   docker stats
   
   # Optimize images
   docker image prune -a
   ```

3. **WebSocket Lag**:
   - Check Redis latency
   - Monitor network connectivity
   - Optimize message payload size

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled everywhere
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database access restricted
- [ ] Secrets rotation scheduled
- [ ] Backup encryption enabled
- [ ] Monitoring alerts configured
- [ ] Error tracking sanitized

## Maintenance Schedule

### Daily
- Monitor application logs
- Check health endpoints
- Review error rates

### Weekly
- Database backup verification
- Security update check
- Performance metrics review

### Monthly
- Dependency updates
- Security audit
- Backup restore test
- Load testing

### Quarterly
- Full system audit
- Disaster recovery test
- Performance optimization
- Security penetration test