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
        description: true,
        location: true,
        eventDate: true,
        feedbackFormUrl: true,
        finalRemarks: true,
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
      description: event.description,
      location: event.location,
      eventDate: event.eventDate,
      date: formatDateYYYYMMDD(event.eventDate),
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
      description: true,
      location: true,
      eventDate: true,
      participants: { select: { companyId: true } },
    },
    orderBy: { eventDate: 'desc' },
  });

  const events = allEvents.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    location: e.location,
    eventDate: e.eventDate,
    date: formatDateYYYYMMDD(e.eventDate),
    participatingCompanyIds: e.participants.map((p) => p.companyId),
  }));

  return NextResponse.json({
    events,
    total: events.length
  });
}
