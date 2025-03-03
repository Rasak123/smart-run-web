import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, IconButton, Tabs, Tab, Button } from '@mui/material';
import { 
  DirectionsRun, 
  CalendarMonth, 
  Timeline, 
  Map, 
  EmojiEvents, 
  LocalFireDepartment,
  Speed,
  Timer,
  Share,
  Favorite,
  Comment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Placeholder data - replace with real data from your storage service
const mockActivities = [
  {
    id: 1,
    type: 'run',
    date: '2025-03-03',
    distance: 5.2,
    duration: 1800, // in seconds
    pace: 5.45,
    calories: 450,
    elevation: 125,
    likes: 5,
    comments: 2,
    route: 'path_to_map_image.jpg'
  },
  // Add more mock activities...
];

export default function ActivityHistoryScreen() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'stats'>('list');

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header with View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">Activity History</Typography>
        <Box>
          <IconButton onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
            <Timeline />
          </IconButton>
          <IconButton onClick={() => setViewMode('calendar')} color={viewMode === 'calendar' ? 'primary' : 'default'}>
            <CalendarMonth />
          </IconButton>
          <IconButton onClick={() => setViewMode('stats')} color={viewMode === 'stats' ? 'primary' : 'default'}>
            <EmojiEvents />
          </IconButton>
        </Box>
      </Box>

      {/* Activity Filters */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="All Activities" />
          <Tab label="Runs" />
          <Tab label="Walks" />
        </Tabs>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <LocalFireDepartment color="error" />
            <Typography variant="h6">450</Typography>
            <Typography variant="body2" color="text.secondary">kcal Today</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <DirectionsRun color="primary" />
            <Typography variant="h6">15.5</Typography>
            <Typography variant="body2" color="text.secondary">km This Week</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Speed color="success" />
            <Typography variant="h6">5:30</Typography>
            <Typography variant="body2" color="text.secondary">Avg Pace</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Timer color="warning" />
            <Typography variant="h6">2:15</Typography>
            <Typography variant="body2" color="text.secondary">Hours Active</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Activity List */}
      {viewMode === 'list' && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {mockActivities.map((activity) => (
            <Paper
              key={activity.id}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => navigate(`/activity/${activity.id}`)}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.type === 'run' ? 'Run' : 'Walk'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Distance</Typography>
                  <Typography variant="body1">{activity.distance.toFixed(1)} km</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{formatDuration(activity.duration)}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Pace</Typography>
                  <Typography variant="body1">{formatPace(activity.pace)}/km</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Calories</Typography>
                  <Typography variant="body1">{activity.calories} kcal</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Box>
                      <IconButton size="small">
                        <Favorite />
                      </IconButton>
                      <IconButton size="small">
                        <Comment />
                      </IconButton>
                      <IconButton size="small">
                        <Share />
                      </IconButton>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Map />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open map view
                      }}
                    >
                      View Route
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}

      {/* Calendar View - To be implemented */}
      {viewMode === 'calendar' && (
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography>Calendar View Coming Soon</Typography>
          {/* Add calendar implementation */}
        </Paper>
      )}

      {/* Stats View - To be implemented */}
      {viewMode === 'stats' && (
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography>Statistics View Coming Soon</Typography>
          {/* Add statistics and charts */}
        </Paper>
      )}
    </Box>
  );
}
