import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

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
                id: true,
                type: true,
                status: true,
                division: true,
                productSector: true,
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
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!delegation) {
            return NextResponse.json(
                { error: 'Delegation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: delegation.id,
            type: delegation.type,
            status: delegation.status,
            division: delegation.division,
            productSector: delegation.productSector,
            expectedDelegates: delegation.expectedDelegates,
            rationale: delegation.rationale,
            fromCountry: delegation.fromCountry,
            toCountry: delegation.toCountry,
            startDate: delegation.startDate,
            endDate: delegation.endDate,
            allocatedBudget: delegation.allocatedBudget ? Number(delegation.allocatedBudget) : null,
            utilizedBudget: delegation.utilizedBudget ? Number(delegation.utilizedBudget) : null,
            closedAt: delegation.closedAt,
            closingRemarks: delegation.closingRemarks,
            participatingCompanyIds: delegation.participants.map((p) => p.companyId),
            participants: delegation.participants.map((p) => p.company).filter(Boolean),
            createdAt: delegation.createdAt,
            updatedAt: delegation.updatedAt,
        });
    }

    // Get all delegations with optional filtering
    const type = searchParams.get('type'); // 'INCOMING' or 'OUTGOING'
    const status = searchParams.get('status'); // 'ACTIVE' or 'CLOSED'

    const where = {};
    if (type && (type === 'INCOMING' || type === 'OUTGOING')) {
        where.type = type;
    }
    if (status && (status === 'ACTIVE' || status === 'CLOSED')) {
        where.status = status;
    }

    const allDelegations = await prisma.delegation.findMany({
        where,
        select: {
            id: true,
            type: true,
            status: true,
            division: true,
            productSector: true,
            expectedDelegates: true,
            rationale: true,
            fromCountry: true,
            toCountry: true,
            startDate: true,
            endDate: true,
            allocatedBudget: true,
            utilizedBudget: true,
            closedAt: true,
            participants: { select: { companyId: true } },
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    const delegations = allDelegations.map((d) => ({
        id: d.id,
        type: d.type,
        status: d.status,
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
        participatingCompanyIds: d.participants.map((p) => p.companyId),
        createdAt: d.createdAt,
    }));

    return NextResponse.json({
        delegations,
        total: delegations.length
    });
}

export async function POST(request) {
    try {
        const body = await request.json();

        const type = body.type === 'INCOMING' || body.type === 'OUTGOING' ? body.type : null;
        if (!type) {
            return NextResponse.json({ error: 'Valid type (INCOMING or OUTGOING) is required' }, { status: 400 });
        }

        const data = {
            type,
            division: body.division ? String(body.division).trim() : null,
            productSector: body.productSector ? String(body.productSector).trim() : null,
            expectedDelegates: body.expectedDelegates ? String(body.expectedDelegates).trim() : null,
            rationale: body.rationale ? String(body.rationale).trim() : null,
            allocatedBudget: body.allocatedBudget != null ? Number(body.allocatedBudget) : null,
        };

        // Type-specific fields
        if (type === 'INCOMING') {
            data.fromCountry = body.fromCountry ? String(body.fromCountry).trim() : null;
        } else if (type === 'OUTGOING') {
            data.toCountry = body.toCountry ? String(body.toCountry).trim() : null;
            data.startDate = body.startDate ? new Date(body.startDate) : null;
            data.endDate = body.endDate ? new Date(body.endDate) : null;
        }

        const delegation = await prisma.delegation.create({
            data,
            select: {
                id: true,
                type: true,
                status: true,
                division: true,
                productSector: true,
                expectedDelegates: true,
                rationale: true,
                fromCountry: true,
                toCountry: true,
                startDate: true,
                endDate: true,
                allocatedBudget: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            id: delegation.id,
            type: delegation.type,
            status: delegation.status,
            division: delegation.division,
            productSector: delegation.productSector,
            expectedDelegates: delegation.expectedDelegates,
            rationale: delegation.rationale,
            fromCountry: delegation.fromCountry,
            toCountry: delegation.toCountry,
            startDate: delegation.startDate,
            endDate: delegation.endDate,
            allocatedBudget: delegation.allocatedBudget ? Number(delegation.allocatedBudget) : null,
            createdAt: delegation.createdAt,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating delegation:', error);
        return NextResponse.json(
            { error: 'Failed to create delegation' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const delegationId = Number(body.id);

        if (Number.isNaN(delegationId)) {
            return NextResponse.json({ error: 'Valid delegation id is required' }, { status: 400 });
        }

        const data = {};
        if (body.division !== undefined) data.division = body.division ? String(body.division).trim() : null;
        if (body.productSector !== undefined) data.productSector = body.productSector ? String(body.productSector).trim() : null;
        if (body.expectedDelegates !== undefined) data.expectedDelegates = body.expectedDelegates ? String(body.expectedDelegates).trim() : null;
        if (body.rationale !== undefined) data.rationale = body.rationale ? String(body.rationale).trim() : null;
        if (body.allocatedBudget !== undefined) data.allocatedBudget = body.allocatedBudget != null ? Number(body.allocatedBudget) : null;
        if (body.fromCountry !== undefined) data.fromCountry = body.fromCountry ? String(body.fromCountry).trim() : null;
        if (body.toCountry !== undefined) data.toCountry = body.toCountry ? String(body.toCountry).trim() : null;
        if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
        if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

        const delegation = await prisma.delegation.update({
            where: { id: delegationId },
            data,
            select: {
                id: true,
                type: true,
                status: true,
                division: true,
                productSector: true,
                expectedDelegates: true,
                rationale: true,
                fromCountry: true,
                toCountry: true,
                startDate: true,
                endDate: true,
                allocatedBudget: true,
                utilizedBudget: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            id: delegation.id,
            type: delegation.type,
            status: delegation.status,
            division: delegation.division,
            productSector: delegation.productSector,
            expectedDelegates: delegation.expectedDelegates,
            rationale: delegation.rationale,
            fromCountry: delegation.fromCountry,
            toCountry: delegation.toCountry,
            startDate: delegation.startDate,
            endDate: delegation.endDate,
            allocatedBudget: delegation.allocatedBudget ? Number(delegation.allocatedBudget) : null,
            utilizedBudget: delegation.utilizedBudget ? Number(delegation.utilizedBudget) : null,
            updatedAt: delegation.updatedAt,
        });
    } catch (error) {
        console.error('Error updating delegation:', error);
        return NextResponse.json(
            { error: 'Failed to update delegation' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const delegationId = Number(searchParams.get('id'));

        if (Number.isNaN(delegationId)) {
            return NextResponse.json({ error: 'Valid delegation id is required' }, { status: 400 });
        }

        await prisma.delegation.delete({
            where: { id: delegationId },
        });

        return NextResponse.json({ ok: true, deletedId: delegationId });
    } catch (error) {
        console.error('Error deleting delegation:', error);
        return NextResponse.json(
            { error: 'Failed to delete delegation' },
            { status: 500 }
        );
    }
}
