import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            emails,
            eventId,
            eventName,
            feedbackUrl,
            test = false,
        } = body || {};

        const recipientList = Array.isArray(emails)
            ? emails.map((e) => String(e).trim()).filter(Boolean)
            : [];

        if (!recipientList.length) {
            return NextResponse.json(
                { error: 'At least one recipient email is required' },
                { status: 400 },
            );
        }

        if (!eventId) {
            return NextResponse.json(
                { error: 'eventId is required' },
                { status: 400 },
            );
        }

        const transporter = getTransporter();

        const subjectBase = `Feedback for ${eventName || 'the event'}`;
        const subject = test ? `[TEST] ${subjectBase}` : subjectBase;

        const textLines = [
            'Dear Participant,',
            '',
            `Thank you for participating in ${eventName || 'the event'}.`,
            feedbackUrl ? `Please fill in the feedback form: ${feedbackUrl}` : '',
            '',
            'Best regards,',
            'TDAP',
        ].filter(Boolean);

        const info = await transporter.sendMail({
            from: `"TDAP Feedback" <${SMTP_USER}>`,
            // Send directly to the TDAP feedback inbox, BCC all participants
            to: SMTP_USER,
            bcc: recipientList,
            subject,
            text: textLines.join('\n'),
        });

        return NextResponse.json({
            ok: true,
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            test,
        });
    } catch (error) {
        console.error('Error sending company feedback emails:', error);
        return NextResponse.json(
            { error: 'Failed to send feedback emails' },
            { status: 500 },
        );
    }
}

