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
    const [allCompanies, setAllCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [selectedCompanyIds, setSelectedCompanyIds] = useState(
        participantCompanyIds || []
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [savingParticipants, setSavingParticipants] = useState(false);
    const [error, setError] = useState(null);
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
            desk: `${origin}/feedback/desk?eventId=${eventId}`,
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
            } catch (err) {
                console.error('Error loading companies:', err);
                setError('Failed to load companies');
            } finally {
                setLoadingCompanies(false);
            }
        }
    };

    const toggleCompany = (companyId) => {
        setSelectedCompanyIds((prev) =>
            prev.includes(companyId)
                ? prev.filter((id) => id !== companyId)
                : [...prev, companyId]
        );
    };

    const saveParticipants = async () => {
        if (!selectedCompanyIds.length) {
            setError('Select at least one company.');
            return;
        }
        setSavingParticipants(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch('/api/events/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, companyIds: selectedCompanyIds }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to save participants');
                return;
            }
            setSuccess('Participants updated. Refresh page to see updated list.');
            setModalOpen(false);
        } catch (err) {
            console.error('Error saving participants:', err);
            setError('Failed to save participants');
        } finally {
            setSavingParticipants(false);
        }
    };

    const sendCompanyEmails = () => {
        if (typeof window === 'undefined') return;
        const emails = (participantEmails || []).filter(Boolean);
        if (!emails.length) {
            alert('No participant company emails available.');
            return;
        }
        const subject = encodeURIComponent(`Feedback for ${eventName}`);
        const bodyLines = [
            `Dear Participant,`,
            '',
            `Thank you for participating in ${eventName}.`,
            `Please fill in the feedback form at the following link:`,
            feedbackUrls.company || '',
            '',
            'Best regards,',
            'TDAP',
        ];
        const body = encodeURIComponent(bodyLines.join('\n'));
        const bcc = encodeURIComponent(emails.join(','));
        const href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
        window.location.href = href;
    };

    const sendMissionEmail = () => {
        if (typeof window === 'undefined') return;
        // For now, use TDAP generic email as "mission" contact.
        const to = encodeURIComponent('info@tdap.gov.pk');
        const subject = encodeURIComponent(`Mission feedback for ${eventName}`);
        const bodyLines = [
            `Dear Mission,`,
            '',
            `Please provide your feedback for ${eventName} using the form below:`,
            feedbackUrls.mission || '',
            '',
            'Best regards,',
            'TDAP',
        ];
        const body = encodeURIComponent(bodyLines.join('\n'));
        const href = `mailto:${to}?subject=${subject}&body=${body}`;
        window.location.href = href;
    };

    const openDeskForm = () => {
        router.push(`/feedback/desk?eventId=${eventId}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Event Admin Tools</h2>

            {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                </div>
            )}
            {success && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    {success}
                </div>
            )}

            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => router.push(`/events/${eventId}/edit`)}
                    className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Edit Event Details
                </button>

                <button
                    type="button"
                    onClick={openModal}
                    className="w-full px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50"
                >
                    Manage Participating Companies
                </button>

                <button
                    type="button"
                    onClick={sendCompanyEmails}
                    className="w-full px-4 py-2 text-sm font-medium bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                    Send Feedback Email to Companies
                </button>

                <button
                    type="button"
                    onClick={sendMissionEmail}
                    className="w-full px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-md hover:bg-blue-800"
                >
                    Send Feedback Email to Mission
                </button>

                <button
                    type="button"
                    onClick={openDeskForm}
                    className="w-full px-4 py-2 text-sm font-medium bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                    Desk Officer Closing Form
                </button>
            </div>

            {/* Participants modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Select Participating Companies
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {loadingCompanies ? (
                                <p className="text-sm text-gray-600">Loading companies...</p>
                            ) : allCompanies.length === 0 ? (
                                <p className="text-sm text-gray-600">No companies available.</p>
                            ) : (
                                <div className="space-y-2">
                                    {allCompanies.map((company) => (
                                        <label
                                            key={company.id}
                                            className="flex items-start gap-2 text-sm text-gray-800"
                                        >
                                            <input
                                                type="checkbox"
                                                className="mt-1"
                                                checked={selectedCompanyIds.includes(company.id)}
                                                onChange={() => toggleCompany(company.id)}
                                            />
                                            <span>
                                                <span className="font-semibold">{company.name}</span>
                                                {company.representativeName && (
                                                    <span className="text-gray-600">
                                                        {' '}
                                                        – {company.representativeName}
                                                    </span>
                                                )}
                                                {company.email && (
                                                    <div className="text-xs text-gray-500">
                                                        {company.email}
                                                    </div>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3 border-t flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={savingParticipants}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveParticipants}
                                className="px-4 py-2 text-sm bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-60"
                                disabled={savingParticipants}
                            >
                                {savingParticipants ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

