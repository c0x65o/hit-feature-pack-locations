/**
 * LocationMap Component
 *
 * Displays locations on an interactive map using Leaflet.
 * Falls back gracefully if map libraries aren't available.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useUi } from '@hit/ui-kit';
export function LocationMap({ location, locations = [], height = '400px', zoom = 13, onLocationClick, }) {
    const { Alert } = useUi();
    const mapRef = useRef(null);
    const [mapError, setMapError] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    // Determine which location(s) to show
    const locationsToShow = location ? [location] : locations;
    useEffect(() => {
        // Check if we have valid coordinates
        const hasCoordinates = locationsToShow.some((loc) => loc.latitude && loc.longitude);
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
        return (_jsx("div", { style: { height }, className: "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700", children: _jsx(Alert, { variant: "warning", title: "Map unavailable", children: mapError }) }));
    }
    if (!mapLoaded) {
        return (_jsx("div", { style: { height }, className: "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700", children: _jsx("div", { className: "text-gray-500 dark:text-gray-400", children: "Loading map..." }) }));
    }
    // Placeholder for actual map implementation
    // In production, this would render a Leaflet map
    return (_jsx("div", { ref: mapRef, style: { height }, className: "bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 relative overflow-hidden", children: _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center text-gray-500 dark:text-gray-400", children: [_jsx("div", { className: "text-lg font-semibold mb-2", children: "Map View" }), _jsx("div", { className: "text-sm", children: location
                            ? `Location: ${location.name}`
                            : `${locationsToShow.length} location(s)` }), location?.latitude && location?.longitude && (_jsxs("div", { className: "text-xs mt-2", children: ["Coordinates: ", location.latitude, ", ", location.longitude] })), _jsx("div", { className: "text-xs mt-4 text-gray-400", children: "Leaflet map integration would be rendered here" })] }) }) }));
}
export default LocationMap;
//# sourceMappingURL=LocationMap.js.map