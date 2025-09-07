"""
Test configuration for pytest
"""

import pytest
from django.test import TestCase
from django.conf import settings
import os
import sys


# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Configure Django settings for testing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ti_chess.settings')

import django
django.setup()


@pytest.fixture(scope='session')
def django_db_setup():
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }


@pytest.fixture
def sample_game():
    """Create a sample game for testing"""
    from game.models import Game, Player
    
    game = Game.objects.create(
        name='Test Game',
        is_public=True
    )
    
    player1 = Player.objects.create(
        game=game,
        name='Alice',
        color='#ff0000',
        is_host=True
    )
    
    player2 = Player.objects.create(
        game=game,
        name='Bob',
        color='#0000ff'
    )
    
    return {
        'game': game,
        'player1': player1,
        'player2': player2
    }


@pytest.fixture
def game_engine():
    """Create a game engine instance"""
    from game.engine import GameEngine
    return GameEngine()


class APITestCase(TestCase):
    """Base test case for API tests"""
    
    def setUp(self):
        self.client = self.client_class()
        
    def assert_status_code(self, response, expected_status):
        """Assert response status code with helpful error message"""
        if response.status_code != expected_status:
            print(f"Response content: {response.content}")
        self.assertEqual(response.status_code, expected_status)