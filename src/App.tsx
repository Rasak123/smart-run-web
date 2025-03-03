import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import HomeScreen from './screens/HomeScreen';
import NewRunScreen from './screens/NewRunScreen';
import ActivitySummaryScreen from './screens/ActivitySummaryScreen';
import ActivityHistoryScreen from './screens/ActivityHistoryScreen';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/smart-run-web">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/run" element={<NewRunScreen />} />
          <Route path="/summary" element={<ActivitySummaryScreen />} />
          <Route path="/history" element={<ActivityHistoryScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
