# System Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 19 Components                                    │  │
│  │  ├─ Login Page (/auth/login)                            │  │
│  │  ├─ Forgot Password (/auth/forgot-password)             │  │
│  │  ├─ Reset Password (/auth/reset-password)               │  │
│  │  ├─ Dashboard (/dashboard)                              │  │
│  │  ├─ Vehicles, Drivers, Deliveries                       │  │
│  │  ├─ Tracking Map (/tracking)                            │  │
│  │  └─ Settings (/settings)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                          │
│                    (Vercel Deployment)                          │
│                                                                 │
│  ┌─ FRONTEND (App Router) ──────────────────────────────────┐  │
│  │ ├─ Pages (UI)                                           │  │
│  │ ├─ Middleware (Route Protection)                        │  │
│  │ └─ Components (shadcn/ui)                               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ BACKEND (API Routes) ───────────────────────────────────┐  │
│  │ ├─ /api/auth/callback (OAuth handler)                   │  │
│  │ ├─ /api/vehicles/* (CRUD)                               │  │
│  │ ├─ /api/drivers/* (CRUD)                                │  │
│  │ ├─ /api/deliveries/* (CRUD)                             │  │
│  │ ├─ /api/locations (GPS tracking)                        │  │
│  │ ├─ /api/distance (Calculate distance)                   │  │
│  │ └─ /api/geocode (Address → Coordinates)                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ LIBRARIES ──────────────────────────────────────────────┐  │
│  │ ├─ @supabase/supabase-js (Auth & DB)                    │  │
│  │ ├─ react-hook-form (Form handling)                      │  │
│  │ ├─ zod (Validation)                                     │  │
│  │ ├─ axios (HTTP requests)                                │  │
│  │ └─ @googlemaps/js-api-loader (Maps)                     │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                  SUPABASE (Firebase Alternative)               │
│                                                                 │
│  ┌─ AUTHENTICATION ─────────────────────────────────────────┐  │
│  │ ├─ auth.users (Managed auth)                            │  │
│  │ ├─ Session management (HTTP-only cookies)               │  │
│  │ ├─ Password hashing (bcrypt)                            │  │
│  │ ├─ Email verification                                   │  │
│  │ └─ Password reset tokens                                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ DATABASE (PostgreSQL) ──────────────────────────────────┐  │
│  │ ├─ warehouse_users (User profiles)                      │  │
│  │ ├─ vehicles (Fleet info)                                │  │
│  │ ├─ drivers (Driver details)                             │  │
│  │ ├─ deliveries (Delivery orders)                         │  │
│  │ ├─ vehicle_locations (Real-time GPS)                    │  │
│  │ ├─ password_reset_tokens                                │  │
│  │ └─ All tables with RLS policies                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ ADDITIONAL SERVICES ────────────────────────────────────┐  │
│  │ ├─ Real-time subscriptions (ready)                      │  │
│  │ ├─ Automatic backups                                    │  │
│  │ ├─ Audit logs                                           │  │
│  │ └─ Studio Dashboard                                     │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│                                                                 │
│  ├─ Google Maps API (Optional)                                 │
│  │  ├─ Maps JavaScript API                                    │
│  │  ├─ Distance Matrix API                                    │
│  │  └─ Geocoding API                                          │
│  └─ Email Service (Supabase SMTP)                              │
│     └─ Password reset emails                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Login Flow
```
┌──────────┐
│  Browser │
└────┬─────┘
     │ Visits /auth/login
     ↓
┌─────────────────────┐
│  Login Page         │
│ (Form: email, pwd)  │
└────┬───────────────┘
     │ Submits form
     ↓
┌─────────────────────────────────────┐
│  Supabase Client (Browser)          │
│  signInWithPassword()               │
└────┬───────────────────────────────┘
     │ HTTPS
     ↓
┌────────────────────────────────────────┐
│  Supabase Auth Service                │
│  - Verify email exists                │
│  - Check password against hash        │
│  - Create session token               │
└────┬──────────────────────────────────┘
     │ Set HTTP-only cookie
     ↓
┌──────────────┐
│  Browser     │ (Cookie stored securely)
└────┬─────────┘
     │ Redirect to /dashboard
     ↓
┌─────────────────────────────────────┐
│  Next.js Middleware                 │
│  - Check auth cookie                │
│  - Verify token validity            │
│  - Allow access                     │
└────┬────────────────────────────────┘
     │
     ↓
┌──────────────────────┐
│  Dashboard Page      │
│  User is logged in! ✅ │
└──────────────────────┘
```

### Password Reset Flow
```
┌──────────┐
│  User    │
└────┬─────┘
     │ "Forgot password?"
     ↓
┌─────────────────────────────────────┐
│  /auth/forgot-password Page         │
│  (Form: email only)                 │
└────┬───────────────────────────────┘
     │ Submits email
     ↓
┌─────────────────────────────────────┐
│  Supabase Client                    │
│  resetPasswordForEmail()            │
└────┬────────────────────────────────┘
     │ HTTPS
     ↓
┌─────────────────────────────────────┐
│  Supabase Auth Service              │
│  - Check email exists               │
│  - Generate reset token             │
│  - Send email with link             │
└────┬────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────┐
│  Email Service                      │
│  (Supabase SMTP)                    │
│                                     │
│  Email sent to user ✉️              │
│  Contains: Reset link               │
│  Link includes: Code parameter      │
└────┬────────────────────────────────┘
     │
     ↓
┌──────────┐
│  User    │ (Opens email)
│ Clicks  │ Reset link
└────┬─────┘
     │ /auth/reset-password?code=...
     ↓
┌─────────────────────────────────────┐
│  Reset Password Page                │
│  (Form: new password)               │
└────┬───────────────────────────────┘
     │ Submits new password
     ↓
┌─────────────────────────────────────┐
│  Supabase Client                    │
│  updateUser({ password: ... })      │
└────┬────────────────────────────────┘
     │ HTTPS
     ↓
┌─────────────────────────────────────┐
│  Supabase Auth Service              │
│  - Validate token                   │
│  - Hash new password                │
│  - Update auth.users                │
│  - Delete reset token               │
└────┬────────────────────────────────┘
     │
     ↓
┌──────────────────────┐
│  Dashboard           │
│  User logged in ✅   │
│  (Session created)   │
└──────────────────────┘
```

## Database Architecture

### Table Relationships
```
auth.users (Supabase Auth)
    │
    ├─ id (UUID)
    ├─ email (unique)
    ├─ password_hash
    ├─ email_confirmed_at
    └─ ...
         │
         │ Foreign Key (on delete cascade)
         ↓
    warehouse_users
    ├─ id (PK, FK to auth.users)
    ├─ username
    ├─ first_name
    ├─ last_name
    ├─ role (admin/manager/driver)
    ├─ phone
    ├─ is_active
    └─ ... RLS policies
         │
         ├─→ vehicles (1:many)
         │   ├─ id (PK)
         │   ├─ license_plate
         │   ├─ make, model, year
         │   ├─ capacity_kg
         │   ├─ status
         │   └─ ... RLS policies
         │
         ├─→ drivers (1:many)
         │   ├─ id (PK)
         │   ├─ user_id (FK)
         │   ├─ license_number
         │   ├─ license_expiry
         │   ├─ status
         │   └─ ... RLS policies
         │
         └─→ password_reset_tokens (1:many)
             ├─ id (PK)
             ├─ user_id (FK)
             ├─ token (unique)
             ├─ expires_at
             └─ ... RLS policies

deliveries (independent)
├─ id (PK)
├─ driver_id (FK to drivers)
├─ vehicle_id (FK to vehicles)
├─ status
├─ pickup_location, dropoff_location
├─ coordinates (lat/lng)
├─ weight_kg
├─ timestamps
└─ ... RLS policies
     │
     └─→ vehicle_locations (1:many)
         ├─ id (PK)
         ├─ vehicle_id (FK)
         ├─ driver_id (FK)
         ├─ latitude, longitude
         ├─ accuracy
         ├─ created_at
         └─ ... RLS policies
```

### Row-Level Security (RLS) Policies

```
┌─────────────────────────────────────────────┐
│  warehouse_users RLS Policies              │
├─────────────────────────────────────────────┤
│ SELECT: Users see own data, admins see all │
│ UPDATE: Users update own, admins all       │
│ DELETE: Admins only                        │
│ INSERT: Admins only                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  vehicles RLS Policies                     │
├─────────────────────────────────────────────┤
│ SELECT: All authenticated users            │
│ UPDATE: Admins & managers                  │
│ DELETE: Admins only                        │
│ INSERT: Admins only                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  deliveries RLS Policies                   │
├─────────────────────────────────────────────┤
│ SELECT: All authenticated users            │
│ UPDATE: Admins, managers, assigned driver  │
│ DELETE: Admins & managers                  │
│ INSERT: Admins & managers                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  vehicle_locations RLS Policies             │
├─────────────────────────────────────────────┤
│ SELECT: All authenticated users            │
│ INSERT: Drivers (own vehicles)             │
│ UPDATE: Drivers (own records)              │
│ DELETE: Admins only                        │
└─────────────────────────────────────────────┘
```

## API Request/Response Pattern

### Example: Login
```
REQUEST:
┌────────────────────────────────────┐
│ Client (Browser)                   │
│ Supabase.auth.signInWithPassword() │
│ { email, password }                │
└──────────┬─────────────────────────┘
           │ JSON POST
           ↓
┌────────────────────────────────────┐
│ Supabase Auth Service              │
│ (HTTPS Encrypted)                  │
└──────────┬─────────────────────────┘
           │
           ↓
RESPONSE:
┌────────────────────────────────────┐
│ { session, user }                  │
│ HTTP-only cookie set               │
└────────────────────────────────────┘

REQUEST (Protected Route):
┌────────────────────────────────────┐
│ GET /api/vehicles                  │
│ Cookie: session_token=...          │
└──────────┬─────────────────────────┘
           │
           ↓
┌────────────────────────────────────┐
│ Middleware                         │
│ - Validate token                   │
│ - Get user ID                      │
│ - Check role                       │
└──────────┬─────────────────────────┘
           │
           ↓
┌────────────────────────────────────┐
│ API Route (/api/vehicles)          │
│ - Query database with RLS          │
│ - Only user's role-allowed data    │
└──────────┬─────────────────────────┘
           │
           ↓
RESPONSE:
┌────────────────────────────────────┐
│ [ { vehicle }, { vehicle }, ... ]  │
│ (Only vehicles user can see)       │
└────────────────────────────────────┘
```

## Deployment Architecture

### Development
```
Local Machine → http://localhost:3000
                ↓
            Next.js Dev Server
                ↓
            Supabase Cloud (via env vars)
                ↓
            PostgreSQL Database
```

### Production (Vercel)
```
GitHub Repository
        ↓
   Git Push
        ↓
Vercel CI/CD Pipeline
        ↓
   Build & Test
        ↓
Deploy to Edge Network
        ↓
Vercel Deployment (Global CDN)
        ↓
    HTTPS →  Supabase Cloud
             PostgreSQL Database
             (Fully managed)
```

## Security Layers

```
Layer 1: Transport Security (HTTPS/TLS)
├─ All traffic encrypted
├─ SSL certificates managed by Vercel/Supabase
└─ Domain verified

Layer 2: Authentication (Supabase Auth)
├─ Email/password authentication
├─ Password hashing (bcrypt)
├─ Session tokens (JWT)
├─ HTTP-only cookies
└─ Token expiration

Layer 3: Authorization (Middleware)
├─ Route protection
├─ Role checking
├─ Token validation
└─ Redirect to login if unauthorized

Layer 4: Data Access (RLS Policies)
├─ Row-level security on tables
├─ User can only see own data
├─ Admins have full access
├─ Policies enforced at database level
└─ No way to bypass from API

Layer 5: Input Validation
├─ Zod schemas validate requests
├─ Type checking (TypeScript)
├─ SQL injection prevention (parameterized)
└─ Sanitization of user input
```

## Component Communication

```
┌─────────────────────────────────────────┐
│        React Components (Client)       │
│  - Forms (react-hook-form)             │
│  - UI (shadcn/ui)                      │
│  - State management (local + Supabase) │
└──────┬──────────────────────┬──────────┘
       │                      │
       │ useClient            │
       │ onClick, onSubmit    │
       │                      │
       ↓                      ↓
┌──────────────────────┐  ┌──────────────────┐
│  Supabase Client     │  │  API Routes      │
│  (Browser library)   │  │  (/api/*)        │
│  - Auth methods      │  │  - Business logic│
│  - Database queries  │  │  - Validation    │
└──────┬───────────────┘  └──────┬───────────┘
       │                         │
       │ (Auth) HTTPS            │ (Data) HTTPS
       │                         │
       ↓                         ↓
   ┌─────────────────────────────────────┐
   │     Supabase Backend                │
   │  ┌─ PostgreSQL Database            │
   │  │  - Tables with RLS              │
   │  │  - Policies enforce security    │
   │  └──────────────────────────────────┘
   └─────────────────────────────────────┘
```

## Performance Considerations

```
Optimization Points:

┌─ Caching
├─ Browser cache (static assets)
├─ CDN cache (Vercel Edge Network)
└─ Supabase connection pooling

┌─ Database
├─ Indexes on frequently queried columns
├─ RLS policies optimized
└─ Real-time subscriptions ready

┌─ API
├─ Route handlers optimized
├─ Minimal data transfer
└─ Error handling efficient

┌─ Frontend
├─ Code splitting (Next.js)
├─ Image optimization
└─ Tree shaking (unused code removal)
```

---

This architecture ensures:
- ✅ Security at multiple layers
- ✅ Scalability with serverless functions
- ✅ Reliability with managed services
- ✅ Maintainability with clear separation
- ✅ User privacy with RLS policies
