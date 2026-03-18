import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

export const runtime = 'nodejs';

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/companies/[id]/daily-feedback
   Returns all daily feedback entries for a company, newest date first.
───────────────────────────────────────────────────────────────────────────── */
export async function GET(request, { params }) {
    const { id } = await params;
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
        return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    const entries = await prisma.companyDailyFeedback.findMany({
        where: { companyId },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        select: { id: true, date: true, text: true, createdAt: true },
    });

    return NextResponse.json({ entries });
}

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/companies/[id]/daily-feedback
   Body: { registrationCode: string, date: string (YYYY-MM-DD), text: string }

   Authentication: registrationCode must be one of the valid codes in the
   REGISTER_CODES environment variable (comma-separated list).
───────────────────────────────────────────────────────────────────────────── */
export async function POST(request, { params }) {
    const { id } = await params;
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
        return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { registrationCode, date, text } = body;

    // Validate fields
    if (!registrationCode || typeof registrationCode !== 'string') {
        return NextResponse.json({ error: 'Registration code is required.' }, { status: 400 });
    }
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'A valid date (YYYY-MM-DD) is required.' }, { status: 400 });
    }
    if (!text || typeof text !== 'string' || !text.trim()) {
        return NextResponse.json({ error: 'Feedback text is required.' }, { status: 400 });
    }

    // Check code against REGISTER_CODES env var
    const validCodes = (process.env.REGISTER_CODES || '')
        .split(',')
        .map(c => c.trim().toUpperCase())
        .filter(Boolean);

    if (validCodes.length === 0 || !validCodes.includes(registrationCode.trim().toUpperCase())) {
        return NextResponse.json({ error: 'Invalid registration code.' }, { status: 403 });
    }

    // Verify the company exists
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
    });

    if (!company) {
        return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
    }

    // Parse date string to UTC midnight Date object
    const [year, month, day] = date.split('-').map(Number);
    const feedbackDate = new Date(Date.UTC(year, month - 1, day));

    const entry = await prisma.companyDailyFeedback.create({
        data: {
            companyId,
            date: feedbackDate,
            text: text.trim(),
        },
        select: { id: true, date: true, text: true, createdAt: true },
    });

    return NextResponse.json({ entry }, { status: 201 });
}
