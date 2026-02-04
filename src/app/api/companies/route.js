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
      where.sectorId = sectorId;
    }
  }

  if (subSector) {
    const subSectorId = Number(subSector);
    if (!Number.isNaN(subSectorId)) {
      where.subSectorId = subSectorId;
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
