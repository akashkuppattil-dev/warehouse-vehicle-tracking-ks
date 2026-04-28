import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_DISTANCE_MATRIX_KEY;

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { origins, destinations } = body;

    if (!origins || !destinations) {
      return NextResponse.json(
        { error: 'Missing origins or destinations' },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Distance Matrix API not configured' },
        { status: 500 }
      );
    }

    // Format origins and destinations for Google Maps API
    const originsStr = origins.map((o: any) => `${o.latitude},${o.longitude}`).join('|');
    const destinationsStr = destinations.map((d: any) => `${d.latitude},${d.longitude}`).join('|');

    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.append('origins', originsStr);
    url.searchParams.append('destinations', destinationsStr);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Distance calculation failed', details: data.status },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[v0] Distance calculation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
