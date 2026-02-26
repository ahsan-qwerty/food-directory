'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

export default function EditDelegationPage() {
    const router = useRouter();
    const params = useParams();
    const delegationId = Number(params?.id);

    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [delegationType, setDelegationType] = useState('INCOMING'); // read-only display
    const [sectors, setSectors] = useState([]);
    const [selectedSectorIds, setSelectedSectorIds] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        fromCountry: '',
        toCountry: '',
        startDate: '',
        endDate: '',
        expectedDelegates: '',
        allocatedBudget: '',
        rationale: '',
    });

    const toggleSector = (id) =>
        setSelectedSectorIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    // Load sectors list
    useEffect(() => {
        fetch('/api/sectors')
            .then((r) => r.json())
            .then((d) => setSectors(d.sectors || []))
            .catch(() => { });
    }, []);

    // Load existing delegation data
    useEffect(() => {
        if (!delegationId || Number.isNaN(delegationId)) return;
        fetch(`/api/delegations?id=${delegationId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) { setError(data.error); return; }
                setDelegationType(data.type || 'INCOMING');
                setSelectedSectorIds(data.sectorIds || []);
                setFormData({
                    title: data.title || '',
                    fromCountry: data.fromCountry || '',
                    toCountry: data.toCountry || '',
                    startDate: data.startDate
                        ? new Date(data.startDate).toISOString().slice(0, 10)
                        : '',
                    endDate: data.endDate
                        ? new Date(data.endDate).toISOString().slice(0, 10)
                        : '',
                    expectedDelegates: data.expectedDelegates || '',
                    allocatedBudget: data.allocatedBudget != null
                        ? String(data.allocatedBudget)
                        : '',
                    rationale: data.rationale || '',
                });
            })
            .catch(() => setError('Failed to load delegation'))
            .finally(() => setFetching(false));
    }, [delegationId]);

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
                id: delegationId,
                title: formData.title || null,
                sectorIds: selectedSectorIds,
                expectedDelegates: formData.expectedDelegates
                    ? String(formData.expectedDelegates)
                    : null,
                allocatedBudget: formData.allocatedBudget
                    ? Number(formData.allocatedBudget)
                    : null,
                rationale: formData.rationale || null,
            };

            if (delegationType === 'INCOMING') {
                payload.fromCountry = formData.fromCountry || null;
            } else {
                payload.toCountry = formData.toCountry || null;
                payload.startDate = formData.startDate || null;
                payload.endDate = formData.endDate || null;
            }

            const res = await fetch('/api/delegations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to update delegation');
                return;
            }

            setSuccess('Delegation updated successfully! Redirecting…');
            setTimeout(() => router.push(`/delegations/${delegationId}`), 1500);
        } catch (err) {
            console.error(err);
            setError('Failed to update delegation');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="page-wrapper flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner"></div>
            </div>
        );
    }

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">

                {/* Breadcrumb */}
                <nav className="flex text-sm text-secondary mb-6 flex-wrap gap-1">
                    <Link href="/" className="breadcrumb-link">Home</Link>
                    <span className="mx-2 text-muted">/</span>
                    <Link href="/delegations" className="breadcrumb-link">Delegations</Link>
                    <span className="mx-2 text-muted">/</span>
                    <Link href={`/delegations/${delegationId}`} className="breadcrumb-link">
                        {formData.title || `Delegation #${delegationId}`}
                    </Link>
                    <span className="mx-2 text-muted">/</span>
                    <span className="text-white">Edit</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        Edit Delegation
                    </h1>
                    <p className="text-secondary">
                        Update details for this{' '}
                        <span className="text-white font-medium">
                            {delegationType === 'INCOMING' ? 'Incoming' : 'Outgoing'}
                        </span>{' '}
                        delegation
                        <span className="ml-2 text-xs text-muted">(type cannot be changed)</span>
                    </p>
                </div>

                <div className="glass-card p-6 md:p-8">
                    {error && (
                        <div className="mb-6 alert-error px-4 py-3 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="mb-6 alert-success px-4 py-3 text-sm">{success}</div>
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
                                placeholder="e.g., Trade Mission to Germany 2026"
                            />
                            <p className="mt-1 text-xs text-muted">Optional — a short descriptive name</p>
                        </div>

                        {/* Country fields — depends on type */}
                        {delegationType === 'INCOMING' ? (
                            <div>
                                <label className={labelCls}>From Country</label>
                                <select
                                    name="fromCountry"
                                    value={formData.fromCountry}
                                    onChange={handleChange}
                                    className={inputCls}
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map((c) => (
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
                                        {COUNTRIES.map((c) => (
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
                            {selectedSectorIds.length > 0 && (
                                <p className="text-xs text-muted mt-2">
                                    {selectedSectorIds.length} sector{selectedSectorIds.length > 1 ? 's' : ''} selected
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
                                {delegationType === 'INCOMING'
                                    ? 'Tentative Expenditure (PKR)'
                                    : 'Proposed Budget (PKR)'}
                            </label>
                            <input
                                type="number"
                                name="allocatedBudget"
                                value={formData.allocatedBudget}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={inputCls}
                                placeholder="e.g., 500000"
                            />
                        </div>

                        {/* Rationale */}
                        <div>
                            <label className={labelCls}>
                                {delegationType === 'INCOMING'
                                    ? 'Rationale / Objectives'
                                    : 'Rationale / Justification / Objective'}
                            </label>
                            <textarea
                                name="rationale"
                                value={formData.rationale}
                                onChange={handleChange}
                                rows={4}
                                className={inputCls}
                                placeholder="Enter the rationale, objectives, or justification…"
                            />
                        </div>

                        {/* Divider */}
                        <div className="border-t glass-divider" />

                        <div className="flex gap-4 pt-2">
                            <Link
                                href={`/delegations/${delegationId}`}
                                className="btn-outline px-6 py-2 text-sm font-semibold"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-primary px-6 py-2 text-sm font-semibold disabled:opacity-60"
                                disabled={loading}
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
