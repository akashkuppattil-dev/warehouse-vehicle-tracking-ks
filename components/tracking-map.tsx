'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface VehicleLocation {
  vehicle_id: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface TrackingMapProps {
  locations: VehicleLocation[];
  vehicleInfo?: Record<string, any>;
}

declare global {
  interface Window {
    google?: any;
  }
}

export function TrackingMap({ locations, vehicleInfo = {} }: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const googleMap = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 20.5937, lng: 78.9629 }, // Default to India
        mapTypeControl: true,
        streetViewControl: false,
      });

      setMap(googleMap);
    });
  }, []);

  useEffect(() => {
    if (!map || locations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers for each location
    const bounds = new window.google.maps.LatLngBounds();

    locations.forEach((location, index) => {
      const marker = new window.google.maps.Marker({
        map,
        position: {
          lat: location.latitude,
          lng: location.longitude,
        },
        title: vehicleInfo[location.vehicle_id]?.registration || `Vehicle ${location.vehicle_id}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 0.8,
          strokeColor: '#1e40af',
          strokeWeight: 2,
        },
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="font-semibold">${vehicleInfo[location.vehicle_id]?.registration || `Vehicle ${location.vehicle_id}`}</div>
          <div class="text-sm text-gray-600">
            <p>${vehicleInfo[location.vehicle_id]?.make || ''} ${vehicleInfo[location.vehicle_id]?.model || ''}</p>
            <p>Accuracy: ${location.accuracy?.toFixed(2) || 'N/A'} m</p>
            <p>${new Date(location.timestamp).toLocaleTimeString()}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        markersRef.current.forEach(m => {
          if (m !== marker) {
            m.infoWindow?.close();
          }
        });
        infoWindow.open(map, marker);
      });

      marker.infoWindow = infoWindow;
      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    // Fit all markers in view
    if (markersRef.current.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, locations, vehicleInfo]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '600px' }}
      className="rounded-lg border border-gray-200"
    />
  );
}
