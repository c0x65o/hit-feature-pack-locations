import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
interface LocationNode {
    id: string;
    name: string;
    code: string | null;
    parentId: string | null;
    isPrimary: boolean;
    isActive: boolean;
    children: LocationNode[];
}
/**
 * GET /api/locations/tree
 * Get locations in hierarchical tree structure
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    tree: LocationNode[];
}> | NextResponse<{
    error: string;
}>>;
export {};
//# sourceMappingURL=tree.d.ts.map