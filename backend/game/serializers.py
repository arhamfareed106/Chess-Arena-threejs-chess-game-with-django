# type: ignore
"""
Django REST Framework serializers for TI Chess
"""

from rest_framework import serializers  # type: ignore
from .models import User, Game, Player, Piece, Move, GameSnapshot, GameEvent


class UserSerializer(serializers.ModelSerializer):
    """User serializer"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'games_played', 'games_won', 'win_rate', 'created_at']
        read_only_fields = ['id', 'games_played', 'games_won', 'win_rate', 'created_at']


class PieceSerializer(serializers.ModelSerializer):
    """Piece serializer"""
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    owner_color = serializers.CharField(source='owner.color', read_only=True)
    
    class Meta:
        model = Piece
        fields = [
            'id', 'piece_type', 'level', 'position_x', 'position_y',
            'transform_count', 'temporary_buffs', 'is_active',
            'owner_name', 'owner_color', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner_name', 'owner_color']


class PlayerSerializer(serializers.ModelSerializer):
    """Player serializer"""
    pieces = PieceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Player
        fields = [
            'id', 'name', 'color', 'is_ready', 'is_host', 'is_connected',
            'investor_count', 'player_token', 'pieces', 'created_at'
        ]
        read_only_fields = ['id', 'player_token', 'investor_count', 'created_at']


class GameEventSerializer(serializers.ModelSerializer):
    """Game event serializer"""
    
    class Meta:
        model = GameEvent
        fields = ['id', 'event_type', 'event_data', 'created_at']
        read_only_fields = ['id', 'created_at']


class MoveSerializer(serializers.ModelSerializer):
    """Move serializer"""
    player_name = serializers.CharField(source='player.name', read_only=True)
    piece_type = serializers.CharField(source='piece.piece_type', read_only=True)
    events = GameEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = Move
        fields = [
            'id', 'move_type', 'from_x', 'from_y', 'to_x', 'to_y',
            'move_number', 'move_data', 'is_valid', 'validation_errors',
            'player_name', 'piece_type', 'events', 'created_at'
        ]
        read_only_fields = [
            'id', 'move_number', 'is_valid', 'validation_errors',
            'player_name', 'piece_type', 'events', 'created_at'
        ]


class GameSerializer(serializers.ModelSerializer):
    """Game serializer"""
    players = PlayerSerializer(many=True, read_only=True)
    current_turn_player_name = serializers.CharField(
        source='current_turn_player.name', 
        read_only=True
    )
    winner_name = serializers.CharField(source='winner.name', read_only=True)
    moves_count = serializers.IntegerField(source='moves.count', read_only=True)
    
    class Meta:
        model = Game
        fields = [
            'id', 'name', 'is_public', 'status', 'turn_count',
            'no_progress_turns', 'current_turn_player_name', 'winner_name',
            'moves_count', 'players', 'created_at', 'updated_at',
            'started_at', 'finished_at'
        ]
        read_only_fields = [
            'id', 'status', 'turn_count', 'no_progress_turns',
            'current_turn_player_name', 'winner_name', 'moves_count',
            'created_at', 'updated_at', 'started_at', 'finished_at'
        ]


class GameCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating games"""
    hostName = serializers.CharField(write_only=True, max_length=100)
    isPublic = serializers.BooleanField(source='is_public', default=True)
    
    class Meta:
        model = Game
        fields = ['name', 'isPublic', 'password', 'hostName']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        host_name = validated_data.pop('hostName')
        game = Game.objects.create(**validated_data)
        
        # Create host player
        Player.objects.create(
            game=game,
            name=host_name,
            is_host=True
        )
        
        return game


class JoinGameSerializer(serializers.Serializer):
    """Serializer for joining games"""
    player_name = serializers.CharField(max_length=100)
    color = serializers.CharField(max_length=7, default='#ffffff')
    password = serializers.CharField(required=False, allow_blank=True)
    
    def validate_player_name(self, value):
        """Validate player name is not taken in this game"""
        game_id = self.context.get('game_id')
        if game_id and Player.objects.filter(game_id=game_id, name=value).exists():
            raise serializers.ValidationError("Player name already taken in this game")
        return value
    
    def validate_color(self, value):
        """Validate color format"""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("Color must be in hex format (#RRGGBB)")
        return value


class MoveCreateSerializer(serializers.Serializer):
    """Serializer for creating moves"""
    piece_id = serializers.UUIDField()
    from_x = serializers.IntegerField(min_value=0, max_value=7)
    from_y = serializers.IntegerField(min_value=0, max_value=7)
    to_x = serializers.IntegerField(min_value=0, max_value=7)
    to_y = serializers.IntegerField(min_value=0, max_value=7)
    move_type = serializers.ChoiceField(
        choices=Move.MoveType.choices, 
        default=Move.MoveType.MOVE
    )


class InvestorTransformSerializer(serializers.Serializer):
    """Serializer for Investor transform actions"""
    investor_id = serializers.UUIDField()
    target_piece_id = serializers.UUIDField()


class PiecePlacementSerializer(serializers.Serializer):
    """Serializer for Strategist piece placement"""
    piece_id = serializers.UUIDField()
    position_x = serializers.IntegerField(min_value=0, max_value=7)
    position_y = serializers.IntegerField(min_value=0, max_value=7)


class GameReplaySerializer(serializers.Serializer):
    """Serializer for game replay data"""
    game_id = serializers.UUIDField(read_only=True)
    moves = MoveSerializer(many=True, read_only=True)
    players = PlayerSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    finished_at = serializers.DateTimeField(read_only=True)
    winner = PlayerSerializer(read_only=True)


class BoardStateSerializer(serializers.Serializer):
    """Serializer for board state"""
    board = serializers.JSONField(read_only=True)
    players = PlayerSerializer(many=True, read_only=True)
    current_turn_player = PlayerSerializer(read_only=True)
    game_status = serializers.CharField(read_only=True)
    turn_count = serializers.IntegerField(read_only=True)