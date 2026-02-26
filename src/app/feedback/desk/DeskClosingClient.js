'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DeskClosingClient() {
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get('eventId');
    const eventId = eventIdParam ? Number(eventIdParam) : null;

    const [finalRemarks, setFinalRemarks] = useState('');
    const [utilizedBudget, setUtilizedBudget] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!eventId) {
            setError('Invalid event.');
            return;
        }
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

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-xl">
                <h1 className="text-2xl font-bold text-primary mb-4">
                    Desk Officer Closing Remarks
                </h1>
                {eventId && (
                    <p className="text-sm text-secondary mb-4">
                        For event ID: <span className="font-mono text-accent-green">{eventId}</span>
                    </p>
                )}

                {submitted ? (
                    <div className="alert-success px-4 py-4 text-sm font-medium">
                        Final remarks saved successfully.
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4 glass-card p-6">
                        {error && (
                            <div className="alert-error px-3 py-2 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Budget Utilized <span className="text-muted font-normal">(Rs.)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={utilizedBudget}
                                onChange={(e) => setUtilizedBudget(e.target.value)}
                                placeholder="e.g. 250000"
                                className="glass-input w-full px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Final Remarks
                            </label>
                            <textarea
                                rows={6}
                                value={finalRemarks}
                                onChange={(e) => setFinalRemarks(e.target.value)}
                                className="glass-input w-full px-3 py-2 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                            {submitting ? 'Saving...' : 'Save Remarks'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
