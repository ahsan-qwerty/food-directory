import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const body = await request.json();
        const eventId = Number(body.eventId);
        const finalRemarks = body.finalRemarks ? String(body.finalRemarks).trim() : '';

        if (Number.isNaN(eventId)) {
            return NextResponse.json({ error: 'Valid eventId is required' }, { status: 400 });
        }

        const updated = await prisma.event.update({
            where: { id: eventId },
            data: { finalRemarks },
            select: { id: true, finalRemarks: true },
        });

        return NextResponse.json({ ok: true, event: updated });
    } catch (error) {
        console.error('Error updating final remarks:', error);
        return NextResponse.json(
            { error: 'Failed to save final remarks' },
            { status: 500 }
        );
    }
}

