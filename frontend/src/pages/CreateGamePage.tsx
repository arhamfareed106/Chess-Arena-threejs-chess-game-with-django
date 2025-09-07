import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import { CreateGameRequest } from '@/types';
import gameService from '@/services/gameService';

const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<CreateGameRequest>({
    name: '',
    isPublic: true,
    password: '',
    hostName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateGameRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hostName.trim()) {
      newErrors.hostName = 'Your name is required';
    } else if (formData.hostName.length < 2) {
      newErrors.hostName = 'Name must be at least 2 characters';
    } else if (formData.hostName.length > 50) {
      newErrors.hostName = 'Name must be less than 50 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Game name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Game name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Game name must be less than 100 characters';
    }

    if (!formData.isPublic && !formData.password?.trim()) {
      newErrors.password = 'Password is required for private games';
    } else if (!formData.isPublic && formData.password && formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const gameData = {
        ...formData,
        // Remove password if public game
        password: formData.isPublic ? undefined : formData.password,
      };

      const game = await gameService.createGame(gameData);
      
      toast.success('Game created successfully!');
      
      // Navigate to the game page
      navigate(`/play/${game.id}`);
      
    } catch (error: any) {
      console.error('Failed to create game:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          setErrors(errorData);
        } else {
          toast.error('Please check your input and try again.');
        }
      } else {
        toast.error('Failed to create game. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
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
            Create New Game
          </Typography>
        </Box>
        
        <Typography variant="body1" className="text-white/80">
          Set up your TI Chess game and invite another player to join the strategic battle.
        </Typography>
      </Box>

      <Card sx={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Host Name */}
            <TextField
              fullWidth
              label="Your Name"
              value={formData.hostName}
              onChange={handleInputChange('hostName')}
              error={!!errors.hostName}
              helperText={errors.hostName}
              placeholder="Enter your display name"
              required
            />

            {/* Game Name */}
            <TextField
              fullWidth
              label="Game Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="Enter a name for your game"
              required
            />

            {/* Public/Private Toggle */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={handleInputChange('isPublic')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      {formData.isPublic ? 'Public Game' : 'Private Game'}
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      {formData.isPublic 
                        ? 'Anyone can see and join this game'
                        : 'Only players with the password can join'
                      }
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {/* Password (for private games) */}
            {!formData.isPublic && (
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Game Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password || 'Players will need this password to join'}
                placeholder="Enter a password for your game"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Game Rules Summary */}
            <Box className="bg-blue-50 p-4 rounded-lg">
              <Typography variant="body2" className="font-medium mb-2">
                Game Rules Summary:
              </Typography>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 2 players take turns moving pieces on an 8×8 board</li>
                <li>• Pieces evolve from Talent → Leader → Strategist → Investor</li>
                <li>• Win by eliminating all opponent Investor pieces</li>
                <li>• Each piece type has unique movement and special abilities</li>
              </ul>
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
                disabled={loading}
                sx={{ flex: 2 }}
              >
                {loading ? 'Creating Game...' : 'Create Game'}
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
            💡 Pro Tips
          </Typography>
          <ul className="text-white/90 text-sm space-y-1">
            <li>• Choose a descriptive game name to attract players</li>
            <li>• Private games are great for playing with friends</li>
            <li>• Share the game link and password with your opponent</li>
            <li>• Games auto-delete after 24 hours of inactivity</li>
          </ul>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateGamePage;