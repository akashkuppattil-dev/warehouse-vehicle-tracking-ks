# GPS Tracking Implementation Guide

## Overview
**The system tracks VEHICLE locations (not driver locations)** via GPS coordinates submitted by drivers while they're driving.

---

## How It Works (Step-by-Step)

### 1. Driver Shares Location
```
Driver phone/laptop → /my-location page
↓
Browser asks: "Can app access your location?"
↓
Driver clicks "Allow"
↓
Browser captures GPS coordinates using navigator.geolocation API
```

### 2. Coordinates Are Captured
```javascript
latitude: 37.7749      // San Francisco example
longitude: -122.4194
accuracy: 15           // accuracy in meters (15m = good)
```

### 3. Driver Selects Vehicle
```
Driver dropdown: "Which vehicle are you driving?"
↓
Options: Toyota-001, Honda-002, etc.
↓
Driver selects: Toyota-001
```

### 4. Location Submitted to Database
```
Driver clicks "Submit My Location"
↓
App sends: {
  vehicleId: 1,
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 15
}
↓
Database saves to vehicle_locations table
```

### 5. Manager Views Live Map
```
Manager goes to /tracking page
↓
Google Maps shows all vehicles:
  - Green pin = Vehicle Toyota-001 at 37.7749, -122.4194
  - Yellow pin = Vehicle Honda-002 at 37.7750, -122.4195
  - Red pin = Vehicle Ford-003 (idle)
↓
Click vehicle → See driver details, accuracy, last update
```

---

## Database Structure

### vehicle_locations Table
```sql
CREATE TABLE vehicle_locations (
  id UUID PRIMARY KEY,
  vehicle_id UUID NOT NULL,              -- Which vehicle
  latitude DECIMAL(10, 6),               -- GPS latitude
  longitude DECIMAL(10, 6),              -- GPS longitude
  accuracy DECIMAL(10, 2),               -- Accuracy in meters
  timestamp TIMESTAMP DEFAULT NOW(),     -- When location was captured
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
```

### Example Data
```
vehicle_id: 1
latitude: 37.7749
longitude: -122.4194
accuracy: 15 meters
timestamp: 2024-04-28 10:30:45
```

---

## Key Components

### 1. useGeolocation Hook (`lib/use-geolocation.ts`)
```typescript
Purpose: Captures GPS coordinates from browser

Features:
  ✅ startWatching() - Continuous tracking (every 10 seconds)
  ✅ stopWatching() - Stop tracking
  ✅ getCurrentPosition() - Get position once
  ✅ Auto-updates accuracy

High accuracy mode:
  enableHighAccuracy: true   // Uses GPS (not WiFi/IP)
  timeout: 10000 ms          // Wait up to 10 seconds
  maximumAge: 0 ms           // Always get fresh data
```

### 2. Location API (`app/api/locations/route.ts`)
```typescript
GET /api/locations
  Purpose: Fetch latest location for each vehicle
  Returns: Last 24 hours of location data
  Used by: Tracking map page

POST /api/locations
  Purpose: Submit new vehicle location
  Required: vehicleId, latitude, longitude
  Submitter: Only drivers can submit
  Storage: Saves to vehicle_locations table
```

### 3. My Location Page (`app/my-location/page.tsx`)
```typescript
Driver-only page with:
  ✅ Vehicle selector dropdown
  ✅ "Start Tracking" button
  ✅ Live GPS coordinates display
  ✅ Accuracy indicator
  ✅ "Submit Location" button
  ✅ Location history

Workflow:
  1. Driver selects vehicle
  2. Clicks "Start Tracking"
  3. Browser requests location permission
  4. Real-time coordinates update
  5. Driver clicks "Submit My Location"
  6. Saved to database
```

### 4. Tracking Map (`app/tracking/page.tsx`)
```typescript
Manager/Admin page with:
  ✅ Google Map display
  ✅ Vehicle pins with coordinates
  ✅ Click pin → see driver info
  ✅ Color coding:
      Green = completed delivery
      Yellow = in transit
      Red = idle
  ✅ Location history

Data fetched from:
  GET /api/locations → Latest positions
  Refreshes every 30 seconds
```

---

## API Keys & Environment Variables Needed

### 1. Google Maps API Key
```
What: Maps display, markers, zoom control
Where to get: https://console.cloud.google.com
Steps:
  1. Create new project
  2. Enable "Maps JavaScript API"
  3. Create API key
  4. Restrict to your domain

Environment variable:
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

### 2. Supabase Database URL
```
What: Where GPS data is stored
Where to get: Your Supabase project → Settings → API

