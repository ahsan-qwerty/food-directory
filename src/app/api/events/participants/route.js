import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const body = await request.json();
        const eventId = Number(body.eventId);
        const companyIds = Array.isArray(body.companyIds)
            ? body.companyIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n))
            : [];

        if (Number.isNaN(eventId)) {
            return NextResponse.json({ error: 'Valid eventId is required' }, { status: 400 });
        }

        if (companyIds.length === 0) {
            return NextResponse.json({ error: 'At least one companyId is required' }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.eventCompany.deleteMany({ where: { eventId } }),
            prisma.eventCompany.createMany({
                data: companyIds.map((companyId) => ({ eventId, companyId })),
                skipDuplicates: true,
            }),
        ]);

        return NextResponse.json({
            ok: true,
            eventId,
            companyIds,
        });
    } catch (error) {
        console.error('Error updating event participants:', error);
        return NextResponse.json(
            { error: 'Failed to update participants' },
            { status: 500 }
        );
    }
}

