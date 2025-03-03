import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import {
  DirectionsRun,
  DirectionsWalk,
  DirectionsBike,
  Timer,
  Timeline,
  LocalFireDepartment,
  Add,
} from '@mui/icons-material';

interface ActivityType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface GoalType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const activities: ActivityType[] = [
  {
    id: 'run',
    name: 'Run',
    icon: <DirectionsRun sx={{ fontSize: 40 }} />,
    color: '#FC5200',
  },
  {
    id: 'walk',
    name: 'Walk',
    icon: <DirectionsWalk sx={{ fontSize: 40 }} />,
    color: '#4CAF50',
  },
  {
    id: 'cycle',
    name: 'Cycle',
    icon: <DirectionsBike sx={{ fontSize: 40 }} />,
    color: '#2196F3',
  },
];

const goals: GoalType[] = [
  {
    id: 'distance',
    name: 'Distance Goal',
    icon: <Timeline />,
    description: 'Set a target distance',
  },
  {
    id: 'time',
    name: 'Time Goal',
    icon: <Timer />,
    description: 'Set a target duration',
  },
  {
    id: 'calories',
    name: 'Calorie Goal',
    icon: <LocalFireDepartment />,
    description: 'Set a calorie burn target',
  },
];

export default function ActivityScreen() {
  const navigate = useNavigate();

  const startActivity = (activityType: string, goalType?: string) => {
    navigate('/run', { 
      state: { 
        activityType,
        goalType,
      }
    });
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Start Activity
      </Typography>

      {/* Quick Start Section */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Quick Start
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {activities.map((activity) => (
          <Grid item xs={4} key={activity.id}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  bgcolor: activity.color,
                },
              }}
              onClick={() => startActivity(activity.id)}
            >
              <Box sx={{ color: activity.color }}>
                {activity.icon}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  fontWeight: 'medium',
                }}
              >
                {activity.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Goals Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Goals
        </Typography>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => navigate('/goals/create')}
        >
          Create Goal
        </Button>
      </Box>
      <Grid container spacing={2}>
        {goals.map((goal) => (
          <Grid item xs={12} key={goal.id}>
            <Paper
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => startActivity('run', goal.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    color: 'white',
                  }}
                >
                  {goal.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1">
                    {goal.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {goal.description}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
