export interface User {
  id: string;
  username: string;
  email: string;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
  isHost: boolean;
  isConnected: boolean;
  investorCount: number;
  playerToken: string;
  pieces: Piece[];
  createdAt: string;
}

export interface Piece {
  id: string;
  pieceType: PieceType;
  level: number;
  positionX: number;
  positionY: number;
  transformCount: number;
  temporaryBuffs: Record<string, any>;
  isActive: boolean;
  ownerName: string;
  ownerColor: string;
  createdAt: string;
  updatedAt: string;
}

export enum PieceType {
  TALENT = 'talent',
  LEADER = 'leader',
  STRATEGIST = 'strategist',
  INVESTOR = 'investor'
}

export enum GameStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  FINISHED = 'finished',
  ABANDONED = 'abandoned'
}

export interface Game {
  id: string;
  name: string;
  isPublic: boolean;
  status: GameStatus;
  turnCount: number;
  noProgressTurns: number;
  currentTurnPlayerName: string | null;
  winnerName: string | null;
  winner?: string; // For replay compatibility
  movesCount: number;
  players: Player[];
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface Move {
  id: string;
  moveType: MoveType;
  fromX: number;
  fromY: number;
  toX: number | null;
  toY: number | null;
  moveNumber: number;
  moveData: Record<string, any>;
  isValid: boolean;
  validationErrors: string[];
  playerName: string;
  pieceType: string;
  events: GameEvent[];
  createdAt: string;
}

export enum MoveType {
  MOVE = 'move',
  INVESTOR_TRANSFORM = 'investor_transform',
  CAPTURE = 'capture',
  PROMOTION = 'promotion'
}

export interface GameEvent {
  id: string;
  eventType: EventType;
  eventData: Record<string, any>;
  createdAt: string;
}

export enum EventType {
  PIECE_CREATED = 'piece_created',
  PIECE_MOVED = 'piece_moved',
  PIECE_CAPTURED = 'piece_captured',
  PIECE_TRANSFORMED = 'piece_transformed',
  PIECE_PROMOTED = 'piece_promoted',
  PIECE_PLACED = 'piece_placed',
  INVESTOR_VULNERABLE = 'investor_vulnerable',
  GAME_WON = 'game_won'
}

export interface Position {
  x: number;
  y: number;
}

export interface MoveResult {
  success: boolean;
  moveId?: string;
  playerId?: string;
  from?: [number, number];
  to?: [number, number];
  events?: GameEvent[];
  boardChanges?: BoardChange[];
  winner?: string;
  turn?: string;
  error?: string;
}

export interface BoardChange {
  x: number;
  y: number;
  piece: string | null;
}

export interface BoardState {
  board: (Piece | null)[][];
  players: Player[];
  currentTurnPlayer: Player | null;
  gameStatus: GameStatus;
  turnCount: number;
}

// WebSocket message types
export interface WSMessage {
  action: string;
  data: Record<string, any>;
}

export interface WSEvent {
  event: string;
  data: Record<string, any>;
}

export interface JoinGameRequest {
  playerName: string;
  color?: string;
  password?: string;
}

export interface CreateGameRequest {
  name: string;
  isPublic: boolean;
  password?: string;
  hostName: string;
}

export interface MoveRequest {
  pieceId: string;
  from: [number, number];
  to: [number, number];
  actionType?: 'move' | 'investor_transform';
}

// Camera and rendering types
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export enum CameraPreset {
  TOP_DOWN = 'top-down',
  ISOMETRIC = 'isometric',
  SIDE_VIEW = 'side-view'
}

// UI State types
export interface GameUIState {
  selectedPiece: Piece | null;
  validMoves: Position[];
  showMoveHistory: boolean;
  showSettings: boolean;
  cameraPreset: CameraPreset;
  showGrid: boolean;
  enableAnimations: boolean;
}

// Error types
export interface APIError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}