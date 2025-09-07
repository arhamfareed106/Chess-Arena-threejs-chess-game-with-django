"""
TI Chess Game Engine - Core game logic and move validation
"""

import logging
from typing import List, Tuple, Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum


logger = logging.getLogger(__name__)


class PieceType(Enum):
    TALENT = 'talent'
    LEADER = 'leader'
    STRATEGIST = 'strategist'
    INVESTOR = 'investor'


class MoveType(Enum):
    MOVE = 'move'
    INVESTOR_TRANSFORM = 'investor_transform'
    CAPTURE = 'capture'
    PROMOTION = 'promotion'


@dataclass
class Position:
    x: int
    y: int
    
    def __post_init__(self):
        if not (0 <= self.x <= 7) or not (0 <= self.y <= 7):
            raise ValueError(f"Position ({self.x}, {self.y}) is out of bounds")
    
    def __iter__(self):
        return iter((self.x, self.y))
    
    def __eq__(self, other):
        if isinstance(other, tuple):
            return (self.x, self.y) == other
        return isinstance(other, Position) and self.x == other.x and self.y == other.y
    
    def distance(self, other):
        """Calculate Chebyshev distance (max of x and y differences)"""
        return max(abs(self.x - other.x), abs(self.y - other.y))


@dataclass
class GamePiece:
    id: str
    owner_id: str
    piece_type: PieceType
    level: int
    position: Position
    transform_count: int = 0
    temporary_buffs: Dict = None
    is_active: bool = True
    
    def __post_init__(self):
        if self.temporary_buffs is None:
            self.temporary_buffs = {}
        if not (1 <= self.level <= 4):
            raise ValueError(f"Invalid piece level: {self.level}")
    
    def can_transform(self) -> bool:
        """Check if piece can be transformed to next level"""
        return self.transform_count >= 2 and self.level < 4
    
    def is_investor(self) -> bool:
        return self.level == 4
    
    def get_movement_range(self) -> int:
        """Get base movement range for piece"""
        if self.piece_type == PieceType.TALENT:
            base = 3
            # Check for Leader alignment buff
            if 'leader_alignment_buff' in self.temporary_buffs:
                base += 1
                # Remove the buff after use
                del self.temporary_buffs['leader_alignment_buff']
            return base
        elif self.piece_type == PieceType.LEADER:
            return 2
        elif self.piece_type == PieceType.STRATEGIST:
            return 8  # Unlimited (queen-like)
        elif self.piece_type == PieceType.INVESTOR:
            return 1
        return 0


@dataclass
class MoveResult:
    success: bool
    events: List[Dict[str, Any]]
    board_changes: List[Dict[str, Any]]
    error_message: str = ""
    
    def add_event(self, event_type: str, data: Dict[str, Any]):
        """Add a game event"""
        self.events.append({
            'type': event_type,
            'data': data
        })
    
    def add_board_change(self, position: Position, piece: Optional[GamePiece]):
        """Add a board state change"""
        self.board_changes.append({
            'x': position.x,
            'y': position.y,
            'piece': piece.id if piece else None
        })


