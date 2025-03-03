import React from 'react';
import { Box, Button, Typography, Paper, Grid, IconButton } from '@mui/material';
import { Share, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { Location } from '../types';

interface ActivitySummaryProps {
  distance: number;
  duration: string;
  pace: string;
  calories: number;
  routePoints: Location[];
  activityType: 'walk' | 'run';
  date: Date;
}

export default function ActivitySummaryScreen({ 
  distance, 
  duration, 
  pace, 
  calories, 
  routePoints,
  activityType,
  date
}: ActivitySummaryProps) {
  const navigate = useNavigate();

  const handleSave = () => {
    // Save to storage and navigate to home
    navigate('/');
  };

  const bounds = routePoints.length > 0 
    ? routePoints.reduce(
        (bounds, point) => bounds.extend([point.lat, point.lng]),
        L.latLngBounds([routePoints[0].lat, routePoints[0].lng], [routePoints[0].lat, routePoints[0].lng])
      )
    : null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">Activity Summary</Typography>
        <IconButton>
          <Share />
        </IconButton>
      </Box>

      {/* Map */}
      <Box sx={{ height: '35%', width: '100%' }}>
        <MapContainer
          bounds={bounds || [[25.2048, 55.2708], [25.2048, 55.2708]]}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {routePoints.length > 1 && (
            <Polyline
              positions={routePoints.map(point => [point.lat, point.lng])}
              color="#FC5200"
              weight={4}
            />
          )}
        </MapContainer>
      </Box>

      {/* Stats Summary */}
      <Paper 
        sx={{ 
          flex: 1,
          mt: -3,
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden'
        }}
        elevation={3}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {activityType === 'run' ? 'Running' : 'Walking'} Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {date.toLocaleDateString()} at {date.toLocaleTimeString()}
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center' }} elevation={1}>
                <Typography variant="h4" color="primary">
                  {distance.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Distance (km)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center' }} elevation={1}>
                <Typography variant="h4" color="primary">
                  {duration}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center' }} elevation={1}>
                <Typography variant="h4" color="primary">
                  {pace}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pace (min/km)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center' }} elevation={1}>
                <Typography variant="h4" color="primary">
                  {calories}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calories
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSave}
            sx={{ mt: 4, borderRadius: 3, py: 1.5 }}
          >
            Save Activity
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
