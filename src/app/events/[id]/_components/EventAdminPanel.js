'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanyPickerModal from '../../../../components/CompanyPickerModal';

export default function EventAdminPanel({
    eventId,
    eventName,
    eventStatus,
    participantCompanyIds,
    participantEmails,
}) {
    const isClosed = eventStatus === 'COMPLETED';
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

    const sendCompanyEmails = async (test = false) => {
        try {
            // const emails = (participantEmails || []).filter(Boolean);
            const emails = (participantEmails || []).filter(Boolean);
            if (!emails.length) {
                alert('No participant emails available.');
                return;
            }

            setError(null);
            setSuccess(null);

            const res = await fetch('/api/events/company-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emails,
                    eventId,
                    eventName,
                    feedbackUrl: feedbackUrls.company,
                    test,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send feedback emails');
            }

            setSuccess(
                test
                    ? 'Test feedback emails sent to participating companies.'
                    : 'Feedback emails sent to participating companies.',
            );
        } catch (err) {
            console.error('Error sending company feedback emails:', err);
            setError(err.message || 'Failed to send feedback emails.');
        }
    };

    const handleSendCompanyEmails = () => {
        void sendCompanyEmails(false);
    };

    const handleSendTestCompanyEmails = () => {
        void sendCompanyEmails(true);
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
                    onClick={handleSendCompanyEmails}
                    className="btn-primary w-full px-4 py-2 text-sm"
                >
                    Send Feedback Email to Companies
                </button>
                {/* <button
                    type="button"
                    onClick={handleSendTestCompanyEmails}
                    className="btn-outline w-full px-4 py-2 text-sm"
                >
                    Send Dummy/Test Email to Companies
                </button> */}
                <button
                    type="button"
                    onClick={sendMissionEmail}
                    className="btn-primary w-full px-4 py-2 text-sm"
                >
                    Send Feedback Email to Mission
                </button>
                {isClosed ? (
                    <div
                        className="w-full px-4 py-2 text-sm rounded-lg flex items-center justify-center gap-2 font-medium"
                        style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.30)', color: '#86efac' }}
                    >
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Event Already Closed
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => router.push(`/feedback/desk?eventId=${eventId}`)}
                        className="btn-outline w-full px-4 py-2 text-sm"
                        style={{ borderColor: 'rgba(234,179,8,0.5)', color: '#fde047' }}
                    >
                        Desk Officer Closing Form
                    </button>
                )}
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
