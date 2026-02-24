import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get single company by ID
  const id = searchParams.get('id');
  if (id) {
    const companyId = Number(id);
    if (Number.isNaN(companyId)) {
      return NextResponse.json({ error: 'Invalid company id' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    console.log('CompaniesPage DB company:', company);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ company });
  }

  // Apply filters
  const query = searchParams.get('q');
  const sector = searchParams.get('sector');
  const subSector = searchParams.get('sub_sector');

  const where = {};

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { email: { contains: query } },
      { website: { contains: query } },
      { representativeName: { contains: query } },
    ];
  }

  if (sector) {
    const sectorId = Number(sector);
    if (!Number.isNaN(sectorId)) {
      // Match companies where this sector is either the primary FK
      // OR any entry in the many-to-many junction table
      where.OR = [
        { sectorId },
        { sectors: { some: { sectorId } } },
      ];
    }
  }

  if (subSector) {
    const subSectorId = Number(subSector);
    if (!Number.isNaN(subSectorId)) {
      // Match companies where this sub-sector is either the primary FK
      // OR any entry in the many-to-many junction table
      const subFilter = [
        { subSectorId },
        { subSectors: { some: { subSectorId } } },
      ];
      // Merge with any existing OR (from sector filter above)
      if (where.OR) {
        // Both filters must match: wrap in AND
        where.AND = [
          { OR: where.OR },
          { OR: subFilter },
        ];
        delete where.OR;
      } else {
        where.OR = subFilter;
      }
    }
  }

  const finalWhere = Object.keys(where).length > 0 ? where : undefined;

  const companies = await prisma.company.findMany({
    where: finalWhere,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    companies,
    total: companies.length,
  });
}
