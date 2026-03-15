import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

export const runtime = 'nodejs';

/* ── helpers ─────────────────────────────────────────────────────────────── */

function sanitize(val) {
    if (val == null) return null;
    const s = String(val).trim();
    return s.length > 0 ? s : null;
}

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

/** Draw one company page and return the doc (mutates in place) */
function addCompanyPage(doc, company, meta, pageNum, totalPages, constants) {
    const { PAGE_W, MARGIN, CW, LINE_H, SECTION_GAP, FOOTER_Y } = constants;

    doc.addPage();
    let y = MARGIN;

    // Top accent bar
    doc.rect(MARGIN, y, CW, 5).fill('#166534');
    y += 18;

    // Meta strip
    doc.font('Helvetica').fontSize(8.5).fillColor('#888888');
    doc.text(`${pageNum} / ${totalPages}`, MARGIN, y, { width: CW, align: 'left', lineBreak: false });
    doc.text(meta, MARGIN, y, { width: CW, align: 'right' });
    y += LINE_H + 8;

    // Company name
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#14532d');
    doc.text(company.name || 'Unnamed Company', MARGIN, y, { width: CW });
    y += doc.heightOfString(company.name || 'Unnamed Company', { width: CW, fontSize: 26 }) + 6;

    // Sector / SubSector breadcrumb
    const allSectors = company.sectors?.map(cs => cs.sector?.name).filter(Boolean) || [];
    const allSubSectors = company.subSectors?.map(css => css.subSector?.name).filter(Boolean) || [];
    if (allSectors.length === 0 && company.sector?.name) allSectors.push(company.sector.name);
    if (allSubSectors.length === 0 && company.subSector?.name) allSubSectors.push(company.subSector.name);
    const sectorStr = [...allSectors, ...allSubSectors].filter(Boolean).join(' › ');
    if (sectorStr) {
        doc.font('Helvetica').fontSize(10.5).fillColor('#166534');
        doc.text(sectorStr, MARGIN, y, { width: CW });
        y += LINE_H;
    }

    // Divider
    y += 10;
    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor('#d1d5db').lineWidth(0.5).stroke();
    y += SECTION_GAP;

    // Company profile
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

    // Products to be displayed
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

    // Contact
    const LABEL_W = 90;
    const VAL_W = CW - LABEL_W - 8;
    const hasContact = sanitize(company.address) || sanitize(company.email) || sanitize(company.website);
    if (hasContact) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
        doc.text('Company Contact', MARGIN, y);
        y += LINE_H + 8;
        if (sanitize(company.address)) y = drawField(doc, 'Address', sanitize(company.address), MARGIN, y, LABEL_W, VAL_W, LINE_H);
        if (sanitize(company.email)) y = drawField(doc, 'Email', sanitize(company.email), MARGIN, y, LABEL_W, VAL_W, LINE_H);
        if (sanitize(company.website)) y = drawField(doc, 'Website', sanitize(company.website), MARGIN, y, LABEL_W, VAL_W, LINE_H);
        y += SECTION_GAP;
    }

    // Representative
    const hasRep = sanitize(company.representativeName) || sanitize(company.representativeTel) ||
        sanitize(company.representativeWhatsapp) || sanitize(company.representativeEmail);
    if (hasRep) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#166534');
        doc.text('Representative', MARGIN, y);
        y += LINE_H + 8;
        if (sanitize(company.representativeName)) y = drawField(doc, 'Name', sanitize(company.representativeName), MARGIN, y, LABEL_W, VAL_W, LINE_H);
        if (sanitize(company.representativeTel)) y = drawField(doc, 'Phone', sanitize(company.representativeTel), MARGIN, y, LABEL_W, VAL_W, LINE_H);
        if (sanitize(company.representativeWhatsapp)) y = drawField(doc, 'WhatsApp', sanitize(company.representativeWhatsapp), MARGIN, y, LABEL_W, VAL_W, LINE_H);
        if (sanitize(company.representativeEmail)) y = drawField(doc, 'Email', sanitize(company.representativeEmail), MARGIN, y, LABEL_W, VAL_W, LINE_H);
    }

    // Footer
    doc.moveTo(MARGIN, FOOTER_Y - 8).lineTo(PAGE_W - MARGIN, FOOTER_Y - 8).strokeColor('#d1d5db').lineWidth(0.5).stroke();
    doc.font('Helvetica').fontSize(8).fillColor('#aaaaaa');
    doc.text('TDAP Food Directory', MARGIN, FOOTER_Y, { align: 'left', width: CW / 2 });
    doc.text(`Page ${pageNum} of ${totalPages}`, MARGIN, FOOTER_Y, { align: 'right', width: CW });
}

