import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prismaClient';
import EventAdminPanel from './_components/EventAdminPanel';
import EventParticipantsList from './_components/EventParticipantsList';

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
  if (!startDate && !endDate) return fallback || '—';
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
  if (Number.isNaN(eventId)) return { title: 'Event Not Found' };

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true, description: true },
  });
  if (!event) return { title: 'Event Not Found' };

  return {
    title: `${event.name} - TDAP Food Directory`,
    description: (event.description || '').substring(0, 160),
  };
}

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) notFound();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true, name: true, description: true, location: true,
      eventDate: true, division: true, deskOfficer: true,
      region: true, country: true, city: true, sectorProducts: true,
      startDate: true, endDate: true, datesText: true,
      tdapCost: true, exhibitorCost: true, totalEstimatedBudget: true,
      recommendedByJustification: true,
      participants: {
        select: {
          company: {
            select: {
              id: true, name: true, profile: true, address: true,
              email: true, website: true, representativeName: true,
              productsToBeDisplayed: true,
            },
          },
        },
      },
    },
  });
  if (!event) notFound();

  const participants = (event.participants || []).map(p => p.company).filter(Boolean);

  const existingFeedbacks = await prisma.eventFeedback.findMany({
    where: { eventId },
    select: { companyId: true },
  });
  const feedbackCompanyIds = new Set(existingFeedbacks.map(f => f.companyId).filter(Boolean));

  const dateLabel = event.datesText || formatDateRange(event.startDate, event.endDate, event.eventDate);
  const locationLabel =
    event.city && event.country
      ? `${event.city}, ${event.country}`
      : event.country || event.location || '—';

  return (
    <div className="page-wrapper px-4">
      <main className="container mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex text-sm text-secondary mb-6 flex-wrap gap-1">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="mx-2 text-muted">/</span>
          <Link href="/events" className="breadcrumb-link">Events</Link>
          <span className="mx-2 text-muted">/</span>
          <span className="text-white">{event.name}</span>
        </nav>

        {/* Event Header */}
        <div className="glass-hero p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-3">
            <div>
              {event.division && (
                <span className="badge-green mb-3 inline-block">
                  {event.division}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
                {event.name}
              </h1>
            </div>
            <div className="text-right text-sm text-secondary space-y-1 shrink-0">
              {event.region && <div className="font-medium text-white">{event.region}</div>}
              {event.country && <div>{locationLabel}</div>}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-secondary">
            {[
              {
                icon: <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />,
                label: dateLabel,
              },
              {
                icon: <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />,
                label: locationLabel,
              },
              {
                icon: <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />,
                label: `${participants.length} Companies Participating`,
              },
              {
                icon: <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />,
                label: event.deskOfficer,
              },
            ].filter(item => item.label).map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-green shrink-0" fill="currentColor" viewBox="0 0 20 20">{icon}</svg>
                <span className="font-medium text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-secondary leading-relaxed whitespace-pre-line">
                {event.description || '—'}
              </p>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Participating Companies</h2>
              <EventParticipantsList
                eventId={event.id}
                participants={participants}
                feedbackCompanyIds={[...feedbackCompanyIds]}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick Info */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Information</h2>
              <div className="space-y-4">
                <InfoRow label="Date" value={dateLabel} />
                {event.division && <InfoRow label="Division" value={event.division} />}
                {event.deskOfficer && <InfoRow label="Desk Officer" value={event.deskOfficer} />}
                {event.region && <InfoRow label="Region" value={event.region} />}
                {(event.country || event.city) && (
                  <InfoRow label="Country / City" value={`${event.country ?? '—'} / ${event.city ?? '—'}`} />
                )}
                {event.sectorProducts && (
                  <InfoRow label="Sector / Products" value={event.sectorProducts} />
                )}

                {(event.tdapCost != null || event.exhibitorCost != null || event.totalEstimatedBudget != null) && (
                  <div className="pt-3 border-t glass-divider space-y-2">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Budget (Rs.)</h3>
                    <dl className="space-y-1 text-sm">
                      {event.tdapCost != null && (
                        <div className="flex justify-between">
                          <dt className="text-secondary">TDAP Cost</dt>
                          <dd className="font-medium text-white">{formatCurrencyPKR(event.tdapCost)}</dd>
                        </div>
                      )}
                      {event.exhibitorCost != null && (
                        <div className="flex justify-between">
                          <dt className="text-secondary">Participation Fee</dt>
                          <dd className="font-medium text-white">{formatCurrencyPKR(event.exhibitorCost)}</dd>
                        </div>
                      )}
                      {event.totalEstimatedBudget != null && (
                        <div className="flex justify-between">
                          <dt className="text-secondary">Total Estimated</dt>
                          <dd className="font-semibold text-accent-green">{formatCurrencyPKR(event.totalEstimatedBudget)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {event.recommendedByJustification && (
                  <div className="pt-3 border-t glass-divider">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Recommended by / Justification</h3>
                    <p className="text-secondary text-sm whitespace-pre-line leading-relaxed">
                      {event.recommendedByJustification}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Panel */}
            <EventAdminPanel
              eventId={event.id}
              eventName={event.name}
              participantCompanyIds={participants.map(c => c.id)}
              participantEmails={participants.map(c => c.email).filter(Boolean)}
            />

            {/* Manage Event */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Manage Event</h3>
              <div className="flex flex-col gap-3">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="btn-outline px-4 py-2 text-sm text-center"
                >
                  Edit Event Details
                </Link>
                <Link
                  href={`/events/${event.id}/feedback`}
                  className="btn-primary px-4 py-2 text-sm text-center"
                >
                  View All Feedback
                </Link>
                {participants.length > 0 && (
                  <a
                    href={`/api/events/${event.id}/company-directory`}
                    download
                    className="btn-outline px-4 py-2 text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Download Company Directory
                  </a>
                )}
              </div>
            </div>

            {/* Browse More */}
            <div className="glass-card p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-4">More Events</h3>
              <Link href="/events" className="btn-primary px-6 py-2 inline-block">
                View All Events
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{label}</h3>
      <p className="text-secondary">{value}</p>
    </div>
  );
}
