


import Link from 'next/link';
import Image from 'next/image';
import customer_advisory from '../../../public/update/customer_advisory.jpeg';

export const metadata = {
    title: 'Updates – TDAP Food Directory',
    description: 'Latest freight, logistics, and trade updates.',
};

const UPDATES = [
    {
        id: 'cargo-ssf-valence-v0074',
        type: 'Cargo',
        title: 'Cargo Update – SSF VALENCE V-0074 (KGTL)',
        date: '2026-04-18',
        href: '/updates#cargo-ssf-valence-v0074',
        notice: {
            intro:
                'Please be advised of the following cargo summary for SSF VALENCE V-0074 (KGTL):',
            rows: [
                { label: 'Total volume', value: '~500 TEUs' },
                { label: 'Port of discharge (POD)', value: 'SAJED (JEDDAH)' },
                { label: 'Tentative ETD', value: '21 April 2026' },
            ],
            focalPoint: {
                heading: 'Focal point',
                name: 'Mr. Kamal Siddiqui',
                phone: '+92 301 8251373',
            },
        },
    },
    {
        id: 'oict-tariff-book-2026',
        type: 'Tariff',
        title: 'OICT Tariff Book 2026 v1.0',
        date: '2026-04-09',
        href: '/update/OICT-Tariff-Book-2026-v1.0.pdf',
        fileType: 'pdf',
    },
    {
        id: 'advisory-2026-04-01',
        type: 'Advisory',
        title: 'Customer Advisory: Withholding of Ad-hoc Charges',
        date: '2026-04-01',
        href: '/updates#advisory-2026-04-01',
        image: customer_advisory,
    },
    {
        id: 'uae-alt-routes-2026-04-06',
        type: 'Freight',
        title: 'UAE Alternate Trade Routes',
        date: '2026-04-06',
        href: '/update/UAE Alternate Trade Routes_06-04-2026.pdf',
        fileType: 'pdf',
    },
];

export default function UpdatesPage() {
    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Updates</h1>
                    <p className="text-secondary">Freight, logistics, and trade advisories.</p>
                </div>

                <div className="space-y-6">
                    {UPDATES.map(u => (
                        <section
                            key={u.id}
                            id={u.id}
                            className="glass-card p-6"
                        >
                            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                                <div>
                                    <p className="text-xs font-semibold text-muted uppercase tracking-wide">{u.type} · {u.date}</p>
                                    <h2 className="text-xl font-bold text-white mt-1">{u.title}</h2>
                                </div>
                                <Link
                                    href="/"
                                    className="text-sm text-accent-green hover:underline"
                                >
                                    Back to Home
                                </Link>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
                                {u.fileType === 'pdf' ? (
                                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-white font-semibold">PDF Document</p>
                                            <p className="text-xs text-muted mt-1">Click below to open/download.</p>
                                        </div>
                                        <a
                                            href={encodeURI(u.href)}
                                            download
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download PDF
                                        </a>
                                    </div>
                                ) : u.notice ? (
                                    <div className="p-6 space-y-6 text-secondary">
                                        <p className="text-sm text-white/90 leading-relaxed">{u.notice.intro}</p>
                                        <div className="space-y-3">
                                            {u.notice.rows.map((row) => (
                                                <div
                                                    key={row.label}
                                                    className="flex flex-col sm:flex-row sm:gap-6 sm:items-baseline border-b border-white/5 pb-3 last:border-0 last:pb-0"
                                                >
                                                    <span className="text-xs font-semibold text-muted uppercase tracking-wide shrink-0 sm:w-52">
                                                        {row.label}
                                                    </span>
                                                    <span className="text-sm text-white">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                                                {u.notice.focalPoint.heading}
                                            </p>
                                            <p className="text-sm text-white font-medium">{u.notice.focalPoint.name}</p>
                                            <a
                                                href={`tel:${u.notice.focalPoint.phone.replace(/\s/g, '')}`}
                                                className="text-sm text-accent-green hover:underline mt-1 inline-block"
                                            >
                                                {u.notice.focalPoint.phone}
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-full" style={{ aspectRatio: '3 / 4' }}>
                                        <Image
                                            src={u.image}
                                            alt={u.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 800px"
                                            className="object-contain bg-black/20"
                                            priority
                                        />
                                    </div>
                                )}
                            </div>


                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}

