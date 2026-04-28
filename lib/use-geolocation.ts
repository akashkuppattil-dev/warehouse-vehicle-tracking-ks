'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  error: string | null;
  isLoading: boolean;
  isWatching: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: false,
    isWatching: false,
  });

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    const watchId = navigator.geolocation.watchPosition(
      position => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          error: null,
          isLoading: false,
          isWatching: true,
        });
      },
      error => {
        setState(prev => ({
          ...prev,
          error: error.message || 'Unable to retrieve location',
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return watchId;
  }, []);

  const stopWatching = useCallback((watchId: number) => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    setState(prev => ({ ...prev, isWatching: false }));
  }, []);

  const getCurrentPosition = useCallback(
    () =>
      new Promise<GeolocationCoordinates>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          error => {
            reject(new Error(error.message || 'Unable to retrieve location'));
          }
        );
      }),
    []
  );

  return {
    ...state,
    startWatching,
    stopWatching,
    getCurrentPosition,
  };
}
