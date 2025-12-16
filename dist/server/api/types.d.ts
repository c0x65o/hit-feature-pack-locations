import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/locations/types
 * List all location types
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    items: any;
}> | NextResponse<{
    error: string;
}>>;
/**
 * POST /api/locations/types
 * Create a new location type
 */
export declare function POST(request: NextRequest): Promise<NextResponse<any>>;
//# sourceMappingURL=types.d.ts.map