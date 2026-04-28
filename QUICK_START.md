# Quick Start Guide

## 30-Second Setup

1. **Start Dev Server**
   ```bash
   pnpm dev
   ```
   Opens http://localhost:3000

2. **Create First Admin**
   - Go to Supabase Dashboard
   - Auth → Users → Invite
   - Email: `admin@example.com`, Password: `StrongPassword123`

3. **Add Admin to App**
   - Copy the user ID from Supabase
   - Open Supabase SQL Editor
   - Run this SQL:
   ```sql
   INSERT INTO public.warehouse_users (id, username, first_name, last_name, role)
   VALUES ('<user-id>', 'admin', 'Admin', 'User', 'admin');
   ```

4. **Login**
   - Go to http://localhost:3000
   - Click "Login" or navigate to `/auth/login`
   - Use email and password from step 2

## Common Tasks

### Create a Driver
1. Login as admin
2. Go to `/drivers`
3. Click "Add New Driver"
4. Create Supabase user first (or ask admin)
5. Fill in driver details
6. Save

### Create a Vehicle
1. Login as admin
2. Go to `/vehicles`
3. Click "Add New Vehicle"
4. Enter license plate, make, model, etc.
5. Save

### Create a Delivery
1. Login as manager/admin
2. Go to `/deliveries`
3. Click "Create Delivery"
4. Enter pickup and dropoff locations
5. Assign driver and vehicle
6. Save

### Reset User Password
1. User clicks "Forgot password?" on login page
2. Enters their email
3. Receives reset link in email
4. Clicks link and sets new password

### Driver Updates Delivery Status
1. Driver logs in
2. Goes to `/my-deliveries`
3. Selects a delivery
4. Updates status (picked up, in transit, delivered)
5. System records timestamp

### View Live Tracking
1. Login as manager/admin
2. Go to `/tracking`
3. Select vehicle
4. See real-time location
5. View distance and ETA

## Pages Reference

### Public Pages (No Login Required)
- `/auth/login` - Login page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset (from email link)
- `/auth/error` - Error page

### Protected Pages (Login Required)

**All Users**
- `/dashboard` - Main dashboard
- `/settings` - Change password, logout

**Admin/Manager**
- `/vehicles` - Manage fleet
- `/drivers` - Manage drivers
- `/deliveries` - Manage deliveries
- `/tracking` - Real-time tracking

**Drivers**
- `/my-deliveries` - View assigned deliveries
- `/my-location` - Share location

## API Endpoints

### Authentication
- Handled by Supabase client library
- No REST endpoints for login/logout

### Data Management
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/drivers` - List drivers
- `POST /api/drivers` - Create driver
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries` - Create delivery

### Tracking
- `POST /api/locations` - Submit driver location
- `GET /api/locations` - Get recent locations
- `GET /api/distance` - Calculate distance
- `GET /api/geocode` - Convert address to coords

## User Roles & Permissions

| Feature | Admin | Manager | Driver |
|---------|-------|---------|--------|
| Create vehicles | ✅ | ❌ | ❌ |
| Edit vehicles | ✅ | ✅ | ❌ |
| Delete vehicles | ✅ | ❌ | ❌ |
| Create drivers | ✅ | ❌ | ❌ |
| Edit drivers | ✅ | ✅ | ❌ |
| Delete drivers | ✅ | ❌ | ❌ |
| Create deliveries | ✅ | ✅ | ❌ |
| Assign deliveries | ✅ | ✅ | ❌ |
| View all tracking | ✅ | ✅ | Own only |
| Update delivery status | ✅ | ✅ | Own only |
| View analytics | ✅ | ✅ | ❌ |

## Login Flow

```
User goes to /auth/login
    ↓
Enters email + password
    ↓
Supabase authenticates
    ↓
Session created (HTTP-only cookie)
    ↓
Redirect to /dashboard
    ↓
Middleware checks auth
    ↓
User sees dashboard
```

## Password Reset Flow

```
User clicks "Forgot password?" on /auth/login
    ↓
Enters their email on /auth/forgot-password
    ↓
Supabase sends reset link to email
    ↓
User clicks link in email
    ↓
Redirected to /auth/reset-password
    ↓
User enters new password
    ↓
Password updated, user logged in
    ↓
Redirect to /dashboard
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables set in Vercel
- [ ] Database migrations run (`pnpm setup-supabase`)
- [ ] Admin user created in Supabase
- [ ] Test login on deployed site
- [ ] Test password reset
- [ ] Test vehicle/driver creation
- [ ] Monitor Supabase logs

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Check user exists in Supabase → Create via Console |
| Password reset email not received | Check email, verify SMTP in Supabase settings |
| Routes redirect to login | Check user has correct role in `warehouse_users` table |
| Can't create vehicles | Check you're logged in as admin |
| Location not tracking | Enable browser geolocation, add Google Maps API key |

## Need Help?

1. **Setup issues** → Read SETUP.md
2. **User management** → Read ADMIN_GUIDE.md
3. **Migration from old system** → Read MIGRATION.md
4. **All changes made** → Read CHANGES_SUMMARY.md
5. **Supabase help** → https://supabase.com/docs

## Key Points to Remember

✅ **Only admins can create users** - No public sign-up
✅ **Passwords reset via email** - Click link to reset
✅ **Every route is protected** - Must be logged in
✅ **RLS secures data** - Users only see their data
✅ **Sessions auto-expire** - For security
✅ **All data is in Supabase** - One source of truth

---

**Ready to start?** Run `pnpm dev` and head to http://localhost:3000!
