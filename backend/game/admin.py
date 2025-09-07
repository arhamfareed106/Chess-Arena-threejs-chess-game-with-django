from django.contrib import admin
from .models import User, Game, Player, Piece, Move, GameSnapshot, GameEvent


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'games_played', 'games_won', 'win_rate', 'created_at']
    list_filter = ['is_active', 'is_staff', 'created_at']
    search_fields = ['username', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'status', 'turn_count', 'players_count', 'created_at']
    list_filter = ['status', 'is_public', 'created_at']
    search_fields = ['id', 'name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def players_count(self, obj):
        return obj.players.count()
    players_count.short_description = 'Players'


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'game', 'color', 'is_ready', 'is_connected', 'investor_count']
    list_filter = ['is_ready', 'is_connected', 'is_host']
    search_fields = ['name', 'game__id']
    readonly_fields = ['id', 'player_token', 'created_at']


@admin.register(Piece)
class PieceAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'owner', 'game', 'is_active', 'transform_count']
    list_filter = ['piece_type', 'level', 'is_active', 'game__status']
    search_fields = ['owner__name', 'game__id']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Move)
class MoveAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'move_type', 'from_position', 'to_position', 'is_valid']
    list_filter = ['move_type', 'is_valid', 'game__status']
    search_fields = ['player__name', 'game__id']
    readonly_fields = ['id', 'created_at']


@admin.register(GameSnapshot)
class GameSnapshotAdmin(admin.ModelAdmin):
    list_display = ['game', 'move_number', 'created_at']
    list_filter = ['created_at']
    search_fields = ['game__id']
    readonly_fields = ['id', 'created_at']


@admin.register(GameEvent)
class GameEventAdmin(admin.ModelAdmin):
    list_display = ['game', 'event_type', 'move', 'created_at']
    list_filter = ['event_type', 'created_at']
    search_fields = ['game__id', 'move__id']
    readonly_fields = ['id', 'created_at']