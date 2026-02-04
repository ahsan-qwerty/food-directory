import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get single sector by ID from DB
  const id = searchParams.get('id');
  if (id) {
    const sectorId = Number(id);
    if (Number.isNaN(sectorId)) {
      return NextResponse.json({ error: 'Invalid sector id' }, { status: 400 });
    }

    const sector = await prisma.sector.findUnique({
      where: { id: sectorId },
    });

    if (!sector) {
      return NextResponse.json(
        { error: 'Sector not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sector });
  }

  // Get all sectors from DB
  const sectors = await prisma.sector.findMany({
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    sectors,
    total: sectors.length,
  });
}

export async function PATCH(request) {
  try {
    const data = await request.json();
    const id = Number(data.id);
    const name = typeof data.name === 'string' ? data.name.trim() : '';

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Valid sector id is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Sector name is required' }, { status: 400 });
    }

    const updated = await prisma.sector.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ sector: updated });
  } catch (error) {
    console.error('Error updating sector:', error);
    return NextResponse.json(
      { error: 'Failed to update sector' },
      { status: 500 }
    );
  }
}
