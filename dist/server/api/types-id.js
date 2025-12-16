// src/server/api/types-id.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locationTypes } from '@/lib/feature-pack-schemas';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
function extractId(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    // /api/locations/types/{id} -> id is last part
    return parts[parts.length - 1] || null;
}
/**
 * GET /api/locations/types/[id]
 */
export async function GET(request) {
    try {
        const db = getDb();
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const [locationType] = await db
            .select()
            .from(locationTypes)
            .where(eq(locationTypes.id, id))
            .limit(1);
        if (!locationType) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(locationType);
    }
    catch (error) {
        console.error('[locations] Get type error:', error);
        return NextResponse.json({ error: 'Failed to fetch location type' }, { status: 500 });
    }
}
/**
 * PUT /api/locations/types/[id]
 */
export async function PUT(request) {
    try {
        const db = getDb();
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const body = await request.json();
        // Check if exists
        const [existing] = await db
            .select()
            .from(locationTypes)
            .where(eq(locationTypes.id, id))
            .limit(1);
        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        // Build update data
        const updateData = {
            updatedAt: new Date(),
        };
        if (body.name !== undefined)
            updateData.name = body.name;
        // Code is immutable for system types
        if (body.code !== undefined && !existing.isSystem)
            updateData.code = body.code;
        if (body.icon !== undefined)
            updateData.icon = body.icon;
        if (body.color !== undefined)
            updateData.color = body.color;
        if (body.description !== undefined)
            updateData.description = body.description;
        const [locationType] = await db
            .update(locationTypes)
            .set(updateData)
            .where(eq(locationTypes.id, id))
            .returning();
        return NextResponse.json(locationType);
    }
    catch (error) {
        console.error('[locations] Update type error:', error);
        // Handle unique constraint violation
        if (error?.code === '23505' || error?.message?.includes('unique')) {
            return NextResponse.json({ error: 'A location type with this code already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update location type' }, { status: 500 });
    }
}
/**
 * DELETE /api/locations/types/[id]
 */
export async function DELETE(request) {
    try {
        const db = getDb();
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        // Check if exists and is not system type
        const [existing] = await db
            .select()
            .from(locationTypes)
            .where(eq(locationTypes.id, id))
            .limit(1);
        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (existing.isSystem) {
            return NextResponse.json({ error: 'Cannot delete system location type' }, { status: 400 });
        }
        await db.delete(locationTypes).where(eq(locationTypes.id, id));
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('[locations] Delete type error:', error);
        return NextResponse.json({ error: 'Failed to delete location type' }, { status: 500 });
    }
}
//# sourceMappingURL=types-id.js.map