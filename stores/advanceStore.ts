import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdvanceAccount, AdvanceRecord } from '@/types';
import { supabase } from '@/lib/supabase/client';

const seedAdvances: AdvanceAccount[] = [
  {
    empId: 'STD001', name: 'ศิริพร เกียงจันทร์', dept: 'ช่างทันตกรรม', position: 'Tray และ Bite block',
    installments: [
      { installment: 1, amount: 3000, approvedAt: '2026-01-10' },
      { installment: 2, amount: 3000, approvedAt: '2026-02-10' },
    ],
    totalAdvanced: 6000, balance: 4000, status: 'active',
  },
  {
    empId: 'STD007', name: 'สายชล สุวรรณศีรียง', dept: 'ธุรการ', position: 'หัวหน้าธุรการ',
    installments: [
      { installment: 1, amount: 2500, approvedAt: '2026-01-15' },
      { installment: 2, amount: 2500, approvedAt: '2026-02-15' },
    ],
    totalAdvanced: 5000, balance: 4000, status: 'active',
  },
  {
    empId: 'STD016', name: 'วชิราภรณ์ ดมดอก', dept: 'ช่างทันตกรรม', position: 'เรียงฟัน',
    installments: [
      { installment: 1, amount: 2500, approvedAt: '2026-01-12' },
      { installment: 2, amount: 2500, approvedAt: '2026-02-12' },
    ],
    totalAdvanced: 5000, balance: 4000, status: 'active',
  },
  {
    empId: 'STD024', name: 'เปมิกา คำแผ่น', dept: 'ธุรการ', position: 'ผู้ปฏิบัติการ',
    installments: [
      { installment: 1, amount: 3500, approvedAt: '2026-01-11' },
      { installment: 2, amount: 3500, approvedAt: '2026-02-11' },
    ],
    totalAdvanced: 7000, balance: 4000, status: 'active',
  },
  {
    empId: 'STD076', name: 'ทศพล อาราช', dept: 'ช่างทันตกรรม', position: 'กรอแต่งรีเทนเนอร์',
    installments: [
      { installment: 1, amount: 2833, approvedAt: '2025-10-15' },
      { installment: 2, amount: 1500, approvedAt: '2025-11-15' },
      { installment: 3, amount: 1333, approvedAt: '2025-12-15' },
    ],
    totalAdvanced: 5666, balance: 0, status: 'settled',
  },
  {
    empId: 'STD086', name: 'ณรงค์เดช สุดใจ', dept: 'ช่างทันตกรรม', position: 'เป่าทราย',
    installments: [
      { installment: 1, amount: 4000, approvedAt: '2026-01-08' },
      { installment: 2, amount: 4000, approvedAt: '2026-02-08' },
    ],
    totalAdvanced: 8000, balance: 6000, status: 'active',
  },
  {
    empId: 'STD094', name: 'ประกายแก้ว ศรีคำหอม', dept: 'ช่างทันตกรรม', position: 'ตั้งฐานและเทเจล',
    installments: [
      { installment: 1, amount: 2500, approvedAt: '2026-01-14' },
      { installment: 2, amount: 2500, approvedAt: '2026-02-14' },
    ],
    totalAdvanced: 5000, balance: 4000, status: 'active',
  },
  {
    empId: 'STD098', name: 'ภูริพัฒน์ แสนศรี', dept: 'โลจิสติกส์', position: 'รับส่งสินค้า',
    installments: [
      { installment: 1, amount: 3000, approvedAt: '2026-01-09' },
      { installment: 2, amount: 3000, approvedAt: '2026-02-09' },
    ],
    totalAdvanced: 6000, balance: 4000, status: 'active',
  },
  {
    empId: 'STD105', name: 'กิตติ', dept: 'ช่างทันตกรรม', position: 'ลงฟลาสค์',
    installments: [
      { installment: 1, amount: 2000, approvedAt: '2026-01-13' },
      { installment: 2, amount: 2000, approvedAt: '2026-02-13' },
    ],
    totalAdvanced: 4000, balance: 2000, status: 'active',
  },
  {
    empId: 'STD107', name: 'นายชัยวัฒน์ นำภา', dept: 'ช่างทันตกรรม', position: 'ทดลองงาน',
    installments: [
      { installment: 1, amount: 2000, approvedAt: '2026-01-07' },
      { installment: 2, amount: 2000, approvedAt: '2026-02-07' },
    ],
    totalAdvanced: 4000, balance: 2000, status: 'active',
  },
  {
    empId: 'STD229', name: 'จิรนันท์ ดวงคำ', dept: 'ช่างทันตกรรม', position: 'ทดลองงาน',
    installments: [
      { installment: 1, amount: 2000, approvedAt: '2026-01-06' },
      { installment: 2, amount: 2000, approvedAt: '2026-02-06' },
    ],
    totalAdvanced: 4000, balance: 2000, status: 'active',
  },
];

