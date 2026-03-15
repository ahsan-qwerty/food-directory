'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GCC_COUNTRIES = ['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];

const EMPTY_ROW = { product: '', hsCode: '', value: '' };

function makeRows(arr, count = 10) {
    const rows = (Array.isArray(arr) ? arr : []).map(r => ({
        product: r.product ?? '',
        hsCode: r.hsCode ?? '',
        value: r.value != null ? String(r.value) : '',
    }));
    while (rows.length < count) rows.push({ ...EMPTY_ROW });
    return rows;
}

export default function EditCountryProfilePage({ params }) {
    const { country } = use(params);
    const countryName = decodeURIComponent(country);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        overview: '',
        population: '',
        gdp: '',
        currency: '',
        additionalNotes: '',
        topImportsFromWorld: makeRows([]),
        otherImportsFromWorldValue: '',
        topImportsFromPakistan: makeRows([]),
        otherImportsFromPakistanValue: '',
    });

    useEffect(() => {
        if (!GCC_COUNTRIES.includes(countryName)) return;
        fetch(`/api/countries/${encodeURIComponent(countryName)}`)
            .then(r => r.json())
            .then(({ profile }) => {
                if (profile) {
                    setForm({
                        overview: profile.overview ?? '',
                        population: profile.population ?? '',
                        gdp: profile.gdp ?? '',
                        currency: profile.currency ?? '',
                        additionalNotes: profile.additionalNotes ?? '',
                        topImportsFromWorld: makeRows(profile.topImportsFromWorld),
                        otherImportsFromWorldValue: profile.otherImportsFromWorldValue != null
                            ? String(profile.otherImportsFromWorldValue) : '',
                        topImportsFromPakistan: makeRows(profile.topImportsFromPakistan),
                        otherImportsFromPakistanValue: profile.otherImportsFromPakistanValue != null
                            ? String(profile.otherImportsFromPakistanValue) : '',
                    });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [countryName]);

    if (!GCC_COUNTRIES.includes(countryName)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center">
                    <p className="text-white text-lg font-semibold mb-4">Country "{countryName}" is not in GCC list.</p>
                    <Link href="/companies" className="btn-primary px-6 py-2">Back to Directory</Link>
                </div>
            </div>
        );
    }

    function setField(key, value) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function setRow(tableKey, index, field, value) {
        setForm(prev => {
            const rows = prev[tableKey].map((r, i) =>
                i === index ? { ...r, [field]: value } : r
            );
            return { ...prev, [tableKey]: rows };
        });
    }

    function addRow(tableKey) {
        setForm(prev => ({
            ...prev,
            [tableKey]: [...prev[tableKey], { ...EMPTY_ROW }],
        }));
    }

    function removeRow(tableKey, index) {
        setForm(prev => ({
            ...prev,
            [tableKey]: prev[tableKey].filter((_, i) => i !== index),
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                topImportsFromWorld: form.topImportsFromWorld.map((r, i) => ({
                    rank: i + 1,
                    product: r.product,
                    hsCode: r.hsCode,
                    value: r.value,
                })),
                topImportsFromPakistan: form.topImportsFromPakistan.map((r, i) => ({
                    rank: i + 1,
                    product: r.product,
                    hsCode: r.hsCode,
                    value: r.value,
                })),
            };

            const res = await fetch(`/api/countries/${encodeURIComponent(countryName)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || 'Save failed');
            }

            router.push(`/countries/${encodeURIComponent(countryName)}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-accent-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-muted text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link href={`/countries/${encodeURIComponent(countryName)}`}
                                className="text-sm text-muted hover:text-accent-green transition-colors">
                                ← {countryName} Profile
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-white">{countryName} — Edit Country Profile</h1>
                        <p className="text-muted mt-1">AgroFood import data and market overview</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form id="country-profile-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* Basic Info */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-white mb-5">Country Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1.5">Population</label>
                                <input
                                    type="text"
                                    value={form.population}
                                    onChange={e => setField('population', e.target.value)}
                                    placeholder="e.g. 9.9 million"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1.5">GDP</label>
                                <input
                                    type="text"
                                    value={form.gdp}
                                    onChange={e => setField('gdp', e.target.value)}
                                    placeholder="e.g. $225 billion"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1.5">Currency</label>
                                <input
                                    type="text"
                                    value={form.currency}
                                    onChange={e => setField('currency', e.target.value)}
                                    placeholder="e.g. Qatari Riyal (QAR)"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1.5">Market Overview</label>
                            <textarea
                                rows={5}
                                value={form.overview}
                                onChange={e => setField('overview', e.target.value)}
                                placeholder="Describe the country's food import landscape, key trends, and opportunities…"
                                className="glass-input w-full px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Top Imports from World */}
                    <ImportsTable
                        title="Top AgroFood Imports from World"
                        subtitle="Rank, product, HS code, and USD value"
                        rows={form.topImportsFromWorld}
                        otherValue={form.otherImportsFromWorldValue}
                        onRowChange={(i, f, v) => setRow('topImportsFromWorld', i, f, v)}
                        onAddRow={() => addRow('topImportsFromWorld')}
                        onRemoveRow={i => removeRow('topImportsFromWorld', i)}
                        onOtherValueChange={v => setField('otherImportsFromWorldValue', v)}
                    />

                    {/* Top Imports from Pakistan */}
                    <ImportsTable
                        title="Top AgroFood Imports from Pakistan"
                        subtitle="Rank, product, HS code, and USD value"
                        rows={form.topImportsFromPakistan}
                        otherValue={form.otherImportsFromPakistanValue}
                        onRowChange={(i, f, v) => setRow('topImportsFromPakistan', i, f, v)}
                        onAddRow={() => addRow('topImportsFromPakistan')}
                        onRemoveRow={i => removeRow('topImportsFromPakistan', i)}
                        onOtherValueChange={v => setField('otherImportsFromPakistanValue', v)}
                    />

                    {/* Additional Notes */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Additional Notes</h2>
                        <textarea
                            rows={4}
                            value={form.additionalNotes}
                            onChange={e => setField('additionalNotes', e.target.value)}
                            placeholder="Any additional market intelligence, notes, or observations…"
                            className="glass-input w-full px-3 py-2"
                        />
                    </div>

                </form>

                {/* Interests section — lives outside the main form so saves are independent */}
                <InterestsManager countryName={countryName} />

                {/* Submit */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href={`/countries/${encodeURIComponent(countryName)}`}
                        className="btn-outline px-5 py-2.5 text-sm"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        form="country-profile-form"
                        disabled={saving}
                        className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {saving && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {saving ? 'Saving…' : 'Save Profile'}
                    </button>
                </div>
            </main>
        </div>
    );
}

/* ─── Interests Manager ────────────────────────────────────────────────────── */

function InterestsManager({ countryName }) {
    const [interests, setInterests] = useState([]);
    const [subSectors, setSubSectors] = useState([]);
    const [loadingInterests, setLoadingInterests] = useState(true);
    const [addingInterest, setAddingInterest] = useState(false);
    const [newInterest, setNewInterest] = useState({ subSectorId: '', customProduct: '', notes: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch(`/api/countries/${encodeURIComponent(countryName)}/interests`).then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
        ]).then(([iData, cData]) => {
            setInterests(iData.interests || []);
            setSubSectors(cData.subSectors || []);
        }).catch(console.error)
            .finally(() => setLoadingInterests(false));
    }, [countryName]);

    async function handleAddInterest() {
        if (!newInterest.subSectorId && !newInterest.customProduct.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/countries/${encodeURIComponent(countryName)}/interests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subSectorId: newInterest.subSectorId || null,
                    customProduct: newInterest.customProduct,
                    notes: newInterest.notes,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setInterests(prev => [...prev, data.interest]);
                setNewInterest({ subSectorId: '', customProduct: '', notes: '' });
                setAddingInterest(false);
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
        <div className="mt-8 pb-12">
            <div className="flex items-center justify-between mb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Product Interests &amp; Recommended Companies</h2>
                    <p className="text-xs text-muted mt-0.5">Add subsectors/products this country is interested in, then assign recommended Pakistani companies</p>
                </div>
                <button
                    type="button"
                    onClick={() => setAddingInterest(v => !v)}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Interest
                </button>
            </div>

            {/* Add new interest form */}
            {addingInterest && (
                <div className="glass-card p-5 mb-5 border border-sky-500/20">
                    <h3 className="text-sm font-semibold text-white mb-4">New Product Interest</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-secondary mb-1">Subsector</label>
                            <select
                                value={newInterest.subSectorId}
                                onChange={e => setNewInterest(p => ({ ...p, subSectorId: e.target.value, customProduct: '' }))}
                                className="glass-input w-full px-3 py-2 text-sm"
                            >
                                <option value="">— Select a subsector —</option>
                                {subSectors.map(ss => (
                                    <option key={ss.id} value={ss.id}>{ss.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-secondary mb-1">
                                Or custom product name <span className="text-muted font-normal">(if not in list)</span>
                            </label>
                            <input
                                type="text"
                                value={newInterest.customProduct}
                                onChange={e => setNewInterest(p => ({ ...p, customProduct: e.target.value, subSectorId: '' }))}
                                placeholder="e.g. Basmati Rice"
                                className="glass-input w-full px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-secondary mb-1">Notes / Requirements</label>
                        <textarea
                            rows={2}
                            value={newInterest.notes}
                            onChange={e => setNewInterest(p => ({ ...p, notes: e.target.value }))}
                            placeholder="e.g. Prefer certified halal, bulk quantities…"
                            className="glass-input w-full px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleAddInterest}
                            disabled={saving || (!newInterest.subSectorId && !newInterest.customProduct.trim())}
                            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                        >
                            {saving ? 'Adding…' : 'Add Interest'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAddingInterest(false); setNewInterest({ subSectorId: '', customProduct: '', notes: '' }); }}
                            className="btn-outline px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {loadingInterests ? (
                <div className="glass-card p-8 text-center">
                    <svg className="animate-spin h-6 w-6 mx-auto text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            ) : interests.length === 0 && !addingInterest ? (
                <div className="glass-card p-8 text-center">
                    <p className="text-muted text-sm">No product interests added yet. Click <span className="text-white font-medium">Add Interest</span> to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {interests.map(interest => (
                        <InterestCard
                            key={interest.id}
                            interest={interest}
                            countryName={countryName}
                            onDelete={() => handleDeleteInterest(interest.id)}
                            onSaveNotes={notes => handleSaveNotes(interest.id, notes)}
                            onUpdateCompanies={ids => handleUpdateCompanies(interest.id, ids)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Single interest card ──────────────────────────────────────────────────── */

function InterestCard({ interest, onDelete, onSaveNotes, onUpdateCompanies }) {
    const [notes, setNotes] = useState(interest.notes || '');
    const [notesDirty, setNotesDirty] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [companySearch, setCompanySearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [assignedCompanies, setAssignedCompanies] = useState(
        interest.companies.map(ic => ic.company)
    );

    const label = interest.subSector ? interest.subSector.name : (interest.customProduct || 'Unnamed');
    const sectorName = interest.subSector?.sector?.name || null;

    useEffect(() => {
        if (!companySearch.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/companies?q=${encodeURIComponent(companySearch)}`);
                const data = await res.json();
                // exclude already-assigned
                const assignedIds = new Set(assignedCompanies.map(c => c.id));
                setSearchResults((data.companies || []).filter(c => !assignedIds.has(c.id)).slice(0, 8));
            } catch { setSearchResults([]); }
            finally { setSearching(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [companySearch, assignedCompanies]);

    async function addCompany(company) {
        const next = [...assignedCompanies, company];
        setAssignedCompanies(next);
        setCompanySearch('');
        setSearchResults([]);
        await onUpdateCompanies(next.map(c => c.id));
    }

    async function removeCompany(id) {
        const next = assignedCompanies.filter(c => c.id !== id);
        setAssignedCompanies(next);
        await onUpdateCompanies(next.map(c => c.id));
    }

    async function saveNotes() {
        setSavingNotes(true);
        await onSaveNotes(notes);
        setNotesDirty(false);
        setSavingNotes(false);
    }

    return (
        <div className="glass-card p-5 border border-white/10">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white">{label}</h3>
                    {sectorName && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                            {sectorName}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onDelete}
                    className="shrink-0 p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove interest"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Notes */}
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

            {/* Assigned companies */}
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
            <div className="relative">
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
                    <div className="absolute z-[9999] bottom-full mb-1 w-full rounded-lg border border-white/10 bg-[#1a1f2e] shadow-xl overflow-hidden max-h-60 overflow-y-auto">
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
        </div>
    );
}

/* ─── Imports Table sub-component ─────────────────────────────────────────── */

function ImportsTable({ title, subtitle, rows, otherValue, onRowChange, onAddRow, onRemoveRow, onOtherValueChange }) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-1 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <p className="text-xs text-muted mt-0.5">{subtitle}</p>
                </div>
                <button
                    type="button"
                    onClick={onAddRow}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-secondary hover:text-white border border-white/10 hover:border-white/20 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Row
                </button>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left pb-2 pr-2 text-xs font-semibold text-muted uppercase tracking-wide w-10">#</th>
                            <th className="text-left pb-2 pr-2 text-xs font-semibold text-muted uppercase tracking-wide">Product Name</th>
                            <th className="text-left pb-2 pr-2 text-xs font-semibold text-muted uppercase tracking-wide w-36">Value (USD)</th>
                            <th className="pb-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b border-white/5">
                                <td className="py-1.5 pr-2 text-muted text-xs font-mono align-middle">{i + 1}</td>
                                <td className="py-1.5 pr-2 align-middle">
                                    <input
                                        type="text"
                                        value={row.product}
                                        onChange={e => onRowChange(i, 'product', e.target.value)}
                                        placeholder="e.g. Rice"
                                        className="glass-input w-full px-2.5 py-1.5 text-sm"
                                    />
                                </td>
                                <td className="py-1.5 pr-2 align-middle">
                                    <input
                                        type="number"
                                        value={row.value}
                                        onChange={e => onRowChange(i, 'value', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        step="1"
                                        className="glass-input w-full px-2.5 py-1.5 text-sm"
                                    />
                                </td>
                                <td className="py-1.5 align-middle text-center">
                                    <button
                                        type="button"
                                        onClick={() => onRemoveRow(i)}
                                        title="Remove row"
                                        className="text-muted hover:text-red-400 transition-colors p-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Others row */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium text-secondary shrink-0">Others value (USD):</span>
                <input
                    type="number"
                    value={otherValue}
                    onChange={e => onOtherValueChange(e.target.value)}
                    placeholder="Total value of all other imports"
                    min="0"
                    step="1"
                    className="glass-input px-3 py-1.5 text-sm w-56"
                />
                <span className="text-xs text-muted">Leave blank if not applicable</span>
            </div>
        </div>
    );
}
