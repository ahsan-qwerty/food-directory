'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia',
    'Bosnia and Herzegovina', 'Brazil', 'Brunei', 'Bulgaria', 'Cambodia', 'Cameroon',
    'Canada', 'Chile', 'China', 'Colombia', 'Congo', 'Croatia', 'Cuba', 'Cyprus',
    'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 'Ethiopia', 'Finland', 'France',
    'Georgia', 'Germany', 'Ghana', 'Greece', 'Hungary', 'India', 'Indonesia', 'Iran',
    'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
    'Kuwait', 'Kyrgyzstan', 'Lebanon', 'Libya', 'Malaysia', 'Maldives', 'Mali',
    'Mauritania', 'Mexico', 'Morocco', 'Mozambique', 'Myanmar', 'Nepal', 'Netherlands',
    'New Zealand', 'Nigeria', 'North Korea', 'Norway', 'Oman', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Sierra Leone', 'Singapore', 'Somalia', 'South Africa', 'South Korea', 'Spain',
    'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Tajikistan', 'Tanzania',
    'Thailand', 'Tunisia', 'Turkey', 'Turkmenistan', 'UAE', 'Uganda', 'UK',
    'Ukraine', 'USA', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

function CreateDelegationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialType = searchParams.get('type') === 'OUTGOING' ? 'OUTGOING' : 'INCOMING';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        type: initialType,
        productSector: '',
        expectedDelegates: '',
        rationale: '',
        fromCountry: '',
        toCountry: '',
        startDate: '',
        endDate: '',
        allocatedBudget: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                type: formData.type,
                productSector: formData.productSector || null,
                expectedDelegates: formData.expectedDelegates ? String(formData.expectedDelegates) : null,
                rationale: formData.rationale || null,
                allocatedBudget: formData.allocatedBudget ? Number(formData.allocatedBudget) : null,
            };

            if (formData.type === 'INCOMING') {
                payload.fromCountry = formData.fromCountry || null;
            } else {
                payload.toCountry = formData.toCountry || null;
                payload.startDate = formData.startDate || null;
                payload.endDate = formData.endDate || null;
            }

            const res = await fetch('/api/delegations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create delegation');
                return;
            }

            setSuccess('Delegation created successfully! Redirecting...');
            setTimeout(() => {
                router.push(`/delegations/${data.id}`);
            }, 1500);
        } catch (err) {
            console.error('Error creating delegation:', err);
            setError('Failed to create delegation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Create New Delegation
                    </h1>
                    <p className="text-gray-600">
                        Add a new {formData.type === 'INCOMING' ? 'incoming' : 'outgoing'} delegation
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

                        {/* Country Fields */}
                        {formData.type === 'INCOMING' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Country
                                </label>
                                <select
                                    name="fromCountry"
                                    value={formData.fromCountry}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        To Country
                                    </label>
                                    <select
                                        name="toCountry"
                                        value={formData.toCountry}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select country</option>
                                        {COUNTRIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate || undefined}
                                            className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Product / Sector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product / Sector
                            </label>
                            <input
                                type="text"
                                name="productSector"
                                value={formData.productSector}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Meat, Agro and Livestock Sector, Rice, Sesame Seed"
                            />
                        </div>

                        {/* Expected Delegates */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Number of Delegates
                            </label>
                            <input
                                type="number"
                                name="expectedDelegates"
                                value={formData.expectedDelegates}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 10"
                            />
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {formData.type === 'INCOMING' ? 'Tentative Expenditure (PKR)' : 'Proposed Budget (PKR)'}
                            </label>
                            <input
                                type="number"
                                name="allocatedBudget"
                                value={formData.allocatedBudget}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 500000, 2500000"
                            />
                        </div>

                        {/* Rationale */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {formData.type === 'INCOMING' ? 'Rationale / Objectives' : 'Rationale / Justification / Objective'}
                            </label>
                            <textarea
                                name="rationale"
                                value={formData.rationale}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter the rationale, objectives, or justification for this delegation..."
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
                                {loading ? 'Creating...' : 'Create Delegation'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default function CreateDelegationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        }>
            <CreateDelegationForm />
        </Suspense>
    );
}
