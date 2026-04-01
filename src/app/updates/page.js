import Link from 'next/link';
import Image from 'next/image';
import customer_advisory from '../../../public/update/customer_advisory.jpeg';

export const metadata = {
    title: 'Updates – TDAP Food Directory',
    description: 'Latest freight, logistics, and trade updates.',
};

const UPDATES = [
    {
        id: 'advisory-2026-04-01',
        type: 'Advisory',
        title: 'Customer Advisory: Withholding of Ad-hoc Charges',
        date: '2026-04-01',
        href: '/updates#advisory-2026-04-01',
        image: customer_advisory,
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
                            </div>


                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}

