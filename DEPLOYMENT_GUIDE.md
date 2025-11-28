# Production Ticket Management System - Deployment Guide

## 🚀 Quick Start

### Demo Credentials
- **Admin Login:**
  - Email: `admin@example.com`
  - Password: `admin123`

- **New User:**
  - Go to register page and create your account

## ✅ System Features

### Authentication
- User registration with email validation
- Secure login (both user & admin)
- Admin-only dashboard access
- Password hashing with bcryptjs

### Ticket Management
- **Create Tickets** - Report production issues with title, description, priority
- **View Tickets** - See all assigned and created tickets
- **Update Tickets** - Change status and priority
- **Assign Tickets** - Admin can assign tickets to team members
- **Delete Tickets** - Remove closed/resolved tickets

### Priority Levels
- Low
- Medium (default)
- High
- Critical

### Ticket Status
- Open (default)
- In Progress
- Resolved
- Closed

## 🗄️ Database Setup (Supabase)

Run this SQL in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON public.tickets(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `GET /api/users` - Get all users (for assignment)

### Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets` - Get user's tickets
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/:id/assign` - Assign ticket to user

## 🌐 Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ticket system"
   git push origin main
   ```

2. **Add to Vercel**
   - Go to vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `SUPABASE_URL` - Your Supabase project URL
     - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - Click Deploy

3. **Your app will be live at:** `https://your-project.vercel.app`

## 💾 Data Persistence

- **In-Memory Mode** (Default, for testing)
  - Works immediately without database
  - Data cleared on server restart
  
- **Supabase Mode** (Production)
  - Persistent data
  - Multi-user support
  - Automatic admin user creation

The system automatically detects when Supabase is available and uses it. Falls back to in-memory if not configured.

## 🔐 Security Notes

- All passwords are hashed with bcryptjs
- Admin routes are protected
- Data validation with Zod schemas
- CORS-enabled for production

## 📊 File Structure

```
├── shared/schema.ts          # Data models & validation
├── server/
│   ├── index.ts              # Express server setup
│   ├── routes.ts             # API endpoints
│   └── storage.ts            # Database operations
├── client/src/pages/
│   ├── login.tsx             # User login
│   ├── register.tsx          # User registration
│   ├── dashboard.tsx         # User dashboard
│   ├── admin-login.tsx       # Admin login
│   ├── admin-dashboard.tsx   # Admin panel
│   ├── tickets.tsx           # Ticket list
│   ├── create-ticket.tsx     # Create new ticket
│   └── ticket-detail.tsx     # Ticket details & management
└── vercel.json               # Vercel deployment config
```

## ✨ Ready to Use!

Your application is fully functional and production-ready. All features are working:
- ✅ Authentication (user & admin)
- ✅ Ticket creation & management
- ✅ Status & priority tracking
- ✅ User assignment
- ✅ Admin dashboard
- ✅ Responsive UI

Start using it now! Visit `/login` to get started.
