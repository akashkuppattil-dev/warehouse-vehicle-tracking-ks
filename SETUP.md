# Warehouse Vehicle Tracking System - Setup Guide

## Overview

This is a full-stack vehicle tracking and delivery management system built with:
- **Frontend**: Next.js 16, React 19, TypeScript, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with email/password

## Prerequisites

- Node.js 18+ (with pnpm)
- Supabase account
- Google Maps API keys (optional, for tracking features)

## Environment Setup

### 1. Supabase Configuration

The project is already connected to Supabase. Verify these environment variables are set:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
POSTGRES_URL=<your-database-url>
SUPABASE_JWT_SECRET=<your-jwt-secret>
```

### 2. Database Schema Setup

Run the database migration to create all tables:

```bash
pnpm setup-supabase
```

This will create:
- `warehouse_users` - User profiles with roles (admin, manager, driver)
- `vehicles` - Vehicle fleet information
- `drivers` - Driver details
- `deliveries` - Delivery orders
- `vehicle_locations` - Real-time location tracking
- `password_reset_tokens` - Password reset functionality

## Authentication System

### User Roles

- **Admin**: Full system access, can create users, manage all data
- **Manager**: Can manage fleet, create deliveries, view analytics
- **Driver**: Can view assigned deliveries, share location, update delivery status

### Creating Admin Users

Since there's no public registration, admins must be created by:

1. **Creating via Supabase Console** (easiest):
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Invite" and create a new user with role "admin"

2. **Creating via SQL** (manual):
   ```sql
   -- Create auth user
   SELECT auth.uid() as user_id;
   
   -- Then create warehouse user profile
   INSERT INTO public.warehouse_users (id, username, first_name, last_name, role)
   VALUES ('<user_id>', 'admin_username', 'Admin', 'User', 'admin');
   ```

### First Admin Account

To set up your first admin account:

1. Create a user in Supabase (email: `admin@example.com`, password: `StrongPassword123`)
2. Run this SQL in Supabase SQL Editor:
   ```sql
   INSERT INTO public.warehouse_users (id, username, first_name, last_name, role, is_active)
   SELECT id, 'admin', 'System', 'Admin', 'admin', true
   FROM auth.users
   WHERE email = 'admin@example.com'
   ON CONFLICT (id) DO NOTHING;
   ```

## Authentication Features

### Login
- URL: `/auth/login`
- Email and password authentication
- Redirects to dashboard on success

### Forgot Password
- URL: `/auth/forgot-password`
- Sends reset link to email
- User clicks link to reset password at `/auth/reset-password`

### Change Password
- URL: `/settings`
- Requires current password verification
- Protected route (login required)

### Logout
- Available in settings page
- Signs out user and redirects to login

## Running the Application

### Development
```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000

### Production Build
```bash
pnpm build
pnpm start
```

## Features by Role

### Admin
- Create/edit/delete users (drivers, managers)
- Create/edit/delete vehicles
- Create/edit/delete deliveries
- View all locations in real-time
- View analytics and reports

### Manager
- Create/edit/delete deliveries
- Assign deliveries to drivers
- View real-time tracking of assigned vehicles
- Manage their profile

### Driver
- View assigned deliveries
- Update delivery status
- Share real-time location
- View their profile
- Change password

## API Endpoints

### Authentication
- `POST /api/auth/callback` - OAuth callback handler
- Uses Supabase built-in auth endpoints

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create vehicle (admin only)
- `GET /api/vehicles/[id]` - Get vehicle details
- `PUT /api/vehicles/[id]` - Update vehicle (admin/manager)
- `DELETE /api/vehicles/[id]` - Delete vehicle (admin only)

### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create driver (admin only)
- `GET /api/drivers/[id]` - Get driver details
- `PUT /api/drivers/[id]` - Update driver info
- `DELETE /api/drivers/[id]` - Delete driver (admin only)

### Deliveries
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries` - Create delivery (admin/manager)
- `GET /api/deliveries/[id]` - Get delivery details
- `PUT /api/deliveries/[id]` - Update delivery status
- `DELETE /api/deliveries/[id]` - Cancel delivery

### Locations
- `POST /api/locations` - Submit current location (drivers)
- `GET /api/locations` - Get recent vehicle locations

### Distance & Geocoding
- `GET /api/distance` - Calculate distance between coordinates
- `GET /api/geocode` - Convert address to coordinates

## Troubleshooting

### "User not found" error
- Ensure the user exists in both `auth.users` and `warehouse_users` tables
- Check Row Level Security (RLS) policies

### Blank dashboard
- Check browser console for errors
- Ensure user has proper role in `warehouse_users` table

### Forgot password not working
- Verify SMTP is configured in Supabase settings
- Check email provider (Gmail, Outlook, etc.)

### Location tracking not working
- Add Google Maps API key for location features
- Check user's geolocation permission in browser

## Google Maps Integration (Optional)

To enable live tracking features:

1. Get API keys from Google Cloud Console:
   - Maps JavaScript API
   - Distance Matrix API
   - Geocoding API

2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-key>
   GOOGLE_MAPS_DISTANCE_MATRIX_KEY=<your-key>
   ```

3. Tracking features will become available in:
   - `/tracking` - Live fleet tracking
   - `/my-location` - Driver location sharing
   - `/deliveries` - Distance and ETA display

## Database Backup

Supabase automatically backs up your database. To export manually:

1. Go to Supabase Dashboard → Database → Backups
2. Click "Download" on any backup
3. Store securely

## Security Notes

- Always use HTTPS in production
- Keep API keys secure (never commit to git)
- Use environment variables for all secrets
- Enable RLS on all tables (already configured)
- Rotate passwords regularly
- Use strong, unique admin passwords
- Monitor Supabase logs for suspicious activity

## Support

For issues:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check browser console for error messages
4. Review server logs for API errors
