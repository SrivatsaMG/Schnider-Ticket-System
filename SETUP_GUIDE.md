# Quick Setup Guide - Production Ticket Management System

## 🚀 Get Started in 5 Minutes

### Option 1: Using Supabase (Recommended)

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or login
3. Click "New Project"
4. Fill in project details
5. Wait for project to be created

#### Step 2: Get Your Credentials
1. Go to Project Settings → API
2. Copy your **Project URL** and **Anon Key**
3. Save these somewhere safe

#### Step 3: Run the SQL
1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the **database.sql** file from this project
4. Copy ALL the code
5. Paste into Supabase SQL Editor
6. Click **Run** button (green triangle)
7. Wait for success message ✅

#### Step 4: Setup Environment Variables
1. In your project root, create `.env.local` file
2. Add these lines:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```
3. Replace with your actual values from Step 2

#### Step 5: Start the App
```bash
npm install
npm run dev
```

Open http://localhost:5000 and login! 🎉

---

### Option 2: Using PostgreSQL Locally

#### Step 1: Install PostgreSQL
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# Windows
Download from postgresql.org
```

#### Step 2: Create Database
```bash
createdb ticket_system
```

#### Step 3: Run SQL
```bash
psql ticket_system < database.sql
```

#### Step 4: Setup Connection
Create `.env.local`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/ticket_system
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=test-key
```

#### Step 5: Start App
```bash
npm install
npm run dev
```

---

## 📋 Pre-loaded Demo Accounts

After running database.sql, you have 2 ready-to-use accounts:

### Admin Account
```
Email:    admin@example.com
Password: admin123
Role:     Admin
Access:   Full system access
```

### Manager Account
```
Email:    manager@example.com
Password: manager123
Role:     Manager
Access:   Department management
```

### Employee Account
```
Create:   Register via signup page
Role:     Employee
Access:   Personal tickets only
```

---

## 🔍 Verify Setup

### Check Users Were Created
In Supabase SQL Editor, run:
```sql
SELECT username, email, role FROM public.users;
```

Should show:
- admin / admin@example.com / admin
- manager / manager@example.com / manager

### Test Login
1. Go to http://localhost:5000/login
2. Try: admin@example.com / admin123
3. Should show Admin Dashboard ✅

---

## 📁 What Each File Does

| File | Purpose |
|------|---------|
| `database.sql` | SQL setup - copy to SQL editor |
| `SETUP_GUIDE.md` | This file - setup instructions |
| `README.md` | Full documentation |
| `ROLES.md` | Role permissions reference |
| `.env.local` | Your local environment config |

---

## ⚠️ Troubleshooting

### "Table doesn't exist" error
- Make sure you ran database.sql completely
- Check no errors appeared during SQL run
- Try running it again

### "Connection failed" error
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check .env.local file exists and has values
- Restart the app: `npm run dev`

### "Login failed" error
- Make sure you ran the SQL setup
- Admin account should exist if setup was successful
- Try creating new employee account via registration

### "Can't find module" error
```bash
npm install
npm run dev
```

---

## 📚 Next Steps

1. **Explore Admin Features**
   - Login as admin
   - View all system tickets
   - Create and assign tickets

2. **Test Manager Role**
   - Login as manager
   - See department view
   - Assign tickets to employees

3. **Try Employee Role**
   - Register new account
   - Create a ticket
   - See limited access

4. **Connect to Supabase** (Optional)
   - Once working locally, connect to Supabase
   - Your data will persist
   - Can then deploy anywhere

---

## 🎯 You're Ready!

Your production ticket management system is now ready to use. All 3 roles are configured and working.

**Start at:** http://localhost:5000

Questions? See README.md or ROLES.md for detailed documentation.

---

**Last Updated:** November 2024  
**Status:** ✅ Ready to Use
