'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<VehicleFormData>;
  submitLabel?: string;
}

export interface VehicleFormData {
  registration: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export function VehicleForm({
  onSubmit,
  isLoading = false,
  initialData = {},
  submitLabel = 'Save Vehicle',
}: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    registration: initialData.registration || '',
    make: initialData.make || '',
    model: initialData.model || '',
    year: initialData.year || new Date().getFullYear(),
    capacity: initialData.capacity || 0,
    status: initialData.status || 'active',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'capacity' ? Number(value) : value,
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
        <CardTitle>Vehicle Details</CardTitle>
        <CardDescription>Enter or update vehicle information</CardDescription>
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
              <label htmlFor="registration" className="text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <Input
                id="registration"
                name="registration"
                value={formData.registration}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="ABC-1234"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="make" className="text-sm font-medium text-gray-700">
                Make
              </label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Toyota"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="model" className="text-sm font-medium text-gray-700">
                Model
              </label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Hiace"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium text-gray-700">
                Year
              </label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
                disabled={isLoading}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="capacity" className="text-sm font-medium text-gray-700">
                Capacity (kg)
              </label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
                disabled={isLoading}
                min="0"
                placeholder="1500"
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
