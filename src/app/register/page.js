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
        name: '', profile: '', address: '', email: '', website: '',
        representativeName: '', representativeTel: '',
        representativeWhatsapp: '', representativeEmail: '',
        productsToBeDisplayed: '', sectorId: '', subSectorId: '',
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

    useEffect(() => {
        if (formData.sectorId) {
            const selected = subSectors.find(sub => sub.id === parseInt(formData.subSectorId));
            if (selected && selected.sectorId !== parseInt(formData.sectorId)) {
                setFormData(prev => ({ ...prev, subSectorId: '' }));
            }
        }
    }, [formData.sectorId, formData.subSectorId, subSectors]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                    sectorId:    formData.sectorId    ? parseInt(formData.sectorId)    : null,
                    subSectorId: formData.subSectorId ? parseInt(formData.subSectorId) : null,
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormLabel>Main Sector</FormLabel>
                                <select
                                    name="sectorId"
                                    value={formData.sectorId} onChange={handleInputChange}
                                    className="glass-input w-full px-3 py-2"
                                >
                                    <option value="">Select Sector</option>
                                    {sectors.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <FormLabel>Sub-Sector</FormLabel>
                                <select
                                    name="subSectorId"
                                    value={formData.subSectorId} onChange={handleInputChange}
                                    className="glass-input w-full px-3 py-2"
                                >
                                    <option value="">Select Sub-Sector</option>
                                    {subSectors
                                        .filter(ss => !formData.sectorId || ss.sectorId === parseInt(formData.sectorId))
                                        .map(ss => (
                                            <option key={ss.id} value={ss.id}>{ss.name}</option>
                                        ))}
                                </select>
                            </div>
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
