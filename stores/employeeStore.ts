import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { hashPassword } from '@/lib/utils';
import { Employee } from '@/types';
import { supabase } from '@/lib/supabase/client';

const DEFAULT_PASSWORD = 'pass';

function makeEmp(seed: Omit<Employee, 'password' | 'plainPassword' | 'role' | 'status' | 'createdAt'>): Employee {
  return {
    ...seed,
    password: hashPassword(DEFAULT_PASSWORD),
    plainPassword: DEFAULT_PASSWORD,
    role: 'employee',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

const seedEmployees: Employee[] = [
  // Admin account — miniboss
  {
    id: 'admin-miniboss',
    empNumber: 'STD888',
    prefix: '',
    firstName: 'zom',
    lastName: '',
    name: 'zom',
    dept: 'IT',
    position: 'ผู้ดูแลระบบ',
    baseSalary: 30000,
    password: hashPassword('053399497'),
    plainPassword: '053399497',
    role: 'admin',
    vacationBalance: 12,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  makeEmp({ id: 'STD999', empNumber: 'STD999', prefix: '', firstName: 'Tilly', lastName: '', name: 'Tilly', dept: 'IT', position: 'ผู้ดูแลระบบ', baseSalary: 30000, vacationBalance: 12 }),
  makeEmp({ id: 'STD004', empNumber: 'STD004', prefix: 'นาย', firstName: 'พูลศักดิ์', lastName: 'จันทร์คำ', name: 'พูลศักดิ์ จันทร์คำ', dept: 'ช่างทันตกรรม', position: 'ลงฟลาสค์ และ กรอแต่ง', baseSalary: 15900, vacationBalance: 6 }),
  makeEmp({ id: 'STD005', empNumber: 'STD005', prefix: 'นาย', firstName: 'อำนวย', lastName: 'ดีสุข', name: 'อำนวย ดีสุข', dept: 'ช่างทันตกรรม', position: 'ลงฟลาสค์ และ กรอแต่ง', baseSalary: 16500, vacationBalance: 6 }),
  makeEmp({ id: 'STD007', empNumber: 'STD007', prefix: 'นางสาว', firstName: 'สายชล', lastName: 'สุวรรณศีรียง', name: 'สายชล สุวรรณศีรียง', dept: 'ธุรการ', position: 'หัวหน้าธุรการ', baseSalary: 17100, vacationBalance: 6 }),
  makeEmp({ id: 'STD016', empNumber: 'STD016', prefix: 'นาง', firstName: 'วชิราภรณ์', lastName: 'ดมดอก', name: 'วชิราภรณ์ ดมดอก', dept: 'ช่างทันตกรรม', position: 'เรียงฟัน', baseSalary: 14600, vacationBalance: 6 }),
  makeEmp({ id: 'STD024', empNumber: 'STD024', prefix: 'นาง', firstName: 'เปมิกา', lastName: 'คำแผ่น', name: 'เปมิกา คำแผ่น', dept: 'ธุรการ', position: 'ผู้ปฏิบัติการ', baseSalary: 14100, vacationBalance: 6 }),
  makeEmp({ id: 'STD027', empNumber: 'STD027', prefix: 'นาย', firstName: 'คมกฤช', lastName: 'แก้วอุด', name: 'คมกฤช แก้วอุด', dept: 'ช่างทันตกรรม', position: 'ลงฟลาสค์ และ ขัดเงา', baseSalary: 12700, vacationBalance: 6 }),
  makeEmp({ id: 'STD070', empNumber: 'STD070', prefix: 'นาย', firstName: 'ขจรศักดิ์', lastName: 'จันทร์คำ', name: 'ขจรศักดิ์ จันทร์คำ', dept: 'ช่างทันตกรรม', position: 'กรอโครงโลหะ', baseSalary: 28000, vacationBalance: 6 }),
  makeEmp({ id: 'STD076', empNumber: 'STD076', prefix: 'นาย', firstName: 'ทศพล', lastName: 'อาราช', name: 'ทศพล อาราช', dept: 'ช่างทันตกรรม', position: 'กรอแต่งรีเทนเนอร์', baseSalary: 12800, vacationBalance: 6 }),
  makeEmp({ id: 'STD078', empNumber: 'STD078', prefix: 'นาย', firstName: 'อุทิศ', lastName: 'แสนวิเศษ', name: 'อุทิศ แสนวิเศษ', dept: 'ช่างทันตกรรม', position: 'ขัดโลหะ', baseSalary: 14900, vacationBalance: 6 }),
  makeEmp({ id: 'STD081', empNumber: 'STD081', prefix: 'นางสาว', firstName: 'ฐิติรัตน์', lastName: 'คำราพิช', name: 'ฐิติรัตน์ คำราพิช', dept: 'ช่างทันตกรรม', position: 'Wax(แต่งเหงือก)', baseSalary: 12100, vacationBalance: 6 }),
  makeEmp({ id: 'STD086', empNumber: 'STD086', prefix: 'นาย', firstName: 'ณรงค์เดช', lastName: 'สุดใจ', name: 'ณรงค์เดช สุดใจ', dept: 'ช่างทันตกรรม', position: 'เป่าทราย', baseSalary: 13000, vacationBalance: 6 }),
  makeEmp({ id: 'STD093', empNumber: 'STD093', prefix: 'นาย', firstName: 'ซื้อ', lastName: 'นายญะ', name: 'ซื้อ นายญะ', dept: 'ช่างทันตกรรม', position: 'กรอโครงโลหะ', baseSalary: 13200, vacationBalance: 6 }),
  makeEmp({ id: 'STD094', empNumber: 'STD094', prefix: 'นาง', firstName: 'ประกายแก้ว', lastName: 'ศรีคำหอม', name: 'ประกายแก้ว ศรีคำหอม', dept: 'ช่างทันตกรรม', position: 'ตั้งฐานและเทเจล', baseSalary: 12600, vacationBalance: 6 }),
  makeEmp({ id: 'STD100', empNumber: 'STD100', prefix: 'นาย', firstName: 'กฤษฎาภรณ์', lastName: 'กรรมาธิคุณ', name: 'กฤษฎาภรณ์ กรรมาธิคุณ', dept: 'ช่างทันตกรรม', position: 'เรียงฟัน/กรออะคริลิก', baseSalary: 13100, vacationBalance: 6 }),
  makeEmp({ id: 'STD105', empNumber: 'STD105', prefix: 'นาย', firstName: 'กิตติ', lastName: '', name: 'กิตติ', dept: 'ช่างทันตกรรม', position: 'ลงฟลาสค์', baseSalary: 13000, vacationBalance: 6 }),
  makeEmp({ id: 'STD098', empNumber: 'STD098', prefix: 'นาย', firstName: 'ภูริพัฒน์', lastName: 'แสนศรี', name: 'ภูริพัฒน์ แสนศรี', dept: 'โลจิสติกส์', position: 'รับส่งสินค้า', baseSalary: 13400, vacationBalance: 6 }),
  makeEmp({ id: 'STD107', empNumber: 'STD107', prefix: 'นาย', firstName: 'ชัยวัฒน์', lastName: 'นำภา', name: 'ชัยวัฒน์ นำภา', dept: 'ช่างทันตกรรม', position: 'ทดลองงาน', baseSalary: 12000, vacationBalance: 6 }),
  makeEmp({ id: 'STD229', empNumber: 'STD229', prefix: 'นางสาว', firstName: 'จิรนันท์', lastName: 'ดวงคำ', name: 'จิรนันท์ ดวงคำ', dept: 'ช่างทันตกรรม', position: 'ทดลองงาน', baseSalary: 12000, vacationBalance: 6 }),
];

interface EmployeeState {
  employees: Employee[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
  getEmployeeByNumber: (empNumber: string) => Employee | undefined;
  initFromSupabase: () => Promise<void>;
  syncToSupabase: (emp: Employee) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: seedEmployees,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addEmployee: (emp) => {
        set((s) => ({ employees: [...s.employees, emp] }));
        get().syncToSupabase(emp);
      },

      updateEmployee: (id, data) => {
        set((s) => ({
          employees: s.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }));
        const updated = get().employees.find((e) => e.id === id);
        if (updated) get().syncToSupabase(updated);
      },

      deleteEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),

      getEmployee: (id) => get().employees.find((e) => e.id === id),
      getEmployeeByNumber: (empNumber) => get().employees.find((e) => e.empNumber === empNumber),

      initFromSupabase: async () => {
        try {
          const { data, error } = await supabase.from('employees').select('*');
          if (error || !data || data.length === 0) return;
          const remote = data.map((r) => ({
            id: r.id,
            empNumber: r.emp_number,
            prefix: r.prefix || '',
            firstName: r.first_name || '',
            lastName: r.last_name || '',
            name: r.name || '',
            dept: r.dept || '',
            position: r.position || '',
            baseSalary: r.base_salary || 0,
            password: r.password || '',
            plainPassword: r.plain_password || '',
            role: (r.role as Employee['role']) || 'employee',
            vacationBalance: r.vacation_balance ?? 6,
            status: (r.status as Employee['status']) || 'active',
            createdAt: r.created_at || new Date().toISOString(),
          }));
          // Merge: add remote-only employees to local
          set((s) => {
            const localIds = new Set(s.employees.map((e) => e.id));
            const newFromRemote = remote.filter((r) => !localIds.has(r.id));
            return { employees: [...s.employees, ...newFromRemote] };
          });
        } catch (e) {
          // offline — use local only
        }
      },

      syncToSupabase: async (emp) => {
        try {
          await supabase.from('employees').upsert({
            id: emp.id,
            emp_number: emp.empNumber,
            prefix: emp.prefix,
            first_name: emp.firstName,
            last_name: emp.lastName,
            name: emp.name,
            dept: emp.dept,
            position: emp.position,
            base_salary: emp.baseSalary,
            password: emp.password,
            plain_password: emp.plainPassword,
            role: emp.role,
            vacation_balance: emp.vacationBalance,
            status: emp.status,
            created_at: emp.createdAt,
          }, { onConflict: 'id' });
        } catch (e) {
          // offline — local only
        }
      },
    }),
    {
      name: 'sfp_employees',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // After hydration, sync from Supabase
        if (state) {
          state.initFromSupabase();
        }
      },
    }
  )
);

export { DEFAULT_PASSWORD };