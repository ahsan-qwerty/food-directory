import { NextResponse } from 'next/server';

// Routes that are publicly accessible (temporary protection)
const PUBLIC_PATHS = [
  '/companies',  // company directory listing
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals, static files, and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow /companies and /companies/[id] (any sub-path under /companies)
  if (pathname === '/companies' || pathname.startsWith('/companies/')) {
    return NextResponse.next();
  }

  // Allow /register
  if (pathname === '/register' || pathname.startsWith('/register/')) {
    return NextResponse.next();
  }

  // Everything else → redirect to /companies (temporary protection)
  const companiesUrl = new URL('/companies', request.url);
  return NextResponse.redirect(companiesUrl);
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
