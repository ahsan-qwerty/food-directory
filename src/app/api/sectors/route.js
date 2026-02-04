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
