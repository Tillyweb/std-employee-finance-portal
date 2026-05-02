import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { Ticket } from '@/types';

interface TicketState {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicket: (id: string, data: Partial<Ticket>) => void;
  getTicketsByEmp: (empId: string) => Ticket[];
  getAllTickets: () => Ticket[];
  getPendingTickets: () => Ticket[];
}

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      tickets: [],
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
    { name: 'sfp_tickets' }
  )
);