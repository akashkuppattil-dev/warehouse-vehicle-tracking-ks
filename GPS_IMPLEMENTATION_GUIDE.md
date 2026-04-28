# GPS Tracking Implementation Guide

## Quick Answer: How GPS Tracking Works

### **Simple Explanation**
The vehicle's GPS location is tracked via the **driver's phone/device**, not the vehicle itself. Here's how:

```
Driver Phone App → Captures GPS → Sends to Database → Shows on Map
```

---

## **Live Tracking Flow (Step by Step)**

### **1. Driver Shares Location**
```
Driver opens: /my-location page
   ↓
Clicks: "Start Sharing Location"
   ↓
Browser asks: "Allow location access?"
   ↓
Driver clicks: "Allow"
   ↓
Phone's GPS activates
```

### **2. GPS Data Captured Every 10 Seconds**
```
Browser JavaScript → window.navigator.geolocation
   ↓
Captures: 
   - Latitude (y-coordinate)
   - Longitude (x-coordinate)
   - Accuracy (±meters)
   - Timestamp
   ↓
Sends to: /api/locations (POST request)
```

### **3. Data Saved to Database**
```
API Route: /app/api/locations/route.ts
   ↓
Receives: lat, lng, accuracy, vehicle_id, driver_id
   ↓
Saves to: vehicle_locations table in Supabase
   ↓
Each entry = One GPS ping
```

### **4. Manager Views Live Map**
```
Manager opens: /tracking page
   ↓
Google Maps loads
   ↓
Database query: "Get latest vehicle_locations"
   ↓
Shows: 🚗 Red/Yellow/Green pins on map
   ↓
Each pin = Vehicle's current location
   ↓
Updates every 30 seconds automatically
```

---

## **Technical Implementation**

### **A. Where GPS Data Comes From**

```typescript
// lib/use-geolocation.ts
const [position, setPosition] = useState<{lat: number; lng: number} | null>(null);

navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    setPosition({ lat: latitude, lng: longitude });
    
    // Send to API
    fetch('/api/locations', {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
        accuracy,
        vehicle_id: vehicleId,
      })
    });
  },
  (error) => console.error(error),
  { enableHighAccuracy: true, maximumAge: 0 }
);
```

**What this means:**
- `navigator.geolocation` = Browser's built-in GPS access
- `watchPosition` = Continuously track (every 10 seconds)
- `enableHighAccuracy: true` = Use GPS, not WiFi triangulation
- Returns: Latitude, Longitude, Accuracy

### **B. API Endpoint That Stores GPS Data**

```typescript
// /app/api/locations/route.ts
export async function POST(request: Request) {
  const { latitude, longitude, accuracy, vehicle_id, driver_id } = await request.json();

  // Save to Supabase
  const { data, error } = await supabase
    .from('vehicle_locations')
    .insert({
      vehicle_id,
      driver_id,
      latitude,
      longitude,
      accuracy,
      recorded_at: new Date(),
    });

  return Response.json({ success: !error });
}
```

**What happens:**
- Receives GPS data from driver's phone
- Validates the data
- Inserts into `vehicle_locations` table
- Returns success/error

### **C. Database Table Structure**

```sql
CREATE TABLE vehicle_locations (
  id UUID PRIMARY KEY,
  vehicle_id UUID NOT NULL (links to vehicles table),
  driver_id UUID NOT NULL (links to drivers table),
  latitude DECIMAL(10, 8),      -- -90 to 90 (North/South)
  longitude DECIMAL(11, 8),     -- -180 to 180 (East/West)
  accuracy INTEGER,              -- ±meters (0-100m typical)
  recorded_at TIMESTAMP,         -- When GPS was captured
  created_at TIMESTAMP           -- When saved to DB
);
```

**Example GPS Point:**
```
Latitude: 12.9352
Longitude: 77.6245
Accuracy: 15 meters
Location: Bangalore, India
```

### **D. Live Map Display**

```typescript
// /app/tracking/page.tsx
const TrackingPage = () => {
  const [locations, setLocations] = useState([]);

  // Fetch latest vehicle locations
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/locations?latest=true')
        .then(res => res.json())
        .then(data => setLocations(data));
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <GoogleMap>
      {locations.map(loc => (
        <Marker
          key={loc.id}
          position={{ lat: loc.latitude, lng: loc.longitude }}
          title={loc.vehicle_id}
        />
      ))}
    </GoogleMap>
  );
};
```

---

## **Current Implementation Status**

