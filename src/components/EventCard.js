import Link from 'next/link';

export default function EventCard({ event }) {
  return (
    <Link href={`/events/${event.id}`} className="block h-full">
      <div className="glass-card overflow-hidden h-full flex flex-col cursor-pointer">

        {/* Card header — green→blue gradient tint */}
        <div
          className="p-5 text-white"
          style={{
            background:
              'linear-gradient(135deg, rgba(22,163,74,0.55) 0%, rgba(37,99,235,0.45) 100%)',
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold leading-snug flex-1 pr-2">
              {event.name}
            </h3>
            {event.country && (
              <span className="text-xs text-white/70 whitespace-nowrap">{event.country}</span>
            )}
          </div>

          <div className="flex items-center text-white/75 text-xs mb-1">
            <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {event.datesText || event.date || '—'}
          </div>

          <div className="flex items-center text-white/75 text-xs mb-1">
            <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {event.city ? event.city : (event.country || '—')}
          </div>

          {event.deskOfficer && (
            <div className="flex items-center text-white/75 text-xs">
              <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {event.deskOfficer}
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-1">
          {(event.sectorProducts || event.description) && (
            <p className="text-secondary text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
              {event.sectorProducts || event.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t glass-divider">
            <div className="text-xs text-secondary">
              <span className="font-semibold text-white">
                {event.participatingCompanyIds?.length ?? 0}
              </span>{' '}
              Companies
            </div>
            <div className="text-accent-green font-medium text-sm flex items-center gap-1">
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
