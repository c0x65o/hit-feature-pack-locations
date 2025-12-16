// src/server/api/locations-id.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locations } from '@/lib/feature-pack-schemas';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
function extractId(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    // /api/locations/{id} -> id is last part
    return parts[parts.length - 1] || null;
}
/**
 * GET /api/locations/[id]
 */
export async function GET(request) {
    try {
        const db = getDb();
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const [location] = await db
            .select()
            .from(locations)
            .where(eq(locations.id, id))
            .limit(1);
        if (!location) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(location);
    }
    catch (error) {
        console.error('[locations] Get location error:', error);
        return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
    }
}
/**
 * PUT /api/locations/[id]
 */
export async function PUT(request) {
    try {
        const db = getDb();
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const body = await request.json();
        // Build update data
        const updateData = {
            updatedAt: new Date(),
        };
        if (body.name !== undefined)
            updateData.name = body.name;
        if (body.code !== undefined)
            updateData.code = body.code;
        if (body.address !== undefined)
            updateData.address = body.address;
        if (body.city !== undefined)
            updateData.city = body.city;
        if (body.state !== undefined)
            updateData.state = body.state;
        if (body.postalCode !== undefined)
            updateData.postalCode = body.postalCode;
        if (body.country !== undefined)
            updateData.country = body.country;
        if (body.latitude !== undefined)
            updateData.latitude = body.latitude;
        if (body.longitude !== undefined)
            updateData.longitude = body.longitude;
        if (body.parentId !== undefined)
            updateData.parentId = body.parentId;
        if (body.locationTypeId !== undefined)
            updateData.locationTypeId = body.locationTypeId;
        if (body.isPrimary !== undefined)
            updateData.isPrimary = body.isPrimary;
        if (body.isActive !== undefined)
            updateData.isActive = body.isActive;
        const [location] = await db
            .update(locations)
            .set(updateData)
            .where(eq(locations.id, id))
            .returning();
        if (!location) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(location);
    }
    catch (error) {
        console.error('[locations] Update location error:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}
/**
 * DELETE /api/locations/[id]
 */
export async function DELETE(request) {
    try {
        const db = getDb();
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        const [location] = await db
            .delete(locations)
            .where(eq(locations.id, id))
            .returning();
        if (!location) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('[locations] Delete location error:', error);
        return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }
}
//# sourceMappingURL=locations-id.js.map