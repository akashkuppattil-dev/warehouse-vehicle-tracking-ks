'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle, Clock } from 'lucide-react';

interface Delivery {
  id: number;
  order_id: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  pickup_location: string;
  dropoff_location: string;
  created_at: string;
}

export default function MyDeliveriesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_transit' | 'completed'>('all');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'driver') {
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
      console.warn('API failed, falling back to mock my-deliveries data.');
      setDeliveries([
        { id: 1, order_id: 'ORD-2026-9081', status: 'in_transit', pickup_location: 'Main Warehouse, NJ', dropoff_location: 'Store #44, NY', created_at: new Date().toISOString() },
        { id: 2, order_id: 'ORD-2026-8800', status: 'completed', pickup_location: 'Supplier Yard, CA', dropoff_location: 'Main Warehouse, NJ', created_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
      setError('Offline mode: Showing mock delivery data.');
    }
  };

  const updateDeliveryStatus = async (deliveryId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update delivery');
      await fetchDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update delivery');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'driver') {
    return null;
  }

  const filteredDeliveries = deliveries.filter(d => 
    filter === 'all' ? true : d.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_transit':
        return <MapPin className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      

      <div>
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'in_transit', 'completed'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ').charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
              {' '}
              ({deliveries.filter(d => f === 'all' ? true : d.status === f).length})
            </Button>
          ))}
        </div>

        {/* Deliveries Grid */}
        <div className="grid gap-4">
          {filteredDeliveries.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center text-gray-500">
                No deliveries found in this category.
              </CardContent>
            </Card>
          ) : (
            filteredDeliveries.map(delivery => (
              <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(delivery.status)}
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{delivery.order_id}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(delivery.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">Pickup Location</p>
                        <p className="text-gray-900">{delivery.pickup_location}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">Dropoff Location</p>
                        <p className="text-gray-900">{delivery.dropoff_location}</p>
                      </div>
                    </div>

                    {delivery.status !== 'completed' && delivery.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        {delivery.status === 'pending' && (
                          <Button
                            onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}
                            className="flex-1"
                          >
                            Start Delivery
                          </Button>
                        )}
                        {delivery.status === 'in_transit' && (
                          <Button
                            onClick={() => updateDeliveryStatus(delivery.id, 'completed')}
                            className="flex-1"
                          >
                            Mark as Complete
                          </Button>
                        )}
                      </div>
                    )}
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
