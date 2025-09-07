# 🚀 TI Chess - Quick Start Commands

## Fastest Way to Run Your Complete App

### Option 1: One-Click Startup (Windows)
```bash
# Double-click this file to start everything:
start_app.bat

# OR run in PowerShell:
.\start_app.ps1
```

### Option 2: Two-Command Setup
```bash
# Terminal 1 (Backend):
cd backend && python manage.py runserver 8001

# Terminal 2 (Frontend):
cd frontend && npm run dev
```

### Option 3: Single Command (if Make is installed)
```bash
make dev
```

## ⚡ Super Quick Copy-Paste Commands

### Backend Only:
```bash
cd backend && python manage.py runserver 8001
```

### Frontend Only:
```bash
cd frontend && npm run dev
```

### Both at Once (PowerShell):
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python manage.py runserver 8001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

## 🎯 Access URLs
- **Game**: http://localhost:3001
- **API**: http://localhost:8001/
- **Admin**: http://localhost:8001/admin/
- **Health**: http://localhost:8001/healthz/

---
**💡 Tip: Bookmark this file for easy access to startup commands!**