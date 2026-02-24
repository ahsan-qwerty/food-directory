'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [sectors, setSectors]       = useState([]);
    const [subSectors, setSubSectors] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [success, setSuccess]       = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        profile: '',
        address: '',
        email: '',
        website: '',
        representativeName: '',
        representativeTel: '',
        representativeWhatsapp: '',
        representativeEmail: '',
        productsToBeDisplayed: '',
        sectorIds: [],
        subSectorIds: [],
    });

    useEffect(() => {
        Promise.all([fetch('/api/sectors'), fetch('/api/categories')])
            .then(async ([sRes, cRes]) => {
                const sData = await sRes.json();
                const cData = await cRes.json();
                setSectors(sData.sectors || []);
                setSubSectors(cData.subSectors || []);
            })
            .catch(() => setError('Failed to load form data. Please refresh the page.'));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // When sectors change, drop any sub-sectors that no longer belong to a selected sector
    useEffect(() => {
        if (formData.sectorIds.length === 0) return;
        setFormData(prev => ({
            ...prev,
            subSectorIds: prev.subSectorIds.filter(ssId =>
                subSectors.some(ss => ss.id === ssId && prev.sectorIds.includes(ss.sectorId))
            ),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.sectorIds]);

    const toggleSector = (id) => {
        setFormData(prev => ({
            ...prev,
            sectorIds: prev.sectorIds.includes(id)
                ? prev.sectorIds.filter(s => s !== id)
                : [...prev.sectorIds, id],
        }));
    };

    const toggleSubSector = (id) => {
        setFormData(prev => ({
            ...prev,
            subSectorIds: prev.subSectorIds.includes(id)
                ? prev.subSectorIds.filter(s => s !== id)
                : [...prev.subSectorIds, id],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name) {
            setError('Company name is required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    // Send primary (first selected) IDs to the single-FK fields
                    sectorId: formData.sectorIds[0] ?? null,
                    subSectorId: formData.subSectorIds[0] ?? null,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/companies'), 2000);
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch {
            setError('Failed to submit registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-wrapper flex items-center justify-center px-4">
                <div className="glass-card-strong p-10 max-w-md w-full text-center">
                    <div className="text-accent-green text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                    <p className="text-secondary">
                        Your company has been registered. Redirecting to the companies page…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper py-8 px-4">
            <div className="container mx-auto max-w-4xl">

                {/* Header */}
                <div className="glass-card p-6 mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Company Registration</h1>
                    <p className="text-secondary">
                        Register your company in the TDAP Food Division Directory
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="alert-error p-4 mb-6">{error}</div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-8">

                    {/* Basic Information */}
                    <Section title="Basic Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <FormLabel required>Company Name</FormLabel>
                                <input
                                    type="text" name="name"
                                    value={formData.name} onChange={handleInputChange}
                                    className="glass-input w-full px-3 py-2" required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel>Company Profile</FormLabel>
                                <textarea
                                    name="profile" rows="4"
                                    value={formData.profile} onChange={handleInputChange}
                                    placeholder="Describe your company's background, mission, and activities…"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel>Address</FormLabel>
                                <textarea
                                    name="address" rows="2"
                                    value={formData.address} onChange={handleInputChange}
                                    placeholder="Company address…"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>Email</FormLabel>
                                <input
                                    type="email" name="email"
                                    value={formData.email} onChange={handleInputChange}
                                    placeholder="company@example.com"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>Website</FormLabel>
                                <input
                                    type="url" name="website"
                                    value={formData.website} onChange={handleInputChange}
                                    placeholder="https://example.com"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel>Products to be Displayed</FormLabel>
                                <textarea
                                    name="productsToBeDisplayed" rows="3"
                                    value={formData.productsToBeDisplayed} onChange={handleInputChange}
                                    placeholder="List products your company will display (comma separated)"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Business Classification */}
                    <Section title="Business Classification">
                        {/* Sectors — multi-select pills */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Sectors
                                <span className="ml-1 text-xs font-normal text-muted">(select one or more)</span>
                            </label>

                            {sectors.length === 0 ? (
                                <p className="text-sm text-muted italic">Loading sectors…</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {sectors.map(sector => {
                                        const selected = formData.sectorIds.includes(sector.id);
                                        return (
                                            <button
                                                key={sector.id}
                                                type="button"
                                                onClick={() => toggleSector(sector.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${selected
                                                    ? 'bg-green-700 text-white border-green-700'
                                                    : 'bg-white/10 text-secondary border-white/20 hover:border-green-500 hover:text-white'
                                                    }`}
                                            >
                                                {selected && (
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                {sector.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {formData.sectorIds.length > 0 && (
                                <p className="mt-2 text-xs text-accent-green font-medium">
                                    {formData.sectorIds.length} sector{formData.sectorIds.length > 1 ? 's' : ''} selected
                                    {formData.sectorIds.length > 1 && (
                                        <span className="text-muted font-normal"> — first selected is used as primary</span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Sub-Sectors — filtered by all selected sectors */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Sub-Sectors
                                <span className="ml-1 text-xs font-normal text-muted">(select one or more)</span>
                            </label>

                            {formData.sectorIds.length === 0 ? (
                                <p className="text-sm text-muted italic mt-2">Select at least one sector above to see sub-sectors.</p>
                            ) : (
                                (() => {
                                    const filtered = subSectors.filter(ss => formData.sectorIds.includes(ss.sectorId));
                                    return filtered.length === 0 ? (
                                        <p className="text-sm text-muted italic mt-2">No sub-sectors available for the selected sector(s).</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {filtered.map(ss => {
                                                const selected = formData.subSectorIds.includes(ss.id);
                                                return (
                                                    <button
                                                        key={ss.id}
                                                        type="button"
                                                        onClick={() => toggleSubSector(ss.id)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${selected
                                                            ? 'bg-green-600 text-white border-green-600'
                                                            : 'bg-white/10 text-secondary border-white/20 hover:border-green-500 hover:text-white'
                                                            }`}
                                                    >
                                                        {selected && (
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {ss.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })()
                            )}

                            {formData.subSectorIds.length > 0 && (
                                <p className="mt-2 text-xs text-accent-green font-medium">
                                    {formData.subSectorIds.length} sub-sector{formData.subSectorIds.length > 1 ? 's' : ''} selected
                                </p>
                            )}
                        </div>
                    </Section>

                    {/* Contact Person */}
                    <Section title="Contact Person Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormLabel>Representative Name</FormLabel>
                                <input
                                    type="text" name="representativeName"
                                    value={formData.representativeName} onChange={handleInputChange}
                                    placeholder="Contact person name"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>Representative Email</FormLabel>
                                <input
                                    type="email" name="representativeEmail"
                                    value={formData.representativeEmail} onChange={handleInputChange}
                                    placeholder="representative@example.com"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>Phone Number</FormLabel>
                                <input
                                    type="tel" name="representativeTel"
                                    value={formData.representativeTel} onChange={handleInputChange}
                                    placeholder="+92 XXX XXXXXXX"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>WhatsApp Number</FormLabel>
                                <input
                                    type="tel" name="representativeWhatsapp"
                                    value={formData.representativeWhatsapp} onChange={handleInputChange}
                                    placeholder="+92 XXX XXXXXXX"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t glass-divider">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 px-6 py-3"
                        >
                            {loading ? 'Submitting…' : 'Register Company'}
                        </button>
                        <Link
                            href="/companies"
                            className="btn-outline flex-1 px-6 py-3 text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            {children}
        </div>
    );
}

function FormLabel({ children, required }) {
    return (
        <label className="block text-sm font-medium text-secondary mb-2">
            {children}
            {required && <span className="text-red-400 ml-1">*</span>}
        </label>
    );
}
