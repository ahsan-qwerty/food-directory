import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CompanyCard from '@/components/CompanyCard';
import { getEventById } from '@/data/events';
import { getCompanyById } from '@/data/companies';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = getEventById(id);
  console.log("Event: ", event);
  
  if (!event) {
    return {
      title: 'Event Not Found'
    };
  }

  return {
    title: `${event.name} - TDAP Food Directory`,
    description: event.description.substring(0, 160),
  };
}

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const event = getEventById(id);
  console.log("Event: ", event);

  if (!event) {
    notFound();
  }

  // Get participating companies
  const participants = event.participatingCompanyIds
    .map(id => getCompanyById(id))
    .filter(Boolean);

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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {event.name}
          </h1>
          
          <div className="flex flex-wrap gap-6 text-green-100">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{event.date}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{event.location}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="font-medium">{participants.length} Companies Participating</span>
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
                {event.description}
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
              
              {participants.length === 0 ? (
                <p className="text-gray-600">No companies registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {participants.map(company => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              )}
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
                  <p className="text-gray-600">{event.date}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Participants</h3>
                  <p className="text-gray-600">{participants.length} Companies</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
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
            </div>

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
