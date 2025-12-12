/**
 * LocationMap Component
 *
 * Displays locations on an interactive map using Leaflet.
 * Falls back gracefully if map libraries aren't available.
 */
import type { Location } from '../hooks/useLocations';
interface LocationMapProps {
    location?: Location | null;
    locations?: Location[];
    height?: string;
    zoom?: number;
    onLocationClick?: (location: Location) => void;
}
export declare function LocationMap({ location, locations, height, zoom, onLocationClick, }: LocationMapProps): import("react/jsx-runtime").JSX.Element;
export default LocationMap;
//# sourceMappingURL=LocationMap.d.ts.map