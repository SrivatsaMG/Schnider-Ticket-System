# Production Ticket Management System

## Overview

A full-stack ticket management system designed for production environments with three-tier role-based access control (RBAC). The system enables teams to create, track, and manage production issues through a web-based interface with different permission levels for administrators, managers, and employees.

The application uses a React frontend with TypeScript and shadcn/ui components, an Express backend, and supports both Supabase and in-memory storage options. The system features comprehensive ticket lifecycle management, user authentication, plant-based organization, and real-time notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Components**: shadcn/ui component library built on Radix UI primitives
- Provides accessible, pre-styled components (cards, dialogs, forms, badges, etc.)
- Consistent design system with Tailwind CSS v4
- Dark mode support via CSS custom properties

**Routing**: Wouter for client-side routing
- Lightweight alternative to React Router
- File-based page structure in `client/src/pages/`

**State Management**: 
- TanStack Query (React Query) for server state
- Local storage for authentication state persistence
- React hooks for component-level state

**Form Handling**: React Hook Form with Zod validation
- Type-safe form validation
- Integration with shadcn/ui form components

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- RESTful API design pattern
- Session-based authentication (not JWT-based)
- API endpoints prefixed with `/api/`

**Authentication**:
- bcryptjs for password hashing
- Email/password authentication
- Role stored in user object: admin, manager, or employee
- User session persisted in localStorage on client

**Data Models**:
- Users: id, username, email, password, role, plant, department
- Tickets: id, title, description, category, status, priority, plant, createdById, assignedToId
- Ticket Replies: id, ticketId, userId, message
- Plants: id, name, location, managerId

**Role-Based Access Control**:
- **Admin**: Full system access, user management, all tickets, plant management
- **Manager**: Department-level access, can create employees, assign tickets, view department tickets
- **Employee**: Personal tickets only, can create and view own tickets

### Data Storage Solutions

**Primary Database**: Supabase (PostgreSQL)
- Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY
- Supabase client for database operations
- SQL schema includes users, tickets, ticket_replies, plants tables

**Fallback Storage**: In-memory storage
- Used when Supabase credentials unavailable
- Maps for users, tickets, replies, and plants
- Pre-seeded with demo data (admin, manager accounts)
- Data lost on server restart

**ORM Consideration**: 
- Drizzle ORM configuration present (`drizzle.config.ts`)
- Schema defined in `shared/schema.ts` using Drizzle
- Not currently used in implementation, but prepared for migration
- Uses PostgreSQL dialect with DATABASE_URL environment variable

### External Dependencies

**Database Service**:
- Supabase for PostgreSQL hosting and authentication infrastructure
- Credentials: SUPABASE_URL and SUPABASE_ANON_KEY environment variables
- Fallback to in-memory storage if unavailable

**Third-Party Libraries**:
- `@supabase/supabase-js` - Database client
- `bcryptjs` - Password hashing
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `wouter` - Client routing
- `date-fns` - Date formatting
- `sonner` - Toast notifications

**UI Dependencies**:
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Lucide React for icons

**Build Tools**:
- Vite for frontend bundling
- esbuild for server bundling
- TypeScript for type safety

**Deployment**:
- Vercel configuration present (`vercel.json`)
- Production build creates static frontend and bundled server
- Environment variable: NODE_ENV for development/production modes