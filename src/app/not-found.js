import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-green-700">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
              Page Not Found
            </h2>
            <p className="text-gray-600 text-lg">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/companies"
              className="px-6 py-3 bg-white text-green-700 border-2 border-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Browse Companies
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