interface AdvanceState {
  advances: AdvanceAccount[];
  addAdvance: (advance: AdvanceAccount) => void;
  updateAdvance: (empId: string, data: Partial<AdvanceAccount>) => void;
  getAdvance: (empId: string) => AdvanceAccount | undefined;
  deleteAdvance: (empId: string) => void;
  addInstallment: (empId: string, amount: number) => { success: boolean; message: string };
  deductFromAdvance: (empId: string, amount: number) => void;
  initFromSupabase: () => Promise<void>;
  syncToSupabase: (advance: AdvanceAccount) => Promise<void>;
}

export const useAdvanceStore = create<AdvanceState>()(
  persist(
    (set, get) => ({
      advances: seedAdvances,

      addAdvance: (advance) => {
        set((s) => {
          const existing = s.advances.find((a) => a.empId === advance.empId);
          if (existing) {
            return { advances: s.advances.map((a) => (a.empId === advance.empId ? advance : a)) };
          }
          return { advances: [...s.advances, advance] };
        });
        get().syncToSupabase(advance);
      },

      updateAdvance: (empId, data) => {
        set((s) => ({ advances: s.advances.map((a) => (a.empId === empId ? { ...a, ...data } : a)) }));
        const updated = get().advances.find((a) => a.empId === empId);
        if (updated) get().syncToSupabase(updated);
      },

      getAdvance: (empId) => get().advances.find((a) => a.empId === empId),

      deleteAdvance: (empId) => set((s) => ({ advances: s.advances.filter((a) => a.empId !== empId) })),

      addInstallment: (empId, amount) => {
        const adv = get().advances.find((a) => a.empId === empId);
        if (adv && adv.installments.length >= 4) {
          return { success: false, message: 'เบิกครบ 4 งวดแล้ว ไม่สามารถเบิกเพิ่มได้' };
        }
        set((s) => ({
          advances: s.advances.map((a) => {
            if (a.empId !== empId) return a;
            const installmentNum = (a.installments.length || 0) + 1;
            const newRecord: AdvanceRecord = { installment: installmentNum, amount, approvedAt: new Date().toISOString() };
            const newInstallments = [...a.installments, newRecord];
            return {
              ...a,
              installments: newInstallments,
              totalAdvanced: a.totalAdvanced + amount,
              balance: a.balance + amount,
              status: 'active' as const,
            };
          }),
        }));
        const updated = get().advances.find((a) => a.empId === empId);
        if (updated) get().syncToSupabase(updated);
        return { success: true, message: `อนุมัติเบิกเงินล่วงหน้างวดที่ ${(adv?.installments.length || 0) + 1} เรียบร้อยแล้ว` };
      },

      deductFromAdvance: (empId, amount) => {
        set((s) => ({
          advances: s.advances.map((a) => {
            if (a.empId !== empId) return a;
            const newBalance = Math.max(0, a.balance - amount);
            return {
              ...a,
              balance: newBalance,
              status: newBalance === 0 ? 'settled' : 'active',
            };
          }),
        }));
        const updated = get().advances.find((a) => a.empId === empId);
        if (updated) get().syncToSupabase(updated);
      },

      initFromSupabase: async () => {
        try {
          const { data, error } = await supabase.from('advances').select('*');
          if (error || !data || data.length === 0) return;
          const remote: AdvanceAccount[] = data.map((r) => ({
            empId: r.emp_id,
            name: r.name || '',
            dept: r.dept || '',
            position: r.position || '',
            installments: typeof r.installments === 'string' ? JSON.parse(r.installments) : (r.installments || []),
            totalAdvanced: r.total_advanced || 0,
            balance: r.balance || 0,
            status: (r.status as AdvanceAccount['status']) || 'active',
          }));
          set((s) => {
            const localEmpIds = new Set(s.advances.map((a) => a.empId));
            const newFromRemote = remote.filter((r) => !localEmpIds.has(r.empId));
            return { advances: [...s.advances, ...newFromRemote] };
          });
        } catch (e) {
          // offline
        }
      },

      syncToSupabase: async (advance) => {
        try {
          await supabase.from('advances').upsert({
            emp_id: advance.empId,
            name: advance.name,
            dept: advance.dept,
            position: advance.position,
            installments: JSON.stringify(advance.installments),
            total_advanced: advance.totalAdvanced,
            balance: advance.balance,
            status: advance.status,
          }, { onConflict: 'emp_id' });
        } catch (e) {
          // offline
        }
      },
    }),
    { name: 'sfp_advances' }
  )
);