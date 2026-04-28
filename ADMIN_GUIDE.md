# Admin User Management Guide

## Overview

As an admin, you have full control over users, vehicles, and deliveries. This guide explains how to manage these resources.

## User Management

### Creating Users

Users cannot self-register. Only admins can create new users.

#### Method 1: Via Supabase Console (Easiest)

1. Go to Supabase Dashboard
2. Navigate to Authentication → Users
3. Click "Invite" button
4. Enter the user's email
5. User will receive an invitation link
6. After they set their password, create their profile in the app

#### Method 2: Direct SQL

```sql
-- Insert into auth.users (via Supabase Console SQL Editor)
SELECT auth.admin_create_user(
  email => 'driver@example.com',
  password => 'SecurePassword123',
  email_confirm => true
);

-- Then create warehouse_users profile (use the returned UUID)
INSERT INTO public.warehouse_users (id, username, first_name, last_name, role, is_active)
VALUES ('<user-uuid>', 'driver_username', 'John', 'Doe', 'driver', true);
```

### User Roles Explained

#### Admin Role
- Can create, read, update, delete all users
- Can create, read, update, delete all vehicles
- Can create, read, update, delete all deliveries
- Full system access
- Can view all locations in real-time

#### Manager Role
- Can create and manage deliveries
- Can assign deliveries to drivers
- Can view location tracking for assigned vehicles
- Cannot create or delete users
- Cannot modify vehicle information

#### Driver Role
- Can view assigned deliveries
- Can update their own delivery status
- Can share their real-time location
- Can change their own password
- Cannot view other drivers' deliveries
- Cannot create deliveries

### Editing User Information

As an admin, you can edit user details by:

1. Go to `/dashboard` (admin only)
2. Navigate to Drivers section
3. Click on a driver to edit their information
4. Update fields and save

Fields you can edit:
- First name
- Last name
- Phone number
- License number
- License expiry date
- Status (active/inactive/on_leave)
- Assigned vehicle

### Deactivating Users

To deactivate a user without deleting them:

1. Edit the user
2. Set Status to "inactive"
3. Save

The user can still log in but may have restricted access depending on implementation.

### Deleting Users

⚠️ **Warning**: Deleting a user will also delete associated data.

1. Edit the user
2. Click "Delete User" button
3. Confirm deletion

Data deleted:
- User auth account
- User profile
- Associated deliveries will be unassigned
- Location history

## Vehicle Management

### Adding Vehicles

1. Go to `/vehicles` (admin only)
2. Click "Add New Vehicle"
3. Fill in details:
   - License plate (required, unique)
   - Make (e.g., Mercedes)
   - Model (e.g., Sprinter)
   - Year
   - Weight capacity (kg)
4. Click "Create"

### Editing Vehicles

1. Go to `/vehicles`
2. Click on a vehicle
3. Update any fields
4. Save changes

### Deleting Vehicles

1. Go to `/vehicles`
2. Click on a vehicle
3. Click "Delete"
4. Confirm deletion

⚠️ Active deliveries will be unassigned.

### Vehicle Status

- **Available**: Vehicle is ready for use
- **In Use**: Vehicle is currently on a delivery
- **Maintenance**: Vehicle is being serviced

## Delivery Management

### Creating Deliveries

1. Go to `/deliveries`
2. Click "Create Delivery"
3. Fill in:
   - Pickup location (address)
   - Dropoff location (address)
   - Weight (kg)
   - Scheduled pickup time (optional)
   - Notes (optional)
4. Click "Create"

### Assigning Drivers

Once a delivery is created:

1. Click on the delivery
2. Click "Assign Driver"
3. Select driver and vehicle
4. Confirm

The driver will see this delivery in their `/my-deliveries` page.

### Tracking Deliveries

1. Go to `/tracking`
2. Select a vehicle to track
3. View real-time location
4. See delivery progress

You can also:
- View estimated time of arrival (ETA)
- See remaining distance
- View driver contact information

