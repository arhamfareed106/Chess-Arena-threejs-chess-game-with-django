# type: ignore
"""
Django REST Framework views for TI Chess API
"""

import logging
from django.utils import timezone  # type: ignore
from django.shortcuts import get_object_or_404, render  # type: ignore
from rest_framework import status, viewsets, permissions  # type: ignore
from rest_framework.decorators import action, api_view  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.views import APIView  # type: ignore
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse  # type: ignore

from .models import Game, Player, Move, Piece, GameEvent
from .serializers import (
    GameSerializer, GameCreateSerializer, JoinGameSerializer,
    PlayerSerializer, MoveSerializer, MoveCreateSerializer,
    GameReplaySerializer, BoardStateSerializer, PieceSerializer,
    InvestorTransformSerializer, PiecePlacementSerializer
)
from .engine import GameEngine, GamePiece, Position, PieceType


logger = logging.getLogger(__name__)


@extend_schema(
    summary="API Root",
    description="TI Chess API Root - Welcome to the TI Chess API",
    responses={200: OpenApiResponse(description="API information")}
)
@api_view(['GET'])
def api_root(request):
    """API root endpoint with service information"""
    return Response({
        'message': 'Welcome to TI Chess API',
        'version': '1.0.0',
        'status': 'operational',
        'endpoints': {
            'games': request.build_absolute_uri('/api/games/'),
            'players': request.build_absolute_uri('/api/players/'),
            'moves': request.build_absolute_uri('/api/moves/'),
            'active_games': request.build_absolute_uri('/api/games/active/'),
            'health': request.build_absolute_uri('/api/health/'),
            'docs': request.build_absolute_uri('/api/docs/'),
            'admin': request.build_absolute_uri('/admin/'),
        },
        'websocket': {
            'url': f"ws://{request.get_host()}/ws/",
            'description': 'Real-time game communication'
        },
        'frontend': f"http://{request.get_host()}/"
    })


def frontend_view(request, path=''):
    """Serve the React frontend for all paths"""
    return render(request, 'index.html')


