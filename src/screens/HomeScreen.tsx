import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  IconButton,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  DirectionsRun,
  TrendingUp,
  EmojiEvents,
  AddCircle,
  ArrowForward,
  LocalFireDepartment,
  Timer,
  Speed,
} from '@mui/icons-material';
import { StorageService, Run } from '../services/StorageService';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);
  const [stats, setStats] = useState({
    weeklyDistance: 0,
    monthlyDistance: 0,
    totalRuns: 0,
    avgPace: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const runs = await StorageService.getRuns();
      setRecentRuns(runs.slice(0, 3));
      
      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const weeklyRuns = runs.filter(run => new Date(run.date) > weekAgo);
      const monthlyRuns = runs.filter(run => new Date(run.date) > monthAgo);
      
      setStats({
        weeklyDistance: weeklyRuns.reduce((acc, run) => acc + run.distance, 0),
        monthlyDistance: monthlyRuns.reduce((acc, run) => acc + run.distance, 0),
        totalRuns: runs.length,
        avgPace: runs.length ? runs.reduce((acc, run) => acc + run.averagePace, 0) / runs.length : 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const formatPace = (pace: number): string => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      p: 3,
      gap: 3,
    }}>
      {/* Header with Profile */}
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Let's crush today's goals!
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
          <DirectionsRun />
        </Avatar>
      </Box>

      {/* Quick Start Card */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #FC5200 0%, #FF7433 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Ready for Your Next Run?
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/run')}
            sx={{
              bgcolor: 'white',
              color: '#FC5200',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              },
              borderRadius: 2,
            }}
            endIcon={<ArrowForward />}
          >
            Start Running
          </Button>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            opacity: 0.2,
            transform: 'rotate(-15deg)',
          }}
        >
          <DirectionsRun sx={{ fontSize: 120 }} />
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalFireDepartment color="error" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                This Week
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold">
              {stats.weeklyDistance.toFixed(1)} km
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Timer color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Avg Pace
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold">
              {formatPace(stats.avgPace)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Recent Activities
        </Typography>
        {recentRuns.map((run) => (
          <Paper
            key={run.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => navigate(`/history?run=${run.id}`)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DirectionsRun color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(run.date)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {run.distance.toFixed(2)} km
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPace(run.averagePace)} /km
                </Typography>
              </Box>
              <IconButton size="small">
                <ArrowForward />
              </IconButton>
            </Box>
          </Paper>
        ))}
        {recentRuns.length === 0 && (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              textAlign: 'center',
              bgcolor: 'action.hover',
            }}
          >
            <AddCircle sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              No activities yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Start your first run to track your progress
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/run')}
              endIcon={<ArrowForward />}
            >
              Start Now
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
