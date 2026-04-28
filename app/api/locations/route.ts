import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get latest location for each vehicle
    const result = await query(`
      SELECT DISTINCT ON (vehicle_id) 
        vehicle_id, 
        latitude, 
        longitude, 
        accuracy, 
        timestamp
      FROM vehicle_locations
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      ORDER BY vehicle_id, timestamp DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[v0] Get locations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (payload?.role !== 'driver') {
      return NextResponse.json({ error: 'Only drivers can submit locations' }, { status: 403 });
    }

    const body = await request.json();
    const { vehicleId, latitude, longitude, accuracy } = body;

    if (!vehicleId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert location
    const result = await query(
      `INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, accuracy, timestamp)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [vehicleId, latitude, longitude, accuracy || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[v0] Create location error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
