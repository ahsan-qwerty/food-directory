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

const labelCls = 'block text-sm font-medium text-secondary mb-2';
const inputCls = 'glass-input w-full px-3 py-2';

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
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        Create New Delegation
                    </h1>
                    <p className="text-secondary">
                        Add a new {formData.type === 'INCOMING' ? 'incoming' : 'outgoing'} delegation
                    </p>
                </div>

                <div className="glass-card p-6 md:p-8">
                    {error && (
                        <div className="mb-6 alert-error px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 alert-success px-4 py-3 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Country Fields */}
                        {formData.type === 'INCOMING' ? (
                            <div>
                                <label className={labelCls}>From Country</label>
                                <select
                                    name="fromCountry"
                                    value={formData.fromCountry}
                                    onChange={handleChange}
                                    className={inputCls}
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
                                    <label className={labelCls}>To Country</label>
                                    <select
                                        name="toCountry"
                                        value={formData.toCountry}
                                        onChange={handleChange}
                                        className={inputCls}
                                    >
                                        <option value="">Select country</option>
                                        {COUNTRIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>End Date</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate || undefined}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Product / Sector */}
                        <div>
                            <label className={labelCls}>Product / Sector</label>
                            <input
                                type="text"
                                name="productSector"
                                value={formData.productSector}
                                onChange={handleChange}
                                className={inputCls}
                                placeholder="e.g., Meat, Agro and Livestock Sector, Rice, Sesame Seed"
                            />
                        </div>

                        {/* Expected Delegates */}
                        <div>
                            <label className={labelCls}>Expected Number of Delegates</label>
                            <input
                                type="number"
                                name="expectedDelegates"
                                value={formData.expectedDelegates}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                className={inputCls}
                                placeholder="e.g., 10"
                            />
                        </div>

                        {/* Budget */}
                        <div>
                            <label className={labelCls}>
                                {formData.type === 'INCOMING' ? 'Tentative Expenditure (PKR)' : 'Proposed Budget (PKR)'}
                            </label>
                            <input
                                type="number"
                                name="allocatedBudget"
                                value={formData.allocatedBudget}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={inputCls}
                                placeholder="e.g., 500000, 2500000"
                            />
                        </div>

                        {/* Rationale */}
                        <div>
                            <label className={labelCls}>
                                {formData.type === 'INCOMING' ? 'Rationale / Objectives' : 'Rationale / Justification / Objective'}
                            </label>
                            <textarea
                                name="rationale"
                                value={formData.rationale}
                                onChange={handleChange}
                                rows={4}
                                className={inputCls}
                                placeholder="Enter the rationale, objectives, or justification for this delegation..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn-outline px-6 py-2 text-sm font-semibold"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary px-6 py-2 text-sm font-semibold disabled:opacity-60"
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
            <div className="page-wrapper flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 glass-spinner"></div>
            </div>
        }>
            <CreateDelegationForm />
        </Suspense>
    );
}
