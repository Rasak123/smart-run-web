import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Button, Divider } from '@mui/material';
import { DirectionsWalk, DirectionsRun, Share, Save } from '@mui/icons-material';
import Map, { Source, Layer } from 'react-map-gl';
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
  const viewState = {
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

  const handleSave = () => {
    // TODO: Save activity to storage
    navigate('/history');
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {activity.activityType === 'run' ? <DirectionsRun /> : <DirectionsWalk />}
        <Typography variant="h5" component="h1">
          Activity Summary
        </Typography>
      </Box>

      {/* Map */}
      <Paper sx={{ flex: 1, overflow: 'hidden', borderRadius: 2 }}>
        <Map
          {...viewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
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
      </Paper>

      {/* Stats */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Distance</Typography>
            <Typography variant="h5">{activity.distance.toFixed(2)} km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Duration</Typography>
            <Typography variant="h5">{activity.duration}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Avg. Pace</Typography>
            <Typography variant="h5">{activity.pace} /km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Calories</Typography>
            <Typography variant="h5">{activity.calories}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Additional Stats */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Elevation Gain</Typography>
            <Typography variant="h6">127m</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Avg. Heart Rate</Typography>
            <Typography variant="h6">142 bpm</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Temperature</Typography>
            <Typography variant="h6">24°C</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Actions */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save Activity
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Share />}
            onClick={handleShare}
          >
            Share
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
