'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CompanyCard from '../../../components/CompanyCard';

export default function EventParticipantsList({ eventId, participants, feedbackCompanyIds = [] }) {
    const feedbackDone = new Set(feedbackCompanyIds);
    const router = useRouter();
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState(null);

    const handleRemove = async (companyId, companyName) => {
        if (!confirm(`Remove "${companyName}" from this event?`)) return;

        setRemovingId(companyId);
        setError(null);
        try {
            const res = await fetch('/api/events/participants', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, companyId }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to remove participant');
                return;
            }
            router.refresh();
        } catch (err) {
            console.error('Error removing participant:', err);
            setError('Failed to remove participant');
        } finally {
            setRemovingId(null);
        }
    };

    if (participants.length === 0) {
        return <p className="text-gray-600">No companies registered yet.</p>;
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                </div>
            )}
            {participants.map((company) => {
                const hasFeedback = feedbackDone.has(company.id);
                return (
                    <div key={company.id} className="relative group">
                        <CompanyCard company={company} />

                        {/* Action buttons — visible on hover */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                            {/* Add / View Feedback */}
                            {hasFeedback ? (
                                <span
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-200 text-gray-500 rounded-md cursor-not-allowed shadow-sm"
                                    title="Feedback already submitted"
                                >
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Feedback Added
                                </span>
                            ) : (
                                <Link
                                    href={`/feedback/company?eventId=${eventId}&companyId=${company.id}`}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-700 text-white rounded-md hover:bg-green-800 shadow-sm"
                                    title="Add feedback for this company"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                    </svg>
                                    Add Feedback
                                </Link>
                            )}

                            {/* Remove */}
                            <button
                                type="button"
                                onClick={() => handleRemove(company.id, company.name)}
                                disabled={removingId === company.id}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 shadow-sm"
                                title="Remove from event"
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
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
