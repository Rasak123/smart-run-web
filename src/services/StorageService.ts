export interface Run {
  id: string;
  date: string;
  distance: number;
  duration: number;
  averagePace: number;
  route: Array<{ lat: number; lng: number }>;
}

const API_URL = 'http://localhost:5000/api';

export const StorageService = {
  saveRun: async (run: Run): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(run),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save run');
      }
    } catch (error) {
      console.error('Error saving run:', error);
      throw error;
    }
  },

  getRuns: async (): Promise<Run[]> => {
    try {
      const response = await fetch(`${API_URL}/runs`);
      if (!response.ok) {
        throw new Error('Failed to fetch runs');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching runs:', error);
      return [];
    }
  },

  getRunById: async (id: string): Promise<Run | undefined> => {
    try {
      const response = await fetch(`${API_URL}/runs/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch run');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching run:', error);
      return undefined;
    }
  },

  deleteRun: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/runs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete run');
      }
    } catch (error) {
      console.error('Error deleting run:', error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const response = await fetch(`${API_URL}/statistics`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalRuns: 0,
        totalDistance: 0,
        totalDuration: 0,
        averagePace: 0,
        longestRun: 0,
        fastestPace: 0
      };
    }
  }
};
