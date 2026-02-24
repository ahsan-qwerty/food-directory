'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteEventButton({ eventId, eventName }) {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        try {
            const res = await fetch(`/api/events?id=${eventId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to delete event');
                setDeleting(false);
                setConfirming(false);
                return;
            }
            router.push('/events');
            router.refresh();
        } catch {
            setError('Failed to delete event');
            setDeleting(false);
            setConfirming(false);
        }
    };

    if (!confirming) {
        return (
            <button
                onClick={() => setConfirming(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors w-full justify-center"
            >
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Event
            </button>
        );
    }

    return (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
            <p className="text-xs text-red-800 font-medium">
                Permanently delete <span className="font-bold">&quot;{eventName}&quot;</span>? This cannot be undone.
            </p>
            {error && (
                <p className="text-xs text-red-700">{error}</p>
            )}
            <div className="flex gap-2">
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-60"
                >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                    onClick={() => { setConfirming(false); setError(null); }}
                    disabled={deleting}
                    className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 disabled:opacity-60"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
