// src/server/api/memberships-id.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locationUserMemberships } from '@/lib/feature-pack-schemas';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
function extractId(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    // /api/locations/memberships/{id} -> id is last part
    return parts[parts.length - 1] || null;
}
/**
 * DELETE /api/locations/memberships/[id]
 * Remove user from location
 */
export async function DELETE(request) {
    try {
        const db = getDb();
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const [membership] = await db
            .delete(locationUserMemberships)
            .where(eq(locationUserMemberships.id, id))
            .returning();
        if (!membership) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('[locations] Delete membership error:', error);
        return NextResponse.json({ error: 'Failed to delete membership' }, { status: 500 });
    }
}
//# sourceMappingURL=memberships-id.js.map