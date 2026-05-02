export interface Employee {
  id: string; // e.g. "STD001"
  empNumber: string;
  prefix: string;
  firstName: string;
  lastName: string;
  name: string; // full name
  dept: string;
  position: string;
  baseSalary: number;
  password: string; // btoa hashed
  role: 'employee' | 'admin';
  vacationBalance: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Ticket {
  id: string;
  empId: string;
  type: 'loan' | 'advance';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface LoanAccount {
  empId: string;
  name: string;
  dept: string;
  position: string;
  monthlyDeduction: number;
  previousBalance: number;
  currentBalance: number;
  status: 'active' | 'paid_off';
}

export interface AdvanceAccount {
  empId: string;
  name: string;
  dept: string;
  position: string;
  installments: AdvanceRecord[];
  totalAdvanced: number;
  balance: number;
  status: 'active' | 'settled';
}

export interface AdvanceRecord {
  installment: number;
  amount: number;
  approvedAt: string;
}

export interface Activity {
  id: string;
  icon: string;
  description: string;
  timestamp: number;
  type: 'ticket' | 'loan' | 'advance' | 'auth' | 'payroll';
}