"""
WebSocket consumer for real-time TI Chess gameplay
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import sync_to_async
from typing import Dict, Any, Optional

from .models import Game, Player, Piece, Move, GameEvent
from .engine import GameEngine, GamePiece, Position, PieceType
from .serializers import GameSerializer, MoveSerializer


logger = logging.getLogger(__name__)


class GameConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for game communication"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_id = None
        self.game_group_name = None
        self.player = None
        self.game = None
        
    async def connect(self):
        """Handle WebSocket connection"""
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'
        
        # Join game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connected to game {self.game_id}")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Mark player as disconnected
        if self.player:
            await self.update_player_connection(self.player.id, False)
        
        # Leave game group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )
        
        logger.info(f"WebSocket disconnected from game {self.game_id}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(text_data)
            action = data.get('action')
            message_data = data.get('data', {})
            
            logger.info(f"Received action: {action} for game {self.game_id}")
            
            # Route to appropriate handler
            if action == 'join_game':
                await self.handle_join_game(message_data)
            elif action == 'select_color':
                await self.handle_select_color(message_data)
            elif action == 'ready':
                await self.handle_player_ready(message_data)
            elif action == 'make_move':
                await self.handle_make_move(message_data)
            elif action == 'investor_transform':
                await self.handle_investor_transform(message_data)
            elif action == 'place_piece':
                await self.handle_place_piece(message_data)
            elif action == 'reconnect':
                await self.handle_reconnect(message_data)
            else:
                await self.send_error(f"Unknown action: {action}")
                
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await self.send_error("Internal server error")
    
    async def handle_join_game(self, data: Dict[str, Any]):
        """Handle player joining game"""
        try:
            player_name = data.get('player_name')
            player_token = data.get('player_token')
            
            if not player_name:
                await self.send_error("Player name required")
                return
            
            # Authenticate player if token provided
            if player_token:
                self.player = await self.get_player_by_token(player_token)
                if not self.player:
                    await self.send_error("Invalid player token")
                    return
            else:
                # Create new player
                self.player = await self.create_player(player_name)
                if not self.player:
                    await self.send_error("Could not join game")
                    return
            
            # Update connection status
            await self.update_player_connection(self.player.id, True)
            
            # Send player info
            await self.send_json({
                'event': 'player_joined',
                'data': {
                    'player_id': str(self.player.id),
                    'player_token': str(self.player.player_token),
                    'player_name': self.player.name,
                    'color': self.player.color,
                    'is_host': self.player.is_host
                }
            })
            
            # Broadcast to other players
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'player_joined_broadcast',
                    'player_id': str(self.player.id),
                    'player_name': self.player.name,
                    'color': self.player.color
                }
            )
            
            # Send current game state
            await self.send_game_state()
            
        except Exception as e:
            logger.error(f"Error joining game: {e}")
            await self.send_error("Failed to join game")
    
    async def handle_select_color(self, data: Dict[str, Any]):
        """Handle player color selection"""
        if not self.player:
            await self.send_error("Not authenticated")
            return
        
        try:
            color = data.get('color', '#ffffff')
            await self.update_player_color(self.player.id, color)
            
            # Broadcast color change
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'color_changed',
                    'player_id': str(self.player.id),
                    'color': color
                }
            )
            
        except Exception as e:
            logger.error(f"Error selecting color: {e}")
            await self.send_error("Failed to select color")
    
    async def handle_player_ready(self, data: Dict[str, Any]):
        """Handle player ready status"""
        if not self.player:
            await self.send_error("Not authenticated")
            return
        
        try:
            is_ready = data.get('ready', False)
            await self.update_player_ready(self.player.id, is_ready)
            
            # Check if game can start
            can_start = await self.check_can_start_game()
            if can_start:
                await self.start_game()
            
            # Broadcast ready status
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'player_ready_changed',
                    'player_id': str(self.player.id),
                    'ready': is_ready
                }
            )
            
        except Exception as e:
            logger.error(f"Error updating ready status: {e}")
            await self.send_error("Failed to update ready status")
    
    async def handle_make_move(self, data: Dict[str, Any]):
        """Handle move submission"""
        if not self.player:
            await self.send_error("Not authenticated")
            return
        
        try:
            from_pos = data.get('from')  # [x, y]
            to_pos = data.get('to')      # [x, y]
            piece_id = data.get('piece_id')
            
            if not all([from_pos, to_pos, piece_id]):
                await self.send_error("Missing move data")
                return
            
            # Validate and process move
            move_result = await self.process_move(
                piece_id, 
                Position(from_pos[0], from_pos[1]),
                Position(to_pos[0], to_pos[1])
            )
            
            if move_result['success']:
                # Broadcast move to all players
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'move_made',
                        'move_data': move_result
                    }
                )
                
                # Check for game end
                winner = move_result.get('winner')
                if winner:
                    await self.end_game(winner)
            else:
                await self.send_error(move_result.get('error', 'Invalid move'))
                
        except Exception as e:
            logger.error(f"Error processing move: {e}")
            await self.send_error("Failed to process move")
    
    async def handle_investor_transform(self, data: Dict[str, Any]):
        """Handle Investor transform action"""
        if not self.player:
            await self.send_error("Not authenticated")
            return
        
        try:
            investor_id = data.get('investor_id')
            target_piece_id = data.get('target_piece_id')
            
            if not all([investor_id, target_piece_id]):
                await self.send_error("Missing transform data")
                return
            
            result = await self.process_investor_transform(investor_id, target_piece_id)
            
            if result['success']:
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'investor_transform_made',
                        'transform_data': result
                    }
                )
            else:
                await self.send_error(result.get('error', 'Invalid transform'))
                
        except Exception as e:
            logger.error(f"Error processing investor transform: {e}")
            await self.send_error("Failed to process transform")
    
    async def handle_place_piece(self, data: Dict[str, Any]):
        """Handle Strategist piece placement"""
        if not self.player:
            await self.send_error("Not authenticated")
            return
        
        try:
            piece_id = data.get('piece_id')
            position = data.get('position')  # [x, y]
            
            if not all([piece_id, position]):
                await self.send_error("Missing placement data")
                return
            
            result = await self.process_piece_placement(
                piece_id, 
                Position(position[0], position[1])
            )
            
            if result['success']:
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'piece_placed',
                        'placement_data': result
                    }
                )
            else:
                await self.send_error(result.get('error', 'Invalid placement'))
                
        except Exception as e:
            logger.error(f"Error processing piece placement: {e}")
            await self.send_error("Failed to process placement")
    
    async def handle_reconnect(self, data: Dict[str, Any]):
        """Handle player reconnection"""
        try:
            player_token = data.get('player_token')
            
            if not player_token:
                await self.send_error("Player token required")
                return
            
            self.player = await self.get_player_by_token(player_token)
            if not self.player:
                await self.send_error("Invalid player token")
                return
            
            # Update connection status
            await self.update_player_connection(self.player.id, True)
            
            # Send current game state
            await self.send_game_state()
            
            # Notify other players
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'player_reconnected',
                    'player_id': str(self.player.id),
                    'player_name': self.player.name
                }
            )
            
        except Exception as e:
            logger.error(f"Error reconnecting: {e}")
            await self.send_error("Failed to reconnect")
    
    # Database operations
    
    @database_sync_to_async
    def get_player_by_token(self, token: str) -> Optional[Player]:
        """Get player by token"""
        try:
            return Player.objects.get(player_token=token, game_id=self.game_id)
        except ObjectDoesNotExist:
            return None
    
    @database_sync_to_async
    def create_player(self, name: str) -> Optional[Player]:
        """Create new player in game"""
        try:
            game = Game.objects.get(id=self.game_id)
            
            # Check if game is full
            if game.players.count() >= 2:
                return None
            
            # Check if name is taken
            if game.players.filter(name=name).exists():
                return None
            
            # Determine if this is the host
            is_host = game.players.count() == 0
            
            player = Player.objects.create(
                game=game,
                name=name,
                is_host=is_host
            )
            return player
            
        except ObjectDoesNotExist:
            return None
    
    @database_sync_to_async
    def update_player_connection(self, player_id: str, is_connected: bool):
        """Update player connection status"""
        Player.objects.filter(id=player_id).update(is_connected=is_connected)
    
    @database_sync_to_async
    def update_player_color(self, player_id: str, color: str):
        """Update player color"""
        Player.objects.filter(id=player_id).update(color=color)
        self.player.color = color
    
    @database_sync_to_async
    def update_player_ready(self, player_id: str, is_ready: bool):
        """Update player ready status"""
        Player.objects.filter(id=player_id).update(is_ready=is_ready)
        self.player.is_ready = is_ready
    
    @database_sync_to_async
    def check_can_start_game(self) -> bool:
        """Check if game can start"""
        try:
            game = Game.objects.get(id=self.game_id)
            return (game.players.count() == 2 and 
                   game.players.filter(is_ready=True).count() == 2 and
                   game.status == Game.Status.WAITING)
        except ObjectDoesNotExist:
            return False
    
    @database_sync_to_async
    def start_game(self):
        """Start the game"""
        from django.utils import timezone
        
        game = Game.objects.get(id=self.game_id)
        game.status = Game.Status.ACTIVE
        game.started_at = timezone.now()
        
        # Set first player as current turn
        first_player = game.players.first()
        game.current_turn_player = first_player
        game.save()
        
        # Initialize pieces for both players
        self._initialize_game_pieces(game)
    
    def _initialize_game_pieces(self, game: Game):
        """Initialize starting pieces for the game"""
        players = list(game.players.all())
        
        # Player 1 pieces (bottom rows)
        for x in range(8):
            Piece.objects.create(
                game=game,
                owner=players[0],
                piece_type=Piece.PieceType.TALENT,
                level=1,
                position_x=x,
                position_y=1  # Second row
            )
        
        # Player 2 pieces (top rows)  
        for x in range(8):
            Piece.objects.create(
                game=game,
                owner=players[1],
                piece_type=Piece.PieceType.TALENT,
                level=1,
                position_x=x,
                position_y=6  # Seventh row
            )
    
    async def process_move(self, piece_id: str, from_pos: Position, to_pos: Position) -> Dict[str, Any]:
        """Process and validate a move"""
        try:
            # Load current game state
            game_pieces = await self.get_game_pieces()
            players = await self.get_game_players()
            
            # Initialize engine with current state
            engine = GameEngine()
            engine_pieces = []
            
            for piece in game_pieces:
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
            
            engine.load_board_state(engine_pieces, {str(p.id): p for p in players})
            
            # Validate and apply move
            result = engine.apply_move(piece_id, from_pos, to_pos, str(self.player.id))
            
            if result.success:
                # Save move to database
                move_number = await self.get_next_move_number()
                move = await self.save_move(piece_id, from_pos, to_pos, move_number, result)
                
                # Update pieces in database
                await self.update_pieces_from_engine(engine_pieces)
                
                # Check for winner
                winner = engine.check_win_condition()
                
                return {
                    'success': True,
                    'move_id': str(move.id),
                    'player_id': str(self.player.id),
                    'from': [from_pos.x, from_pos.y],
                    'to': [to_pos.x, to_pos.y],
                    'events': result.events,
                    'board_changes': result.board_changes,
                    'winner': winner,
                    'turn': await self.advance_turn()
                }
            else:
                return {
                    'success': False,
                    'error': result.error_message
                }
                
        except Exception as e:
            logger.error(f"Error in process_move: {e}")
            return {
                'success': False,
                'error': 'Internal server error'
            }
    
    @database_sync_to_async
    def get_game_pieces(self):
        """Get all active pieces for the game"""
        return list(Piece.objects.filter(game_id=self.game_id, is_active=True))
    
    @database_sync_to_async
    def get_game_players(self):
        """Get all players for the game"""
        return list(Player.objects.filter(game_id=self.game_id))
    
    @database_sync_to_async
    def get_next_move_number(self) -> int:
        """Get next move number"""
        game = Game.objects.get(id=self.game_id)
        last_move = game.moves.last()
        return (last_move.move_number + 1) if last_move else 1
    
    @database_sync_to_async
    def save_move(self, piece_id: str, from_pos: Position, to_pos: Position, 
                  move_number: int, result) -> Move:
        """Save move to database"""
        piece = Piece.objects.get(id=piece_id)
        
        move = Move.objects.create(
            game_id=self.game_id,
            player=self.player,
            piece=piece,
            move_type=Move.MoveType.MOVE,
            from_x=from_pos.x,
            from_y=from_pos.y,
            to_x=to_pos.x,
            to_y=to_pos.y,
            move_number=move_number,
            move_data={'events': result.events, 'changes': result.board_changes},
            is_valid=True
        )
        
        # Save events
        for event in result.events:
            GameEvent.objects.create(
                game_id=self.game_id,
                move=move,
                event_type=event['type'],
                event_data=event.get('data', {})
            )
        
        return move
    
    @database_sync_to_async
    def advance_turn(self) -> str:
        """Advance to next player's turn"""
        game = Game.objects.get(id=self.game_id)
        players = list(game.players.all())
        
        # Find current player index and advance
        current_index = 0
        for i, player in enumerate(players):
            if player.id == game.current_turn_player_id:
                current_index = i
                break
        
        next_index = (current_index + 1) % len(players)
        game.current_turn_player = players[next_index]
        game.turn_count += 1
        game.save()
        
        return str(players[next_index].id)
    
    # WebSocket message handlers for broadcasting
    
    async def player_joined_broadcast(self, event):
        """Broadcast player joined event"""
        await self.send_json({
            'event': 'player_joined',
            'data': {
                'player_id': event['player_id'],
                'player_name': event['player_name'],
                'color': event['color']
            }
        })
    
    async def move_made(self, event):
        """Broadcast move made event"""
        await self.send_json({
            'event': 'move_made',
            'data': event['move_data']
        })
    
    async def color_changed(self, event):
        """Broadcast color change event"""
        await self.send_json({
            'event': 'color_changed',
            'data': {
                'player_id': event['player_id'],
                'color': event['color']
            }
        })
    
    async def player_ready_changed(self, event):
        """Broadcast ready status change"""
        await self.send_json({
            'event': 'player_ready_changed',
            'data': {
                'player_id': event['player_id'],
                'ready': event['ready']
            }
        })
    
    async def game_started(self, event):
        """Broadcast game started"""
        await self.send_json({
            'event': 'game_started',
            'data': event.get('data', {})
        })
    
    async def send_json(self, data: Dict[str, Any]):
        """Send JSON message"""
        await self.send(text_data=json.dumps(data))
    
    async def send_error(self, message: str):
        """Send error message"""
        await self.send_json({
            'event': 'error',
            'data': {'message': message}
        })
    
    async def send_game_state(self):
        """Send current game state"""
        try:
            game_data = await self.get_game_data()
            await self.send_json({
                'event': 'game_state',
                'data': game_data
            })
        except Exception as e:
            logger.error(f"Error sending game state: {e}")
            await self.send_error("Failed to load game state")
    
    @database_sync_to_async
    def get_game_data(self) -> Dict[str, Any]:
        """Get complete game data"""
        from .serializers import GameSerializer
        
        game = Game.objects.get(id=self.game_id)
        serializer = GameSerializer(game)
        return serializer.data