import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/locations/[id]/memberships
 * Get all users assigned to a specific location
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    items: any;
}>>;
//# sourceMappingURL=location-memberships.d.ts.map