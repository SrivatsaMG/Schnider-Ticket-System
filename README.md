# Production Ticket Management System

A modern, full-stack ticket management application designed for internal company use to track and manage production issues efficiently.

## 🎯 Features

### User Authentication
- **User Registration** - Create new employee accounts
- **Secure Login** - Email and password authentication
- **Admin Access** - Dedicated admin login for management functions
- **Password Security** - Bcryptjs hashing for secure password storage

### Ticket Management
- **Create Tickets** - Report production issues with title, description, and priority
- **View Tickets** - Dashboard showing all relevant tickets
- **Update Status** - Track ticket progress (Open → In Progress → Resolved → Closed)
- **Priority Tracking** - Mark issues as Low, Medium, High, or Critical
- **Assign Tickets** - Admins can assign tickets to team members
- **Delete Tickets** - Remove resolved or duplicate tickets

### Admin Dashboard
- View all system tickets
- Manage user assignments
- Update ticket status and priority
- Monitor production issues

### User Dashboard
- View personal profile
- Access ticket management system
- Create and manage tickets
- Track assigned issues

## 🛠️ Tech Stack

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/UI Components
- Wouter (Routing)
- React Hook Form
- Zod (Validation)
- Sonner (Notifications)
- TanStack Query

**Backend:**
- Node.js with Express
- TypeScript
- Drizzle ORM
- Bcryptjs (Password hashing)
- Supabase (Database)
- Zod (Schema validation)

**Deployment:**
- Vercel (Recommended)
- Supabase (Database)

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- Supabase account (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project-directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5000
   - Login with demo credentials:
     - Email: `admin@example.com`
     - Password: `admin123`

## 📋 Demo Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123
- **Access:** Admin dashboard with full system management

### Regular User
- Create your own account via registration page
- Access ticket creation and management

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### Step 2: Create Tables
Run this SQL in Supabase SQL Editor:

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON public.tickets(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
```

## 🌐 API Endpoints

### Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin-login` | Admin login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users` | Get all users |

### Ticket Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets` | Create new ticket |
| GET | `/api/tickets` | Get user's tickets |
| GET | `/api/tickets/:id` | Get ticket details |
| PATCH | `/api/tickets/:id` | Update ticket |
| DELETE | `/api/tickets/:id` | Delete ticket |
| POST | `/api/tickets/:id/assign` | Assign ticket to user |

## 📱 Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | User login page |
| `/register` | Public | User registration |
| `/admin-login` | Public | Admin login |
| `/dashboard` | User | User profile dashboard |
| `/admin-dashboard` | Admin | Admin management panel |
| `/tickets` | User | Ticket list view |
| `/create-ticket` | User | Create new ticket form |
| `/ticket/:id` | User | Ticket detail & edit |

## 🔄 Ticket Lifecycle

1. **Open** - Ticket created, waiting for assignment
2. **In Progress** - Admin/Team member working on issue
3. **Resolved** - Issue fixed, awaiting confirmation
4. **Closed** - Issue confirmed resolved, ticket archived

## 🎨 Priority Levels

- **Low** - Can be addressed in future releases
- **Medium** - Should be handled soon
- **High** - Needs urgent attention
- **Critical** - Immediate action required, impacts production

## 📦 Project Structure

```
.
├── client/
│   └── src/
│       ├── pages/
│       │   ├── login.tsx              # User login
│       │   ├── register.tsx           # User registration
│       │   ├── dashboard.tsx          # User dashboard
│       │   ├── admin-login.tsx        # Admin login
│       │   ├── admin-dashboard.tsx    # Admin panel
│       │   ├── tickets.tsx            # Ticket list
│       │   ├── create-ticket.tsx      # Create ticket
│       │   └── ticket-detail.tsx      # Ticket details
│       ├── components/                # UI Components
│       ├── lib/                       # Utilities
│       ├── App.tsx                    # Main app component
│       └── index.css                  # Styles
├── server/
│   ├── index.ts                       # Express server
│   ├── routes.ts                      # API routes
│   └── storage.ts                     # Database operations
├── shared/
│   └── schema.ts                      # Data models & validation
├── script/
│   └── build.ts                       # Build script
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vite config
└── vercel.json                        # Vercel deployment config
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ticket system"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Environment Variables**
   In Vercel dashboard, add:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### Local Production Build

```bash
npm run build
npm run start
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ Admin role-based access control
- ✅ Input validation with Zod schemas
- ✅ Secure session management
- ✅ Environment variable protection
- ✅ CORS configuration for production

## 📊 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema to database

# Code Quality
npm run check            # Run TypeScript check
```

## 🎯 Usage Examples

### Creating a Ticket
1. Go to `/tickets`
2. Click "Create Ticket"
3. Fill in title, description, and priority
4. Click "Create Ticket"

### Assigning a Ticket (Admin)
1. Go to ticket detail page
2. Use "Assign To" dropdown to select team member
3. Change status as needed
4. Changes are saved automatically

### Managing Tickets (Admin)
1. Go to `/admin-dashboard`
2. View all tickets in system
3. Click on any ticket to manage
4. Update status and assignments
5. Delete resolved tickets

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Ensure tables are created with correct schema

### Login Not Working
- Verify credentials are correct
- Admin account: `admin@example.com` / `admin123`
- Check if user is registered

### Tickets Not Showing
- Ensure database tables are created
- Verify user is logged in
- Check browser console for errors

## 📞 Support

For issues or questions:
1. Check the logs: `npm run dev`
2. Verify database connection
3. Ensure environment variables are set
4. Review the DEPLOYMENT_GUIDE.md for detailed setup

## 📝 License

This project is proprietary software for internal company use.

## 🎉 Ready to Use!

Your production ticket management system is ready to deploy. All features are fully functional:

- ✅ User authentication
- ✅ Ticket creation and management
- ✅ Admin dashboard
- ✅ Status and priority tracking
- ✅ User assignment
- ✅ Responsive design

Start managing your production tickets today!

---

**Last Updated:** November 2024  
**Version:** 1.0.0
