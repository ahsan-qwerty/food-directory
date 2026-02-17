'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateDelegationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        type: 'INCOMING',
        division: '',
        productSector: '',
        expectedDelegates: '',
        rationale: '',
        fromCountry: '',
        toCountry: '',
        dates: '',
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
                division: formData.division || null,
                productSector: formData.productSector || null,
                expectedDelegates: formData.expectedDelegates || null,
                rationale: formData.rationale || null,
                allocatedBudget: formData.allocatedBudget ? Number(formData.allocatedBudget) : null,
            };

            if (formData.type === 'INCOMING') {
                payload.fromCountry = formData.fromCountry || null;
            } else {
                payload.toCountry = formData.toCountry || null;
                payload.dates = formData.dates || null;
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
                        Add a new incoming or outgoing delegation
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
                        {/* Delegation Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delegation Type <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="INCOMING"
                                        checked={formData.type === 'INCOMING'}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-700">Incoming</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="OUTGOING"
                                        checked={formData.type === 'OUTGOING'}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-700">Outgoing</span>
                                </label>
                            </div>
                        </div>

                        {/* Country Fields */}
                        {formData.type === 'INCOMING' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Country
                                </label>
                                <input
                                    type="text"
                                    name="fromCountry"
                                    value={formData.fromCountry}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., Lebanon, Philippines, Malaysia"
                                />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        To Country
                                    </label>
                                    <input
                                        type="text"
                                        name="toCountry"
                                        value={formData.toCountry}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g., Qatar, Sri Lanka, Morocco"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dates
                                    </label>
                                    <input
                                        type="text"
                                        name="dates"
                                        value={formData.dates}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g., to be decided in consultation with the mission"
                                    />
                                </div>
                            </>
                        )}

                        {/* Common Fields */}
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Number of Delegates
                            </label>
                            <input
                                type="text"
                                name="expectedDelegates"
                                value={formData.expectedDelegates}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-gray-950 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 2-4 delegates, 10, 26"
                            />
                        </div>

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
