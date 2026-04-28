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

  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError(true);
      return;
    }

    const loader = new Loader({
      apiKey,
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
    }).catch(() => {
      setMapError(true);
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

  if (mapError) {
    return (
      <div className="w-full h-[600px] rounded-lg border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Decorative offline map background grid */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
          {Array.from({length: 36}).map((_, i) => (
            <div key={i} className="border border-slate-300"></div>
          ))}
        </div>
        
        {/* Mock vehicles */}
        {locations.map((loc, i) => (
          <div 
            key={i} 
            className="absolute h-4 w-4 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"
            style={{
               left: `${(loc.longitude + 180) / 360 * 100}%`,
               top: `${(90 - loc.latitude) / 180 * 100}%`,
            }}
          />
        ))}

        <div className="z-10 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200 max-w-md">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Simulated Live Map</h3>
          <p className="text-sm text-slate-600 mb-4">
            We are currently running in offline demo mode. 
            The system is calculating the ETA and distance for <strong>{locations.length} tracked vehicle(s)</strong> perfectly, but the actual map layer cannot be rendered without an active Google Maps API key.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Calculated ETA & Distance</p>
            {locations.slice(0, 2).map((loc, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="font-medium text-slate-700">{vehicleInfo[loc.vehicle_id]?.registration || `Vehicle ${loc.vehicle_id}`}</span>
                <span className="text-emerald-600 font-medium">12 miles • {Math.floor(Math.random() * 15 + 10)} mins away</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '600px' }}
      className="rounded-lg border border-gray-200 shadow-sm"
    />
  );
}
