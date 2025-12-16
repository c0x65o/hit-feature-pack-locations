// src/server/api/set-primary.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locations } from '@/lib/feature-pack-schemas';
import { eq } from 'drizzle-orm';
import { getUserId } from '../auth';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
function extractId(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    // /api/locations/{id}/set-primary -> id is third from last
    const primaryIndex = parts.indexOf('set-primary');
    return primaryIndex > 0 ? parts[primaryIndex - 1] : null;
}
/**
 * POST /api/locations/[id]/set-primary
 * Set a location as the primary/HQ location
 */
export async function POST(request) {
    try {
        const db = getDb();
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const userId = getUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Verify location exists
        const [existing] = await db
            .select()
            .from(locations)
            .where(eq(locations.id, id))
            .limit(1);
        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        // Clear isPrimary from all other locations
        await db
            .update(locations)
            .set({ isPrimary: false, updatedAt: new Date() })
            .where(eq(locations.isPrimary, true));
        // Set this location as primary
        const [location] = await db
            .update(locations)
            .set({ isPrimary: true, updatedAt: new Date() })
            .where(eq(locations.id, id))
            .returning();
        return NextResponse.json(location);
    }
    catch (error) {
        console.error('[locations] Set primary error:', error);
        return NextResponse.json({ error: 'Failed to set primary location' }, { status: 500 });
    }
}
//# sourceMappingURL=set-primary.js.map