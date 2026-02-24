'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteCompanyButton({ companyId, companyName }) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        try {
            const res = await fetch('/api/companies', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: companyId }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to delete company');
                setDeleting(false);
                return;
            }
            router.push('/companies');
        } catch {
            setError('Failed to delete company');
            setDeleting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                    bg-red-500/10 border-red-500/30 text-red-400
                    hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300"
            >
                Delete Company
            </button>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-card-strong max-w-md w-full mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Delete Company</h3>
                        </div>

                        <p className="text-secondary text-sm mb-2">
                            Are you sure you want to permanently delete{' '}
                            <span className="text-white font-semibold">{companyName}</span>?
                        </p>
                        <p className="text-muted text-xs mb-5">
                            This will also remove all event &amp; delegation participations. This action cannot be undone.
                        </p>

                        {error && (
                            <div className="alert-error px-3 py-2 text-sm mb-4">{error}</div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setModalOpen(false); setError(null); }}
                                disabled={deleting}
                                className="btn-outline flex-1 px-4 py-2 text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                                    bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting…' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
