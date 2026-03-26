import { prisma } from '../../../lib/prismaClient';
import { notFound } from 'next/navigation';
import FeedbackForm from './_components/FeedbackForm';

export const runtime = 'nodejs';

export async function generateMetadata({ params }) {
    const { companyId } = await params;
    const id = parseInt(companyId, 10);
    if (isNaN(id)) return { title: 'Company Feedback' };
    const company = await prisma.company.findUnique({ where: { id }, select: { name: true } });
    return { title: company ? `Daily Feedback — ${company.name}` : 'Company Feedback' };
}

export default async function CompanyFeedbackPage({ params }) {
    const { companyId } = await params;
    const id = parseInt(companyId, 10);
    if (isNaN(id)) notFound();

    const company = await prisma.company.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            representativeName: true,
            representativeEmail: true,
        },
    });

    if (!company) notFound();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
                        <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Daily Activity Report</h1>
                    <p className="text-muted text-sm mt-1">TDAP Food Directory — Qatar Trade Mission</p>
                </div>

                {/* Card */}
                <div className="glass-card p-6 sm:p-8">
                    <div className="mb-6 pb-4 border-b border-white/10">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-0.5">Company</p>
                        <p className="text-lg font-bold text-white">{company.name}</p>
                        {company.representativeName && (
                            <p className="text-sm text-secondary mt-0.5">{company.representativeName}</p>
                        )}
                    </div>

                    <FeedbackForm companyId={company.id} companyName={company.name} />
                </div>

                <p className="text-center text-xs text-muted mt-4 opacity-60">
                    This link was shared with you by a TDAP trade officer.
                </p>
            </div>
        </div>
    );
}
