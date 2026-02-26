'use client';

import { useState, useEffect } from 'react';

/**
 * Reusable modal for selecting participating companies.
 *
 * Props:
 *  open               – whether the modal is visible
 *  onClose            – called when the user dismisses the modal
 *  initialSelectedIds – array of currently-selected company IDs (pre-checks)
 *  onSave(ids)        – async callback; parent performs the actual API call.
 *                       Throw an Error to show a message inside the modal.
 */
export default function CompanyPickerModal({ open, onClose, initialSelectedIds = [], onSave }) {
    const [allCompanies, setAllCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [error, setError] = useState(null);

    // Re-initialise selection & search every time the modal is opened
    useEffect(() => {
        if (!open) return;
        setSelectedIds(initialSelectedIds);
        setSearch('');
        setError(null);
        if (allCompanies.length === 0) {
            setLoadingCompanies(true);
            fetch('/api/companies')
                .then(r => r.json())
                .then(d => setAllCompanies(d.companies || []))
                .catch(() => setError('Failed to load companies'))
                .finally(() => setLoadingCompanies(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!open) return null;

    const toggle = (id) =>
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

    const handleSave = async () => {
        if (!selectedIds.length) { setError('Select at least one company.'); return; }
        setSaving(true);
        setError(null);
        try {
            await onSave(selectedIds);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save participants');
        } finally {
            setSaving(false);
        }
    };

    const q = search.trim().toLowerCase();
    const filtered = q
        ? allCompanies.filter(c =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.representativeName || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q)
        )
        : allCompanies;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-card-strong max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">

                {/* Header */}
                <div className="px-5 py-4 border-b glass-divider flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Select Participating Companies</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted hover:text-white transition-colors text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Search bar */}
                <div className="px-4 pt-3 pb-2 border-b glass-divider">
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search companies…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="glass-input w-full pl-9 pr-9 py-2 text-sm"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                                aria-label="Clear search"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Company list */}
                <div className="p-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="alert-error text-sm px-3 py-2 mb-3">{error}</div>
                    )}
                    {loadingCompanies ? (
                        <p className="text-secondary text-sm">Loading companies…</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-secondary text-sm">
                            {q ? 'No companies match your search.' : 'No companies available.'}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(company => (
                                <label
                                    key={company.id}
                                    className="flex items-start gap-3 text-sm text-secondary cursor-pointer hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 accent-green-400"
                                        checked={selectedIds.includes(company.id)}
                                        onChange={() => toggle(company.id)}
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

                {/* Footer */}
                <div className="px-5 py-4 border-t glass-divider flex items-center justify-between">
                    <p className="text-xs text-muted">
                        {selectedIds.length} {selectedIds.length === 1 ? 'company' : 'companies'} selected
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-outline px-4 py-2 text-sm"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="btn-primary px-4 py-2 text-sm"
                            disabled={saving}
                        >
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
