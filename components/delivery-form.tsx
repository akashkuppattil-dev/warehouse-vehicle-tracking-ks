'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<DeliveryFormData>;
  submitLabel?: string;
  showDriverVehicle?: boolean;
}

export interface DeliveryFormData {
  orderId: string;
  driverId: number;
  vehicleId: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  pickupLocation: string;
  dropoffLocation: string;
}

interface Driver {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  registration: string;
}

export function DeliveryForm({
  onSubmit,
  isLoading = false,
  initialData = {},
  submitLabel = 'Create Delivery',
  showDriverVehicle = true,
}: DeliveryFormProps) {
  const [formData, setFormData] = useState<DeliveryFormData>({
    orderId: initialData.orderId || '',
    driverId: initialData.driverId || 0,
    vehicleId: initialData.vehicleId || 0,
    status: initialData.status || 'pending',
    pickupLocation: initialData.pickupLocation || '',
    dropoffLocation: initialData.dropoffLocation || '',
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (showDriverVehicle) {
      fetchDriversAndVehicles();
    }
  }, [showDriverVehicle]);

  const fetchDriversAndVehicles = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/vehicles'),
      ]);

      if (driversRes.ok) {
        const driversData = await driversRes.json();
        setDrivers(driversData);
      }

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
      }
    } catch (err) {
      console.error('Failed to fetch drivers/vehicles:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'driverId' || name === 'vehicleId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Details</CardTitle>
        <CardDescription>Enter or update delivery information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="orderId" className="text-sm font-medium text-gray-700">
                Order ID
              </label>
              <Input
                id="orderId"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="ORD-001"
              />
            </div>

            {showDriverVehicle && (
              <>
                <div className="space-y-2">
                  <label htmlFor="driverId" className="text-sm font-medium text-gray-700">
                    Driver
                  </label>
                  <select
                    id="driverId"
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="vehicleId" className="text-sm font-medium text-gray-700">
                    Vehicle
                  </label>
                  <select
                    id="vehicleId"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registration}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="pickupLocation" className="text-sm font-medium text-gray-700">
              Pickup Location
            </label>
            <Input
              id="pickupLocation"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="123 Main Street, City"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dropoffLocation" className="text-sm font-medium text-gray-700">
              Dropoff Location
            </label>
            <Input
              id="dropoffLocation"
              name="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="456 Oak Avenue, City"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
