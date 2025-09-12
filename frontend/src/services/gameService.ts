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
  private async retryRequest<T>(request: () => Promise<T>, retries = 2): Promise<T> {
    try {
      return await request();
    } catch (error: any) {
      if (retries > 0 && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
        console.log(`Retrying request, ${retries} attempts remaining...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.retryRequest(request, retries - 1);
      }
      throw error;
    }
  }

  // Game management
  async getActiveGames(): Promise<Game[]> {
    try {
      return await this.retryRequest(async () => {
        const response = await api.get('/games/active/');
        return Array.isArray(response.data) ? response.data : [];
      });
    } catch (error) {
      console.error('Failed to fetch active games:', error);
      return []; // Return empty array on error
    }
  }

  async getGame(gameId: string): Promise<Game> {
    return await this.retryRequest(async () => {
      const response = await api.get(`/games/${gameId}/`);
      return response.data;
    });
  }

  async createGame(gameData: CreateGameRequest): Promise<Game> {
    return await this.retryRequest(async () => {
      const response = await api.post('/games/', gameData);
      return response.data;
    });
  }

  async joinGame(gameId: string, joinData: JoinGameRequest): Promise<{ playerToken: string; playerId: string; message: string }> {
    return await this.retryRequest(async () => {
      const response = await api.post(`/games/${gameId}/join/`, joinData);
      return response.data;
    });
  }

  async getBoardState(gameId: string): Promise<BoardState> {
    try {
      return await this.retryRequest(async () => {
        const response = await api.get(`/games/${gameId}/board/`);
        const data = response.data;
        
        // Ensure board data has proper structure
        if (data && typeof data === 'object') {
          // Ensure players is always an array
          if (!Array.isArray(data.players)) {
            data.players = [];
          }
          // Ensure board is properly structured
          if (!Array.isArray(data.board)) {
            data.board = Array(8).fill(null).map(() => Array(8).fill(null));
          }
        }
        
        return data;
      });
    } catch (error) {
      console.error('Failed to fetch board state:', error);
      // Return a default board state structure
      return {
        board: Array(8).fill(null).map(() => Array(8).fill(null)),
        players: [],
        current_turn_player: null,
        game_status: 'waiting',
        turn_count: 0
      };
    }
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