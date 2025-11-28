-- PRODUCTION TICKET MANAGEMENT SYSTEM - COMPLETE DATABASE SETUP WITH ALL TABLES
-- Run this SQL script to create all required tables with proper relationships

-- Drop existing tables if they exist (optional - remove if you want to preserve data)
DROP TABLE IF EXISTS public.ticket_replies CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.plants CASCADE;

-- ============================================================================
-- PLANTS TABLE - Stores all production plants
-- ============================================================================
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  manager_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for plants
CREATE INDEX idx_plants_name ON public.plants(name);
CREATE INDEX idx_plants_manager ON public.plants(manager_id);

-- Add comments for plants table
COMMENT ON TABLE public.plants IS 'Production plants - physical locations where operations occur';
COMMENT ON COLUMN public.plants.id IS 'Unique identifier for the plant';
COMMENT ON COLUMN public.plants.name IS 'Plant name (must be unique)';
COMMENT ON COLUMN public.plants.location IS 'Physical location of the plant';
COMMENT ON COLUMN public.plants.manager_id IS 'Reference to the manager user managing this plant';
COMMENT ON COLUMN public.plants.created_at IS 'Timestamp when plant was created';

-- ============================================================================
-- USERS TABLE - Stores all system users with role-based access
-- ============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  plant TEXT REFERENCES public.plants(name) ON DELETE SET NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_plant ON public.users(plant);
CREATE INDEX idx_users_username ON public.users(username);

-- Add comments for users table
COMMENT ON TABLE public.users IS 'System users with role-based permissions and plant assignments';
COMMENT ON COLUMN public.users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN public.users.username IS 'Login username (must be unique)';
COMMENT ON COLUMN public.users.email IS 'Email address (must be unique)';
COMMENT ON COLUMN public.users.password IS 'Hashed password';
COMMENT ON COLUMN public.users.role IS 'User role: admin (full access), manager (plant management), employee (basic access)';
COMMENT ON COLUMN public.users.plant IS 'Plant assignment for managers and employees';
COMMENT ON COLUMN public.users.department IS 'Department of the user';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when user was created';

-- ============================================================================
-- TICKETS TABLE - Stores all production tickets/issues
-- ============================================================================
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('General', 'Bug', 'Feature Request', 'Issue Report', 'Maintenance', 'Other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'inProgress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  plant TEXT REFERENCES public.plants(name) ON DELETE SET NULL,
  created_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_to_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for tickets
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by_id);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_plant ON public.tickets(plant);
CREATE INDEX idx_tickets_category ON public.tickets(category);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);

-- Add comments for tickets table
COMMENT ON TABLE public.tickets IS 'Production tickets/issues created by employees and managed by staff';
COMMENT ON COLUMN public.tickets.id IS 'Unique identifier for the ticket';
COMMENT ON COLUMN public.tickets.title IS 'Brief title of the ticket';
COMMENT ON COLUMN public.tickets.description IS 'Detailed description of the issue';
COMMENT ON COLUMN public.tickets.category IS 'Category of the ticket for organization';
COMMENT ON COLUMN public.tickets.status IS 'Current status of the ticket';
COMMENT ON COLUMN public.tickets.priority IS 'Priority level for ticket resolution';
COMMENT ON COLUMN public.tickets.plant IS 'Plant where the issue occurred';
COMMENT ON COLUMN public.tickets.created_by_id IS 'User who created the ticket';
COMMENT ON COLUMN public.tickets.assigned_to_id IS 'User assigned to resolve the ticket';
COMMENT ON COLUMN public.tickets.created_at IS 'Timestamp when ticket was created';
COMMENT ON COLUMN public.tickets.updated_at IS 'Timestamp when ticket was last updated';

-- ============================================================================
-- TICKET_REPLIES TABLE - Stores conversation threads on tickets
-- ============================================================================
CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for ticket replies
CREATE INDEX idx_replies_ticket ON public.ticket_replies(ticket_id);
CREATE INDEX idx_replies_user ON public.ticket_replies(user_id);
CREATE INDEX idx_replies_created_at ON public.ticket_replies(created_at DESC);

-- Add comments for ticket_replies table
COMMENT ON TABLE public.ticket_replies IS 'Conversation messages on tickets between users and staff';
COMMENT ON COLUMN public.ticket_replies.id IS 'Unique identifier for the reply';
COMMENT ON COLUMN public.ticket_replies.ticket_id IS 'Reference to the ticket being replied to';
COMMENT ON COLUMN public.ticket_replies.user_id IS 'User who posted the reply';
COMMENT ON COLUMN public.ticket_replies.message IS 'Content of the reply message';
COMMENT ON COLUMN public.ticket_replies.created_at IS 'Timestamp when reply was created';

-- ============================================================================
-- DEMO DATA - Insert test users and plant
-- ============================================================================

-- Insert demo plant
INSERT INTO public.plants (name, location) 
VALUES ('Plant A', 'Location A')
ON CONFLICT (name) DO NOTHING;

-- Insert demo users with hashed passwords
-- Admin: admin@example.com / admin123
-- Manager: manager@example.com / manager123
INSERT INTO public.users (username, email, password, role, plant, department) 
VALUES 
  ('admin', 'admin@example.com', '$2b$10$etuccpBpRbbdx6IsKk3TTuy4uUEOzcVpCdrU1lg1BWXYXa4OzkKnG', 'admin', NULL, 'Management'),
  ('manager', 'manager@example.com', '$2b$10$TuguM11YOFL24lTpg7PmfeYwzJlgtTLXuXocYVKfuUbEM.bUOSyNq', 'manager', 'Plant A', 'Operations')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- GRANTS & PERMISSIONS (if using a specific user, uncomment and adjust)
-- ============================================================================
-- GRANT ALL PRIVILEGES ON public.plants TO your_user;
-- GRANT ALL PRIVILEGES ON public.users TO your_user;
-- GRANT ALL PRIVILEGES ON public.tickets TO your_user;
-- GRANT ALL PRIVILEGES ON public.ticket_replies TO your_user;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- All tables have been created successfully with:
-- - plants: Production plants
-- - users: System users with roles (admin, manager, employee)
-- - tickets: Production tickets/issues with categories and priorities
-- - ticket_replies: Conversation threads on tickets
--
-- Demo credentials:
-- Admin: admin@example.com / admin123
-- Manager: manager@example.com / manager123
-- ============================================================================
