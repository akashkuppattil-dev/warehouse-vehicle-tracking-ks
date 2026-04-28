# Deployment & Setup Checklist

## Project Status: 95% Complete ✅

### GitHub Repository
- ✅ Code pushed to: `https://github.com/akashkuppattil-dev/Warehouse-vehicle-tracking`
- ✅ All files committed and ready
- ✅ Main branch active

---

## PRE-DEPLOYMENT CHECKLIST

### Step 1: Get Required API Keys (15 minutes)

#### Google Maps API Key
- [ ] Go to https://console.cloud.google.com
- [ ] Create a new project
- [ ] Enable: "Maps JavaScript API"
- [ ] Enable: "Distance Matrix API"
- [ ] Enable: "Geocoding API"
- [ ] Create API Key (Restrict to browser)
- [ ] Copy the key

#### Supabase Credentials
- [ ] Go to your Supabase project: https://supabase.com
- [ ] Click Settings → API
- [ ] Copy: `Project URL`
- [ ] Copy: `anon public key`
- [ ] Copy: `service_role key`

---

### Step 2: Setup Environment Variables (5 minutes)

Create `.env.local` in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Optional: For password reset emails
SUPABASE_REDIRECT_URL=http://localhost:3000
```

---

### Step 3: Initialize Database (5 minutes)

#### Option A: Using Script
```bash
pnpm setup-supabase
```

#### Option B: Manual (Supabase Dashboard)
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents from: `/scripts/001_create_users_table.sql`
4. Run the SQL
5. Done!

---

### Step 4: Create Test Users (10 minutes)

In Supabase Dashboard → Authentication → Users:

**Create 3 test users:**

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@example.com | Test@123 | Admin | System management |
| manager@example.com | Test@123 | Manager | Fleet monitoring |
| driver@example.com | Test@123 | Driver | GPS tracking |

Then in Supabase → SQL Editor, run:

```sql
-- For admin@example.com
INSERT INTO public.warehouse_users (id, username, first_name, last_name, role)
SELECT id, 'admin', 'Admin', 'User', 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO NOTHING;

-- For manager@example.com
INSERT INTO public.warehouse_users (id, username, first_name, last_name, role)
SELECT id, 'manager', 'Manager', 'User', 'manager'
FROM auth.users
WHERE email = 'manager@example.com'
ON CONFLICT (id) DO NOTHING;

-- For driver@example.com
INSERT INTO public.warehouse_users (id, username, first_name, last_name, role)
SELECT id, 'driver', 'Driver', 'User', 'driver'
FROM auth.users
WHERE email = 'driver@example.com'
ON CONFLICT (id) DO NOTHING;
```

---

### Step 5: Run Development Server (2 minutes)

```bash
# Install dependencies (if not done)
pnpm install

# Start dev server
pnpm dev

# Open browser to http://localhost:3000
```

---

## TESTING CHECKLIST

### Authentication Tests
- [ ] Login page loads at `/auth/login`
- [ ] Forgot password works at `/auth/forgot-password`
- [ ] Reset password email received
- [ ] Password change works in `/settings`
- [ ] Logout removes session

### Admin Dashboard
- [ ] Admin sees all vehicles at `/vehicles`
- [ ] Admin can create vehicle
- [ ] Admin can edit vehicle
- [ ] Admin can delete vehicle
- [ ] Admin sees all drivers at `/drivers`
- [ ] Admin can create driver
- [ ] Admin can edit driver
- [ ] Admin can delete driver

### Manager Dashboard
- [ ] Manager sees `/tracking` with map
- [ ] Manager can create delivery at `/deliveries`
- [ ] Manager can assign driver to delivery
- [ ] Manager can see delivery status

### Driver Features
- [ ] Driver sees `/my-deliveries` with assigned deliveries
- [ ] Driver can update delivery status
- [ ] Driver can go to `/my-location`
- [ ] Driver can start sharing location
- [ ] Browser asks for location permission
- [ ] Location updates appear in database

### GPS Tracking
- [ ] Manager's map shows all vehicle locations
- [ ] Locations update in real-time (every 10 seconds)
- [ ] Click on vehicle shows driver info
- [ ] Location history is saved to database

---

## DEPLOYMENT OPTIONS

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Self-Hosted
```bash
# Build
pnpm build

# Start
pnpm start
```

### Option 3: Docker
```bash
# Build image
docker build -t warehouse-tracking .

# Run container
docker run -p 3000:3000 warehouse-tracking
```

---

## PRODUCTION ENVIRONMENT VARIABLES

```bash
# In Vercel/Production Dashboard, add:

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Google Maps (Production API Key)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_maps_key

# Redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://yourdomain.com/auth/callback
```

---

## TROUBLESHOOTING

### Issue: "Cannot find module supabase"
**Solution:**
```bash
pnpm install
pnpm dev
```

### Issue: "Google Maps not loading"
**Solution:**
- Check API key in `.env.local`
- Verify "Maps JavaScript API" is enabled
- Check browser console for errors

### Issue: "Database connection failed"
**Solution:**
- Verify Supabase URL in `.env.local`
- Verify anon key is correct
- Check Supabase project is active

### Issue: "Location not updating on map"
**Solution:**
- Check browser allows location permission
- Open console: `F12 → Console`
- Check for errors
- Verify GPS coordinates are being captured

### Issue: "Login not working"
**Solution:**
- Verify user exists in Supabase Auth
- Check email matches exactly
- Verify `.env.local` has correct Supabase keys
- Clear browser cache and cookies

---

## MONITORING & MAINTENANCE

### Weekly Tasks
- [ ] Check delivery completion rate
- [ ] Monitor GPS accuracy
- [ ] Review error logs

### Monthly Tasks
- [ ] Backup database (Supabase auto-backs up)
- [ ] Update dependencies: `pnpm update`
- [ ] Review security logs

### Quarterly Tasks
- [ ] Performance audit
- [ ] User feedback review
- [ ] Feature prioritization

---

## SUPPORT & DOCUMENTATION

Read these files in order:

1. **QUICK_START.md** - 30-second overview
2. **SETUP.md** - Complete setup guide
3. **GPS_IMPLEMENTATION_GUIDE.md** - GPS tracking details
4. **ADMIN_GUIDE.md** - Admin operations
5. **ARCHITECTURE.md** - System design

---

## SUCCESS INDICATORS

✅ System is ready when:
- You can login with test credentials
- You can create a vehicle
- You can create a driver
- You can create a delivery
- You can see the map (with or without GPS data)
- You can start sharing location
- You can see location updates

---

## NEXT STEPS

1. Get API keys (15 min)
2. Setup .env.local (5 min)
3. Initialize database (5 min)
4. Create test users (10 min)
5. Run `pnpm dev` (2 min)
6. Test all features (20 min)
7. Deploy to Vercel (5 min)

**Total Time: ~60 minutes**

---

## Questions?

Check the documentation files:
- `COMPLETE_WORKFLOW_GUIDE.md` - How the system works
- `PROJECT_STATUS.md` - Current status
- `DOCUMENTATION_INDEX.md` - All docs listed

Good luck! 🚀
