import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

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

export async function GET(request, { params }) {
    const { id } = await params;
    const eventId = Number(id);

    if (Number.isNaN(eventId)) {
        return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
            name: true,
            country: true,
            city: true,
            datesText: true,
            startDate: true,
            endDate: true,
            eventDate: true,
            participants: {
                select: {
                    company: {
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
                            sector: { select: { name: true } },
                            subSector: { select: { name: true } },
                        },
                    },
                },
            },
        },
    });

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const companies = (event.participants || [])
        .map((p) => p.company)
        .filter(Boolean);

    if (companies.length === 0) {
        return NextResponse.json({ error: 'No companies found for this event' }, { status: 404 });
    }

    // Build date label
    let dateLabel = event.datesText || null;
    if (!dateLabel) {
        const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
        const s = fmt(event.startDate);
        const e = fmt(event.endDate);
        if (s && e && s !== e) dateLabel = `${s} to ${e}`;
        else dateLabel = s || e || (event.eventDate ? fmt(event.eventDate) : null);
    }
    const locationLabel = [event.city, event.country].filter(Boolean).join(', ') || null;

    // Dynamically import pdfkit (CommonJS module)
    const PDFDocument = (await import('pdfkit')).default;

    const PAGE_W = 595.28;   // A4
    const PAGE_H = 841.89;   // A4
    const MARGIN = 50;
    const CW = PAGE_W - MARGIN * 2;   // content width = 495.28
    const LINE_H = 18;
    const SECTION_GAP = 22;           // gap between major sections
    const FOOTER_Y = PAGE_H - MARGIN - 16;

    const doc = new PDFDocument({
        autoFirstPage: false,
        size: 'A4',
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
            Title: `${event.name} – Company Directory`,
            Author: 'TDAP Food Directory',
        },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        doc.addPage();

        let y = MARGIN;

        // ── Top accent bar ───────────────────────────────────────────────────
        doc.rect(MARGIN, y, CW, 5).fill('#166534');
        y += 18;

        // ── Event meta (right) + index (left) on same line ───────────────────
        const metaParts = [event.name, locationLabel, dateLabel].filter(Boolean);
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
        const sectorStr = [sanitize(company.sector?.name), sanitize(company.subSector?.name)]
            .filter(Boolean)
            .join(' › ');
        if (sectorStr) {
            doc.font('Helvetica').fontSize(10.5).fillColor('#166534');
            doc.text(sectorStr, MARGIN, y, { width: CW });
            y += LINE_H;
        }

        // Divider
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

        // ── Contact layout (stacked) ─────────────────────────────────────────
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

        // Representative (below Company Contact)
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

    doc.end();

    await new Promise((resolve, reject) => {
        doc.on('end', resolve);
        doc.on('error', reject);
    });

    const pdfBuffer = Buffer.concat(chunks);

    const safeName = (event.name || 'event')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 60);

    return new Response(pdfBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeName}-company-directory.pdf"`,
            'Content-Length': String(pdfBuffer.length),
        },
    });
}
