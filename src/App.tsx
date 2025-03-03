import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import HomeScreen from './screens/HomeScreen';
import NewRunScreen from './screens/NewRunScreen';
import ActivitySummaryScreen from './screens/ActivitySummaryScreen';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/run" element={<NewRunScreen />} />
          <Route path="/summary" element={<ActivitySummaryScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
