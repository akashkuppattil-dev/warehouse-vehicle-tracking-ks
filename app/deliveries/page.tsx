'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryForm, DeliveryFormData } from '@/components/delivery-form';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface Delivery extends DeliveryFormData {
  id: number;
  created_at: string;
}

export default function DeliveriesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'manager')) {
      fetchDeliveries();
    }
  }, [isAuthenticated, user]);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries');
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      const data = await response.json();
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    }
  };

  const handleSubmit = async (formData: DeliveryFormData) => {
    setIsLoading(true);
    try {
      const url = editingId ? `/api/deliveries/${editingId}` : '/api/deliveries';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save delivery');
      
      await fetchDeliveries();
      setShowForm(false);
      setEditingId(null);
      setEditingDelivery(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save delivery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this delivery?')) return;

    try {
      const response = await fetch(`/api/deliveries/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete delivery');
      await fetchDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete delivery');
    }
  };

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setEditingId(delivery.id);
    setShowForm(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'manager')) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
            <p className="text-sm text-gray-500">Manage delivery orders</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setEditingDelivery(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Delivery
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
            <DeliveryForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialData={editingDelivery || {}}
              submitLabel={editingId ? 'Update Delivery' : 'Create Delivery'}
              showDriverVehicle={true}
            />
          </div>
        )}

        <div className="grid gap-4">
          {deliveries.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center text-gray-500">
                No deliveries found. Create your first delivery to get started.
              </CardContent>
            </Card>
          ) : (
            deliveries.map(delivery => (
              <Card key={delivery.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{delivery.orderId}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Pickup</p>
                          <p className="text-xs">{delivery.pickupLocation}</p>
                        </div>
                        <div>
                          <p className="font-medium">Dropoff</p>
                          <p className="text-xs">{delivery.dropoffLocation}</p>
                        </div>
                        <div>
                          <p className="font-medium">Driver ID</p>
                          <p>{delivery.driverId}</p>
                        </div>
                        <div>
                          <p className="font-medium">Vehicle ID</p>
                          <p>{delivery.vehicleId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(delivery)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(delivery.id)}
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
