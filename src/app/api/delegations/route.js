import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

// ── helpers ──────────────────────────────────────────────────────────────────
const delegationSelect = {
    id: true,
    type: true,
    status: true,
    title: true,
    deskOfficer: true,
    division: true,
    productSector: true,   // legacy text field – kept for backward compat
    expectedDelegates: true,
    rationale: true,
    fromCountry: true,
    toCountry: true,
    startDate: true,
    endDate: true,
    allocatedBudget: true,
    utilizedBudget: true,
    closedAt: true,
    closingRemarks: true,
    sectors: {
        select: {
            sectorId: true,
            sector: { select: { id: true, name: true } },
        },
    },
    createdAt: true,
    updatedAt: true,
};

function serializeDelegation(d, participants = null) {
    const obj = {
        id: d.id,
        type: d.type,
        status: d.status,
        title: d.title,
        deskOfficer: d.deskOfficer,
        division: d.division,
        productSector: d.productSector,
        expectedDelegates: d.expectedDelegates,
        rationale: d.rationale,
        fromCountry: d.fromCountry,
        toCountry: d.toCountry,
        startDate: d.startDate,
        endDate: d.endDate,
        allocatedBudget: d.allocatedBudget ? Number(d.allocatedBudget) : null,
        utilizedBudget: d.utilizedBudget ? Number(d.utilizedBudget) : null,
        closedAt: d.closedAt,
        closingRemarks: d.closingRemarks,
        sectors: (d.sectors || []).map((s) => s.sector),
        sectorIds: (d.sectors || []).map((s) => s.sectorId),
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
    };
    if (participants !== null) {
        obj.participatingCompanyIds = participants.map((p) => p.companyId);
        obj.participants = participants.map((p) => p.company).filter(Boolean);
    }
    return obj;
}

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    // Get single delegation by ID
    const id = searchParams.get('id');
    if (id) {
        const delegationId = Number(id);
        if (Number.isNaN(delegationId)) {
            return NextResponse.json({ error: 'Invalid delegation id' }, { status: 400 });
        }

        const delegation = await prisma.delegation.findUnique({
            where: { id: delegationId },
            select: {
                ...delegationSelect,
                participants: {
                    select: {
                        companyId: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                                profile: true,
                                address: true,
                                email: true,
                                website: true,
                                representativeName: true,
                                productsToBeDisplayed: true,
                            },
                        },
                    },
                },
            },
        });

        if (!delegation) {
            return NextResponse.json({ error: 'Delegation not found' }, { status: 404 });
        }

        return NextResponse.json(serializeDelegation(delegation, delegation.participants));
    }

    // Get all delegations with optional filtering
    const type = searchParams.get('type'); // 'INCOMING' or 'OUTGOING'
    const status = searchParams.get('status'); // 'ACTIVE' or 'CLOSED'

    const where = {};
    if (type && (type === 'INCOMING' || type === 'OUTGOING')) where.type = type;
    if (status && (status === 'ACTIVE' || status === 'CLOSED')) where.status = status;

    const allDelegations = await prisma.delegation.findMany({
        where,
        select: {
            ...delegationSelect,
            participants: { select: { companyId: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const delegations = allDelegations.map((d) => {
        const s = serializeDelegation(d);
        s.participatingCompanyIds = d.participants.map((p) => p.companyId);
        return s;
    });

    return NextResponse.json({ delegations, total: delegations.length });
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request) {
    try {
        const body = await request.json();

        const type = body.type === 'INCOMING' || body.type === 'OUTGOING' ? body.type : null;
        if (!type) {
            return NextResponse.json({ error: 'Valid type (INCOMING or OUTGOING) is required' }, { status: 400 });
        }

        const sectorIds = Array.isArray(body.sectorIds)
            ? body.sectorIds.map(Number).filter((n) => !Number.isNaN(n))
            : [];

        const data = {
            type,
            title: body.title ? String(body.title).trim() : null,
            deskOfficer: body.deskOfficer ? String(body.deskOfficer).trim() : null,
            division: body.division ? String(body.division).trim() : null,
            productSector: body.productSector ? String(body.productSector).trim() : null,
            expectedDelegates: body.expectedDelegates ? String(body.expectedDelegates).trim() : null,
            rationale: body.rationale ? String(body.rationale).trim() : null,
            allocatedBudget: body.allocatedBudget != null ? Number(body.allocatedBudget) : null,
        };

        if (type === 'INCOMING') {
            data.fromCountry = body.fromCountry ? String(body.fromCountry).trim() : null;
        } else {
            data.toCountry = body.toCountry ? String(body.toCountry).trim() : null;
            data.startDate = body.startDate ? new Date(body.startDate) : null;
            data.endDate = body.endDate ? new Date(body.endDate) : null;
        }

        // Create delegation + sector junction rows in one transaction
        const delegation = await prisma.$transaction(async (tx) => {
            const d = await tx.delegation.create({
                data: {
                    ...data,
                    ...(sectorIds.length > 0
                        ? { sectors: { create: sectorIds.map((sid) => ({ sectorId: sid })) } }
                        : {}),
                },
                select: { ...delegationSelect },
            });
            return d;
        });

        return NextResponse.json(serializeDelegation(delegation), { status: 201 });
    } catch (error) {
        console.error('Error creating delegation:', error);
        return NextResponse.json({ error: 'Failed to create delegation' }, { status: 500 });
    }
}

// ── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(request) {
    try {
        const body = await request.json();
        const delegationId = Number(body.id);

        if (Number.isNaN(delegationId)) {
            return NextResponse.json({ error: 'Valid delegation id is required' }, { status: 400 });
        }

        const data = {};
        if (body.title !== undefined) data.title = body.title ? String(body.title).trim() : null;
        if (body.deskOfficer !== undefined) data.deskOfficer = body.deskOfficer ? String(body.deskOfficer).trim() : null;
        if (body.division !== undefined) data.division = body.division ? String(body.division).trim() : null;
        if (body.productSector !== undefined) data.productSector = body.productSector ? String(body.productSector).trim() : null;
        if (body.expectedDelegates !== undefined) data.expectedDelegates = body.expectedDelegates ? String(body.expectedDelegates).trim() : null;
        if (body.rationale !== undefined) data.rationale = body.rationale ? String(body.rationale).trim() : null;
        if (body.allocatedBudget !== undefined) data.allocatedBudget = body.allocatedBudget != null ? Number(body.allocatedBudget) : null;
        if (body.fromCountry !== undefined) data.fromCountry = body.fromCountry ? String(body.fromCountry).trim() : null;
        if (body.toCountry !== undefined) data.toCountry = body.toCountry ? String(body.toCountry).trim() : null;
        if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
        if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

        const delegation = await prisma.$transaction(async (tx) => {
            // Replace sector junction rows when sectorIds is provided
            if (Array.isArray(body.sectorIds)) {
                const sectorIds = body.sectorIds.map(Number).filter((n) => !Number.isNaN(n));
                await tx.delegationSector.deleteMany({ where: { delegationId } });
                if (sectorIds.length > 0) {
                    await tx.delegationSector.createMany({
                        data: sectorIds.map((sid) => ({ delegationId, sectorId: sid })),
                    });
                }
            }

            return tx.delegation.update({
                where: { id: delegationId },
                data,
                select: { ...delegationSelect },
            });
        });

        return NextResponse.json(serializeDelegation(delegation));
    } catch (error) {
        console.error('Error updating delegation:', error);
        return NextResponse.json({ error: 'Failed to update delegation' }, { status: 500 });
    }
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const delegationId = Number(searchParams.get('id'));

        if (Number.isNaN(delegationId)) {
            return NextResponse.json({ error: 'Valid delegation id is required' }, { status: 400 });
        }

        await prisma.delegation.delete({ where: { id: delegationId } });

        return NextResponse.json({ ok: true, deletedId: delegationId });
    } catch (error) {
        console.error('Error deleting delegation:', error);
        return NextResponse.json({ error: 'Failed to delete delegation' }, { status: 500 });
    }
}
