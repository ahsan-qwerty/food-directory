'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const COUNTRY_CITIES = {
    Australia: ['Adelaide', 'Brisbane', 'Melbourne', 'Perth', 'Sydney'],
    Bangladesh: ['Chittagong', 'Dhaka'],
    Brazil: ['Brasília', 'Rio de Janeiro', 'São Paulo'],
    Canada: ['Calgary', 'Montreal', 'Ottawa', 'Toronto', 'Vancouver'],
    China: ['Beijing', 'Chengdu', 'Guangzhou', 'Shanghai', 'Shenzhen'],
    Egypt: ['Alexandria', 'Cairo'],
    France: ['Lyon', 'Marseille', 'Nice', 'Paris'],
    Germany: ['Berlin', 'Cologne', 'Düsseldorf', 'Frankfurt', 'Hamburg', 'Munich'],
    Japan: ['Nagoya', 'Osaka', 'Tokyo', 'Yokohama'],
    Lebanon: ['Beirut', 'Tripoli'],
    Malaysia: ['Johor Bahru', 'Kuala Lumpur', 'Penang'],
    Morocco: ['Casablanca', 'Marrakech', 'Rabat'],
    Oman: ['Muscat', 'Salalah'],
    Philippines: ['Cebu', 'Davao', 'Manila'],
    Qatar: ['Al Wakrah', 'Doha'],
    'Saudi Arabia': ['Dammam', 'Jeddah', 'Mecca', 'Medina', 'Riyadh'],
    'South Africa': ['Cape Town', 'Durban', 'Johannesburg', 'Pretoria'],
    'South Korea': ['Busan', 'Incheon', 'Seoul'],
    'Sri Lanka': ['Colombo', 'Kandy'],
    'United Arab Emirates': ['Abu Dhabi', 'Dubai', 'Sharjah'],
    'United Kingdom': ['Birmingham', 'Edinburgh', 'London', 'Manchester'],
    'United States': ['Chicago', 'Dallas', 'Houston', 'Los Angeles', 'New York', 'San Francisco'],
};

const COUNTRY_OPTIONS = Object.keys(COUNTRY_CITIES).sort();

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        deskOfficer: '',
        startDate: '',
        endDate: '',
        region: '',
        country: '',
        city: '',
        sectorProducts: '',
        tdapCost: '',
        exhibitorCost: '',
        totalEstimatedBudget: '',
        recommendedByJustification: '',
        finalRemarks: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Reset city when country changes
            ...(name === 'country' ? { city: '' } : {}),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                name: formData.name,
                deskOfficer: formData.deskOfficer || null,
                // Event schema still requires eventDate; we use startDate as the canonical date
                eventDate: formData.startDate || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                region: formData.region || null,
                country: formData.country || null,
                city: formData.city || null,
                sectorProducts: formData.sectorProducts || null,
                tdapCost: formData.tdapCost || null,
                exhibitorCost: formData.exhibitorCost || null,
                totalEstimatedBudget: formData.totalEstimatedBudget || null,
                recommendedByJustification: formData.recommendedByJustification || null,
                finalRemarks: formData.finalRemarks || null,
            };

            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to create event');
                return;
            }

            setSuccess('Event created successfully! Redirecting...');
            setTimeout(() => {
                router.push(`/events/${data.id}`);
            }, 1500);
        } catch (err) {
            console.error('Error creating event:', err);
            setError('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Create New Exhibition / Event
                    </h1>
                    <p className="text-gray-600">
                        Add an event using the same fields as the Excel planning sheet
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
                                Exhibition Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Fine Food, Australia"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Desk Officer
                            </label>
                            <input
                                type="text"
                                name="deskOfficer"
                                value={formData.deskOfficer}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Mr. Ahmed"
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
                                    {COUNTRY_OPTIONS.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                </label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!formData.country}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    <option value="">{formData.country ? 'Select City' : 'Select country first'}</option>
                                    {(COUNTRY_CITIES[formData.country] || []).map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    placeholder="e.g., 12600000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Participation Fee
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="exhibitorCost"
                                    value={formData.exhibitorCost}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., 8400000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estimated Budget (Rs.)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="totalEstimatedBudget"
                                    value={formData.totalEstimatedBudget}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., 21000000"
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
                                placeholder="e.g., Regular Event."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-60"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
