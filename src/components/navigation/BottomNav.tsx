import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, DirectionsRun, History } from '@mui/icons-material';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getPathValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/run') return 1;
    if (path === '/history') return 2;
    return 0;
  };

  return (
    <Paper 
      sx={{ 
        position: 'sticky', 
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: '24px 24px 0 0',
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getPathValue()}
        onChange={(_, newValue) => {
          switch (newValue) {
            case 0:
              navigate('/');
              break;
            case 1:
              navigate('/run');
              break;
            case 2:
              navigate('/history');
              break;
          }
        }}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '24px 24px 0 0',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Run" icon={<DirectionsRun />} />
        <BottomNavigationAction label="History" icon={<History />} />
      </BottomNavigation>
    </Paper>
  );
}
