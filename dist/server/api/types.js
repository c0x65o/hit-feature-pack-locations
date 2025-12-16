// src/server/api/types.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locationTypes } from '@/lib/feature-pack-schemas';
import { asc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * GET /api/locations/types
 * List all location types
 */
export async function GET(request) {
    try {
        const db = getDb();
        const items = await db
            .select()
            .from(locationTypes)
            .orderBy(asc(locationTypes.name));
        return NextResponse.json({ items });
    }
    catch (error) {
        console.error('[locations] List types error:', error);
        return NextResponse.json({ error: 'Failed to fetch location types' }, { status: 500 });
    }
}
/**
 * POST /api/locations/types
 * Create a new location type
 */
export async function POST(request) {
    try {
        const db = getDb();
        const body = await request.json();
        // Validate required fields
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (!body.code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }
        if (!body.icon) {
            return NextResponse.json({ error: 'Icon is required' }, { status: 400 });
        }
        const result = await db.insert(locationTypes).values({
            name: body.name,
            code: body.code,
            icon: body.icon,
            color: body.color || '#3b82f6',
            description: body.description || null,
            isSystem: false, // User-created types are not system types
        }).returning();
        return NextResponse.json(result[0], { status: 201 });
    }
    catch (error) {
        console.error('[locations] Create type error:', error);
        // Handle unique constraint violation
        if (error?.code === '23505' || error?.message?.includes('unique')) {
            return NextResponse.json({ error: 'A location type with this code already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create location type' }, { status: 500 });
    }
}
//# sourceMappingURL=types.js.map