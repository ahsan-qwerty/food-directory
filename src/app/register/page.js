'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [sectors, setSectors] = useState([]);
    const [subSectors, setSubSectors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // ── Authorization code gate ──────────────────────────────────────────────
    const [accessCode, setAccessCode] = useState('');
    const [codeInput, setCodeInput] = useState('');
    const [codeError, setCodeError] = useState('');
    const [codeChecking, setCodeChecking] = useState(false);
    const codeInputRef = useRef(null);

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setCodeChecking(true);
        setCodeError('');
        try {
            const res = await fetch('/api/register/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: codeInput.trim() }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setAccessCode(codeInput.trim());
            } else {
                setCodeError('Invalid access code. Please check and try again.');
                codeInputRef.current?.select();
            }
        } catch {
            setCodeError('Failed to verify code. Please try again.');
        } finally {
            setCodeChecking(false);
        }
    };
    // ────────────────────────────────────────────────────────────────────────

    const GCC_COUNTRIES = ['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];

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
        willingToExportToGCC: false,
        gccCountries: [],
        countryExports: {},
        countriesAlreadyExportingTo: [],
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

    const toggleGccCountry = (country) => {
        setFormData(prev => {
            const isSelected = prev.gccCountries.includes(country);
            const nextExports = { ...prev.countryExports };
            if (isSelected) delete nextExports[country];
            return {
                ...prev,
                gccCountries: isSelected
                    ? prev.gccCountries.filter(c => c !== country)
                    : [...prev.gccCountries, country],
                countryExports: nextExports,
            };
        });
    };

    const setCountryExport = (country, value) => {
        setFormData(prev => ({
            ...prev,
            countryExports: { ...prev.countryExports, [country]: value },
        }));
    };

    const toggleExportingCountry = (country) => {
        setFormData(prev => ({
            ...prev,
            countriesAlreadyExportingTo: prev.countriesAlreadyExportingTo.includes(country)
                ? prev.countriesAlreadyExportingTo.filter(c => c !== country)
                : [...prev.countriesAlreadyExportingTo, country],
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
                    // Pass the verified access code
                    registrationCode: accessCode,
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

    // ── Code gate ── show this screen until a valid code is entered ──────────
    if (!accessCode) {
        return (
            <div className="page-wrapper flex items-center justify-center px-4">
                <div className="glass-card-strong p-10 max-w-sm w-full">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500/30 mb-4">
                            <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Access Required</h1>
                        <p className="text-secondary text-sm">Enter your authorization code to access the registration form.</p>
                    </div>
                    <form onSubmit={handleCodeSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1.5">Authorization Code</label>
                            <input
                                ref={codeInputRef}
                                type="text"
                                value={codeInput}
                                onChange={e => setCodeInput(e.target.value)}
                                placeholder="Enter your code…"
                                autoFocus
                                autoComplete="off"
                                className="glass-input w-full px-3 py-2.5 text-center tracking-widest font-mono text-lg uppercase"
                            />
                            {codeError && (
                                <p className="mt-2 text-sm text-red-400">{codeError}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={codeChecking || !codeInput.trim()}
                            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {codeChecking && (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {codeChecking ? 'Verifying…' : 'Continue'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    // ────────────────────────────────────────────────────────────────────────

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
                            {/* GCC Export toggle */}
                            {/* <div className="md:col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={formData.willingToExportToGCC}
                                        onClick={() => setFormData(prev => ({ ...prev, willingToExportToGCC: !prev.willingToExportToGCC }))}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent ${formData.willingToExportToGCC ? 'bg-green-600' : 'bg-white/20'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ${formData.willingToExportToGCC ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className="text-sm font-medium text-secondary">
                                        Willing to Export to GCC
                                        {formData.willingToExportToGCC && (
                                            <span className="ml-2 text-xs font-semibold text-accent-green">Yes</span>
                                        )}
                                    </span>
                                </label>
                            </div> */}

                            {/* GCC target countries + per-country export value */}
                            <div className="md:col-span-2">
                                <FormLabel>
                                    Target GCC Countries
                                    <span className="ml-1 text-xs font-normal text-muted">(select all that apply)</span>
                                </FormLabel>
                                <div className="flex flex-wrap gap-2">
                                    {GCC_COUNTRIES.map(country => {
                                        const selected = formData.gccCountries.includes(country);
                                        return (
                                            <button
                                                key={country}
                                                type="button"
                                                onClick={() => toggleGccCountry(country)}
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
                                                {country}
                                            </button>
                                        );
                                    })}
                                </div>
                                {formData.gccCountries.length > 0 && (
                                    <div className="mt-4 border border-white/10 rounded-lg overflow-hidden">
                                        <div className="grid grid-cols-[1fr_auto] bg-white/5 px-4 py-2 border-b border-white/10">
                                            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Country</span>
                                            <span className="text-xs font-semibold text-muted uppercase tracking-wide w-48 text-right">Last Year Export (USD)</span>
                                        </div>
                                        {formData.gccCountries.map(country => (
                                            <div key={country} className="grid grid-cols-[1fr_auto] items-center px-4 py-2.5 border-b border-white/5 last:border-b-0">
                                                <span className="text-sm font-medium text-white">{country}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    placeholder="0"
                                                    value={formData.countryExports[country] ?? ''}
                                                    onChange={e => setCountryExport(country, e.target.value)}
                                                    className="glass-input px-3 py-1.5 text-sm w-48 text-right"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Countries Already Exporting To */}
                            <div className="md:col-span-2">
                                <FormLabel>
                                    Countries Already Exporting To
                                    <span className="ml-1 text-xs font-normal text-muted">(select all that apply)</span>
                                </FormLabel>
                                <div className="flex flex-wrap gap-2">
                                    {GCC_COUNTRIES.map(country => {
                                        const selected = formData.countriesAlreadyExportingTo.includes(country);
                                        return (
                                            <button
                                                key={country}
                                                type="button"
                                                onClick={() => toggleExportingCountry(country)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${selected
                                                    ? 'bg-amber-700 text-white border-amber-700'
                                                    : 'bg-white/10 text-secondary border-white/20 hover:border-amber-500 hover:text-white'
                                                    }`}
                                            >
                                                {selected && (
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                {country}
                                            </button>
                                        );
                                    })}
                                </div>
                                {formData.countriesAlreadyExportingTo.length > 0 && (
                                    <p className="mt-2 text-xs text-amber-400 font-medium">
                                        {formData.countriesAlreadyExportingTo.length} countr{formData.countriesAlreadyExportingTo.length > 1 ? 'ies' : 'y'} selected
                                    </p>
                                )}
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
