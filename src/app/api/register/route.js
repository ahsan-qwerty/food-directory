import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prismaClient';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const data = await request.json();

        // ── Validate authorization code ──────────────────────────────────────
        const submittedCode = typeof data.registrationCode === 'string' ? data.registrationCode.trim().toUpperCase() : '';
        const raw = process.env.REGISTER_CODES || '';
        const validCodes = raw.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
        if (validCodes.length === 0 || !validCodes.includes(submittedCode)) {
            return NextResponse.json({ error: 'Invalid or missing authorization code.' }, { status: 403 });
        }
        // ────────────────────────────────────────────────────────────────────

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

        const VALID_GCC = ['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];
        const gccCountries = Array.isArray(data.gccCountries)
            ? data.gccCountries.filter(c => VALID_GCC.includes(c))
            : [];

        // Normalize countries already exporting to (can be array or comma-separated string)
        const countriesAlreadyExportingTo = Array.isArray(data.countriesAlreadyExportingTo)
            ? data.countriesAlreadyExportingTo.filter(c => c && c.trim().length > 0).map(c => c.trim())
            : typeof data.countriesAlreadyExportingTo === 'string'
                ? data.countriesAlreadyExportingTo.split(',').map(c => c.trim()).filter(c => c.length > 0)
                : [];

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
            registrationCode: submittedCode,
            profile: data.profile?.trim() || null,
            address: data.address?.trim() || null,
            email: data.email?.trim() || null,
            website: data.website?.trim() || null,
            representativeName: data.representativeName?.trim() || null,
            representativeTel: data.representativeTel?.trim() || null,
            representativeWhatsapp: data.representativeWhatsapp?.trim() || null,
            representativeEmail: data.representativeEmail?.trim() || null,
            productsToBeDisplayed: data.productsToBeDisplayed?.trim() || null,
            willingToExportToGCC: Boolean(data.willingToExportToGCC),
            gccCountries,
            countriesAlreadyExportingTo,
            countryExports: (typeof data.countryExports === 'object' && data.countryExports !== null && !Array.isArray(data.countryExports))
                ? Object.fromEntries(
                    Object.entries(data.countryExports)
                        .filter(([, v]) => v !== '' && v != null)
                        .map(([k, v]) => [k, parseFloat(v)])
                        .filter(([, v]) => !isNaN(v))
                )
                : {},
            productExports: (typeof data.productExports === 'object' && data.productExports !== null && !Array.isArray(data.productExports))
                ? Object.fromEntries(
                    Object.entries(data.productExports)
                        .filter(([, v]) => v !== '' && v != null)
                        .map(([k, v]) => [k, parseFloat(v)])
                        .filter(([, v]) => !isNaN(v))
                )
                : {},
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
                willingToExportToGCC: newCompany.willingToExportToGCC,
                gccCountries: newCompany.gccCountries,
                countriesAlreadyExportingTo: newCompany.countriesAlreadyExportingTo,
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
