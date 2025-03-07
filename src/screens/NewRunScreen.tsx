import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Typography, IconButton, Paper, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DirectionsWalk, DirectionsRun, PlayArrow, Stop, MyLocation, Navigation } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Map, Source, Layer, Marker, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '../types';

// Replace with your Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoicmFzYWsxMjMiLCJhIjoiY2t0NnhvYjB2MHJtMzJwbXNsdXRqOGZrbiJ9.tHekVv3YAGQwCXGm3RWePQ';

interface Stats {
  distance: number;
  pace: string;
  duration: string;
  calories: number;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

const routeLayer = {
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  },
  paint: {
    'line-color': '#FC5200',
    'line-width': 4
  }
} as const;

export default function NewRunScreen() {
  const navigate = useNavigate();
  const [activityType, setActivityType] = useState<'walk' | 'run'>('run');
  const [isActive, setIsActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [routePoints, setRoutePoints] = useState<Location[]>([]);
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 55.2708, // Default to Dubai
    latitude: 25.2048,
    zoom: 15,
    bearing: 0,
    pitch: 45
  });
  const [stats, setStats] = useState<Stats>({
    distance: 0,
    pace: '0:00',
    duration: '00:00:00',
    calories: 0
  });

  const watchId = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
        setCurrentLocation(newLocation);
        setViewState(prev => ({
          ...prev,
          longitude: newLocation[0],
          latitude: newLocation[1]
        }));
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const updateStats = (newLocation: Location) => {
    if (routePoints.length > 0) {
      const lastPoint = routePoints[routePoints.length - 1];
      const newDistance = calculateDistance(
        lastPoint.lat,
        lastPoint.lng,
        newLocation.lat,
        newLocation.lng
      );

      setStats(prev => {
        const totalDistance = prev.distance + newDistance;
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const pace = duration / 60 / totalDistance;
        const paceMinutes = Math.floor(pace);
        const paceSeconds = Math.floor((pace - paceMinutes) * 60);
        const calories = Math.round(totalDistance * (activityType === 'run' ? 65 : 40));

        return {
          distance: totalDistance,
          pace: `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`,
          duration: new Date(duration * 1000).toISOString().substr(11, 8),
          calories
        };
      });
    }
  };

  const handleStart = () => {
    if (!currentLocation) {
      alert('Waiting for GPS signal...');
      return;
    }

    setIsActive(true);
    startTimeRef.current = Date.now();

    // Start location tracking
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp
        };

        setRoutePoints(prev => [...prev, newLocation]);
        updateStats(newLocation);
        
        // Update map view to follow user
        setViewState(prev => ({
          ...prev,
          longitude: newLocation.lng,
          latitude: newLocation.lat
        }));
      },
      (error) => {
        console.error('Error:', error);
        alert('Error tracking location. Please check GPS permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Start timer
    timerRef.current = setInterval(() => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      setStats(prev => ({
        ...prev,
        duration: new Date(duration * 1000).toISOString().substr(11, 8)
      }));
    }, 1000);
  };

  const handleStop = () => {
    setIsActive(false);
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Navigate to summary screen
    navigate('/summary', { 
      state: { 
        ...stats,
        routePoints,
        activityType,
        date: new Date()
      } 
    });
  };

  const centerOnUser = useCallback(() => {
    if (currentLocation) {
      setViewState(prev => ({
        ...prev,
        longitude: currentLocation[0],
        latitude: currentLocation[1],
        zoom: 16
      }));
    }
  }, [currentLocation]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Activity Type Selection */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 1,
          borderRadius: 0
        }}
      >
        <ToggleButtonGroup
          value={activityType}
          exclusive
          onChange={(_, newValue) => newValue && setActivityType(newValue)}
          aria-label="activity type"
          fullWidth
        >
          <ToggleButton value="walk" aria-label="walk">
            <DirectionsWalk sx={{ mr: 1 }} />
            Walk
          </ToggleButton>
          <ToggleButton value="run" aria-label="run">
            <DirectionsRun sx={{ mr: 1 }} />
            Run
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Map */}
      <Box sx={{ flex: 1, position: 'relative', minHeight: '60vh' }}>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          ref={mapRef}
        >
          {routePoints.length > 0 && (
            <Source
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: routePoints.map(point => [point.lng, point.lat])
                }
              }}
            >
              <Layer {...routeLayer} />
            </Source>
          )}
          {currentLocation && (
            <Marker
              longitude={currentLocation[0]}
              latitude={currentLocation[1]}
              anchor="center"
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: 2
                }}
              />
            </Marker>
          )}
        </Map>

        {/* Map Controls */}
        <Box sx={{ position: 'absolute', right: 16, bottom: 100 }}>
          <IconButton
            onClick={centerOnUser}
            sx={{
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <Navigation />
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Distance</Typography>
            <Typography variant="h6">{stats.distance.toFixed(2)}km</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Pace</Typography>
            <Typography variant="h6">{stats.pace}/km</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Duration</Typography>
            <Typography variant="h6">{stats.duration}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Calories</Typography>
            <Typography variant="h6">{stats.calories}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Button */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={isActive ? handleStop : handleStart}
          startIcon={isActive ? <Stop /> : <PlayArrow />}
          color={isActive ? 'error' : 'primary'}
        >
          {isActive ? 'Stop Activity' : 'Start Activity'}
        </Button>
      </Box>
    </Box>
  );
}