### Delivery Status

- **Pending**: Created but not yet assigned
- **Assigned**: Driver assigned, awaiting pickup
- **In Transit**: Driver is en route
- **Completed**: Delivery finished
- **Cancelled**: Delivery cancelled

Drivers update status as they complete each step.

## Reporting and Analytics

### View Reporting Page

Go to `/dashboard` to see:
- Total active vehicles
- Total deliveries (this week)
- Active drivers
- System statistics

### Export Data

Data can be exported via:
1. Supabase Dashboard → SQL Editor
2. Use provided SQL queries
3. Download as CSV

Example queries:

```sql
-- All deliveries this month
SELECT * FROM public.deliveries
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Driver performance
SELECT 
  d.user_id,
  w.first_name,
  COUNT(*) as total_deliveries,
  COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as completed
FROM public.deliveries d
JOIN public.drivers dr ON d.driver_id = dr.id
JOIN public.warehouse_users w ON dr.user_id = w.id
GROUP BY d.user_id, w.first_name;

-- Vehicle usage
SELECT 
  v.license_plate,
  COUNT(*) as deliveries,
  COUNT(DISTINCT d.driver_id) as drivers_used
FROM public.deliveries d
JOIN public.vehicles v ON d.vehicle_id = v.id
WHERE d.created_at >= NOW() - INTERVAL '7 days'
GROUP BY v.license_plate;
```

## Common Admin Tasks

### Reset User Password

If a user forgets their password:

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click the "..." menu
4. Select "Reset Password"
5. User receives reset email

Or users can use the `/auth/forgot-password` link.

### Bulk Create Users

Via Supabase SQL Editor:

```sql
INSERT INTO public.warehouse_users (id, username, first_name, last_name, role, is_active)
VALUES 
  ((SELECT id FROM auth.users WHERE email = 'driver1@example.com'), 'driver1', 'Driver', 'One', 'driver', true),
  ((SELECT id FROM auth.users WHERE email = 'driver2@example.com'), 'driver2', 'Driver', 'Two', 'driver', true),
  ((SELECT id FROM auth.users WHERE email = 'manager1@example.com'), 'manager1', 'Manager', 'One', 'manager', true);
```

### View User Login Attempts

Go to Supabase Dashboard → Authentication → Logs to see:
- Login times
- Failed attempts
- IP addresses
- Device information

### Set User Metadata

You can store additional data on users:

```sql
-- Update a user's metadata (via Supabase Console)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{department}',
  '"Logistics"'
)
WHERE email = 'driver@example.com';
```

## Security Best Practices

1. **Regular Audits**
   - Review user access monthly
   - Remove inactive users
   - Check for unusual login patterns

2. **Password Policy**
   - Require strong passwords (8+ characters, mixed case, numbers)
   - Force password changes periodically
   - Never share admin passwords

3. **Role-Based Access**
   - Only grant necessary permissions
   - Never give admin access to non-admin staff
   - Review roles quarterly

4. **Data Protection**
   - Backup data regularly
   - Enable audit logs
   - Encrypt sensitive data
   - Comply with data privacy laws

5. **Access Control**
   - Use HTTPS only
   - Enable two-factor authentication (2FA) when available
   - Monitor Supabase logs
   - Set up alerts for suspicious activity

## Troubleshooting

### User Can't Log In
1. Check if user exists in both `auth.users` and `warehouse_users`
2. Verify email is correct
3. Check user status (is_active = true)
4. Review RLS policies in database

### Delivery Not Assigned to Driver
1. Verify driver exists in database
2. Check driver status is 'active'
3. Check vehicle is available
4. Review RLS policies

### Can't Create New Users
1. Verify you have admin role
2. Check Supabase Auth is configured
3. Review RLS policies on `warehouse_users` table

## Contact & Support

For issues:
- Check Supabase Dashboard for system status
- Review error logs in browser console
- Contact Supabase support for database issues
- Check SETUP.md for common troubleshooting
