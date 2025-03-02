import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  DirectionsRun,
  Timer,
  Speed,
  TrendingUp,
  MoreVert,
} from '@mui/icons-material';
import { StorageService, Run } from '../services/StorageService';
import ActivityFeed from '../components/social/ActivityFeed';

interface Stats {
  totalRuns: number;
  totalDistance: number;
  totalDuration: number;
  averagePace: number;
  longestRun: number;
  fastestPace: number;
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalRuns: 0,
    totalDistance: 0,
    totalDuration: 0,
    averagePace: 0,
    longestRun: 0,
    fastestPace: 0
  });
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedStats, fetchedRuns] = await Promise.all([
          StorageService.getStatistics(),
          StorageService.getRuns()
        ]);
        setStats(fetchedStats);
        setRecentRuns(fetchedRuns.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatPace = (pace: number) => {
    if (!pace || pace === Infinity) return '--:--';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready for your next run?
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.main' }}>U</Avatar>
      </Box>

      {/* Quick Start Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<DirectionsRun />}
        onClick={() => navigate('/activity')}
        sx={{
          mb: 3,
          py: 2,
          fontSize: '1.1rem',
        }}
      >
        Start Activity
      </Button>

      {/* Stats Overview */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Your Progress
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Distance
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
              {stats.totalDistance.toFixed(1)} km
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Time
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
              {formatTime(stats.totalDuration)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Runs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recent Runs</Typography>
        <Button
          size="small"
          onClick={() => navigate('/history')}
          sx={{ color: 'primary.main' }}
        >
          View All
        </Button>
      </Box>
      {recentRuns.map((run) => (
        <Paper
          key={run.id}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover',
              cursor: 'pointer',
            },
          }}
          onClick={() => navigate('/history')}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {formatDate(run.date)}
            </Typography>
            <IconButton size="small">
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Timer sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  {formatTime(run.duration)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Distance
                </Typography>
                <Typography variant="body1">
                  {run.distance.toFixed(1)} km
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Speed sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pace
                </Typography>
                <Typography variant="body1">
                  {formatPace(run.averagePace)}/km
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}

      {recentRuns.length === 0 && (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <Typography color="text.secondary">
            No runs recorded yet. Start your first run!
          </Typography>
        </Paper>
      )}

      {/* Activity Feed */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <ActivityFeed />
      </Box>
    </Box>
  );
}
