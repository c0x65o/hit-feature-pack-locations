import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/locations
 * List all locations
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    items: any;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}> | NextResponse<{
    error: string;
}>>;
/**
 * POST /api/locations
 * Create a new location
 */
export declare function POST(request: NextRequest): Promise<NextResponse<any>>;
//# sourceMappingURL=locations.d.ts.map