# type: ignore
"""
URL Configuration for game app
"""

from django.urls import path, include  # type: ignore
from rest_framework.routers import DefaultRouter  # type: ignore
from .views import GameViewSet, PlayerViewSet, MoveViewSet, ActiveGamesView, HealthCheckView

router = DefaultRouter()
router.register(r'games', GameViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'moves', MoveViewSet)

urlpatterns = [
    # Custom game endpoints (must come before router)
    path('games/active/', ActiveGamesView.as_view(), name='active-games'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
    
    # Router URLs (includes games/, players/, moves/)
    path('', include(router.urls)),
]