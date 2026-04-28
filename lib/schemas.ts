import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'driver']),
});

export const vehicleSchema = z.object({
  registration: z.string().min(1, 'Registration number is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  capacity: z.number().positive('Capacity must be positive'),
  status: z.enum(['active', 'inactive', 'maintenance']),
});

export const driverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  licenseNumber: z.string().min(1, 'License number is required'),
  status: z.enum(['active', 'inactive', 'on_leave']),
});

export const deliverySchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  driverId: z.number().int().positive('Driver ID is required'),
  vehicleId: z.number().int().positive('Vehicle ID is required'),
  status: z.enum(['pending', 'in_transit', 'completed', 'cancelled']),
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  dropoffLocation: z.string().min(1, 'Dropoff location is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type DriverInput = z.infer<typeof driverSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
