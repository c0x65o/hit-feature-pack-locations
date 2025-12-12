/**
 * Geocoding API hooks
 */
export interface GeocodeResult {
    latitude: number;
    longitude: number;
    formattedAddress?: string;
}
interface UseGeocodeOptions {
    provider?: 'nominatim' | 'google';
    apiKey?: string;
}
/**
 * Geocode an address to coordinates
 */
export declare function useGeocode(): {
    geocode: (address: string, options?: UseGeocodeOptions) => Promise<GeocodeResult>;
    loading: boolean;
    error: Error | null;
};
export {};
/**
 * Reverse geocode coordinates to address
 */
//# sourceMappingURL=useGeocoding.d.ts.map