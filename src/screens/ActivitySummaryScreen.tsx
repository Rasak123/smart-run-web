import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Button, Divider } from '@mui/material';
import { DirectionsWalk, DirectionsRun, Share, ArrowBack } from '@mui/icons-material';
import { Map, Source, Layer } from 'react-map-gl/maplibre';
import type { ViewState } from 'react-map-gl/maplibre';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '../types';

// Replace with your Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoicmFzYWsxMjMiLCJhIjoiY2t0NnhvYjB2MHJtMzJwbXNsdXRqOGZrbiJ9.tHekVv3YAGQwCXGm3RWePQ';

interface ActivityState {
  distance: number;
  pace: string;
  duration: string;
  calories: number;
  routePoints: Location[];
  activityType: 'walk' | 'run';
  date: Date;
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

export default function ActivitySummaryScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const activity = location.state as ActivityState;

  if (!activity) {
    navigate('/');
    return null;
  }

  // Calculate map bounds
  const coordinates = activity.routePoints.map(point => [point.lng, point.lat]);
  const bounds = coordinates.reduce(
    (bounds, coord) => {
      return {
        minLng: Math.min(bounds.minLng, coord[0]),
        maxLng: Math.max(bounds.maxLng, coord[0]),
        minLat: Math.min(bounds.minLat, coord[1]),
        maxLat: Math.max(bounds.maxLat, coord[1]),
      };
    },
    {
      minLng: coordinates[0][0],
      maxLng: coordinates[0][0],
      minLat: coordinates[0][1],
      maxLat: coordinates[0][1],
    }
  );

  // Add padding to bounds
  const padding = 0.01;
  const viewState: ViewState = {
    longitude: (bounds.minLng + bounds.maxLng) / 2,
    latitude: (bounds.minLat + bounds.maxLat) / 2,
    zoom: 13,
    bearing: 0,
    pitch: 45,
    padding: {
      top: padding,
      bottom: padding,
      left: padding,
      right: padding
    }
  };

  const handleShare = () => {
    // Implement share functionality
    alert('Share functionality coming soon!');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2,
          borderRadius: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activity.activityType === 'run' ? <DirectionsRun /> : <DirectionsWalk />}
          <Typography variant="h6">Activity Summary</Typography>
        </Box>
        <Button 
          startIcon={<Share />}
          onClick={handleShare}
        >
          Share
        </Button>
      </Paper>

      {/* Map */}
      <Box sx={{ flex: 1, minHeight: '40vh' }}>
        <Map
          {...viewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          interactive={false}
        >
          <Source
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: activity.routePoints.map(point => [point.lng, point.lat])
              }
            }}
          >
            <Layer {...routeLayer} />
          </Source>
        </Map>
      </Box>

      {/* Stats */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Distance</Typography>
            <Typography variant="h5">{activity.distance.toFixed(2)}km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Pace</Typography>
            <Typography variant="h5">{activity.pace}/km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Duration</Typography>
            <Typography variant="h5">{activity.duration}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Calories</Typography>
            <Typography variant="h5">{activity.calories}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
