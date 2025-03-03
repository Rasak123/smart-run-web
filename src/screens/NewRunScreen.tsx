import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  GpsFixed,
  DirectionsRun,
  DirectionsWalk,
} from '@mui/icons-material';
import {
  MapContainer,
  TileLayer,
  useMap,
  Polyline,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { StorageService } from '../services/StorageService';
import { HealthKitService } from '../services/HealthKitService';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const darkMapStyle = {
  filter: 'brightness(0.8) invert(1) contrast(1.2) hue-rotate(180deg) saturate(0.8)'
};

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  speed: number;
}

interface Run {
  id: string;
  date: string;
  distance: number;
  duration: number;
  averagePace: number;
  calories: number;
  locations: Location[];
  heartRates: number[];
}

function MapComponent({ center, locations }: { center: [number, number], locations: Location[] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        className="map-tiles"
      />
      {locations.length > 1 && (
        <Polyline
          positions={locations.map(loc => [loc.latitude, loc.longitude])}
          color="#FC5200"
          weight={4}
          opacity={0.8}
        />
      )}
    </>
  );
}

export default function NewRunScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activityType, setActivityType] = useState<'walk' | 'run'>('run');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [calories, setCalories] = useState(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([25.2048, 55.2708]); // Default to Dubai
  const [hasGPS, setHasGPS] = useState(false);
  const [dailyGoal, setDailyGoal] = useState({ current: 0, target: 5 }); // 5km daily goal
  const [prevDistance, setPrevDistance] = useState(0);
  const [heartRates, setHeartRates] = useState<number[]>([]);
  const [healthKitAuthorized, setHealthKitAuthorized] = useState(false);
  const healthKit = HealthKitService.getInstance();

  const watchId = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Request GPS permission and get initial location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          setHasGPS(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setHasGPS(false);
        }
      );
    }

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Request HealthKit authorization when component mounts
    if (healthKit.isHealthKitAvailable()) {
      healthKit.requestAuthorization().then(authorized => {
        setHealthKitAuthorized(authorized);
        if (authorized) {
          // Vibrate to indicate successful authorization
          if (navigator.vibrate) {
            navigator.vibrate([50]);
          }
        }
      });
    }
  }, []);

  const startRun = () => {
    if (!hasGPS) {
      // Vibrate to indicate GPS is required
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      alert('GPS signal required to start activity');
      return;
    }

    setIsRunning(true);
    startTimeRef.current = Date.now();

    // Request high accuracy GPS
    const gpsOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    // Start location tracking with improved accuracy
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0
        };
        
        // Only add location if accuracy is good enough (< 20 meters)
        if (newLocation.accuracy < 20) {
          setLocations(prev => {
            // Filter out any points that are obviously wrong (too far from last point)
            if (prev.length > 0) {
              const lastLoc = prev[prev.length - 1];
              const distance = calculateDistance(
                lastLoc.latitude,
                lastLoc.longitude,
                newLocation.latitude,
                newLocation.longitude
              );
              
              // If distance is more than 100m in 1 second, likely a GPS error
              if (distance > 0.1 && (newLocation.timestamp - lastLoc.timestamp) < 1000) {
                return prev;
              }
            }
            return [...prev, newLocation];
          });

          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          
          // Vibrate slightly to indicate lap completion every kilometer
          if (navigator.vibrate && Math.floor(distance) > Math.floor(prevDistance)) {
            navigator.vibrate(100);
          }
          
          // Calculate new distance and update pace
          if (locations.length > 0) {
            const lastLoc = locations[locations.length - 1];
            const newDist = calculateDistance(
              lastLoc.latitude,
              lastLoc.longitude,
              newLocation.latitude,
              newLocation.longitude
            );
            setDistance(prev => {
              const updated = prev + newDist;
              setPrevDistance(updated);
              // Update calories (using more accurate formula)
              const weight = Number(localStorage.getItem('userWeight')) || 70; // kg
              const caloriesPerKm = weight * 0.9; // approximate calories burned per km
              setCalories(Math.round(Number(updated) * caloriesPerKm));
              return updated;
            });
          }
        }
      },
      (error) => {
        console.error('Error watching location:', error);
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]); // Error vibration pattern
        }
      },
      gpsOptions
    );
  };

  const stopRun = async () => {
    if (!isRunning) return;
    
    setIsRunning(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Save run data
    const runData: Run = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      distance,
      duration: time,
      averagePace: pace,
      calories,
      locations,
      heartRates
    };

    try {
      // Save to local storage
      await StorageService.saveRun(runData);

      // Save to HealthKit if available and authorized
      if (healthKitAuthorized) {
        const workoutData = {
          startDate: new Date(Date.now() - time * 1000),
          endDate: new Date(),
          distance,
          calories,
          heartRates
        };
        
        const saved = await healthKit.saveWorkout(workoutData);
        if (saved) {
          // Vibrate to indicate successful sync
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
        }
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving run:', error);
      alert('Error saving run data');
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number): string => {
    if (!pace || pace === Infinity) return '00:00';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      position: 'relative'
    }}>
      {/* Map Container */}
      <Box sx={{ 
        height: '60%', 
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          center={currentLocation}
          zoom={16}
          zoomControl={false}
        >
          <MapComponent center={currentLocation} locations={locations} />
        </MapContainer>
        
        {/* GPS Status Overlay */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <GpsFixed color={hasGPS ? "success" : "error"} />
          <Typography variant="body2" color="text.secondary">
            {hasGPS ? "GPS Ready" : "Acquiring GPS..."}
          </Typography>
        </Paper>
      </Box>

      {/* Stats and Controls */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        padding: 3,
        gap: 3
      }}>
        {/* Stats Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2
        }}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3
          }}>
            <Typography variant="h4" color="primary">
              {distance.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Distance (km)
            </Typography>
          </Paper>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3
          }}>
            <Typography variant="h4" color="primary">
              {formatTime(time)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Duration
            </Typography>
          </Paper>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          mt: 'auto'
        }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => setActivityType('walk')}
            startIcon={<DirectionsWalk />}
            sx={{
              py: 2,
              borderRadius: 3,
              bgcolor: activityType === 'walk' ? 'primary.main' : 'background.paper',
              color: activityType === 'walk' ? 'white' : 'text.primary'
            }}
          >
            Walk
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => setActivityType('run')}
            startIcon={<DirectionsRun />}
            sx={{
              py: 2,
              borderRadius: 3,
              bgcolor: activityType === 'run' ? 'primary.main' : 'background.paper',
              color: activityType === 'run' ? 'white' : 'text.primary'
            }}
          >
            Run
          </Button>
        </Box>

        {/* Start/Stop Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={isRunning ? stopRun : startRun}
          disabled={!hasGPS}
          sx={{
            py: 3,
            borderRadius: 3,
            bgcolor: isRunning ? 'error.main' : 'success.main',
            '&:hover': {
              bgcolor: isRunning ? 'error.dark' : 'success.dark',
            }
          }}
        >
          {isRunning ? (
            <>
              <Stop sx={{ mr: 1 }} />
              Stop Activity
            </>
          ) : (
            <>
              <PlayArrow sx={{ mr: 1 }} />
              Start Activity
            </>
          )}
        </Button>
      </Box>
    </Box>
  );
}
