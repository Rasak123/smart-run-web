import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { AnalyticsService } from '../../services/AnalyticsService';
import { PerformanceTrend } from '../../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsDashboardProps {
  userId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [performanceData, setPerformanceData] = useState<PerformanceTrend | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [timeframe]);

  const loadPerformanceData = async () => {
    setLoading(true);
    const endDate = new Date().toISOString();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    try {
      const data = await AnalyticsService.getPerformanceTrends(
        userId,
        startDate.toISOString(),
        endDate
      );
      setPerformanceData(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
    setLoading(false);
  };

  const createChartData = (
    metrics: { date: string; value: number }[],
    label: string,
    color: string
  ) => ({
    labels: metrics.map((m) => new Date(m.date).toLocaleDateString()),
    datasets: [
      {
        label,
        data: metrics.map((m) => m.value),
        fill: false,
        borderColor: color,
        tension: 0.1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!performanceData) {
    return (
      <Typography variant="h6" align="center">
        No data available
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Performance Analytics</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            label="Timeframe"
            onChange={(e) =>
              setTimeframe(e.target.value as 'week' | 'month' | 'year')
            }
          >
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="year">Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Distance Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distance Trend
            </Typography>
            <Line
              data={createChartData(
                performanceData.weeklyDistance,
                'Distance (km)',
                '#2196f3'
              )}
              options={chartOptions}
            />
          </Paper>
        </Grid>

        {/* Pace Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Pace
            </Typography>
            <Line
              data={createChartData(
                performanceData.averagePace,
                'Pace (min/km)',
                '#4caf50'
              )}
              options={chartOptions}
            />
          </Paper>
        </Grid>

        {/* Running Heatmap */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Running Heatmap
            </Typography>
            <Box sx={{ height: 400 }}>
              <MapContainer
                style={{ height: '100%', width: '100%' }}
                center={[0, 0]}
                zoom={2}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {performanceData.heatmapData.map((point, index) => (
                  <Circle
                    key={index}
                    center={[point.lat, point.lng]}
                    radius={100}
                    pathOptions={{
                      color: 'red',
                      fillColor: 'red',
                      fillOpacity: point.intensity * 0.1,
                    }}
                  />
                ))}
              </MapContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Activity Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Preferred Time of Day
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(performanceData.preferredTimeOfDay)
                .sort(([, a], [, b]) => b - a)
                .map(([time, count]) => (
                  <Box key={time}>
                    <Typography variant="body2">
                      {time}: {count} runs
                    </Typography>
                    <Box
                      sx={{
                        height: 10,
                        bgcolor: 'primary.main',
                        width: `${(count / Math.max(...Object.values(performanceData.preferredTimeOfDay))) * 100}%`,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Preferred Days
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(performanceData.preferredDays)
                .sort(([, a], [, b]) => b - a)
                .map(([day, count]) => (
                  <Box key={day}>
                    <Typography variant="body2">
                      {day}: {count} runs
                    </Typography>
                    <Box
                      sx={{
                        height: 10,
                        bgcolor: 'secondary.main',
                        width: `${(count / Math.max(...Object.values(performanceData.preferredDays))) * 100}%`,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
