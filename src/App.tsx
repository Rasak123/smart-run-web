import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeScreen from './screens/HomeScreen';
import NewRunScreen from './screens/NewRunScreen';
import RunHistoryScreen from './screens/RunHistoryScreen';
import BottomNav from './components/navigation/BottomNav';
import Box from '@mui/material/Box';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FC5200',
    },
    secondary: {
      main: '#1976d2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HashRouter>
        <Box sx={{ 
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          overflow: 'hidden'
        }}>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/run" element={<NewRunScreen />} />
              <Route path="/history" element={<RunHistoryScreen />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
          <BottomNav />
        </Box>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
