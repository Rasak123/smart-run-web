export interface User {
  id: string;
  username: string;
  profilePicture?: string;
  followers: number;
  following: number;
  totalRuns: number;
  totalDistance: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: string;
  category: 'distance' | 'speed' | 'consistency' | 'social' | 'special';
  progress?: number;
  target?: number;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  type: 'run' | 'achievement' | 'milestone';
  timestamp: string;
  run?: {
    distance: number;
    duration: number;
    pace: number;
    route?: Array<{ lat: number; lng: number }>;
  };
  achievement?: Achievement;
  likes: number;
  comments: number;
  hasLiked: boolean;
}

export interface PerformanceMetric {
  date: string;
  value: number;
}

export interface PerformanceTrend {
  weeklyDistance: PerformanceMetric[];
  weeklyDuration: PerformanceMetric[];
  averagePace: PerformanceMetric[];
  totalRuns: PerformanceMetric[];
  preferredTimeOfDay: { [key: string]: number };
  preferredDays: { [key: string]: number };
  heatmapData: Array<{
    lat: number;
    lng: number;
    intensity: number;
  }>;
}
