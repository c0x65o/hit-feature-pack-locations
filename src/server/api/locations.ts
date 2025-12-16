// src/server/api/locations.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { locations, locationTypes } from '@/lib/feature-pack-schemas';
import { eq, desc, asc, like, sql, and, or, isNull, type AnyColumn } from 'drizzle-orm';
import { getUserId } from '../auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/locations
 * List all locations
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const offset = (page - 1) * pageSize;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Search
    const search = searchParams.get('search') || '';
    
    // Filters
    const isActive = searchParams.get('isActive');
    const parentId = searchParams.get('parentId');
    const locationTypeId = searchParams.get('locationTypeId');

    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(locations.name, `%${search}%`),
          like(locations.code, `%${search}%`),
          like(locations.city, `%${search}%`),
          like(locations.state, `%${search}%`)
        )!
      );
    }
    
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(locations.isActive, isActive === 'true'));
    }
    
    if (parentId) {
      if (parentId === 'null') {
        conditions.push(isNull(locations.parentId));
      } else {
        conditions.push(eq(locations.parentId, parentId));
      }
    }
    
    if (locationTypeId) {
      conditions.push(eq(locations.locationTypeId, locationTypeId));
    }

    // Apply sorting
    const sortColumns: Record<string, AnyColumn> = {
      id: locations.id,
      name: locations.name,
      code: locations.code,
      city: locations.city,
      createdAt: locations.createdAt,
      updatedAt: locations.updatedAt,
    };
    const orderCol = sortColumns[sortBy] ?? locations.createdAt;
    const orderDirection = sortOrder === 'asc' ? asc(orderCol) : desc(orderCol);

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(locations);
    const countResult = whereClause
      ? await countQuery.where(whereClause)
      : await countQuery;
    const total = Number(countResult[0]?.count || 0);

    // Execute main query
    const baseQuery = db.select().from(locations);
    const items = whereClause
      ? await baseQuery.where(whereClause).orderBy(orderDirection).limit(pageSize).offset(offset)
      : await baseQuery.orderBy(orderDirection).limit(pageSize).offset(offset);

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[locations] List locations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/locations
 * Create a new location
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await db.insert(locations).values({
      name: body.name as string,
      code: body.code || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      postalCode: body.postalCode || null,
      country: body.country || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      parentId: body.parentId || null,
      locationTypeId: body.locationTypeId || null,
      isPrimary: body.isPrimary || false,
      isActive: body.isActive !== false, // Default true
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('[locations] Create location error:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

