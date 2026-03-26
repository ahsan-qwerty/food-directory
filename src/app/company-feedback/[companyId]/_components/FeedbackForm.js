'use client';

import { useState } from 'react';

function todayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function fmtDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
}

export default function FeedbackForm({ companyId, companyName }) {
    const today = todayString();
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) { setError('Please write your feedback before submitting.'); return; }
        setError('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/public/company-feedback/${companyId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), date: today }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Failed to submit. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 mb-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-1">Feedback Submitted!</h2>
                <p className="text-sm text-secondary">
                    Your activity report for <span className="text-amber-300 font-medium">{fmtDate(today)}</span> has been recorded.
                </p>
                <p className="text-xs text-muted mt-3">Thank you, {companyName}.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date display */}
            <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm font-medium text-amber-300">{fmtDate(today)}</p>
            </div>

            {/* Feedback textarea */}
            <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Today's Activity / What Happened
                </label>
                <textarea
                    rows={6}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={`Describe today's activities, meetings, discussions, or outcomes related to ${companyName}…`}
                    required
                    className="glass-input w-full px-3 py-2.5 text-sm leading-relaxed"
                />
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 disabled:opacity-50 transition-colors"
            >
                {submitting ? 'Submitting…' : 'Submit Daily Report'}
            </button>
        </form>
    );
}
