import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get single company by ID (with junction sector/sub-sector data)
  const id = searchParams.get('id');
  if (id) {
    const companyId = Number(id);
    if (Number.isNaN(companyId)) {
      return NextResponse.json({ error: 'Invalid company id' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        sectors: { select: { sectorId: true } },
        subSectors: { select: { subSectorId: true } },
      },
    });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({
      company: {
        ...company,
        sectorIds: company.sectors.map(s => s.sectorId),
        subSectorIds: company.subSectors.map(ss => ss.subSectorId),
      },
    });
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

// ── PUT (update company) ─────────────────────────────────────────────────────
export async function PUT(request) {
  try {
    const body = await request.json();
    const companyId = Number(body.id);
    if (!companyId || Number.isNaN(companyId)) {
      return NextResponse.json({ error: 'Invalid company id' }, { status: 400 });
    }
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const sectorIds = Array.isArray(body.sectorIds) ? body.sectorIds.map(Number).filter(Boolean) : [];
    const subSectorIds = Array.isArray(body.subSectorIds) ? body.subSectorIds.map(Number).filter(Boolean) : [];

    // Run everything in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Replace junction records
      await tx.companySector.deleteMany({ where: { companyId } });
      await tx.companySubSector.deleteMany({ where: { companyId } });

      return tx.company.update({
        where: { id: companyId },
        data: {
          name: body.name.trim(),
          profile: body.profile?.trim() || null,
          address: body.address?.trim() || null,
          email: body.email?.trim() || null,
          website: body.website?.trim() || null,
          representativeName: body.representativeName?.trim() || null,
          representativeTel: body.representativeTel?.trim() || null,
          representativeWhatsapp: body.representativeWhatsapp?.trim() || null,
          representativeEmail: body.representativeEmail?.trim() || null,
          productsToBeDisplayed: body.productsToBeDisplayed?.trim() || null,
          sectorId: sectorIds[0] ?? null,
          subSectorId: subSectorIds[0] ?? null,
          sectors: sectorIds.length > 0 ? { create: sectorIds.map(id => ({ sectorId: id })) } : undefined,
          subSectors: subSectorIds.length > 0 ? { create: subSectorIds.map(id => ({ subSectorId: id })) } : undefined,
        },
      });
    });

    return NextResponse.json({ success: true, company: updated });
  } catch (error) {
    console.error('Company update error:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

// ── DELETE (delete company) ──────────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const body = await request.json();
    const companyId = Number(body.id);
    if (!companyId || Number.isNaN(companyId)) {
      return NextResponse.json({ error: 'Invalid company id' }, { status: 400 });
    }

    await prisma.company.delete({ where: { id: companyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Company delete error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
