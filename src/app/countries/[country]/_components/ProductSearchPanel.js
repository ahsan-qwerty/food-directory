'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

function parseProductExports(raw) {
    if (!raw) return {};
    if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return {}; }
    }
    return {};
}

function fmt(value) {
    const n = Number(value);
    if (!value || isNaN(n)) return null;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function ProductSearchPanel({ interests }) {
    const [query, setQuery] = useState('');

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        return interests
            .filter(interest => {
                const name = (interest.subSector?.name || interest.customProduct || '').toLowerCase();
                return name.includes(q);
            })
            .map(interest => {
                const subSectorId = interest.subSector?.id ?? null;
                const productLabel = interest.subSector?.name || interest.customProduct || 'Product';
                const sectorName = interest.subSector?.sector?.name || null;

                const companies = interest.companies
                    .map(({ company }) => {
                        const exports = parseProductExports(company.productExports);
                        const exportValue = subSectorId != null ? (Number(exports[String(subSectorId)]) || 0) : 0;
                        return { ...company, exportValue };
                    })
                    .sort((a, b) => b.exportValue - a.exportValue);

                return { id: interest.id, productLabel, sectorName, companies };
            })
            .filter(r => r.companies.length > 0);
    }, [query, interests]);

    return (
        <div className="glass-card p-6">
            {/* Search input */}
            <div className="flex items-center gap-3 mb-2">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search by product or subsector…"
                        className="glass-input w-full pl-9 pr-4 py-2.5 text-sm"
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                            aria-label="Clear search"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            <p className="text-xs text-muted mb-5">
                Find all companies targeting this country for a specific product, ranked by their last-year export value.
            </p>

            {/* Results */}
            {query.trim() === '' ? null : results.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="w-10 h-10 mx-auto text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-secondary text-sm">No products found matching &ldquo;{query}&rdquo;</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {results.map(({ id, productLabel, sectorName, companies }) => (
                        <div key={id}>
                            {/* Product heading */}
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="text-base font-bold text-white">{productLabel}</h3>
                                {sectorName && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                        {sectorName}
                                    </span>
                                )}
                                <span className="ml-auto text-xs text-muted shrink-0">
                                    {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                                </span>
                            </div>

                            {/* Company table */}
                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-[auto_1fr_auto] items-center bg-white/5 px-4 py-2 border-b border-white/10 gap-3">
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wide w-6 text-center">#</span>
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wide">Company</span>
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wide w-36 text-right">Export Value (USD)</span>
                                </div>
                                {companies.map(({ id: cId, name, email, representativeName, representativeTel, exportValue }, idx) => {
                                    const exportLabel = fmt(exportValue);
                                    return (
                                        <div
                                            key={cId}
                                            className="grid grid-cols-[auto_1fr_auto] items-start px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors gap-3"
                                        >
                                            {/* Rank */}
                                            <span className="text-xs font-mono text-muted w-6 text-center pt-0.5">{idx + 1}</span>

                                            {/* Company info */}
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/companies/${cId}`}
                                                    className="text-sm font-semibold text-white hover:text-accent-green transition-colors truncate block"
                                                >
                                                    {name}
                                                </Link>
                                                {(representativeName || email || representativeTel) && (
                                                    <p className="text-xs text-muted mt-0.5 truncate">
                                                        {[representativeName, representativeTel || email].filter(Boolean).join(' · ')}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Export value */}
                                            <div className="w-36 text-right shrink-0 pt-0.5">
                                                {exportLabel ? (
                                                    <span className="text-sm font-semibold text-accent-green">{exportLabel}</span>
                                                ) : (
                                                    <span className="text-xs text-muted italic">Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
