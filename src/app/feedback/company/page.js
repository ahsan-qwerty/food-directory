import { Suspense } from 'react';
import CompanyFeedbackClient from './CompanyFeedbackClient';

export default function CompanyFeedbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 px-4">
                    <main className="container mx-auto px-4 py-8 max-w-xl">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-600">Loading feedback form…</p>
                        </div>
                    </main>
                </div>
            }
        >
            <CompanyFeedbackClient />
        </Suspense>
    );
}

