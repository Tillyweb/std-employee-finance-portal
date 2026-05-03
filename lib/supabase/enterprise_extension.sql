-- Original Tables for Finance Portal
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

-- ==============================================
-- Enterprise AI Backend Extension
-- Version: 1.0 (2026-05-03)
-- ==============================================

-- event_queue for agent communication
CREATE TABLE IF NOT EXISTS event_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  source_dept TEXT NOT NULL,
  source_agent TEXT NOT NULL,
  target_dept TEXT,
  target_agent TEXT,
  payload JSONB NOT NULL,
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'PENDING',
  result_payload JSONB,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  signature TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_queue_status ON event_queue(status);
CREATE INDEX IF NOT EXISTS idx_event_queue_event_type ON event_queue(event_type);

-- agent_status for tracking
CREATE TABLE IF NOT EXISTS agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT UNIQUE NOT NULL,
  agent_name TEXT NOT NULL,
  dept TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'IDLE',
  current_task_id UUID,
  current_event_id TEXT,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  last_completed_task TEXT,
  total_tasks_completed INT DEFAULT 0,
  total_tasks_failed INT DEFAULT 0,
  token_usage_today INT DEFAULT 0,
  token_budget INT DEFAULT 50000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_status_dept ON agent_status(dept);
CREATE INDEX IF NOT EXISTS idx_agent_status_status ON agent_status(status);

-- audit_log for tiwly oversight
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source_agent TEXT NOT NULL,
  payload_preview TEXT,
  anomaly_detected BOOLEAN DEFAULT FALSE,
  anomaly_type TEXT,
  anomaly_details JSONB,
  action_taken TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize default agents
INSERT INTO agent_status (agent_id, agent_name, dept, role, status) VALUES
  ('tiffany', 'ทิฟฟี่', 'command', 'CEO', 'IDLE'),
  ('tiwly', 'ทิวลี่', 'command', 'Deputy CEO', 'IDLE'),
  ('haru', 'ฮารุ', 'ops', 'HR Collector', 'IDLE'),
  ('mayer', 'ไมเออร์', 'ops', 'Payroll', 'IDLE'),
  ('agent', 'เอเจ้นต์', 'ops', 'Report', 'IDLE')
ON CONFLICT (agent_id) DO NOTHING;
