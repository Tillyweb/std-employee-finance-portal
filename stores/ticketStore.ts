import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { Ticket } from '@/types';

interface TicketState {
  tickets: Ticket[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  initSeedData: () => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicket: (id: string, data: Partial<Ticket>) => void;
  getTicketsByEmp: (empId: string) => Ticket[];
  getAllTickets: () => Ticket[];
  getPendingTickets: () => Ticket[];
}

const SEED_TICKETS: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    empId: 'STD001',
    type: 'loan',
    amount: 30000,
    reason: 'ค่ารักษาพยาบาลฉุกเฉิน',
    status: 'approved',
  },
  {
    empId: 'STD001',
    type: 'advance',
    amount: 5000,
    reason: 'ค่าเดินทางไปประชุม',
    status: 'pending',
  },
  {
    empId: 'STD002',
    type: 'loan',
    amount: 20000,
    reason: 'ซ่อมรถ',
    status: 'approved',
  },
  {
    empId: 'STD003',
    type: 'advance',
    amount: 3000,
    reason: 'ค่าวัสดุ',
    status: 'pending',
  },
];

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      tickets: [],
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      initSeedData: () => {
        if (get().tickets.length === 0) {
          const seeded: Ticket[] = SEED_TICKETS.map((t) => ({
            ...t,
            id: generateId(),
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          set({ tickets: seeded });
        }
      },
      addTicket: (data) =>
        set((s) => ({
          tickets: [
            ...s.tickets,
            {
              ...data,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateTicket: (id, data) =>
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        })),
      getTicketsByEmp: (empId) => get().tickets.filter((t) => t.empId === empId),
      getAllTickets: () => get().tickets,
      getPendingTickets: () => get().tickets.filter((t) => t.status === 'pending'),
    }),
    {
      name: 'sfp_tickets',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);