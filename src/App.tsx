import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import HomeScreen from './screens/HomeScreen';
import NewRunScreen from './screens/NewRunScreen';
import RunHistoryScreen from './screens/RunHistoryScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import TrainingPlansScreen from './screens/TrainingPlansScreen';
import ActivityScreen from './screens/ActivityScreen';
import Navigation from './components/Navigation';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FC5200', // Strava-like orange
      light: '#FF7433',
      dark: '#CC4200',
    },
    secondary: {
      main: '#2E2E2E',
      light: '#484848',
      dark: '#1E1E1E',
    },
    background: {
      default: '#1A1A1A',
      paper: '#2E2E2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/activity" element={<ActivityScreen />} />
              <Route path="/run" element={<NewRunScreen />} />
              <Route path="/history" element={<RunHistoryScreen />} />
              <Route path="/stats" element={<StatisticsScreen />} />
              <Route path="/plans" element={<TrainingPlansScreen />} />
            </Routes>
          </Box>
          <Navigation />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
