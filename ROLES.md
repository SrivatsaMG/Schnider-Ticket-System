# Role-Based Access Control Documentation

## Overview

This ticket management system implements a three-tier role-based access control (RBAC) system designed for production environments.

## Roles and Responsibilities

### 1. Admin (System Administrator)
**Purpose:** Full system management and oversight

**Credentials:**
- Email: admin@example.com
- Password: admin123

**Capabilities:**
- View and manage all tickets in the system
- Create, edit, and delete any ticket
- Assign tickets to any team member
- Manage user accounts and roles
- View system-wide reports and analytics
- Full access to all features
- Can escalate/override any ticket decisions

**Typical Users:**
- IT Director
- System Administrator
- Operations Head

### 2. Manager (Department Manager)
**Purpose:** Team leadership and ticket oversight

**Credentials:**
- Email: manager@example.com
- Password: manager123

**Capabilities:**
- View all tickets assigned to department
- Create and edit tickets
- Assign tickets to team members
- View department reports
- Update ticket status and priority
- Cannot delete tickets (only resolve)
- Cannot manage other users
- Cannot access admin functions

**Typical Users:**
- Department Manager
- Team Lead
- Supervisor

### 3. Employee (Standard User)
**Purpose:** Individual contributor

**Credentials:**
- Self-registered via signup page

**Capabilities:**
- Create new tickets
- View own created tickets
- View tickets assigned to them
- Update ticket status and details on assigned tickets
- Cannot view other employees' tickets
- Cannot assign tickets
- Cannot delete tickets
- Cannot access management functions

**Typical Users:**
- Production Engineer
- Developer
- Support Specialist
- Any team member

## Permission Matrix

```
                        Admin    Manager   Employee
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create Ticket            ✅       ✅         ✅
View Own Tickets         ✅       ✅         ✅
View All Tickets         ✅       ✅         ❌
Edit Own Tickets         ✅       ✅         ✅
Edit All Tickets         ✅       ✅         ❌
Delete Tickets           ✅       ❌         ❌
Assign Tickets           ✅       ✅         ❌
Manage Users             ✅       ❌         ❌
View Reports             ✅       ✅         ❌
Manage Roles             ✅       ❌         ❌
```

## Implementation Details

### Backend Validation

All API endpoints validate user permissions before executing:

```typescript
const permissions = ROLE_PERMISSIONS[user.role];
if (!permissions.deleteTickets) {
  return res.status(403).json({ message: "Forbidden" });
}
```

### Frontend Integration

The frontend adapts the UI based on user role:

```typescript
if (user.role === 'admin') {
  // Show admin controls
} else if (user.role === 'manager') {
  // Show manager controls
} else {
  // Show employee controls
}
```

## Role Hierarchy

```
Admin (Full Access)
  └── Manager (Dept. Access)
      └── Employee (Own Tickets Only)
```

## Access Control Examples

### Viewing Tickets
- **Admin:** Sees all tickets in system
- **Manager:** Sees all tickets + own tickets
- **Employee:** Sees only own created/assigned tickets

### Editing Tickets
- **Admin:** Can edit any ticket
- **Manager:** Can edit any ticket in their scope
- **Employee:** Can only edit own tickets

### Deleting Tickets
- **Admin:** Can delete any ticket
- **Manager:** Cannot delete (must resolve instead)
- **Employee:** Cannot delete (no delete option shown)

### Assigning Tickets
- **Admin:** Can assign to anyone
- **Manager:** Can assign within department
- **Employee:** Cannot assign (no assign option shown)

## Database Fields

### Users Table
```sql
- id: UUID (Primary Key)
- username: String (Unique)
- email: String (Unique)
- password: String (Hashed)
- role: String (admin | manager | employee)
- department: String (Optional)
- created_at: Timestamp
```

### Role Values
- `admin` - Full system access
- `manager` - Department/team management
- `employee` - Individual contributor

## Security Best Practices

1. **Backend Validation** - All permissions checked server-side
2. **Frontend UI Hiding** - UI elements hidden based on role
3. **Immutable Roles** - Roles set during user creation
4. **Password Hashing** - Bcryptjs for password security
5. **Session Management** - Role passed with each request

## User Onboarding Flow

### New Admin User
1. Admin creates admin account (manual or via script)
2. Set role to 'admin'
3. Grant full system access

### New Manager User
1. Admin or existing manager adds user
2. Set role to 'manager'
3. Assign to department
4. Grant team access

### New Employee User
1. User self-registers
2. Automatically assigned 'employee' role
3. Can only access own tickets
4. Manager assigns relevant tickets

## Role Transition

Users can change roles:
- **Admin** can promote/demote any user
- **Manager** cannot change roles
- **Employee** cannot change roles

## Audit Trail

All significant actions include:
- User ID (who performed action)
- User role (what level of access)
- Action type (what was done)
- Timestamp (when it happened)
- Ticket ID (which ticket affected)

## Future Enhancements

Potential role extensions:
1. **Supervisor** - Between Manager and Admin
2. **Viewer** - Read-only access for auditing
3. **Custom Roles** - Configurable permissions
4. **Department Hierarchy** - Multi-level departments
5. **Permission Workflows** - Approval chains

## Troubleshooting

### User Cannot Perform Action
1. Check user's role
2. Verify role has permission
3. Check ticket ownership/assignment
4. Review backend logs for denial reason

### Permission Denied Error
1. Ensure user is logged in correctly
2. Verify correct role for that user
3. Check if ticket belongs to user (for employees)
4. Contact admin to update permissions

---

**Version:** 2.0.0  
**Role System:** Complete  
**Status:** Production Ready
