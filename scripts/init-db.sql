-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'driver')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  model VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  capacity INT,
  fuel_type VARCHAR(50),
  current_driver_id INT REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'on_route', 'in_delivery', 'maintenance')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  emergency_contact VARCHAR(255),
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'on_delivery', 'on_break', 'off_duty')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  assigned_driver_id INT REFERENCES users(id),
  vehicle_id INT REFERENCES vehicles(id),
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  cargo_description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  scheduled_date DATE,
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create delivery_stops table for multi-stop deliveries
CREATE TABLE IF NOT EXISTS delivery_stops (
  id SERIAL PRIMARY KEY,
  delivery_id INT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  stop_number INT NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  arrival_time TIMESTAMP,
  departure_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(delivery_id, stop_number)
);

-- Create vehicle_locations table for GPS tracking history
CREATE TABLE IF NOT EXISTS vehicle_locations (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accuracy DECIMAL(5, 2),
  speed DECIMAL(5, 2)
);

-- Create distance_records table for caching distance calculations
CREATE TABLE IF NOT EXISTS distance_records (
  id SERIAL PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km DECIMAL(10, 2),
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(origin, destination)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_current_driver_id ON vehicles(current_driver_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON deliveries(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_vehicle_id ON deliveries(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_delivery_stops_delivery_id ON delivery_stops(delivery_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_vehicle_id ON vehicle_locations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_timestamp ON vehicle_locations(timestamp);
