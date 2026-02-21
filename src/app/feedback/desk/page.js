import { Suspense } from 'react';
import DeskClosingClient from './DeskClosingClient';

export default function DeskClosingPage() {
    return (
        <Suspense
            fallback={
                <div className="page-wrapper flex items-center justify-center">
                    <div className="glass-card p-8 text-center">
                        <p className="text-secondary">Loading closing form…</p>
                    </div>
                </div>
            }
        >
            <DeskClosingClient />
        </Suspense>
    );
}

