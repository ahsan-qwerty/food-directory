import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prismaClient';
import { Suspense } from 'react';

const GCC_COUNTRIES = ['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];

function parseJson(value, fallback = []) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return fallback; }
    }
    return fallback;
}

function fmt(value) {
    if (value == null) return '—';
    const n = typeof value === 'object' && value.constructor?.name === 'Decimal'
        ? parseFloat(value.toString())
        : Number(value);
    if (isNaN(n)) return '—';
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export async function generateMetadata({ params }) {
    const { country } = await params;
    const name = decodeURIComponent(country);
    return {
        title: `${name} Country Profile – TDAP Food Directory`,
        description: `AgroFood import profile for ${name}`,
    };
}

export default async function CountryProfilePage({ params }) {
    const { country } = await params;
    const countryName = decodeURIComponent(country);

    if (!GCC_COUNTRIES.includes(countryName)) notFound();

    const raw = await prisma.countryProfile.findUnique({
        where: { country: countryName },
        include: {
            interests: {
                orderBy: { createdAt: 'asc' },
                include: {
                    subSector: { select: { id: true, name: true, sector: { select: { id: true, name: true } } } },
                    companies: {
                        include: {
                            company: { select: { id: true, name: true, email: true, representativeName: true } },
                        },
                    },
                },
            },
        },
    });

    const profile = raw
        ? {
            ...raw,
            topImportsFromWorld: parseJson(raw.topImportsFromWorld),
            topImportsFromPakistan: parseJson(raw.topImportsFromPakistan),
        }
        : null;

    return (
        <div className="min-h-screen">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link href="/companies" className="text-sm text-muted hover:text-accent-green transition-colors">
                                ← GCC Directory
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-white">{countryName}</h1>
                        <p className="text-muted mt-1">AgroFood Import Profile</p>
                    </div>
                    <Link
                        href={`/countries/${encodeURIComponent(countryName)}/edit`}
                        className="btn-outline px-4 py-2 text-sm"
                    >
                        {profile ? 'Edit Profile' : 'Add Profile'}
                    </Link>
                </div>

                {!profile ? (
                    <div className="glass-card p-10 text-center">
                        <svg className="w-14 h-14 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-white mb-2">No profile yet</h2>
                        <p className="text-muted mb-6">Country profile data hasn't been added for {countryName} yet.</p>
                        <Link href={`/countries/${encodeURIComponent(countryName)}/edit`} className="btn-primary px-6 py-2">
                            Add Country Profile
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* Overview stats */}
                        {(profile.population || profile.gdp || profile.currency) && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.population && (
                                    <div className="glass-card p-5">
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Population</p>
                                        <p className="text-lg font-bold text-white">{profile.population}</p>
                                    </div>
                                )}
                                {profile.gdp && (
                                    <div className="glass-card p-5">
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">GDP</p>
                                        <p className="text-lg font-bold text-white">{profile.gdp}</p>
                                    </div>
                                )}
                                {profile.currency && (
                                    <div className="glass-card p-5">
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Currency</p>
                                        <p className="text-lg font-bold text-white">{profile.currency}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Overview text */}
                        {profile.overview && (
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-white mb-3">Market Overview</h2>
                                <p className="text-secondary leading-relaxed whitespace-pre-line">{profile.overview}</p>
                            </div>
                        )}

                        {/* Top 10 imports from World */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-white mb-1">
                                Top AgroFood Imports from World
                            </h2>
                            <p className="text-xs text-muted mb-4">Values in USD</p>
                            {profile.topImportsFromWorld.length === 0 ? (
                                <p className="text-muted text-sm">No data available.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted uppercase tracking-wide w-10">#</th>
                                                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted uppercase tracking-wide">Product</th>
                                                <th className="text-right py-2 text-xs font-semibold text-muted uppercase tracking-wide w-36">Value (USD)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profile.topImportsFromWorld.map((row, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-2.5 pr-4 text-muted font-mono text-xs">{row.rank ?? i + 1}</td>
                                                    <td className="py-2.5 pr-4 text-white font-medium">{row.product}</td>
                                                    <td className="py-2.5 text-right text-accent-green font-semibold">{fmt(row.value)}</td>
                                                </tr>
                                            ))}
                                            {profile.otherImportsFromWorldValue != null && (
                                                <tr className="border-t border-white/10 bg-white/3">
                                                    <td className="py-2.5 pr-4 text-muted">—</td>
                                                    <td className="py-2.5 pr-4 text-secondary italic">Others</td>
                                                    <td className="py-2.5 text-right text-secondary font-semibold">{fmt(profile.otherImportsFromWorldValue)}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Top 10 imports from Pakistan */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-white mb-1">
                                Top AgroFood Imports from Pakistan
                            </h2>
                            <p className="text-xs text-muted mb-4">Values in USD</p>
                            {profile.topImportsFromPakistan.length === 0 ? (
                                <p className="text-muted text-sm">No data available.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted uppercase tracking-wide w-10">#</th>
                                                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted uppercase tracking-wide">Product</th>
                                                <th className="text-right py-2 text-xs font-semibold text-muted uppercase tracking-wide w-36">Value (USD)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profile.topImportsFromPakistan.map((row, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-2.5 pr-4 text-muted font-mono text-xs">{row.rank ?? i + 1}</td>
                                                    <td className="py-2.5 pr-4 text-white font-medium">{row.product}</td>
                                                    <td className="py-2.5 text-right text-accent-green font-semibold">{fmt(row.value)}</td>
                                                </tr>
                                            ))}
                                            {profile.otherImportsFromPakistanValue != null && (
                                                <tr className="border-t border-white/10 bg-white/3">
                                                    <td className="py-2.5 pr-4 text-muted">—</td>
                                                    <td className="py-2.5 pr-4 text-secondary italic">Others</td>
                                                    <td className="py-2.5 text-right text-secondary font-semibold">{fmt(profile.otherImportsFromPakistanValue)}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Additional notes */}
                        {profile.additionalNotes && (
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-white mb-3">Additional Notes</h2>
                                <p className="text-secondary leading-relaxed whitespace-pre-line">{profile.additionalNotes}</p>
                            </div>
                        )}

                        {/* Product / Subsector Interests & Recommended Companies */}
                        {profile.interests && profile.interests.length > 0 && (
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-white mb-1">Product Interests &amp; Recommended Companies</h2>
                                <p className="text-xs text-muted mb-5">Products/subsectors of interest and Pakistani companies best suited for each</p>
                                <div className="space-y-5">
                                    {profile.interests.map(interest => {
                                        const label = interest.subSector
                                            ? interest.subSector.name
                                            : interest.customProduct || 'Unnamed Product';
                                        const sectorName = interest.subSector?.sector?.name || null;
                                        return (
                                            <div key={interest.id} className="border border-white/10 rounded-xl p-5">
                                                <div className="flex flex-wrap items-start gap-2 mb-3">
                                                    <h3 className="text-base font-bold text-white">{label}</h3>
                                                    {sectorName && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                                            {sectorName}
                                                        </span>
                                                    )}
                                                </div>
                                                {interest.notes && (
                                                    <p className="text-secondary text-sm mb-4 leading-relaxed">{interest.notes}</p>
                                                )}
                                                {interest.companies.length > 0 ? (
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Recommended Companies</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {interest.companies.map(({ company }) => (
                                                                <Link
                                                                    key={company.id}
                                                                    href={`/companies/${company.id}`}
                                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/5 transition-colors group"
                                                                >
                                                                    <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                                                                        <span className="text-xs font-bold text-sky-300">
                                                                            {company.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-white group-hover:text-sky-300 transition-colors line-clamp-1">{company.name}</p>
                                                                        {company.representativeName && (
                                                                            <p className="text-xs text-muted line-clamp-1">{company.representativeName}</p>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted italic">No companies assigned yet.</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </main>
        </div>
    );
}
