# Quick Setup Guide - Production Ticket Management System

## 🚀 Get Started in 3 Simple Steps

### Step 1: Run ONE SQL File in Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or login
3. Click "New Project"
4. Fill in details and wait for creation

#### Run the SQL Setup
1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. **Open the `setup.sql` file** from your project
4. **Copy ALL the code**
5. **Paste** into Supabase SQL Editor
6. Click **Run** button (green play icon)
7. Done! ✅

**That's it - just ONE SQL file with everything!**

---

### Step 2: Get Your Supabase Credentials

1. Go to Project Settings → **API**
2. Copy your **Project URL**
3. Copy your **Anon Key**
4. Save them somewhere safe

---

### Step 3: Setup and Run Your App

#### Create `.env.local` file in your project root:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

#### Start the App:
```bash
npm install
npm run dev
```

#### Open your browser:
```
http://localhost:5000
```

---

## 📋 Pre-loaded Demo Accounts

After running `setup.sql`, you have 2 ready-to-use accounts:

### Admin Account
```
Email:    admin@example.com
Password: admin123
Role:     Admin (Full system access)
```

### Manager Account
```
Email:    manager@example.com
Password: manager123
Role:     Manager (Department management)
```

### Employee Account
```
Create:   Register via signup page
Role:     Employee (Personal tickets only)
```

---

## ✅ Verify Your Setup

### Check Users Were Created
In Supabase SQL Editor, run:
```sql
SELECT username, email, role FROM public.users;
```

Should show:
```
 username |      email       | role
----------+------------------+--------
 admin    | admin@example.com | admin
 manager  | manager@example.com | manager
```

### Test Login
1. Go to http://localhost:5000/login
2. Try: admin@example.com / admin123
3. Should show Admin Dashboard ✅

---

## 📁 Files You Need

| File | Purpose |
|------|---------|
| `setup.sql` | **ONE SQL file with everything** |
| `.env.local` | Your Supabase credentials |
| `README.md` | Full documentation |
| `ROLES.md` | Role permissions reference |

---

## 🎯 What the setup.sql File Does

✓ Creates `users` table with role support  
✓ Creates `tickets` table for ticket management  
✓ Creates all indexes for performance  
✓ Inserts demo Admin account  
✓ Inserts demo Manager account  
✓ Everything ready to use immediately!

---

## ⚠️ Troubleshooting

### "Table already exists" error
- That's OK! The SQL uses `IF NOT EXISTS`
- Just means you already have tables
- Your data is safe

### "Column role does not exist" error
- Your old table doesn't have the role column
- Run the SQL file again - it will update automatically

### "Login failed" error
- Make sure you ran the SQL successfully
- Check admin@example.com exists in database
- Try creating new employee account

### "Connection failed" error
- Verify SUPABASE_URL is correct
- Verify SUPABASE_ANON_KEY is correct
- Check `.env.local` file has values
- Restart app: `npm run dev`

---

## 🎓 Next Steps

1. **Explore Admin Features**
   - Login as admin@example.com / admin123
   - View all system tickets
   - Create and assign tickets

2. **Test Manager Role**
   - Login as manager@example.com / manager123
   - See manager-level features
   - Assign tickets to employees

3. **Try Employee Role**
   - Register new account on signup page
   - Create your own tickets
   - See limited access

---

## ✨ Your System Includes

✅ Three-tier role system (Admin, Manager, Employee)  
✅ Complete ticket CRUD operations  
✅ Status and priority tracking  
✅ User assignment system  
✅ Role-based UI filtering  
✅ Backend permission validation  
✅ Responsive design  
✅ Works locally without Vercel  
✅ Ready for production use  

---

## 🚀 You're Ready!

Your production ticket management system is fully set up with:
- **ONE** SQL file for database setup
- **THREE** ready-to-use demo accounts
- **Complete** role-based access control
- **All features** working out of the box

**Start at:** http://localhost:5000

---

**Version:** 2.0.0  
**Status:** ✅ Ready to Use
