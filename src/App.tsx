import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { theme } from './theme';
import HomeScreen from './screens/HomeScreen';
import NewRunScreen from './screens/NewRunScreen';
import ActivitySummaryScreen from './screens/ActivitySummaryScreen';
import ActivityHistoryScreen from './screens/ActivityHistoryScreen';
import TrainingScreen from './screens/TrainingScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/smart-run-web">
        <Box sx={{ pb: 7 }}> {/* Add padding for bottom nav */}
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/run" element={<NewRunScreen />} />
            <Route path="/summary" element={<ActivitySummaryScreen />} />
            <Route path="/history" element={<ActivityHistoryScreen />} />
            <Route path="/training" element={<TrainingScreen />} />
            <Route path="/challenges" element={<ChallengesScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
