-- ============================================================
-- MIGRATION - Add role column to existing users table
-- Use this if you already have a users table without role column
-- ============================================================

-- Add role column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee';

-- Add role index if needed
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Update any existing users to have a role (if not already set)
UPDATE public.users SET role = 'employee' WHERE role IS NULL;

-- Now you can insert demo users
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
  )
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT username, email, role FROM public.users;
