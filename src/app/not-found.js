import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">

          <div className="glass-card p-12 md:p-16">
            <h1 className="text-9xl font-bold text-accent-green mb-2 leading-none">404</h1>
            <h2 className="text-3xl font-bold text-white mt-4 mb-3">Page Not Found</h2>
            <p className="text-secondary text-lg mb-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="btn-primary px-6 py-3 inline-block">
                Go Home
              </Link>
              <Link href="/companies" className="btn-outline px-6 py-3 inline-block">
                Browse Companies
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
