import Link from 'next/link';

export default function Header() {
  return (
    <header className="glass-header sticky top-0 z-50 px-4">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="btn-primary p-2 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                Agro Food Division
              </h1>
              <p className="text-xs text-muted">Trade Development Authority of Pakistan</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-1 md:gap-2 items-center">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Home
            </Link>
            <Link
              href="/companies"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Companies
            </Link>
            <Link
              href="/events"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Exhibitions
            </Link>
            <Link
              href="/delegations?tab=incoming"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Incoming
            </Link>
            <Link
              href="/delegations?tab=outgoing"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Outgoing
            </Link>
            <Link
              href="/register"
              className="btn-primary px-4 py-2 text-sm ml-2"
            >
              Register Company
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
