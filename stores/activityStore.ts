import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  initFromSupabase: () => Promise<void>;
  syncToSupabase: (activity: Activity) => Promise<void>;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: Date.now(),
        };
        set((s) => ({ activities: [newActivity, ...s.activities].slice(0, 100) }));
        get().syncToSupabase(newActivity);
      },

      initFromSupabase: async () => {
        try {
          const { data, error } = await supabase.from('activities').select('*').order('timestamp', { ascending: false }).limit(100);
          if (error || !data || data.length === 0) return;
          const remote: Activity[] = data.map((r) => ({
            id: r.id,
            icon: r.icon || '',
            description: r.description || '',
            type: r.type as Activity['type'],
            timestamp: r.timestamp || 0,
          }));
          set((s) => {
            const localIds = new Set(s.activities.map((a) => a.id));
            const newFromRemote = remote.filter((r) => !localIds.has(r.id));
            return { activities: [...s.activities, ...newFromRemote].slice(0, 100) };
          });
        } catch (e) {
          // offline
        }
      },

      syncToSupabase: async (activity) => {
        try {
          await supabase.from('activities').upsert({
            id: activity.id,
            icon: activity.icon,
            description: activity.description,
            type: activity.type,
            timestamp: activity.timestamp,
          }, { onConflict: 'id' });
        } catch (e) {
          // offline
        }
      },
    }),
    { name: 'sfp_activities' }
  )
);