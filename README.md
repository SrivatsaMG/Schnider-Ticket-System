# Production Ticket Management System - Role-Based Access Control

A comprehensive, full-stack ticket management system with three-tier role-based access control for production issue tracking.

## 🎯 Three-Role System

### 1. **Admin** 👨‍💼
- **Email:** admin@example.com
- **Password:** admin123
- **Permissions:**
  - View all tickets in the system
  - Create tickets
  - Edit all tickets
  - Delete any ticket
  - Assign tickets to team members
  - Manage users and roles
  - View system reports

### 2. **Manager** 👨‍✈️
- **Email:** manager@example.com
- **Password:** manager123
- **Permissions:**
  - View all department tickets
  - Create tickets
  - Edit all tickets in department
  - Assign tickets to team members
  - View department reports
  - Cannot manage users
  - Cannot delete tickets (can resolve instead)

### 3. **Employee** 👤
- **Create:** Register yourself on signup page
- **Permissions:**
  - Create own tickets
  - View own created tickets
  - View assigned tickets
  - Cannot view other employees' tickets
  - Cannot assign tickets
  - Cannot delete tickets
  - Cannot manage users

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher

### Installation

```bash
npm install
npm run dev
```

### Access the Application
- Open http://localhost:5000
- Choose your role to login:
  - **Admin:** admin@example.com / admin123
  - **Manager:** manager@example.com / manager123
  - **Employee:** Create account via registration

## 🗄️ Database Setup (Supabase)

Run this SQL in your Supabase SQL Editor:

```sql
-- Users table with role field
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  department TEXT,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON public.tickets(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register as employee
- `POST /api/auth/login` - Standard login
- `GET /api/auth/me` - Get current user
- `GET /api/permissions` - Get role-based permissions

### Ticket Management
- `POST /api/tickets` - Create ticket (All roles)
- `GET /api/tickets` - Get accessible tickets (role-based filtering)
- `GET /api/tickets/:id` - Get ticket details
- `PATCH /api/tickets/:id` - Update ticket (permissions checked)
- `DELETE /api/tickets/:id` - Delete ticket (Admin/Manager only)
- `POST /api/tickets/:id/assign` - Assign ticket (Admin/Manager only)

### User Management
- `GET /api/users` - Get all users (Admin only)

## 🔐 Role-Based Permission Matrix

| Feature | Admin | Manager | Employee |
|---------|-------|---------|----------|
| Create Ticket | ✅ | ✅ | ✅ |
| View All Tickets | ✅ | ✅ | ❌ |
| View Own Tickets | ✅ | ✅ | ✅ |
| Edit All Tickets | ✅ | ✅ | ❌ |
| Delete Tickets | ✅ | ❌ | ❌ |
| Assign Tickets | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ |

## 🌊 Ticket Status Flow

- **Open** → Initial state when ticket is created
- **In Progress** → Being worked on
- **Resolved** → Issue fixed, awaiting verification
- **Closed** → Verified and archived

## ⚡ Priority Levels

- **Low** - Can be addressed in future releases
- **Medium** (default) - Normal priority
- **High** - Needs urgent attention
- **Critical** - Immediate action required, impacts production

## 📊 Tech Stack

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS + Shadcn/UI
- Wouter (Routing)
- React Hook Form + Zod (Validation)
- TanStack Query

**Backend:**
- Node.js + Express
- TypeScript
- Drizzle ORM
- Bcryptjs (Password hashing)
- Supabase (Database)

**Deployment:**
- Local only (As requested)
- Or Docker/Custom server

## 📦 Project Structure

```
├── client/
│   └── src/pages/
│       ├── login.tsx
│       ├── admin-login.tsx
│       ├── manager-login.tsx
│       ├── register.tsx
│       ├── dashboard.tsx
│       ├── tickets.tsx
│       ├── ticket-detail.tsx
│       └── create-ticket.tsx
├── server/
│   ├── routes.ts (Role-based authorization)
│   └── storage.ts (Data operations)
├── shared/
│   └── schema.ts (Data models + permissions)
└── README.md
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ Backend permission validation
- ✅ Input validation with Zod schemas
- ✅ Protected API endpoints
- ✅ Environment variable protection

## 📝 Usage Scenarios

### Admin Workflow
1. Login as admin
2. View all tickets system-wide
3. Assign tickets to managers/employees
4. Manage user roles
5. Delete problematic tickets
6. Monitor entire system

### Manager Workflow
1. Login as manager
2. View all department tickets
3. Assign tickets to team members
4. Update ticket status
5. Track team productivity
6. Escalate critical issues

### Employee Workflow
1. Register account
2. Create ticket about issue
3. View own tickets
4. Track assigned work
5. Get feedback from managers
6. Update ticket status

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 📋 Demo Accounts (Pre-loaded)

1. **Admin**
   - Email: admin@example.com
   - Password: admin123

2. **Manager**
   - Email: manager@example.com
   - Password: manager123

3. **Employee**
   - Register new account yourself
   - Use any email/password

## ✨ Features

- ✅ Three-tier role system (Admin, Manager, Employee)
- ✅ Ticket creation and management
- ✅ Status and priority tracking
- ✅ User assignment system
- ✅ Role-based UI filtering
- ✅ Backend permission validation
- ✅ Responsive design
- ✅ Works without Supabase (in-memory fallback)
- ✅ Immediate ready-to-use system

## 🎯 Production Ready

Your system is fully functional with:
- Complete role-based access control
- Backend authorization checks
- Three pre-configured user types
- All features implemented
- Works locally without external dependencies

---

**Version:** 2.0.0 (Role-Based Access Control)  
**Last Updated:** November 2024  
**Status:** Ready for Local Deployment ✅
