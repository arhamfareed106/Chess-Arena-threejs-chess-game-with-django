"""
Management command to create a demo game with sample moves
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from game.models import Game, Player, Piece, Move


class Command(BaseCommand):
    help = 'Create a demo game with sample moves for testing'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--name',
            type=str,
            default='Demo Game',
            help='Name of the demo game'
        )
        
    def handle(self, *args, **options):
        game_name = options['name']
        
        self.stdout.write(f'Creating demo game: {game_name}')
        
        # Create game
        game = Game.objects.create(
            name=game_name,
            is_public=True,
            status=Game.Status.ACTIVE,
            started_at=timezone.now()
        )
        
        # Create players
        player1 = Player.objects.create(
            game=game,
            name='Alice',
            color='#ff6b6b',
            is_host=True,
            is_ready=True
        )
        
        player2 = Player.objects.create(
            game=game,
            name='Bob',
            color='#4ecdc4',
            is_ready=True
        )
        
        # Set first player as current turn
        game.current_turn_player = player1
        game.save()
        
        # Create initial pieces for both players
        self._create_initial_pieces(game, player1, player2)
        
        # Make some sample moves
        self._create_sample_moves(game, player1, player2)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created demo game {game.id} with {game.moves.count()} moves'
            )
        )
        
    def _create_initial_pieces(self, game, player1, player2):
        """Create initial piece setup"""
        
        # Player 1 pieces (bottom rows)
        for x in range(8):
            Piece.objects.create(
                game=game,
                owner=player1,
                piece_type=Piece.PieceType.TALENT,
                level=1,
                position_x=x,
                position_y=1
            )
        
        # Player 2 pieces (top rows)
        for x in range(8):
            Piece.objects.create(
                game=game,
                owner=player2,
                piece_type=Piece.PieceType.TALENT,
                level=1,
                position_x=x,
                position_y=6
            )
    
    def _create_sample_moves(self, game, player1, player2):
        """Create some sample moves"""
        pieces1 = list(player1.pieces.all())
        pieces2 = list(player2.pieces.all())
        
        moves = [
            # Player 1 moves first piece forward
            {
                'player': player1,
                'piece': pieces1[0],
                'from': (0, 1),
                'to': (0, 3),
                'move_type': Move.MoveType.MOVE
            },
            # Player 2 responds
            {
                'player': player2,
                'piece': pieces2[0],
                'from': (0, 6),
                'to': (0, 4),
                'move_type': Move.MoveType.MOVE
            },
            # Player 1 moves another piece
            {
                'player': player1,
                'piece': pieces1[1],
                'from': (1, 1),
                'to': (1, 4),
                'move_type': Move.MoveType.MOVE
            },
            # Player 2 moves diagonally (after transforming to Leader)
            {
                'player': player2,
                'piece': pieces2[1],
                'from': (1, 6),
                'to': (1, 5),
                'move_type': Move.MoveType.MOVE
            }
        ]
        
        for i, move_data in enumerate(moves, 1):
            # Update piece position
            piece = move_data['piece']
            from_pos = move_data['from']
            to_pos = move_data['to']
            
            # Create move record
            Move.objects.create(
                game=game,
                player=move_data['player'],
                piece=piece,
                move_type=move_data['move_type'],
                from_x=from_pos[0],
                from_y=from_pos[1],
                to_x=to_pos[0],
                to_y=to_pos[1],
                move_number=i,
                is_valid=True,
                move_data={
                    'demo': True,
                    'description': f'Demo move {i}'
                }
            )
            
            # Update piece position in database
            piece.position_x = to_pos[0]
            piece.position_y = to_pos[1]
            piece.save()
            
            # Alternate turns
            current_player = player1 if i % 2 == 1 else player2
            next_player = player2 if i % 2 == 1 else player1
            game.current_turn_player = next_player
            game.turn_count = i
            game.save()
            
        self.stdout.write(f'Created {len(moves)} sample moves')