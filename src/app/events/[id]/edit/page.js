'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const COUNTRY_OPTIONS = [
    'Australia',
    'China',
    'Japan',
    'Lebanon',
    'Malaysia',
    'Morocco',
    'Philippines',
    'Qatar',
    'Saudi Arabia',
    'South Africa',
    'Sri Lanka',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
];

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        division: '',
        name: '',
        startDate: '',
        endDate: '',
        datesText: '',
        region: '',
        country: '',
        city: '',
        sectorProducts: '',
        subsidyPercentage: '',
        tdapCost: '',
        exhibitorCost: '',
        totalEstimatedBudget: '',
        recommendedByJustification: '',
        description: '',
        feedbackFormUrl: '',
        finalRemarks: '',
    });

    const countryOptions = Array.from(
        new Set([...(formData.country ? [formData.country] : []), ...COUNTRY_OPTIONS].filter(Boolean))
    );

    useEffect(() => {
        async function fetchEvent() {
            if (!eventId) return;

            try {
                const res = await fetch(`/api/events?id=${eventId}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Failed to load event');
                    return;
                }

                const toDateInput = (v) => {
                    if (!v) return '';
                    const d = new Date(v);
                    if (Number.isNaN(d.getTime())) return '';
                    return d.toISOString().slice(0, 10);
                };

                setFormData({
                    division: data.division || '',
                    name: data.name || '',
                    startDate: toDateInput(data.startDate || data.eventDate),
                    endDate: toDateInput(data.endDate),
                    datesText: data.datesText || '',
                    region: data.region || '',
                    country: data.country || '',
                    city: data.city || '',
                    sectorProducts: data.sectorProducts || '',
                    subsidyPercentage: data.subsidyPercentage != null ? String(data.subsidyPercentage) : '',
                    tdapCost: data.tdapCost != null ? String(data.tdapCost) : '',
                    exhibitorCost: data.exhibitorCost != null ? String(data.exhibitorCost) : '',
                    totalEstimatedBudget: data.totalEstimatedBudget != null ? String(data.totalEstimatedBudget) : '',
                    recommendedByJustification: data.recommendedByJustification || '',
                    description: data.description || '',
                    feedbackFormUrl: data.feedbackFormUrl || '',
                    finalRemarks: data.finalRemarks || '',
                });
            } catch (err) {
                console.error('Error fetching event:', err);
                setError('Failed to load event');
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                id: parseInt(eventId),
                name: formData.name,
                division: formData.division || null,
                // eventDate is required by schema; use startDate as canonical
                eventDate: formData.startDate || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                datesText: formData.datesText || null,
                region: formData.region || null,
                country: formData.country || null,
                city: formData.city || null,
                sectorProducts: formData.sectorProducts || null,
                subsidyPercentage: formData.subsidyPercentage || null,
                tdapCost: formData.tdapCost || null,
                exhibitorCost: formData.exhibitorCost || null,
                totalEstimatedBudget: formData.totalEstimatedBudget || null,
                recommendedByJustification: formData.recommendedByJustification || null,
                description: formData.description || null,
                feedbackFormUrl: formData.feedbackFormUrl || null,
                finalRemarks: formData.finalRemarks || null,
            };

            const res = await fetch('/api/events', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to update event');
                return;
            }

            setSuccess('Event updated successfully! Redirecting...');
            setTimeout(() => {
                router.push(`/events/${eventId}`);
            }, 1500);
        } catch (err) {
            console.error('Error updating event:', err);
            setError('Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                    <p className="mt-4 text-gray-600">Loading event...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Edit Exhibition / Event
                    </h1>
                    <p className="text-gray-600">
                        Update Excel planning fields
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    {error && (
                        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Division
                            </label>
                            <input
                                type="text"
                                name="division"
                                value={formData.division}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Agro & Food"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Exhibition Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Gulfood 2024, Food & Hospitality Expo"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dates <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Optional: keep the exact Excel date string.
                            </p>
                            <input
                                type="text"
                                name="datesText"
                                value={formData.datesText}
                                onChange={handleChange}
                                className="w-full mt-2 px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 08-11 September 2025"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Region
                                </label>
                                <input
                                    type="text"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., Oceania"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select Country</option>
                                    {countryOptions.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., Sydney"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sector / Products
                            </label>
                            <input
                                type="text"
                                name="sectorProducts"
                                value={formData.sectorProducts}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Agro & Food Products"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subsidy %age
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="subsidyPercentage"
                                    value={formData.subsidyPercentage}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    TDAP Cost (Rs.)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="tdapCost"
                                    value={formData.tdapCost}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exhibitor Cost (Rs.)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="exhibitorCost"
                                    value={formData.exhibitorCost}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Estimated Budget (Rs.)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="totalEstimatedBudget"
                                    value={formData.totalEstimatedBudget}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recommended by / Justification
                            </label>
                            <textarea
                                name="recommendedByJustification"
                                value={formData.recommendedByJustification}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes / Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Feedback Form URL
                            </label>
                            <input
                                type="url"
                                name="feedbackFormUrl"
                                value={formData.feedbackFormUrl}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="https://forms.example.com/feedback"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Final Remarks
                            </label>
                            <textarea
                                name="finalRemarks"
                                value={formData.finalRemarks}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Add any final remarks or notes about the event..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-60"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
