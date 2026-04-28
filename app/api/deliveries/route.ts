import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deliverySchema } from '@/lib/schemas';
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

    // If driver, only get their deliveries
    let result;
    if (payload.role === 'driver') {
      result = await query(
        'SELECT * FROM deliveries WHERE driver_id = (SELECT id FROM drivers WHERE email = $1) ORDER BY created_at DESC',
        [payload.email]
      );
    } else if (payload.role === 'admin' || payload.role === 'manager') {
      result = await query('SELECT * FROM deliveries ORDER BY created_at DESC');
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[v0] Get deliveries error:', error);
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
    if (!payload || (payload.role !== 'admin' && payload.role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = deliverySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { orderId, driverId, vehicleId, status, pickupLocation, dropoffLocation } = validation.data;

    const result = await query(
      `INSERT INTO deliveries 
       (order_id, driver_id, vehicle_id, status, pickup_location, dropoff_location) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [orderId, driverId, vehicleId, status, pickupLocation, dropoffLocation]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[v0] Create delivery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
