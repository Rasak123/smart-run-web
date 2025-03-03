export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Activity {
  id: string;
  type: 'walk' | 'run';
  distance: number;
  duration: string;
  pace: string;
  calories: number;
  routePoints: Location[];
  date: Date;
}
