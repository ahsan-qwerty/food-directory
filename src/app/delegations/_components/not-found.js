import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="page-wrapper flex items-center justify-center px-4">
            <div className="glass-card p-12 text-center max-w-lg w-full">
                <h1 className="text-6xl font-bold text-accent-green mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-white mb-3">Delegation Not Found</h2>
                <p className="text-secondary mb-8">
                    The delegation you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Link href="/delegations" className="btn-primary px-6 py-3 inline-block">
                    View All Delegations
                </Link>
            </div>
        </div>
    );
}
