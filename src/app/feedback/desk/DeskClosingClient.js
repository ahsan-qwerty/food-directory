'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DeskClosingClient() {
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get('eventId');
    const eventId = eventIdParam ? Number(eventIdParam) : null;

    const [finalRemarks, setFinalRemarks] = useState('');
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
                body: JSON.stringify({ eventId, finalRemarks }),
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
        <div className="min-h-screen bg-gray-50 px-4">
            <main className="container mx-auto px-4 py-8 max-w-xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Desk Officer Closing Remarks
                </h1>
                {eventId && (
                    <p className="text-sm text-gray-600 mb-4">
                        For event ID: <span className="font-mono">{eventId}</span>
                    </p>
                )}

                {submitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
                        Final remarks saved successfully.
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-lg shadow-md p-6">
                        {error && (
                            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Final Remarks
                            </label>
                            <textarea
                                rows={6}
                                value={finalRemarks}
                                onChange={(e) => setFinalRemarks(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full px-4 py-2 bg-green-700 text-white rounded-md text-sm font-medium hover:bg-green-800 disabled:opacity-60"
                        >
                            {submitting ? 'Saving...' : 'Save Remarks'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}

