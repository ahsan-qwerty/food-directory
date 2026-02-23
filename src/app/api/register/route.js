import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const data = await request.json();

        // Validation
        if (!data.name || !data.name.trim()) {
            return NextResponse.json(
                { error: 'Company name is required' },
                { status: 400 }
            );
        }

        // Normalise the multi-select arrays coming from the form
        const sectorIds = Array.isArray(data.sectorIds) ? data.sectorIds.map(Number).filter(Boolean) : [];
        const subSectorIds = Array.isArray(data.subSectorIds) ? data.subSectorIds.map(Number).filter(Boolean) : [];

        // Primary (legacy) FK values — first item in each array
        const primarySectorId = sectorIds[0] ?? null;
        const primarySubSectorId = subSectorIds[0] ?? null;

        // Validate that every supplied sectorId actually exists
        if (sectorIds.length > 0) {
            const found = await prisma.sector.findMany({
                where: { id: { in: sectorIds } },
                select: { id: true },
            });
            if (found.length !== sectorIds.length) {
                return NextResponse.json(
                    { error: 'One or more selected sectors are invalid' },
                    { status: 400 }
                );
            }
        }

        // Validate that every supplied subSectorId actually exists
        if (subSectorIds.length > 0) {
            const found = await prisma.subSector.findMany({
                where: { id: { in: subSectorIds } },
                select: { id: true },
            });
            if (found.length !== subSectorIds.length) {
                return NextResponse.json(
                    { error: 'One or more selected sub-sectors are invalid' },
                    { status: 400 }
                );
            }
        }

        // Prepare company data
        const companyData = {
            name: data.name.trim(),
            profile: data.profile?.trim() || null,
            address: data.address?.trim() || null,
            email: data.email?.trim() || null,
            website: data.website?.trim() || null,
            representativeName: data.representativeName?.trim() || null,
            representativeTel: data.representativeTel?.trim() || null,
            representativeWhatsapp: data.representativeWhatsapp?.trim() || null,
            representativeEmail: data.representativeEmail?.trim() || null,
            productsToBeDisplayed: data.productsToBeDisplayed?.trim() || null,
            // Legacy single-FK fields (primary selection)
            sectorId: primarySectorId,
            subSectorId: primarySubSectorId,
            // Many-to-many: create junction records for every selected ID
            sectors: sectorIds.length > 0
                ? { create: sectorIds.map(id => ({ sectorId: id })) }
                : undefined,
            subSectors: subSectorIds.length > 0
                ? { create: subSectorIds.map(id => ({ subSectorId: id })) }
                : undefined,
        };

        // Create company + junction records in one transaction
        const newCompany = await prisma.company.create({
            data: companyData,
            include: {
                sector: { select: { id: true, name: true } },
                subSector: { select: { id: true, name: true } },
                sectors: {
                    include: { sector: { select: { id: true, name: true } } },
                },
                subSectors: {
                    include: { subSector: { select: { id: true, name: true } } },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Company registered successfully',
            company: {
                id: newCompany.id,
                name: newCompany.name,
                profile: newCompany.profile,
                address: newCompany.address,
                email: newCompany.email,
                website: newCompany.website,
                representativeName: newCompany.representativeName,
                representativeTel: newCompany.representativeTel,
                representativeWhatsapp: newCompany.representativeWhatsapp,
                representativeEmail: newCompany.representativeEmail,
                productsToBeDisplayed: newCompany.productsToBeDisplayed,
                // Primary FK (backward compat)
                sector: newCompany.sector,
                subSector: newCompany.subSector,
                // Full many-to-many lists
                sectors: newCompany.sectors.map(cs => cs.sector),
                subSectors: newCompany.subSectors.map(css => css.subSector),
                createdAt: newCompany.createdAt,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A company with this name already exists' },
                { status: 409 }
            );
        }

        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'Invalid sector or sub-sector selected' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to register company. Please try again.' },
            { status: 500 }
        );
    }
}
