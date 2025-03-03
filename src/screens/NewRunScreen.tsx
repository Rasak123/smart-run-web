import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  MusicNote,
  Settings,
  GpsFixed,
  EmojiEvents,
  FavoriteBorder,
} from '@mui/icons-material';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { StorageService } from '../services/StorageService';
import { HealthKitService } from '../services/HealthKitService';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

function MapComponent({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function NewRunScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const activityType = location.state?.activityType || 'run';
  const goalType = location.state?.goalType;

  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [pace, setPace] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([25.2048, 55.2708]); // Default to Dubai
  const [hasGPS, setHasGPS] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with GPS indicator */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <Box sx={{ position: 'absolute', right: 16, top: 16, display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mr: 0.5 }}>GPS</Typography>
          <GpsFixed color={hasGPS ? "success" : "error"} />
        </Box>
      </Box>

      {/* Timer and Stats */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ 
          fontSize: '4rem', 
          fontFamily: 'monospace',
          fontWeight: 'bold',
          mb: 3
        }}>
          {formatTime(time)}
        </Typography>
        <Typography variant="caption" color="text.secondary">Duration</Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 4,
          px: 2
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{distance.toFixed(2)}</Typography>
            <Typography variant="caption" color="text.secondary">Distance (km)</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{calories}</Typography>
            <Typography variant="caption" color="text.secondary">Calories (cal)</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">{formatPace(pace)}</Typography>
            <Typography variant="caption" color="text.secondary">Avg. Pace (min/km)</Typography>
          </Box>
        </Box>
      </Box>

      {/* Map */}
      <Box sx={{ flex: 1, position: 'relative', minHeight: '40vh' }}>
        <MapContainer
          center={currentLocation}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={currentLocation} />
          <MapComponent center={currentLocation} />
        </MapContainer>

        {/* Daily Goal Overlay */}
        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            p: 1,
            borderRadius: 2,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <EmojiEvents sx={{ mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption">Today</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2">{dailyGoal.current.toFixed(1)}/{dailyGoal.target} km</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(dailyGoal.current / dailyGoal.target) * 100}
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Bottom Controls */}
      <Paper 
        sx={{ 
          p: 2,
          borderRadius: '20px 20px 0 0',
          bgcolor: 'background.paper',
        }}
        elevation={3}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <IconButton>
            <MusicNote />
          </IconButton>
          <IconButton>
            <Settings />
          </IconButton>
        </Box>

        {healthKit.isHealthKitAvailable() && !healthKitAuthorized && (
          <Button
            variant="outlined"
            startIcon={<FavoriteBorder />}
            onClick={() => healthKit.requestAuthorization()}
            sx={{ mb: 2 }}
          >
            Connect Apple Health
          </Button>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={isRunning ? <Stop /> : <PlayArrow />}
          onClick={isRunning ? stopRun : startRun}
          sx={{
            py: 2,
            bgcolor: isRunning ? 'error.main' : 'primary.main',
            '&:hover': {
              bgcolor: isRunning ? 'error.dark' : 'primary.dark',
            },
          }}
        >
          {isRunning ? 'STOP' : `START ${activityType.toUpperCase()}`}
        </Button>
      </Paper>
    </Box>
  );
}
