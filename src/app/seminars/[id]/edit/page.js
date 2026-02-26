'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const VALID_TYPES = ['SEMINAR', 'WEBINAR', 'VIRTUAL_B2B'];

const PAKISTAN_CITIES = [
    'Bahawalpur', 'Faisalabad', 'Gujranwala', 'Hyderabad', 'Islamabad',
    'Karachi', 'Lahore', 'Multan', 'Peshawar', 'Quetta', 'Rawalpindi',
    'Sialkot', 'Sukkur',
];

const MONTH_YEAR_SUGGESTIONS = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const results = [];
    for (let y = 25; y <= 27; y++) {
        for (const m of months) results.push(`${m}-${y}`);
    }
    return results;
})();

function FormField({ label, required, hint, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
        </div>
    );
}

export default function EditSeminarPage() {
    const router = useRouter();
    const params = useParams();
    const seminarId = Number(params?.id);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [sectors, setSectors] = useState([]);
    const [selectedSectorIds, setSelectedSectorIds] = useState([]);

    const toggleSector = (id) =>
        setSelectedSectorIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const [formData, setFormData] = useState({
        type: 'SEMINAR',
        title: '',
        cityVenue: '',
        tentativeDate: '',
        proposedBudget: '',
        regionalCollaboration: '',
        rationaleObjective: '',
        deskOfficer: '',
        finalRemarks: '',
        status: 'PLANNED',
    });

    // Track the raw productSector string until sectors list is ready
    const [rawProductSector, setRawProductSector] = useState('');

    useEffect(() => {
        fetch('/api/sectors')
            .then((r) => r.json())
            .then((d) => setSectors(d.sectors || []))
            .catch(() => { });
    }, []);

    // Once sectors list arrives, resolve the saved names → IDs
    useEffect(() => {
        if (sectors.length === 0 || !rawProductSector) return;
        const savedNames = rawProductSector.split(',').map((n) => n.trim().toLowerCase());
        const matched = sectors
            .filter((s) => savedNames.includes(s.name.toLowerCase()))
            .map((s) => s.id);
        setSelectedSectorIds(matched);
    }, [sectors, rawProductSector]);

    useEffect(() => {
        if (!seminarId || Number.isNaN(seminarId)) return;
        fetch(`/api/seminars?id=${seminarId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) { setError(data.error); return; }
                setRawProductSector(data.productSector || '');
                setFormData({
                    type: VALID_TYPES.includes(data.type) ? data.type : 'SEMINAR',
                    title: data.title || '',
                    cityVenue: data.cityVenue || '',
                    tentativeDate: data.tentativeDate || '',
                    proposedBudget: data.proposedBudget != null ? String(data.proposedBudget) : '',
                    regionalCollaboration: data.regionalCollaboration || '',
                    rationaleObjective: data.rationaleObjective || '',
                    deskOfficer: data.deskOfficer || '',
                    finalRemarks: data.finalRemarks || '',
                    status: data.status || 'PLANNED',
                });
            })
            .catch(() => setError('Failed to load seminar'))
            .finally(() => setFetching(false));
    }, [seminarId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const selectedSectorNames = sectors
                .filter((s) => selectedSectorIds.includes(s.id))
                .map((s) => s.name);

            const payload = {
                id: seminarId,
                type: formData.type,
                title: formData.title.trim(),
                productSector: selectedSectorNames.length > 0 ? selectedSectorNames.join(', ') : null,
                cityVenue: formData.cityVenue || null,
                tentativeDate: formData.tentativeDate || null,
                proposedBudget: formData.proposedBudget ? Number(formData.proposedBudget) : null,
                regionalCollaboration: formData.regionalCollaboration || null,
                rationaleObjective: formData.rationaleObjective || null,
                deskOfficer: formData.deskOfficer || null,
                finalRemarks: formData.finalRemarks || null,
                status: formData.status,
            };

            const res = await fetch('/api/seminars', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to update seminar');
                return;
            }

            setSuccess('Seminar updated successfully! Redirecting…');
            setTimeout(() => router.push(`/seminars/${seminarId}`), 1500);
        } catch (err) {
            console.error(err);
            setError('Failed to update seminar');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = 'glass-input w-full px-3 py-2';
    const textareaCls = `${inputCls} resize-none`;

    if (fetching) {
        return (
            <div className="page-wrapper flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner" />
            </div>
        );
    }

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">

                {/* Header */}
                <div className="mb-8">
                    <nav className="flex text-sm text-secondary mb-4">
                        <Link href="/" className="breadcrumb-link">Home</Link>
                        <span className="mx-2 text-muted">/</span>
                        <Link href="/seminars" className="breadcrumb-link">Seminars</Link>
                        <span className="mx-2 text-muted">/</span>
                        <Link href={`/seminars/${seminarId}`} className="breadcrumb-link">Details</Link>
                        <span className="mx-2 text-muted">/</span>
                        <span className="text-white">Edit</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-white mb-1">Edit Seminar</h1>
                    <p className="text-secondary text-sm">Update the seminar planning details</p>
                </div>

                <div className="glass-card p-6 md:p-8">
                    {error && (
                        <div className="mb-5 alert-error px-4 py-3 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="mb-5 alert-success px-4 py-3 text-sm">{success}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <FormField label="Type">
                            <select name="type" value={formData.type} onChange={handleChange} className={inputCls}>
                                <option value="SEMINAR">Seminar</option>
                                <option value="WEBINAR">Webinar</option>
                                <option value="VIRTUAL_B2B">Virtual B2B</option>
                            </select>
                        </FormField>

                        <FormField label="Event Title / Details" required>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputCls}
                                placeholder="e.g., Global Market Access for Pakistan's Poultry Exports"
                                required
                            />
                        </FormField>

                        {/* Product Sector — multi-select pills */}
                        <FormField
                            label="Product / Sector"
                            hint={selectedSectorIds.length > 0
                                ? `${selectedSectorIds.length} sector${selectedSectorIds.length > 1 ? 's' : ''} selected`
                                : 'Select one or more sectors'}
                        >
                            {sectors.length === 0 ? (
                                <p className="text-muted text-sm">Loading sectors…</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {sectors.map((s) => {
                                        const active = selectedSectorIds.includes(s.id);
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => toggleSector(s.id)}
                                                className={
                                                    active
                                                        ? 'badge-green cursor-pointer text-sm px-3 py-1'
                                                        : 'px-3 py-1 text-sm rounded-full border border-white/20 text-secondary hover:border-white/40 hover:text-white transition-all cursor-pointer'
                                                }
                                            >
                                                {s.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="City / Venue">
                                <input
                                    list="city-suggestions"
                                    type="text"
                                    name="cityVenue"
                                    value={formData.cityVenue}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., Lahore"
                                />
                                <datalist id="city-suggestions">
                                    {PAKISTAN_CITIES.map((c) => <option key={c} value={c} />)}
                                </datalist>
                            </FormField>

                            <FormField label="Tentative Date" hint='e.g. "Aug-25", "Mar-26"'>
                                <input
                                    list="date-suggestions"
                                    type="text"
                                    name="tentativeDate"
                                    value={formData.tentativeDate}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., Aug-25"
                                />
                                <datalist id="date-suggestions">
                                    {MONTH_YEAR_SUGGESTIONS.map((d) => <option key={d} value={d} />)}
                                </datalist>
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Proposed Budget (PKR)">
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    name="proposedBudget"
                                    value={formData.proposedBudget}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., 250000"
                                />
                            </FormField>
                        </div>

                        <FormField label="Regional Collaboration">
                            <textarea
                                name="regionalCollaboration"
                                value={formData.regionalCollaboration}
                                onChange={handleChange}
                                rows={2}
                                className={textareaCls}
                            />
                        </FormField>

                        <FormField label="Rationale / Objective">
                            <textarea
                                name="rationaleObjective"
                                value={formData.rationaleObjective}
                                onChange={handleChange}
                                rows={4}
                                className={textareaCls}
                                placeholder="Describe the rationale or objectives of this seminar…"
                            />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Desk Officer">
                                <input
                                    type="text"
                                    name="deskOfficer"
                                    value={formData.deskOfficer}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., Mr. Ahmed"
                                />
                            </FormField>

                            <FormField label="Status">
                                <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
                                    <option value="PLANNED">Planned</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </FormField>
                        </div>

                        <FormField label="Final Remarks">
                            <textarea
                                name="finalRemarks"
                                value={formData.finalRemarks}
                                onChange={handleChange}
                                rows={3}
                                className={textareaCls}
                                placeholder="Any closing notes after the seminar…"
                            />
                        </FormField>

                        <div className="flex gap-4 pt-2 border-t glass-divider">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={loading}
                                className="btn-outline px-6 py-2 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
