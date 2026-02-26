'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanyCard from './CompanyCard';

/**
 * Generic participants list with search + optional remove + optional extra actions.
 *
 * Props:
 *  participants      – array of company objects
 *  onRemove          – optional async (companyId, companyName) => void
 *                      If omitted the Remove button is hidden entirely.
 *  renderActions     – optional (company) => ReactNode
 *                      Renders additional action buttons before the Remove button
 *                      (used by events to show the feedback button).
 */
export default function ParticipantsList({ participants = [], onRemove, renderActions }) {
    const router = useRouter();
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    if (participants.length === 0) {
        return <p className="text-secondary">No companies registered yet.</p>;
    }

    const handleRemove = async (companyId, companyName) => {
        if (!onRemove) return;
        if (!confirm(`Remove "${companyName}" from this record?`)) return;
        setRemovingId(companyId);
        setError(null);
        try {
            await onRemove(companyId, companyName);
            router.refresh();
        } catch (err) {
            setError(err.message || 'Failed to remove participant');
        } finally {
            setRemovingId(null);
        }
    };

    const query = search.trim().toLowerCase();
    const filtered = query
        ? participants.filter(c =>
            (c.name || '').toLowerCase().includes(query) ||
            (c.representativeName || '').toLowerCase().includes(query) ||
            (c.email || '').toLowerCase().includes(query) ||
            (c.productsToBeDisplayed || '').toLowerCase().includes(query)
        )
        : participants;

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                </svg>
                <input
                    type="text"
                    placeholder={`Search ${participants.length} companies…`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="glass-input w-full pl-9 pr-9 py-2 text-sm"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                        aria-label="Clear search"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Result count when filtering */}
            {query && (
                <p className="text-xs text-secondary">
                    {filtered.length === 0
                        ? 'No companies match your search.'
                        : `Showing ${filtered.length} of ${participants.length} companies`}
                </p>
            )}

            {error && (
                <div className="alert-error px-3 py-2 text-sm">{error}</div>
            )}

            {filtered.map(company => (
                <div key={company.id} className="relative group">
                    <CompanyCard company={company} />

                    {/* Action buttons — visible on hover */}
                    {(renderActions || onRemove) && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                            {renderActions && renderActions(company)}

                            {onRemove && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(company.id, company.name)}
                                    disabled={removingId === company.id}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 shadow-sm"
                                    title="Remove from this record"
                                >
                                    {removingId === company.id ? (
                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    Remove
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
