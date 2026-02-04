import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get single sub-sector by ID from DB
  const id = searchParams.get('id');
  if (id) {
    const subSectorId = Number(id);
    if (Number.isNaN(subSectorId)) {
      return NextResponse.json({ error: 'Invalid sub-sector id' }, { status: 400 });
    }

    const subSector = await prisma.subSector.findUnique({
      where: { id: subSectorId },
    });

    if (!subSector) {
      return NextResponse.json(
        { error: 'Sub-sector not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subSector });
  }

  // Optional: filter sub-sectors by sector
  const sectorIdParam = searchParams.get('sector_id');
  let where = undefined;

  if (sectorIdParam) {
    const sectorId = Number(sectorIdParam);
    if (Number.isNaN(sectorId)) {
      return NextResponse.json({ error: 'Invalid sector_id' }, { status: 400 });
    }
    where = { sectorId };
  }

  const subSectors = await prisma.subSector.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    subSectors,
    total: subSectors.length,
  });
}
