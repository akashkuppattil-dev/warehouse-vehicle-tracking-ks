'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackingMap } from '@/components/tracking-map';
import { RefreshCw } from 'lucide-react';

interface VehicleLocation {
  vehicle_id: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface Vehicle {
  id: number;
  registration: string;
  make: string;
  model: string;
  status: string;
}

export default function TrackingPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [locations, setLocations] = useState<VehicleLocation[]>([]);
  const [vehicles, setVehicles] = useState<Record<number, Vehicle>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'manager')) {
      fetchData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch locations and vehicles in parallel
      const [locationsRes, vehiclesRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/vehicles'),
      ]);

      if (!locationsRes.ok || !vehiclesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const locationsData = await locationsRes.json();
      const vehiclesData = await vehiclesRes.json();

      setLocations(locationsData);
      
      // Create vehicle lookup
      const vehicleMap: Record<number, Vehicle> = {};
      vehiclesData.forEach((v: Vehicle) => {
        vehicleMap[v.id] = v;
      });
      setVehicles(vehicleMap);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
            <p className="text-sm text-gray-500">Real-time vehicle location tracking</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchData}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
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

        {/* Map Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Vehicle Locations</CardTitle>
                <CardDescription>
                  {locations.length} vehicle{locations.length !== 1 ? 's' : ''} tracked
                  {lastUpdate && ` - Last updated: ${lastUpdate.toLocaleTimeString()}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {locations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No vehicle locations available. Make sure drivers have shared their location.</p>
              </div>
            ) : (
              <TrackingMap locations={locations} vehicleInfo={vehicles} />
            )}
          </CardContent>
        </Card>

        {/* Locations List */}
        <Card>
          <CardHeader>
            <CardTitle>Location History</CardTitle>
            <CardDescription>Recent location updates from all vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            {locations.length === 0 ? (
              <p className="text-gray-500">No location data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Vehicle</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Location</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Accuracy</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map(location => (
                      <tr key={location.vehicle_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {vehicles[location.vehicle_id]?.registration}
                            </p>
                            <p className="text-xs text-gray-500">
                              {vehicles[location.vehicle_id]?.make} {vehicles[location.vehicle_id]?.model}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-600">
                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </td>
                        <td className="py-3 px-2 text-gray-600">
                          {location.accuracy ? `${location.accuracy.toFixed(2)} m` : 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-gray-600">
                          {new Date(location.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
