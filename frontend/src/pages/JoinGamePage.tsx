import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import { JoinGameRequest } from '@/types';
import gameService from '@/services/gameService';

const JoinGamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JoinGameRequest>({
    playerName: '',
    color: '#4ecdc4',
    password: location.state?.password || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof JoinGameRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, color: event.target.value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    } else if (formData.playerName.length < 2) {
      newErrors.playerName = 'Name must be at least 2 characters';
    } else if (formData.playerName.length > 50) {
      newErrors.playerName = 'Name must be less than 50 characters';
    }

    // Validate color format
    if (!formData.color || !formData.color.match(/^#[0-9A-F]{6}$/i)) {
      newErrors.color = 'Please select a valid color';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!gameId) {
      toast.error('No game ID provided');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await gameService.joinGame(gameId, formData);
      
      // Store player credentials
      localStorage.setItem('playerId', result.playerId);
      localStorage.setItem('playerToken', result.playerToken);
      
      toast.success('Successfully joined game!');
      
      // Navigate to the game
      navigate(`/play/${gameId}`);
      
    } catch (error: any) {
      console.error('Failed to join game:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData.error) {
          toast.error(errorData.error);
        } else if (typeof errorData === 'object') {
          setErrors(errorData);
        } else {
          toast.error('Failed to join game. Please check your input.');
        }
      } else if (error.response?.status === 404) {
        toast.error('Game not found');
        navigate('/');
      } else {
        toast.error('Failed to join game. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const generateRandomColor = () => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
      '#10ac84', '#ee5a24', '#0abde3', '#3742fa', '#2f3542'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setFormData(prev => ({ ...prev, color: randomColor }));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box className="mb-6">
        <Box className="flex items-center gap-2 mb-4">
          <IconButton 
            onClick={handleBack}
            sx={{ color: 'white' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="text-white font-bold">
            Join Game
          </Typography>
        </Box>
        
        <Typography variant="body1" className="text-white/80">
          Enter your details to join the TI Chess battle.
        </Typography>
      </Box>

      <Card sx={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <CardContent sx={{ p: 4 }}>
          {!gameId && (
            <Alert severity="error" className="mb-4">
              No game ID provided. Please select a game from the lobby.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Player Name */}
            <TextField
              fullWidth
              label="Your Name"
              value={formData.playerName}
              onChange={handleInputChange('playerName')}
              error={!!errors.playerName}
              helperText={errors.playerName}
              placeholder="Enter your display name"
              required
            />

            {/* Color Selection */}
            <Box>
              <Typography variant="body2" className="mb-2 font-medium">
                Choose Your Color:
              </Typography>
              <Box className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={handleColorChange}
                  className="w-16 h-12 rounded border-2 border-gray-300 cursor-pointer"
                />
                <Box className="flex-1">
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.color}
                    onChange={handleColorChange}
                    placeholder="#4ecdc4"
                    error={!!errors.color}
                    helperText={errors.color}
                  />
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={generateRandomColor}
                >
                  Random
                </Button>
              </Box>
            </Box>

            {/* Password (if needed) */}
            {formData.password !== undefined && (
              <TextField
                fullWidth
                type="password"
                label="Game Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password}
                placeholder="Enter the game password"
              />
            )}

            {/* Color Preview */}
            <Box className="bg-gray-50 p-4 rounded-lg">
              <Typography variant="body2" className="font-medium mb-2">
                Preview:
              </Typography>
              <Box className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: formData.color }}
                />
                <Typography variant="body2">
                  {formData.playerName || 'Your Name'} - {formData.color}
                </Typography>
              </Box>
            </Box>

            {/* Form Actions */}
            <Box className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outlined"
                onClick={handleBack}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !gameId}
                sx={{ flex: 2 }}
              >
                {loading ? 'Joining Game...' : 'Join Game'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card 
        sx={{ 
          mt: 3, 
          background: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <CardContent>
          <Typography variant="h6" className="text-white font-semibold mb-2">
            🎮 Game Tips
          </Typography>
          <ul className="text-white/90 text-sm space-y-1">
            <li>• Choose a unique color that represents your strategy</li>
            <li>• Make sure your name is memorable for your opponent</li>
            <li>• The game will start once both players are ready</li>
            <li>• You can reconnect if your connection drops</li>
          </ul>
        </CardContent>
      </Card>
    </Container>
  );
};

export default JoinGamePage;