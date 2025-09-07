#!/usr/bin/env python3
"""
Dependency fix script for TI Chess backend
This script helps resolve common dependency issues
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}")
    print(f"Running: {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print("✅ Success!")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {e}")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False

def check_python_version():
    """Check Python version and provide recommendations"""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 13:
        print("⚠️  You're using Python 3.13+. Some packages may have compatibility issues.")
        print("💡 Recommendation: Use Python 3.11 or 3.12 for better compatibility.")
        return "py313"
    elif version.major == 3 and version.minor >= 11:
        print("✅ Good Python version for Django development.")
        return "standard"
    else:
        print("⚠️  Python version might be too old. Consider upgrading to Python 3.11+.")
        return "old"

def main():
    """Main fix script"""
    print("🚀 TI Chess Backend Dependency Fix Script")
    print("=" * 50)
    
    # Check Python version
    py_version = check_python_version()
    
    # Update pip first
    print("\n📦 Updating pip...")
    run_command(f"{sys.executable} -m pip install --upgrade pip", "Updating pip")
    
    # Try different installation strategies based on Python version
    if py_version == "py313":
        print("\n🔧 Using Python 3.13 compatible installation...")
        
        # Install core packages first
        core_packages = [
            "Django>=4.2,<5.0",
            "djangorestframework>=3.14,<4.0",
            "django-cors-headers>=4.0,<5.0",
            "python-decouple>=3.8",
            "dj-database-url>=2.0",
            "whitenoise>=6.0",
            "drf-spectacular>=0.26"
        ]
        
        for package in core_packages:
            run_command(f"{sys.executable} -m pip install '{package}'", f"Installing {package}")
        
        # Try to install Pillow with pre-compiled wheel
        print("\n🖼️  Installing Pillow (may take a while)...")
        run_command(f"{sys.executable} -m pip install --only-binary=Pillow 'Pillow>=10.0'", "Installing Pillow")
        
        # Install channels packages
        channels_packages = [
            "channels>=4.0,<5.0",
            "channels-redis>=4.0,<5.0", 
            "daphne>=4.0,<5.0",
            "redis>=5.0,<6.0"
        ]
        
        for package in channels_packages:
            run_command(f"{sys.executable} -m pip install '{package}'", f"Installing {package}")
            
        # Install optional packages
        optional_packages = [
            "sentry-sdk>=1.30",
            "gunicorn>=21.0"
        ]
        
        for package in optional_packages:
            run_command(f"{sys.executable} -m pip install '{package}'", f"Installing {package} (optional)")
    
    else:
        # Standard installation
        print("\n📦 Installing from requirements.txt...")
        
        # Try minimal requirements first
        if os.path.exists("requirements-minimal.txt"):
            success = run_command(f"{sys.executable} -m pip install -r requirements-minimal.txt", 
                                "Installing minimal requirements")
            if success:
                print("✅ Minimal requirements installed successfully!")
                
                # Try to install remaining packages
                remaining = [
                    "psycopg2-binary>=2.9",
                    "Pillow>=10.0",
                    "celery>=5.3",
                    "django-extensions>=3.2",
                    "factory-boy>=3.3",
                    "pytest>=7.4",
                    "pytest-django>=4.7",
                    "pytest-cov>=4.1",
                    "black>=23.0",
                    "flake8>=6.0",
                    "isort>=5.12",
                    "bandit>=1.7"
                ]
                
                for package in remaining:
                    run_command(f"{sys.executable} -m pip install '{package}'", f"Installing {package}")
        
        else:
            # Fallback to standard requirements
            run_command(f"{sys.executable} -m pip install -r requirements.txt", 
                       "Installing from requirements.txt")
    
    # Test Django installation
    print("\n🧪 Testing Django installation...")
    test_success = run_command(f"{sys.executable} -c 'import django; print(f\"Django {django.get_version()} installed successfully\")'", 
                              "Testing Django import")
    
    if test_success:
        print("\n✅ Django is working!")
        
        # Try to run Django checks
        print("\n🔍 Running Django system checks...")
        run_command(f"{sys.executable} manage.py check --deploy", "Django system check")
    
    print("\n" + "=" * 50)
    print("🎉 Dependency fix script completed!")
    print("\n💡 Next steps:")
    print("1. Run: python manage.py migrate")
    print("2. Run: python manage.py runserver")
    print("3. Visit: http://localhost:8000")
    
    if py_version == "py313":
        print("\n⚠️  Note: If you continue having issues with Python 3.13,")
        print("   consider using Python 3.11 or 3.12 in a virtual environment.")

if __name__ == "__main__":
    main()