# Migration Guide: From Custom Auth to Supabase

## What Changed

The application has been migrated from a custom JWT-based authentication system to Supabase Authentication. This provides:

- Better security with managed auth
- Built-in password reset functionality
- Email verification
- Session management
- Centralized user management
- Row-level security (RLS)

## Key Changes

### Authentication System

**Before**: Custom JWT tokens stored in HTTP-only cookies
**After**: Supabase Auth with built-in session management

### User Registration

**Before**: Public registration page at `/register`
**After**: No public registration - only admins can create users via Supabase console

### Password Management

**Before**: No password reset functionality
**After**: 
- Forgot password page at `/auth/forgot-password`
- Password reset link via email
- Change password in settings at `/settings`

### Database

**Before**: Neon PostgreSQL with custom user table
**After**: Supabase PostgreSQL with RLS policies

## Files Removed

The following old files have been removed:

- `/app/register/page.tsx` - Public sign-up page (no longer needed)
- `/app/api/auth/login/route.ts` - Custom login endpoint
- `/app/api/auth/register/route.ts` - Custom registration endpoint
- `/app/api/auth/logout/route.ts` - Custom logout endpoint
- `/app/api/auth/me/route.ts` - Custom user endpoint
- `/lib/auth.ts` - Custom auth utilities
- `/lib/auth-context.tsx` - Custom React context provider
- `/scripts/init-db.sql` - Old database schema
- `/scripts/setup-db.ts` - Old database setup script

## Files Added

### Core Supabase Integration

- `/lib/supabase/client.ts` - Browser client
- `/lib/supabase/server.ts` - Server client
- `/lib/supabase/proxy.ts` - Middleware proxy
- `/middleware.ts` - Route protection middleware
- `/app/auth/callback/route.ts` - OAuth callback handler

### New Authentication Pages

- `/app/auth/login/page.tsx` - Updated login with Supabase
- `/app/auth/forgot-password/page.tsx` - Password reset request
- `/app/auth/reset-password/page.tsx` - Password reset form
- `/app/auth/error/page.tsx` - Authentication error page
- `/app/settings/page.tsx` - User settings with password change

### Documentation

- `SETUP.md` - Complete setup guide
- `ADMIN_GUIDE.md` - User management for admins
- `MIGRATION.md` - This file

### Database

- `/scripts/001_create_users_table.sql` - New Supabase schema
- `/scripts/setup-supabase.ts` - Database setup script

## Migration Steps for Users

### Step 1: Update Environment Variables

Already handled - Supabase integration auto-configures these:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
POSTGRES_URL
```

### Step 2: Set Up Database Schema

Run the database migration:

```bash
pnpm setup-supabase
```

Or manually execute `/scripts/001_create_users_table.sql` in Supabase SQL Editor.

### Step 3: Create First Admin User

Option A - Via Supabase Console (Recommended):
1. Go to Supabase Dashboard
2. Authentication → Users → Invite
3. Create user with email and password
4. Run SQL to add to `warehouse_users` table

Option B - Via SQL:
```sql
-- Create auth user
SELECT auth.admin_create_user(
  email => 'admin@example.com',
  password => 'StrongPassword123'
);

-- Get the user ID and insert into warehouse_users
INSERT INTO public.warehouse_users (id, username, first_name, last_name, role)
VALUES ('<user-id>', 'admin', 'Admin', 'User', 'admin');
```

### Step 4: Migrate Existing Users (if any)

If you had users in the old system:

```sql
-- Export old users from warehouse_users
SELECT * FROM old_warehouse_users;

-- Create new auth users in Supabase
-- Use admin create user endpoint or Supabase Console

-- Insert into new warehouse_users table
INSERT INTO public.warehouse_users (id, username, first_name, last_name, role, phone, is_active)
SELECT id, username, first_name, last_name, role, phone, is_active
FROM old_warehouse_users;
```

### Step 5: Test the System

1. Start the development server: `pnpm dev`
2. Navigate to `/auth/login`
3. Log in with the admin credentials
4. Try password reset at `/auth/forgot-password`
5. Change password in `/settings`

## API Changes

### Old Endpoints (Removed)

```
POST /api/auth/login - Custom login
POST /api/auth/register - Custom registration
POST /api/auth/logout - Custom logout
GET /api/auth/me - Get current user
```

### New Approach (Supabase)

All authentication now uses Supabase client library:

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Forgot password
const { error } = await supabase.auth.resetPasswordForEmail(email)

// Change password
const { error } = await supabase.auth.updateUser({ password: newPassword })

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Logout
await supabase.auth.signOut()
```

## Protected Routes

The following routes are now protected by middleware:

- `/dashboard` - Main dashboard
- `/vehicles` - Vehicle management
- `/drivers` - Driver management
- `/deliveries` - Delivery management
- `/tracking` - Real-time tracking
- `/my-deliveries` - Driver's deliveries
- `/my-location` - Location sharing
- `/settings` - User settings

Unauthenticated users are redirected to `/auth/login`.

## Database Schema

### New Tables

1. **warehouse_users** - User profiles with roles and metadata
2. **vehicles** - Fleet information
3. **drivers** - Driver details
4. **deliveries** - Delivery orders
5. **vehicle_locations** - Real-time location tracking
6. **password_reset_tokens** - Password reset tracking

### Row-Level Security (RLS)

All tables now have RLS policies:

- Users can only read their own data (except admins)
- Admins have full access to everything
- Managers can update relevant data
- Drivers can update their own info

See `/scripts/001_create_users_table.sql` for complete RLS policies.

## Security Improvements

### Before
- JWT tokens in cookies
- Manual password hashing
- No email verification
- No password reset

### After
- Supabase managed sessions
- Supabase password handling
- Email verification support
- Built-in password reset
- Row-level security
- Audit logs available
- Two-factor auth support (optional)

## Rollback (If Needed)

If you need to revert to the old system:

1. Restore the database backup from Neon
2. Revert Git to previous commit with old files
3. Update environment variables back to Neon
4. Remove Supabase integration from v0 project settings

However, **it's recommended to stay with Supabase** for better security and fewer maintenance burdens.

## Troubleshooting

### Login not working after migration

1. Check if user exists in `warehouse_users` table
2. Verify email is correct in both `auth.users` and `warehouse_users`
3. Check RLS policies are correctly set
4. Review Supabase logs for errors

### Old users can't log in

1. Ensure you migrated users to `warehouse_users` table
2. Check if email is correct
3. Users may need to reset password using `/auth/forgot-password`

### Database errors

1. Check Supabase connection string in `.env.local`
2. Verify all tables exist: `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`
3. Review RLS policies: `SELECT * FROM pg_policies;`

## Next Steps

1. Follow the SETUP.md guide for complete configuration
2. Read ADMIN_GUIDE.md for user management
3. Deploy to Vercel with Supabase environment variables
4. Monitor Supabase logs in production
5. Set up email templates in Supabase for password reset

## Support

- Supabase Docs: https://supabase.com/docs
- This project's SETUP.md and ADMIN_GUIDE.md
- Supabase Community Forum: https://github.com/supabase/supabase/discussions
