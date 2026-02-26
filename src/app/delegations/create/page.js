'use client';

import { useState, useEffect, Suspense } from 'react';
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
    const [sectors, setSectors] = useState([]);

    useEffect(() => {
        fetch('/api/sectors')
            .then((r) => r.json())
            .then((data) => setSectors(data.sectors || []))
            .catch(() => { });
    }, []);

    const [formData, setFormData] = useState({
        type: initialType,
        title: '',
        deskOfficer: '',
        sectorIds: [],
        expectedDelegates: '',
        rationale: '',
        fromCountry: '',
        toCountry: '',
        startDate: '',
        endDate: '',
        allocatedBudget: '',
    });

    const toggleSector = (id) => {
        setFormData((prev) => ({
            ...prev,
            sectorIds: prev.sectorIds.includes(id)
                ? prev.sectorIds.filter((x) => x !== id)
                : [...prev.sectorIds, id],
        }));
    };

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
                title: formData.title || null,
                deskOfficer: formData.deskOfficer || null,
                sectorIds: formData.sectorIds,
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

                        {/* Title */}
                        <div>
                            <label className={labelCls}>Delegation Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputCls}
                                placeholder="e.g., Trade Mission to Germany 2026, Rice Export Delegation"
                            />
                            <p className="mt-1 text-xs text-muted">Optional — a short descriptive name for this delegation</p>
                        </div>

                        {/* Desk Officer */}
                        <div>
                            <label className={labelCls}>Desk Officer</label>
                            <input
                                type="text"
                                name="deskOfficer"
                                value={formData.deskOfficer}
                                onChange={handleChange}
                                className={inputCls}
                                placeholder="e.g., Mr. Ahmed Khan"
                            />
                            <p className="mt-1 text-xs text-muted">Optional — name of the officer responsible for this delegation</p>
                        </div>

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

                        {/* Product / Sector — multi-select pills */}
                        <div>
                            <label className={labelCls}>
                                Product / Sector
                                <span className="text-muted font-normal ml-1">(select one or more)</span>
                            </label>
                            {sectors.length === 0 ? (
                                <p className="text-muted text-sm">Loading sectors…</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {sectors.map((s) => {
                                        const selected = formData.sectorIds.includes(s.id);
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => toggleSector(s.id)}
                                                className={
                                                    selected
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
                            {formData.sectorIds.length > 0 && (
                                <p className="text-xs text-muted mt-2">
                                    {formData.sectorIds.length} sector{formData.sectorIds.length > 1 ? 's' : ''} selected
                                </p>
                            )}
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
