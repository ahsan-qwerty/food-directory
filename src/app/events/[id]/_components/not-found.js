import Link from 'next/link';

export default function EventNotFound() {
  return (
    <div className="page-wrapper">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card p-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
              <svg className="w-10 h-10" style={{ color: '#fca5a5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Event Not Found</h2>
            <p className="text-secondary text-lg mb-8">
              The event you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/events" className="btn-primary px-6 py-3 inline-block">View All Events</Link>
              <Link href="/" className="btn-outline px-6 py-3 inline-block">Go Home</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
