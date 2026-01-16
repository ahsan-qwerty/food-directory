import Link from 'next/link';

export default function EventCard({ event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <h3 className="text-xl font-bold mb-2">
            {event.name}
          </h3>
          <div className="flex items-center text-green-100 text-sm mb-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {event.date}
          </div>
          <div className="flex items-center text-green-100 text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {event.location}
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {event.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">{event.participatingCompanyIds.length}</span> Companies Participating
            </div>
            <div className="text-green-600 font-medium text-sm">
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
