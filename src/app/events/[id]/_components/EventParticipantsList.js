'use client';

import Link from 'next/link';
import ParticipantsList from '../../../../components/ParticipantsList';

export default function EventParticipantsList({ eventId, participants, feedbackCompanyIds = [] }) {
    const feedbackDone = new Set(feedbackCompanyIds);

    const handleRemove = async (companyId, companyName) => {
        const res = await fetch('/api/events/participants', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, companyId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to remove participant');
    };

    const renderActions = (company) => {
        const hasFeedback = feedbackDone.has(company.id);
        return hasFeedback ? (
            <span
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium badge-green rounded-md cursor-not-allowed"
                title="Feedback already submitted"
            >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Feedback Added
            </span>
        ) : (
            <Link
                href={`/feedback/company?eventId=${eventId}&companyId=${company.id}`}
                className="btn-primary flex items-center gap-1 px-2.5 py-1 text-xs"
                title="Add feedback for this company"
            >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
                Add Feedback
            </Link>
        );
    };

    return (
        <ParticipantsList
            participants={participants}
            onRemove={handleRemove}
            renderActions={renderActions}
        />
    );
}
