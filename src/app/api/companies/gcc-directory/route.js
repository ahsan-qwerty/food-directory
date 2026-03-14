import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

// Helper: draw a labeled field row; returns new Y position
function drawField(doc, label, value, x, y, labelWidth, valueMaxWidth, lineHeight) {
    if (!value && value !== 0) return y;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#444444');
    doc.text(label, x, y, { width: labelWidth, lineBreak: false });
    doc.font('Helvetica').fontSize(10).fillColor('#111111');
    const valueX = x + labelWidth + 8;
    const textHeight = doc.heightOfString(String(value), { width: valueMaxWidth });
    doc.text(String(value), valueX, y, { width: valueMaxWidth });
    return y + Math.max(lineHeight, textHeight) + 6;
}

function sanitize(val) {
    if (val == null) return null;
    const s = String(val).trim();
    return s.length > 0 ? s : null;
}

const GCC_COUNTRIES = ['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country'); // 'UAE', 'KSA', etc., or 'all' for combined

    if (!country) {
        return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
    }

    // Fetch all companies — willingToExportToGCC toggle is ignored so that
    // any company with the selected country in gccCountries is included.
    let companies = await prisma.company.findMany({
        where: undefined,
        select: {
            id: true,
            name: true,
            profile: true,
            address: true,
            email: true,
            website: true,
            representativeName: true,
            representativeTel: true,
            representativeWhatsapp: true,
            representativeEmail: true,
            productsToBeDisplayed: true,
            gccCountries: true,
            sector: { select: { name: true } },
            subSector: { select: { name: true } },
            sectors: {
                include: {
                    sector: { select: { name: true } },
                },
            },
            subSectors: {
                include: {
                    subSector: { select: { name: true } },
                },
            },
        },
        orderBy: { name: 'asc' },
    });

    // Normalise gccCountries — MariaDB may return JSON columns as raw strings
    companies = companies.map(company => ({
        ...company,
        gccCountries: Array.isArray(company.gccCountries)
            ? company.gccCountries
            : typeof company.gccCountries === 'string'
                ? (() => { try { return JSON.parse(company.gccCountries); } catch { return []; } })()
                : [],
    }));

    // Filter by GCC country if not 'all'
    if (country !== 'all') {
        if (!GCC_COUNTRIES.includes(country)) {
            return NextResponse.json({ error: 'Invalid GCC country' }, { status: 400 });
        }
        companies = companies.filter(company =>
            company.gccCountries.includes(country)
        );
    }

    if (companies.length === 0) {
        return NextResponse.json({
            error: country === 'all'
                ? 'No companies found targeting GCC countries'
                : `No companies found targeting ${country}`
        }, { status: 404 });
    }

    // Dynamically import pdfkit
    const PDFDocument = (await import('pdfkit')).default;

    const PAGE_W = 595.28;   // A4
    const PAGE_H = 841.89;   // A4
    const MARGIN = 50;
    const CW = PAGE_W - MARGIN * 2;
    const LINE_H = 18;
    const SECTION_GAP = 22;
    const FOOTER_Y = PAGE_H - MARGIN - 16;

    const doc = new PDFDocument({
        autoFirstPage: false,
        size: 'A4',
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
            Title: country === 'all'
                ? 'GCC Countries – Company Directory'
                : `${country} – Company Directory`,
            Author: 'TDAP Food Directory',
        },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    let totalCompanyCount = 0;
    let currentPageIndex = 0;

    if (country === 'all') {
        // For combined PDF, process each country group separately
        const groupedByCountry = {};
        GCC_COUNTRIES.forEach(gccCountry => {
            groupedByCountry[gccCountry] = companies.filter(company => {
                const companyGccCountries = Array.isArray(company.gccCountries)
                    ? company.gccCountries
                    : [];
                return companyGccCountries.includes(gccCountry);
            });
        });

        // Calculate total companies for page numbering
        totalCompanyCount = Object.values(groupedByCountry).reduce((sum, arr) => sum + arr.length, 0);

        // Process each country group: header + companies immediately
        GCC_COUNTRIES.forEach(gccCountry => {
            const countryCompanies = groupedByCountry[gccCountry];
            if (countryCompanies.length > 0) {
                // Add country section header page
                doc.addPage();
                currentPageIndex++;
                let y = MARGIN;
                doc.rect(MARGIN, y, CW, 5).fill('#166534');
                y += 40;

                doc.font('Helvetica-Bold').fontSize(32).fillColor('#14532d');
                doc.text(`${gccCountry} Company Directory`, MARGIN, y, { width: CW, align: 'center' });
                y += 50;

                doc.font('Helvetica').fontSize(14).fillColor('#666666');
                doc.text(`${countryCompanies.length} companies targeting ${gccCountry}`, MARGIN, y, { width: CW, align: 'center' });

                // Generate pages for companies in this country immediately
                for (let j = 0; j < countryCompanies.length; j++) {
                    const company = countryCompanies[j];
                    doc.addPage();
                    currentPageIndex++;

                    let y = MARGIN;

                    // ── Top accent bar ───────────────────────────────────────────────────
                    doc.rect(MARGIN, y, CW, 5).fill('#166534');
                    y += 18;

                    // ── Meta info ──────────────────────────────────────────────────────────
                    const metaParts = [gccCountry, 'GCC Export Directory'];
                    const metaStr = metaParts.join('  ·  ');
                    doc.font('Helvetica').fontSize(8.5).fillColor('#888888');
                    doc.text(`${currentPageIndex} / ${totalCompanyCount + Object.keys(groupedByCountry).filter(k => groupedByCountry[k].length > 0).length}`, MARGIN, y, { width: CW, align: 'left', lineBreak: false });
                    doc.text(metaStr, MARGIN, y, { width: CW, align: 'right' });
                    y += LINE_H + 8;

                    // ── Company Name ─────────────────────────────────────────────────────
                    doc.font('Helvetica-Bold').fontSize(26).fillColor('#14532d');
                    doc.text(company.name || 'Unnamed Company', MARGIN, y, { width: CW });
                    y += doc.heightOfString(company.name || 'Unnamed Company', { width: CW, fontSize: 26 }) + 6;

                    // ── Sector / SubSector breadcrumb ────────────────────────────────────
                    const allSectors = company.sectors?.map(cs => cs.sector?.name).filter(Boolean) || [];
                    const allSubSectors = company.subSectors?.map(css => css.subSector?.name).filter(Boolean) || [];

                    if (allSectors.length === 0 && company.sector?.name) {
                        allSectors.push(company.sector.name);
                    }
                    if (allSubSectors.length === 0 && company.subSector?.name) {
                        allSubSectors.push(company.subSector.name);
                    }

                    const sectorStr = [...allSectors, ...allSubSectors].filter(Boolean).join(' › ');
                    if (sectorStr) {
                        doc.font('Helvetica').fontSize(10.5).fillColor('#166534');
                        doc.text(sectorStr, MARGIN, y, { width: CW });
                        y += LINE_H;
                    }

                    // Divider (removed "Targeting" label)
                    y += 10;
                    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#d1d5db').lineWidth(0.5).stroke();
                    y += SECTION_GAP;

                    // ── Company Profile ──────────────────────────────────────────────────
                    const profileText = sanitize(company.profile);
                    if (profileText) {
                        doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
                        doc.text('Company Profile', MARGIN, y);
                        y += LINE_H + 6;

                        doc.font('Helvetica').fontSize(10.5).fillColor('#222222');
                        doc.text(profileText, MARGIN, y, { width: CW, lineGap: 3 });
                        y += doc.heightOfString(profileText, { width: CW, lineGap: 3 }) + SECTION_GAP;

                        doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#d1d5db').lineWidth(0.5).stroke();
                        y += SECTION_GAP;
                    }

                    // ── Products to be Displayed ─────────────────────────────────────────
                    const productsText = sanitize(company.productsToBeDisplayed);
                    if (productsText) {
                        doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
                        doc.text('Products to be Displayed', MARGIN, y);
                        y += LINE_H + 6;

                        doc.font('Helvetica').fontSize(10.5).fillColor('#222222');
                        doc.text(productsText, MARGIN, y, { width: CW, lineGap: 3 });
                        y += doc.heightOfString(productsText, { width: CW, lineGap: 3 }) + SECTION_GAP;

                        doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#d1d5db').lineWidth(0.5).stroke();
                        y += SECTION_GAP;
                    }

                    // ── Contact layout ───────────────────────────────────────────────────
                    const LABEL_W = 90;
                    const VAL_W = CW - LABEL_W - 8;

                    const hasContact = sanitize(company.address) || sanitize(company.email) || sanitize(company.website);
                    if (hasContact) {
                        doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
                        doc.text('Company Contact', MARGIN, y);
                        y += LINE_H + 8;

                        if (sanitize(company.address)) {
                            y = drawField(doc, 'Address', sanitize(company.address), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                        }
                        if (sanitize(company.email)) {
                            y = drawField(doc, 'Email', sanitize(company.email), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                        }
                        if (sanitize(company.website)) {
                            y = drawField(doc, 'Website', sanitize(company.website), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                        }
                        y += SECTION_GAP;
                    }

                    const hasRep = sanitize(company.representativeName) || sanitize(company.representativeTel) ||
                        sanitize(company.representativeWhatsapp) || sanitize(company.representativeEmail);
                    if (hasRep) {
                        doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
                        doc.text('Representative', MARGIN, y);
                        y += LINE_H + 8;

                        if (sanitize(company.representativeName)) {
                            y = drawField(doc, 'Name', sanitize(company.representativeName), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                        }
                        if (sanitize(company.representativeTel)) {
                            y = drawField(doc, 'Phone', sanitize(company.representativeTel), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                        }
                        if (sanitize(company.representativeWhatsapp)) {
                            y = drawField(doc, 'WhatsApp', sanitize(company.representativeWhatsapp), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                        }
                        if (sanitize(company.representativeEmail)) {
                            y = drawField(doc, 'Email', sanitize(company.representativeEmail), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                        }
                    }

                    // ── Footer ───────────────────────────────────────────────────────────
                    doc.moveTo(MARGIN, FOOTER_Y - 8).lineTo(PAGE_W - MARGIN, FOOTER_Y - 8).strokeColor('#d1d5db').lineWidth(0.5).stroke();
                    doc.font('Helvetica').fontSize(8).fillColor('#aaaaaa');
                    doc.text('TDAP Food Directory', MARGIN, FOOTER_Y, { align: 'left', width: CW / 2 });
                    const totalPages = totalCompanyCount + Object.keys(groupedByCountry).filter(k => groupedByCountry[k].length > 0).length;
                    doc.text(`Page ${currentPageIndex} of ${totalPages}`, MARGIN, FOOTER_Y, { align: 'right', width: CW });
                }
            }
        });
    } else {
        // Single country - process companies normally
        totalCompanyCount = companies.length;

        for (let i = 0; i < companies.length; i++) {
            const company = companies[i];
            doc.addPage();
            currentPageIndex++;

            let y = MARGIN;

            // ── Top accent bar ───────────────────────────────────────────────────
            doc.rect(MARGIN, y, CW, 5).fill('#166534');
            y += 18;

            // ── Meta info ──────────────────────────────────────────────────────────
            const metaParts = [];
            if (country === 'all' && company.countryGroup) {
                metaParts.push(company.countryGroup);
            } else if (country !== 'all') {
                metaParts.push(country);
            }
            metaParts.push('GCC Export Directory');

            const metaStr = metaParts.join('  ·  ');
            doc.font('Helvetica').fontSize(8.5).fillColor('#888888');
            doc.text(`${i + 1} / ${companies.length}`, MARGIN, y, { width: CW, align: 'left', lineBreak: false });
            doc.text(metaStr, MARGIN, y, { width: CW, align: 'right' });
            y += LINE_H + 8;

            // ── Company Name ─────────────────────────────────────────────────────
            doc.font('Helvetica-Bold').fontSize(26).fillColor('#14532d');
            doc.text(company.name || 'Unnamed Company', MARGIN, y, { width: CW });
            y += doc.heightOfString(company.name || 'Unnamed Company', { width: CW, fontSize: 26 }) + 6;

            // ── Sector / SubSector breadcrumb ────────────────────────────────────
            // Get all sectors and subsectors from junction tables
            const allSectors = company.sectors?.map(cs => cs.sector?.name).filter(Boolean) || [];
            const allSubSectors = company.subSectors?.map(css => css.subSector?.name).filter(Boolean) || [];

            // Fallback to legacy fields if no junction data
            if (allSectors.length === 0 && company.sector?.name) {
                allSectors.push(company.sector.name);
            }
            if (allSubSectors.length === 0 && company.subSector?.name) {
                allSubSectors.push(company.subSector.name);
            }

            const sectorStr = [...allSectors, ...allSubSectors].filter(Boolean).join(' › ');
            if (sectorStr) {
                doc.font('Helvetica').fontSize(10.5).fillColor('#166534');
                doc.text(sectorStr, MARGIN, y, { width: CW });
                y += LINE_H;
            }

            // Divider (removed "Targeting" label)
            y += 10;
            doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#d1d5db').lineWidth(0.5).stroke();
            y += SECTION_GAP;

            // ── Company Profile ──────────────────────────────────────────────────
            const profileText = sanitize(company.profile);
            if (profileText) {
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
                doc.text('Company Profile', MARGIN, y);
                y += LINE_H + 6;

                doc.font('Helvetica').fontSize(10.5).fillColor('#222222');
                doc.text(profileText, MARGIN, y, { width: CW, lineGap: 3 });
                y += doc.heightOfString(profileText, { width: CW, lineGap: 3 }) + SECTION_GAP;

                // Divider
                doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#d1d5db').lineWidth(0.5).stroke();
                y += SECTION_GAP;
            }

            // ── Products to be Displayed ─────────────────────────────────────────
            const productsText = sanitize(company.productsToBeDisplayed);
            if (productsText) {
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
                doc.text('Products to be Displayed', MARGIN, y);
                y += LINE_H + 6;

                doc.font('Helvetica').fontSize(10.5).fillColor('#222222');
                doc.text(productsText, MARGIN, y, { width: CW, lineGap: 3 });
                y += doc.heightOfString(productsText, { width: CW, lineGap: 3 }) + SECTION_GAP;

                // Divider
                doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#d1d5db').lineWidth(0.5).stroke();
                y += SECTION_GAP;
            }

            // ── Contact layout ───────────────────────────────────────────────────
            const LABEL_W = 90;
            const VAL_W = CW - LABEL_W - 8;

            // Company Contact
            const hasContact = sanitize(company.address) || sanitize(company.email) || sanitize(company.website);
            if (hasContact) {
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
                doc.text('Company Contact', MARGIN, y);
                y += LINE_H + 8;

                if (sanitize(company.address)) {
                    y = drawField(doc, 'Address', sanitize(company.address), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                }
                if (sanitize(company.email)) {
                    y = drawField(doc, 'Email', sanitize(company.email), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                }
                if (sanitize(company.website)) {
                    y = drawField(doc, 'Website', sanitize(company.website), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                }
                y += SECTION_GAP;
            }

            // Representative
            const hasRep = sanitize(company.representativeName) || sanitize(company.representativeTel) ||
                sanitize(company.representativeWhatsapp) || sanitize(company.representativeEmail);
            if (hasRep) {
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
                doc.text('Representative', MARGIN, y);
                y += LINE_H + 8;

                if (sanitize(company.representativeName)) {
                    y = drawField(doc, 'Name', sanitize(company.representativeName), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                }
                if (sanitize(company.representativeTel)) {
                    y = drawField(doc, 'Phone', sanitize(company.representativeTel), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                }
                if (sanitize(company.representativeWhatsapp)) {
                    y = drawField(doc, 'WhatsApp', sanitize(company.representativeWhatsapp), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                }
                if (sanitize(company.representativeEmail)) {
                    y = drawField(doc, 'Email', sanitize(company.representativeEmail), MARGIN, y, LABEL_W, VAL_W, LINE_H);
                }
            }

            // ── Footer ───────────────────────────────────────────────────────────
            doc.moveTo(MARGIN, FOOTER_Y - 8).lineTo(PAGE_W - MARGIN, FOOTER_Y - 8).strokeColor('#d1d5db').lineWidth(0.5).stroke();
            doc.font('Helvetica').fontSize(8).fillColor('#aaaaaa');
            doc.text('TDAP Food Directory', MARGIN, FOOTER_Y, { align: 'left', width: CW / 2 });
            doc.text(`Page ${i + 1} of ${companies.length}`, MARGIN, FOOTER_Y, { align: 'right', width: CW });
        }
    }

    doc.end();

    await new Promise((resolve, reject) => {
        doc.on('end', resolve);
        doc.on('error', reject);
    });

    const pdfBuffer = Buffer.concat(chunks);

    const safeName = country === 'all'
        ? 'gcc-all-countries-directory'
        : `${country.toLowerCase()}-company-directory`;

    return new Response(pdfBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
            'Content-Length': String(pdfBuffer.length),
        },
    });
}
