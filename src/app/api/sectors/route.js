import { NextResponse } from 'next/server';
import { sectors, getSectorById } from '@/data/sectors';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get single sector by ID
  const id = searchParams.get('id');
  if (id) {
    const sector = getSectorById(parseInt(id));
    if (!sector) {
      return NextResponse.json(
        { error: 'Sector not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(sector);
  }
  
  // Get all sectors
  return NextResponse.json({
    sectors,
    total: sectors.length
  });
}
