import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity } from '@/types';

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: [],
      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: Date.now(),
        };
        set((s) => ({ activities: [newActivity, ...s.activities].slice(0, 100) }));
      },
    }),
    { name: 'sfp_activities' }
  )
);