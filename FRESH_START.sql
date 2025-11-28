-- ============================================================
-- FRESH START - Complete Clean Setup
-- WARNING: This deletes existing data! Only run if starting fresh
-- ============================================================

-- Drop everything
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_department;
DROP INDEX IF EXISTS idx_tickets_created_by;
DROP INDEX IF EXISTS idx_tickets_assigned_to;
DROP INDEX IF EXISTS idx_tickets_status;
DROP INDEX IF EXISTS idx_tickets_priority;
DROP INDEX IF EXISTS idx_tickets_created_at;

-- ============================================================
-- CREATE USERS TABLE (fresh)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CREATE TICKETS TABLE (fresh)
-- ============================================================
CREATE TABLE public.tickets (
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

-- ============================================================
-- CREATE INDEXES
-- ============================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by_id);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);

-- ============================================================
-- INSERT DEMO USERS
-- ============================================================
INSERT INTO public.users (username, email, password, role, department)
VALUES 
  (
    'admin',
    'admin@example.com',
    '$2a$10$YIjlrVyFvj5GdTCKg.bkL.eH0bWUYqF4wfOH2hXrOppYvfI5E5tVe',
    'admin',
    'Management'
  ),
  (
    'manager',
    'manager@example.com',
    '$2a$10$nOaYLl0lQMAyaSKj.SLmV.YG7klvBZmKS6UdK3YnNBqPrVVd5WtSi',
    'manager',
    'Operations'
  );

-- ============================================================
-- VERIFY
-- ============================================================
-- Run this to verify:
-- SELECT username, email, role FROM public.users;
-- SELECT COUNT(*) FROM public.tickets;

-- ============================================================
-- ALL DONE! Fresh database ready
-- ============================================================
