import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function EventNotFound() {
  return (
    <div className=" bg-gray-50">
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Event Not Found
            </h2>
            <p className="text-gray-600 text-lg">
              The event you're looking for doesn't exist or has been removed.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/events"
              className="px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors"
            >
              View All Events
            </Link>
            <Link 
              href="/"
              className="px-6 py-3 bg-white text-green-700 border-2 border-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
