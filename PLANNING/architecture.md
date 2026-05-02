# 🗂️ STD Employee Finance Portal — Architecture

## System Overview

**Project:** STD Employee Finance Portal  
**Purpose:** Employee self-service portal for STD Dental Lab — loan requests, advance requests, and monthly salary deductions.  
**Target Users:** STD Dental Lab employees and administrators.

---

## System Architecture

### Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Login page | Public |
| `/dashboard` | Employee personal dashboard | Employee |
| `/tickets` | Ticket list (filtered by role) | Employee / Admin |
| `/tickets/new` | New loan/advance request form | Employee |
| `/admin` | Admin dashboard | Admin |
| `/admin/employees` | Employee management | Admin |
| `/admin/tickets` | Ticket approval queue | Admin |
| `/admin/loans` | Loan account management | Admin |
| `/admin/advances` | Advance account management | Admin |
| `/profile` | Profile view & password change | Employee |

---

### Component Structure

```
app/
├── page.tsx                    # Redirect → /login or /dashboard
├── login/
│   └── page.tsx                # Login form
├── (auth)/
│   └── layout.tsx              # Auth guard — redirect if not logged in
├── (app)/                      # Employee pages
│   ├── layout.tsx              # App shell (navbar, sidebar)
│   ├── dashboard/
│   │   └── page.tsx            # Personal summary
│   ├── tickets/
│   │   ├── page.tsx            # Own tickets list
│   │   └── new/
│   │       └── page.tsx        # New ticket form
│   └── profile/
│       └── page.tsx            # Profile & password change
└── (admin)/                    # Admin pages
    ├── layout.tsx              # Admin guard — redirect if not admin
    └── dashboard/
        └── page.tsx            # Admin overview stats
    ├── employees/
        └── page.tsx            # Employee CRUD
    ├── tickets/
        └── page.tsx            # Approve/reject tickets
    ├── loans/
        └── page.tsx            # Loan account management
    └── advances/
        └── page.tsx            # Advance account management
```

---

### Zustand Stores

| Store | State | Key |
|-------|-------|-----|
| `useAuthStore` | `user`, `login()`, `logout()`, `isAuthenticated` | `sfp_auth` |
| `useEmployeeStore` | `employees`, `addEmployee()`, `updateEmployee()`, `deleteEmployee()` | `sfp_employees` |
| `useTicketStore` | `tickets`, `addTicket()`, `updateTicket()`, `getByEmpId()` | `sfp_tickets` |
| `useLoanStore` | `loans`, `addLoan()`, `updateBalance()`, `getByEmpId()` | `sfp_loans` |
| `useAdvanceStore` | `advances`, `addAdvance()`, `updateBalance()`, `getByEmpId()` | `sfp_advances` |
| `useDeductionStore` | `deductions`, `scheduleDeduction()`, `markDeducted()`, `getPending()` | `sfp_deductions` |

---

### localStorage Keys

| Key | Data |
|-----|------|
| `sfp_auth` | Current user session (`Employee` object) |
| `sfp_employees` | Employee list (`Employee[]`) |
| `sfp_tickets` | All tickets (`Ticket[]`) |
| `sfp_loans` | Loan accounts (`LoanAccount[]`) |
| `sfp_advances` | Advance accounts (`AdvanceAccount[]`) |
| `sfp_deductions` | Scheduled deductions (`ScheduledDeduction[]`) |

---

## Data Models

### Employee
```typescript
interface Employee {
  id: string;
  empNumber: string;       // e.g. "STD001"
  prefix: string;          // "นาย", "นาง", "นางสาว"
  firstName: string;
  lastName: string;
  dept: string;
  position: string;
  password: string;        // bcrypt hashed
  role: 'employee' | 'admin';
  createdAt: string;       // ISO date
}
```

### Ticket
```typescript
interface Ticket {
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
```

### LoanAccount
```typescript
interface LoanAccount {
  empId: string;
  originalAmount: number;
  monthlyDeduction: number;
  previousBalance: number;
  currentBalance: number;
  startDate: string;
  status: 'active' | 'paid_off';
}
```

### AdvanceAccount
```typescript
interface AdvanceAccount {
  empId: string;
  totalAdvances: number;
  balance: number;
  status: 'active' | 'settled';
}
```

