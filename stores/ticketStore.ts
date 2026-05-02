import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { Ticket } from '@/types';
import { supabase } from '@/lib/supabase/client';

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
  initFromSupabase: () => Promise<void>;
  syncToSupabase: (ticket: Ticket) => Promise<void>;
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
          seeded.forEach((t) => get().syncToSupabase(t));
        }
      },

      addTicket: (data) => {
        const ticket: Ticket = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ tickets: [...s.tickets, ticket] }));
        get().syncToSupabase(ticket);
      },

      updateTicket: (id, data) => {
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }));
        const updated = get().tickets.find((t) => t.id === id);
        if (updated) get().syncToSupabase(updated);
      },

      getTicketsByEmp: (empId) => get().tickets.filter((t) => t.empId === empId),
      getAllTickets: () => get().tickets,
      getPendingTickets: () => get().tickets.filter((t) => t.status === 'pending'),

      initFromSupabase: async () => {
        try {
          const { data, error } = await supabase.from('tickets').select('*');
          if (error || !data || data.length === 0) return;
          const remote: Ticket[] = data.map((r) => ({
            id: r.id,
            empId: r.emp_id || '',
            type: r.type as Ticket['type'],
            amount: r.amount || 0,
            reason: r.reason || '',
            status: r.status as Ticket['status'],
            adminNote: r.admin_note || undefined,
            createdAt: r.created_at || new Date().toISOString(),
            updatedAt: r.updated_at || new Date().toISOString(),
            processedAt: r.processed_at || undefined,
            processedBy: r.processed_by || undefined,
          }));
          set((s) => {
            const localIds = new Set(s.tickets.map((t) => t.id));
            const newFromRemote = remote.filter((r) => !localIds.has(r.id));
            return { tickets: [...s.tickets, ...newFromRemote] };
          });
        } catch (e) {
          // offline — use local only
        }
      },

      syncToSupabase: async (ticket) => {
        try {
          await supabase.from('tickets').upsert({
            id: ticket.id,
            emp_id: ticket.empId,
            type: ticket.type,
            amount: ticket.amount,
            reason: ticket.reason,
            status: ticket.status,
            admin_note: ticket.adminNote || null,
            created_at: ticket.createdAt,
            updated_at: ticket.updatedAt,
            processed_at: ticket.processedAt || null,
            processed_by: ticket.processedBy || null,
          }, { onConflict: 'id' });
        } catch (e) {
          // offline — local only
        }
      },
    }),
    {
      name: 'sfp_tickets',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state) {
          state.initFromSupabase();
        }
      },
    }
  )
);