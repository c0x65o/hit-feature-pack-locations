// src/server/api/memberships.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locationUserMemberships, locations } from '@/lib/feature-pack-schemas';
import { eq, desc, and } from 'drizzle-orm';
import { getUserId, extractUserFromRequest } from '../auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/locations/memberships
 * List location memberships (filtered by location or all for admins)
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    
    const locationId = searchParams.get('locationId');
    const all = searchParams.get('all') === 'true';
    
    const userId = getUserId(request);
    const user = extractUserFromRequest(request);
    const isAdmin = user?.roles?.includes('admin');
    
    // Build conditions
    const conditions = [];
    
    if (locationId) {
      conditions.push(eq(locationUserMemberships.locationId, locationId));
    }
    
    // Non-admins can only see their own memberships unless filtering by location
    if (!isAdmin && !locationId) {
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      conditions.push(eq(locationUserMemberships.userKey, userId));
    }
    
    // Admin requesting all memberships
    if (all && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const items = whereClause
      ? await db.select().from(locationUserMemberships).where(whereClause).orderBy(desc(locationUserMemberships.createdAt))
      : await db.select().from(locationUserMemberships).orderBy(desc(locationUserMemberships.createdAt));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[locations] List memberships error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/locations/memberships
 * Create a location membership (assign user to location)
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    // Validate required fields
    if (!body.userKey) {
      return NextResponse.json(
        { error: 'userKey is required' },
        { status: 400 }
      );
    }
    if (!body.locationId) {
      return NextResponse.json(
        { error: 'locationId is required' },
        { status: 400 }
      );
    }

    // Verify location exists
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, body.locationId))
      .limit(1);

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // If setting as default, clear other defaults for this user
    if (body.isDefault) {
      await db
        .update(locationUserMemberships)
        .set({ isDefault: false })
        .where(and(
          eq(locationUserMemberships.userKey, body.userKey),
          eq(locationUserMemberships.isDefault, true)
        ));
    }

    const result = await db.insert(locationUserMemberships).values({
      userKey: body.userKey as string,
      locationId: body.locationId as string,
      isDefault: body.isDefault || false,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('[locations] Create membership error:', error);
    
    // Handle unique constraint violation (user already assigned to location)
    if (error?.code === '23505' || error?.message?.includes('unique')) {
      return NextResponse.json(
        { error: 'User is already assigned to this location' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create membership' },
      { status: 500 }
    );
  }
}

