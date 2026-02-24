import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prismaClient';

const STATUS_STYLES = {
    PLANNED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Planned' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
};

function formatCurrencyPKR(value) {
    if (value == null) return '—';
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return '—';
    return `PKR ${num.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const seminarId = Number(id);
    if (Number.isNaN(seminarId)) return { title: 'Seminar Not Found' };

    const seminar = await prisma.seminar.findUnique({
        where: { id: seminarId },
        select: { title: true, rationaleObjective: true },
    });

    if (!seminar) return { title: 'Seminar Not Found' };

    return {
        title: `${seminar.title} — TDAP Seminars`,
        description: (seminar.rationaleObjective || '').substring(0, 160),
    };
}

export default async function SeminarDetailPage({ params }) {
    const { id } = await params;
    const seminarId = Number(id);
    if (Number.isNaN(seminarId)) notFound();

    const seminar = await prisma.seminar.findUnique({ where: { id: seminarId } });
    if (!seminar) notFound();

    const statusStyle = STATUS_STYLES[seminar.status] || STATUS_STYLES.PLANNED;

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <main className="container mx-auto px-4 py-8">

                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/seminars" className="hover:text-orange-600">Seminars</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 line-clamp-1">{seminar.title}</span>
                </nav>

                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl shadow-lg p-8 md:p-10 mb-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {seminar.productSector && (
                                <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-white/20 rounded-full mb-3">
                                    {seminar.productSector}
                                </span>
                            )}
                            <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-3">
                                {seminar.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-orange-100 text-sm">
                                {seminar.cityVenue && (
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{seminar.cityVenue}</span>
                                    </div>
                                )}
                                {seminar.tentativeDate && (
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span>{seminar.tentativeDate}</span>
                                    </div>
                                )}
                                {seminar.division && (
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" />
                                        </svg>
                                        <span>{seminar.division}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className={`self-start inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                        </span>
                    </div>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Rationale / Objective */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Rationale / Objective
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {seminar.rationaleObjective || '—'}
                            </p>
                        </div>

                        {/* Regional Collaboration */}
                        {seminar.regionalCollaboration && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                    Regional Collaboration
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {seminar.regionalCollaboration}
                                </p>
                            </div>
                        )}

                        {/* Final Remarks */}
                        {seminar.finalRemarks && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 000 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    Final Remarks
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {seminar.finalRemarks}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Information</h2>
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="font-semibold text-gray-700 mb-0.5">Status</dt>
                                    <dd>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                                            {statusStyle.label}
                                        </span>
                                    </dd>
                                </div>

                                {seminar.productSector && (
                                    <div>
                                        <dt className="font-semibold text-gray-700 mb-0.5">Product / Sector</dt>
                                        <dd className="text-gray-600">{seminar.productSector}</dd>
                                    </div>
                                )}

                                {seminar.cityVenue && (
                                    <div>
                                        <dt className="font-semibold text-gray-700 mb-0.5">City / Venue</dt>
                                        <dd className="text-gray-600">{seminar.cityVenue}</dd>
                                    </div>
                                )}

                                {seminar.tentativeDate && (
                                    <div>
                                        <dt className="font-semibold text-gray-700 mb-0.5">Tentative Date</dt>
                                        <dd className="text-gray-600">{seminar.tentativeDate}</dd>
                                    </div>
                                )}

                                {seminar.division && (
                                    <div>
                                        <dt className="font-semibold text-gray-700 mb-0.5">Division</dt>
                                        <dd className="text-gray-600">{seminar.division}</dd>
                                    </div>
                                )}

                                {seminar.deskOfficer && (
                                    <div>
                                        <dt className="font-semibold text-gray-700 mb-0.5">Desk Officer</dt>
                                        <dd className="text-gray-600">{seminar.deskOfficer}</dd>
                                    </div>
                                )}

                                {seminar.proposedBudget != null && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <dt className="font-semibold text-gray-700 mb-0.5">Proposed Budget</dt>
                                        <dd className="text-gray-900 font-bold text-base">
                                            {formatCurrencyPKR(seminar.proposedBudget)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Manage Seminar</h3>
                            <div className="flex flex-col gap-2">
                                <Link
                                    href={`/seminars/${seminar.id}/edit`}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Edit Seminar Details
                                </Link>
                                <Link
                                    href="/seminars"
                                    className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                                >
                                    View All Seminars
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
