import { Suspense } from 'react';
import CompanyFeedbackClient from './CompanyFeedbackClient';

export default function CompanyFeedbackPage() {
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
            <CompanyFeedbackClient />
        </Suspense>
    );
}

