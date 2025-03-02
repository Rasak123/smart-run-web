import { ActivityFeedItem, User, Achievement } from '../types';

const API_URL = 'http://localhost:5000/api';

export const SocialService = {
  getActivityFeed: async (page: number = 1, limit: number = 10): Promise<ActivityFeedItem[]> => {
    try {
      const response = await fetch(`${API_URL}/social/feed?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity feed');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }
  },

  getUserProfile: async (userId: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  followUser: async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/social/follow/${userId}`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  },

  unfollowUser: async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/social/unfollow/${userId}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  },

  likeActivity: async (activityId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/social/activities/${activityId}/like`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Error liking activity:', error);
      return false;
    }
  },

  unlikeActivity: async (activityId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/social/activities/${activityId}/unlike`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error unliking activity:', error);
      return false;
    }
  },

  getAchievements: async (userId: string): Promise<Achievement[]> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/achievements`);
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },

  shareActivity: async (activityId: string, platform: 'facebook' | 'twitter' | 'instagram'): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/social/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activityId, platform }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error sharing activity:', error);
      return false;
    }
  },
};
