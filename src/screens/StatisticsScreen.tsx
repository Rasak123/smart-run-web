import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { StorageService } from '../services/StorageService';

interface Stats {
  totalRuns: number;
  totalDistance: number;
  totalDuration: number;
  averagePace: number;
  longestRun: number;
  fastestPace: number;
}

export default function StatisticsScreen() {
  const [stats, setStats] = useState<Stats>({
    totalRuns: 0,
    totalDistance: 0,
    totalDuration: 0,
    averagePace: 0,
    longestRun: 0,
    fastestPace: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statistics = await StorageService.getStatistics();
        setStats(statistics);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatPace = (pace: number): string => {
    if (!pace || pace === Infinity) return '--:--';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading statistics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Statistics</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Runs
            </Typography>
            <Typography variant="h5">
              {stats.totalRuns}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Distance
            </Typography>
            <Typography variant="h5">
              {stats.totalDistance.toFixed(1)} km
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Time
            </Typography>
            <Typography variant="h5">
              {formatTime(stats.totalDuration)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Average Pace
            </Typography>
            <Typography variant="h5">
              {formatPace(stats.averagePace)}/km
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Longest Run
            </Typography>
            <Typography variant="h5">
              {stats.longestRun.toFixed(1)} km
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Fastest Pace
            </Typography>
            <Typography variant="h5">
              {formatPace(stats.fastestPace)}/km
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      {stats.totalRuns === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No runs recorded yet. Start running to see your statistics!
        </Typography>
      )}
    </Box>
  );
}
