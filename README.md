# Warehouse Vehicle Tracking System

A comprehensive full-stack application for real-time fleet management and delivery tracking, built with Next.js, React, TypeScript, and PostgreSQL.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Manager, Driver)
- JWT-based authentication with HTTP-only cookies
- Secure password hashing with bcryptjs
- Login and registration pages

### 🚗 Vehicle Management
- Add, edit, and delete vehicles
- Track vehicle status (active, inactive, maintenance)
- Store vehicle details (make, model, year, capacity)
- Vehicle capacity tracking

### 👨‍💼 Driver Management
- Add, edit, and delete drivers
- Track driver status (active, inactive, on leave)
- License number and contact information
- Driver availability management

### 📦 Delivery Management
- Create and track deliveries
- Assign deliveries to drivers and vehicles
- Multi-stop delivery routes
- Delivery status tracking (pending, in transit, completed, cancelled)
- Pickup and dropoff location management

### 🗺️ Real-Time Tracking
- Live vehicle location tracking on Google Maps
- Real-time location updates from drivers
- Location accuracy metrics
- Historical location data
- Geolocation API integration

### 📍 Distance & ETA Calculations
- Distance calculations using Google Maps Distance Matrix API
- ETA estimation
- Geocoding support for address-to-coordinates conversion
- Route optimization suggestions

### 👥 Role-Based Dashboards
- **Admin Dashboard**: Full access to all features
- **Manager Dashboard**: Vehicle, driver, and delivery management
- **Driver Dashboard**: View assigned deliveries, share location, track routes

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI**: React 19 with shadcn/ui components
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks, Context API
- **Forms**: React Hook Form with Zod validation
- **Maps**: Google Maps JavaScript API

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs
- **API**: RESTful endpoints with TypeScript

### Database Schema
- **users**: Authentication and user management
- **vehicles**: Fleet inventory and details
- **drivers**: Driver information and status
- **deliveries**: Delivery orders and status
- **vehicle_locations**: Real-time location tracking

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- Google Maps API keys:
  - Maps JavaScript API
  - Distance Matrix API
  - Geocoding API

### Installation

1. **Clone or extract the project**
   ```bash
   cd vehicle-tracking-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `GOOGLE_MAPS_DISTANCE_MATRIX_KEY`: Your Distance Matrix API key
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your public Google Maps API key
   - `JWT_SECRET`: A secure random string

4. **Initialize the database**
   ```bash
   pnpm run setup-db
   ```
   
   This will:
   - Create all required tables
   - Seed demo users:
     - **Admin**: admin@example.com / password123
     - **Manager**: manager@example.com / password123
     - **Driver**: driver@example.com / password123

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── vehicles/          # Vehicle CRUD operations
│   │   ├── drivers/           # Driver CRUD operations
│   │   ├── deliveries/        # Delivery management
│   │   ├── locations/         # Location tracking
│   │   ├── distance/          # Distance calculations
│   │   └── geocode/           # Address geocoding
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── dashboard/             # Main dashboard
│   ├── vehicles/              # Vehicle management
│   ├── drivers/               # Driver management
│   ├── deliveries/            # Delivery management
│   ├── tracking/              # Live tracking map
│   ├── my-deliveries/         # Driver's assignments
│   └── my-location/           # Driver location sharing
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── vehicle-form.tsx       # Vehicle form component
│   ├── driver-form.tsx        # Driver form component
│   ├── delivery-form.tsx      # Delivery form component
│   └── tracking-map.tsx       # Google Maps tracking
├── lib/
│   ├── db.ts                  # Database connection
│   ├── auth.ts                # Authentication utilities
│   ├── schemas.ts             # Zod validation schemas
│   ├── auth-context.tsx       # Auth context provider
│   └── use-geolocation.ts     # Geolocation hook
├── scripts/
│   ├── init-db.sql            # Database schema
│   └── setup-db.ts            # Setup script
└── public/                    # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/[id]` - Get vehicle details
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle

### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create driver
- `GET /api/drivers/[id]` - Get driver details
- `PUT /api/drivers/[id]` - Update driver
- `DELETE /api/drivers/[id]` - Delete driver

### Deliveries
- `GET /api/deliveries` - List deliveries (role-based)
- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries/[id]` - Get delivery details
- `PUT /api/deliveries/[id]` - Update delivery status
- `DELETE /api/deliveries/[id]` - Delete delivery

### Locations
- `GET /api/locations` - Get latest vehicle locations
- `POST /api/locations` - Submit driver location

### Utilities
- `POST /api/distance` - Calculate distances
- `POST /api/geocode` - Geocode address to coordinates

## Database Setup

The `scripts/init-db.sql` file contains all table definitions:

- **users**: User accounts with roles
- **vehicles**: Fleet vehicles with specifications
- **drivers**: Driver information and status
- **deliveries**: Delivery orders with assignments
- **vehicle_locations**: Real-time location tracking

Demo users are automatically created with password123.

## Security Features

- ✅ HTTP-only cookies for authentication tokens
- ✅ Secure password hashing with bcryptjs
- ✅ JWT token validation on all protected routes
- ✅ Role-based access control on API endpoints
- ✅ CSRF protection via SameSite cookies
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention with parameterized queries

## Usage Examples

### Admin User
1. Login with admin@example.com / password123
2. Access full dashboard with all features
3. Manage vehicles, drivers, and deliveries
4. View live tracking of all vehicles

### Manager User
1. Login with manager@example.com / password123
2. Manage fleet operations
3. Assign deliveries
4. Monitor vehicle locations

### Driver User
1. Login with driver@example.com / password123
2. View assigned deliveries
3. Share your location in real-time
4. Update delivery status

## Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel project settings
4. Deploy automatically

### Environment Variables for Production
Make sure to set all required environment variables in your Vercel project:
- DATABASE_URL
- GOOGLE_MAPS_API_KEY
- GOOGLE_MAPS_DISTANCE_MATRIX_KEY
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- JWT_SECRET (use a strong random string)

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format
- Check PostgreSQL server is running
- Ensure network access is allowed

### Google Maps Not Working
- Verify API keys are valid
- Check API quotas and billing
- Enable required APIs in Google Cloud Console

### Location Tracking Not Working
- Allow browser location permissions
- Check geolocation is enabled in browser settings
- Verify HTTPS is used (or localhost for development)

## Future Enhancements

- WebSocket support for real-time updates
- Advanced route optimization
- Multi-stop delivery planning
- Performance analytics
- Mobile app (React Native)
- Delivery proof of delivery (POD)
- Customer notifications
- Analytics dashboard

## License

This project is created with v0 and is available for development and deployment.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review environment variable configuration
3. Check console logs for error messages
4. Verify database connectivity

---

Built with ❤️ using v0.app
