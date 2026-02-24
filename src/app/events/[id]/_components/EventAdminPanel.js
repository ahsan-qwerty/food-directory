'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EventAdminPanel({
    eventId,
    eventName,
    participantCompanyIds,
    participantEmails,
}) {
    const router = useRouter();
    const [allCompanies, setAllCompanies]       = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [selectedCompanyIds, setSelectedCompanyIds] = useState(participantCompanyIds || []);
    const [modalOpen, setModalOpen]               = useState(false);
    const [savingParticipants, setSavingParticipants] = useState(false);
    const [error, setError]   = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        setSelectedCompanyIds(participantCompanyIds || []);
    }, [participantCompanyIds]);

    const feedbackUrls = useMemo(() => {
        if (typeof window === 'undefined') return {};
        const origin = window.location.origin;
        return {
            company: `${origin}/feedback/company?eventId=${eventId}`,
            mission: `${origin}/feedback/mission?eventId=${eventId}`,
            desk:    `${origin}/feedback/desk?eventId=${eventId}`,
        };
    }, [eventId]);

    const openModal = async () => {
        setModalOpen(true);
        if (allCompanies.length === 0) {
            setLoadingCompanies(true);
            setError(null);
            try {
                const res = await fetch('/api/companies');
                const data = await res.json();
                setAllCompanies(data.companies || []);
            } catch {
                setError('Failed to load companies');
            } finally {
                setLoadingCompanies(false);
            }
        }
    };

    const toggleCompany = (id) =>
        setSelectedCompanyIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

    const saveParticipants = async () => {
        if (!selectedCompanyIds.length) { setError('Select at least one company.'); return; }
        setSavingParticipants(true);
        setError(null); setSuccess(null);
        try {
            const res = await fetch('/api/events/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, companyIds: selectedCompanyIds }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to save participants'); return; }
            setSuccess('Participants updated. Refresh to see changes.');
            setModalOpen(false);
        } catch {
            setError('Failed to save participants');
        } finally {
            setSavingParticipants(false);
        }
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

            {error   && <div className="alert-error text-sm px-3 py-2">{error}</div>}
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
                    onClick={openModal}
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

            {/* Participants modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-card-strong max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                        <div className="px-5 py-4 border-b glass-divider flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Select Participating Companies</h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="text-muted hover:text-white transition-colors text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {loadingCompanies ? (
                                <p className="text-secondary text-sm">Loading companies…</p>
                            ) : allCompanies.length === 0 ? (
                                <p className="text-secondary text-sm">No companies available.</p>
                            ) : (
                                <div className="space-y-2">
                                    {allCompanies.map(company => (
                                        <label
                                            key={company.id}
                                            className="flex items-start gap-3 text-sm text-secondary cursor-pointer hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                                        >
                                            <input
                                                type="checkbox"
                                                className="mt-0.5 accent-green-400"
                                                checked={selectedCompanyIds.includes(company.id)}
                                                onChange={() => toggleCompany(company.id)}
                                            />
                                            <span>
                                                <span className="font-semibold text-white">{company.name}</span>
                                                {company.representativeName && (
                                                    <span className="text-muted"> — {company.representativeName}</span>
                                                )}
                                                {company.email && (
                                                    <div className="text-xs text-muted mt-0.5">{company.email}</div>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-4 border-t glass-divider flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="btn-outline px-4 py-2 text-sm"
                                disabled={savingParticipants}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveParticipants}
                                className="btn-primary px-4 py-2 text-sm"
                                disabled={savingParticipants}
                            >
                                {savingParticipants ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
