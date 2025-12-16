// src/server/api/tree.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locations } from '@/lib/feature-pack-schemas';
import { eq, asc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * GET /api/locations/tree
 * Get locations in hierarchical tree structure
 */
export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';
        // Get all locations
        let allLocations;
        if (activeOnly) {
            allLocations = await db
                .select()
                .from(locations)
                .where(eq(locations.isActive, true))
                .orderBy(asc(locations.name));
        }
        else {
            allLocations = await db
                .select()
                .from(locations)
                .orderBy(asc(locations.name));
        }
        // Build tree structure
        const locationMap = new Map();
        const rootNodes = [];
        // First pass: create all nodes
        for (const loc of allLocations) {
            locationMap.set(loc.id, {
                id: loc.id,
                name: loc.name,
                code: loc.code,
                parentId: loc.parentId,
                isPrimary: loc.isPrimary,
                isActive: loc.isActive,
                children: [],
            });
        }
        // Second pass: build hierarchy
        for (const loc of allLocations) {
            const node = locationMap.get(loc.id);
            if (loc.parentId) {
                const parent = locationMap.get(loc.parentId);
                if (parent) {
                    parent.children.push(node);
                }
                else {
                    // Parent not found (maybe filtered out), treat as root
                    rootNodes.push(node);
                }
            }
            else {
                rootNodes.push(node);
            }
        }
        return NextResponse.json({ tree: rootNodes });
    }
    catch (error) {
        console.error('[locations] Get tree error:', error);
        return NextResponse.json({ error: 'Failed to fetch location tree' }, { status: 500 });
    }
}
//# sourceMappingURL=tree.js.map