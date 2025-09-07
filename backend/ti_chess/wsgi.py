"""
WSGI config for ti_chess project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ti_chess.settings')

application = get_wsgi_application()