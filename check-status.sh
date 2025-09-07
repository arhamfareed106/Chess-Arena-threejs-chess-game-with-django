#!/bin/bash

# TI Chess Development Status Check
echo "🔍 Checking TI Chess Development Environment..."
echo ""

# Check Python
echo "🐍 Python Environment:"
if command -v python &> /dev/null; then
    echo "  ✅ Python version: $(python --version)"
else
    echo "  ❌ Python not found"
fi

# Check Node.js
echo ""
echo "⚛️ Node.js Environment:"
if command -v node &> /dev/null; then
    echo "  ✅ Node.js version: $(node --version)"
else
    echo "  ❌ Node.js not found"
fi

if command -v npm &> /dev/null; then
    echo "  ✅ npm version: $(npm --version)"
else
    echo "  ❌ npm not found"
fi

# Check backend dependencies
echo ""
echo "🔧 Backend Status:"
if [ -f "backend/requirements.txt" ]; then
    echo "  ✅ requirements.txt exists"
else
    echo "  ❌ requirements.txt not found"
fi

if [ -d "backend/venv" ]; then
    echo "  ✅ Virtual environment exists"
else
    echo "  ⚠️ Virtual environment not found (run setup-dev script)"
fi

if [ -f "backend/db.sqlite3" ]; then
    echo "  ✅ Database exists"
else
    echo "  ⚠️ Database not found (run migrations)"
fi

# Check frontend dependencies
echo ""
echo "🎨 Frontend Status:"
if [ -f "frontend/package.json" ]; then
    echo "  ✅ package.json exists"
else
    echo "  ❌ package.json not found"
fi

if [ -d "frontend/node_modules" ]; then
    echo "  ✅ Node modules installed"
else
    echo "  ⚠️ Node modules not found (run npm install)"
fi

if [ -d "frontend/dist" ]; then
    echo "  ✅ Build output exists"
else
    echo "  ⚠️ Build output not found (run npm run build)"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Run setup script if needed: ./setup-dev.sh (Linux/macOS) or setup-dev.bat (Windows)"
echo "2. Start backend: cd backend && python manage.py runserver"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Visit: http://localhost:5173"
echo ""
echo "🎮 Happy coding!"