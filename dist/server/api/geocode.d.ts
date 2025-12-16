import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
interface GeocodingResult {
    latitude: number;
    longitude: number;
    displayName?: string;
}
/**
 * POST /api/locations/geocode
 * Geocode an address to latitude/longitude
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<GeocodingResult>>;
export {};
//# sourceMappingURL=geocode.d.ts.map