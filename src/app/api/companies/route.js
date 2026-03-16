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

  // Apply filters — each condition is AND-ed together; within a condition, OR is used
  const query = searchParams.get('q');
  const sector = searchParams.get('sector');
  const subSector = searchParams.get('sub_sector');
  const gcc = searchParams.get('gcc');
  const gccCountries = searchParams.getAll('gcc_country').filter(Boolean);

  const conditions = [];

  if (gcc === 'true') {
    conditions.push({ willingToExportToGCC: true });
  }

  // Match companies that have ANY of the selected GCC countries in their gccCountries array.
  // The willingToExportToGCC toggle is intentionally ignored here so all companies
  // with that country listed are included regardless of the toggle state.
  // Filtering is done in-memory after fetching since Prisma/MariaDB doesn't support
  // JSON array contains natively.
  let gccCountryFilter = null;
  if (gccCountries.length > 0) {
    gccCountryFilter = gccCountries;
  }

  if (query) {
    conditions.push({
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
        { website: { contains: query } },
        { representativeName: { contains: query } },
      ],
    });
  }

  if (sector) {
    const sectorId = Number(sector);
    if (!Number.isNaN(sectorId)) {
      conditions.push({
        OR: [
          { sectorId },
          { sectors: { some: { sectorId } } },
        ],
      });
    }
  }

  if (subSector) {
    const subSectorId = Number(subSector);
    if (!Number.isNaN(subSectorId)) {
      conditions.push({
        OR: [
          { subSectorId },
          { subSectors: { some: { subSectorId } } },
        ],
      });
    }
  }

  const finalWhere = conditions.length === 0
    ? undefined
    : conditions.length === 1
      ? conditions[0]
      : { AND: conditions };

  let companies = await prisma.company.findMany({
    where: finalWhere,
    orderBy: { name: 'asc' },
  });

  // Filter by GCC countries if specified (JSON array filtering)
  if (gccCountryFilter && gccCountryFilter.length > 0) {
    companies = companies.filter(company => {
      const companyGccCountries = Array.isArray(company.gccCountries)
        ? company.gccCountries
        : [];
      // Check if company's gccCountries array contains any of the requested countries
      return gccCountryFilter.some(country => companyGccCountries.includes(country));
    });
  }

  // Sort by product export value (descending) when a subsector filter is active
  if (subSector) {
    const subSectorId = Number(subSector);
    if (!Number.isNaN(subSectorId)) {
      companies = companies.sort((a, b) => {
        const getVal = (c) => {
          const exports = typeof c.productExports === 'object' && c.productExports !== null
            ? c.productExports
            : {};
          const v = exports[String(subSectorId)];
          return (v != null && !isNaN(v)) ? Number(v) : -1;
        };
        return getVal(b) - getVal(a);
      });
    }
  }

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

    // The mariadb adapter does not support interactive transactions (P2028).
    // Run operations sequentially instead.
    await prisma.companySector.deleteMany({ where: { companyId } });
    await prisma.companySubSector.deleteMany({ where: { companyId } });

    const updated = await prisma.company.update({
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
        willingToExportToGCC: Boolean(body.willingToExportToGCC),
        gccCountries: Array.isArray(body.gccCountries) ? body.gccCountries : [],
        countryExports: (typeof body.countryExports === 'object' && body.countryExports !== null && !Array.isArray(body.countryExports))
          ? Object.fromEntries(
            Object.entries(body.countryExports)
              .filter(([, v]) => v !== '' && v != null)
              .map(([k, v]) => [k, parseFloat(v)])
              .filter(([, v]) => !isNaN(v))
          )
          : {},
        productExports: (typeof body.productExports === 'object' && body.productExports !== null && !Array.isArray(body.productExports))
          ? Object.fromEntries(
            Object.entries(body.productExports)
              .filter(([, v]) => v !== '' && v != null)
              .map(([k, v]) => [k, parseFloat(v)])
              .filter(([, v]) => !isNaN(v))
          )
          : {},
        countriesAlreadyExportingTo: Array.isArray(body.countriesAlreadyExportingTo)
          ? body.countriesAlreadyExportingTo.filter(c => c && c.trim().length > 0).map(c => c.trim())
          : typeof body.countriesAlreadyExportingTo === 'string'
            ? body.countriesAlreadyExportingTo.split(',').map(c => c.trim()).filter(c => c.length > 0)
            : [],
        sectorId: sectorIds[0] ?? null,
        subSectorId: subSectorIds[0] ?? null,
        sectors: sectorIds.length > 0 ? { create: sectorIds.map(id => ({ sectorId: id })) } : undefined,
        subSectors: subSectorIds.length > 0 ? { create: subSectorIds.map(id => ({ subSectorId: id })) } : undefined,
      },
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
