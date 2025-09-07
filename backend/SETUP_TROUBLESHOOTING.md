# Backend Setup Troubleshooting Guide

## Common Issues and Solutions

### 🐍 Python 3.13 Compatibility Issues

**Problem**: You're getting Pillow build errors or dependency conflicts with Python 3.13.

**Solutions**:

#### Option 1: Use Automated Fix Script (Recommended)
```bash
cd backend
python fix_dependencies.py
```

#### Option 2: Use Windows Batch Script
```cmd
cd backend
setup_windows.bat
```

#### Option 3: Manual Installation
```bash
# Install core packages first
pip install "Django>=4.2,<5.0"
pip install "djangorestframework>=3.14,<4.0"
pip install "django-cors-headers>=4.0,<5.0"
pip install "drf-spectacular>=0.26"
pip install "python-decouple>=3.8"
pip install "dj-database-url>=2.0"
pip install "whitenoise>=6.0"

# Install WebSocket packages
pip install "channels>=4.0,<5.0"
pip install "channels-redis>=4.0,<5.0"
pip install "daphne>=4.0,<5.0"
pip install "redis>=5.0,<6.0"

# Install Pillow with binary wheel
pip install --only-binary=Pillow "Pillow>=10.0"
```

### 📦 Alternative Requirements Files

If you continue having issues, try these alternative requirements files:

1. **For Python 3.13**: `pip install -r requirements-py313.txt`
2. **Minimal setup**: `pip install -r requirements-minimal.txt`
3. **Standard**: `pip install -r requirements.txt`

### 🔧 Specific Error Solutions

#### "ModuleNotFoundError: No module named 'drf_spectacular'"
```bash
pip install drf-spectacular>=0.26
```

#### Pillow Build Errors
```bash
# Try pre-compiled wheel
pip install --only-binary=Pillow Pillow

# Or use older version
pip install "Pillow>=9.0,<10.0"

# Windows users with Visual Studio Build Tools
pip install Pillow --force-reinstall --no-cache-dir
```

#### psycopg2 Installation Issues
```bash
# Use binary version
pip install psycopg2-binary

# Or for development only
pip install psycopg2-binary>=2.9
```

### 🐳 Docker Alternative

If you continue having dependency issues, use Docker instead:

```bash
# From project root
docker-compose up

# This will handle all dependencies automatically
```

### 🔄 Fresh Virtual Environment

Create a clean virtual environment:

```bash
# Create new virtual environment
python -m venv venv_clean

# Activate it
# Windows:
venv_clean\Scripts\activate
# macOS/Linux:
source venv_clean/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements-minimal.txt
```

### 🏃 Quick Start Without All Dependencies

If you just want to test the basic functionality:

```bash
# Install only essential packages
pip install Django djangorestframework django-cors-headers
pip install channels daphne redis python-decouple
pip install drf-spectacular

# Run with SQLite (no PostgreSQL needed)
python manage.py migrate
python manage.py runserver
```

### 🆘 Still Having Issues?

1. **Check Python version**: `python --version`
   - Recommended: Python 3.11 or 3.12
   - Python 3.13 may have compatibility issues

2. **Update pip**: `python -m pip install --upgrade pip`

3. **Clear pip cache**: `pip cache purge`

4. **Use Docker**: The most reliable option
   ```bash
   docker-compose up
   ```

5. **Check system requirements**:
   - Windows: Ensure Visual C++ Build Tools are installed
   - macOS: Ensure Xcode Command Line Tools are installed
   - Linux: Ensure build-essential is installed

### 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
DJANGO_SECRET_KEY=your-development-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### ✅ Verification Steps

After installation, verify everything works:

```bash
# Test Django
python -c "import django; print(django.get_version())"

# Test project
python manage.py check

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Visit `http://localhost:8000/api/docs/` to see the API documentation.

---

**Need more help?** Check the main [README.md](../README.md) or create an issue in the repository.