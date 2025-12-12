/**
 * LocationMap Component
 * 
 * Displays locations on an interactive map using Leaflet.
 * Falls back gracefully if map libraries aren't available.
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import type { Location } from '../hooks/useLocations';
import { useLocationTypes } from '../hooks/useLocationTypes';

// Dynamically import Leaflet components to avoid SSR issues
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;

if (typeof window !== 'undefined') {
  try {
    // Import Leaflet CSS
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('leaflet/dist/leaflet.css');
    
    // Dynamically import react-leaflet components
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const reactLeaflet = require('react-leaflet');
    MapContainer = reactLeaflet.MapContainer;
    TileLayer = reactLeaflet.TileLayer;
    Marker = reactLeaflet.Marker;
    Popup = reactLeaflet.Popup;
  } catch (e) {
    // Leaflet not available
  }
}

interface LocationMapProps {
  location?: Location | null;
  locations?: Location[];
  height?: string;
  zoom?: number;
  onLocationClick?: (location: Location) => void;
}

// Create custom icon for location type
function createIcon(locationType: { icon: string; color: string; name: string; code: string } | null) {
  if (typeof window === 'undefined') return null;
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');
  
  // Fix default icon path issue
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
  
  // Create custom div icon with colored markers
  const color = locationType?.color || '#3b82f6';
  const borderColor = locationType?.color || '#2563eb';
  const label = locationType?.code === 'hq' ? 'HQ' : '•';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${label}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

export function LocationMap({
  location,
  locations = [],
  height = '400px',
  zoom = 13,
  onLocationClick,
}: LocationMapProps) {
  const { Alert } = useUi();
  const [mapError, setMapError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { types } = useLocationTypes();

  // Determine which location(s) to show
  const locationsToShow = useMemo(() => {
    return (location ? [location] : locations).filter(
      (loc) => loc.latitude && loc.longitude
    );
  }, [location, locations]);

  useEffect(() => {
    setIsClient(true);
    
    // Check if Leaflet is available
    if (typeof window !== 'undefined' && !MapContainer) {
      setMapError('Map library not available. Please install leaflet and react-leaflet.');
    }
  }, []);

  useEffect(() => {
    // Check if we have valid coordinates
    if (locationsToShow.length === 0) {
      setMapError('No coordinates available for locations');
      return;
    }
    if (MapContainer) {
      setMapError(null);
    }
  }, [locationsToShow]);

  if (!isClient) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <Alert variant="warning" title="Map unavailable">
          {mapError}
        </Alert>
      </div>
    );
  }

  if (!MapContainer || !TileLayer || !Marker || !Popup) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <Alert variant="warning" title="Map unavailable">
          Map library not installed. Please install leaflet and react-leaflet packages.
        </Alert>
      </div>
    );
  }

  // Calculate center and bounds
  const centerLat = locationsToShow.reduce((sum, loc) => sum + parseFloat(loc.latitude!), 0) / locationsToShow.length;
  const centerLng = locationsToShow.reduce((sum, loc) => sum + parseFloat(loc.longitude!), 0) / locationsToShow.length;
  
  // Calculate bounds for multiple locations
  const bounds = locationsToShow.length > 1
    ? locationsToShow.map((loc) => [parseFloat(loc.latitude!), parseFloat(loc.longitude!)] as [number, number])
    : undefined;

  return (
    <div style={{ height }} className="rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={locationsToShow.length === 1 ? zoom : undefined}
        bounds={bounds}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locationsToShow.map((loc) => {
          const lat = parseFloat(loc.latitude!);
          const lng = parseFloat(loc.longitude!);
  const typeId = (loc as any).locationTypeId || (loc as any).location_type_id;
  const locationType = types.find(t => t.id === typeId);
  const icon = createIcon(locationType ? { icon: locationType.icon, color: locationType.color, name: locationType.name, code: locationType.code } : null);
          
          return (
            <Marker
              key={loc.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onLocationClick) {
                    onLocationClick(loc);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{loc.name}</div>
                  {locationType && (
                    <div className="text-xs mt-1" style={{ color: locationType.color }}>
                      {locationType.name}
                    </div>
                  )}
                  {loc.address && (
                    <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      {loc.address}
                      {loc.city && `, ${loc.city}`}
                      {loc.state && `, ${loc.state}`}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default LocationMap;
