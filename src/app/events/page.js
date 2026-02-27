'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EventCard from '../../components/EventCard';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fiscal year = starting year (Jul–Jun cycle).
  // e.g. any date in Jul 2025 – Jun 2026  →  FY 2025
  const getFiscalYear = (dateVal) => {
    const d = new Date(dateVal);
    return d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  };
  const fyLabel = (fy) => `${fy}-${fy + 1}`; // "FY 2025-26"

  // Derive sorted unique fiscal years from events
  const years = useMemo(() => {
    const set = new Set();
    events.forEach(e => {
      if (e.eventDate) set.add(getFiscalYear(e.eventDate));
    });
    return Array.from(set).sort((a, b) => b - a); // descending
  }, [events]);

  // Filtered list
  const filtered = useMemo(() => {
    if (selectedYear === 'all') return events;
    return events.filter(e =>
      e.eventDate && getFiscalYear(e.eventDate) === Number(selectedYear)
    );
  }, [events, selectedYear]);

  return (
    <div className="page-wrapper px-4">
      <main className="container mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* Year filter bar */}
        {!loading && years.length > 0 && (
          <div className="glass-card px-4 py-3 mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide mr-1">Year</span>

            {/* All */}
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedYear === 'all'
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white/10 text-secondary border-white/20 hover:border-green-500 hover:text-white'
                }`}
            >
              All
              <span className={`ml-1.5 text-xs ${selectedYear === 'all' ? 'text-green-200' : 'text-muted'}`}>
                {events.length}
              </span>
            </button>

            {years.map(yr => {
              const count = events.filter(e =>
                e.eventDate && getFiscalYear(e.eventDate) === yr
              ).length;
              const active = selectedYear === String(yr);
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(String(yr))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${active
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white/10 text-secondary border-white/20 hover:border-green-500 hover:text-white'
                    }`}
                >
                  {fyLabel(yr)}
                  <span className={`ml-1.5 text-xs ${active ? 'text-green-200' : 'text-muted'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner"></div>
            <p className="mt-4 text-secondary">Loading events…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-secondary text-lg">
              {events.length === 0
                ? 'No events available at the moment.'
                : `No events found for ${fyLabel(Number(selectedYear))}.`}
            </p>
            {events.length > 0 && selectedYear !== 'all' && (
              <button
                onClick={() => setSelectedYear('all')}
                className="mt-4 btn-outline px-5 py-2 text-sm"
              >
                Show all events
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-secondary">
                Showing{' '}
                <span className="font-semibold text-white">{filtered.length}</span>
                {selectedYear !== 'all' && (
                  <> events in <span className="font-semibold text-white">{fyLabel(Number(selectedYear))}</span></>
                )}
                {selectedYear === 'all' && <> events</>}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
