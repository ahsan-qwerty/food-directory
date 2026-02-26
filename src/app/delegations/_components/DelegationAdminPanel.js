'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanyPickerModal from '../../../components/CompanyPickerModal';

export default function DelegationAdminPanel({
    delegationId,
    delegationType,
    participantCompanyIds,
    participantEmails,
    allocatedBudget,
}) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [closingDelegation, setClosingDelegation] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [utilizedBudget, setUtilizedBudget] = useState('');
    const [closingRemarks, setClosingRemarks] = useState('');

    const saveParticipants = async (selectedIds) => {
        const res = await fetch('/api/delegations/participants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delegationId, companyIds: selectedIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save participants');
        setSuccess('Participants updated. Refresh to see changes.');
    };

    const handleCloseDelegation = async () => {
        const utilized = utilizedBudget.trim() ? Number(utilizedBudget) : null;
        if (utilized !== null && (isNaN(utilized) || utilized < 0)) {
            setError('Utilized budget must be a valid positive number.');
            return;
        }
        setClosingDelegation(true);
        setError(null); setSuccess(null);
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
            if (!res.ok) { setError(data.error || 'Failed to close delegation'); return; }
            setSuccess('Delegation closed successfully. Refreshing…');
            setTimeout(() => router.refresh(), 1500);
        } catch {
            setError('Failed to close delegation');
        } finally {
            setClosingDelegation(false);
        }
    };

    const resetCloseModal = () => {
        setCloseModalOpen(false);
        setUtilizedBudget('');
        setClosingRemarks('');
        setError(null);
    };

    return (
        <div className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Delegation Admin Tools</h2>

            {error && <div className="alert-error text-sm px-3 py-2">{error}</div>}
            {success && <div className="alert-success text-sm px-3 py-2">{success}</div>}

            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => { setError(null); setSuccess(null); setModalOpen(true); }}
                    className="btn-outline w-full px-4 py-2 text-sm"
                >
                    Manage Participating Companies
                </button>
                <button
                    type="button"
                    onClick={() => setCloseModalOpen(true)}
                    className="w-full px-4 py-2 text-sm font-semibold rounded-lg border transition-all"
                    style={{
                        background: 'rgba(239,68,68,0.15)',
                        borderColor: 'rgba(239,68,68,0.40)',
                        color: '#fca5a5',
                    }}
                >
                    Close Delegation
                </button>
            </div>

            {/* Shared company picker (with search) */}
            <CompanyPickerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                initialSelectedIds={participantCompanyIds || []}
                onSave={saveParticipants}
            />

            {/* Close delegation modal */}
            {closeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-card-strong max-w-lg w-full mx-4">
                        <div className="px-5 py-4 border-b glass-divider flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Close Delegation</h3>
                            <button
                                type="button"
                                onClick={resetCloseModal}
                                className="text-muted hover:text-white transition-colors text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {allocatedBudget && (
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                                        Allocated Budget
                                    </label>
                                    <p className="text-accent-green font-semibold">PKR {allocatedBudget.toLocaleString()}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                                    Utilized Budget (PKR)
                                </label>
                                <input
                                    type="number" step="0.01" min="0"
                                    value={utilizedBudget}
                                    onChange={e => setUtilizedBudget(e.target.value)}
                                    className="glass-input w-full px-3 py-2"
                                    placeholder="Enter utilized budget"
                                />
                                <p className="text-xs text-muted mt-1">Leave empty if not applicable</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                                    Closing Remarks
                                </label>
                                <textarea
                                    value={closingRemarks}
                                    onChange={e => setClosingRemarks(e.target.value)}
                                    rows={4}
                                    className="glass-input w-full px-3 py-2"
                                    placeholder="Add any closing remarks or notes…"
                                />
                            </div>

                            <div
                                className="rounded-lg p-3"
                                style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.30)' }}
                            >
                                <p className="text-sm" style={{ color: '#fde047' }}>
                                    <strong>Warning:</strong> Closing this delegation cannot be undone. Make sure all information is correct.
                                </p>
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t glass-divider flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetCloseModal}
                                className="btn-outline px-4 py-2 text-sm"
                                disabled={closingDelegation}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseDelegation}
                                className="px-4 py-2 text-sm font-semibold rounded-lg"
                                style={{
                                    background: 'rgba(239,68,68,0.80)',
                                    color: 'white',
                                    opacity: closingDelegation ? 0.6 : 1,
                                }}
                                disabled={closingDelegation}
                            >
                                {closingDelegation ? 'Closing…' : 'Close Delegation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
