'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EventCard from '../../components/EventCard';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper px-4">
      <main className="container mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Events &amp; Exhibitions
            </h1>
            <p className="text-secondary">
              Trade fairs, exhibitions and conferences featuring Pakistani food companies
            </p>
          </div>
          <button
            onClick={() => router.push('/events/create')}
            className="btn-primary px-6 py-2 whitespace-nowrap"
          >
            + Create Event
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner"></div>
            <p className="mt-4 text-secondary">Loading events…</p>
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-secondary text-lg">No events available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-secondary">
                Showing <span className="font-semibold text-white">{events.length}</span> events
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
