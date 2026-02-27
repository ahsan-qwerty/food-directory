import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

function formatDateYYYYMMDD(dateValue) {
  try {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function toNumberOrNull(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get single event by ID
  const id = searchParams.get('id');
  if (id) {
    const eventId = Number(id);
    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        division: true,
        deskOfficer: true,
        description: true,
        location: true,
        eventDate: true,
        startDate: true,
        endDate: true,
        datesText: true,
        region: true,
        country: true,
        city: true,
        sectorProducts: true,
        subsidyPercentage: true,
        tdapCost: true,
        exhibitorCost: true,
        totalEstimatedBudget: true,
        utilizedBudget: true,
        recommendedByJustification: true,
        feedbackFormUrl: true,
        finalRemarks: true,
        status: true,
        closedAt: true,
        eventSectors: {
          select: {
            sectorId: true,
            sector: { select: { id: true, name: true } },
          },
        },
        participants: {
          select: {
            companyId: true,
            company: {
              select: {
                id: true,
                name: true,
                profile: true,
                address: true,
                email: true,
                website: true,
                representativeName: true,
                productsToBeDisplayed: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: event.id,
      name: event.name,
      division: event.division,
      deskOfficer: event.deskOfficer,
      description: event.description,
      location: event.location,
      eventDate: event.eventDate,
      date: formatDateYYYYMMDD(event.eventDate),
      startDate: event.startDate,
      endDate: event.endDate,
      datesText: event.datesText,
      region: event.region,
      country: event.country,
      city: event.city,
      sectorProducts: event.sectorProducts,
      subsidyPercentage: event.subsidyPercentage ? Number(event.subsidyPercentage) : null,
      tdapCost: event.tdapCost ? Number(event.tdapCost) : null,
      exhibitorCost: event.exhibitorCost ? Number(event.exhibitorCost) : null,
      totalEstimatedBudget: event.totalEstimatedBudget ? Number(event.totalEstimatedBudget) : null,
      recommendedByJustification: event.recommendedByJustification,
      // Multi-sector: array of sector objects + convenience array of IDs
      sectors: event.eventSectors.map((es) => es.sector),
      sectorIds: event.eventSectors.map((es) => es.sectorId),
      participatingCompanyIds: event.participants.map((p) => p.companyId),
      participants: event.participants.map((p) => p.company).filter(Boolean),
      feedbackFormUrl: event.feedbackFormUrl,
      finalRemarks: event.finalRemarks,
    });
  }

  // Get all events
  const allEvents = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      division: true,
      deskOfficer: true,
      description: true,
      location: true,
      eventDate: true,
      startDate: true,
      endDate: true,
      datesText: true,
      country: true,
      city: true,
      participants: { select: { companyId: true } },
    },
    orderBy: { eventDate: 'desc' },
  });

  const events = allEvents.map((e) => ({
    id: e.id,
    name: e.name,
    division: e.division,
    deskOfficer: e.deskOfficer,
    description: e.description,
    location: e.location,
    eventDate: e.eventDate,
    date: formatDateYYYYMMDD(e.eventDate),
    startDate: e.startDate,
    endDate: e.endDate,
    datesText: e.datesText,
    country: e.country,
    city: e.city,
    participatingCompanyIds: e.participants.map((p) => p.companyId),
  }));

  return NextResponse.json({
    events,
    total: events.length
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    if (!body.eventDate) {
      return NextResponse.json(
        { error: 'Event date is required' },
        { status: 400 }
      );
    }

    // Validate sectorIds
    const rawSectorIds = Array.isArray(body.sectorIds) ? body.sectorIds : [];
    const sectorIds = rawSectorIds.map(Number).filter((n) => Number.isFinite(n) && n > 0);

    if (sectorIds.length > 0) {
      const found = await prisma.sector.findMany({
        where: { id: { in: sectorIds } },
        select: { id: true },
      });
      const foundIds = new Set(found.map((s) => s.id));
      const invalid = sectorIds.filter((id) => !foundIds.has(id));
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Invalid sector IDs: ${invalid.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Derive legacy sectorProducts from the first selected sector name (backward compat)
    let sectorProductsValue = body.sectorProducts?.trim() || null;
    if (!sectorProductsValue && sectorIds.length > 0) {
      const firstSector = await prisma.sector.findUnique({
        where: { id: sectorIds[0] },
        select: { name: true },
      });
      sectorProductsValue = firstSector?.name || null;
    }

    const eventData = {
      name: body.name.trim(),
      division: body.division?.trim() || null,
      deskOfficer: body.deskOfficer?.trim() || null,
      description: body.description?.trim() || null,
      location: body.location?.trim() || null,
      eventDate: new Date(body.eventDate),
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      datesText: body.datesText?.trim() || null,
      region: body.region?.trim() || null,
      country: body.country?.trim() || null,
      city: body.city?.trim() || null,
      sectorProducts: sectorProductsValue,
      subsidyPercentage: toNumberOrNull(body.subsidyPercentage),
      tdapCost: toNumberOrNull(body.tdapCost),
      exhibitorCost: toNumberOrNull(body.exhibitorCost),
      totalEstimatedBudget: toNumberOrNull(body.totalEstimatedBudget),
      recommendedByJustification: body.recommendedByJustification?.trim() || null,
      feedbackFormUrl: body.feedbackFormUrl?.trim() || null,
      finalRemarks: body.finalRemarks?.trim() || null,
    };

    const event = await prisma.event.create({
      data: eventData,
      select: {
        id: true,
        name: true,
        division: true,
        deskOfficer: true,
        description: true,
        location: true,
        eventDate: true,
        startDate: true,
        endDate: true,
        datesText: true,
        region: true,
        country: true,
        city: true,
        sectorProducts: true,
        subsidyPercentage: true,
        tdapCost: true,
        exhibitorCost: true,
        totalEstimatedBudget: true,
        recommendedByJustification: true,
        feedbackFormUrl: true,
        finalRemarks: true,
        createdAt: true,
      },
    });

    if (sectorIds.length > 0) {
      await prisma.eventSector.createMany({
        data: sectorIds.map((sectorId) => ({ eventId: event.id, sectorId })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      id: event.id,
      name: event.name,
      division: event.division,
      deskOfficer: event.deskOfficer,
      description: event.description,
      location: event.location,
      eventDate: event.eventDate,
      date: formatDateYYYYMMDD(event.eventDate),
      startDate: event.startDate,
      endDate: event.endDate,
      datesText: event.datesText,
      region: event.region,
      country: event.country,
      city: event.city,
      sectorProducts: event.sectorProducts,
      subsidyPercentage: event.subsidyPercentage ? Number(event.subsidyPercentage) : null,
      tdapCost: event.tdapCost ? Number(event.tdapCost) : null,
      exhibitorCost: event.exhibitorCost ? Number(event.exhibitorCost) : null,
      totalEstimatedBudget: event.totalEstimatedBudget ? Number(event.totalEstimatedBudget) : null,
      recommendedByJustification: event.recommendedByJustification,
      sectorIds,
      feedbackFormUrl: event.feedbackFormUrl,
      finalRemarks: event.finalRemarks,
      createdAt: event.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const eventId = Number(body.id);

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Valid event id is required' },
        { status: 400 }
      );
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    if (!body.eventDate) {
      return NextResponse.json(
        { error: 'Event date is required' },
        { status: 400 }
      );
    }

    // Validate sectorIds if provided
    const hasSectorIds = Array.isArray(body.sectorIds);
    const rawSectorIds = hasSectorIds ? body.sectorIds : [];
    const sectorIds = rawSectorIds.map(Number).filter((n) => Number.isFinite(n) && n > 0);

    if (sectorIds.length > 0) {
      const found = await prisma.sector.findMany({
        where: { id: { in: sectorIds } },
        select: { id: true },
      });
      const foundIds = new Set(found.map((s) => s.id));
      const invalid = sectorIds.filter((id) => !foundIds.has(id));
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Invalid sector IDs: ${invalid.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const eventData = {};
    if (body.name !== undefined) eventData.name = body.name.trim();
    if (body.division !== undefined) eventData.division = body.division?.trim() || null;
    if (body.deskOfficer !== undefined) eventData.deskOfficer = body.deskOfficer?.trim() || null;
    if (body.description !== undefined) eventData.description = body.description?.trim() || null;
    if (body.location !== undefined) eventData.location = body.location?.trim() || null;
    if (body.eventDate !== undefined) eventData.eventDate = new Date(body.eventDate);
    if (body.startDate !== undefined) eventData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) eventData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.datesText !== undefined) eventData.datesText = body.datesText?.trim() || null;
    if (body.region !== undefined) eventData.region = body.region?.trim() || null;
    if (body.country !== undefined) eventData.country = body.country?.trim() || null;
    if (body.city !== undefined) eventData.city = body.city?.trim() || null;
    if (body.subsidyPercentage !== undefined) eventData.subsidyPercentage = toNumberOrNull(body.subsidyPercentage);
    if (body.tdapCost !== undefined) eventData.tdapCost = toNumberOrNull(body.tdapCost);
    if (body.exhibitorCost !== undefined) eventData.exhibitorCost = toNumberOrNull(body.exhibitorCost);
    if (body.totalEstimatedBudget !== undefined) eventData.totalEstimatedBudget = toNumberOrNull(body.totalEstimatedBudget);
    if (body.recommendedByJustification !== undefined) eventData.recommendedByJustification = body.recommendedByJustification?.trim() || null;
    if (body.feedbackFormUrl !== undefined) eventData.feedbackFormUrl = body.feedbackFormUrl?.trim() || null;
    if (body.finalRemarks !== undefined) eventData.finalRemarks = body.finalRemarks?.trim() || null;

    // Sync sectorProducts legacy field from the selected sectors
    if (hasSectorIds) {
      if (sectorIds.length > 0) {
        const firstSector = await prisma.sector.findUnique({
          where: { id: sectorIds[0] },
          select: { name: true },
        });
        eventData.sectorProducts = firstSector?.name || null;
      } else {
        eventData.sectorProducts = null;
      }
    } else if (body.sectorProducts !== undefined) {
      eventData.sectorProducts = body.sectorProducts?.trim() || null;
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: eventData,
      select: {
        id: true,
        name: true,
        division: true,
        deskOfficer: true,
        description: true,
        location: true,
        eventDate: true,
        startDate: true,
        endDate: true,
        datesText: true,
        region: true,
        country: true,
        city: true,
        sectorProducts: true,
        subsidyPercentage: true,
        tdapCost: true,
        exhibitorCost: true,
        totalEstimatedBudget: true,
        recommendedByJustification: true,
        feedbackFormUrl: true,
        finalRemarks: true,
        updatedAt: true,
      },
    });

    // If sectorIds were sent, replace all junction rows
    if (hasSectorIds) {
      await prisma.eventSector.deleteMany({ where: { eventId } });
      if (sectorIds.length > 0) {
        await prisma.eventSector.createMany({
          data: sectorIds.map((sectorId) => ({ eventId, sectorId })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json({
      id: event.id,
      name: event.name,
      division: event.division,
      deskOfficer: event.deskOfficer,
      description: event.description,
      location: event.location,
      eventDate: event.eventDate,
      date: formatDateYYYYMMDD(event.eventDate),
      startDate: event.startDate,
      endDate: event.endDate,
      datesText: event.datesText,
      region: event.region,
      country: event.country,
      city: event.city,
      sectorProducts: event.sectorProducts,
      subsidyPercentage: event.subsidyPercentage ? Number(event.subsidyPercentage) : null,
      tdapCost: event.tdapCost ? Number(event.tdapCost) : null,
      exhibitorCost: event.exhibitorCost ? Number(event.exhibitorCost) : null,
      totalEstimatedBudget: event.totalEstimatedBudget ? Number(event.totalEstimatedBudget) : null,
      recommendedByJustification: event.recommendedByJustification,
      sectorIds,
      feedbackFormUrl: event.feedbackFormUrl,
      finalRemarks: event.finalRemarks,
    });
  } catch (error) {
    console.error('Error updating event:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = Number(searchParams.get('id'));

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Valid event id is required' },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ ok: true, deletedId: eventId });
  } catch (error) {
    console.error('Error deleting event:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
