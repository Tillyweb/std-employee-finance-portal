import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoanAccount } from '@/types';
import { supabase } from '@/lib/supabase/client';

const seedLoans: LoanAccount[] = [
  { empId: 'STD001', name: 'ศิริพร เกียงจันทร์', dept: 'ช่างทันตกรรม', position: 'Tray และ Bite block', monthlyDeduction: 1000, previousBalance: 4000, currentBalance: 3000, status: 'active' },
  { empId: 'STD024', name: 'เปมิกา คำแผ่น', dept: 'ธุรการ', position: 'ผู้ปฏิบัติการ', monthlyDeduction: 1000, previousBalance: 3000, currentBalance: 2000, status: 'active' },
  { empId: 'STD027', name: 'คมกฤช แก้วอุด', dept: 'ช่างทันตกรรม', position: 'ลงฟลาสค์ และ ขัดเงา', monthlyDeduction: 0, previousBalance: 3000, currentBalance: 3000, status: 'active' },
  { empId: 'STD070', name: 'ขจรศักดิ์ จันทร์คำ', dept: 'ช่างทันตกรรม', position: 'กรอโครงโลหะ', monthlyDeduction: 1000, previousBalance: 3000, currentBalance: 2000, status: 'active' },
  { empId: 'STD076', name: 'ทศพล อาราช', dept: 'ช่างทันตกรรม', position: 'กรอแต่งรีเทนเนอร์', monthlyDeduction: 1000, previousBalance: 2000, currentBalance: 1000, status: 'active' },
  { empId: 'STD078', name: 'อุทิศ แสนวิเศษ', dept: 'ช่างทันตกรรม', position: 'ขัดโลหะ', monthlyDeduction: 1000, previousBalance: 3000, currentBalance: 2000, status: 'active' },
  { empId: 'STD081', name: 'ฐิติรัตน์ คำราพิช', dept: 'ช่างทันตกรรม', position: 'Wax(แต่งเหงือก)', monthlyDeduction: 1000, previousBalance: 4000, currentBalance: 3000, status: 'active' },
  { empId: 'STD093', name: 'ซื้อ นายญะ', dept: 'ช่างทันตกรรม', position: 'กรอโครงโลหะ', monthlyDeduction: 1000, previousBalance: 4000, currentBalance: 3000, status: 'active' },
  { empId: 'STD094', name: 'ประกายแก้ว ศรีคำหอม', dept: 'ช่างทันตกรรม', position: 'ตั้งฐานและเทเจล', monthlyDeduction: 1000, previousBalance: 4000, currentBalance: 3000, status: 'active' },
  { empId: 'STD100', name: 'กฤษฎาภรณ์ กรรมาธิคุณ', dept: 'ช่างทันตกรรม', position: 'เรียงฟัน/กรออะคริลิก', monthlyDeduction: 1000, previousBalance: 4000, currentBalance: 3000, status: 'active' },
];

interface LoanState {
  loans: LoanAccount[];
  addLoan: (loan: LoanAccount) => void;
  updateLoan: (empId: string, data: Partial<LoanAccount>) => void;
  getLoan: (empId: string) => LoanAccount | undefined;
  deductFromLoan: (empId: string, amount: number) => void;
  initFromSupabase: () => Promise<void>;
  syncToSupabase: (loan: LoanAccount) => Promise<void>;
}

export const useLoanStore = create<LoanState>()(
  persist(
    (set, get) => ({
      loans: seedLoans,

      addLoan: (loan) => {
        set((s) => {
          const existing = s.loans.find((l) => l.empId === loan.empId);
          if (existing) {
            return { loans: s.loans.map((l) => (l.empId === loan.empId ? loan : l)) };
          }
          return { loans: [...s.loans, loan] };
        });
        get().syncToSupabase(loan);
      },

      updateLoan: (empId, data) => {
        set((s) => ({ loans: s.loans.map((l) => (l.empId === empId ? { ...l, ...data } : l)) }));
        const updated = get().loans.find((l) => l.empId === empId);
        if (updated) get().syncToSupabase(updated);
      },

      getLoan: (empId) => get().loans.find((l) => l.empId === empId),

      deductFromLoan: (empId, amount) => {
        set((s) => ({
          loans: s.loans.map((l) => {
            if (l.empId !== empId) return l;
            const newBalance = Math.max(0, l.currentBalance - amount);
            return { ...l, currentBalance: newBalance, status: newBalance === 0 ? 'paid_off' : 'active' };
          }),
        }));
        const updated = get().loans.find((l) => l.empId === empId);
        if (updated) get().syncToSupabase(updated);
      },

      initFromSupabase: async () => {
        try {
          const { data, error } = await supabase.from('loans').select('*');
          if (error || !data || data.length === 0) return;
          const remote: LoanAccount[] = data.map((r) => ({
            empId: r.emp_id,
            name: r.name || '',
            dept: r.dept || '',
            position: r.position || '',
            monthlyDeduction: r.monthly_deduction || 0,
            previousBalance: r.previous_balance || 0,
            currentBalance: r.current_balance || 0,
            status: (r.status as LoanAccount['status']) || 'active',
          }));
          set((s) => {
            const localEmpIds = new Set(s.loans.map((l) => l.empId));
            const newFromRemote = remote.filter((r) => !localEmpIds.has(r.empId));
            return { loans: [...s.loans, ...newFromRemote] };
          });
        } catch (e) {
          // offline
        }
      },

      syncToSupabase: async (loan) => {
        try {
          await supabase.from('loans').upsert({
            emp_id: loan.empId,
            name: loan.name,
            dept: loan.dept,
            position: loan.position,
            monthly_deduction: loan.monthlyDeduction,
            previous_balance: loan.previousBalance,
            current_balance: loan.currentBalance,
            status: loan.status,
          }, { onConflict: 'emp_id' });
        } catch (e) {
          // offline
        }
      },
    }),
    { name: 'sfp_loans' }
  )
);