# Admin Access Setup Guide

## Overview

Admin routes (`/admin/workshops/*`) are now protected and only accessible to users with `role=admin` in the Convex users table. This guide explains how to set up admin access.

## Quick Setup

1. **Start the dev servers** (if not already running):
   ```bash
   # Terminal 1 - Convex backend
   bun convex dev

   # Terminal 2 - Frontend
   bun run dev
   ```

2. **Sign in to the application** using Clerk authentication
   - Your user will be automatically synced to Convex with `role=user` (default)

3. **Navigate to the admin setup page**:
   ```
   http://localhost:3000/debug/admin-setup
   ```

4. **Make yourself an admin**:
   - Click the "Make Me Admin" button
   - Your role will be updated to `admin`
   - You now have access to all admin routes

## Admin Routes Protected

All these routes now require admin role:
- `/admin/workshops` - Workshop management dashboard
- `/admin/workshops/create` - Create new workshop
- `/admin/workshops/:id/edit` - Edit existing workshop

## How It Works

### Backend Authorization

All admin mutations now require authorization:

```typescript
// workshops.create
await createWorkshop({
  clerkId: user.id,  // ← Used to verify admin role
  title: "...",
  // ... other fields
})

// workshops.update
await updateWorkshop({
  clerkId: user.id,  // ← Used to verify admin role
  workshopId: "...",
  patch: { ... }
})

// workshops.softDelete
await deleteWorkshop({
  clerkId: user.id,  // ← Used to verify admin role
  workshopId: "..."
})
```

The `requireAdmin()` helper function in Convex:
1. Looks up the user by `clerkId`
2. Checks if `user.role === "admin"`
3. Throws an error if not admin

### Frontend Protection

Admin routes check the user's role:

```typescript
const { isAdmin } = useAuth();

if (!isAdmin) {
  return <AccessDeniedMessage />;
}
```

The `useAuth()` hook now returns:
- `isAdmin` - boolean, true if user.role === "admin"
- Plus all existing auth properties

## User Roles

In the Convex `users` table:

| Role    | Description                          |
|---------|--------------------------------------|
| `user`  | Regular user (default for new users) |
| `admin` | Administrator with full access       |

## Managing Admin Access

### Option 1: Debug Page (Development Only)

Use `/debug/admin-setup` to:
- View all users and their roles
- Promote users to admin
- Demote admins to regular users

**⚠️ WARNING**: Remove or protect this route in production!

### Option 2: Convex Dashboard

For production, use the Convex dashboard:

1. Go to your Convex dashboard
2. Navigate to Data → `users` table
3. Find the user by email or Clerk ID
4. Edit the `role` field to `"admin"`

### Option 3: Server-Side Script

Call the mutation from a secure script:

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";

const client = new ConvexHttpClient(process.env.CONVEX_URL);

await client.mutation(api.users.setUserRole, {
  clerkId: "user_2...",
  role: "admin"
});
```

## Testing

1. **As regular user** (role=user):
   - Can view `/workshops` (list)
   - Can view `/workshops/:slug` (single workshop)
   - **Cannot** access `/admin/workshops` → Shows "Admin Access Required"

2. **As admin** (role=admin):
   - Can access all workshop pages
   - Can access `/admin/workshops` and all admin routes
   - Can create, edit, and delete workshops

## Production Checklist

Before deploying to production:

- [ ] Remove `/debug/admin-setup` route or protect it with environment checks
- [ ] Remove or secure `users.setUserRole` mutation
- [ ] Set up at least one admin user via Convex dashboard
- [ ] Test that non-admin users cannot access admin routes
- [ ] Test that admin mutations fail when called by non-admin users
- [ ] Consider adding audit logging for admin actions

## Security Notes

### Current Implementation

✅ **Backend protected**: All admin mutations verify role server-side
✅ **Frontend protected**: Admin routes check role and show access denied
✅ **Type-safe**: Clerk ID required for all admin operations

### Potential Improvements

Consider adding:
- Audit logging for all admin actions
- Role-based permissions (e.g., `editor`, `moderator`, `superadmin`)
- Multi-factor authentication for admin accounts
- IP allowlisting for admin routes
- Session timeout for admin sessions
- Admin activity monitoring and alerts

## Troubleshooting

### "Admin access required" error

**Problem**: Getting authorization error when trying to use admin features.

**Solution**:
1. Check your role: Go to `/debug/user-sync` and verify your Convex user role
2. If role is `user`, visit `/debug/admin-setup` and make yourself admin
3. Refresh the page after changing roles

### "User not found" error

**Problem**: Authorization failing because user doesn't exist in Convex.

**Solution**:
1. Make sure you're signed in with Clerk
2. Visit any page to trigger automatic user sync
3. Check `/debug/user-sync` to confirm user is synced

### Changes not taking effect

**Problem**: Updated role but still getting access denied.

**Solution**:
1. Refresh the page to re-fetch user data
2. Check browser console for any errors
3. Verify role was actually updated in Convex dashboard

## API Reference

### Hooks

```typescript
// Get auth info including admin status
const { isAdmin, user, convexUser } = useAuth();

// Throw error if not admin (for route guards)
const auth = useRequireAdmin();
```

### Convex Functions

```typescript
// Set user role (development only)
api.users.setUserRole({
  clerkId: string,
  role: "user" | "admin"
})

// Create workshop (admin only)
api.workshops.create({
  clerkId: string,
  // ... workshop fields
})

// Update workshop (admin only)
api.workshops.update({
  clerkId: string,
  workshopId: Id<"workshops">,
  patch: { /* updates */ }
})

// Delete workshop (admin only)
api.workshops.softDelete({
  clerkId: string,
  workshopId: Id<"workshops">
})
```

## Summary

Admin access control is now fully implemented:

1. **Backend**: All admin mutations verify `role=admin` before executing
2. **Frontend**: Admin routes check role and redirect non-admins
3. **Setup**: Use `/debug/admin-setup` to grant admin access
4. **Production**: Remove debug routes and manage roles via Convex dashboard

The system is secure by default - new users get `role=user` and must be explicitly promoted to admin.
