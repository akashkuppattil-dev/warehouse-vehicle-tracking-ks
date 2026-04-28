-- Create the warehouse_users table to store user information
-- This links to Supabase's auth.users via foreign key
CREATE TABLE IF NOT EXISTS public.warehouse_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('admin', 'manager', 'driver')),
  vehicle_id UUID,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE public.warehouse_users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "users_read_own_profile" ON public.warehouse_users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile" ON public.warehouse_users
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to read all users
CREATE POLICY "admins_read_all_users" ON public.warehouse_users
  FOR SELECT USING (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) = 'admin'
  );

-- Allow admins to update all users
CREATE POLICY "admins_update_all_users" ON public.warehouse_users
  FOR UPDATE USING (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) = 'admin'
  );

-- Allow admins to insert users
CREATE POLICY "admins_insert_users" ON public.warehouse_users
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) = 'admin'
  );

-- Allow admins to delete users
CREATE POLICY "admins_delete_users" ON public.warehouse_users
  FOR DELETE USING (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) = 'admin'
  );

-- Create the vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  capacity_kg DECIMAL(10, 2),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read vehicles
CREATE POLICY "vehicles_read_authenticated" ON public.vehicles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins/managers to update vehicles
CREATE POLICY "vehicles_update_admin_manager" ON public.vehicles
  FOR UPDATE USING (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) IN ('admin', 'manager')
  );

-- Allow admins to insert vehicles
CREATE POLICY "vehicles_insert_admin" ON public.vehicles
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) = 'admin'
  );

-- Allow admins to delete vehicles
CREATE POLICY "vehicles_delete_admin" ON public.vehicles
  FOR DELETE USING (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) = 'admin'
  );

-- Create the drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.warehouse_users(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry DATE,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read drivers
CREATE POLICY "drivers_read_authenticated" ON public.drivers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow drivers to update their own info
CREATE POLICY "drivers_update_own" ON public.drivers
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins/managers to update drivers
CREATE POLICY "drivers_update_admin_manager" ON public.drivers
  FOR UPDATE USING (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) IN ('admin', 'manager')
  );

-- Create the deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'completed', 'cancelled')),
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8),
  pickup_lng DECIMAL(11, 8),
  dropoff_lat DECIMAL(10, 8),
  dropoff_lng DECIMAL(11, 8),
  weight_kg DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  scheduled_pickup TIMESTAMP WITH TIME ZONE,
  actual_pickup TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read deliveries
CREATE POLICY "deliveries_read_authenticated" ON public.deliveries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow drivers to update their own deliveries
CREATE POLICY "deliveries_update_own_driver" ON public.deliveries
  FOR UPDATE USING (
    driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  );

-- Allow admins/managers to update deliveries
CREATE POLICY "deliveries_update_admin_manager" ON public.deliveries
  FOR UPDATE USING (
    (SELECT role FROM public.warehouse_users WHERE id = auth.uid()) IN ('admin', 'manager')
  );

-- Create the vehicle_locations table for real-time tracking
CREATE TABLE IF NOT EXISTS public.vehicle_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.vehicle_locations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read locations
CREATE POLICY "locations_read_authenticated" ON public.vehicle_locations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow drivers to insert their own locations
CREATE POLICY "locations_insert_own_driver" ON public.vehicle_locations
  FOR INSERT WITH CHECK (
    driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  );

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.warehouse_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own reset tokens
CREATE POLICY "reset_tokens_read_own" ON public.password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);
