import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { verifyPassword } from '@/lib/utils';
import { useEmployeeStore } from './employeeStore';
import { Employee } from '@/types';

interface AuthState {
  currentUser: Employee | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (empId: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      login: (empId, password) => {
        const employees = useEmployeeStore.getState().employees;
        const emp = employees.find((e) => e.empNumber === empId && e.status === 'active');
        if (!emp) return false;
        if (!verifyPassword(password, emp.password)) return false;
        set({ currentUser: emp, isAuthenticated: true });
        return true;
      },
      logout: () => { set({ currentUser: null, isAuthenticated: false }); window.location.href = '/login'; },
    }),
    {
      name: 'sfp_auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);