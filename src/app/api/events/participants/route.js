import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function DELETE(request) {
    try {
        const body = await request.json();
        const eventId = Number(body.eventId);
        const companyId = Number(body.companyId);

        if (Number.isNaN(eventId) || Number.isNaN(companyId)) {
            return NextResponse.json({ error: 'Valid eventId and companyId are required' }, { status: 400 });
        }

        await prisma.eventCompany.deleteMany({
            where: { eventId, companyId },
        });

        return NextResponse.json({ ok: true, eventId, companyId });
    } catch (error) {
        console.error('Error removing event participant:', error);
        return NextResponse.json(
            { error: 'Failed to remove participant' },
            { status: 500 }
        );
    }
}

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

        await prisma.eventCompany.deleteMany({ where: { eventId } });
        await prisma.eventCompany.createMany({
            data: companyIds.map((companyId) => ({ eventId, companyId })),
            skipDuplicates: true,
        });

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

