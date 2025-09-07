# TI Chess API Documentation

## Overview

TI Chess API provides RESTful endpoints and WebSocket connections for the Technology Investment Chess game. The API supports game creation, player management, real-time gameplay, and move history.

## Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses player tokens for authentication. When joining a game, you receive a player token that should be included in subsequent requests.

### Headers
```
Player-Token: <your-player-token>
```

## REST API Endpoints

### Games

#### List Active Games
```http
GET /games/active/
```

Returns a list of games that are waiting for players or currently active.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Game Name",
    "is_public": true,
    "status": "waiting",
    "players": [...],
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

#### Create Game
```http
POST /games/
```

**Request:**
```json
{
  "name": "My Game",
  "is_public": true,
  "password": "optional-password",
  "host_name": "Player Name"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Game",
  "status": "waiting",
  "players": [...]
}
```

#### Get Game Details
```http
GET /games/{game_id}/
```

#### Join Game
```http
POST /games/{game_id}/join/
```

**Request:**
```json
{
  "player_name": "Your Name",
  "color": "#ff6b6b",
  "password": "required-for-private-games"
}
```

**Response:**
```json
{
  "player_token": "uuid",
  "player_id": "uuid",
  "message": "Successfully joined game"
}
```

#### Get Board State
```http
GET /games/{game_id}/board/
```

**Response:**
```json
{
  "board": [...],
  "players": [...],
  "current_turn_player": {...},
  "game_status": "active",
  "turn_count": 5
}
```

#### Make Move (REST Fallback)
```http
POST /games/{game_id}/move/
```

**Request:**
```json
{
  "piece_id": "uuid",
  "from_x": 0,
  "from_y": 1,
  "to_x": 0,
  "to_y": 3,
  "player_token": "uuid"
}
```

#### Get Game Replay
```http
GET /games/{game_id}/replay/
```

### Players

#### List Game Players
```http
GET /players/?game_id={game_id}
```

### Moves

#### List Game Moves
```http
GET /moves/?game_id={game_id}
```

## WebSocket API

### Connection

Connect to: `ws://localhost:8000/ws/game/{game_id}/`

### Message Format

All WebSocket messages follow this format:

**Outgoing (Client → Server):**
```json
{
  "action": "action_name",
  "data": {
    "key": "value"
  }
}
```

**Incoming (Server → Client):**
```json
{
  "event": "event_name",
  "data": {
    "key": "value"
  }
}
```

### Client Actions

#### Join Game
```json
{
  "action": "join_game",
  "data": {
    "player_name": "Your Name",
    "player_token": "optional-reconnect-token"
  }
}
```

#### Select Color
```json
{
  "action": "select_color",
  "data": {
    "color": "#ff6b6b"
  }
}
```

#### Set Ready Status
```json
{
  "action": "ready",
  "data": {
    "ready": true
  }
}
```

#### Make Move
```json
{
  "action": "make_move",
  "data": {
    "piece_id": "uuid",
    "from": [0, 1],
    "to": [0, 3]
  }
}
```

#### Investor Transform
```json
{
  "action": "investor_transform",
  "data": {
    "investor_id": "uuid",
    "target_piece_id": "uuid"
  }
}
```

#### Place Piece (Strategist Ability)
```json
{
  "action": "place_piece",
  "data": {
    "piece_id": "uuid",
    "position": [4, 4]
  }
}
```

#### Reconnect
```json
{
  "action": "reconnect",
  "data": {
    "player_token": "uuid"
  }
}
```

### Server Events

#### Player Joined
```json
{
  "event": "player_joined",
  "data": {
    "player_id": "uuid",
    "player_name": "Alice",
    "color": "#ff6b6b"
  }
}
```

#### Game State
```json
{
  "event": "game_state",
  "data": {
    "game": {...},
    "board": [...],
    "players": [...]
  }
}
```

#### Move Made
```json
{
  "event": "move_made",
  "data": {
    "move_id": "uuid",
    "player_id": "uuid",
    "from": [0, 1],
    "to": [0, 3],
    "events": [...],
    "board_changes": [...],
    "turn": "next-player-uuid"
  }
}
```

#### Color Changed
```json
{
  "event": "color_changed",
  "data": {
    "player_id": "uuid",
    "color": "#ff6b6b"
  }
}
```

#### Player Ready Changed
```json
{
  "event": "player_ready_changed",
  "data": {
    "player_id": "uuid",
    "ready": true
  }
}
```

#### Error
```json
{
  "event": "error",
  "data": {
    "message": "Error description"
  }
}
```

## Game Rules Reference

### Piece Types and Movement

1. **Talent (Level 1)**
   - Movement: Up to 3 squares horizontally or vertically
   - Promotion: Reaches opposite board edge

2. **Leader (Level 2)**
   - Movement: Up to 2 squares diagonally
   - Special: Provides movement buffs to aligned Talents

3. **Strategist (Level 3)**
   - Movement: Any distance horizontally, vertically, or diagonally
   - Special: Can re-place captured pieces

4. **Investor (Level 4)**
   - Movement: 1 square in any direction
   - Special: Can transform adjacent allied pieces
   - Vulnerability: Can be demoted if surrounded

### Transformation Rules

- Pieces gain transformation points through captures and special events
- At 2 transformation points, pieces level up (max level 4)
- Transformation points reset to 0 after leveling up

### Win Condition

A player wins when the opponent has no Investor (level 4) pieces remaining.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing player token |
| 404 | Not Found - Game or resource not found |
| 409 | Conflict - Game full or invalid state |
| 500 | Internal Server Error |

## Rate Limiting

- Move submissions: 1 per 3 seconds per player
- API requests: 100 per minute per IP
- WebSocket connections: 5 per IP

## Examples

See the `/docs/examples/` directory for complete code examples in various languages.