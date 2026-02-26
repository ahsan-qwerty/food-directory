import { notFound } from 'next/navigation';
import Link from 'next/link';
import CompanyCard from '../../../components/CompanyCard';
import { prisma } from '../../../lib/prismaClient';
import DelegationAdminPanel from '../_components/DelegationAdminPanel';

function formatDate(dateValue) {
    try {
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return '—';
        return (
            d.toISOString().slice(0, 10) + ' ' +
            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        );
    } catch {
        return '—';
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const delegationId = Number(id);
    if (Number.isNaN(delegationId)) return { title: 'Delegation Not Found' };

    const delegation = await prisma.delegation.findUnique({
        where: { id: delegationId },
        select: { type: true, title: true, fromCountry: true, toCountry: true, division: true },
    });
    if (!delegation) return { title: 'Delegation Not Found' };

    const country = delegation.type === 'INCOMING' ? delegation.fromCountry : delegation.toCountry;
    const pageTitle = delegation.title || `${delegation.type} Delegation${country ? ` — ${country}` : ''}`;
    return {
        title: `${pageTitle} - TDAP Food Directory`,
    };
}

// Inline style for the header gradient based on type/status
function getHeaderStyle(delegation) {
    if (delegation.status === 'CLOSED') {
        return { background: 'linear-gradient(135deg, rgba(75,85,99,0.65) 0%, rgba(55,65,81,0.55) 100%)' };
    }
    if (delegation.type === 'INCOMING') {
        return { background: 'linear-gradient(135deg, rgba(37,99,235,0.60) 0%, rgba(59,130,246,0.45) 100%)' };
    }
    return { background: 'linear-gradient(135deg, rgba(124,58,237,0.60) 0%, rgba(147,51,234,0.45) 100%)' };
}

export default async function DelegationDetailPage({ params }) {
    const { id } = await params;
    const delegationId = Number(id);
    if (Number.isNaN(delegationId)) notFound();

    const delegation = await prisma.delegation.findUnique({
        where: { id: delegationId },
        select: {
            id: true, type: true, status: true, title: true, division: true,
            productSector: true, expectedDelegates: true, rationale: true,
            fromCountry: true, toCountry: true,
            startDate: true, endDate: true,
            allocatedBudget: true, utilizedBudget: true,
            closedAt: true, closingRemarks: true,
            sectors: {
                select: { sector: { select: { id: true, name: true } } },
            },
            participants: {
                select: {
                    company: {
                        select: {
                            id: true, name: true, profile: true, address: true,
                            email: true, website: true, representativeName: true,
                            productsToBeDisplayed: true,
                        },
                    },
                },
            },
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!delegation) notFound();

    const participants = (delegation.participants || []).map(p => p.company).filter(Boolean);
    const delegationSectors = (delegation.sectors || []).map(s => s.sector).filter(Boolean);
    const country = delegation.type === 'INCOMING' ? delegation.fromCountry : delegation.toCountry;
    const countryLabel = delegation.type === 'INCOMING' ? 'From Country' : 'To Country';
    const headerStyle = getHeaderStyle(delegation);

    const utilPct = delegation.allocatedBudget && delegation.utilizedBudget
        ? Math.min(100, (Number(delegation.utilizedBudget) / Number(delegation.allocatedBudget)) * 100)
        : null;
    const isOverBudget = utilPct !== null && Number(delegation.utilizedBudget) > Number(delegation.allocatedBudget);

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8">

                {/* Breadcrumb */}
                <nav className="flex text-sm text-secondary mb-6 flex-wrap gap-1">
                    <Link href="/" className="breadcrumb-link">Home</Link>
                    <span className="mx-2 text-muted">/</span>
                    <Link href="/delegations" className="breadcrumb-link">Delegations</Link>
                    <span className="mx-2 text-muted">/</span>
                    <span className="text-white">
                        {delegation.title || `${delegation.type} — ${country || 'Delegation'}`}
                    </span>
                </nav>

                {/* Delegation Header */}
                <div
                    className="rounded-xl border border-white/15 shadow-2xl p-8 md:p-12 mb-8 backdrop-blur-md"
                    style={headerStyle}
                >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                        <div>
                            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                                {delegation.type} Delegation
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                {delegation.title || country || 'Delegation'}
                            </h1>
                        </div>
                        {delegation.status === 'CLOSED' && (
                            <span className="badge-gray self-start mt-1">CLOSED</span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-6 text-white/80">
                        {country && (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium text-white">{countryLabel}: {country}</span>
                            </div>
                        )}
                        {delegation.division && (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium text-white">{delegation.division}</span>
                            </div>
                        )}
                        {delegationSectors.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {delegationSectors.map((s) => (
                                    <span key={s.id} className="badge-green text-xs">{s.name}</span>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span className="font-medium text-white">{participants.length} Companies Participating</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Delegation Details */}
                        <div className="glass-card p-6">
                            <h2 className="text-2xl font-bold text-white mb-5">Delegation Details</h2>
                            <div className="space-y-5">
                                {delegationSectors.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                                            Product / Sector
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {delegationSectors.map((s) => (
                                                <span key={s.id} className="badge-green">{s.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* legacy text fallback (pre-junction data) */}
                                {delegationSectors.length === 0 && delegation.productSector && (
                                    <DInfoRow label="Product / Sector" value={delegation.productSector} />
                                )}
                                {delegation.expectedDelegates && (
                                    <DInfoRow label="Expected Number of Delegates" value={delegation.expectedDelegates} />
                                )}
                                {(delegation.startDate || delegation.endDate) && (
                                    <DInfoRow
                                        label="Dates"
                                        value={
                                            (delegation.startDate
                                                ? new Date(delegation.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—') +
                                            ' → ' +
                                            (delegation.endDate
                                                ? new Date(delegation.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—')
                                        }
                                    />
                                )}
                                {delegation.rationale && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                                            {delegation.type === 'INCOMING' ? 'Rationale / Objectives' : 'Rationale / Justification / Objective'}
                                        </h3>
                                        <p className="text-secondary leading-relaxed whitespace-pre-line">
                                            {delegation.rationale}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="glass-card p-6">
                            <h2 className="text-2xl font-bold text-white mb-5">Budget Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                                        {delegation.type === 'INCOMING' ? 'Tentative Expenditure' : 'Proposed Budget'}
                                    </h3>
                                    <p className="text-2xl font-bold text-accent-green">
                                        {delegation.allocatedBudget
                                            ? `PKR ${Number(delegation.allocatedBudget).toLocaleString()}`
                                            : '—'}
                                    </p>
                                </div>
                                {delegation.status === 'CLOSED' && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Utilized Budget</h3>
                                        <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-400' : 'text-accent-green'}`}>
                                            {delegation.utilizedBudget
                                                ? `PKR ${Number(delegation.utilizedBudget).toLocaleString()}`
                                                : '—'}
                                        </p>
                                    </div>
                                )}
                                {utilPct !== null && (
                                    <div className="md:col-span-2">
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Budget Utilization</h3>
                                        <div className="progress-track h-2.5 w-full">
                                            <div
                                                className={`progress-fill h-2.5 ${isOverBudget ? 'progress-over' : ''}`}
                                                style={{ width: `${utilPct}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-secondary mt-1">
                                            {utilPct.toFixed(1)}% utilized
                                        </p>
                                    </div>
                                )}
                            </div>

                            {delegation.closingRemarks && (
                                <div className="mt-5 pt-4 border-t glass-divider">
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Closing Remarks</h3>
                                    <p className="text-secondary leading-relaxed whitespace-pre-line">
                                        {delegation.closingRemarks}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Participating Companies */}
                        <div className="glass-card p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Participating Companies</h2>
                            {participants.length === 0 ? (
                                <p className="text-secondary">No companies registered yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {participants.map(company => (
                                        <CompanyCard key={company.id} company={company} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Quick Info */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Quick Information</h2>
                            <div className="space-y-4">
                                {delegation.title && <DInfoRow label="Title" value={delegation.title} />}
                                <DInfoRow label="Type" value={delegation.type} />
                                <DInfoRow label="Status" value={delegation.status} />
                                {country && <DInfoRow label={countryLabel} value={country} />}
                                {delegation.division && <DInfoRow label="Division" value={delegation.division} />}
                                {delegationSectors.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Sectors</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {delegationSectors.map((s) => (
                                                <span key={s.id} className="badge-green text-xs">{s.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <DInfoRow label="Participants" value={`${participants.length} Companies`} />
                                <DInfoRow label="Created" value={formatDate(delegation.createdAt)} />
                                {delegation.status === 'CLOSED' && delegation.closedAt && (
                                    <DInfoRow label="Closed" value={formatDate(delegation.closedAt)} />
                                )}
                            </div>
                        </div>

                        {/* Admin Panel */}
                        {delegation.status === 'ACTIVE' && (
                            <DelegationAdminPanel
                                delegationId={delegation.id}
                                delegationType={delegation.type}
                                participantCompanyIds={participants.map(c => c.id)}
                                participantEmails={participants.map(c => c.email).filter(Boolean)}
                                allocatedBudget={delegation.allocatedBudget ? Number(delegation.allocatedBudget) : null}
                            />
                        )}

                        {/* Manage Delegation */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Manage</h3>
                            <div className="space-y-3">
                                <Link
                                    href={`/delegations/${delegation.id}/edit`}
                                    className="btn-outline px-4 py-2 text-sm font-semibold w-full text-center block"
                                >
                                    ✏️ Edit Delegation
                                </Link>
                            </div>
                        </div>

                        {/* Browse More */}
                        <div className="glass-card p-6 text-center">
                            <h3 className="text-lg font-bold text-white mb-4">More Delegations</h3>
                            <Link href="/delegations" className="btn-primary px-6 py-2 inline-block">
                                View All Delegations
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function DInfoRow({ label, value }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{label}</h3>
            <p className="text-secondary">{value}</p>
        </div>
    );
}
