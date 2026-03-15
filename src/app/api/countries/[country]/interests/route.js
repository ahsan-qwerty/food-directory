import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

const INTEREST_INCLUDE = {
  subSector: { select: { id: true, name: true, sector: { select: { id: true, name: true } } } },
  companies: {
    include: {
      company: { select: { id: true, name: true, email: true, representativeName: true } },
    },
    orderBy: { id: 'asc' },
  },
};

async function getProfile(countryName) {
  return prisma.countryProfile.findUnique({ where: { country: countryName } });
}

// GET /api/countries/[country]/interests
export async function GET(req, { params }) {
  const { country } = await params;
  const countryName = decodeURIComponent(country);

  const profile = await getProfile(countryName);
  if (!profile) return NextResponse.json({ interests: [] });

  const interests = await prisma.countryProductInterest.findMany({
    where: { countryProfileId: profile.id },
    include: INTEREST_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ interests });
}

// POST /api/countries/[country]/interests  — create a new interest
export async function POST(req, { params }) {
  const { country } = await params;
  const countryName = decodeURIComponent(country);
  const body = await req.json();

  // Upsert the profile so there is always one
  let profile = await getProfile(countryName);
  if (!profile) {
    profile = await prisma.countryProfile.create({
      data: { country: countryName },
    });
  }

  const subSectorId = body.subSectorId ? Number(body.subSectorId) : null;

  const interest = await prisma.countryProductInterest.create({
    data: {
      countryProfileId: profile.id,
      subSectorId: subSectorId || null,
      customProduct: body.customProduct?.trim() || null,
      notes: body.notes?.trim() || null,
    },
    include: INTEREST_INCLUDE,
  });

  return NextResponse.json({ interest }, { status: 201 });
}