class GameEngine:
    """Core game engine for TI Chess"""
    
    def __init__(self):
        self.board = {}  # Position -> GamePiece mapping
        self.players = {}  # player_id -> player_info mapping
        
    def load_board_state(self, pieces: List[GamePiece], players: Dict[str, Any]):
        """Load current board state from pieces"""
        self.board = {}
        self.players = players
        
        for piece in pieces:
            if piece.is_active:
                self.board[piece.position] = piece
    
    def get_piece_at(self, position: Position) -> Optional[GamePiece]:
        """Get piece at given position"""
        return self.board.get(position)
    
    def get_valid_moves(self, piece: GamePiece) -> List[Position]:
        """Get all valid move positions for a piece"""
        if not piece.is_active:
            return []
        
        valid_moves = []
        
        if piece.piece_type == PieceType.TALENT:
            # Talent: up to 3 squares straight (horizontal or vertical)
            valid_moves.extend(self._get_straight_moves(piece))
            
        elif piece.piece_type == PieceType.LEADER:
            # Leader: up to 2 squares diagonally
            valid_moves.extend(self._get_diagonal_moves(piece))
            
        elif piece.piece_type == PieceType.STRATEGIST:
            # Strategist: any number of squares straight or diagonal (queen-like)
            valid_moves.extend(self._get_straight_moves(piece, unlimited=True))
            valid_moves.extend(self._get_diagonal_moves(piece, unlimited=True))
            
        elif piece.piece_type == PieceType.INVESTOR:
            # Investor: 1 square any direction (king-like)
            valid_moves.extend(self._get_king_moves(piece))
        
        # Filter out invalid positions and friendly pieces
        return self._filter_valid_positions(valid_moves, piece.owner_id)
    
    def _get_straight_moves(self, piece: GamePiece, unlimited: bool = False) -> List[Position]:
        """Get straight line moves (horizontal and vertical)"""
        moves = []
        max_range = piece.get_movement_range() if not unlimited else 8
        
        # Four directions: up, down, left, right
        directions = [(0, 1), (0, -1), (-1, 0), (1, 0)]
        
        for dx, dy in directions:
            for distance in range(1, max_range + 1):
                try:
                    new_pos = Position(
                        piece.position.x + dx * distance,
                        piece.position.y + dy * distance
                    )
                    
                    # Check if position is blocked
                    blocking_piece = self.get_piece_at(new_pos)
                    if blocking_piece:
                        # Can capture enemy piece
                        if blocking_piece.owner_id != piece.owner_id:
                            moves.append(new_pos)
                        break  # Cannot move past any piece
                    
                    moves.append(new_pos)
                    
                except ValueError:
                    # Out of bounds
                    break
                    
        return moves
    
    def _get_diagonal_moves(self, piece: GamePiece, unlimited: bool = False) -> List[Position]:
        """Get diagonal moves"""
        moves = []
        max_range = piece.get_movement_range() if not unlimited else 8
        
        # Four diagonal directions
        directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
        
        for dx, dy in directions:
            for distance in range(1, max_range + 1):
                try:
                    new_pos = Position(
                        piece.position.x + dx * distance,
                        piece.position.y + dy * distance
                    )
                    
                    # Check if position is blocked
                    blocking_piece = self.get_piece_at(new_pos)
                    if blocking_piece:
                        # Can capture enemy piece
                        if blocking_piece.owner_id != piece.owner_id:
                            moves.append(new_pos)
                        break  # Cannot move past any piece
                    
                    moves.append(new_pos)
                    
                except ValueError:
                    # Out of bounds
                    break
                    
        return moves
    
    def _get_king_moves(self, piece: GamePiece) -> List[Position]:
        """Get king-like moves (1 square in any direction)"""
        moves = []
        
        # Eight directions around the piece
        directions = [
            (0, 1), (0, -1), (1, 0), (-1, 0),  # straight
            (1, 1), (1, -1), (-1, 1), (-1, -1)  # diagonal
        ]
        
        for dx, dy in directions:
            try:
                new_pos = Position(
                    piece.position.x + dx,
                    piece.position.y + dy
                )
                moves.append(new_pos)
            except ValueError:
                # Out of bounds
                continue
                
        return moves
    
    def _filter_valid_positions(self, positions: List[Position], owner_id: str) -> List[Position]:
        """Filter out positions with friendly pieces"""
        valid = []
        for pos in positions:
            piece_at_pos = self.get_piece_at(pos)
            if piece_at_pos is None or piece_at_pos.owner_id != owner_id:
                valid.append(pos)
        return valid
    
    def validate_move(self, piece_id: str, from_pos: Position, to_pos: Position, 
                     player_id: str) -> MoveResult:
        """Validate and return move result"""
        result = MoveResult(success=False, events=[], board_changes=[])
        
        # Find the piece
        piece = None
        for p in self.board.values():
            if p.id == piece_id:
                piece = p
                break
        
        if not piece:
            result.error_message = "Piece not found"
            return result
        
        # Check ownership
        if piece.owner_id != player_id:
            result.error_message = "Not your piece"
            return result
        
        # Check if piece is at from_pos
        if piece.position != from_pos:
            result.error_message = "Piece is not at specified position"
            return result
        
        # Check if move is valid
        valid_moves = self.get_valid_moves(piece)
        if to_pos not in valid_moves:
            result.error_message = "Invalid move for this piece type"
            return result
        
        result.success = True
        return result
    
    def apply_move(self, piece_id: str, from_pos: Position, to_pos: Position, 
                   player_id: str) -> MoveResult:
        """Apply a validated move and return events"""
        result = self.validate_move(piece_id, from_pos, to_pos, player_id)
        
        if not result.success:
            return result
        
        # Get the moving piece
        piece = self.board[from_pos]
        target_piece = self.get_piece_at(to_pos)
        
        # Handle capture
        if target_piece:
            result = self._handle_capture(piece, target_piece, to_pos, result)
        else:
            # Simple move
            self._move_piece(piece, from_pos, to_pos, result)
        
        # Check for promotion (Talent reaching opposite edge)
        if piece.piece_type == PieceType.TALENT:
            if self._is_promotion_position(piece, to_pos):
                self._promote_piece(piece, result)
        
        # Apply Leader alignment buffs
        self._apply_leader_buffs(piece, result)
        
        # Check Investor vulnerability
        self._check_investor_vulnerability(result)
        
        return result
    
    def _handle_capture(self, attacker: GamePiece, target: GamePiece, 
                       to_pos: Position, result: MoveResult) -> MoveResult:
        """Handle piece capture and transformations"""
        
        # Remove target from board
        del self.board[target.position]
        target.is_active = False
        
        # Move attacker to target position
        self._move_piece(attacker, attacker.position, to_pos, result)
        
        # Add capture event
        result.add_event('piece_captured', {
            'captured_piece_id': target.id,
            'captured_by': attacker.id,
            'position': (target.position.x, target.position.y)
        })
        
        # Handle transformations
        self._apply_transformation(attacker, result)
        self._apply_transformation(target, result)
        
        # Strategist special ability: re-place captured piece
        if attacker.piece_type == PieceType.STRATEGIST:
            self._handle_strategist_capture(attacker, target, result)
        
        return result
    
    def _move_piece(self, piece: GamePiece, from_pos: Position, to_pos: Position, 
                   result: MoveResult):
        """Move piece on board and add events"""
        # Remove from old position
        if from_pos in self.board:
            del self.board[from_pos]
        
        # Update piece position
        piece.position = to_pos
        
        # Add to new position
        self.board[to_pos] = piece
        
        # Add move events
        result.add_event('piece_moved', {
            'piece_id': piece.id,
            'from': (from_pos.x, from_pos.y),
            'to': (to_pos.x, to_pos.y)
        })
        
        result.add_board_change(from_pos, None)
        result.add_board_change(to_pos, piece)
    
    def _apply_transformation(self, piece: GamePiece, result: MoveResult):
        """Apply transformation to a piece"""
        piece.transform_count += 1
        
        if piece.can_transform():
            old_level = piece.level
            piece.level += 1
            piece.transform_count = 0
            
            # Update piece type based on level
            type_mapping = {
                1: PieceType.TALENT,
                2: PieceType.LEADER,
                3: PieceType.STRATEGIST,
                4: PieceType.INVESTOR
            }
            piece.piece_type = type_mapping[piece.level]
            
            result.add_event('piece_transformed', {
                'piece_id': piece.id,
                'old_level': old_level,
                'new_level': piece.level,
                'old_type': type_mapping[old_level].value,
                'new_type': piece.piece_type.value
            })
    
    def _promote_piece(self, piece: GamePiece, result: MoveResult):
        """Handle Talent promotion at board edge"""
        if piece.piece_type == PieceType.TALENT:
            old_level = piece.level
            piece.level += 1
            piece.piece_type = PieceType.LEADER if piece.level == 2 else piece.piece_type
            
            result.add_event('piece_promoted', {
                'piece_id': piece.id,
                'old_level': old_level,
                'new_level': piece.level,
                'position': (piece.position.x, piece.position.y)
            })
    
    def _is_promotion_position(self, piece: GamePiece, position: Position) -> bool:
        """Check if position triggers Talent promotion"""
        if piece.piece_type != PieceType.TALENT:
            return False
        
        # Assuming player 1 starts at y=0 and promotes at y=7, player 2 vice versa
        # This would need to be adjusted based on actual game setup
        return position.y == 0 or position.y == 7
    
    def _apply_leader_buffs(self, piece: GamePiece, result: MoveResult):
        """Apply Leader alignment buffs to Talents"""
        if piece.piece_type != PieceType.LEADER:
            return
        
        # Find aligned Talents
        for pos, other_piece in self.board.items():
            if (other_piece.owner_id == piece.owner_id and 
                other_piece.piece_type == PieceType.TALENT):
                
                # Check if Talent is aligned with 2 Leaders
                aligned_leaders = self._count_aligned_leaders(other_piece)
                if aligned_leaders >= 2:
                    other_piece.temporary_buffs['leader_alignment_buff'] = True
                    result.add_event('leader_buff_applied', {
                        'talent_piece_id': other_piece.id,
                        'position': (other_piece.position.x, other_piece.position.y)
                    })
    
    def _count_aligned_leaders(self, talent: GamePiece) -> int:
        """Count Leaders aligned with a Talent piece"""
        count = 0
        
        for piece in self.board.values():
            if (piece.owner_id == talent.owner_id and 
                piece.piece_type == PieceType.LEADER and
                self._is_aligned(talent.position, piece.position)):
                count += 1
        
        return count
    
    def _is_aligned(self, pos1: Position, pos2: Position) -> bool:
        """Check if two positions are aligned (same row, column, or diagonal)"""
        dx = abs(pos1.x - pos2.x)
        dy = abs(pos1.y - pos2.y)
        
        # Same row or column
        if dx == 0 or dy == 0:
            return True
        
        # Same diagonal
        if dx == dy:
            return True
        
        return False
    
    def _check_investor_vulnerability(self, result: MoveResult):
        """Check for Investor vulnerability in second ring"""
        for piece in self.board.values():
            if piece.piece_type == PieceType.INVESTOR and piece.is_active:
                if self._is_investor_vulnerable(piece):
                    # Transform Investor to Strategist
                    old_level = piece.level
                    piece.level = 3
                    piece.piece_type = PieceType.STRATEGIST
                    
                    result.add_event('investor_vulnerable', {
                        'piece_id': piece.id,
                        'old_level': old_level,
                        'new_level': piece.level,
                        'position': (piece.position.x, piece.position.y)
                    })
    
    def _is_investor_vulnerable(self, investor: GamePiece) -> bool:
        """Check if Investor is vulnerable (surrounded in second ring)"""
        second_ring_positions = []
        
        # Get all positions at Chebyshev distance = 2
        for dx in range(-2, 3):
            for dy in range(-2, 3):
                if max(abs(dx), abs(dy)) == 2:  # Exactly distance 2
                    try:
                        pos = Position(investor.position.x + dx, investor.position.y + dy)
                        second_ring_positions.append(pos)
                    except ValueError:
                        # Out of bounds
                        continue
        
        # Count threatening pieces in second ring
        threat_count = 0
        for pos in second_ring_positions:
            piece = self.get_piece_at(pos)
            if piece and self._is_threatening_piece(piece, investor.owner_id):
                threat_count += 1
        
        return threat_count >= 4
    
    def _is_threatening_piece(self, piece: GamePiece, investor_owner: str) -> bool:
        """Check if piece is threatening to an Investor"""
        # Threatening pieces: Investors, Strategists, Leaders (any owner)
        threatening_types = [PieceType.INVESTOR, PieceType.STRATEGIST, PieceType.LEADER]
        return piece.piece_type in threatening_types
    
    def _handle_strategist_capture(self, strategist: GamePiece, captured: GamePiece, 
                                  result: MoveResult):
        """Handle Strategist special ability to re-place captured piece"""
        # Strategist can place captured piece on any empty square
        # The placed piece is transformed up if ally, down if enemy
        
        if captured.owner_id == strategist.owner_id:
            # Ally: transform up
            if captured.level < 4:
                captured.level += 1
        else:
            # Enemy: transform down  
            if captured.level > 1:
                captured.level -= 1
        
        # Update piece type
        type_mapping = {
            1: PieceType.TALENT,
            2: PieceType.LEADER,
            3: PieceType.STRATEGIST,
            4: PieceType.INVESTOR
        }
        captured.piece_type = type_mapping[captured.level]
        
        result.add_event('strategist_placement_ready', {
            'strategist_id': strategist.id,
            'captured_piece_id': captured.id,
            'new_level': captured.level,
            'new_type': captured.piece_type.value
        })
    
    def place_captured_piece(self, captured_piece_id: str, position: Position) -> MoveResult:
        """Place a captured piece at specified position (Strategist ability)"""
        result = MoveResult(success=False, events=[], board_changes=[])
        
        # Find the captured piece (should be inactive)
        captured_piece = None
        for piece in self.board.values():
            if piece.id == captured_piece_id and not piece.is_active:
                captured_piece = piece
                break
        
        if not captured_piece:
            result.error_message = "Captured piece not found"
            return result
        
        # Check if position is empty
        if self.get_piece_at(position):
            result.error_message = "Position is not empty"
            return result
        
        # Place the piece
        captured_piece.position = position
        captured_piece.is_active = True
        self.board[position] = captured_piece
        
        result.success = True
        result.add_event('piece_placed', {
            'piece_id': captured_piece.id,
            'position': (position.x, position.y),
            'level': captured_piece.level,
            'type': captured_piece.piece_type.value
        })
        result.add_board_change(position, captured_piece)
        
        return result
    
    def investor_transform_adjacent(self, investor_id: str, target_piece_id: str, 
                                   player_id: str) -> MoveResult:
        """Investor special ability: transform adjacent allied piece"""
        result = MoveResult(success=False, events=[], board_changes=[])
        
        # Find investor piece
        investor = None
        for piece in self.board.values():
            if piece.id == investor_id:
                investor = piece
                break
        
        if not investor or investor.piece_type != PieceType.INVESTOR:
            result.error_message = "Investor piece not found"
            return result
        
        if investor.owner_id != player_id:
            result.error_message = "Not your piece"
            return result
        
        # Find target piece
        target = None
        for piece in self.board.values():
            if piece.id == target_piece_id:
                target = piece
                break
        
        if not target:
            result.error_message = "Target piece not found"
            return result
        
        # Check if target is allied and adjacent
        if target.owner_id != investor.owner_id:
            result.error_message = "Can only transform allied pieces"
            return result
        
        distance = investor.position.distance(target.position)
        if distance > 1:
            result.error_message = "Target piece is not adjacent"
            return result
        
        # Apply transformation
        result.success = True
        self._apply_transformation(target, result)
        
        return result
    
    def check_win_condition(self) -> Optional[str]:
        """Check if any player has won"""
        player_investors = {}
        
        # Count active Investors for each player
        for piece in self.board.values():
            if piece.is_active and piece.piece_type == PieceType.INVESTOR:
                if piece.owner_id not in player_investors:
                    player_investors[piece.owner_id] = 0
                player_investors[piece.owner_id] += 1
        
        # Find players with no Investors
        players_without_investors = []
        for player_id in self.players:
            if player_id not in player_investors or player_investors[player_id] == 0:
                players_without_investors.append(player_id)
        
        # If exactly one player has no Investors, others win
        if len(players_without_investors) == 1:
            # Return the winner (the other player)
            for player_id in self.players:
                if player_id not in players_without_investors:
                    return player_id
        
        return None
    
    def get_board_state(self) -> Dict[str, Any]:
        """Get complete board state for serialization"""
        board_array = [[None for _ in range(8)] for _ in range(8)]
        
        for position, piece in self.board.items():
            if piece.is_active:
                board_array[position.y][position.x] = {
                    'id': piece.id,
                    'owner_id': piece.owner_id,
                    'type': piece.piece_type.value,
                    'level': piece.level,
                    'transform_count': piece.transform_count,
                    'temporary_buffs': piece.temporary_buffs
                }
        
        return {
            'board': board_array,
            'active_pieces': len([p for p in self.board.values() if p.is_active])
        }