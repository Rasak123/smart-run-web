import { PerformanceTrend, PerformanceMetric } from '../types';

const API_URL = 'http://localhost:5000/api';

export const AnalyticsService = {
  getPerformanceTrends: async (userId: string, startDate: string, endDate: string): Promise<PerformanceTrend> => {
    try {
      const response = await fetch(
        `${API_URL}/analytics/performance?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch performance trends');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching performance trends:', error);
      return {
        weeklyDistance: [],
        weeklyDuration: [],
        averagePace: [],
        totalRuns: [],
        preferredTimeOfDay: {},
        preferredDays: {},
        heatmapData: [],
      };
    }
  },

  getPredictedRaceTimes: async (userId: string): Promise<{ [key: string]: string }> => {
    try {
      const response = await fetch(`${API_URL}/analytics/race-predictions/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch race predictions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching race predictions:', error);
      return {};
    }
  },

  getTrainingLoad: async (userId: string, days: number = 30): Promise<PerformanceMetric[]> => {
    try {
      const response = await fetch(`${API_URL}/analytics/training-load/${userId}?days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch training load');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching training load:', error);
      return [];
    }
  },

  getRunningZones: async (userId: string, runId: string): Promise<{
    easy: number;
    moderate: number;
    hard: number;
    sprint: number;
  }> => {
    try {
      const response = await fetch(`${API_URL}/analytics/running-zones/${userId}/${runId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch running zones');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching running zones:', error);
      return {
        easy: 0,
        moderate: 0,
        hard: 0,
        sprint: 0,
      };
    }
  },

  getProgressToGoals: async (userId: string): Promise<{
    weeklyDistance: { current: number; target: number };
    monthlyRuns: { current: number; target: number };
    yearlyDistance: { current: number; target: number };
  }> => {
    try {
      const response = await fetch(`${API_URL}/analytics/goals-progress/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch goals progress');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching goals progress:', error);
      return {
        weeklyDistance: { current: 0, target: 0 },
        monthlyRuns: { current: 0, target: 0 },
        yearlyDistance: { current: 0, target: 0 },
      };
    }
  },

  generateHeatmap: async (userId: string, timeframe: 'week' | 'month' | 'year'): Promise<Array<{
    lat: number;
    lng: number;
    intensity: number;
  }>> => {
    try {
      const response = await fetch(`${API_URL}/analytics/heatmap/${userId}?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch heatmap data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      return [];
    }
  },
};