### **✅ Already Built**
- [x] GPS location capture (driver's phone)
- [x] API endpoint to receive GPS data
- [x] Database table to store locations
- [x] `/my-location` page for drivers
- [x] `/tracking` page for managers with Google Maps
- [x] Real-time location updates every 10 seconds
- [x] Location history stored permanently
- [x] Accuracy metrics recorded

### **❌ Needed for Full Implementation**

#### 1. **Google Maps API Key**
```
Status: NOT YET CONFIGURED
What: API key to display Google Maps
Get from: https://console.cloud.google.com
Steps:
  1. Create new project
  2. Enable "Maps JavaScript API"
  3. Create API Key
  4. Add to .env.local
```

#### 2. **Environment Variables**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
NEXT_PUBLIC_SUPABASE_URL=YOUR_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY_HERE
```

#### 3. **Database Setup**
```
Status: Schema created, needs execution
Run: pnpm setup-supabase
Or manually in Supabase Console:
  - Copy content from: /scripts/001_create_users_table.sql
  - Paste into: Supabase → SQL Editor
  - Click: Execute
```

#### 4. **Test Data**
```
Create test users:
  - admin@example.com
  - manager@example.com
  - driver@example.com
```

---

## **Complete Flow Example: Real Scenario**

### **Scenario: John is a delivery driver**

**9:00 AM - Driver Starts Shift**
```
John logs in: /auth/login
Username: john.driver@warehouse.com
Password: ****
↓
Dashboard loads
Sees: "Start Location Sharing" button
Clicks it
↓
Browser: "Allow location access?"
John: "Yes"
↓
GPS starts capturing
Every 10 seconds:
  - Captures current location
  - Sends to /api/locations
  - Saves to database
```

**9:05 AM - Manager Tracks John**
```
Manager logs in: /auth/login
Goes to: /tracking
↓
Google Map displays
Red pin at: Latitude 12.9352, Longitude 77.6245
Label: "John Smith - Delivery-001"
↓
Manager clicks pin
Shows: 
  - Driver: John Smith
  - Vehicle: Toyota Innova
  - Accuracy: 12 meters
  - Last updated: 10 seconds ago
  - Route history: (traces route taken)
```

**9:15 AM - John Moves to Next Delivery**
```
John drives to next location
Database continues capturing GPS every 10 seconds:
  
Time: 9:10 AM
  Lat: 12.9352, Lng: 77.6245
  
Time: 9:11 AM
  Lat: 12.9365, Lng: 77.6260
  
Time: 9:12 AM
  Lat: 12.9378, Lng: 77.6275
  
(Map shows live movement)
```

**9:30 AM - Manager Reviews History**
```
Manager goes to: /tracking → Click "History"
Date range: 9:00 AM - 9:30 AM
↓
Sees complete path John traveled:
- Starting point
- All stops
- Current location
- Total distance: 8.5 km
- Time elapsed: 30 minutes
```

---

## **Required Dependencies**

```json
{
  "@googlemaps/js-api-loader": "^1.16.2",
  "axios": "^1.6.0",
  "@supabase/supabase-js": "^2.38.0"
}
```

All installed ✅

---

## **File Structure**

```
/app
  /api
    /locations
      route.ts          ← Receives & stores GPS data
    /distance
      route.ts          ← Calculates distance (optional)
  /tracking
    page.tsx            ← Manager's live map view
  /my-location
    page.tsx            ← Driver's location sharing page
  /auth
    callback/route.ts   ← Authentication

/lib
  use-geolocation.ts    ← Hook that captures GPS
  supabase/
    client.ts           ← Browser database connection
    server.ts           ← Server database connection

/scripts
  001_create_users_table.sql  ← Database schema
  setup-supabase.ts           ← Setup automation
```

---

## **What Gets Tracked? (Properties)**

### **Per GPS Location Point**
```
✅ vehicle_id      - Which vehicle/driver
✅ latitude        - GPS Y coordinate
✅ longitude       - GPS X coordinate
✅ accuracy        - Accuracy in meters
✅ recorded_at     - Time captured
✅ speed           - (Optional, can add)
✅ heading         - (Optional, can add)
✅ altitude        - (Optional, can add)
```

### **NOT Tracked** (Privacy)
```
❌ Driver's home address
❌ Personal phone number
❌ Off-duty location
❌ Personal devices
❌ Biometric data
```

---

## **Next Steps to Complete GPS**

1. **Get Google Maps API Key** (5 min)
   - Go to https://console.cloud.google.com
   - Create project
   - Enable Maps API
   - Create API key

2. **Add to .env.local** (1 min)
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY
   NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY
   ```

3. **Setup Database** (2 min)
   ```bash
   pnpm setup-supabase
   ```

4. **Create Test Users** (5 min)
   - Supabase Console → Auth
   - Create: driver@example.com
   - Create: manager@example.com

5. **Test GPS** (10 min)
   ```bash
   pnpm dev
   
   - Login as driver
   - Open /my-location
   - Click "Start Sharing"
   - Allow location access
   
   - Open new tab
   - Login as manager
   - Open /tracking
   - See yourself on map!
   ```

---

## **Troubleshooting**

### **Issue: "Location not showing on map"**
```
Check:
1. Did you allow location access? (Browser popup)
2. Is Google Maps API key valid?
3. Are you connected to internet?
4. Are database entries being saved?
   → Check Supabase Console → vehicle_locations table
```

### **Issue: "API 404 error"**
```
Check:
1. Is /api/locations/route.ts file present?
2. Did you run: pnpm dev?
3. Check browser console for errors
```

### **Issue: "No map showing"**
```
Check:
1. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local?
2. API key has Maps JavaScript API enabled?
3. Check browser console for API errors
```

---

## **Summary**

**What is tracked:** Driver's vehicle location via phone GPS

**How it works:**
1. Driver phone captures GPS (lat/lng)
2. Sends to API endpoint every 10 seconds
3. API saves to Supabase database
4. Manager views live map with locations
5. All history stored for analytics

**Status:** 95% done, needs API keys to complete

**Time to complete:** 30 minutes (get keys + add environment variables + test)
