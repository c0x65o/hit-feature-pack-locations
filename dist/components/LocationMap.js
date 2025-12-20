/**
 * LocationMap Component
 *
 * Displays locations on an interactive map using Leaflet.
 * Falls back gracefully if map libraries aren't available.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { useLocationTypes } from '../hooks/useLocationTypes';
// Dynamically import Leaflet components to avoid SSR issues
let MapContainer;
let TileLayer;
let Marker;
let Popup;
let leafletLoaded = false;
// Create custom icon for location type (synchronous version for use in render)
function createIconSync(locationType) {
    if (typeof window === 'undefined')
        return undefined;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const L = require('leaflet');
        // Fix default icon path issue
        delete L.Icon.Default.prototype._getIconUrl;
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
    catch (e) {
        console.warn('Failed to create icon:', e);
        return undefined;
    }
}
export function LocationMap({ location, locations = [], height = '400px', zoom = 13, onLocationClick, }) {
    const { Alert } = useUi();
    const [mapError, setMapError] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [componentsReady, setComponentsReady] = useState(false);
    const { types } = useLocationTypes();
    const typesArray = Array.isArray(types) ? types : [];
    // Determine which location(s) to show
    const locationsToShow = useMemo(() => {
        return (location ? [location] : locations).filter((loc) => loc.latitude && loc.longitude);
    }, [location, locations]);
    useEffect(() => {
        setIsClient(true);
        // If already loaded, mark as ready
        if (leafletLoaded && MapContainer && TileLayer && Marker && Popup) {
            setComponentsReady(true);
            return;
        }
        // Dynamically load Leaflet components
        if (typeof window !== 'undefined' && !leafletLoaded) {
            // Import Leaflet CSS
            import('leaflet/dist/leaflet.css').catch(() => {
                // CSS import failed, but continue
            });
            // Dynamically import react-leaflet components
            import('react-leaflet')
                .then((reactLeaflet) => {
                if (reactLeaflet) {
                    const MapContainerComp = reactLeaflet.MapContainer;
                    const TileLayerComp = reactLeaflet.TileLayer;
                    const MarkerComp = reactLeaflet.Marker;
                    const PopupComp = reactLeaflet.Popup;
                    if (MapContainerComp && typeof MapContainerComp === 'function') {
                        MapContainer = MapContainerComp;
                        TileLayer = TileLayerComp;
                        Marker = MarkerComp;
                        Popup = PopupComp;
                        leafletLoaded = true;
                        setMapError(null);
                        setComponentsReady(true);
                    }
                    else {
                        setMapError('Map library not available. Please install leaflet and react-leaflet.');
                    }
                }
                else {
                    setMapError('Map library not available. Please install leaflet and react-leaflet.');
                }
            })
                .catch((e) => {
                console.error('Failed to load Leaflet:', e);
                setMapError('Map library not available. Please install leaflet and react-leaflet.');
            });
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
        return (_jsx("div", { style: { height }, className: "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700", children: _jsx("div", { className: "text-gray-500 dark:text-gray-400", children: "Loading map..." }) }));
    }
    if (!componentsReady || !MapContainer || !TileLayer || !Marker || !Popup) {
        if (mapError) {
            return (_jsx("div", { style: { height }, className: "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700", children: _jsx(Alert, { variant: "warning", title: "Map unavailable", children: mapError }) }));
        }
        return (_jsx("div", { style: { height }, className: "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700", children: _jsx("div", { className: "text-gray-500 dark:text-gray-400", children: "Loading map..." }) }));
    }
    // Ensure we have valid React components
    if (typeof MapContainer !== 'function' || typeof TileLayer !== 'function' || typeof Marker !== 'function' || typeof Popup !== 'function') {
        return (_jsx("div", { style: { height }, className: "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700", children: _jsx(Alert, { variant: "warning", title: "Map unavailable", children: "Map components not properly loaded. Please refresh the page." }) }));
    }
    // Calculate center and bounds
    const centerLat = locationsToShow.reduce((sum, loc) => sum + parseFloat(loc.latitude), 0) / locationsToShow.length;
    const centerLng = locationsToShow.reduce((sum, loc) => sum + parseFloat(loc.longitude), 0) / locationsToShow.length;
    // Calculate bounds for multiple locations
    const bounds = locationsToShow.length > 1
        ? locationsToShow.map((loc) => [parseFloat(loc.latitude), parseFloat(loc.longitude)])
        : undefined;
    // Ensure we have valid React components
    if (typeof MapContainer !== 'function' || typeof TileLayer !== 'function' || typeof Marker !== 'function' || typeof Popup !== 'function') {
        return (_jsx("div", { style: { height }, className: "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700", children: _jsx(Alert, { variant: "warning", title: "Map unavailable", children: "Map components not properly loaded. Please refresh the page." }) }));
    }
    return (_jsx("div", { style: { height }, className: "rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden", children: _jsxs(MapContainer, { center: [centerLat, centerLng], zoom: locationsToShow.length === 1 ? zoom : undefined, bounds: bounds, style: { height, width: '100%' }, scrollWheelZoom: true, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), locationsToShow.map((loc) => {
                    const lat = parseFloat(loc.latitude);
                    const lng = parseFloat(loc.longitude);
                    const typeId = loc.locationTypeId || loc.location_type_id;
                    const locationType = typesArray.find(t => t.id === typeId);
                    return (_jsx(Marker, { position: [lat, lng], icon: createIconSync(locationType ? { icon: locationType.icon, color: locationType.color, name: locationType.name, code: locationType.code } : null), eventHandlers: {
                            click: () => {
                                if (onLocationClick) {
                                    onLocationClick(loc);
                                }
                            },
                        }, children: _jsx(Popup, { children: _jsxs("div", { className: "text-sm", children: [_jsx("div", { className: "font-semibold", children: loc.name }), locationType && (_jsx("div", { className: "text-xs mt-1", style: { color: locationType.color }, children: locationType.name })), loc.address && (_jsxs("div", { className: "text-gray-600 dark:text-gray-400 text-xs mt-1", children: [loc.address, loc.city && `, ${loc.city}`, loc.state && `, ${loc.state}`] }))] }) }) }, loc.id));
                })] }, `map-${centerLat}-${centerLng}`) }));
}
export default LocationMap;
//# sourceMappingURL=LocationMap.js.map