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
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ company });
  }

  // Apply filters (DB-backed companies currently support search only)
  const query = searchParams.get('q');

  const where = query
    ? {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
        { website: { contains: query } },
        { representativeName: { contains: query } },
      ],
    }
    : undefined;

  const companies = await prisma.company.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    companies,
    total: companies.length,
  });
}
