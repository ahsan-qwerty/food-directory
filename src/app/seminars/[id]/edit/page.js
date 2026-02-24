'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

    const [formData, setFormData] = useState({
        title: '',
        productSector: '',
        cityVenue: '',
        tentativeDate: '',
        proposedBudget: '',
        division: '',
        regionalCollaboration: '',
        rationaleObjective: '',
        deskOfficer: '',
        finalRemarks: '',
        status: 'PLANNED',
    });

    useEffect(() => {
        fetch('/api/sectors')
            .then((r) => r.json())
            .then((d) => setSectors(d.sectors || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!seminarId || Number.isNaN(seminarId)) return;
        fetch(`/api/seminars?id=${seminarId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) { setError(data.error); return; }
                setFormData({
                    title: data.title || '',
                    productSector: data.productSector || '',
                    cityVenue: data.cityVenue || '',
                    tentativeDate: data.tentativeDate || '',
                    proposedBudget: data.proposedBudget != null ? String(data.proposedBudget) : '',
                    division: data.division || '',
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
            const payload = {
                id: seminarId,
                title: formData.title.trim(),
                productSector: formData.productSector || null,
                cityVenue: formData.cityVenue || null,
                tentativeDate: formData.tentativeDate || null,
                proposedBudget: formData.proposedBudget ? Number(formData.proposedBudget) : null,
                division: formData.division || null,
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

                        <FormField label="Product / Sector">
                            <select name="productSector" value={formData.productSector} onChange={handleChange} className={inputCls}>
                                <option value="">Select sector…</option>
                                {sectors.map((s) => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                                <option value="Poultry">Poultry</option>
                                <option value="Dairy Products">Dairy Products</option>
                                <option value="Sesame">Sesame</option>
                                <option value="Rice">Rice</option>
                                <option value="Spices">Spices</option>
                                <option value="Fruits & Vegetables">Fruits &amp; Vegetables</option>
                            </select>
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

                            <FormField label="Division">
                                <input
                                    type="text"
                                    name="division"
                                    value={formData.division}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., Agro & Food"
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
