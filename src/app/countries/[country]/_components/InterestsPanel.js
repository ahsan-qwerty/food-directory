'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import DownloadButton from './DownloadButton';
import CompanyFeedbackPanel from './CompanyFeedbackPanel';

function parseProductExports(raw) {
    if (!raw) return {};
    if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return {}; }
    }
    return {};
}

/* ─── InterestsPanel ────────────────────────────────────────────────────────
   View mode by default. Each card has edit/delete icon buttons.
   "Add Interest" opens a modal popup.
───────────────────────────────────────────────────────────────────────────── */
export default function InterestsPanel({ countryName, initialInterests = [] }) {
    const [interests, setInterests] = useState(initialInterests);
    const [modalOpen, setModalOpen] = useState(false);
    const [newInterest, setNewInterest] = useState({ customProduct: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [justAddedId, setJustAddedId] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());

    function toggleSelect(id) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function clearSelection() {
        setSelectedIds(new Set());
    }

    const selectedCount = selectedIds.size;
    const selectedInterestIds = [...selectedIds];

    function openModal() {
        setNewInterest({ customProduct: '', notes: '' });
        setModalOpen(true);
    }

    function closeModal() {
        if (saving) return;
        setModalOpen(false);
        setNewInterest({ customProduct: '', notes: '' });
    }

    async function handleAddInterest(e) {
        e.preventDefault();
        if (!newInterest.customProduct.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/countries/${encodeURIComponent(countryName)}/interests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subSectorId: null,
                    customProduct: newInterest.customProduct.trim(),
                    notes: newInterest.notes.trim() || null,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setInterests(prev => [...prev, data.interest]);
                setJustAddedId(data.interest.id);
                closeModal();
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    }

    async function handleDeleteInterest(id) {
        if (!confirm('Remove this product interest?')) return;
        await fetch(`/api/countries/${encodeURIComponent(countryName)}/interests/${id}`, { method: 'DELETE' });
        setInterests(prev => prev.filter(i => i.id !== id));
    }

    async function handleSaveNotes(id, notes) {
        const res = await fetch(`/api/countries/${encodeURIComponent(countryName)}/interests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes }),
        });
        const data = await res.json();
        if (res.ok) setInterests(prev => prev.map(i => i.id === id ? data.interest : i));
    }

    async function handleUpdateCompanies(id, companyIds) {
        const res = await fetch(`/api/countries/${encodeURIComponent(countryName)}/interests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyIds }),
        });
        const data = await res.json();
        if (res.ok) setInterests(prev => prev.map(i => i.id === id ? data.interest : i));
    }

    return (
        <div className="glass-card p-6">
            {/* Section header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                <div>
                    <h2 className="text-xl font-bold text-white">TDAP Recommended Companies</h2>
                    <p className="text-xs text-muted mt-0.5">
                        Products/subsectors of interest and Pakistani companies best suited for each
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedCount >= 2 && (
                        <div className="flex items-center gap-2">
                            <DownloadButton
                                url={`/api/countries/${encodeURIComponent(countryName)}/interest-directory?interestIds=${selectedInterestIds.join(',')}`}
                                filename={`${countryName.toLowerCase()}-selected-products-directory.pdf`}
                                label={`Download Selected (${selectedCount})`}
                                variant="orange"
                            />
                            <button
                                type="button"
                                onClick={clearSelection}
                                title="Clear selection"
                                className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {interests.some(i => i.companies.length > 0) && (
                        <DownloadButton
                            url={`/api/countries/${encodeURIComponent(countryName)}/interest-directory`}
                            filename={`${countryName.toLowerCase()}-all-products-directory.pdf`}
                            label="Download All"
                            variant="purple"
                        />
                    )}
                    <button
                        type="button"
                        onClick={openModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Interest
                    </button>
                </div>
            </div>

            {/* ── Add Interest Modal ─────────────────────────────────────── */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
                    onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Dialog */}
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#141927] shadow-2xl p-6">
                        {/* Modal header */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-white">Add Product Interest</h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddInterest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1.5">
                                    Product Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newInterest.customProduct}
                                    onChange={e => setNewInterest(p => ({ ...p, customProduct: e.target.value }))}
                                    placeholder="e.g. Basmati Rice"
                                    className="glass-input w-full px-3 py-2.5"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1.5">
                                    Notes / Requirements
                                    <span className="text-muted font-normal ml-1">(optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={newInterest.notes}
                                    onChange={e => setNewInterest(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="e.g. Prefer certified halal, bulk quantities…"
                                    className="glass-input w-full px-3 py-2.5 resize-none"
                                />
                            </div>

                            {/* Modal actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !newInterest.customProduct.trim()}
                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Submitting…
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Submit Interest
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Interest cards */}
            {interests.length === 0 ? (
                <div className="mt-5 text-center py-8 rounded-xl border border-dashed border-white/10">
                    <p className="text-muted text-sm">
                        No product interests added yet.{' '}
                        <button
                            type="button"
                            onClick={openModal}
                            className="text-emerald-400 hover:underline font-medium"
                        >
                            Add one now
                        </button>
                    </p>
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {interests.map(interest => (
                        <InterestCard
                            key={interest.id}
                            interest={interest}
                            countryName={countryName}
                            autoEdit={justAddedId === interest.id}
                            onAutoEditDone={() => setJustAddedId(null)}
                            onDelete={() => handleDeleteInterest(interest.id)}
                            onSaveNotes={notes => handleSaveNotes(interest.id, notes)}
                            onUpdateCompanies={ids => handleUpdateCompanies(interest.id, ids)}
                            selected={selectedIds.has(interest.id)}
                            onToggleSelect={() => toggleSelect(interest.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── InterestCard ──────────────────────────────────────────────────────────── */

function InterestCard({ interest, countryName, autoEdit, onAutoEditDone, onDelete, onSaveNotes, onUpdateCompanies, selected = false, onToggleSelect }) {
    const [editing, setEditing] = useState(false);
    const cardRef = useRef(null);

    // When newly added: open edit mode and scroll into view
    useEffect(() => {
        if (!autoEdit) return;
        setEditing(true);
        // Small delay so the DOM has painted the card before scrolling
        const t = setTimeout(() => {
            cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            onAutoEditDone?.();
        }, 80);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoEdit]);

    // ── view state ──
    const [assignedCompanies, setAssignedCompanies] = useState(
        () => interest.companies.map(ic => ic.company)
    );
    const assignedRef = useRef(assignedCompanies);
    useEffect(() => { assignedRef.current = assignedCompanies; }, [assignedCompanies]);

    // Re-sync from prop when parent refreshes
    const companiesSnapshot = interest.companies.map(ic => ic.id).join(',');
    useEffect(() => {
        setAssignedCompanies(interest.companies.map(ic => ic.company));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companiesSnapshot]);

    // ── edit state ──
    const [notes, setNotes] = useState(interest.notes || '');
    const [notesDirty, setNotesDirty] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [companySearch, setCompanySearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef(null);

    // Sync notes from prop when not dirty
    useEffect(() => {
        if (!notesDirty) setNotes(interest.notes || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interest.notes]);

    // Close search dropdown on outside click
    useEffect(() => {
        if (!editing) return;
        function onMouseDown(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchResults([]);
                setCompanySearch('');
            }
        }
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [editing]);

    // Debounced company search
    useEffect(() => {
        if (!companySearch.trim()) { setSearchResults([]); return; }
        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/companies?q=${encodeURIComponent(companySearch)}`);
                const data = await res.json();
                const assignedIds = new Set(assignedRef.current.map(c => c.id));
                setSearchResults((data.companies || []).filter(c => !assignedIds.has(c.id)).slice(0, 8));
            } catch { setSearchResults([]); }
            finally { setSearching(false); }
        }, 300);
        return () => clearTimeout(t);
    }, [companySearch]);

    async function addCompany(company) {
        if (assignedRef.current.some(c => c.id === company.id)) return;
        const next = [...assignedRef.current, company];
        setAssignedCompanies(next);
        setCompanySearch('');
        setSearchResults([]);
        await onUpdateCompanies(next.map(c => c.id));
    }

    async function removeCompany(companyId) {
        const next = assignedRef.current.filter(c => c.id !== companyId);
        setAssignedCompanies(next);
        await onUpdateCompanies(next.map(c => c.id));
    }

    async function saveNotes() {
        setSavingNotes(true);
        await onSaveNotes(notes);
        setNotesDirty(false);
        setSavingNotes(false);
    }

    function closeEdit() {
        setEditing(false);
        setCompanySearch('');
        setSearchResults([]);
        if (notesDirty) {
            setNotes(interest.notes || '');
            setNotesDirty(false);
        }
    }

    const label = interest.subSector ? interest.subSector.name : (interest.customProduct || 'Unnamed');
    const sectorName = interest.subSector?.sector?.name || null;
    const slug = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return (
        <div ref={cardRef} className={`rounded-xl border p-5 transition-colors ${editing
            ? 'border-sky-500/30 bg-sky-500/5'
            : selected
                ? 'border-orange-500/40 bg-orange-500/5'
                : 'border-white/10 bg-white/3'
            }`}>

            {/* ── Header row ──────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Selection checkbox — only in view mode */}
                    {!editing && (
                        <button
                            type="button"
                            onClick={onToggleSelect}
                            title={selected ? 'Deselect' : 'Select for combined download'}
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${selected
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'border-white/30 hover:border-orange-400 text-transparent hover:text-orange-400'
                                }`}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    )}
                    <h3 className="text-base font-bold text-white">{label}</h3>
                    {sectorName && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                            {sectorName}
                        </span>
                    )}
                </div>

                {/* Action icons */}
                <div className="flex items-center gap-1 shrink-0">
                    {assignedCompanies.length > 0 && !editing && (
                        <DownloadButton
                            url={`/api/countries/${encodeURIComponent(countryName)}/interest-directory?interestId=${interest.id}`}
                            filename={`${countryName.toLowerCase()}-${slug}-directory.pdf`}
                            label={`Download`}
                            variant="teal"
                        />
                    )}
                    {/* Edit toggle */}
                    <button
                        type="button"
                        onClick={() => editing ? closeEdit() : setEditing(true)}
                        title={editing ? 'Close edit mode' : 'Edit this interest'}
                        className={`p-1.5 rounded-lg transition-colors ${editing
                            ? 'text-sky-300 bg-sky-500/15 hover:bg-sky-500/25'
                            : 'text-muted hover:text-sky-300 hover:bg-sky-500/10'}`}
                    >
                        {editing ? (
                            /* X / close icon */
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            /* Pencil icon */
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        )}
                    </button>
                    {/* Delete */}
                    <button
                        type="button"
                        onClick={onDelete}
                        title="Remove interest"
                        className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── VIEW MODE ───────────────────────────────────────────────── */}
            {!editing && (
                <>
                    {/* Notes (read-only) */}
                    {notes && (
                        <p className="text-secondary text-sm mb-4 leading-relaxed">{notes}</p>
                    )}

                    {/* Companies (read-only cards, sorted by export value for this product) */}
                    {assignedCompanies.length > 0 ? (
                        <div>
                            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Recommended Companies</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[...assignedCompanies]
                                    .sort((a, b) => {
                                        const subSectorId = interest.subSector?.id ?? null;
                                        if (!subSectorId) return 0;
                                        const aVal = Number(parseProductExports(a.productExports)[String(subSectorId)]) || 0;
                                        const bVal = Number(parseProductExports(b.productExports)[String(subSectorId)]) || 0;
                                        return bVal - aVal;
                                    })
                                    .map(company => (
                                        <div key={company.id} className="rounded-lg border border-white/10 hover:border-sky-500/40 transition-colors bg-transparent">
                                            <Link
                                                href={`/companies/${company.id}`}
                                                className="flex items-center gap-3 px-3 py-2.5 group"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-sky-300">
                                                        {company.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white group-hover:text-sky-300 transition-colors line-clamp-1">{company.name}</p>
                                                    {company.representativeName && (
                                                        <p className="text-xs text-muted line-clamp-1">{company.representativeName}</p>
                                                    )}
                                                </div>
                                            </Link>
                                            {/* Daily feedback log — expandable per company */}
                                            {/* <div className="px-3 pb-2">
                                                <CompanyFeedbackPanel
                                                    companyId={company.id}
                                                    companyName={company.name}
                                                />
                                            </div> */}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted italic">
                            No companies assigned yet.{' '}
                            <button type="button" onClick={() => setEditing(true)} className="text-sky-400 hover:underline">
                                Add companies
                            </button>
                        </p>
                    )}
                </>
            )}

            {/* ── EDIT MODE ───────────────────────────────────────────────── */}
            {editing && (
                <>
                    {/* Notes editable */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-secondary mb-1">Notes / Requirements</label>
                        <div className="flex gap-2">
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={e => { setNotes(e.target.value); setNotesDirty(true); }}
                                placeholder="e.g. Prefer certified halal, bulk quantities…"
                                className="glass-input flex-1 px-3 py-2 text-sm"
                            />
                            {notesDirty && (
                                <button
                                    type="button"
                                    onClick={saveNotes}
                                    disabled={savingNotes}
                                    className="shrink-0 self-start px-3 py-2 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors"
                                >
                                    {savingNotes ? '…' : 'Save'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Assigned companies with remove */}
                    <div className="mb-3">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Recommended Companies</p>
                        {assignedCompanies.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {assignedCompanies.map(company => (
                                    <span
                                        key={company.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-sky-500/30 text-sky-300 bg-sky-500/10"
                                    >
                                        {company.name}
                                        <button
                                            type="button"
                                            onClick={() => removeCompany(company.id)}
                                            className="text-sky-400 hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted italic mb-2">No companies assigned yet.</p>
                        )}
                    </div>

                    {/* Company search */}
                    <div className="relative" ref={searchRef}>
                        <input
                            type="text"
                            value={companySearch}
                            onChange={e => setCompanySearch(e.target.value)}
                            placeholder="Search and add a company…"
                            className="glass-input w-full px-3 py-2 text-sm"
                        />
                        {searching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg className="animate-spin h-4 w-4 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                        )}
                        {searchResults.length > 0 && (
                            <div className="absolute z-[9999] bottom-full mb-1 w-full rounded-lg border border-white/10 bg-[#1a1f2e] shadow-xl overflow-y-auto max-h-60">
                                {searchResults.map(company => (
                                    <button
                                        key={company.id}
                                        type="button"
                                        onClick={() => addCompany(company)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                                    >
                                        <p className="text-sm font-medium text-white">{company.name}</p>
                                        {company.representativeName && (
                                            <p className="text-xs text-muted">{company.representativeName}</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Done button */}
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={closeEdit}
                            className="px-4 py-1.5 text-xs font-medium rounded-lg text-sky-300 border border-sky-500/30 hover:bg-sky-500/10 transition-colors"
                        >
                            Done editing
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
