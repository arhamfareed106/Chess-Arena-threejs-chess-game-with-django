# TI Chess - Complete Startup Script (PowerShell)

Write-Host "========================================"
Write-Host "      TI Chess - Complete Startup"
Write-Host "========================================"
Write-Host ""

Write-Host "[1/3] Starting Django Backend Server..." -ForegroundColor Green
Set-Location "f:\coding\company project\chess game\backend"
Start-Process -WindowStyle Normal -WorkingDirectory "f:\coding\company project\chess game\backend" -FilePath "python" -ArgumentList "manage.py", "runserver", "0.0.0.0:8001", "--noreload"

Write-Host "[2/3] Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "[3/3] Opening TI Chess in your default browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:8001"

Write-Host ""
Write-Host "========================================"
Write-Host "    TI Chess is now running!"
Write-Host "========================================"
Write-Host ""
Write-Host "Backend Server: http://localhost:8001" -ForegroundColor Green
Write-Host "Game Interface: http://localhost:8001" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:8001/api/docs/" -ForegroundColor Blue
Write-Host ""
Write-Host "Press any key to exit this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")