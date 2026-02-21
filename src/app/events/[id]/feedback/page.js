import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../../lib/prismaClient';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const eventId = Number(id);
    if (Number.isNaN(eventId)) return { title: 'Event Feedback' };
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { name: true } });
    return { title: event ? `Feedback — ${event.name}` : 'Event Feedback' };
}

function fmt(v) {
    if (v == null || v === '') return <span className="text-muted italic">—</span>;
    return v;
}

function fmtBool(v) {
    if (v === true) return <span className="text-accent-green font-medium">Yes</span>;
    if (v === false) return <span className="text-red-400 font-medium">No</span>;
    return <span className="text-muted italic">—</span>;
}

function fmtArray(v) {
    if (!v) return <span className="text-muted italic">—</span>;
    let arr;
    try { arr = typeof v === 'string' ? JSON.parse(v) : v; } catch { arr = [v]; }
    if (!Array.isArray(arr) || arr.length === 0) return <span className="text-muted italic">—</span>;
    return (
        <ul className="list-disc list-inside space-y-0.5">
            {arr.map((item, i) => <li key={i} className="text-secondary text-sm">{item}</li>)}
        </ul>
    );
}

function fmtUSD(v) {
    if (v == null) return <span className="text-muted italic">—</span>;
    return `USD ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function Row({ label, value }) {
    return (
        <div className="grid grid-cols-5 gap-2 py-2 border-b glass-divider last:border-0">
            <dt className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide pt-0.5">{label}</dt>
            <dd className="col-span-3 text-sm text-secondary">{value}</dd>
        </div>
    );
}

function SatisfactionBadge({ level }) {
    const cls = {
        'Very satisfied': 'badge-green',
        'Satisfied': 'badge-blue',
        'Neutral': 'badge-gray',
        'Dissatisfied': 'badge-gray',
    };
    if (!level) return <span className="text-muted italic text-sm">—</span>;
    return (
        <span className={cls[level] || 'badge-gray'}>
            {level}
        </span>
    );
}

export default async function EventFeedbackPage({ params }) {
    const { id } = await params;
    const eventId = Number(id);
    if (Number.isNaN(eventId)) notFound();

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, name: true, country: true, city: true, eventDate: true },
    });
    if (!event) notFound();

    const feedbacks = await prisma.eventFeedback.findMany({
        where: { eventId },
        orderBy: { submittedAt: 'desc' },
    });

    const companyIds = [...new Set(feedbacks.map((f) => f.companyId).filter(Boolean))];
    const companies = companyIds.length
        ? await prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: {
                id: true,
                name: true,
                address: true,
                representativeName: true,
                representativeTel: true,
                representativeWhatsapp: true,
                representativeEmail: true,
            },
        })
        : [];
    const companyMap = Object.fromEntries(companies.map((c) => [c.id, c]));

    const locationLabel = [event.city, event.country].filter(Boolean).join(', ') || '—';
    const dateLabel = event.eventDate
        ? new Date(event.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        <div className="page-wrapper">
            <main className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex text-sm text-muted mb-6">
                    <Link href="/" className="breadcrumb-link">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/events" className="breadcrumb-link">Events</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/events/${event.id}`} className="breadcrumb-link">{event.name}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-primary">Feedback</span>
                </nav>

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-1">
                            Exhibitor Feedback
                        </h1>
                        <p className="text-secondary text-sm">
                            {event.name} &middot; {locationLabel} &middot; {dateLabel}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-secondary">
                            <span className="font-semibold text-primary">{feedbacks.length}</span> submission{feedbacks.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="w-16 h-16 icon-circle-green mx-auto mb-4">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-secondary font-medium">No feedback submitted yet.</p>
                        <Link href={`/feedback/company?eventId=${event.id}`} className="mt-4 inline-block text-sm text-accent-green hover:underline">
                            Add the first feedback →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {feedbacks.map((fb) => {
                            const co = companyMap[fb.companyId] ?? null;
                            return (
                                <div key={fb.id} className="glass-card overflow-hidden">
                                    {/* Card header */}
                                    <div className="glass-hero px-6 py-4 flex items-center justify-between rounded-none" style={{borderRadius: '0', borderBottomLeftRadius: '0', borderBottomRightRadius: '0'}}>
                                        <div>
                                            <h2 className="text-primary font-bold text-lg mt-0.5">
                                                {co?.name || fb.companyName || fb.sourceName || 'Unknown Company'}
                                            </h2>
                                        </div>
                                        <div className="text-right text-sm text-secondary">
                                            <div>{new Date(fb.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div>{new Date(fb.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Company Info */}
                                        <section>
                                            <h3 className="text-sm font-bold text-accent-green uppercase tracking-wide mb-3 pb-1 border-b glass-divider">Company Info</h3>
                                            {co ? (
                                                <dl>
                                                    <Row label="Company" value={fmt(co.name)} />
                                                    <Row label="Address" value={fmt(co.address)} />
                                                    <Row label="Representative" value={fmt(co.representativeName)} />
                                                    <Row label="Tel" value={fmt(co.representativeTel)} />
                                                    <Row label="WhatsApp" value={fmt(co.representativeWhatsapp)} />
                                                    <Row label="Email" value={fmt(co.representativeEmail)} />
                                                    <Row label="Products Exhibited" value={fmt(fb.productsExhibited)} />
                                                </dl>
                                            ) : (
                                                <dl>
                                                    <Row label="Products Exhibited" value={fmt(fb.productsExhibited)} />
                                                </dl>
                                            )}
                                        </section>

                                        {/* Business Results */}
                                        <section>
                                            <h3 className="text-sm font-bold text-accent-green uppercase tracking-wide mb-3 pb-1 border-b glass-divider">Business Results</h3>
                                            <dl>
                                                <Row label="B2B Meetings" value={fmt(fb.b2bMeetings)} />
                                                <Row label="Existing Customers Met" value={fmt(fb.existingCustomers)} />
                                                <Row label="New Contacts" value={fmt(fb.newContacts)} />
                                                <Row label="Visitors Countries" value={fmt(fb.visitorsCountries)} />
                                                <Row label="Orders Booked" value={fmtUSD(fb.ordersBooked)} />
                                                <Row label="Expected Future Orders" value={fmtUSD(fb.expectedOrders)} />
                                            </dl>
                                        </section>

                                        {/* Inquiries & Competition */}
                                        <section>
                                            <h3 className="text-sm font-bold text-accent-green uppercase tracking-wide mb-3 pb-1 border-b glass-divider">Inquiries & Competition</h3>
                                            <dl>
                                                <Row label="Unmaterialized Inquiries?" value={fmtBool(fb.hadUnmaterializedInquiries)} />
                                                <Row label="Reasons" value={fmtArray(fb.unmaterializedReasons)} />
                                                <Row label="Major Competitors" value={fmt(fb.majorCompetitors)} />
                                                <Row label="Competitor Methods" value={fmtArray(fb.competitorMarketingMethods)} />
                                            </dl>
                                        </section>

                                        {/* Evaluation */}
                                        <section>
                                            <h3 className="text-sm font-bold text-accent-green uppercase tracking-wide mb-3 pb-1 border-b glass-divider">Evaluation</h3>
                                            <dl>
                                                <Row label="Continue Fair?" value={fmtBool(fb.continueFairParticipation)} />
                                                <Row label="Satisfaction" value={<SatisfactionBadge level={fb.satisfactionLevel} />} />
                                            </dl>
                                        </section>

                                        {/* Open-ended */}
                                        {(fb.problemsFaced || fb.improvementSuggestions || fb.tdapRecommendations || fb.additionalComments) && (
                                            <section className="lg:col-span-2">
                                                <h3 className="text-sm font-bold text-accent-green uppercase tracking-wide mb-3 pb-1 border-b glass-divider">Comments & Suggestions</h3>
                                                <dl>
                                                    {fb.problemsFaced && <Row label="Problems Faced" value={<span className="whitespace-pre-line">{fb.problemsFaced}</span>} />}
                                                    {fb.improvementSuggestions && <Row label="Improvement Suggestions" value={<span className="whitespace-pre-line">{fb.improvementSuggestions}</span>} />}
                                                    {fb.tdapRecommendations && <Row label="TDAP Recommendations" value={<span className="whitespace-pre-line">{fb.tdapRecommendations}</span>} />}
                                                    {fb.additionalComments && <Row label="Additional Comments" value={<span className="whitespace-pre-line">{fb.additionalComments}</span>} />}
                                                </dl>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
