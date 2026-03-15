import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/register/verify-code
 * Body: { code: string }
 * Validates the submitted code against the REGISTER_CODES env var
 * (comma-separated list, e.g. "TDAP2024,FOOD-DIR-01").
 * Returns { valid: true } or { valid: false }.
 */
export async function POST(request) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const raw = process.env.REGISTER_CODES || '';
        const validCodes = raw
            .split(',')
            .map(c => c.trim().toUpperCase())
            .filter(Boolean);

        if (validCodes.length === 0) {
            // No codes configured — deny all
            return NextResponse.json({ valid: false, error: 'Registration is currently closed.' }, { status: 403 });
        }

        const valid = validCodes.includes(code.trim().toUpperCase());
        return NextResponse.json({ valid });
    } catch {
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
