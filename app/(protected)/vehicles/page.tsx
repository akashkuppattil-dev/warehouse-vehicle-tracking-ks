'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleForm, VehicleFormData } from '@/components/vehicle-form';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface Vehicle extends VehicleFormData {
  id: number;
  created_at: string;
}

export default function VehiclesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' || user?.role === 'manager') {
      fetchVehicles();
    }
  }, [isAuthenticated, user]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      console.warn('API failed, falling back to mock vehicle data.');
      setVehicles([
        { id: 1, registration: 'NY-1020', make: 'Ford', model: 'Transit', capacity: 2000, year: 2019, status: 'active', created_at: new Date().toISOString() },
        { id: 2, registration: 'CA-5591', make: 'Mercedes', model: 'Sprinter', capacity: 3500, year: 2021, status: 'active', created_at: new Date().toISOString() },
        { id: 3, registration: 'TX-9021', make: 'Chevrolet', model: 'Express', capacity: 2500, year: 2018, status: 'maintenance', created_at: new Date().toISOString() },
      ]);
      setError('Offline mode: Showing mock vehicle data.');
    }
  };

  const handleSubmit = async (formData: VehicleFormData) => {
    setIsLoading(true);
    try {
      const url = editingId ? `/api/vehicles/${editingId}` : '/api/vehicles';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save vehicle');
      
      await fetchVehicles();
      setShowForm(false);
      setEditingId(null);
      setEditingVehicle(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const response = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      await fetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'manager')) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      

      <div>
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {showForm && (
          <div className="mb-8">
            <VehicleForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialData={editingVehicle || {}}
              submitLabel={editingId ? 'Update Vehicle' : 'Add Vehicle'}
            />
          </div>
        )}

        <div className="grid gap-4">
          {vehicles.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center text-gray-500">
                No vehicles found. Add your first vehicle to get started.
              </CardContent>
            </Card>
          ) : (
            vehicles.map(vehicle => (
              <Card key={vehicle.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Registration</p>
                          <p>{vehicle.registration}</p>
                        </div>
                        <div>
                          <p className="font-medium">Year</p>
                          <p>{vehicle.year}</p>
                        </div>
                        <div>
                          <p className="font-medium">Capacity</p>
                          <p>{vehicle.capacity} kg</p>
                        </div>
                        <div>
                          <p className="font-medium">Status</p>
                          <p className="capitalize">{vehicle.status}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(vehicle)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(vehicle.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
