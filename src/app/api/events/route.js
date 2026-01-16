import { NextResponse } from 'next/server';
import { events, getEventById, getEventBySlug, getAllEvents } from '@/data/events';
import { getCompanyById } from '@/data/companies';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get single event by ID
  const id = searchParams.get('id');
  if (id) {
    const event = getEventById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Include participating companies data
    const participants = event.participatingCompanyIds.map(companyId => 
      getCompanyById(companyId)
    ).filter(Boolean);
    
    return NextResponse.json({
      ...event,
      participants
    });
  }
  
  // Get event by slug
  const slug = searchParams.get('slug');
  if (slug) {
    const event = getEventBySlug(slug);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Include participating companies data
    const participants = event.participatingCompanyIds.map(companyId => 
      getCompanyById(companyId)
    ).filter(Boolean);
    
    return NextResponse.json({
      ...event,
      participants
    });
  }
  
  // Get all events
  const allEvents = getAllEvents();
  return NextResponse.json({
    events: allEvents,
    total: allEvents.length
  });
}
