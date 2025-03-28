import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Typography, IconButton, Paper, Grid, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import { DirectionsWalk, DirectionsRun, PlayArrow, Stop, MyLocation } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import { defaults as defaultControls } from 'ol/control';
import { Location } from '../types';

interface Stats {
  distance: number;
  pace: string;
  duration: string;
  calories: number;
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
  const [isLoading, setIsLoading] = useState(true);

  const watchId = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const mapRef = useRef<Map | null>(null);
  const mapElement = useRef<HTMLDivElement>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const locationFeatureRef = useRef<Feature<Point> | null>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    // Initialize map
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#3388ff',
          width: 4
        }),
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#3388ff' }),
          stroke: new Stroke({
            color: 'white',
            width: 2
          })
        })
      })
    });

    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      controls: defaultControls({
        zoom: true,
        rotate: false,
        attribution: false
      }),
      view: new View({
        center: fromLonLat([55.2708, 25.2048]), // Dubai
        zoom: 15
      })
    });

    mapRef.current = map;

    // Get initial location
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setCurrentLocation(coords);
        
        const location = fromLonLat(coords);
        map.getView().setCenter(location);

        // Create location feature
        const locationFeature = new Feature({
          geometry: new Point(location)
        });
        locationFeatureRef.current = locationFeature;
        vectorSource.addFeature(locationFeature);

        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoading(false);
        alert('Error getting location. Please check your GPS permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
      }
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

        setRoutePoints(prev => {
          const updatedPoints = [...prev, newLocation];
          
          // Update route on map
          if (vectorSourceRef.current && updatedPoints.length > 1) {
            const coordinates = updatedPoints.map(point => 
              fromLonLat([point.lng, point.lat])
            );
            
            const routeFeature = new Feature({
              geometry: new LineString(coordinates)
            });
            
            vectorSourceRef.current.clear();
            vectorSourceRef.current.addFeature(routeFeature);
            
            if (locationFeatureRef.current) {
              vectorSourceRef.current.addFeature(locationFeatureRef.current);
            }
          }
          
          return updatedPoints;
        });

        // Update location marker
        if (locationFeatureRef.current) {
          const location = fromLonLat([newLocation.lng, newLocation.lat]);
          locationFeatureRef.current.getGeometry()?.setCoordinates(location);
        }

        // Update map view
        if (mapRef.current) {
          mapRef.current.getView().setCenter(fromLonLat([newLocation.lng, newLocation.lat]));
        }

        updateStats(newLocation);
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
    if (mapRef.current && currentLocation) {
      mapRef.current.getView().setCenter(fromLonLat(currentLocation));
      mapRef.current.getView().setZoom(16);
    }
  }, [currentLocation]);

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography>Getting your location...</Typography>
      </Box>
    );
  }

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
        <div ref={mapElement} style={{ width: '100%', height: '100%' }} />
        
        {/* Map Controls */}
        <Box sx={{ position: 'absolute', right: 16, bottom: 100 }}>
          <IconButton
            onClick={centerOnUser}
            sx={{
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <MyLocation />
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
