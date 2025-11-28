# 🆘 SQL Setup - Troubleshooting & Options

## Error: "column role does not exist"

This means you already have a users table **without the role column**.

### ✅ Solution - Pick ONE:

---

## Option 1: Start Fresh (Recommended)

**If you want a clean database:**

1. Open: **FRESH_START.sql**
2. Copy ALL code
3. Paste into Supabase SQL Editor
4. Click RUN
5. Done! ✅

⚠️ **WARNING:** This deletes all existing data!

---

## Option 2: Keep Existing Data (Migration)

**If you want to keep your existing users:**

1. Open: **MIGRATE_ROLE.sql**
2. Copy ALL code
3. Paste into Supabase SQL Editor
4. Click RUN
5. Done! ✅

This adds the `role` column to your existing users table and inserts demo accounts.

---

## Option 3: Manual Fix

**If neither option works, run these one by one:**

```sql
-- 1. Add the role column
ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'employee';

-- 2. Create index
CREATE INDEX idx_users_role ON public.users(role);

-- 3. Insert admin
INSERT INTO public.users (username, email, password, role, department)
VALUES ('admin', 'admin@example.com', '$2a$10$YIjlrVyFvj5GdTCKg.bkL.eH0bWUYqF4wfOH2hXrOppYvfI5E5tVe', 'admin', 'Management')
ON CONFLICT (email) DO NOTHING;

-- 4. Insert manager
INSERT INTO public.users (username, email, password, role, department)
VALUES ('manager', 'manager@example.com', '$2a$10$nOaYLl0lQMAyaSKj.SLmV.YG7klvBZmKS6UdK3YnNBqPrVVd5WtSi', 'manager', 'Operations')
ON CONFLICT (email) DO NOTHING;

-- 5. Verify it worked
SELECT username, email, role FROM public.users;
```

---

## Which File to Use?

| Situation | Use This File |
|-----------|---------------|
| Starting completely fresh | **FRESH_START.sql** |
| Already have users table | **MIGRATE_ROLE.sql** |
| Just want basic tables | **database.sql** |
| Manual step-by-step | **Option 3** above |

---

## After Running SQL

### Verify it worked:
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

### Then:
1. Create `.env.local` with your Supabase credentials
2. Run `npm install && npm run dev`
3. Go to http://localhost:5000
4. Login with: admin@example.com / admin123

---

## Still Having Issues?

1. Check your Supabase credentials are correct
2. Make sure you're in the right database/project
3. Try **FRESH_START.sql** (fresh database)
4. If tables exist, use **MIGRATE_ROLE.sql** (add role column)

**Your system should work now!** 🚀
