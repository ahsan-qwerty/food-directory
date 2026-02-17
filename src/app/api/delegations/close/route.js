import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const body = await request.json();
        const delegationId = Number(body.delegationId);
        const utilizedBudget = body.utilizedBudget != null ? Number(body.utilizedBudget) : null;
        const closingRemarks = body.closingRemarks ? String(body.closingRemarks).trim() : null;

        if (Number.isNaN(delegationId)) {
            return NextResponse.json({ error: 'Valid delegationId is required' }, { status: 400 });
        }

        const updated = await prisma.delegation.update({
            where: { id: delegationId },
            data: {
                status: 'CLOSED',
                utilizedBudget: utilizedBudget != null ? utilizedBudget : undefined,
                closingRemarks,
                closedAt: new Date(),
            },
            select: {
                id: true,
                status: true,
                utilizedBudget: true,
                closingRemarks: true,
                closedAt: true,
            },
        });

        return NextResponse.json({
            ok: true,
            delegation: {
                id: updated.id,
                status: updated.status,
                utilizedBudget: updated.utilizedBudget ? Number(updated.utilizedBudget) : null,
                closingRemarks: updated.closingRemarks,
                closedAt: updated.closedAt,
            },
        });
    } catch (error) {
        console.error('Error closing delegation:', error);
        return NextResponse.json(
            { error: 'Failed to close delegation' },
            { status: 500 }
        );
    }
}
