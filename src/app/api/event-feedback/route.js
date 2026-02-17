import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

const ALLOWED_SOURCES = new Set(['COMPANY', 'MISSION']);

export async function POST(request) {
    try {
        const body = await request.json();
        const eventId = Number(body.eventId);
        const sourceType = String(body.sourceType || '').toUpperCase();
        const sourceName = body.sourceName ? String(body.sourceName).trim() : null;
        const sourceEmail = body.sourceEmail ? String(body.sourceEmail).trim() : null;
        const rating =
            typeof body.rating === 'number'
                ? body.rating
                : body.rating != null
                    ? Number(body.rating)
                    : null;
        const comments = body.comments ? String(body.comments).trim() : null;

        if (Number.isNaN(eventId)) {
            return NextResponse.json({ error: 'Valid eventId is required' }, { status: 400 });
        }

        if (!ALLOWED_SOURCES.has(sourceType)) {
            return NextResponse.json({ error: 'Invalid sourceType' }, { status: 400 });
        }

        const feedback = await prisma.eventFeedback.create({
            data: {
                eventId,
                sourceType,
                sourceName,
                sourceEmail,
                rating: rating && !Number.isNaN(rating) ? rating : null,
                comments,
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

