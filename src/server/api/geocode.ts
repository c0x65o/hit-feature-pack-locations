// src/server/api/geocode.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '../auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName?: string;
}

/**
 * POST /api/locations/geocode
 * Geocode an address to latitude/longitude
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const address = body.address;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Use Nominatim (OpenStreetMap) for geocoding - free, no API key required
    const encodedAddress = encodeURIComponent(address);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        // Nominatim requires a User-Agent
        'User-Agent': 'HIT-Locations-FeaturePack/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const results = await response.json();
    
    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const result = results[0];
    const geocodingResult: GeocodingResult = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    };

    return NextResponse.json(geocodingResult);
  } catch (error) {
    console.error('[locations] Geocode error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}

