'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DriverForm, DriverFormData } from '@/components/driver-form';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface Driver extends DriverFormData {
  id: number;
  created_at: string;
}

export default function DriversPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'manager')) {
      fetchDrivers();
    }
  }, [isAuthenticated, user]);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      if (!response.ok) throw new Error('Failed to fetch drivers');
      const data = await response.json();
      setDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drivers');
    }
  };

  const handleSubmit = async (formData: DriverFormData) => {
    setIsLoading(true);
    try {
      const url = editingId ? `/api/drivers/${editingId}` : '/api/drivers';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save driver');
      
      await fetchDrivers();
      setShowForm(false);
      setEditingId(null);
      setEditingDriver(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save driver');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const response = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete driver');
      await fetchDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete driver');
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setEditingId(driver.id);
    setShowForm(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'manager')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
            <p className="text-sm text-gray-500">Manage your drivers</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setEditingDriver(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Driver
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {showForm && (
          <div className="mb-8">
            <DriverForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialData={editingDriver || {}}
              submitLabel={editingId ? 'Update Driver' : 'Add Driver'}
            />
          </div>
        )}

        <div className="grid gap-4">
          {drivers.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center text-gray-500">
                No drivers found. Add your first driver to get started.
              </CardContent>
            </Card>
          ) : (
            drivers.map(driver => (
              <Card key={driver.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{driver.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Email</p>
                          <p>{driver.email}</p>
                        </div>
                        <div>
                          <p className="font-medium">Phone</p>
                          <p>{driver.phone}</p>
                        </div>
                        <div>
                          <p className="font-medium">License</p>
                          <p>{driver.licenseNumber}</p>
                        </div>
                        <div>
                          <p className="font-medium">Status</p>
                          <p className="capitalize">{driver.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(driver)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(driver.id)}
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
      </main>
    </div>
  );
}
