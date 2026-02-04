import { NextResponse } from 'next/server';
import { subSectors, getSubSectorById, getSubSectorsBySector } from '../../../data/subSectors';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get single sub-sector by ID
  const id = searchParams.get('id');
  if (id) {
    const subSector = getSubSectorById(parseInt(id));
    if (!subSector) {
      return NextResponse.json(
        { error: 'Sub-sector not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(subSector);
  }

  // Get sub-sectors by sector
  const sectorId = searchParams.get('sector_id');
  if (sectorId) {
    const sectorSubSectors = getSubSectorsBySector(sectorId);
    return NextResponse.json({
      subSectors: sectorSubSectors,
      total: sectorSubSectors.length
    });
  }

  // Get all sub-sectors
  return NextResponse.json({
    subSectors,
    total: subSectors.length
  });
}
