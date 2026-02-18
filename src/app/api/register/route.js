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

        // Prepare company data matching the Prisma schema
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
            sectorId: data.sectorId ? parseInt(data.sectorId) : null,
            subSectorId: data.subSectorId ? parseInt(data.subSectorId) : null,
        };

        // Validate sector/subSector relationship if both are provided
        if (companyData.sectorId && companyData.subSectorId) {
            const subSector = await prisma.subSector.findUnique({
                where: { id: companyData.subSectorId },
                select: { sectorId: true },
            });

            if (!subSector) {
                return NextResponse.json(
                    { error: 'Invalid sub-sector selected' },
                    { status: 400 }
                );
            }

            if (subSector.sectorId !== companyData.sectorId) {
                return NextResponse.json(
                    { error: 'Selected sub-sector does not belong to the selected sector' },
                    { status: 400 }
                );
            }
        }

        // Create company in database
        const newCompany = await prisma.company.create({
            data: companyData,
            include: {
                sector: {
                    select: { id: true, name: true },
                },
                subSector: {
                    select: { id: true, name: true },
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
                sector: newCompany.sector,
                subSector: newCompany.subSector,
                createdAt: newCompany.createdAt,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle Prisma unique constraint errors
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A company with this name already exists' },
                { status: 409 }
            );
        }

        // Handle foreign key constraint errors
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
