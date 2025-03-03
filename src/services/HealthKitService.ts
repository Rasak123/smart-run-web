declare global {
  interface Window {
    webkit?: {
      messageHandlers: {
        healthKit: {
          postMessage: (message: any) => void;
        };
      };
    };
  }
}

export class HealthKitService {
  private static instance: HealthKitService;
  private isAvailable: boolean = false;

  private constructor() {
    // Check if running on iOS and HealthKit is available
    this.isAvailable = !!(
      window.webkit?.messageHandlers?.healthKit?.postMessage
    );
  }

  public static getInstance(): HealthKitService {
    if (!HealthKitService.instance) {
      HealthKitService.instance = new HealthKitService();
    }
    return HealthKitService.instance;
  }

  public async requestAuthorization(): Promise<boolean> {
    if (!this.isAvailable) return false;

    try {
      // Request authorization for distance, steps, and heart rate
      const message = {
        type: 'requestAuthorization',
        dataTypes: ['distance', 'steps', 'heartRate']
      };
      
      return new Promise((resolve) => {
        // Add event listener for the response
        window.addEventListener('healthkit-auth-response', (event: any) => {
          resolve(event.detail.authorized);
        }, { once: true });

        // Send request
        window.webkit!.messageHandlers.healthKit.postMessage(message);
      });
    } catch (error) {
      console.error('Error requesting HealthKit authorization:', error);
      return false;
    }
  }

  public async saveWorkout(workout: {
    startDate: Date;
    endDate: Date;
    distance: number;
    calories: number;
    heartRates?: number[];
  }): Promise<boolean> {
    if (!this.isAvailable) return false;

    try {
      const message = {
        type: 'saveWorkout',
        data: {
          ...workout,
          startDate: workout.startDate.toISOString(),
          endDate: workout.endDate.toISOString(),
          activityType: 'running'
        }
      };

      return new Promise((resolve) => {
        window.addEventListener('healthkit-save-response', (event: any) => {
          resolve(event.detail.success);
        }, { once: true });

        window.webkit!.messageHandlers.healthKit.postMessage(message);
      });
    } catch (error) {
      console.error('Error saving workout to HealthKit:', error);
      return false;
    }
  }

  public async getRecentWorkouts(limit: number = 10): Promise<any[]> {
    if (!this.isAvailable) return [];

    try {
      const message = {
        type: 'getWorkouts',
        data: { limit }
      };

      return new Promise((resolve) => {
        window.addEventListener('healthkit-workouts-response', (event: any) => {
          resolve(event.detail.workouts);
        }, { once: true });

        window.webkit!.messageHandlers.healthKit.postMessage(message);
      });
    } catch (error) {
      console.error('Error fetching workouts from HealthKit:', error);
      return [];
    }
  }

  public isHealthKitAvailable(): boolean {
    return this.isAvailable;
  }
}
