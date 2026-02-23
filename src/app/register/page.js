'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [sectors, setSectors] = useState([]);
    const [subSectors, setSubSectors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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

    // Fetch sectors, sub-sectors, and products on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const [sectorsRes, categoriesRes] = await Promise.all([
                    fetch('/api/sectors'),
                    fetch('/api/categories'),
                ]);

                const sectorsData = await sectorsRes.json();
                const subSectorsData = await categoriesRes.json();

                setSectors(sectorsData.sectors);
                setSubSectors(subSectorsData.subSectors);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load form data. Please refresh the page.');
            }
        }
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

        // Validation
        if (!formData.name) {
            setError('Company name is required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                setTimeout(() => {
                    router.push('/companies');
                }, 2000);
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to submit registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                    <div className="text-green-600 text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-4">
                        Your company has been registered successfully. Redirecting to companies page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Registration</h1>
                    <p className="text-gray-600">
                        Register your company in the TDAP Food Division Directory
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Profile
                                </label>
                                <textarea
                                    name="profile"
                                    value={formData.profile}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Describe your company's background, mission, and activities..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Company address..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="company@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Products to be Displayed
                                </label>
                                <textarea
                                    name="productsToBeDisplayed"
                                    value={formData.productsToBeDisplayed}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="List products your company will display (comma separated)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Classification */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Business Classification</h2>

                        {/* Sectors — multi-select pills */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sectors
                                <span className="ml-1 text-xs font-normal text-gray-500">(select one or more)</span>
                            </label>

                            {sectors.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">Loading sectors…</p>
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
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700'
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
                                <p className="mt-2 text-xs text-green-700 font-medium">
                                    {formData.sectorIds.length} sector{formData.sectorIds.length > 1 ? 's' : ''} selected
                                    {formData.sectorIds.length > 1 && (
                                        <span className="text-gray-500 font-normal"> — first selected is used as primary</span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Sub-Sectors — filtered by all selected sectors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub-Sectors
                                <span className="ml-1 text-xs font-normal text-gray-500">(select one or more)</span>
                            </label>

                            {formData.sectorIds.length === 0 ? (
                                <p className="text-sm text-gray-400 italic mt-2">Select at least one sector above to see sub-sectors.</p>
                            ) : (
                                (() => {
                                    const filtered = subSectors.filter(ss => formData.sectorIds.includes(ss.sectorId));
                                    return filtered.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic mt-2">No sub-sectors available for the selected sector(s).</p>
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
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700'
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
                                <p className="mt-2 text-xs text-green-700 font-medium">
                                    {formData.subSectorIds.length} sub-sector{formData.subSectorIds.length > 1 ? 's' : ''} selected
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contact Person Information */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Person Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Representative Name
                                </label>
                                <input
                                    type="text"
                                    name="representativeName"
                                    value={formData.representativeName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Contact person name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Representative Email
                                </label>
                                <input
                                    type="email"
                                    name="representativeEmail"
                                    value={formData.representativeEmail}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="representative@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="representativeTel"
                                    value={formData.representativeTel}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="+92 XXX XXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    name="representativeWhatsapp"
                                    value={formData.representativeWhatsapp}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="+92 XXX XXXXXXX"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-700 text-white px-6 py-3 rounded-md hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Submitting...' : 'Register Company'}
                        </button>
                        <Link
                            href="/companies"
                            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors text-center font-medium"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
