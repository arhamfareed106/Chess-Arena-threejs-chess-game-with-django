import { io, Socket } from 'socket.io-client';
import { WSMessage, WSEvent } from '@/types';

class WebSocketService {
  private socket: Socket | null = null;
  private gameId: string | null = null;
  private playerToken: string | null = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(gameId: string, playerToken?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gameId = gameId;
      this.playerToken = playerToken || null;

      const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8001';
      const wsUrl = `${wsBaseUrl}/ws/game/${gameId}/`;

      this.socket = io(wsUrl, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected to game:', gameId);
        this.reconnectAttempts = 0;
        
        // Auto-reconnect if we have a player token
        if (this.playerToken) {
          this.sendMessage('reconnect', { player_token: this.playerToken });
        }
        
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.emit('connection_lost', { reason });
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect after maximum attempts'));
        }
      });

      this.socket.on('message', (data: WSEvent) => {
        this.handleMessage(data);
      });

      // Handle direct event types
      this.socket.onAny((eventName: string, data: any) => {
        if (eventName !== 'connect' && eventName !== 'disconnect' && eventName !== 'connect_error') {
          this.emit(eventName, data);
        }
      });

      // Connection timeout
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.gameId = null;
    this.playerToken = null;
    this.eventHandlers.clear();
  }

  sendMessage(action: string, data: Record<string, any> = {}): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const message: WSMessage = { action, data };
    this.socket.emit('message', message);
  }

  // Game-specific message methods
  joinGame(playerName: string, playerToken?: string): void {
    this.sendMessage('join_game', {
      player_name: playerName,
      player_token: playerToken,
    });
  }

  selectColor(color: string): void {
    this.sendMessage('select_color', { color });
  }

  setReady(ready: boolean): void {
    this.sendMessage('ready', { ready });
  }

  makeMove(pieceId: string, from: [number, number], to: [number, number]): void {
    this.sendMessage('make_move', {
      piece_id: pieceId,
      from,
      to,
      action: 'move',
    });
  }

  investorTransform(investorId: string, targetPieceId: string): void {
    this.sendMessage('investor_transform', {
      investor_id: investorId,
      target_piece_id: targetPieceId,
    });
  }

  placePiece(pieceId: string, position: [number, number]): void {
    this.sendMessage('place_piece', {
      piece_id: pieceId,
      position,
    });
  }

  // Event handling
  on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler?: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) return;

    if (handler) {
      this.eventHandlers.get(event)!.delete(handler);
    } else {
      this.eventHandlers.get(event)!.clear();
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  private handleMessage(message: WSEvent): void {
    const { event, data } = message;
    
    console.log('WebSocket message received:', event, data);
    
    // Emit the specific event
    this.emit(event, data);
    
    // Also emit a generic 'message' event
    this.emit('message', message);
  }

  // Connection state
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }

  // Utility methods
  savePlayerCredentials(playerId: string, playerToken: string): void {
    this.playerToken = playerToken;
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('playerToken', playerToken);
  }

  getStoredPlayerToken(): string | null {
    return localStorage.getItem('playerToken');
  }

  clearPlayerCredentials(): void {
    this.playerToken = null;
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerToken');
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

export default wsService;