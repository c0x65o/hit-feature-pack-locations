// src/server/api/location-memberships.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locationUserMemberships, locations } from '@/lib/feature-pack-schemas';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function extractId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  // /api/locations/{id}/memberships -> id is third from last
  const membershipsIndex = parts.indexOf('memberships');
  return membershipsIndex > 0 ? parts[membershipsIndex - 1] : null;
}

/**
 * GET /api/locations/[id]/memberships
 * Get all users assigned to a specific location
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Verify location exists
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const items = await db
      .select()
      .from(locationUserMemberships)
      .where(eq(locationUserMemberships.locationId, id))
      .orderBy(desc(locationUserMemberships.createdAt));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[locations] Get location memberships error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}

