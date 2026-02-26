'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanyPickerModal from '../../../../components/CompanyPickerModal';

export default function EventAdminPanel({
    eventId,
    eventName,
    participantCompanyIds,
    participantEmails,
}) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const feedbackUrls = useMemo(() => {
        if (typeof window === 'undefined') return {};
        const origin = window.location.origin;
        return {
            company: `${origin}/feedback/company?eventId=${eventId}`,
            mission: `${origin}/feedback/mission?eventId=${eventId}`,
            desk: `${origin}/feedback/desk?eventId=${eventId}`,
        };
    }, [eventId]);

    const saveParticipants = async (selectedIds) => {
        const res = await fetch('/api/events/participants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, companyIds: selectedIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save participants');
        setSuccess('Participants updated. Refresh to see changes.');
    };

    const sendCompanyEmails = () => {
        const emails = (participantEmails || []).filter(Boolean);
        if (!emails.length) { alert('No participant emails available.'); return; }
        const subject = encodeURIComponent(`Feedback for ${eventName}`);
        const body = encodeURIComponent(
            `Dear Participant,\n\nThank you for participating in ${eventName}.\nPlease fill in the feedback form: ${feedbackUrls.company}\n\nBest regards,\nTDAP`
        );
        window.location.href = `mailto:?bcc=${encodeURIComponent(emails.join(','))}&subject=${subject}&body=${body}`;
    };

    const sendMissionEmail = () => {
        const subject = encodeURIComponent(`Mission feedback for ${eventName}`);
        const body = encodeURIComponent(
            `Dear Mission,\n\nPlease provide feedback for ${eventName}:\n${feedbackUrls.mission}\n\nBest regards,\nTDAP`
        );
        window.location.href = `mailto:info@tdap.gov.pk?subject=${subject}&body=${body}`;
    };

    return (
        <div className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Event Admin Tools</h2>

            {error && <div className="alert-error text-sm px-3 py-2">{error}</div>}
            {success && <div className="alert-success text-sm px-3 py-2">{success}</div>}

            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => router.push(`/events/${eventId}/edit`)}
                    className="btn-outline w-full px-4 py-2 text-sm"
                >
                    Edit Event Details
                </button>
                <button
                    type="button"
                    onClick={() => { setError(null); setSuccess(null); setModalOpen(true); }}
                    className="btn-outline w-full px-4 py-2 text-sm"
                >
                    Manage Participating Companies
                </button>
                <button
                    type="button"
                    onClick={sendCompanyEmails}
                    className="btn-primary w-full px-4 py-2 text-sm"
                >
                    Send Feedback Email to Companies
                </button>
                <button
                    type="button"
                    onClick={sendMissionEmail}
                    className="btn-primary w-full px-4 py-2 text-sm"
                >
                    Send Feedback Email to Mission
                </button>
                <button
                    type="button"
                    onClick={() => router.push(`/feedback/desk?eventId=${eventId}`)}
                    className="btn-outline w-full px-4 py-2 text-sm"
                    style={{ borderColor: 'rgba(234,179,8,0.5)', color: '#fde047' }}
                >
                    Desk Officer Closing Form
                </button>
            </div>

            <CompanyPickerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                initialSelectedIds={participantCompanyIds || []}
                onSave={saveParticipants}
            />
        </div>
    );
}
