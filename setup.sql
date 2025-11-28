-- PRODUCTION TICKET MANAGEMENT SYSTEM - COMPLETE SETUP
-- Run this SQL file once in Supabase SQL Editor

DROP TABLE IF EXISTS public.ticket_replies CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Users table with plant support
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  plant TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table with categories and plant tracking
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  plant TEXT,
  created_by_id UUID NOT NULL,
  assigned_to_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket replies for conversation thread
CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_plant ON public.users(plant);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by_id);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_plant ON public.tickets(plant);
CREATE INDEX idx_replies_ticket ON public.ticket_replies(ticket_id);

-- Demo users
INSERT INTO public.users (username, email, password, role, plant, department) VALUES
('admin', 'admin@example.com', '$2b$10$etuccpBpRbbdx6IsKk3TTuy4uUEOzcVpCdrU1lg1BWXYXa4OzkKnG', 'admin', NULL, 'Management'),
('manager', 'manager@example.com', '$2b$10$TuguM11YOFL24lTpg7PmfeYwzJlgtTLXuXocYVKfuUbEM.bUOSyNq', 'manager', 'Plant A', 'Operations')
ON CONFLICT (email) DO NOTHING;
