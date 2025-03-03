import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Paper, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { DirectionsWalk, DirectionsRun, PlayArrow, Stop, MyLocation } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';

interface Stats {
  distance: number;
  pace: string;
  duration: string;
  calories: number;
}

function MapController() {
  const map = useMap();
  
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}

export default function NewRunScreen() {
  const [activityType, setActivityType] = useState<'walk' | 'run'>('run');
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState<Stats>({
    distance: 0,
    pace: '0:00',
    duration: '00:00:00',
    calories: 0
  });

  const handleLocationError = (error: GeolocationPositionError) => {
    console.error('Error getting location:', error);
  };

  const handleStart = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsActive(true);
          // Start tracking logic here
        },
        handleLocationError,
        { enableHighAccuracy: true }
      );
    }
  };

  const handleStop = () => {
    setIsActive(false);
    // Stop tracking logic here
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Activity Type Selection */}
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 1000,
          borderRadius: 3,
          padding: 1
        }}
      >
        <ToggleButtonGroup
          value={activityType}
          exclusive
          onChange={(_, newValue) => newValue && setActivityType(newValue)}
          aria-label="activity type"
        >
          <ToggleButton value="walk" aria-label="walk">
            <DirectionsWalk />
            <Typography sx={{ ml: 1 }}>Walk</Typography>
          </ToggleButton>
          <ToggleButton value="run" aria-label="run">
            <DirectionsRun />
            <Typography sx={{ ml: 1 }}>Run</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Map */}
      <Box sx={{ flex: 1, width: '100%', position: 'relative' }}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController />
        </MapContainer>

        {/* Location Button */}
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 100,
            right: 16,
            backgroundColor: 'background.paper',
            '&:hover': { backgroundColor: 'background.paper' }
          }}
          onClick={() => {/* Center map on current location */}}
        >
          <MyLocation />
        </IconButton>
      </Box>

      {/* Stats Panel */}
      <Paper 
        sx={{ 
          padding: 2,
          borderRadius: '24px 24px 0 0',
          backgroundColor: 'background.paper'
        }}
        elevation={3}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Distance</Typography>
            <Typography variant="h6">{stats.distance.toFixed(2)} km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Pace</Typography>
            <Typography variant="h6">{stats.pace} /km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Duration</Typography>
            <Typography variant="h6">{stats.duration}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Calories</Typography>
            <Typography variant="h6">{stats.calories}</Typography>
          </Grid>
        </Grid>

        {/* Start/Stop Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={isActive ? handleStop : handleStart}
            startIcon={isActive ? <Stop /> : <PlayArrow />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              backgroundColor: isActive ? 'error.main' : 'primary.main',
              '&:hover': {
                backgroundColor: isActive ? 'error.dark' : 'primary.dark',
              }
            }}
          >
            {isActive ? 'Stop Activity' : 'Start Activity'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
