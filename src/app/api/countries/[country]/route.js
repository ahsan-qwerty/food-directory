import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

function parseJson(value, fallback = []) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return fallback; }
    }
    return fallback;
}

function parseDecimal(value) {
    if (value === '' || value == null) return null;
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
}

// Sanitise a rows array: keep only entries with a product name
function sanitiseRows(rows) {
    return (Array.isArray(rows) ? rows : [])
        .filter(r => r && typeof r.product === 'string' && r.product.trim().length > 0)
        .map((r, i) => ({
            rank: r.rank ?? i + 1,
            product: r.product.trim(),
            hsCode: r.hsCode?.trim() || '',
            value: parseDecimal(r.value) ?? 0,
        }));
}

// GET /api/countries/[country]
export async function GET(req, { params }) {
    const { country } = await params;
    const countryName = decodeURIComponent(country);

    const profile = await prisma.countryProfile.findUnique({
        where: { country: countryName },
    });

    if (!profile) {
        return NextResponse.json({ profile: null }, { status: 200 });
    }

    return NextResponse.json({
        profile: {
            ...profile,
            topImportsFromWorld: parseJson(profile.topImportsFromWorld),
            topImportsFromPakistan: parseJson(profile.topImportsFromPakistan),
        },
    });
}

// PUT /api/countries/[country]  (upsert)
export async function PUT(req, { params }) {
    const { country } = await params;
    const countryName = decodeURIComponent(country);
    const body = await req.json();

    const topImportsFromWorld = sanitiseRows(body.topImportsFromWorld);
    const topImportsFromPakistan = sanitiseRows(body.topImportsFromPakistan);

    const data = {
        overview: body.overview?.trim() || null,
        population: body.population?.trim() || null,
        gdp: body.gdp?.trim() || null,
        currency: body.currency?.trim() || null,
        additionalNotes: body.additionalNotes?.trim() || null,
        topImportsFromWorld,
        otherImportsFromWorldValue: parseDecimal(body.otherImportsFromWorldValue),
        topImportsFromPakistan,
        otherImportsFromPakistanValue: parseDecimal(body.otherImportsFromPakistanValue),
    };

    const profile = await prisma.countryProfile.upsert({
        where: { country: countryName },
        update: data,
        create: { country: countryName, ...data },
    });

    return NextResponse.json({
        profile: {
            ...profile,
            topImportsFromWorld: parseJson(profile.topImportsFromWorld),
            topImportsFromPakistan: parseJson(profile.topImportsFromPakistan),
        },
    });
}
