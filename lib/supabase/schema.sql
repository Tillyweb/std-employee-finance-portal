-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  emp_number TEXT UNIQUE NOT NULL,
  prefix TEXT,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  dept TEXT,
  position TEXT,
  base_salary INTEGER DEFAULT 0,
  password TEXT,
  plain_password TEXT,
  role TEXT DEFAULT 'employee',
  vacation_balance INTEGER DEFAULT 6,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  emp_id TEXT,
  type TEXT,
  amount INTEGER,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  created_at TEXT DEFAULT NOW(),
  updated_at TEXT DEFAULT NOW(),
  processed_at TEXT,
  processed_by TEXT
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  emp_id TEXT PRIMARY KEY,
  name TEXT,
  dept TEXT,
  position TEXT,
  monthly_deduction INTEGER DEFAULT 0,
  previous_balance INTEGER DEFAULT 0,
  current_balance INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- Advances table
CREATE TABLE IF NOT EXISTS advances (
  emp_id TEXT PRIMARY KEY,
  name TEXT,
  dept TEXT,
  position TEXT,
  installments JSONB DEFAULT '[]',
  total_advanced INTEGER DEFAULT 0,
  balance INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  icon TEXT,
  description TEXT,
  type TEXT,
  timestamp INTEGER
);