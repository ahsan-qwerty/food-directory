import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

function toNumberOrNull(value) {
    if (value == null || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

const VALID_STATUSES = ['PLANNED', 'COMPLETED', 'CANCELLED'];

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    // Single seminar by id
    const id = searchParams.get('id');
    if (id) {
        const seminarId = Number(id);
        if (Number.isNaN(seminarId)) {
            return NextResponse.json({ error: 'Invalid seminar id' }, { status: 400 });
        }

        const seminar = await prisma.seminar.findUnique({
            where: { id: seminarId },
        });

        if (!seminar) {
            return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...seminar,
            proposedBudget: seminar.proposedBudget ? Number(seminar.proposedBudget) : null,
        });
    }

    // Optional status filter
    const statusFilter = searchParams.get('status');
    const where = {};
    if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
        where.status = statusFilter;
    }

    const all = await prisma.seminar.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    const seminars = all.map((s) => ({
        ...s,
        proposedBudget: s.proposedBudget ? Number(s.proposedBudget) : null,
    }));

    return NextResponse.json({ seminars, total: seminars.length });
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.title || !String(body.title).trim()) {
            return NextResponse.json({ error: 'Seminar title is required' }, { status: 400 });
        }

        const data = {
            title: String(body.title).trim(),
            productSector: body.productSector ? String(body.productSector).trim() : null,
            cityVenue: body.cityVenue ? String(body.cityVenue).trim() : null,
            tentativeDate: body.tentativeDate ? String(body.tentativeDate).trim() : null,
            proposedBudget: toNumberOrNull(body.proposedBudget),
            division: body.division ? String(body.division).trim() : null,
            regionalCollaboration: body.regionalCollaboration ? String(body.regionalCollaboration).trim() : null,
            rationaleObjective: body.rationaleObjective ? String(body.rationaleObjective).trim() : null,
            deskOfficer: body.deskOfficer ? String(body.deskOfficer).trim() : null,
            finalRemarks: body.finalRemarks ? String(body.finalRemarks).trim() : null,
            status: VALID_STATUSES.includes(body.status) ? body.status : 'PLANNED',
        };

        const seminar = await prisma.seminar.create({ data });

        return NextResponse.json(
            { ...seminar, proposedBudget: seminar.proposedBudget ? Number(seminar.proposedBudget) : null },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating seminar:', error);
        return NextResponse.json({ error: 'Failed to create seminar' }, { status: 500 });
    }
}

// ── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(request) {
    try {
        const body = await request.json();
        const seminarId = Number(body.id);

        if (Number.isNaN(seminarId)) {
            return NextResponse.json({ error: 'Valid seminar id is required' }, { status: 400 });
        }

        if (body.title !== undefined && !String(body.title).trim()) {
            return NextResponse.json({ error: 'Seminar title cannot be empty' }, { status: 400 });
        }

        const data = {};
        if (body.title !== undefined) data.title = String(body.title).trim();
        if (body.productSector !== undefined) data.productSector = body.productSector ? String(body.productSector).trim() : null;
        if (body.cityVenue !== undefined) data.cityVenue = body.cityVenue ? String(body.cityVenue).trim() : null;
        if (body.tentativeDate !== undefined) data.tentativeDate = body.tentativeDate ? String(body.tentativeDate).trim() : null;
        if (body.proposedBudget !== undefined) data.proposedBudget = toNumberOrNull(body.proposedBudget);
        if (body.division !== undefined) data.division = body.division ? String(body.division).trim() : null;
        if (body.regionalCollaboration !== undefined) data.regionalCollaboration = body.regionalCollaboration ? String(body.regionalCollaboration).trim() : null;
        if (body.rationaleObjective !== undefined) data.rationaleObjective = body.rationaleObjective ? String(body.rationaleObjective).trim() : null;
        if (body.deskOfficer !== undefined) data.deskOfficer = body.deskOfficer ? String(body.deskOfficer).trim() : null;
        if (body.finalRemarks !== undefined) data.finalRemarks = body.finalRemarks ? String(body.finalRemarks).trim() : null;
        if (body.status !== undefined && VALID_STATUSES.includes(body.status)) data.status = body.status;

        const seminar = await prisma.seminar.update({
            where: { id: seminarId },
            data,
        });

        return NextResponse.json({
            ...seminar,
            proposedBudget: seminar.proposedBudget ? Number(seminar.proposedBudget) : null,
        });
    } catch (error) {
        console.error('Error updating seminar:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to update seminar' }, { status: 500 });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const seminarId = Number(searchParams.get('id'));

        if (Number.isNaN(seminarId)) {
            return NextResponse.json({ error: 'Valid seminar id is required' }, { status: 400 });
        }

        await prisma.seminar.delete({ where: { id: seminarId } });

        return NextResponse.json({ ok: true, deletedId: seminarId });
    } catch (error) {
        console.error('Error deleting seminar:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to delete seminar' }, { status: 500 });
    }
}
