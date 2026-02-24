'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditCompanyPage() {
    const router = useRouter();
    const params = useParams();
    const companyId = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [sectors, setSectors] = useState([]);
    const [subSectors, setSubSectors] = useState([]);

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

    // Load company + lookup data
    useEffect(() => {
        if (!companyId) return;
        Promise.all([
            fetch(`/api/companies?id=${companyId}`),
            fetch('/api/sectors'),
            fetch('/api/categories'),
        ])
            .then(async ([cRes, sRes, ssRes]) => {
                if (!cRes.ok) throw new Error('Company not found');
                const [cData, sData, ssData] = await Promise.all([
                    cRes.json(), sRes.json(), ssRes.json(),
                ]);
                const c = cData.company;
                setFormData({
                    name: c.name || '',
                    profile: c.profile || '',
                    address: c.address || '',
                    email: c.email || '',
                    website: c.website || '',
                    representativeName: c.representativeName || '',
                    representativeTel: c.representativeTel || '',
                    representativeWhatsapp: c.representativeWhatsapp || '',
                    representativeEmail: c.representativeEmail || '',
                    productsToBeDisplayed: c.productsToBeDisplayed || '',
                    sectorIds: c.sectorIds || (c.sectorId ? [c.sectorId] : []),
                    subSectorIds: c.subSectorIds || (c.subSectorId ? [c.subSectorId] : []),
                });
                setSectors(sData.sectors || []);
                setSubSectors(ssData.subSectors || []);
            })
            .catch(err => setError(err.message || 'Failed to load company'))
            .finally(() => setLoading(false));
    }, [companyId]);

    // Drop sub-sectors that no longer belong to selected sectors
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSector = (id) =>
        setFormData(prev => ({
            ...prev,
            sectorIds: prev.sectorIds.includes(id)
                ? prev.sectorIds.filter(s => s !== id)
                : [...prev.sectorIds, id],
        }));

    const toggleSubSector = (id) =>
        setFormData(prev => ({
            ...prev,
            subSectorIds: prev.subSectorIds.includes(id)
                ? prev.subSectorIds.filter(s => s !== id)
                : [...prev.subSectorIds, id],
        }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { setError('Company name is required'); return; }
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch('/api/companies', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: Number(companyId), ...formData }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to update company'); return; }
            setSuccess('Company updated successfully!');
            setTimeout(() => router.push(`/companies/${companyId}`), 1200);
        } catch {
            setError('Failed to update company');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-wrapper flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner mb-4" />
                    <p className="text-secondary">Loading company…</p>
                </div>
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="page-wrapper flex items-center justify-center px-4">
                <div className="glass-card p-10 text-center max-w-md w-full">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Link href="/companies" className="btn-primary px-6 py-2 inline-block">Back to Companies</Link>
                </div>
            </div>
        );
    }

    const filteredSubSectors = subSectors.filter(ss => formData.sectorIds.includes(ss.sectorId));

    return (
        <div className="page-wrapper py-8 px-4">
            <div className="container mx-auto max-w-4xl">

                {/* Breadcrumb */}
                <nav className="flex text-sm text-secondary mb-6 flex-wrap gap-1">
                    <Link href="/" className="breadcrumb-link">Home</Link>
                    <span className="mx-2 text-muted">/</span>
                    <Link href="/companies" className="breadcrumb-link">Companies</Link>
                    <span className="mx-2 text-muted">/</span>
                    <Link href={`/companies/${companyId}`} className="breadcrumb-link">{formData.name || `Company #${companyId}`}</Link>
                    <span className="mx-2 text-muted">/</span>
                    <span className="text-white">Edit</span>
                </nav>

                {/* Header */}
                <div className="glass-card p-6 mb-6">
                    <h1 className="text-3xl font-bold text-white mb-1">Edit Company</h1>
                    <p className="text-secondary text-sm">Update the details for this company.</p>
                </div>

                {error && <div className="alert-error p-4 mb-6">{error}</div>}
                {success && <div className="alert-success p-4 mb-6">{success}</div>}

                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-8">

                    {/* Basic Information */}
                    <Section title="Basic Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <FormLabel required>Company Name</FormLabel>
                                <input
                                    type="text" name="name"
                                    value={formData.name} onChange={handleChange}
                                    className="glass-input w-full px-3 py-2" required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel>Company Profile</FormLabel>
                                <textarea
                                    name="profile" rows={4}
                                    value={formData.profile} onChange={handleChange}
                                    placeholder="Describe your company's background, mission, and activities…"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel>Address</FormLabel>
                                <textarea
                                    name="address" rows={2}
                                    value={formData.address} onChange={handleChange}
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>Email</FormLabel>
                                <input
                                    type="email" name="email"
                                    value={formData.email} onChange={handleChange}
                                    placeholder="company@example.com"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>Website</FormLabel>
                                <input
                                    type="url" name="website"
                                    value={formData.website} onChange={handleChange}
                                    placeholder="https://example.com"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel>Products to be Displayed</FormLabel>
                                <textarea
                                    name="productsToBeDisplayed" rows={3}
                                    value={formData.productsToBeDisplayed} onChange={handleChange}
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Business Classification */}
                    <Section title="Business Classification">
                        {/* Sectors */}
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
                                                key={sector.id} type="button"
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

                        {/* Sub-Sectors */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Sub-Sectors
                                <span className="ml-1 text-xs font-normal text-muted">(select one or more)</span>
                            </label>
                            {formData.sectorIds.length === 0 ? (
                                <p className="text-sm text-muted italic mt-2">Select at least one sector above to see sub-sectors.</p>
                            ) : filteredSubSectors.length === 0 ? (
                                <p className="text-sm text-muted italic mt-2">No sub-sectors available for the selected sector(s).</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {filteredSubSectors.map(ss => {
                                        const selected = formData.subSectorIds.includes(ss.id);
                                        return (
                                            <button
                                                key={ss.id} type="button"
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
                                    value={formData.representativeName} onChange={handleChange}
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>Representative Email</FormLabel>
                                <input
                                    type="email" name="representativeEmail"
                                    value={formData.representativeEmail} onChange={handleChange}
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>Phone Number</FormLabel>
                                <input
                                    type="tel" name="representativeTel"
                                    value={formData.representativeTel} onChange={handleChange}
                                    placeholder="+92 XXX XXXXXXX"
                                    className="glass-input w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <FormLabel>WhatsApp Number</FormLabel>
                                <input
                                    type="tel" name="representativeWhatsapp"
                                    value={formData.representativeWhatsapp} onChange={handleChange}
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
                            disabled={saving}
                            className="btn-primary flex-1 px-6 py-3 disabled:opacity-60"
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                        <Link
                            href={`/companies/${companyId}`}
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
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b glass-divider">{title}</h2>
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
