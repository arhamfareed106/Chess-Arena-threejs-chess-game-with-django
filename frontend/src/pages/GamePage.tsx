import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Fab,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  History as HistoryIcon,
  ExitToApp as ExitIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import GameScene from '@/three/GameScene';
import { 
  Game, 
  Player, 
  Piece, 
  Position, 
  GameStatus,
  PieceType,
  Move 
} from '@/types';
import gameService from '@/services/gameService';
import wsService from '@/services/websocket';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  // Game state
  const [game, setGame] = useState<Game | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // UI state
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [cameraPreset, setCameraPreset] = useState<'top-down' | 'isometric' | 'side-view'>('isometric');
  const [showGrid, setShowGrid] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Player info
  const playerId = localStorage.getItem('playerId');
  const playerToken = localStorage.getItem('playerToken');

  // WebSocket connection
  useEffect(() => {
    if (!gameId) return;

    const connectToGame = async () => {
      try {
        // Check if backend is accessible before connecting WebSocket
        try {
          await gameService.getGame(gameId);
        } catch (backendError) {
          console.warn('Backend not accessible, skipping WebSocket connection:', backendError);
          toast.error('Game server is not available');
          return;
        }

        await wsService.connect(gameId, playerToken || undefined);
        setConnected(true);

        // Set up event listeners
        wsService.on('game_state', handleGameState);
        wsService.on('move_made', handleMoveMade);
        wsService.on('player_joined', handlePlayerJoined);
        wsService.on('error', handleError);
        wsService.on('connection_lost', handleConnectionLost);

        // If we have a token, try to reconnect
        if (playerToken) {
          wsService.sendMessage('reconnect', { player_token: playerToken });
        }

      } catch (error: any) {
        console.error('Failed to connect to game:', error);
        
        // Better error handling for WebSocket connections
        if (error.message.includes('timeout')) {
          toast.error('Connection timeout. The server may be busy. Please try again.');
        } else if (error.message.includes('connect')) {
          toast.error('Unable to establish real-time connection. Some features may not work.');
        } else {
          // Don't show error for WebSocket connection issues in development
          if (process.env.NODE_ENV !== 'development') {
            toast.error('Failed to connect to game');
            setTimeout(() => navigate('/'), 3000);
          } else {
            console.log('WebSocket connection failed in development mode - this is expected if backend is not running');
            setConnected(false);
          }
        }
      }
    };

    connectToGame();

    return () => {
      wsService.disconnect();
    };
  }, [gameId, playerToken, navigate]);

  // Load initial game data
  useEffect(() => {
    if (!gameId) return;

    const loadGameData = async () => {
      try {
        const [gameData, boardState, movesData] = await Promise.all([
          gameService.getGame(gameId),
          gameService.getBoardState(gameId),
          gameService.getMoves(gameId),
        ]);

        setGame(gameData);
        setPieces(extractPiecesFromBoard(boardState.board));
        // Ensure moves is always a safe array
        const safeMoves = Array.isArray(movesData) ? movesData : [];
        setMoves(safeMoves);
        setCurrentPlayer(boardState.currentTurnPlayer);
      } catch (error: any) {
        console.error('Failed to load game data:', error);
        
        // Better error handling with user-friendly messages
        if (error.code === 'ECONNABORTED') {
          toast.error('Server is taking longer than expected. Please wait and try again.');
        } else if (error.code === 'ERR_NETWORK') {
          toast.error('Unable to connect to server. Please check your connection.');
        } else {
          // In development, allow frontend to run without backend
          if (process.env.NODE_ENV === 'development') {
            console.log('Backend not available in development - using mock data');
            setGame({
              id: gameId,
              name: 'Mock Game',
              status: GameStatus.WAITING,
              players: [],
              turnCount: 0,
              isPublic: false,
              noProgressTurns: 0,
              currentTurnPlayerName: null,
              winnerName: null,
              movesCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              startedAt: null,
              finishedAt: null,
            });
            setPieces([]);
            setMoves([]);
            setCurrentPlayer(null);
          } else {
            toast.error('Failed to load game. Returning to lobby.');
            setTimeout(() => navigate('/'), 3000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [gameId, navigate]);

  // WebSocket event handlers
  const handleGameState = (data: any) => {
    setGame(data);
    if (data.board) {
      setPieces(extractPiecesFromBoard(data.board));
    }
  };

  const handleMoveMade = (data: any) => {
    try {
      // Update pieces positions and game state
      if (data.board_changes) {
        setPieces(prev => updatePiecesFromChanges(prev, data.board_changes));
      }
      
      // Update moves list if provided - ensure safe array handling
      if (data.move) {
        setMoves(prev => {
          const currentMoves = Array.isArray(prev) ? prev : [];
          return [...currentMoves, data.move];
        });
      }
      
      // Clear selection
      setSelectedPiece(null);
      setValidMoves([]);

      // Show move notification
      toast.success(`Move made by ${data.player_name || 'opponent'}`);
    } catch (error) {
      console.error('Error handling move:', error);
      // Ensure moves is still a safe array even if something goes wrong
      setMoves(prev => Array.isArray(prev) ? prev : []);
    }
  };

  const handlePlayerJoined = (data: any) => {
    toast.success(`${data.player_name} joined the game`);
  };

  const handleError = (_data: any) => {
    toast.error(_data.message || 'An error occurred');
  };

  const handleConnectionLost = (_data: any) => {
    setConnected(false);
    toast.error('Connection lost. Attempting to reconnect...');
  };

  // Helper function to ensure moves is always an array
  const safeMovesArray = (movesData: any): Move[] => {
    if (Array.isArray(movesData)) {
      return movesData;
    }
    console.warn('Moves data is not an array:', movesData);
    return [];
  };

  // Helper functions
  const extractPiecesFromBoard = (board: any[][]): Piece[] => {
    const pieces: Piece[] = [];
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const square = board[y][x];
        if (square) {
          pieces.push({
            id: square.id,
            pieceType: square.type as PieceType,
            level: square.level,
            positionX: x,
            positionY: y,
            transformCount: square.transform_count || 0,
            temporaryBuffs: square.temporary_buffs || {},
            isActive: true,
            ownerName: square.owner_name || '',
            ownerColor: square.owner_color || '#000000',
            createdAt: '',
            updatedAt: '',
          });
        }
      }
    }
    
    return pieces;
  };

  const updatePiecesFromChanges = (currentPieces: Piece[], changes: any[]): Piece[] => {
    const updatedPieces = [...currentPieces];
    
    changes.forEach(change => {
      const { x, y, piece } = change;
      
      // Remove piece from old position
      const existingIndex = updatedPieces.findIndex(p => 
        p.positionX === x && p.positionY === y
      );
      
      if (existingIndex !== -1) {
        updatedPieces.splice(existingIndex, 1);
      }
      
      // Add piece to new position if exists
      if (piece) {
        updatedPieces.push({
          id: piece.id,
          pieceType: piece.type as PieceType,
          level: piece.level,
          positionX: x,
          positionY: y,
          transformCount: piece.transform_count || 0,
          temporaryBuffs: piece.temporary_buffs || {},
          isActive: true,
          ownerName: piece.owner_name || '',
          ownerColor: piece.owner_color || '#000000',
          createdAt: '',
          updatedAt: '',
        });
      }
    });
    
    return updatedPieces;
  };

  // Game interaction handlers
  const handlePieceClick = (piece: Piece) => {
    if (selectedPiece?.id === piece.id) {
      // Deselect if clicking same piece
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    // Can only select own pieces
    const myPlayer = game?.players.find(p => p.id === playerId);
    if (!myPlayer || piece.ownerColor !== myPlayer.color) {
      toast.error('You can only select your own pieces');
      return;
    }

    // Check if it's our turn
    if (currentPlayer?.id !== playerId) {
      toast.error('It\'s not your turn');
      return;
    }

    setSelectedPiece(piece);
    
    // Calculate valid moves (simplified - should use game engine)
    const moves = calculateValidMoves(piece);
    setValidMoves(moves);
  };

  const handleSquareClick = (x: number, y: number) => {
    if (!selectedPiece) return;
    
    const isValidMove = validMoves.some(move => move.x === x && move.y === y);
    
    if (!isValidMove) {
      toast.error('Invalid move');
      return;
    }

    // Send move via WebSocket
    try {
      wsService.makeMove(
        selectedPiece.id,
        [selectedPiece.positionX, selectedPiece.positionY],
        [x, y]
      );
    } catch (error) {
      console.error('Failed to make move:', error);
      toast.error('Failed to make move');
    }
  };

  const calculateValidMoves = (piece: Piece): Position[] => {
    // Simplified move calculation - in real implementation, 
    // this would use the game engine or request from server
    const moves: Position[] = [];
    
    // Basic movement patterns based on piece type
    switch (piece.pieceType) {
      case PieceType.TALENT:
        // Vertical and horizontal moves up to 3 squares
        for (let i = 1; i <= 3; i++) {
          const positions = [
            { x: piece.positionX + i, y: piece.positionY },
            { x: piece.positionX - i, y: piece.positionY },
            { x: piece.positionX, y: piece.positionY + i },
            { x: piece.positionX, y: piece.positionY - i },
          ];
          
          positions.forEach(pos => {
            if (pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8) {
              const occupied = pieces.some(p => p.positionX === pos.x && p.positionY === pos.y);
              if (!occupied || pieces.find(p => p.positionX === pos.x && p.positionY === pos.y)?.ownerColor !== piece.ownerColor) {
                moves.push(pos);
              }
            }
          });
        }
        break;
        
      // Add other piece types...
      default:
        // Basic king-like movement for now
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            
            const x = piece.positionX + dx;
            const y = piece.positionY + dy;
            
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
              const occupied = pieces.some(p => p.positionX === x && p.positionY === y);
              if (!occupied || pieces.find(p => p.positionX === x && p.positionY === y)?.ownerColor !== piece.ownerColor) {
                moves.push({ x, y });
              }
            }
          }
        }
        break;
    }
    
    return moves;
  };

  const handleExitGame = () => {
    wsService.disconnect();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <Typography variant="h6" className="text-white">
            Loading game...
          </Typography>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <Typography variant="h5" className="mb-4">
            Game not found
          </Typography>
          <Button onClick={() => navigate('/')}>
            Return to Lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Box className="h-screen flex flex-col bg-gray-900">
      {/* Game Scene */}
      <Box className="flex-1 relative">
        <GameScene
          pieces={pieces}
          selectedPiece={selectedPiece}
          validMoves={validMoves}
          cameraPreset={cameraPreset}
          showGrid={showGrid}
          onPieceClick={handlePieceClick}
          onSquareClick={handleSquareClick}
        />

        {/* UI Overlays */}
        {/* Connection Status */}
        <Paper 
          className="absolute top-4 left-4 px-3 py-2"
          sx={{ background: 'rgba(255,255,255,0.9)' }}
        >
          <Box className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`} 
            />
            <Typography variant="body2">
              {connected ? 'Connected' : 'Disconnected'}
            </Typography>
          </Box>
        </Paper>

        {/* Game Info */}
        <Paper 
          className="absolute top-4 right-4 p-3"
          sx={{ background: 'rgba(255,255,255,0.9)', minWidth: 250 }}
        >
          <Typography variant="h6" className="mb-2">
            {game.name || `Game ${game.id.slice(0, 8)}`}
          </Typography>
          
          <Box className="space-y-2">
            <Box className="flex items-center justify-between">
              <Typography variant="body2">Status:</Typography>
              <Chip 
                label={game.status} 
                size="small" 
                color={game.status === GameStatus.ACTIVE ? 'success' : 'default'}
              />
            </Box>
            
            <Box className="flex items-center justify-between">
              <Typography variant="body2">Turn:</Typography>
              <Typography variant="body2" className="font-semibold">
                {currentPlayer?.name || 'Loading...'}
              </Typography>
            </Box>
            
            <Box className="flex items-center justify-between">
              <Typography variant="body2">Moves:</Typography>
              <Typography variant="body2">{game.turnCount}</Typography>
            </Box>
          </Box>
          
          {/* Players */}
          <Box className="mt-3">
            <Typography variant="body2" className="font-medium mb-1">
              Players:
            </Typography>
            {game.players.map(player => (
              <Box key={player.id} className="flex items-center gap-2 mb-1">
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: player.color }}
                />
                <Typography variant="body2">{player.name}</Typography>
                {player.id === playerId && (
                  <Chip label="You" size="small" variant="outlined" />
                )}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Controls */}
        <Box className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Fab
            size="small"
            onClick={() => setShowHistory(!showHistory)}
            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            <HistoryIcon />
          </Fab>
          
          <Fab
            size="small"
            onClick={() => setShowSettings(!showSettings)}
            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            <SettingsIcon />
          </Fab>
          
          <Fab
            size="small"
            onClick={() => setSoundEnabled(!soundEnabled)}
            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </Fab>
          
          <Fab
            size="small"
            onClick={handleExitGame}
            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            <ExitIcon />
          </Fab>
        </Box>
      </Box>

      {/* Move History Drawer */}
      <Drawer
        anchor="bottom"
        open={showHistory}
        onClose={() => setShowHistory(false)}
        PaperProps={{ sx: { maxHeight: '40vh' } }}
      >
        <Box className="p-4">
          <Typography variant="h6" className="mb-2">Move History</Typography>
          <List dense>
            {(() => {
              // Ensure moves is always a safe array for rendering
              const safeMoves = Array.isArray(moves) ? moves : [];
              
              if (safeMoves.length === 0) {
                return (
                  <ListItem>
                    <ListItemText
                      primary="No moves yet"
                      secondary="Start playing to see move history"
                    />
                  </ListItem>
                );
              }
              
              return safeMoves.map((move, index) => (
                <ListItem key={move?.id || `move-${index}`}>
                  <ListItemText
                    primary={`${index + 1}. ${move?.playerName || 'Unknown Player'}`}
                    secondary={`${move?.pieceType || 'Unknown'} from (${move?.fromX ?? '?'},${move?.fromY ?? '?'}) to (${move?.toX ?? '?'},${move?.toY ?? '?'})`}
                  />
                </ListItem>
              ));
            })()}
          </List>
        </Box>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={showSettings}
        onClose={() => setShowSettings(false)}
        PaperProps={{ sx: { width: 300 } }}
      >
        <Box className="p-4">
          <Typography variant="h6" className="mb-4">Game Settings</Typography>
          
          <Box className="space-y-4">
            <Box>
              <Typography variant="body2" className="mb-2">Camera View:</Typography>
              <Box className="flex flex-col gap-1">
                {(['top-down', 'isometric', 'side-view'] as const).map(preset => (
                  <Button
                    key={preset}
                    variant={cameraPreset === preset ? 'contained' : 'outlined'}
                    onClick={() => setCameraPreset(preset)}
                    size="small"
                  >
                    {preset.replace('-', ' ').toUpperCase()}
                  </Button>
                ))}
              </Box>
            </Box>
            
            <Box className="flex items-center justify-between">
              <Typography variant="body2">Show Grid:</Typography>
              <Button
                variant={showGrid ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setShowGrid(!showGrid)}
              >
                {showGrid ? 'ON' : 'OFF'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default GamePage;          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default GamePage;