Environment variables:
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Browser Geolocation API
```
What: Built-in browser feature (no key needed!)
How it works:
  - Browser has GPS access
  - App asks for permission: "Share location?"
  - User clicks "Allow"
  - Browser provides coordinates

No API key needed! ✅
```

---

## Complete Data Flow Diagram

```
DRIVER SIDE (Browser)
┌─────────────────────────────┐
│ /my-location page           │
│  ├─ Vehicle selector        │
│  ├─ "Start Tracking" button │
│  ├─ useGeolocation hook     │
│  │   └─ navigator.geolocation
│  │       └─ Gets: lat, lng  │
│  └─ "Submit Location" button│
└─────────────────────────────┘
            ↓
       HTTP POST
            ↓
DATABASE (Supabase)
┌─────────────────────────────┐
│ vehicle_locations table     │
│  id, vehicle_id, lat, lng,  │
│  accuracy, timestamp        │
└─────────────────────────────┘
            ↑
       HTTP GET
            ↑
MANAGER SIDE (Browser)
┌─────────────────────────────┐
│ /tracking page              │
│  ├─ Google Map              │
│  ├─ Vehicle pins            │
│  ├─ Fetches locations       │
│  │   every 30 seconds       │
│  └─ Shows live positions    │
└─────────────────────────────┘
```

---

## Step-by-Step Setup

### Step 1: Enable Google Maps API
```
1. Go to https://console.cloud.google.com
2. Create or select project
3. Search for "Maps JavaScript API"
4. Click "Enable"
5. Go to Credentials → Create API Key
6. Copy the key
```

### Step 2: Add to Environment
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Step 3: Initialize Database
```bash
pnpm setup-supabase
```

This creates the vehicle_locations table and RLS policies.

### Step 4: Test GPS Tracking
```
1. Login as driver (driver@example.com)
2. Go to /my-location
3. Click "Start Tracking"
4. Allow location access
5. Verify GPS coordinates appear
6. Click "Submit My Location"
7. Go to /tracking (as manager)
8. Verify vehicle appears on map ✅
```

---

## Accuracy Explained

GPS accuracy is measured in meters. The smaller the number, the more accurate:

```
accuracy = 5 meters    → Very accurate (inside building)
accuracy = 15 meters   → Good (typical GPS)
accuracy = 50 meters   → Fair (might be WiFi-based)
accuracy = 100+ meters → Poor (need better signal)
```

The browser provides accuracy automatically. If accuracy is poor:
- Move to open area
- Wait for better GPS signal
- Check browser GPS permissions

---

## Security & Privacy

### Data Protection
```
✅ Only drivers can submit locations
✅ Only drivers' own vehicles
✅ Locations stored in database
✅ Encrypted with Supabase
✅ Row-level security enforced
```

### User Privacy
```
✅ User must grant permission
✅ Permission is per-browser
✅ Can revoke anytime
✅ Location only sent when driver submits
✅ Not continuous collection
```

### Data Retention
```
Query default: Last 24 hours
Editable in /api/locations/route.ts:
  WHERE timestamp > NOW() - INTERVAL '24 hours'
Change to keep more history:
  WHERE timestamp > NOW() - INTERVAL '30 days'
```

---

## Troubleshooting

### "Location permission needed"
```
Solution:
  1. Check browser settings
  2. Allow location access for website
  3. Try again
  4. Or use different browser
```

### "No GPS coordinates appearing"
```
Solution:
  1. Check internet connection
  2. Move to open area (better GPS signal)
  3. Wait 30 seconds for GPS lock
  4. Refresh browser
```

### "Map not showing"
```
Solution:
  1. Verify Google Maps API key in .env.local
  2. Restart dev server: pnpm dev
  3. Clear browser cache
  4. Check API quotas in Google Cloud Console
```

### "Coordinates not saving"
```
Solution:
  1. Verify Supabase keys in .env.local
  2. Check if database tables exist: pnpm setup-supabase
  3. Verify vehicle exists in vehicles table
  4. Check browser console for errors
```

---

## Summary

**VEHICLE GPS TRACKING - Fully Implemented ✅**

| Feature | Status | How |
|---------|--------|-----|
| Capture GPS | ✅ Done | useGeolocation hook |
| Store GPS | ✅ Done | Supabase vehicle_locations |
| Display on Map | ✅ Done | Google Maps API |
| Live tracking | ✅ Done | 30-second refresh |
| Accuracy display | ✅ Done | Shows in coordinates |
| Role-based access | ✅ Done | Drivers submit, managers view |

**What you need:**
1. Google Maps API Key
2. Supabase keys (already in env)
3. Run: pnpm setup-supabase
4. Test it!

**Everything else is ready to go!** 🚀
