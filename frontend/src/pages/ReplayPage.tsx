import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  IconButton,
  Box,
  Paper,
  Slider,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import GameScene from '@/three/GameScene';
import { Move, Piece, Game, PieceType, GameStatus } from '@/types';
import gameService from '@/services/gameService';

const ReplayPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Replay controls
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms between moves

  useEffect(() => {
    if (!gameId) return;

    const loadReplayData = async () => {
      try {
        const replayData = await gameService.getGameReplay(gameId);
        setGame({
          id: replayData.game_id,
          name: `Replay of ${replayData.game_id.slice(0, 8)}`,
          isPublic: true,
          status: 'finished' as GameStatus,
          turnCount: 0,
          noProgressTurns: 0,
          currentTurnPlayerName: null,
          winnerName: replayData.winner,
          winner: replayData.winner,
          movesCount: replayData.moves?.length || 0,
          players: replayData.players,
          moves: replayData.moves,
          createdAt: replayData.created_at,
          updatedAt: replayData.created_at,
          startedAt: replayData.created_at,
          finishedAt: replayData.finished_at,
        } as Game);
        
        setMoves(Array.isArray(replayData.moves) ? replayData.moves : []);
        
        // Initialize with starting positions
        initializePieces(replayData.players);
        
      } catch (error) {
        console.error('Failed to load replay data:', error);
        toast.error('Failed to load replay');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadReplayData();
  }, [gameId, navigate]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || currentMoveIndex >= moves.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      handleNextMove();
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentMoveIndex, moves.length, playbackSpeed]);

  // Update board state when move index changes
  useEffect(() => {
    updateBoardToMoveIndex(currentMoveIndex);
  }, [currentMoveIndex, moves]);

  const initializePieces = (players: any[]) => {
    const initialPieces: Piece[] = [];
    
    // Create starting pieces based on standard TI Chess setup
    players.forEach((player, playerIndex) => {
      const yPosition = playerIndex === 0 ? 1 : 6;
      
      for (let x = 0; x < 8; x++) {
        initialPieces.push({
          id: `${player.id}-piece-${x}`,
          pieceType: PieceType.TALENT,
          level: 1,
          positionX: x,
          positionY: yPosition,
          transformCount: 0,
          temporaryBuffs: {},
          isActive: true,
          ownerName: player.name,
          ownerColor: player.color,
          createdAt: '',
          updatedAt: '',
        });
      }
    });
    
    setPieces(initialPieces);
  };

  const updateBoardToMoveIndex = (moveIndex: number) => {
    // This would reconstruct the board state at the given move
    // For now, we'll use a simplified approach
    
    if (moveIndex === 0) {
      // Reset to initial position
      if (game?.players) {
        initializePieces(game.players);
      }
      return;
    }

    // Apply moves up to the current index
    // This is simplified - in a real implementation, you'd replay all moves
    // from the beginning to reconstruct the exact board state
    
    setPieces(prevPieces => {
      const newPieces = [...prevPieces];
      const currentMove = moves[moveIndex - 1];
      
      if (currentMove) {
        // Find and update the piece that moved
        const pieceIndex = newPieces.findIndex(p => 
          p.positionX === currentMove.fromX && 
          p.positionY === currentMove.fromY
        );
        
        if (pieceIndex !== -1 && currentMove.toX !== null && currentMove.toY !== null) {
          // Check for captures
          const capturedIndex = newPieces.findIndex(p => 
            p.positionX === currentMove.toX && 
            p.positionY === currentMove.toY
          );
          
          if (capturedIndex !== -1) {
            newPieces.splice(capturedIndex, 1);
          }
          
          // Move the piece
          newPieces[pieceIndex] = {
            ...newPieces[pieceIndex],
            positionX: currentMove.toX,
            positionY: currentMove.toY,
          };
        }
      }
      
      return newPieces;
    });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextMove = () => {
    if (currentMoveIndex < moves.length) {
      setCurrentMoveIndex(prev => prev + 1);
    }
  };

  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  };

  const handleMoveSliderChange = (_event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    setCurrentMoveIndex(newValue as number);
    setIsPlaying(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <Typography variant="h6" className="text-white">
            Loading replay...
          </Typography>
        </div>
      </div>
    );
  }

  if (!game || !moves || moves.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <Typography variant="h5" className="mb-4">
            No replay data available
          </Typography>
          <Button onClick={handleBack}>
            Return to Lobby
          </Button>
        </div>
      </div>
    );
  }

  const currentMove = currentMoveIndex > 0 ? moves[currentMoveIndex - 1] : null;
  const progress = moves.length > 0 ? (currentMoveIndex / moves.length) * 100 : 0;

  return (
    <Box className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <Paper 
        className="flex items-center justify-between p-4"
        sx={{ background: 'rgba(255,255,255,0.95)', zIndex: 10 }}
      >
        <Box className="flex items-center gap-2">
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" className="font-bold">
            Game Replay
          </Typography>
        </Box>
        
        <Box className="text-right">
          <Typography variant="h6">
            {game.name}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Move {currentMoveIndex} of {moves.length}
          </Typography>
        </Box>
      </Paper>

      {/* Game Scene */}
      <Box className="flex-1 relative">
        <GameScene
          pieces={pieces}
          cameraPreset="isometric"
          showGrid={true}
        />

        {/* Current Move Info */}
        {currentMove && (
          <Paper 
            className="absolute top-4 left-4 p-3"
            sx={{ background: 'rgba(255,255,255,0.9)', minWidth: 200 }}
          >
            <Typography variant="h6" className="mb-2">
              Move {currentMoveIndex}
            </Typography>
            <Typography variant="body2">
              <strong>Player:</strong> {currentMove.playerName}
            </Typography>
            <Typography variant="body2">
              <strong>Piece:</strong> {currentMove.pieceType}
            </Typography>
            <Typography variant="body2">
              <strong>From:</strong> ({currentMove.fromX}, {currentMove.fromY})
            </Typography>
            {currentMove.toX !== null && currentMove.toY !== null && (
              <Typography variant="body2">
                <strong>To:</strong> ({currentMove.toX}, {currentMove.toY})
              </Typography>
            )}
          </Paper>
        )}

        {/* Game Info */}
        <Paper 
          className="absolute top-4 right-4 p-3"
          sx={{ background: 'rgba(255,255,255,0.9)', minWidth: 250 }}
        >
          <Typography variant="h6" className="mb-2">
            Players
          </Typography>
          {game.players.map(player => (
            <Box key={player.id} className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: player.color }}
              />
              <Typography variant="body2">{player.name}</Typography>
            </Box>
          ))}
          
          {game.winner && (
            <Box className="mt-3 p-2 bg-green-100 rounded">
              <Typography variant="body2" className="font-semibold">
                Winner: {game.winner}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Replay Controls */}
      <Paper className="p-4" sx={{ background: 'rgba(255,255,255,0.95)' }}>
        <Box className="mb-4">
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Box className="flex items-center gap-4">
          {/* Control buttons */}
          <Box className="flex items-center gap-2">
            <IconButton onClick={handleRestart}>
              <ReplayIcon />
            </IconButton>
            
            <IconButton 
              onClick={handlePreviousMove}
              disabled={currentMoveIndex === 0}
            >
              <SkipPreviousIcon />
            </IconButton>
            
            <IconButton onClick={handlePlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            
            <IconButton 
              onClick={handleNextMove}
              disabled={currentMoveIndex >= moves.length}
            >
              <SkipNextIcon />
            </IconButton>
          </Box>

          {/* Move slider */}
          <Box className="flex-1 mx-4">
            <Slider
              value={currentMoveIndex}
              onChange={handleMoveSliderChange}
              min={0}
              max={moves.length}
              step={1}
              marks={[
                { value: 0, label: 'Start' },
                { value: moves.length, label: 'End' },
              ]}
            />
          </Box>

          {/* Speed control */}
          <Box className="w-32">
            <Typography variant="caption" className="block">
              Speed: {(2000 / playbackSpeed).toFixed(1)}x
            </Typography>
            <Slider
              value={2000 / playbackSpeed}
              onChange={(_e: Event | React.SyntheticEvent, value: number | number[]) => setPlaybackSpeed(2000 / (value as number))}
              min={0.5}
              max={4}
              step={0.5}
              size="small"
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReplayPage;