# type: ignore
import uuid
import json
from django.db import models  # type: ignore
from django.contrib.auth.models import AbstractUser  # type: ignore
from django.core.validators import MinValueValidator, MaxValueValidator  # type: ignore


class User(AbstractUser):
    """Extended user model for TI Chess players"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Stats
    games_played = models.PositiveIntegerField(default=0)
    games_won = models.PositiveIntegerField(default=0)
    
    # Fix related name conflicts with Django's built-in User model
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='game_users',
        related_query_name='game_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='game_users',
        related_query_name='game_user',
    )
    
    def __str__(self):
        return self.username
    
    @property
    def win_rate(self):
        if self.games_played == 0:
            return 0
        return round((self.games_won / self.games_played) * 100, 2)


class Game(models.Model):
    """Game model representing a TI Chess match"""
    
    class Status(models.TextChoices):
        WAITING = 'waiting', 'Waiting for Players'
        ACTIVE = 'active', 'Active'
        FINISHED = 'finished', 'Finished'
        ABANDONED = 'abandoned', 'Abandoned'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, blank=True)
    is_public = models.BooleanField(default=True)
    password = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.WAITING)
    
    # Game state
    current_turn_player = models.ForeignKey(
        'Player', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='games_where_current_turn'
    )
    winner = models.ForeignKey(
        'Player', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='won_games'
    )
    turn_count = models.PositiveIntegerField(default=0)
    no_progress_turns = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Game {self.id} ({self.status})"
    
    @property
    def is_full(self):
        return self.players.count() >= 2
    
    @property
    def can_start(self):
        return self.players.count() == 2 and self.status == self.Status.WAITING


class Player(models.Model):
    """Player in a specific game"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='players')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#ffffff')  # Hex color
    is_ready = models.BooleanField(default=False)
    is_host = models.BooleanField(default=False)
    
    # Connection tracking
    is_connected = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    player_token = models.UUIDField(default=uuid.uuid4, editable=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['game', 'name']
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.name} in {self.game.id}"
    
    @property
    def investor_count(self):
        """Count of active Investor pieces"""
        return self.pieces.filter(is_active=True, level=4).count()


class Piece(models.Model):
    """Individual game piece"""
    
    class PieceType(models.TextChoices):
        TALENT = 'talent', 'Talent'
        LEADER = 'leader', 'Leader'
        STRATEGIST = 'strategist', 'Strategist'
        INVESTOR = 'investor', 'Investor'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='pieces')
    owner = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='pieces')
    
    # Piece properties
    piece_type = models.CharField(max_length=20, choices=PieceType.choices)
    level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        default=1
    )
    
    # Position on board (0-7)
    position_x = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(7)]
    )
    position_y = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(7)]
    )
    
    # Transformation tracking
    transform_count = models.PositiveIntegerField(default=0)
    temporary_buffs = models.JSONField(default=dict, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['game', 'position_x', 'position_y', 'is_active']
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.piece_type.title()} L{self.level} at ({self.position_x},{self.position_y})"
    
    @property
    def position(self):
        return (self.position_x, self.position_y)
    
    def can_transform(self):
        """Check if piece can be transformed to next level"""
        return self.transform_count >= 2 and self.level < 4


class Move(models.Model):
    """Individual move in a game"""
    
    class MoveType(models.TextChoices):
        MOVE = 'move', 'Move'
        INVESTOR_TRANSFORM = 'investor_transform', 'Investor Transform'
        CAPTURE = 'capture', 'Capture'
        PROMOTION = 'promotion', 'Promotion'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='moves')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='moves')
    piece = models.ForeignKey(Piece, on_delete=models.CASCADE, related_name='moves')
    
    # Move details
    move_type = models.CharField(max_length=20, choices=MoveType.choices)
    from_x = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(7)])
    from_y = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(7)])
    to_x = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(7)],
        null=True, blank=True
    )
    to_y = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(7)],
        null=True, blank=True
    )
    
    # Move number in the game
    move_number = models.PositiveIntegerField()
    
    # Additional move data (captures, transforms, placements)
    move_data = models.JSONField(default=dict, blank=True)
    
    # Validation and processing
    is_valid = models.BooleanField(default=False)
    validation_errors = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['move_number']
        unique_together = ['game', 'move_number']
    
    def __str__(self):
        return f"Move #{self.move_number} by {self.player.name}"
    
    @property
    def from_position(self):
        return (self.from_x, self.from_y)
    
    @property
    def to_position(self):
        if self.to_x is not None and self.to_y is not None:
            return (self.to_x, self.to_y)
        return None


class GameSnapshot(models.Model):
    """Snapshot of game state at a specific point"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='snapshots')
    move_number = models.PositiveIntegerField()
    
    # Complete board state as JSON
    board_state = models.JSONField()
    player_states = models.JSONField()
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['game', 'move_number']
        ordering = ['move_number']
    
    def __str__(self):
        return f"Snapshot of {self.game.id} at move {self.move_number}"


class GameEvent(models.Model):
    """Events that occur during gameplay (transforms, captures, etc.)"""
    
    class EventType(models.TextChoices):
        PIECE_CREATED = 'piece_created', 'Piece Created'
        PIECE_MOVED = 'piece_moved', 'Piece Moved'
        PIECE_CAPTURED = 'piece_captured', 'Piece Captured'
        PIECE_TRANSFORMED = 'piece_transformed', 'Piece Transformed'
        PIECE_PROMOTED = 'piece_promoted', 'Piece Promoted'
        PIECE_PLACED = 'piece_placed', 'Piece Placed'
        INVESTOR_VULNERABLE = 'investor_vulnerable', 'Investor Vulnerable'
        GAME_WON = 'game_won', 'Game Won'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='events')
    move = models.ForeignKey(Move, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    event_data = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.event_type} in {self.game.id}"