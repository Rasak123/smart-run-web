import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
  Home,
  DirectionsRun,
  EmojiEvents,
  FitnessCenter,
  History
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveRoute = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/run') return 1;
    if (path === '/history') return 2;
    if (path === '/training') return 3;
    if (path === '/challenges') return 4;
    return 0;
  };

  return (
    <Paper 
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getActiveRoute()}
        onChange={(_, newValue) => {
          switch(newValue) {
            case 0:
              navigate('/');
              break;
            case 1:
              navigate('/run');
              break;
            case 2:
              navigate('/history');
              break;
            case 3:
              navigate('/training');
              break;
            case 4:
              navigate('/challenges');
              break;
          }
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Run" icon={<DirectionsRun />} />
        <BottomNavigationAction label="History" icon={<History />} />
        <BottomNavigationAction label="Training" icon={<FitnessCenter />} />
        <BottomNavigationAction label="Challenges" icon={<EmojiEvents />} />
      </BottomNavigation>
    </Paper>
  );
}
