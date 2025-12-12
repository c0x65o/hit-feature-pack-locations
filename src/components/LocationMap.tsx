/**
 * LocationMap Component
 * 
 * Displays locations on an interactive map using Leaflet.
 * Falls back gracefully if map libraries aren't available.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUi } from '@hit/ui-kit';
import type { Location } from '../hooks/useLocations';

interface LocationMapProps {
  location?: Location | null;
  locations?: Location[];
  height?: string;
  zoom?: number;
  onLocationClick?: (location: Location) => void;
}

export function LocationMap({
  location,
  locations = [],
  height = '400px',
  zoom = 13,
  onLocationClick,
}: LocationMapProps) {
  const { Alert } = useUi();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Determine which location(s) to show
  const locationsToShow = location ? [location] : locations;

  useEffect(() => {
    // Check if we have valid coordinates
    const hasCoordinates = locationsToShow.some(
      (loc) => loc.latitude && loc.longitude
    );

    if (!hasCoordinates) {
      setMapError('No coordinates available for this location');
      return;
    }

    // Try to load Leaflet dynamically
    // In a real implementation, you'd import leaflet and react-leaflet
    // For now, we'll show a placeholder that indicates map would go here
    setMapLoaded(true);
    setMapError(null);

    // Note: Actual Leaflet implementation would go here
    // This is a placeholder that shows the structure
  }, [locationsToShow]);

  if (mapError) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <Alert variant="warning" title="Map unavailable">
          {mapError}
        </Alert>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    );
  }

  // Placeholder for actual map implementation
  // In production, this would render a Leaflet map
  return (
    <div
      ref={mapRef}
      style={{ height }}
      className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 relative overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-lg font-semibold mb-2">Map View</div>
          <div className="text-sm">
            {location
              ? `Location: ${location.name}`
              : `${locationsToShow.length} location(s)`}
          </div>
          {location?.latitude && location?.longitude && (
            <div className="text-xs mt-2">
              Coordinates: {location.latitude}, {location.longitude}
            </div>
          )}
          <div className="text-xs mt-4 text-gray-400">
            Leaflet map integration would be rendered here
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationMap;
