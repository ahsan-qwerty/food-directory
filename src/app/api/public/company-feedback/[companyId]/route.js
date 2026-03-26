import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

export const runtime = 'nodejs';

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/public/company-feedback/[companyId]
   Public endpoint — no auth required. Used by the company feedback page that
   is accessed via the emailed link.
   Body: { date: string (YYYY-MM-DD), text: string }
───────────────────────────────────────────────────────────────────────────── */
export async function POST(request, { params }) {
    const { companyId: companyIdParam } = await params;
    const companyId = parseInt(companyIdParam, 10);

    if (isNaN(companyId)) {
        return NextResponse.json({ error: 'Invalid company ID.' }, { status: 400 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { date, text } = body;

    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'A valid date (YYYY-MM-DD) is required.' }, { status: 400 });
    }
    if (!text || typeof text !== 'string' || !text.trim()) {
        return NextResponse.json({ error: 'Feedback text is required.' }, { status: 400 });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
    });

    if (!company) {
        return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
    }

    // Parse to UTC midnight
    const [year, month, day] = date.split('-').map(Number);
    const feedbackDate = new Date(Date.UTC(year, month - 1, day));

    // Upsert: one entry per company per day
    const entry = await prisma.companyDailyFeedback.upsert({
        where: { companyId_date: { companyId, date: feedbackDate } },
        update: { text: text.trim() },
        create: { companyId, date: feedbackDate, text: text.trim() },
        select: { id: true, date: true, text: true, createdAt: true },
    });

    return NextResponse.json({ entry }, { status: 200 });
}
