#!/usr/bin/env powershell

Write-Host ""
Write-Host "🚀 TI Chess - Single Server Startup" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "backend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Make sure 'backend' directory exists" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Starting TI Chess (Integrated Backend + Frontend)..." -ForegroundColor Cyan
Write-Host "Available at: http://localhost:8001/app/" -ForegroundColor Yellow
Write-Host ""

# Start integrated server
Set-Location "backend"
python manage.py runserver 8001

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host