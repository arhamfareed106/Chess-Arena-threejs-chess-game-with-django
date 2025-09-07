"""
Tests for game models
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from game.models import Game, Player, Piece, Move

User = get_user_model()


class GameModelTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='player1', email='player1@example.com')
        self.user2 = User.objects.create_user(username='player2', email='player2@example.com')
        
    def test_create_game(self):
        """Test creating a game"""
        game = Game.objects.create(
            name='Test Game',
            is_public=True
        )
        
        self.assertEqual(game.name, 'Test Game')
        self.assertTrue(game.is_public)
        self.assertEqual(game.status, Game.Status.WAITING)
        
    def test_create_player(self):
        """Test creating a player"""
        game = Game.objects.create(name='Test Game')
        
        player = Player.objects.create(
            game=game,
            user=self.user1,
            name='Alice',
            color='#ff0000',
            is_host=True
        )
        
        self.assertEqual(player.name, 'Alice')
        self.assertEqual(player.color, '#ff0000')
        self.assertTrue(player.is_host)
        self.assertEqual(player.game, game)
        
    def test_game_can_start(self):
        """Test game can start when conditions are met"""
        game = Game.objects.create(name='Test Game')
        
        # Create two ready players
        Player.objects.create(
            game=game,
            user=self.user1,
            name='Alice',
            is_ready=True
        )
        Player.objects.create(
            game=game,
            user=self.user2,
            name='Bob',
            is_ready=True
        )
        
        self.assertTrue(game.can_start)
        
    def test_piece_creation(self):
        """Test creating pieces"""
        game = Game.objects.create(name='Test Game')
        player = Player.objects.create(game=game, name='Alice')
        
        piece = Piece.objects.create(
            game=game,
            owner=player,
            piece_type=Piece.PieceType.TALENT,
            level=1,
            position_x=0,
            position_y=0
        )
        
        self.assertEqual(piece.piece_type, Piece.PieceType.TALENT)
        self.assertEqual(piece.level, 1)
        self.assertEqual(piece.position, (0, 0))
        
    def test_piece_can_transform(self):
        """Test piece transformation logic"""
        game = Game.objects.create(name='Test Game')
        player = Player.objects.create(game=game, name='Alice')
        
        piece = Piece.objects.create(
            game=game,
            owner=player,
            piece_type=Piece.PieceType.TALENT,
            level=1,
            position_x=0,
            position_y=0,
            transform_count=2
        )
        
        self.assertTrue(piece.can_transform())
        
        # Level 4 pieces cannot transform
        piece.level = 4
        piece.save()
        self.assertFalse(piece.can_transform())


class GameEngineTests(TestCase):
    def setUp(self):
        from game.engine import GameEngine, GamePiece, Position, PieceType
        
        self.engine = GameEngine()
        self.GamePiece = GamePiece
        self.Position = Position
        self.PieceType = PieceType
        
    def test_piece_movement_validation(self):
        """Test basic piece movement validation"""
        # Create a talent piece
        talent = self.GamePiece(
            id='piece1',
            owner_id='player1',
            piece_type=self.PieceType.TALENT,
            level=1,
            position=self.Position(4, 4)
        )
        
        self.engine.load_board_state([talent], {'player1': None})
        
        # Talent should be able to move up to 3 squares straight
        valid_moves = self.engine.get_valid_moves(talent)
        
        # Should include positions like (4,1), (4,7), (1,4), (7,4)
        self.assertIn(self.Position(4, 1), valid_moves)
        self.assertIn(self.Position(4, 7), valid_moves)
        self.assertIn(self.Position(1, 4), valid_moves)
        self.assertIn(self.Position(7, 4), valid_moves)
        
    def test_move_validation(self):
        """Test move validation"""
        talent = self.GamePiece(
            id='piece1',
            owner_id='player1',
            piece_type=self.PieceType.TALENT,
            level=1,
            position=self.Position(4, 4)
        )
        
        self.engine.load_board_state([talent], {'player1': None})
        
        # Valid move
        result = self.engine.validate_move('piece1', self.Position(4, 4), self.Position(4, 6), 'player1')
        self.assertTrue(result.success)
        
        # Invalid move (too far)
        result = self.engine.validate_move('piece1', self.Position(4, 4), self.Position(4, 0), 'player1')
        self.assertFalse(result.success)
        
    def test_win_condition(self):
        """Test win condition checking"""
        # Create pieces with no investors for player2
        pieces = [
            self.GamePiece('p1', 'player1', self.PieceType.INVESTOR, 4, self.Position(0, 0)),
            self.GamePiece('p2', 'player2', self.PieceType.TALENT, 1, self.Position(1, 1)),
        ]
        
        self.engine.load_board_state(pieces, {'player1': None, 'player2': None})
        
        winner = self.engine.check_win_condition()
        self.assertEqual(winner, 'player1')  # player1 should win