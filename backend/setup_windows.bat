@echo off
echo 🚀 TI Chess Backend Setup Script for Windows
echo ================================================

echo.
echo 🐍 Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://python.org
    pause
    exit /b 1
)

echo.
echo 📦 Upgrading pip...
python -m pip install --upgrade pip

echo.
echo 🔧 Installing core Django packages...
python -m pip install "Django>=4.2,<5.0"
python -m pip install "djangorestframework>=3.14,<4.0"
python -m pip install "django-cors-headers>=4.0,<5.0"
python -m pip install "python-decouple>=3.8"
python -m pip install "dj-database-url>=2.0"
python -m pip install "whitenoise>=6.0"
python -m pip install "drf-spectacular>=0.26"

echo.
echo 🔌 Installing WebSocket packages...
python -m pip install "channels>=4.0,<5.0"
python -m pip install "channels-redis>=4.0,<5.0"
python -m pip install "daphne>=4.0,<5.0"
python -m pip install "redis>=5.0,<6.0"

echo.
echo 🖼️ Installing Pillow (this may take a while)...
python -m pip install --only-binary=Pillow "Pillow>=10.0"
if %errorlevel% neq 0 (
    echo ⚠️ Pillow installation failed, trying alternative method...
    python -m pip install "Pillow>=9.0,<10.0"
)

echo.
echo 🗄️ Installing database driver...
python -m pip install "psycopg2-binary>=2.9"

echo.
echo 📊 Installing monitoring tools...
python -m pip install "sentry-sdk>=1.30"

echo.
echo 🧪 Testing installation...
python -c "import django; print(f'✅ Django {django.get_version()} installed successfully')"
if %errorlevel% neq 0 (
    echo ❌ Django installation test failed
    pause
    exit /b 1
)

echo.
echo 🏃 Running Django migrations...
python manage.py migrate
if %errorlevel% neq 0 (
    echo ⚠️ Migrations failed, but dependencies are installed
)

echo.
echo ================================================
echo ✅ Setup completed successfully!
echo.
echo 💡 Next steps:
echo 1. Run: python manage.py runserver
echo 2. Visit: http://localhost:8000
echo.
echo Press any key to continue...
pause