'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DelegationAdminPanel({
    delegationId,
    delegationType,
    participantCompanyIds,
    participantEmails,
    allocatedBudget,
}) {
    const router = useRouter();
    const [allCompanies, setAllCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [selectedCompanyIds, setSelectedCompanyIds] = useState(
        participantCompanyIds || []
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [savingParticipants, setSavingParticipants] = useState(false);
    const [closingDelegation, setClosingDelegation] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Close delegation form state
    const [utilizedBudget, setUtilizedBudget] = useState('');
    const [closingRemarks, setClosingRemarks] = useState('');

    useEffect(() => {
        setSelectedCompanyIds(participantCompanyIds || []);
    }, [participantCompanyIds]);

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
            const res = await fetch('/api/delegations/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delegationId, companyIds: selectedCompanyIds }),
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

    const handleCloseDelegation = async () => {
        const utilized = utilizedBudget.trim() ? Number(utilizedBudget) : null;
        if (utilized !== null && (isNaN(utilized) || utilized < 0)) {
            setError('Utilized budget must be a valid positive number.');
            return;
        }

        setClosingDelegation(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch('/api/delegations/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    delegationId,
                    utilizedBudget: utilized,
                    closingRemarks: closingRemarks.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to close delegation');
                return;
            }
            setSuccess('Delegation closed successfully. Refreshing page...');
            setTimeout(() => {
                router.refresh();
            }, 1500);
        } catch (err) {
            console.error('Error closing delegation:', err);
            setError('Failed to close delegation');
        } finally {
            setClosingDelegation(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delegation Admin Tools</h2>

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
                    onClick={openModal}
                    className="w-full px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50"
                >
                    Manage Participating Companies
                </button>

                <button
                    type="button"
                    onClick={() => setCloseModalOpen(true)}
                    className="w-full px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Close Delegation
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

            {/* Close delegation modal */}
            {closeModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Close Delegation
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setCloseModalOpen(false);
                                    setUtilizedBudget('');
                                    setClosingRemarks('');
                                    setError(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {allocatedBudget && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Allocated Budget
                                    </label>
                                    <p className="text-gray-600">PKR {allocatedBudget.toLocaleString()}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Utilized Budget (PKR)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={utilizedBudget}
                                    onChange={(e) => setUtilizedBudget(e.target.value)}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter utilized budget"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty if not applicable
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Closing Remarks
                                </label>
                                <textarea
                                    value={closingRemarks}
                                    onChange={(e) => setClosingRemarks(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Add any closing remarks or notes..."
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                    <strong>Warning:</strong> Closing a delegation will mark it as closed and cannot be undone. Make sure all information is correct.
                                </p>
                            </div>
                        </div>

                        <div className="px-4 py-3 border-t flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCloseModalOpen(false);
                                    setUtilizedBudget('');
                                    setClosingRemarks('');
                                    setError(null);
                                }}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={closingDelegation}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseDelegation}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
                                disabled={closingDelegation}
                            >
                                {closingDelegation ? 'Closing...' : 'Close Delegation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
