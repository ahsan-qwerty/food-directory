import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '../../../../lib/prismaClient';

export const runtime = 'nodejs';

const SMTP_HOST = process.env.SMTP_HOST || 'core46.hostingmadeeasy.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER || 'feedback@carrental.tdap.gov.pk';
const SMTP_PASS = process.env.SMTP_PASSWORD;

function getTransporter() {
    if (!SMTP_PASS) {
        throw new Error('SMTP_PASSWORD env var is not set. Please configure your SMTP password.');
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for SSL port
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

function normalizeEmail(value) {
    if (!value) return null;
    const s = String(value).trim();
    return s.length ? s : null;
}

async function getStatusByCompanyId(eventId) {
    try {
        const statuses = await prisma.eventCompanyEmailStatus.findMany({
            where: { eventId },
            select: {
                companyId: true,
                lastEmailAddress: true,
                lastEmailSource: true,
                lastSentAt: true,
            },
        });
        return new Map(statuses.map((s) => [s.companyId, s]));
    } catch (error) {
        // If migration hasn't been applied yet, don't hard-fail the whole feature.
        console.warn('Warning: unable to read EventCompanyEmailStatus (migration not applied yet?)', error);
        return new Map();
    }
}

async function getEventEmailRows(eventId) {
    const statusByCompanyId = await getStatusByCompanyId(eventId);

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
            id: true,
            name: true,
            participants: {
                select: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            representativeEmail: true,
                        },
                    },
                },
            },
        },
    });

    if (!event) return { event: null, rows: [] };

    const rows = (event.participants || [])
        .map((p) => p.company)
        .filter(Boolean)
        .map((company) => {
            const status = statusByCompanyId.get(company.id) || null;
            const companyEmail = normalizeEmail(company.email);
            const representativeEmail = normalizeEmail(company.representativeEmail);

            let preferredEmail = null;
            let preferredSource = null;

            if (companyEmail) {
                preferredEmail = companyEmail;
                preferredSource = 'COMPANY';
            } else if (representativeEmail) {
                preferredEmail = representativeEmail;
                preferredSource = 'REPRESENTATIVE';
            }

            return {
                companyId: company.id,
                companyName: company.name,
                companyEmail,
                representativeEmail,
                preferredEmail,
                preferredSource,
                hasAnyEmail: !!preferredEmail,
                hasBeenSent: !!status?.lastSentAt,
                lastSentAt: status?.lastSentAt || null,
                lastEmailAddress: status?.lastEmailAddress || null,
                lastEmailSource: status?.lastEmailSource || null,
            };
        });

    return { event, rows };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventIdParam = searchParams.get('eventId');
        const eventId = eventIdParam ? Number(eventIdParam) : NaN;

        if (Number.isNaN(eventId)) {
            return NextResponse.json(
                { error: 'Valid eventId is required' },
                { status: 400 },
            );
        }

        const { event, rows } = await getEventEmailRows(eventId);

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 },
            );
        }

        const totalCompanies = rows.length;
        const withAnyEmail = rows.filter((r) => r.hasAnyEmail).length;
        const sentCount = rows.filter((r) => r.hasBeenSent).length;
        const unsentCount = rows.filter((r) => r.hasAnyEmail && !r.hasBeenSent).length;
        const missingCompanies = rows.filter((r) => !r.hasAnyEmail).map((r) => ({
            companyId: r.companyId,
            companyName: r.companyName,
        }));

        return NextResponse.json({
            ok: true,
            eventId: event.id,
            eventName: event.name,
            totalCompanies,
            withAnyEmail,
            withoutEmail: missingCompanies.length,
            sentCount,
            unsentCount,
            rows,
            missingCompanies,
        });
    } catch (error) {
        console.error('Error fetching company email status:', error);
        return NextResponse.json(
            { error: 'Failed to load company email status' },
            { status: 500 },
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            eventId,
            eventName,
            feedbackUrl,
            test = false,
            mode = 'unsent_only', // 'unsent_only' | 'all'
        } = body || {};

        const numericEventId = Number(eventId);
        if (Number.isNaN(numericEventId)) {
            return NextResponse.json(
                { error: 'Valid eventId is required' },
                { status: 400 },
            );
        }

        const { event, rows } = await getEventEmailRows(numericEventId);

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 },
            );
        }

        const eligibleRows = rows.filter((r) => r.preferredEmail);
        const targetRows = mode === 'all'
            ? eligibleRows
            : eligibleRows.filter((r) => !r.hasBeenSent);

        const recipients = targetRows.map((r) => r.preferredEmail);

        if (!recipients.length) {
            return NextResponse.json(
                { error: mode === 'all' ? 'No participant or representative emails found for this event' : 'No pending (unsent) participant emails found for this event' },
                { status: 400 },
            );
        }

        const transporter = getTransporter();

        const subjectBase = `Feedback for ${eventName || event.name || 'the event'}`;
        const subject = test ? `[TEST] ${subjectBase}` : subjectBase;

        const textLines = [
            'Dear Participant,',
            '',
            `Thank you for participating in ${eventName || event.name || 'the event'}.`,
            feedbackUrl ? `Please fill in the feedback form: ${feedbackUrl}` : '',
            '',
            'Best regards,',
            'TDAP',
        ].filter(Boolean);

        const info = await transporter.sendMail({
            from: `"TDAP Feedback" <${SMTP_USER}>`,
            to: SMTP_USER,
            bcc: recipients,
            subject,
            text: textLines.join('\n'),
        });

        const now = new Date();
        if (!test) {
            // Record which address we used for each company so we can avoid re-sending later.
            await prisma.$transaction(
                targetRows.map((r) => prisma.eventCompanyEmailStatus.upsert({
                    where: {
                        eventId_companyId: {
                            eventId: numericEventId,
                            companyId: r.companyId,
                        },
                    },
                    create: {
                        eventId: numericEventId,
                        companyId: r.companyId,
                        lastEmailAddress: r.preferredEmail,
                        lastEmailSource: r.preferredSource,
                        lastSentAt: now,
                    },
                    update: {
                        lastEmailAddress: r.preferredEmail,
                        lastEmailSource: r.preferredSource,
                        lastSentAt: now,
                    },
                })),
            );
        }

        const stats = {
            totalCompanies: rows.length,
            recipientsCount: recipients.length,
            companyEmailCount: targetRows.filter((r) => r.preferredSource === 'COMPANY').length,
            representativeEmailCount: targetRows.filter((r) => r.preferredSource === 'REPRESENTATIVE').length,
            missingEmailCount: rows.filter((r) => !r.hasAnyEmail).length,
            alreadySentCount: rows.filter((r) => r.hasBeenSent).length,
            pendingUnsentCount: rows.filter((r) => r.hasAnyEmail && !r.hasBeenSent).length,
            mode,
        };

        return NextResponse.json({
            ok: true,
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            test,
            stats,
            rows: rows.map((r) => ({
                ...r,
                // Reflect newly-sent values for client convenience
                ...(targetRows.some((t) => t.companyId === r.companyId) && !test
                    ? { hasBeenSent: true, lastSentAt: now, lastEmailAddress: r.preferredEmail, lastEmailSource: r.preferredSource }
                    : {}),
            })),
        });
    } catch (error) {
        console.error('Error sending company feedback emails:', error);
        return NextResponse.json(
            { error: 'Failed to send feedback emails' },
            { status: 500 },
        );
    }
}

