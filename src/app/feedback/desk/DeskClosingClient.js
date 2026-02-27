'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function formatCurrencyPKR(value) {
    if (value == null) return null;
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    return `PKR ${num.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
}

export default function DeskClosingClient() {
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get('eventId');
    const eventId = eventIdParam ? Number(eventIdParam) : null;

    // Event info fetched on mount
    const [event, setEvent] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [loadError, setLoadError] = useState(null);

    // Form state
    const [finalRemarks, setFinalRemarks] = useState('');
    const [utilizedBudget, setUtilizedBudget] = useState('');
    const [budgetError, setBudgetError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!eventId || Number.isNaN(eventId)) {
            setLoadingEvent(false);
            return;
        }
        fetch(`/api/events?id=${eventId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) { setLoadError(data.error); return; }
                setEvent(data);
                // Pre-fill if already closed
                if (data.finalRemarks) setFinalRemarks(data.finalRemarks);
                if (data.utilizedBudget != null) setUtilizedBudget(String(data.utilizedBudget));
            })
            .catch(() => setLoadError('Failed to load event details.'))
            .finally(() => setLoadingEvent(false));
    }, [eventId]);

    const allocatedBudget = event?.totalEstimatedBudget != null ? Number(event.totalEstimatedBudget) : null;

    const handleBudgetChange = (e) => {
        const val = e.target.value;
        setUtilizedBudget(val);
        if (allocatedBudget != null && val !== '' && Number(val) > allocatedBudget) {
            setBudgetError(`Cannot exceed allocated budget (${formatCurrencyPKR(allocatedBudget)})`);
        } else {
            setBudgetError(null);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!eventId) { setError('Invalid event.'); return; }
        if (budgetError) return; // block if over budget

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/api/events/final-remarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, finalRemarks, utilizedBudget }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to save remarks.');
                return;
            }
            setSubmitted(true);
        } catch (err) {
            console.error('Error saving final remarks:', err);
            setError('Failed to save remarks.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingEvent) {
        return (
            <div className="page-wrapper flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner" />
            </div>
        );
    }

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-xl">
                <h1 className="text-2xl font-bold text-primary mb-1">
                    Desk Officer Closing Form
                </h1>

                {/* Event info banner */}
                {event ? (
                    <div className="glass-card px-4 py-3 mb-6 flex flex-col gap-0.5">
                        <p className="text-white font-semibold text-sm">{event.name}</p>
                        <p className="text-secondary text-xs">Event ID: {eventId}</p>
                        {allocatedBudget != null && (
                            <p className="text-xs mt-1">
                                <span className="text-muted">Allocated Budget: </span>
                                <span className="font-semibold text-accent-green">{formatCurrencyPKR(allocatedBudget)}</span>
                            </p>
                        )}
                        {event.status === 'COMPLETED' && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Already closed
                            </span>
                        )}
                    </div>
                ) : (
                    loadError ? (
                        <div className="alert-error px-3 py-2 text-sm mb-4">{loadError}</div>
                    ) : (
                        <p className="text-sm text-secondary mb-4">Event ID: {eventId}</p>
                    )
                )}

                {submitted ? (
                    <div className="glass-card px-5 py-6 text-center space-y-2">
                        <svg className="w-10 h-10 text-accent-green mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-white font-semibold">Event closed successfully.</p>
                        <p className="text-secondary text-sm">Final remarks and budget have been saved. The event is now marked as Completed.</p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-5 glass-card p-6">
                        {error && (
                            <div className="alert-error px-3 py-2 text-sm">{error}</div>
                        )}

                        {/* Budget Utilized */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Budget Utilized <span className="text-muted font-normal">(Rs.)</span>
                                {allocatedBudget != null && (
                                    <span className="ml-2 text-xs text-muted font-normal">
                                        — max {formatCurrencyPKR(allocatedBudget)}
                                    </span>
                                )}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                max={allocatedBudget ?? undefined}
                                value={utilizedBudget}
                                onChange={handleBudgetChange}
                                placeholder="e.g. 250000"
                                className={`glass-input w-full px-3 py-2 text-sm ${budgetError ? 'border-red-500/60' : ''}`}
                            />
                            {budgetError && (
                                <p className="text-red-400 text-xs mt-1">{budgetError}</p>
                            )}
                        </div>

                        {/* Final Remarks */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Final Remarks
                            </label>
                            <textarea
                                rows={6}
                                value={finalRemarks}
                                onChange={(e) => setFinalRemarks(e.target.value)}
                                placeholder="Summarise the outcomes, observations, or any follow-up actions…"
                                className="glass-input w-full px-3 py-2 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !!budgetError}
                            className="btn-primary w-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                            {submitting ? 'Saving…' : 'Close Event & Save Remarks'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
