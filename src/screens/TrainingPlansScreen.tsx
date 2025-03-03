import React from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button, Grid } from '@mui/material';

interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  goals: string[];
}

const trainingPlans: TrainingPlan[] = [
  {
    id: '5k-beginner',
    title: '5K Beginner',
    description: 'Perfect for new runners looking to complete their first 5K race.',
    duration: '8 weeks',
    difficulty: 'Beginner',
    goals: [
      'Build endurance gradually',
      'Learn proper running form',
      'Complete a 5K race'
    ]
  },
  {
    id: '10k-intermediate',
    title: '10K Intermediate',
    description: 'For runners who can run 5K and want to progress to 10K.',
    duration: '10 weeks',
    difficulty: 'Intermediate',
    goals: [
      'Increase weekly mileage',
      'Improve running speed',
      'Complete a 10K race'
    ]
  },
  {
    id: 'half-marathon',
    title: 'Half Marathon',
    description: 'Comprehensive training for a half marathon distance.',
    duration: '12 weeks',
    difficulty: 'Advanced',
    goals: [
      'Build long-run endurance',
      'Master nutrition strategy',
      'Complete a half marathon'
    ]
  }
];

function TrainingPlansScreen() {
  const handleStartPlan = (planId: string) => {
    // TODO: Implement plan enrollment
    alert('Coming soon: Training plan enrollment!');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Training Plans</Typography>
      
      <Grid container spacing={2}>
        {trainingPlans.map((plan) => (
          <Grid item xs={12} md={6} lg={4} key={plan.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {plan.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {plan.duration} • {plan.difficulty}
                </Typography>
                <Typography variant="body1" paragraph>
                  {plan.description}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Goals:
                </Typography>
                <ul>
                  {plan.goals.map((goal, index) => (
                    <li key={index}>
                      <Typography variant="body2">{goal}</Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={() => handleStartPlan(plan.id)}
                  fullWidth
                >
                  Start Plan
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default TrainingPlansScreen;
