import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

function toIntOrNull(v) {
    if (v == null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
}

function toDecimalOrNull(v) {
    if (v == null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function toBoolOrNull(v) {
    if (v == null) return null;
    if (typeof v === 'boolean') return v;
    if (v === 'true' || v === 'yes' || v === true) return true;
    if (v === 'false' || v === 'no' || v === false) return false;
    return null;
}

function toJsonArrayString(v) {
    if (!v) return null;
    if (Array.isArray(v)) return JSON.stringify(v.filter(Boolean));
    if (typeof v === 'string') return v;
    return null;
}

// GET /api/event-feedback?eventId=X — fetch all feedback for an event
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const eventId = Number(searchParams.get('eventId'));

    if (Number.isNaN(eventId)) {
        return NextResponse.json({ error: 'Valid eventId is required' }, { status: 400 });
    }

    const feedbacks = await prisma.eventFeedback.findMany({
        where: { eventId },
        orderBy: { submittedAt: 'desc' },
    });

    const mapped = feedbacks.map((f) => ({
        ...f,
        ordersBooked: f.ordersBooked ? Number(f.ordersBooked) : null,
        expectedOrders: f.expectedOrders ? Number(f.expectedOrders) : null,
        unmaterializedReasons: f.unmaterializedReasons
            ? (() => { try { return JSON.parse(f.unmaterializedReasons); } catch { return f.unmaterializedReasons; } })()
            : null,
        competitorMarketingMethods: f.competitorMarketingMethods
            ? (() => { try { return JSON.parse(f.competitorMarketingMethods); } catch { return f.competitorMarketingMethods; } })()
            : null,
    }));

    return NextResponse.json({ feedbacks: mapped, total: mapped.length });
}

// POST /api/event-feedback — submit exhibitor feedback
export async function POST(request) {
    try {
        const body = await request.json();
        const eventId = Number(body.eventId);

        if (Number.isNaN(eventId)) {
            return NextResponse.json({ error: 'Valid eventId is required' }, { status: 400 });
        }

        const companyId = body.companyId ? Number(body.companyId) : null;

        const feedback = await prisma.eventFeedback.create({
            data: {
                eventId,
                sourceType: 'COMPANY',
                ...(companyId && !Number.isNaN(companyId) ? { companyId } : {}),

                // Products
                productsExhibited: body.productsExhibited ? String(body.productsExhibited).trim() : null,

                // Business results
                b2bMeetings: toIntOrNull(body.b2bMeetings),
                existingCustomers: toIntOrNull(body.existingCustomers),
                newContacts: toIntOrNull(body.newContacts),
                visitorsCountries: body.visitorsCountries ? String(body.visitorsCountries).trim() : null,
                ordersBooked: toDecimalOrNull(body.ordersBooked),
                expectedOrders: toDecimalOrNull(body.expectedOrders),

                // Unmaterialized inquiries
                hadUnmaterializedInquiries: toBoolOrNull(body.hadUnmaterializedInquiries),
                unmaterializedReasons: toJsonArrayString(body.unmaterializedReasons),

                // Competition
                majorCompetitors: body.majorCompetitors ? String(body.majorCompetitors).trim() : null,
                competitorMarketingMethods: toJsonArrayString(body.competitorMarketingMethods),

                // Closing questions
                problemsFaced: body.problemsFaced ? String(body.problemsFaced).trim() : null,
                improvementSuggestions: body.improvementSuggestions ? String(body.improvementSuggestions).trim() : null,
                tdapRecommendations: body.tdapRecommendations ? String(body.tdapRecommendations).trim() : null,
                continueFairParticipation: toBoolOrNull(body.continueFairParticipation),
                satisfactionLevel: body.satisfactionLevel ? String(body.satisfactionLevel).trim() : null,
                additionalComments: body.additionalComments ? String(body.additionalComments).trim() : null,
            },
        });

        return NextResponse.json({ ok: true, feedbackId: feedback.id });
    } catch (error) {
        console.error('Error creating event feedback:', error);
        return NextResponse.json(
            { error: 'Failed to submit feedback' },
            { status: 500 }
        );
    }
}
