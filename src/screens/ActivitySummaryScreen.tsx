import React, { useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Share, ArrowBack } from '@mui/icons-material';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import { Style, Stroke } from 'ol/style';
import { Location } from '../types';

interface ActivityState {
  distance: number;
  pace: string;
  duration: string;
  calories: number;
  routePoints: Location[];
  activityType: 'walk' | 'run';
  date: string;
}

export default function ActivitySummaryScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const mapElement = useRef<HTMLDivElement>(null);
  const state = location.state as ActivityState;

  useEffect(() => {
    if (!mapElement.current || !state?.routePoints.length) return;

    const vectorSource = new VectorSource();
    
    // Create route feature
    const coordinates = state.routePoints.map(point => 
      fromLonLat([point.lng, point.lat])
    );
    
    const routeFeature = new Feature({
      geometry: new LineString(coordinates)
    });
    
    vectorSource.addFeature(routeFeature);

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#3388ff',
          width: 4
        })
      })
    });

    // Calculate bounds for the route
    const extent = vectorSource.getExtent();
    
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([
          state.routePoints[0].lng,
          state.routePoints[0].lat
        ]),
        zoom: 15
      })
    });

    // Fit view to route
    map.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      maxZoom: 18
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [state?.routePoints]);

  if (!state) {
    navigate('/');
    return null;
  }

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
        <Typography variant="h6">Activity Summary</Typography>
        <Button 
          startIcon={<Share />}
          onClick={handleShare}
        >
          Share
        </Button>
      </Paper>

      {/* Map */}
      <Box sx={{ flex: 1, minHeight: '40vh' }}>
        <div ref={mapElement} style={{ width: '100%', height: '100%' }} />
      </Box>

      {/* Stats */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Distance</Typography>
            <Typography variant="h5">{state.distance.toFixed(2)}km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Pace</Typography>
            <Typography variant="h5">{state.pace}/km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Duration</Typography>
            <Typography variant="h5">{state.duration}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Calories</Typography>
            <Typography variant="h5">{state.calories}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
