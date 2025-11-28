-- ============================================================
-- PRODUCTION TICKET MANAGEMENT SYSTEM - DATABASE SETUP
-- Role-Based Access Control with 3 User Tiers
-- ============================================================
-- How to Use: Copy all code below and paste into your SQL compiler
-- (Supabase SQL Editor, pgAdmin, or any PostgreSQL client)
-- ============================================================

-- ============================================================
-- STEP 1: CREATE USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- STEP 2: CREATE TICKETS TABLE
-- ============================================================
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

-- ============================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON public.tickets(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

-- ============================================================
-- STEP 4: INSERT ADMIN USER
-- ============================================================
-- Email: admin@example.com
-- Password: admin123
INSERT INTO public.users (username, email, password, role, department)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$YIjlrVyFvj5GdTCKg.bkL.eH0bWUYqF4wfOH2hXrOppYvfI5E5tVe',
  'admin',
  'Management'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- STEP 5: INSERT MANAGER USER
-- ============================================================
-- Email: manager@example.com
-- Password: manager123
INSERT INTO public.users (username, email, password, role, department)
VALUES (
  'manager',
  'manager@example.com',
  '$2a$10$nOaYLl0lQMAyaSKj.SLmV.YG7klvBZmKS6UdK3YnNBqPrVVd5WtSi',
  'manager',
  'Operations'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- DONE! Your database is ready to use
-- ============================================================
-- 
-- Pre-loaded Demo Accounts:
-- 
-- 1. ADMIN
--    Email: admin@example.com
--    Password: admin123
--
-- 2. MANAGER
--    Email: manager@example.com
--    Password: manager123
--
-- 3. EMPLOYEE
--    Create via app registration page
--
-- ============================================================
