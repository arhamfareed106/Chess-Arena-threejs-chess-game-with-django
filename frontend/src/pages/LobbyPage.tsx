import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import { Game, GameStatus } from '@/types';
import gameService from '@/services/gameService';

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [joinPassword, setJoinPassword] = useState('');

  const loadGames = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const activeGames = await gameService.getActiveGames();
      setGames(activeGames);
    } catch (error) {
      console.error('Failed to load games:', error);
      toast.error('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGames();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadGames(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateGame = () => {
    navigate('/create');
  };

  const handleJoinGame = (gameId: string, isPublic: boolean) => {
    if (isPublic) {
      navigate(`/join/${gameId}`);
    } else {
      setSelectedGameId(gameId);
      setJoinDialogOpen(true);
    }
  };

  const handleJoinPrivateGame = () => {
    setJoinDialogOpen(false);
    navigate(`/join/${selectedGameId}`, { state: { password: joinPassword } });
    setJoinPassword('');
  };

  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case GameStatus.WAITING:
        return 'warning';
      case GameStatus.ACTIVE:
        return 'success';
      case GameStatus.FINISHED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: GameStatus) => {
    switch (status) {
      case GameStatus.WAITING:
        return 'Waiting for Players';
      case GameStatus.ACTIVE:
        return 'In Progress';
      case GameStatus.FINISHED:
        return 'Finished';
      default:
        return status;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <Typography variant="h6" className="text-white">
            Loading games...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box className="text-center mb-8">
        <Typography variant="h2" className="font-bold text-white mb-4">
          TI Chess
        </Typography>
        <Typography variant="h5" className="text-white/80 mb-6">
          Technology Investment Chess - Strategic Evolution Game
        </Typography>
        
        <Box className="flex justify-center gap-4 mb-6">
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateGame}
            sx={{ px: 4, py: 1.5 }}
          >
            Create Game
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<InfoIcon />}
            onClick={() => setShowInfo(true)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            How to Play
          </Button>
        </Box>
      </Box>

      {/* Games List */}
      <Box className="mb-6">
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h4" className="text-white font-semibold">
            Active Games
          </Typography>
          
          <Tooltip title="Refresh games list">
            <IconButton 
              onClick={() => loadGames(false)} 
              disabled={refreshing}
              sx={{ color: 'white' }}
            >
              <RefreshIcon className={refreshing ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
        </Box>

        {games.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Typography variant="h6" className="text-gray-600 mb-2">
                No active games found
              </Typography>
              <Typography variant="body2" className="text-gray-500 mb-4">
                Be the first to start a new game!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateGame}
              >
                Create New Game
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {games.map((game) => (
              <Grid item xs={12} sm={6} lg={4} key={game.id}>
                <Card 
                  className="h-full flex flex-col transition-transform hover:scale-105"
                  sx={{ 
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)' 
                  }}
                >
                  <CardContent className="flex-1">
                    <Box className="flex items-start justify-between mb-3">
                      <Typography variant="h6" className="font-semibold truncate">
                        {game.name || `Game ${game.id.slice(0, 8)}`}
                      </Typography>
                      
                      <Chip
                        label={getStatusText(game.status)}
                        color={getStatusColor(game.status)}
                        size="small"
                      />
                    </Box>

                    <Box className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <Box className="flex items-center gap-1">
                        <PeopleIcon fontSize="small" />
                        <span>{game.players.length}/2</span>
                      </Box>
                      
                      <Box className="flex items-center gap-1">
                        <ScheduleIcon fontSize="small" />
                        <span>{formatTimeAgo(game.createdAt)}</span>
                      </Box>
                    </Box>

                    {game.players.length > 0 && (
                      <Box className="mb-3">
                        <Typography variant="caption" className="text-gray-500 block mb-1">
                          Players:
                        </Typography>
                        <Box className="flex flex-wrap gap-1">
                          {game.players.map((player) => (
                            <Box
                              key={player.id}
                              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                            >
                              <div
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: player.color }}
                              />
                              <span>{player.name}</span>
                              {player.isHost && (
                                <span className="text-xs text-gray-500">(Host)</span>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {!game.isPublic && (
                      <Chip
                        label="Private"
                        size="small"
                        variant="outlined"
                        className="mb-2"
                      />
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={game.players.length >= 2 || game.status !== GameStatus.WAITING}
                      onClick={() => handleJoinGame(game.id, game.isPublic)}
                    >
                      {game.players.length >= 2 ? 'Game Full' : 
                       game.status !== GameStatus.WAITING ? 'In Progress' : 'Join Game'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Join Private Game Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
        <DialogTitle>Join Private Game</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-4 text-gray-600">
            This is a private game. Please enter the password to join.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Game Password"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleJoinPrivateGame}
            disabled={!joinPassword.trim()}
          >
            Join Game
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game Info Dialog */}
      <Dialog 
        open={showInfo} 
        onClose={() => setShowInfo(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" className="font-bold">
            How to Play TI Chess
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" className="mb-4">
            TI Chess is a strategic game that models the evolution of technology companies
            through four levels of growth and development.
          </Typography>
          
          <Typography variant="h6" className="font-semibold mb-2">
            Piece Levels:
          </Typography>
          <Box className="mb-4 space-y-2">
            <Box>
              <strong>Talent (Level 1):</strong> Moves up to 3 squares horizontally/vertically
            </Box>
            <Box>
              <strong>Leader (Level 2):</strong> Moves up to 2 squares diagonally
            </Box>
            <Box>
              <strong>Strategist (Level 3):</strong> Moves any distance in straight lines or diagonally
            </Box>
            <Box>
              <strong>Investor (Level 4):</strong> Moves 1 square in any direction, can transform adjacent pieces
            </Box>
          </Box>

          <Typography variant="h6" className="font-semibold mb-2">
            Win Condition:
          </Typography>
          <Typography variant="body1" className="mb-4">
            Eliminate all of your opponent's Investor pieces through strategic transformations and captures.
          </Typography>

          <Typography variant="h6" className="font-semibold mb-2">
            Transformations:
          </Typography>
          <Typography variant="body1">
            Pieces evolve when they accumulate enough transformation points through captures,
            special abilities, and reaching board edges.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInfo(false)}>Got it!</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LobbyPage;