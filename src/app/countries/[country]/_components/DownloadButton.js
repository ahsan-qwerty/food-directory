'use client';

import { useState } from 'react';

export default function DownloadButton({ url, filename, label, variant = 'blue', className = '' }) {
    const [loading, setLoading] = useState(false);

    const colorMap = {
        blue: {
            base: 'bg-blue-600 hover:bg-blue-700 text-white',
            busy: 'bg-blue-500 text-white cursor-wait',
        },
        purple: {
            base: 'bg-purple-600 hover:bg-purple-700 text-white',
            busy: 'bg-purple-500 text-white cursor-wait',
        },
        teal: {
            base: 'bg-teal-600 hover:bg-teal-700 text-white',
            busy: 'bg-teal-500 text-white cursor-wait',
        },
        orange: {
            base: 'bg-orange-600 hover:bg-orange-700 text-white',
            busy: 'bg-orange-500 text-white cursor-wait',
        },
    };
    const colors = colorMap[variant] ?? colorMap.blue;

    async function handleClick() {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(url);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert(body.error || 'Failed to generate PDF. Please try again.');
                return;
            }
            const blob = await res.blob();
            const href = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = href;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(href);
        } catch {
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-60 ${loading ? colors.busy : colors.base} ${className}`}
        >
            {loading ? (
                <svg className="animate-spin h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )}
            {loading ? 'Generating…' : label}
        </button>
    );
}
