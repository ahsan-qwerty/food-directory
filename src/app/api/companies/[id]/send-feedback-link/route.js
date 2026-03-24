import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { prisma } from '../../../../../lib/prismaClient';

export const runtime = 'nodejs';

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/companies/[id]/send-feedback-link
   Body: { registrationCode: string, recipientEmail?: string }

   Requires a valid REGISTER_CODES entry.
   Sends an email to the company's representative (or provided email) with a
   link to fill in the daily feedback form.
───────────────────────────────────────────────────────────────────────────── */
export async function POST(request, { params }) {
  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (isNaN(companyId)) {
    return NextResponse.json({ error: 'Invalid company ID.' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { registrationCode, recipientEmail } = body;

  // Validate officer auth code
  if (!registrationCode || typeof registrationCode !== 'string') {
    return NextResponse.json({ error: 'Registration code is required.' }, { status: 400 });
  }

  const validCodes = (process.env.REGISTER_CODES || '')
    .split(',')
    .map(c => c.trim().toUpperCase())
    .filter(Boolean);

  if (validCodes.length === 0 || !validCodes.includes(registrationCode.trim().toUpperCase())) {
    return NextResponse.json({ error: 'Invalid registration code.' }, { status: 403 });
  }

  // Fetch company details
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      email: true,
      representativeName: true,
      representativeEmail: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
  }

  // Determine recipient — prefer provided email, then representative, then company email
  const toEmail = recipientEmail?.trim()
    || company.representativeEmail?.trim()
    || company.email?.trim();

  if (!toEmail) {
    return NextResponse.json(
      { error: 'No email address found for this company. Please provide one.' },
      { status: 422 }
    );
  }

  // Build the feedback page URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const feedbackUrl = `${baseUrl}/company-feedback/${companyId}`;

  // Today's date label
  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  // Send email via nodemailer — mirrors company-emails/route.js config
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = Number(process.env.SMTP_PORT);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASSWORD;

  if (!SMTP_PASS) {
    return NextResponse.json({ error: 'SMTP_PASSWORD is not configured.' }, { status: 500 });
  }

  // Resolve hostname to IPv4 explicitly — Node.js may prefer IPv6 (AAAA record)
  // which times out if the network/server doesn't support it.
  let smtpIp = SMTP_HOST;
  try {
    const { address } = await dns.promises.lookup(SMTP_HOST, { family: 4 });
    smtpIp = address;
  } catch {
    // fallback to hostname if DNS lookup fails
  }

  const transporter = nodemailer.createTransport({
    host: smtpIp,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for SSL (port 465), false for STARTTLS (587)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: { rejectUnauthorized: false }
  });

  const recipientName = company.representativeName || company.name;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#166534;padding:24px 32px;">
            <p style="margin:0;font-size:12px;color:#86efac;letter-spacing:0.05em;text-transform:uppercase;">TDAP Food Directory</p>
            <h1 style="margin:6px 0 0;font-size:20px;color:#ffffff;font-weight:700;">Daily Activity Report</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 16px;color:#cbd5e1;font-size:15px;">Dear <strong style="color:#f1f5f9;">${recipientName}</strong>,</p>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.6;">
              A TDAP trade officer has requested your daily activity report for <strong style="color:#fbbf24;">${todayLabel}</strong>.
            </p>

            <!-- Company box -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#0f172a;border:1px solid #334155;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Company</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#f1f5f9;">${company.name}</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.6;">
              Please click the button below to fill in your activity report. It only takes a minute.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:#f59e0b;border-radius:8px;">
                  <a href="${feedbackUrl}" style="display:block;padding:13px 28px;color:#0f172a;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.01em;">
                    Fill Today's Report →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#475569;word-break:break-all;">
              Or copy this link: <a href="${feedbackUrl}" style="color:#38bdf8;">${feedbackUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #1e293b;background:#0f172a;">
            <p style="margin:0;font-size:11px;color:#475569;text-align:center;">
              This email was sent by a TDAP trade officer via the TDAP Food Directory platform.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    console.log('📧 SMTP_HOST:', SMTP_HOST, '→ resolved IP:', smtpIp);
    console.log('📧 SMTP_PORT:', SMTP_PORT, '| SMTP_USER:', SMTP_USER);
    console.log('📧 Sending to:', toEmail, '| Company:', company.name, `(id=${companyId})`);

    const info = await transporter.sendMail({
      from: `"TDAP Food Directory" <${SMTP_USER}>`,
      to: toEmail,
      subject: `Daily Activity Report — ${company.name} (${todayLabel})`,
      html,
      text: `Dear ${recipientName},\n\nA TDAP trade officer has requested your daily activity report for ${todayLabel}.\n\nPlease fill in your report here:\n${feedbackUrl}\n\n— TDAP Food Directory`,
    });

    console.log('✅ Message ID:', info.messageId);
    console.log('✅ SMTP Response:', info.response);
    console.log('✅ Accepted by server:', JSON.stringify(info.accepted));
    console.log('✅ Rejected by server:', JSON.stringify(info.rejected));
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    console.error('❌ Full error:', err);
    return NextResponse.json(
      { error: 'Failed to send email. Please check SMTP configuration.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, sentTo: toEmail });
}
