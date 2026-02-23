'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        </div>
    );
}

export default function CreateSeminarPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [sectors, setSectors] = useState([]);

    useEffect(() => {
        fetch('/api/sectors')
            .then((r) => r.json())
            .then((d) => setSectors(d.sectors || []))
            .catch(() => { });
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        productSector: '',
        cityVenue: '',
        tentativeDate: '',
        proposedBudget: '',
        division: '',
        regionalCollaboration: 'To be conducted in collaboration with the relevant TDAP regional Office',
        rationaleObjective: '',
        deskOfficer: '',
        finalRemarks: '',
        status: 'PLANNED',
    });

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
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create seminar');
                return;
            }

            setSuccess('Seminar created successfully! Redirecting…');
            setTimeout(() => router.push(`/seminars/${data.id}`), 1500);
        } catch (err) {
            console.error(err);
            setError('Failed to create seminar');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = 'w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500';
    const textareaCls = `${inputCls} resize-none`;

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">

                {/* Header */}
                <div className="mb-8">
                    <nav className="flex text-sm text-gray-600 mb-4">
                        <Link href="/" className="hover:text-orange-600">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/seminars" className="hover:text-orange-600">Seminars</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">Create</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Add New Seminar / Webinar</h1>
                    <p className="text-gray-600 text-sm">Fill in the planning details from the Excel sheet</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    {error && (
                        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">{error}</div>
                    )}
                    {success && (
                        <div className="mb-5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">{success}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
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

                        {/* Product Sector */}
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

                        {/* City / Venue */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="City / Venue">
                                <input
                                    list="city-suggestions"
                                    type="text"
                                    name="cityVenue"
                                    value={formData.cityVenue}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., Lahore or Research Institute, Faisalabad"
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

                        {/* Budget & Division */}
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

                        {/* Regional Collaboration */}
                        <FormField label="Regional Collaboration">
                            <textarea
                                name="regionalCollaboration"
                                value={formData.regionalCollaboration}
                                onChange={handleChange}
                                rows={2}
                                className={textareaCls}
                                placeholder="e.g., To be conducted in collaboration with the relevant TDAP regional Office"
                            />
                        </FormField>

                        {/* Rationale / Objective */}
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

                        {/* Desk Officer & Status */}
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

                        {/* Final Remarks */}
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

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={loading}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Creating…' : 'Create Seminar'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
