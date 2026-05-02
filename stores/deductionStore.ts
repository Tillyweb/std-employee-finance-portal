import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { ScheduledDeduction } from '@/types';

interface DeductionState {
  deductions: ScheduledDeduction[];
  scheduleDeduction: (deduction: Omit<ScheduledDeduction, 'id' | 'status'>) => void;
  markDeducted: (id: string) => void;
  getPending: () => ScheduledDeduction[];
}

export const useDeductionStore = create<DeductionState>()(
  persist(
    (set, get) => ({
      deductions: [],
      scheduleDeduction: (data) =>
        set((s) => ({
          deductions: [
            ...s.deductions,
            { ...data, id: generateId(), status: 'pending' },
          ],
        })),
      markDeducted: (id) =>
        set((s) => ({
          deductions: s.deductions.map((d) =>
            d.id === id ? { ...d, status: 'deducted', deductedAt: new Date().toISOString() } : d
          ),
        })),
      getPending: () => get().deductions.filter((d) => d.status === 'pending'),
    }),
    { name: 'sfp_deductions' }
  )
);