### ScheduledDeduction
```typescript
interface ScheduledDeduction {
  id: string;
  empId: string;
  ticketId: string;
  amount: number;
  month: string;           // "2026-05"
  status: 'pending' | 'deducted';
  deductedAt?: string;
}
```

---

## Ticket Workflow

```
Employee                    Admin                     System
   │                           │                         │
   ├─ Submit ticket ──────────►│                         │
   │   (type: loan/advance)    │                         │
   │   status: "pending"       │                         │
   │                           │                         │
   │                           ├─ Review & decide ──────►│
   │                           │   approve / reject      │
   │                           │                         │
   │                           │◄─ If approved:          │
   │                           │   create LoanAccount    │
   │                           │   or update AdvanceAccount
   │                           │                         │
   │                           │                         ├─ Schedule deduction
   │                           │                         │   for 15th of month
   │                           │                         │
   │                           │                         ├─ On 15th:
   │                           │                         │   deduct from salary
   │                           │                         │   update balances
   │                           │                         │   mark "deducted"
```

1. **Employee** submits ticket → `status: "pending"`
2. **Admin** views pending ticket at `/admin/tickets`
3. **Admin** clicks Approve or Reject
4. **On Approve:** Create `LoanAccount` or update `AdvanceAccount` → Create `ScheduledDeduction`
5. **On 15th of month:** Execute deduction → update `currentBalance` / `balance` → mark `deducted`

---

## Deduction Flow

```
Monthly on 15th:
┌─────────────────────────────────────────┐
│ 1. Get all ScheduledDeduction with      │
│    month = currentMonth AND status="pending"
│                                         │
│ 2. For each deduction:                  │
│    a. Find employee's salary record      │
│    b. Subtract amount from salary        │
│    c. Update LoanAccount.currentBalance │
│       or AdvanceAccount.balance         │
│    d. Update ScheduledDeduction.status   │
│       → "deducted"                      │
│    e. Record deductedAt timestamp       │
└─────────────────────────────────────────┘
```

**Note:** Since this uses localStorage (no real payroll system), a manual salary input or a mock salary slip display should be built in the admin dashboard to reflect deductions.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| State | Zustand |
| Persistence | localStorage |
| Forms | React Hook Form + Zod |
| Dates | dayjs |
| Icons | Lucide React |

---

## Security & Guards

- **Auth Guard** (`/(auth)/layout.tsx`): Redirects unauthenticated users to `/login`
- **Admin Guard** (`/(admin)/layout.tsx`): Redirects non-admin users to `/dashboard`
- **Passwords**: bcrypt-hashed before storing in localStorage
- **Route Protection**: Server components check session on every request

---

## Seed Data (Development)

```typescript
const seedEmployees: Employee[] = [
  {
    id: 'admin-001',
    empNumber: 'STD001',
    prefix: 'นาย',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    dept: 'IT',
    position: 'ผู้ดูแลระบบ',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-001',
    empNumber: 'STD002',
    prefix: 'นางสาว',
    firstName: 'สมหญิง',
    lastName: 'รักดี',
    dept: 'การเงิน',
    position: 'พนักงานบัญชี',
    password: bcrypt.hashSync('emp123', 10),
    role: 'employee',
    createdAt: new Date().toISOString(),
  },
];
```

---

## File Structure (Overview)

```
std-employee-finance-portal/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── (auth)/
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── tickets/
│   │   │   ├── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   └── (admin)/
│       ├── layout.tsx
│       ├── dashboard/
│       │   └── page.tsx
│       ├── employees/
│       │   └── page.tsx
│       ├── tickets/
│       │   └── page.tsx
│       ├── loans/
│       │   └── page.tsx
│       └── advances/
│           └── page.tsx
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   └── layouts/              # Layout components
├── stores/
│   ├── authStore.ts
│   ├── employeeStore.ts
│   ├── ticketStore.ts
│   ├── loanStore.ts
│   ├── advanceStore.ts
│   └── deductionStore.ts
├── lib/
│   ├── utils.ts
│   ├── validators.ts        # Zod schemas
│   └── seed.ts
├── types/
│   └── index.ts
└── package.json
```
