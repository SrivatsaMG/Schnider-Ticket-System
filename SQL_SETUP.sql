-- ==========================================
-- PRODUCTION TICKET MANAGEMENT SYSTEM
-- Role-Based Access Control SQL Setup
-- ==========================================

-- Drop existing tables if needed (optional)
-- DROP TABLE IF EXISTS public.tickets;
-- DROP TABLE IF EXISTS public.users;

-- ==========================================
-- Users Table with Role Support
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- Tickets Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_by_id UUID NOT NULL,
  assigned_to_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- Indexes for Performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON public.tickets(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

-- ==========================================
-- Insert Demo Data (Optional)
-- ==========================================

-- Admin User
-- Email: admin@example.com
-- Password: admin123 (hashed: $2a$10$...)
-- To use: Copy hashed password from bcryptjs.hashSync("admin123", 10)
INSERT INTO public.users (username, email, password, role, department)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$YIjlrVyFvj5GdTCKg.bkL.eH0bWUYqF4wfOH2hXrOppYvfI5E5tVe', -- admin123
  'admin',
  'Management'
)
ON CONFLICT (email) DO NOTHING;

-- Manager User
-- Email: manager@example.com
-- Password: manager123 (hashed)
INSERT INTO public.users (username, email, password, role, department)
VALUES (
  'manager',
  'manager@example.com',
  '$2a$10$nOaYLl0lQMAyaSKj.SLmV.YG7klvBZmKS6UdK3YnNBqPrVVd5WtSi', -- manager123
  'manager',
  'Operations'
)
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- Role Constants
-- ==========================================
-- admin     - Full system access
-- manager   - Department/team management
-- employee  - Individual contributor (default)

-- ==========================================
-- Permission Levels by Role
-- ==========================================

-- ADMIN:
--   ✅ Create Ticket
--   ✅ View All Tickets
--   ✅ Edit All Tickets
--   ✅ Delete Tickets
--   ✅ Assign Tickets
--   ✅ Manage Users
--   ✅ View Reports

-- MANAGER:
--   ✅ Create Ticket
--   ✅ View All Tickets (department)
--   ✅ Edit All Tickets
--   ❌ Delete Tickets
--   ✅ Assign Tickets
--   ❌ Manage Users
--   ✅ View Reports

-- EMPLOYEE:
--   ✅ Create Ticket
--   ✅ View Own Tickets
--   ✅ Edit Own Tickets
--   ❌ Delete Tickets
--   ❌ Assign Tickets
--   ❌ Manage Users
--   ❌ View Reports

-- ==========================================
-- Ticket Status Values
-- ==========================================
-- open        - Newly created, waiting for action
-- inProgress  - Currently being worked on
-- resolved    - Issue fixed, awaiting verification
-- closed      - Verified and completed

-- ==========================================
-- Priority Values
-- ==========================================
-- low      - Can be addressed in future releases
-- medium   - Normal priority (default)
-- high     - Needs urgent attention
-- critical - Immediate action required

-- ==========================================
-- Views for Reporting (Optional)
-- ==========================================

-- All Open Tickets
CREATE OR REPLACE VIEW public.open_tickets AS
SELECT 
  t.id,
  t.title,
  t.priority,
  t.status,
  u.username as created_by,
  a.username as assigned_to,
  t.created_at
FROM public.tickets t
LEFT JOIN public.users u ON t.created_by_id = u.id
LEFT JOIN public.users a ON t.assigned_to_id = a.id
WHERE t.status = 'open'
ORDER BY t.priority DESC, t.created_at DESC;

-- Tickets by Department
CREATE OR REPLACE VIEW public.department_tickets AS
SELECT 
  u.department,
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets,
  COUNT(CASE WHEN t.priority = 'critical' THEN 1 END) as critical_tickets
FROM public.tickets t
LEFT JOIN public.users u ON t.created_by_id = u.id
GROUP BY u.department;

-- User Activity
CREATE OR REPLACE VIEW public.user_activity AS
SELECT 
  u.username,
  u.role,
  u.department,
  COUNT(DISTINCT t.id) as tickets_created,
  COUNT(DISTINCT CASE WHEN t.assigned_to_id = u.id THEN t.id END) as tickets_assigned
FROM public.users u
LEFT JOIN public.tickets t ON u.id = t.created_by_id OR u.id = t.assigned_to_id
GROUP BY u.id, u.username, u.role, u.department;

-- ==========================================
-- Row Level Security (Optional - Advanced)
-- ==========================================

-- Enable RLS
-- ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Admin can see all
-- CREATE POLICY admin_all ON public.tickets
--   FOR ALL TO authenticated
--   USING (auth.jwt() ->> 'role' = 'admin');

-- Employees see only their own
-- CREATE POLICY employee_own ON public.tickets
--   FOR SELECT TO authenticated
--   USING (created_by_id = auth.uid() OR assigned_to_id = auth.uid());

-- ==========================================
-- Notes
-- ==========================================
-- 1. Password hashes are pre-computed with bcryptjs
-- 2. To generate new password hash in Node:
--    bcrypt.hashSync("yourpassword", 10)
-- 3. Department field helps with manager filtering
-- 4. All timestamps are in UTC (withTimezone: true)
-- 5. Views can be used for reporting dashboards
-- 6. RLS policies optional - backend also validates permissions
