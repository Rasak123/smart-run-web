import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, IconButton, Paper, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { MapContainer, TileLayer, useMap, Polyline, useMapEvents } from 'react-leaflet';
import { DirectionsWalk, DirectionsRun, PlayArrow, Stop, MyLocation } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../types';

interface Stats {
  distance: number;
  pace: string;
  duration: string;
  calories: number;
}

function MapController({ onLocationFound }: { onLocationFound: (location: [number, number]) => void }) {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
    map.locate();
  }, [map]);

  useMapEvents({
    locationfound: (e) => {
      const { lat, lng } = e.latlng;
      map.setView([lat, lng], 16);
      onLocationFound([lat, lng]);
    }
  });

  return null;
}

export default function NewRunScreen() {
  const navigate = useNavigate();
  const [activityType, setActivityType] = useState<'walk' | 'run'>('run');
  const [isActive, setIsActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [routePoints, setRoutePoints] = useState<Location[]>([]);
  const [stats, setStats] = useState<Stats>({
    distance: 0,
    pace: '0:00',
    duration: '00:00:00',
    calories: 0
  });

  const mapRef = useRef<L.Map | null>(null);
  const watchId = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
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
        if (mapRef.current) {
          mapRef.current.setView([newLocation.lat, newLocation.lng]);
        }
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

  const handleLocationFound = (location: [number, number]) => {
    setCurrentLocation(location);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={currentLocation || [25.2048, 55.2708]} // Default to Dubai
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapController onLocationFound={handleLocationFound} />
          {routePoints.length > 1 && (
            <Polyline
              positions={routePoints.map(point => [point.lat, point.lng])}
              color="#FC5200"
              weight={4}
            />
          )}
        </MapContainer>

        {/* Location Button */}
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 100,
            right: 16,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' }
          }}
          onClick={() => {
            if (currentLocation && mapRef.current) {
              mapRef.current.setView(currentLocation, 16);
            }
          }}
        >
          <MyLocation />
        </IconButton>
      </Box>

      {/* Stats Panel */}
      <Paper 
        sx={{ 
          padding: 2,
          borderRadius: '24px 24px 0 0',
          bgcolor: 'background.paper'
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
              bgcolor: isActive ? 'error.main' : 'primary.main',
              '&:hover': {
                bgcolor: isActive ? 'error.dark' : 'primary.dark',
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
