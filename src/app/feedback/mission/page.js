import { Suspense } from 'react';
import MissionFeedbackClient from './MissionFeedbackClient';

export default function MissionFeedbackPage() {
    return (
        <Suspense
            fallback={
                <div className="page-wrapper flex items-center justify-center">
                    <div className="glass-card p-8 text-center">
                        <p className="text-secondary">Loading feedback form…</p>
                    </div>
                </div>
            }
        >
            <MissionFeedbackClient />
        </Suspense>
    );
}

