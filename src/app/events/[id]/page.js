import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prismaClient';
import EventAdminPanel from './EventAdminPanel';
import EventParticipantsList from './EventParticipantsList';

function formatDateYYYYMMDD(dateValue) {
  try {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toISOString().slice(0, 10);
  } catch {
    return '—';
  }
}

function formatDateRange(startDate, endDate, fallback) {
  if (!startDate && !endDate) {
    return fallback || '—';
  }
  const start = startDate ? formatDateYYYYMMDD(startDate) : null;
  const end = endDate ? formatDateYYYYMMDD(endDate) : null;
  if (start && end && start !== end) return `${start} to ${end}`;
  return start || end || fallback || '—';
}

function formatCurrencyPKR(value) {
  if (value == null) return '—';
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '—';
  return `PKR ${num.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return { title: 'Event Not Found' };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true, description: true },
  });

  if (!event) {
    return {
      title: 'Event Not Found'
    };
  }

  return {
    title: `${event.name} - TDAP Food Directory`,
    description: (event.description || '').substring(0, 160),
  };
}

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    notFound();
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      eventDate: true,
      division: true,
      deskOfficer: true,
      region: true,
      country: true,
      city: true,
      sectorProducts: true,
      startDate: true,
      endDate: true,
      datesText: true,
      tdapCost: true,
      exhibitorCost: true,
      totalEstimatedBudget: true,
      recommendedByJustification: true,
      participants: {
        select: {
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
    notFound();
  }

  const participants = (event.participants || [])
    .map((p) => p.company)
    .filter(Boolean);

  // Collect companyIds that already have feedback for this event
  const existingFeedbacks = await prisma.eventFeedback.findMany({
    where: { eventId },
    select: { companyId: true },
  });
  const feedbackCompanyIds = new Set(
    existingFeedbacks.map((f) => f.companyId).filter(Boolean)
  );

  const dateLabel = event.datesText || formatDateRange(event.startDate, event.endDate, event.eventDate);
  const locationLabel =
    event.city && event.country
      ? `${event.city}, ${event.country}`
      : event.country || event.location || '—';

  return (
    <div className="min-h-screen bg-gray-50 px-4">

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-green-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/events" className="hover:text-green-700">Events</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{event.name}</span>
          </nav>
        </div>

        {/* Event Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-8 md:p-12 mb-8 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-2">
              {event.division && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-400 bg-opacity-15 rounded-full">
                  {event.division}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold">
                {event.name}
              </h1>
            </div>

            <div className="text-right text-sm text-green-100 space-y-1">
              {event.region && (
                <div className="font-medium">{event.region}</div>
              )}
              {event.country && (
                <div>{locationLabel}</div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-green-100">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{dateLabel}</span>
            </div>

            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{locationLabel}</span>
            </div>

            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="font-medium">{participants.length} Companies Participating</span>
            </div>

            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{event.deskOfficer}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description || '—'}
              </p>
            </div>

            {/* Event Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Highlights</h2>
                <ul className="space-y-3">
                  {event.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Participating Companies */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Participating Companies</h2>
              <EventParticipantsList eventId={event.id} participants={participants} feedbackCompanyIds={[...feedbackCompanyIds]} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Information</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Date</h3>
                  <p className="text-gray-600">{dateLabel}</p>
                </div>

                {event.division && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Division</h3>
                    <p className="text-gray-600">{event.division}</p>
                  </div>
                )}

                {event.deskOfficer && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Desk Officer</h3>
                    <p className="text-gray-600">{event.deskOfficer}</p>
                  </div>
                )}

                {event.region && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Region</h3>
                    <p className="text-gray-600">{event.region}</p>
                  </div>
                )}

                {(event.country || event.city) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Country / City</h3>
                    <p className="text-gray-600">{event.country} / {event.city}</p>
                  </div>
                )}

                {event.sectorProducts && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Sector / Products</h3>
                    <p className="text-gray-600">{event.sectorProducts}</p>
                  </div>
                )}

                {(
                  event.tdapCost != null ||
                  event.exhibitorCost != null ||
                  event.totalEstimatedBudget != null) && (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Budget (Rs.)</h3>
                      <dl className="space-y-1 text-sm text-gray-600">
                        {event.tdapCost != null && (
                          <div className="flex justify-between">
                            <dt>TDAP Cost</dt>
                            <dd className="font-medium">{formatCurrencyPKR(event.tdapCost)}</dd>
                          </div>
                        )}
                        {event.exhibitorCost != null && (
                          <div className="flex justify-between">
                            <dt>Participation Fee</dt>
                            <dd className="font-medium">{formatCurrencyPKR(event.exhibitorCost)}</dd>
                          </div>
                        )}
                        {event.totalEstimatedBudget != null && (
                          <div className="flex justify-between">
                            <dt>Total Estimated Budget</dt>
                            <dd className="font-semibold text-gray-900">{formatCurrencyPKR(event.totalEstimatedBudget)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                {event.recommendedByJustification && (
                  <div className="pt-2 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Recommended by / Justification</h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {event.recommendedByJustification}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin tools for desk officer */}
            <EventAdminPanel
              eventId={event.id}
              eventName={event.name}
              participantCompanyIds={participants.map((c) => c.id)}
              participantEmails={participants.map((c) => c.email).filter(Boolean)}
            />

            {/* Edit Event */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Manage Event
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Event Details
                </Link>
                <Link
                  href={`/events/${event.id}/feedback`}
                  className="inline-flex items-center px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800 transition-colors"
                >
                  View All Feedback
                </Link>
                {participants.length > 0 && (
                  <a
                    href={`/api/events/${event.id}/company-directory`}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Download Company Directory
                  </a>
                )}
              </div>
            </div>

            {/* Call to Action */}
            {/* <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                Interested in Exhibiting?
              </h3>
              <p className="text-sm text-green-800 mb-4">
                Contact TDAP to register your company for upcoming events and exhibitions.
              </p>
              <div className="space-y-2 text-sm text-green-900">
                <p><strong>Email:</strong> info@tdap.gov.pk</p>
                <p><strong>Website:</strong> www.tdap.gov.pk</p>
              </div>
            </div> */}

            {/* Browse More Events */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                More Events
              </h3>
              <Link
                href="/events"
                className="inline-block px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
              >
                View All Events
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
