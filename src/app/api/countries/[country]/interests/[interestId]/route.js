import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prismaClient';

const INTEREST_INCLUDE = {
  subSector: { select: { id: true, name: true, sector: { select: { id: true, name: true } } } },
  companies: {
    include: {
      company: { select: { id: true, name: true, email: true, representativeName: true } },
    },
    orderBy: { id: 'asc' },
  },
};

// PUT /api/countries/[country]/interests/[interestId]
// Body: { notes?, companyIds? }  — full-replace companies list + update notes
export async function PUT(req, { params }) {
  const { interestId } = await params;
  const id = Number(interestId);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await req.json();

  // Update notes if provided
  await prisma.countryProductInterest.update({
    where: { id },
    data: { notes: body.notes !== undefined ? (body.notes?.trim() || null) : undefined },
  });

  // Replace companies list if provided
  if (Array.isArray(body.companyIds)) {
    await prisma.countryInterestCompany.deleteMany({ where: { interestId: id } });
    if (body.companyIds.length > 0) {
      await prisma.countryInterestCompany.createMany({
        data: body.companyIds.map(cid => ({ interestId: id, companyId: Number(cid) })),
        skipDuplicates: true,
      });
    }
  }

  const updated = await prisma.countryProductInterest.findUnique({
    where: { id },
    include: INTEREST_INCLUDE,
  });

  return NextResponse.json({ interest: updated });
}

// DELETE /api/countries/[country]/interests/[interestId]
export async function DELETE(req, { params }) {
  const { interestId } = await params;
  const id = Number(interestId);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  await prisma.countryProductInterest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