/** Draw a section header page for a product interest */
function addSectionPage(doc, countryName, productLabel, notes, companyCount, sectorName, constants) {
    const { PAGE_W, MARGIN, CW, LINE_H } = constants;
    doc.addPage();
    let y = MARGIN;

    doc.rect(MARGIN, y, CW, 5).fill('#1e3a5f');
    y += 50;

    // Country label
    doc.font('Helvetica').fontSize(13).fillColor('#6b8fbe');
    doc.text(countryName, MARGIN, y, { width: CW, align: 'center' });
    y += LINE_H + 6;

    // Product name
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#0f2744');
    doc.text(productLabel, MARGIN, y, { width: CW, align: 'center' });
    y += doc.heightOfString(productLabel, { width: CW, fontSize: 28 }) + 8;

    // Sector badge
    if (sectorName) {
        doc.font('Helvetica').fontSize(11).fillColor('#3b6b9e');
        doc.text(sectorName, MARGIN, y, { width: CW, align: 'center' });
        y += LINE_H + 8;
    }

    // Divider
    doc.moveTo(MARGIN + CW * 0.2, y).lineTo(PAGE_W - MARGIN - CW * 0.2, y).strokeColor('#93b3d4').lineWidth(1).stroke();
    y += 24;

    // Subtitle
    doc.font('Helvetica').fontSize(13).fillColor('#555555');
    doc.text(
        `Following ${companyCount} ${companyCount === 1 ? 'company is' : 'companies are'} recommended for this product`,
        MARGIN, y, { width: CW, align: 'center' }
    );
    y += LINE_H + 12;

    // Notes
    if (notes) {
        doc.font('Helvetica-Oblique').fontSize(10.5).fillColor('#777777');
        doc.text(notes, MARGIN + 40, y, { width: CW - 80, align: 'center' });
    }
}

/* ── main handler ─────────────────────────────────────────────────────────── */

// GET /api/countries/[country]/interest-directory?interestId=X  → single product PDF
// GET /api/countries/[country]/interest-directory               → all products PDF
export async function GET(request, { params }) {
    const { country } = await params;
    const countryName = decodeURIComponent(country);
    const { searchParams } = new URL(request.url);
    const interestIdParam = searchParams.get('interestId');

    // Fetch country profile with interests + assigned companies
    const profile = await prisma.countryProfile.findUnique({
        where: { country: countryName },
        include: {
            interests: {
                orderBy: { createdAt: 'asc' },
                include: {
                    subSector: { select: { id: true, name: true, sector: { select: { name: true } } } },
                    companies: {
                        include: {
                            company: {
                                select: {
                                    id: true, name: true, profile: true, address: true,
                                    email: true, website: true, representativeName: true,
                                    representativeTel: true, representativeWhatsapp: true,
                                    representativeEmail: true, productsToBeDisplayed: true,
                                    sector: { select: { name: true } },
                                    subSector: { select: { name: true } },
                                    sectors: { include: { sector: { select: { name: true } } } },
                                    subSectors: { include: { subSector: { select: { name: true } } } },
                                },
                            },
                        },
                        orderBy: { id: 'asc' },
                    },
                },
            },
        },
    });

    if (!profile) {
        return NextResponse.json({ error: `No profile found for ${countryName}` }, { status: 404 });
    }

    // Decide which interests to include
    let interests = profile.interests;
    if (interestIdParam) {
        const targetId = Number(interestIdParam);
        interests = interests.filter(i => i.id === targetId);
        if (interests.length === 0) {
            return NextResponse.json({ error: 'Product interest not found' }, { status: 404 });
        }
    }

    // Filter out interests with no companies
    const activeInterests = interests.filter(i => i.companies.length > 0);
    if (activeInterests.length === 0) {
        return NextResponse.json({ error: 'No companies assigned to the selected product interest(s)' }, { status: 404 });
    }

    // ── Build PDF ────────────────────────────────────────────────────────────
    const PDFDocument = (await import('pdfkit')).default;

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const MARGIN = 50;
    const CW = PAGE_W - MARGIN * 2;
    const LINE_H = 18;
    const SECTION_GAP = 22;
    const FOOTER_Y = PAGE_H - MARGIN - 16;
    const C = { PAGE_W, PAGE_H, MARGIN, CW, LINE_H, SECTION_GAP, FOOTER_Y };

    const isSingle = Boolean(interestIdParam);

    // Calculate total pages: one section header page per interest + one page per company
    const totalPages = activeInterests.reduce((sum, i) => sum + 1 + i.companies.length, 0);

    const doc = new PDFDocument({
        autoFirstPage: false,
        size: 'A4',
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
            Title: isSingle
                ? `${countryName} – ${activeInterests[0].subSector?.name || activeInterests[0].customProduct || 'Product'} Directory`
                : `${countryName} – All Product Interests Directory`,
            Author: 'TDAP Food Directory',
        },
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    let pageNum = 0;

    for (const interest of activeInterests) {
        const productLabel = interest.subSector?.name || interest.customProduct || 'Product';
        const sectorName = interest.subSector?.sector?.name || null;
        const companyCount = interest.companies.length;

        // Section header page
        pageNum++;
        addSectionPage(doc, countryName, productLabel, interest.notes, companyCount, sectorName, C);

        // Company pages
        for (const { company } of interest.companies) {
            pageNum++;
            const meta = `${countryName}  ·  ${productLabel}`;
            addCompanyPage(doc, company, meta, pageNum, totalPages, C);
        }
    }

    doc.end();
    await new Promise((resolve, reject) => { doc.on('end', resolve); doc.on('error', reject); });

    const pdfBuffer = Buffer.concat(chunks);

    const slug = isSingle
        ? `${countryName.toLowerCase()}-${(activeInterests[0].subSector?.name || activeInterests[0].customProduct || 'product').toLowerCase().replace(/\s+/g, '-')}-directory`
        : `${countryName.toLowerCase()}-all-products-directory`;

    const safeName = slug.replace(/[^a-z0-9-]/g, '');

    return new Response(pdfBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
            'Content-Length': String(pdfBuffer.length),
        },
    });
}
