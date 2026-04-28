'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGeolocation } from '@/lib/use-geolocation';
import { AlertCircle, MapPin, Loader } from 'lucide-react';

interface Vehicle {
  id: number;
  registration: string;
}

export default function MyLocationPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const {
    coordinates,
    error: geoError,
    isLoading: geoLoading,
    isWatching,
    startWatching,
    stopWatching,
    getCurrentPosition,
  } = useGeolocation();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'driver') {
      fetchVehicles();
    }
  }, [isAuthenticated, user]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      setVehicles(data);
      if (data.length > 0) {
        setSelectedVehicleId(data[0].id);
      }
    } catch (err) {
      console.warn('API failed, falling back to mock vehicle data for location page.');
      const mockVehicles = [
        { id: 1, registration: 'NY-1020' },
        { id: 2, registration: 'CA-5591' },
      ];
      setVehicles(mockVehicles);
      setSelectedVehicleId(mockVehicles[0].id);
      setError('Offline mode: Using simulated vehicles for location tracking.');
    }
  };

  const submitLocation = async () => {
    if (!coordinates || !selectedVehicleId) {
      setError('Please select a vehicle and allow location access');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          accuracy: coordinates.accuracy,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit location');

      setSuccess('Location submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTracking = () => {
    const id = startWatching();
    if (id !== undefined) {
      setWatchId(id);
    }
  };

  const handleStopTracking = () => {
    if (watchId !== null) {
      stopWatching(watchId);
      setWatchId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'driver') {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      

      <div>
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-4 border-green-200 bg-green-50">
            <CardContent className="pt-4 text-green-700 text-sm">{success}</CardContent>
          </Card>
        )}

        {geoError && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4 text-yellow-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Location permission needed</p>
                <p className="text-xs">{geoError}</p>
                <p className="text-xs mt-1">Please enable location access in your browser settings</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Vehicle</CardTitle>
            <CardDescription>Choose which vehicle you&apos;re currently driving</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={selectedVehicleId || ''}
              onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Current Location */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Current Location
            </CardTitle>
            <CardDescription>
              {coordinates
                ? `Accuracy: ${coordinates.accuracy.toFixed(2)} meters`
                : 'No location data yet'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {coordinates ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Latitude</p>
                    <p className="font-mono text-lg text-gray-900">
                      {coordinates.latitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Longitude</p>
                    <p className="font-mono text-lg text-gray-900">
                      {coordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Location not available yet</p>
              </div>
            )}

            <div className="flex gap-2">
              {!isWatching ? (
                <Button
                  onClick={handleStartTracking}
                  disabled={geoLoading}
                  className="flex-1"
                  variant="outline"
                >
                  {geoLoading ? 'Getting location...' : 'Enable Location Tracking'}
                </Button>
              ) : (
                <Button
                  onClick={handleStopTracking}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  Stop Tracking
                </Button>
              )}

              <Button
                onClick={() => getCurrentPosition().then(coords => {
                  setSuccess('Location refreshed!');
                  setTimeout(() => setSuccess(''), 3000);
                }).catch(err => setError(err.message))}
                disabled={geoLoading}
                variant="outline"
              >
                {geoLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Location */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Location</CardTitle>
            <CardDescription>Share your current location with the office</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={submitLocation}
              disabled={isSubmitting || !coordinates || !selectedVehicleId}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit My Location'}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Your location will be visible on the tracking map in the control center.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
