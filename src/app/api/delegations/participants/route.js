import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function DELETE(request) {
    try {
        const body = await request.json();
        const delegationId = Number(body.delegationId);
        const companyId    = Number(body.companyId);

        if (Number.isNaN(delegationId) || Number.isNaN(companyId)) {
            return NextResponse.json({ error: 'Valid delegationId and companyId are required' }, { status: 400 });
        }

        await prisma.delegationCompany.delete({
            where: { delegationId_companyId: { delegationId, companyId } },
        });

        return NextResponse.json({ ok: true, delegationId, companyId });
    } catch (error) {
        console.error('Error removing delegation participant:', error);
        return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const delegationId = Number(body.delegationId);
        const companyIds = Array.isArray(body.companyIds)
            ? body.companyIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n))
            : [];

        if (Number.isNaN(delegationId)) {
            return NextResponse.json({ error: 'Valid delegationId is required' }, { status: 400 });
        }

        if (companyIds.length === 0) {
            return NextResponse.json({ error: 'At least one companyId is required' }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.delegationCompany.deleteMany({ where: { delegationId } }),
            prisma.delegationCompany.createMany({
                data: companyIds.map((companyId) => ({ delegationId, companyId })),
                skipDuplicates: true,
            }),
        ]);

        return NextResponse.json({
            ok: true,
            delegationId,
            companyIds,
        });
    } catch (error) {
        console.error('Error updating delegation participants:', error);
        return NextResponse.json(
            { error: 'Failed to update participants' },
            { status: 500 }
        );
    }
}
