import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { driverSchema } from '@/lib/schemas';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await query('SELECT * FROM drivers ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[v0] Get drivers error:', error);
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
    const validation = driverSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, phone, licenseNumber, status } = validation.data;

    const result = await query(
      'INSERT INTO drivers (name, email, phone, license_number, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, licenseNumber, status]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[v0] Create driver error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
