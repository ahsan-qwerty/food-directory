import { notFound } from 'next/navigation';
import Link from 'next/link';
import CompanyCard from '../../../components/CompanyCard';
import { prisma } from '../../../lib/prismaClient';
import DelegationAdminPanel from './DelegationAdminPanel';

function formatDate(dateValue) {
    try {
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toISOString().slice(0, 10) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '—';
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const delegationId = Number(id);
    if (Number.isNaN(delegationId)) {
        return { title: 'Delegation Not Found' };
    }

    const delegation = await prisma.delegation.findUnique({
        where: { id: delegationId },
        select: {
            type: true,
            fromCountry: true,
            toCountry: true,
            division: true,
        },
    });

    if (!delegation) {
        return {
            title: 'Delegation Not Found'
        };
    }

    const country = delegation.type === 'INCOMING' ? delegation.fromCountry : delegation.toCountry;
    const title = `${delegation.type} Delegation${country ? ` - ${country}` : ''} - TDAP Food Directory`;

    return {
        title,
    };
}

export default async function DelegationDetailPage({ params }) {
    const { id } = await params;
    const delegationId = Number(id);
    if (Number.isNaN(delegationId)) {
        notFound();
    }

    const delegation = await prisma.delegation.findUnique({
        where: { id: delegationId },
        select: {
            id: true,
            type: true,
            status: true,
            division: true,
            productSector: true,
            expectedDelegates: true,
            rationale: true,
            fromCountry: true,
            toCountry: true,
            dates: true,
            allocatedBudget: true,
            utilizedBudget: true,
            closedAt: true,
            closingRemarks: true,
            participants: {
                select: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            profile: true,
                            address: true,
                            email: true,
                            website: true,
                            representativeName: true,
                            productsToBeDisplayed: true,
                        },
                    },
                },
            },
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!delegation) {
        notFound();
    }

    const participants = (delegation.participants || [])
        .map((p) => p.company)
        .filter(Boolean);

    const country = delegation.type === 'INCOMING' ? delegation.fromCountry : delegation.toCountry;
    const countryLabel = delegation.type === 'INCOMING' ? 'From Country' : 'To Country';
    const statusColor = delegation.status === 'CLOSED'
        ? 'from-gray-600 to-gray-700'
        : delegation.type === 'INCOMING'
            ? 'from-blue-600 to-blue-700'
            : 'from-purple-600 to-purple-700';

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <main className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <nav className="flex text-sm text-gray-600">
                        <Link href="/" className="hover:text-green-700">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/delegations" className="hover:text-green-700">Delegations</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">
                            {delegation.type} - {country || 'Delegation'}
                        </span>
                    </nav>
                </div>

                {/* Delegation Header */}
                <div className={`bg-gradient-to-r ${statusColor} rounded-lg shadow-lg p-8 md:p-12 mb-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl md:text-4xl font-bold">
                            {delegation.type} Delegation
                        </h1>
                        {delegation.status === 'CLOSED' && (
                            <span className="bg-white text-gray-900 bg-opacity-20 px-4 py-2 rounded-lg text-sm font-semibold">
                                CLOSED
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-6 text-white opacity-90">
                        {country && (
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{countryLabel}: {country}</span>
                            </div>
                        )}

                        {delegation.division && (
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{delegation.division}</span>
                            </div>
                        )}

                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span className="font-medium">{participants.length} Companies Participating</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delegation Details */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delegation Details</h2>

                            <div className="space-y-4">
                                {delegation.productSector && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Product / Sector</h3>
                                        <p className="text-gray-600">{delegation.productSector}</p>
                                    </div>
                                )}

                                {delegation.expectedDelegates && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Expected Number of Delegates</h3>
                                        <p className="text-gray-600">{delegation.expectedDelegates}</p>
                                    </div>
                                )}

                                {delegation.dates && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Dates</h3>
                                        <p className="text-gray-600">{delegation.dates}</p>
                                    </div>
                                )}

                                {delegation.rationale && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                            {delegation.type === 'INCOMING' ? 'Rationale / Objectives' : 'Rationale / Justification / Objective'}
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{delegation.rationale}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Budget Information */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Budget Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                        {delegation.type === 'INCOMING' ? 'Tentative Expenditure' : 'Proposed Budget'}
                                    </h3>
                                    <p className="text-lg font-bold text-gray-900">
                                        {delegation.allocatedBudget
                                            ? `PKR ${Number(delegation.allocatedBudget).toLocaleString()}`
                                            : '—'}
                                    </p>
                                </div>

                                {delegation.status === 'CLOSED' && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Utilized Budget</h3>
                                        <p className="text-lg font-bold text-gray-900">
                                            {delegation.utilizedBudget
                                                ? `PKR ${Number(delegation.utilizedBudget).toLocaleString()}`
                                                : '—'}
                                        </p>
                                    </div>
                                )}

                                {delegation.status === 'CLOSED' && delegation.allocatedBudget && delegation.utilizedBudget && (
                                    <div className="md:col-span-2">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Budget Utilization</h3>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${Number(delegation.utilizedBudget) <= Number(delegation.allocatedBudget)
                                                    ? 'bg-green-600'
                                                    : 'bg-red-600'
                                                    }`}
                                                style={{
                                                    width: `${Math.min(100, (Number(delegation.utilizedBudget) / Number(delegation.allocatedBudget)) * 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {((Number(delegation.utilizedBudget) / Number(delegation.allocatedBudget)) * 100).toFixed(1)}% utilized
                                        </p>
                                    </div>
                                )}
                            </div>

                            {delegation.closingRemarks && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Closing Remarks</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{delegation.closingRemarks}</p>
                                </div>
                            )}
                        </div>

                        {/* Participating Companies */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Participating Companies</h2>

                            {participants.length === 0 ? (
                                <p className="text-gray-600">No companies registered yet.</p>
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
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Type</h3>
                                    <p className="text-gray-600">{delegation.type}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Status</h3>
                                    <p className="text-gray-600">{delegation.status}</p>
                                </div>

                                {country && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">{countryLabel}</h3>
                                        <p className="text-gray-600">{country}</p>
                                    </div>
                                )}

                                {delegation.division && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Division</h3>
                                        <p className="text-gray-600">{delegation.division}</p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Participants</h3>
                                    <p className="text-gray-600">{participants.length} Companies</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Created</h3>
                                    <p className="text-gray-600">{formatDate(delegation.createdAt)}</p>
                                </div>

                                {delegation.status === 'CLOSED' && delegation.closedAt && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Closed</h3>
                                        <p className="text-gray-600">{formatDate(delegation.closedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin tools for desk officer */}
                        {delegation.status === 'ACTIVE' && (
                            <DelegationAdminPanel
                                delegationId={delegation.id}
                                delegationType={delegation.type}
                                participantCompanyIds={participants.map((c) => c.id)}
                                participantEmails={participants.map((c) => c.email).filter(Boolean)}
                                allocatedBudget={delegation.allocatedBudget ? Number(delegation.allocatedBudget) : null}
                            />
                        )}

                        {/* Browse More Delegations */}
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                More Delegations
                            </h3>
                            <Link
                                href="/delegations"
                                className="inline-block px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                            >
                                View All Delegations
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
