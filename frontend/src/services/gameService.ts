import api from './api';
import { 
  Game, 
  CreateGameRequest, 
  JoinGameRequest, 
  BoardState, 
  Move, 
  MoveRequest 
} from '@/types';

export class GameService {
  // Game management
  async getActiveGames(): Promise<Game[]> {
    const response = await api.get('/games/active/');
    return response.data;
  }

  async getGame(gameId: string): Promise<Game> {
    const response = await api.get(`/games/${gameId}/`);
    return response.data;
  }

  async createGame(gameData: CreateGameRequest): Promise<Game> {
    const response = await api.post('/games/', gameData);
    return response.data;
  }

  async joinGame(gameId: string, joinData: JoinGameRequest): Promise<{ playerToken: string; playerId: string; message: string }> {
    const response = await api.post(`/games/${gameId}/join/`, joinData);
    return response.data;
  }

  // Board state
  async getBoardState(gameId: string): Promise<BoardState> {
    const response = await api.get(`/games/${gameId}/board/`);
    return response.data;
  }

  // Moves (REST fallback)
  async makeMove(gameId: string, moveData: MoveRequest, playerToken: string): Promise<any> {
    const response = await api.post(`/games/${gameId}/move/`, {
      ...moveData,
      player_token: playerToken,
    });
    return response.data;
  }

  async getMoves(gameId: string): Promise<Move[]> {
    try {
      const response = await api.get('/moves/', {
        params: { game_id: gameId },
      });
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch moves:', error);
      // Return empty array on error
      return [];
    }
  }

  // Game replay
  async getGameReplay(gameId: string): Promise<any> {
    const response = await api.get(`/games/${gameId}/replay/`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get('/health/');
    return response.data;
  }
}

export const gameService = new GameService();
export default gameService;