class GameViewSet(viewsets.ModelViewSet):
    """ViewSet for game management"""
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]  # Adjust for production
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GameCreateSerializer
        return GameSerializer
    
    @extend_schema(
        summary="List active games",
        description="Get list of games waiting for players or currently active",
        responses={200: GameSerializer(many=True)}
    )
    def list(self, request):
        """List active/joinable games"""
        queryset = Game.objects.filter(
            status__in=[Game.Status.WAITING, Game.Status.ACTIVE]
        ).order_by('-created_at')
        
        # Filter public games or games user is part of
        if not request.user.is_authenticated:
            queryset = queryset.filter(is_public=True)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Create new game",
        description="Create a new TI Chess game",
        request=GameCreateSerializer,
        responses={201: GameSerializer}
    )
    def create(self, request):
        """Create a new game"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game = serializer.save()
        
        response_serializer = GameSerializer(game)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(
        summary="Join game",
        description="Join an existing game as a player",
        request=JoinGameSerializer,
        responses={
            200: OpenApiResponse(description="Successfully joined"),
            400: OpenApiResponse(description="Cannot join game"),
            404: OpenApiResponse(description="Game not found")
        }
    )
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a game"""
        game = get_object_or_404(Game, pk=pk)
        
        # Check if game can be joined
        if game.status != Game.Status.WAITING:
            return Response(
                {'error': 'Game is not accepting new players'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if game.players.count() >= 2:
            return Response(
                {'error': 'Game is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = JoinGameSerializer(
            data=request.data,
            context={'game_id': str(game.id)}
        )
        serializer.is_valid(raise_exception=True)
        
        # Check password for private games
        if not game.is_public:
            provided_password = serializer.validated_data.get('password', '')
            if provided_password != game.password:
                return Response(
                    {'error': 'Invalid password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create player
        player = Player.objects.create(
            game=game,
            name=serializer.validated_data['player_name'],
            color=serializer.validated_data['color'],
            user=request.user if request.user.is_authenticated else None
        )
        
        return Response({
            'player_token': str(player.player_token),
            'player_id': str(player.id),
            'message': 'Successfully joined game'
        })
    
    @extend_schema(
        summary="Get game board state",
        description="Get current board state of the game",
        responses={200: BoardStateSerializer}
    )
    @action(detail=True, methods=['get'])
    def board(self, request, pk=None):
        """Get current board state"""
        game = get_object_or_404(Game, pk=pk)
        
        # Build board state
        board = [[None for _ in range(8)] for _ in range(8)]
        pieces = game.pieces.filter(is_active=True)
        
        for piece in pieces:
            board[piece.position_y][piece.position_x] = {
                'id': str(piece.id),
                'owner_id': str(piece.owner.id),
                'owner_name': piece.owner.name,
                'owner_color': piece.owner.color,
                'type': piece.piece_type,
                'level': piece.level,
                'transform_count': piece.transform_count,
                'temporary_buffs': piece.temporary_buffs
            }
        
        data = {
            'board': board,
            'players': game.players.all(),
            'current_turn_player': game.current_turn_player,
            'game_status': game.status,
            'turn_count': game.turn_count
        }
        
        serializer = BoardStateSerializer(data)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Make a move",
        description="Submit a move in the game (REST fallback)",
        request=MoveCreateSerializer,
        responses={
            200: OpenApiResponse(description="Move successful"),
            400: OpenApiResponse(description="Invalid move")
        }
    )
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Submit a move (REST fallback)"""
        game = get_object_or_404(Game, pk=pk)
        
        if game.status != Game.Status.ACTIVE:
            return Response(
                {'error': 'Game is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = MoveCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Find player by token (should be in headers or body)
        player_token = request.headers.get('Player-Token') or request.data.get('player_token')
        if not player_token:
            return Response(
                {'error': 'Player token required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            player = game.players.get(player_token=player_token)
        except Player.DoesNotExist:
            return Response(
                {'error': 'Invalid player token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process move using game engine
        try:
            result = self._process_move_with_engine(game, player, serializer.validated_data)
            
            if result['success']:
                return Response(result)
            else:
                return Response(
                    {'error': result.get('error', 'Invalid move')},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Error processing move: {e}")
            return Response(
                {'error': 'Failed to process move'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @extend_schema(
        summary="Get game replay",
        description="Get complete move history for game replay",
        responses={200: GameReplaySerializer}
    )
    @action(detail=True, methods=['get'])
    def replay(self, request, pk=None):
        """Get game replay data"""
        game = get_object_or_404(Game, pk=pk)
        
        replay_data = {
            'game_id': game.id,
            'moves': game.moves.all().order_by('move_number'),
            'players': game.players.all(),
            'created_at': game.created_at,
            'finished_at': game.finished_at,
            'winner': game.winner
        }
        
        serializer = GameReplaySerializer(replay_data)
        return Response(serializer.data)
    
    def _process_move_with_engine(self, game: Game, player: Player, move_data: dict):
        """Process move using game engine"""
        # Load current game state
        pieces = list(game.pieces.filter(is_active=True))
        players_dict = {str(p.id): p for p in game.players.all()}
        
        # Initialize engine
        engine = GameEngine()
        engine_pieces = []
        
        for piece in pieces:
            engine_pieces.append(GamePiece(
                id=str(piece.id),
                owner_id=str(piece.owner.id),
                piece_type=PieceType(piece.piece_type),
                level=piece.level,
                position=Position(piece.position_x, piece.position_y),
                transform_count=piece.transform_count,
                temporary_buffs=piece.temporary_buffs,
                is_active=piece.is_active
            ))
        
        engine.load_board_state(engine_pieces, players_dict)
        
        # Validate and apply move
        from_pos = Position(move_data['from_x'], move_data['from_y'])
        to_pos = Position(move_data['to_x'], move_data['to_y'])
        
        result = engine.apply_move(
            str(move_data['piece_id']), 
            from_pos, 
            to_pos, 
            str(player.id)
        )
        
        if result.success:
            # Save move to database
            move_number = (game.moves.last().move_number + 1) if game.moves.exists() else 1
            piece = get_object_or_404(Piece, id=move_data['piece_id'])
            
            move = Move.objects.create(
                game=game,
                player=player,
                piece=piece,
                move_type=move_data.get('move_type', Move.MoveType.MOVE),
                from_x=from_pos.x,
                from_y=from_pos.y,
                to_x=to_pos.x,
                to_y=to_pos.y,
                move_number=move_number,
                move_data={'events': result.events, 'changes': result.board_changes},
                is_valid=True
            )
            
            # Update pieces in database
            self._update_pieces_from_engine(pieces, engine_pieces)
            
            # Save events
            for event in result.events:
                GameEvent.objects.create(
                    game=game,
                    move=move,
                    event_type=event['type'],
                    event_data=event.get('data', {})
                )
            
            # Check for winner
            winner = engine.check_win_condition()
            if winner:
                game.winner_id = winner
                game.status = Game.Status.FINISHED
                game.finished_at = timezone.now()
                game.save()
            
            # Advance turn
            self._advance_turn(game)
            
            return {
                'success': True,
                'move_id': str(move.id),
                'player_id': str(player.id),
                'from': [from_pos.x, from_pos.y],
                'to': [to_pos.x, to_pos.y],
                'events': result.events,
                'board_changes': result.board_changes,
                'winner': winner,
                'turn': str(game.current_turn_player.id) if game.current_turn_player else None
            }
        else:
            return {
                'success': False,
                'error': result.error_message
            }
    
    def _update_pieces_from_engine(self, db_pieces, engine_pieces):
        """Update database pieces from engine state"""
        engine_dict = {p.id: p for p in engine_pieces}
        
        for db_piece in db_pieces:
            engine_piece = engine_dict.get(str(db_piece.id))
            if engine_piece:
                db_piece.piece_type = engine_piece.piece_type.value
                db_piece.level = engine_piece.level
                db_piece.position_x = engine_piece.position.x
                db_piece.position_y = engine_piece.position.y
                db_piece.transform_count = engine_piece.transform_count
                db_piece.temporary_buffs = engine_piece.temporary_buffs
                db_piece.is_active = engine_piece.is_active
                db_piece.save()
    
    def _advance_turn(self, game: Game):
        """Advance to next player's turn"""
        players = list(game.players.all())
        current_index = 0
        
        for i, player in enumerate(players):
            if player.id == game.current_turn_player_id:
                current_index = i
                break
        
        next_index = (current_index + 1) % len(players)
        game.current_turn_player = players[next_index]
        game.turn_count += 1
        game.save()


class ActiveGamesView(APIView):
    """View for listing active/joinable games"""
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="List active games",
        description="Get all games that are waiting for players or currently active",
        responses={200: GameSerializer(many=True)}
    )
    def get(self, request):
        """Get active/joinable games"""
        games = Game.objects.filter(
            status__in=[Game.Status.WAITING, Game.Status.ACTIVE],
            is_public=True
        ).order_by('-created_at')
        
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)


class PlayerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for player information"""
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Filter by game if specified"""
        queryset = Player.objects.all()
        game_id = self.request.query_params.get('game_id')
        
        if game_id:
            queryset = queryset.filter(game_id=game_id)
        
        return queryset


class MoveViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for move history"""
    queryset = Move.objects.all()
    serializer_class = MoveSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Filter by game if specified"""
        queryset = Move.objects.all()
        game_id = self.request.query_params.get('game_id')
        
        if game_id:
            queryset = queryset.filter(game_id=game_id)
        
        return queryset.order_by('move_number')


class HealthCheckView(APIView):
    """Health check endpoint"""
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Health check",
        description="Check if the API is healthy",
        responses={200: OpenApiResponse(description="API is healthy")}
    )
    def get(self, request):
        """Health check"""
        return Response({'status': 'healthy', 'timestamp': timezone.now()})