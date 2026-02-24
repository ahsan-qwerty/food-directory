'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MissionFeedbackClient() {
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get('eventId');
    const eventId = eventIdParam ? Number(eventIdParam) : null;

    const [form, setForm] = useState({
        sourceName: '',
        sourceEmail: '',
        rating: '',
        comments: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!eventId) {
            setError('Invalid event.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/api/event-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    sourceType: 'MISSION',
                    sourceName: form.sourceName,
                    sourceEmail: form.sourceEmail,
                    rating: form.rating ? Number(form.rating) : null,
                    comments: form.comments,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to submit feedback.');
                return;
            }
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError('Failed to submit feedback.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-xl">
                <h1 className="text-2xl font-bold text-primary mb-4">
                    Mission Feedback Form
                </h1>
                {eventId && (
                    <p className="text-sm text-secondary mb-4">
                        For event ID: <span className="font-mono text-accent-green">{eventId}</span>
                    </p>
                )}

                {submitted ? (
                    <div className="alert-success px-4 py-4 text-sm font-medium">
                        Thank you for your feedback.
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
                                Your Name
                            </label>
                            <input
                                type="text"
                                name="sourceName"
                                value={form.sourceName}
                                onChange={onChange}
                                className="glass-input w-full px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Your Email
                            </label>
                            <input
                                type="email"
                                name="sourceEmail"
                                value={form.sourceEmail}
                                onChange={onChange}
                                className="glass-input w-full px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Rating (1–5)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                name="rating"
                                value={form.rating}
                                onChange={onChange}
                                className="glass-input w-full px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Comments
                            </label>
                            <textarea
                                name="comments"
                                rows={4}
                                value={form.comments}
                                onChange={onChange}
                                className="glass-input w-full px-3 py-2 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
