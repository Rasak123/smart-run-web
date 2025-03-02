import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Home,
  DirectionsRun,
  History,
  BarChart,
  FitnessCenter,
} from '@mui/icons-material';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const getValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/activity') return 1;
    if (path === '/history') return 2;
    if (path === '/stats') return 3;
    if (path === '/plans') return 4;
    return 0;
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getValue()}
        onChange={(event, newValue) => {
          switch (newValue) {
            case 0:
              navigate('/');
              break;
            case 1:
              navigate('/activity');
              break;
            case 2:
              navigate('/history');
              break;
            case 3:
              navigate('/stats');
              break;
            case 4:
              navigate('/plans');
              break;
          }
        }}
        showLabels
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Activity" icon={<DirectionsRun />} />
        <BottomNavigationAction label="History" icon={<History />} />
        <BottomNavigationAction label="Stats" icon={<BarChart />} />
        <BottomNavigationAction label="Plans" icon={<FitnessCenter />} />
      </BottomNavigation>
    </Paper>
  );
}
