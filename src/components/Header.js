import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-green-700 text-white shadow-md px-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <Link href="/" className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-green-700 p-2 rounded-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Agro Food Division</h1>
                <p className="text-xs text-green-100">Trade Development Authority of Pakistan</p>
              </div>
            </div>
          </Link>

          <nav className="flex flex-wrap gap-2 md:gap-6 items-center">
            <Link
              href="/"
              className="text-white hover:text-green-100 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/companies"
              className="text-white hover:text-green-100 transition-colors font-medium"
            >
              Companies
            </Link>
            <Link
              href="/events"
              className="text-white hover:text-green-100 transition-colors font-medium"
            >
              International Exhibitions
            </Link>
            <Link
              href="/delegations"
              className="text-white hover:text-green-100 transition-colors font-medium"
            >
              Delegations
            </Link>
            <Link
              href="/register"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition-colors font-medium"
            >
              Register Company
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
