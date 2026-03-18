import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prismaClient';

export const runtime = 'nodejs';

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/companies/[id]/daily-feedback/[feedbackId]
   Body: { registrationCode: string }

   Authentication: registrationCode must be one of the valid codes in the
   REGISTER_CODES environment variable (comma-separated list).
───────────────────────────────────────────────────────────────────────────── */
export async function DELETE(request, { params }) {
    const { id, feedbackId: feedbackIdParam } = await params;
    const companyId = parseInt(id, 10);
    const feedbackId = parseInt(feedbackIdParam, 10);

    if (isNaN(companyId) || isNaN(feedbackId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    let body = {};
    try { body = await request.json(); } catch { /* no body is fine */ }

    const { registrationCode } = body;

    if (!registrationCode || typeof registrationCode !== 'string') {
        return NextResponse.json({ error: 'Registration code is required.' }, { status: 400 });
    }

    // Check code against REGISTER_CODES env var
    const validCodes = (process.env.REGISTER_CODES || '')
        .split(',')
        .map(c => c.trim().toUpperCase())
        .filter(Boolean);

    if (validCodes.length === 0 || !validCodes.includes(registrationCode.trim().toUpperCase())) {
        return NextResponse.json({ error: 'Invalid registration code.' }, { status: 403 });
    }

    // Make sure the feedback entry exists and belongs to this company
    const entry = await prisma.companyDailyFeedback.findFirst({
        where: { id: feedbackId, companyId },
    });

    if (!entry) {
        return NextResponse.json({ error: 'Feedback entry not found.' }, { status: 404 });
    }

    await prisma.companyDailyFeedback.delete({ where: { id: feedbackId } });

    return NextResponse.json({ success: true });
}
