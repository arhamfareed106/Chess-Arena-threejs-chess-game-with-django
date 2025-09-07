# type: ignore
"""
URL Configuration for ti_chess project.
"""

from django.contrib import admin  # type: ignore
from django.urls import path, include, re_path  # type: ignore
from django.conf import settings  # type: ignore
from django.conf.urls.static import static  # type: ignore
from django.http import HttpResponse, HttpResponseRedirect  # type: ignore
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView  # type: ignore
from game.views import api_root, frontend_view


def health_check(request):
    """Simple health check endpoint"""
    return HttpResponse('OK', content_type='text/plain')


def redirect_assets(request, path):
    """Redirect /assets/ requests to proper static file path"""
    return HttpResponseRedirect(f'/static/frontend/assets/{path}')


urlpatterns = [
    # Admin and main API routes
    path('admin/', admin.site.urls),
    path('api/', include('game.urls')),
    path('api/users/', include('users.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Health check
    path('healthz/', health_check, name='health-check'),
    
    # API Root endpoint
    path('root/', api_root, name='api-root'),
    
    # Redirect asset requests to proper static path
    re_path(r'^assets/(?P<path>.*)$', redirect_assets, name='assets-redirect'),
    
    # Frontend (catch-all for React Router) - this should be last
    path('', frontend_view, name='frontend-root'),
    path('<path:path>/', frontend_view, name='frontend-catchall'),
]

# Add static files serving for both debug and production
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)