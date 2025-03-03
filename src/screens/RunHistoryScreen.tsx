import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, IconButton, Paper, Grid, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Delete, Map, Timer, Speed, TrendingUp } from '@mui/icons-material';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { StorageService, Run } from '../services/StorageService';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

export default function RunHistoryScreen() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const savedRuns = await StorageService.getRuns();
      setRuns(savedRuns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading runs:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await StorageService.deleteRun(id);
      loadRuns();
    } catch (error) {
      console.error('Error deleting run:', error);
    }
  };

  const handleViewMap = (run: Run) => {
    setSelectedRun(run);
    setMapOpen(true);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPace = (pace: number): string => {
    if (!pace || pace === Infinity) return '--:--';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Run History</Typography>
      {runs.map((run) => (
        <Paper
          key={run.id}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">
              {formatDate(run.date)}
            </Typography>
            <Box>
              <IconButton
                size="small"
                onClick={() => handleViewMap(run)}
                color="primary"
              >
                <Map />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(run.id)}
                color="error"
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Timer sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(run.duration)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Distance
                  </Typography>
                  <Typography variant="body1">
                    {run.distance.toFixed(2)} km
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Speed sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pace
                  </Typography>
                  <Typography variant="body1">
                    {formatPace(run.averagePace)}/km
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}
      {runs.length === 0 && (
        <Typography color="text.secondary" align="center">
          No runs recorded yet
        </Typography>
      )}
      <Dialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRun && formatDate(selectedRun.date)}
        </DialogTitle>
        <DialogContent>
          {selectedRun && selectedRun.locations.length > 0 && (
            <MapContainer
              style={mapContainerStyle}
              center={[selectedRun.locations[0].latitude, selectedRun.locations[0].longitude]}
              zoom={15}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Polyline
                positions={selectedRun.locations.map(loc => [loc.latitude, loc.longitude])}
                color="#FC5200"
                weight={3}
              />
            </MapContainer>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
