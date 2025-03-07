import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import { 
  DirectionsRun,
  EmojiEvents,
  Timer,
  TrendingUp,
  Speed,
  FitnessCenter,
  CalendarMonth,
  PlayArrow,
  Lock,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const trainingPlans = [
  {
    id: 1,
    title: "5K Beginner",
    duration: "8 weeks",
    level: "Beginner",
    description: "Perfect for first-time runners. Build up to running your first 5K.",
    workoutsPerWeek: 3,
    premium: false,
    progress: 0,
  },
  {
    id: 2,
    title: "10K Intermediate",
    duration: "12 weeks",
    level: "Intermediate",
    description: "Take your running to the next level with speed work and hill training.",
    workoutsPerWeek: 4,
    premium: true,
    progress: 30,
  },
  {
    id: 3,
    title: "Half Marathon",
    duration: "16 weeks",
    level: "Advanced",
    description: "Comprehensive training for a half marathon with advanced techniques.",
    workoutsPerWeek: 5,
    premium: true,
    progress: 0,
  }
];

const workouts = [
  {
    id: 1,
    title: "Easy Run",
    duration: "30 min",
    type: "Endurance",
    description: "Build your base with this easy-paced run",
    intensity: "Low",
    completed: false
  },
  {
    id: 2,
    title: "Interval Training",
    duration: "45 min",
    type: "Speed",
    description: "8x400m repeats with 200m recovery",
    intensity: "High",
    completed: true
  },
  {
    id: 3,
    title: "Long Run",
    duration: "90 min",
    type: "Endurance",
    description: "Weekly long run to build endurance",
    intensity: "Medium",
    completed: false
  }
];

export default function TrainingScreen() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">Training</Typography>
        <Button
          variant="contained"
          startIcon={<DirectionsRun />}
          onClick={() => navigate('/run')}
        >
          Start Workout
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="My Plan" />
          <Tab label="Workouts" />
          <Tab label="Programs" />
        </Tabs>
      </Paper>

      {/* Content */}
      {tabValue === 0 && (
        <Box>
          {/* Today's Workout */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Today's Workout</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Speed color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Interval Training</Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      8x400m repeats with 200m recovery
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip icon={<Timer />} label="45 min" />
                      <Chip icon={<TrendingUp />} label="High Intensity" color="error" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      startIcon={<PlayArrow />}
                      variant="contained" 
                      fullWidth
                      onClick={() => navigate('/run')}
                    >
                      Start Workout
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Weekly Progress */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Weekly Progress</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">3/4</Typography>
                  <Typography variant="body2" color="text.secondary">Workouts Done</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">15.5</Typography>
                  <Typography variant="body2" color="text.secondary">km This Week</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List>
            {workouts.map((workout, index) => (
              <React.Fragment key={workout.id}>
                <ListItem>
                  <ListItemIcon>
                    {workout.type === 'Speed' ? <Speed color="primary" /> : <DirectionsRun color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={workout.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {workout.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip size="small" icon={<Timer />} label={workout.duration} />
                          <Chip 
                            size="small" 
                            icon={<TrendingUp />} 
                            label={workout.intensity}
                            color={workout.intensity === 'High' ? 'error' : 'default'}
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <IconButton
                    color={workout.completed ? 'primary' : 'default'}
                    onClick={() => {}}
                  >
                    {workout.completed ? <EmojiEvents /> : <PlayArrow />}
                  </IconButton>
                </ListItem>
                {index < workouts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Grid container spacing={2}>
            {trainingPlans.map((plan) => (
              <Grid item xs={12} key={plan.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{plan.title}</Typography>
                      {plan.premium && (
                        <Chip
                          icon={<Star />}
                          label="Premium"
                          color="warning"
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {plan.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip icon={<CalendarMonth />} label={plan.duration} size="small" />
                      <Chip icon={<DirectionsRun />} label={`${plan.workoutsPerWeek}x/week`} size="small" />
                      <Chip icon={<FitnessCenter />} label={plan.level} size="small" />
                    </Box>
                    {plan.progress > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Progress: {plan.progress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={plan.progress} />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      startIcon={plan.premium ? <Lock /> : <PlayArrow />}
                      variant={plan.premium ? "outlined" : "contained"}
                      fullWidth
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.premium ? "Unlock Plan" : "Start Plan"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
