import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { DirectionsRun, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            startIcon={<AddIcon />}
          >
            Start Activity
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

      {/* Quick Stats */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Quick Stats</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }} elevation={1}>
              <Typography variant="h4" color="primary">0</Typography>
              <Typography variant="body2" color="text.secondary">Total Runs</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }} elevation={1}>
              <Typography variant="h4" color="primary">0</Typography>
              <Typography variant="body2" color="text.secondary">Total Distance</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Activities */}
      <Paper sx={{ p: 2, flex: 1 }}>
        <Typography variant="h6" gutterBottom>Recent Activities</Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <DirectionsRun sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">No activities yet</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/run')}
            sx={{ mt: 2 }}
          >
            Start New Activity
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
