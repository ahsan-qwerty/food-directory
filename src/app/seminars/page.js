'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_CONFIG = {
    PLANNED: {
        badge: 'badge-green border border-blue-500/40 text-blue-300',
        dot: 'bg-blue-400',
        stat: 'text-blue-300',
        label: 'Planned',
    },
    COMPLETED: {
        badge: 'badge-green',
        dot: 'bg-green-400',
        stat: 'text-accent-green',
        label: 'Completed',
    },
    CANCELLED: {
        badge: 'bg-red-500/20 border border-red-400/40 text-red-300',
        dot: 'bg-red-400',
        stat: 'text-red-400',
        label: 'Cancelled',
    },
};

function StatusBadge({ status }) {
    const c = STATUS_CONFIG[status] || STATUS_CONFIG.PLANNED;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

function SeminarCard({ seminar, onDelete }) {
    return (
        <div className="glass-card flex flex-col overflow-hidden">
            {/* Card header */}
            <div
                className="px-5 py-4 text-white rounded-t-lg"
                style={{ background: 'linear-gradient(135deg, var(--brand-green) 0%, var(--brand-blue) 100%)', borderBottom: '1px solid rgba(249,115,22,0.25)' }}
            >
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-snug line-clamp-2">{seminar.title}</h3>
                    <StatusBadge status={seminar.status} />
                </div>
                {seminar.productSector && (
                    <p className="text-secondary text-xs mt-1 font-medium">{seminar.productSector}</p>
                )}
            </div>

            {/* Card body */}
            <div className="px-5 py-4 flex-1 space-y-2 text-sm text-secondary">
                {seminar.cityVenue && (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{seminar.cityVenue}</span>
                    </div>
                )}

                {seminar.tentativeDate && (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{seminar.tentativeDate}</span>
                    </div>
                )}

                {seminar.proposedBudget != null && (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.077 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.077-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-white">PKR {Number(seminar.proposedBudget).toLocaleString('en-PK')}</span>
                    </div>
                )}

                {seminar.division && (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" />
                        </svg>
                        <span>{seminar.division}</span>
                    </div>
                )}

                {seminar.rationaleObjective && (
                    <p className="text-muted text-xs leading-relaxed line-clamp-2 pt-1 border-t glass-divider">
                        {seminar.rationaleObjective}
                    </p>
                )}
            </div>

            {/* Card footer */}
            <div className="px-5 py-3 border-t glass-divider flex gap-2">
                <Link
                    href={`/seminars/${seminar.id}`}
                    className="flex-1 text-center text-sm font-medium text-accent-blue hover:text-blue-300 transition-colors"
                >
                    View Details
                </Link>
                <Link
                    href={`/seminars/${seminar.id}/edit`}
                    className="flex-1 text-center text-sm font-medium text-accent-blue hover:text-blue-300 transition-colors"
                >
                    Edit
                </Link>
                <button
                    onClick={() => onDelete(seminar)}
                    className="flex-1 text-center text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function SeminarsPage() {
    const router = useRouter();
    const [seminars, setSeminars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchSeminars = async (status) => {
        setLoading(true);
        try {
            const params = status && status !== 'ALL' ? `?status=${status}` : '';
            const res = await fetch(`/api/seminars${params}`);
            const data = await res.json();
            setSeminars(data.seminars || []);
        } catch (err) {
            console.error('Error fetching seminars:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeminars(filterStatus);
    }, [filterStatus]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/seminars?id=${deleteTarget.id}`, { method: 'DELETE' });
            if (res.ok) {
                setSeminars((prev) => prev.filter((s) => s.id !== deleteTarget.id));
                setDeleteTarget(null);
            }
        } catch (err) {
            console.error('Error deleting seminar:', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    const counts = {
        PLANNED: seminars.filter((s) => s.status === 'PLANNED').length,
        COMPLETED: seminars.filter((s) => s.status === 'COMPLETED').length,
        CANCELLED: seminars.filter((s) => s.status === 'CANCELLED').length,
    };

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8">

                {/* Page Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Seminars &amp; Webinars
                        </h1>
                        <p className="text-secondary">
                            Local exhibitions, seminars, and workshops by the Agro &amp; Food Division
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/seminars/create')}
                        className="btn-primary px-6 py-2 whitespace-nowrap"
                    >
                        + Add Seminar
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Planned', key: 'PLANNED', color: 'text-blue-300' },
                        { label: 'Completed', key: 'COMPLETED', color: 'text-accent-green' },
                        { label: 'Cancelled', key: 'CANCELLED', color: 'text-red-400' },
                    ].map(({ label, key, color }) => (
                        <div key={key} className="glass-card p-4 text-center">
                            <div className={`text-3xl font-bold ${color}`}>{counts[key]}</div>
                            <div className="text-secondary text-sm mt-1">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter bar */}
                <div className="glass-card p-4 mb-6 flex flex-wrap gap-4 items-center">
                    <label className="text-sm font-medium text-secondary">Filter by Status:</label>
                    <div className="flex flex-wrap gap-2">
                        {['ALL', 'PLANNED', 'COMPLETED', 'CANCELLED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === s
                                    ? 'btn-primary text-white'
                                    : 'bg-white/10 text-secondary hover:bg-white/15 hover:text-white'
                                    }`}
                            >
                                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <span className="ml-auto text-sm text-muted">
                        Showing <span className="font-semibold text-white">{seminars.length}</span> seminar{seminars.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Grid / Loading / Empty */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner" />
                        <p className="mt-4 text-secondary">Loading seminars…</p>
                    </div>
                ) : seminars.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.30)' }}>
                            <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <p className="text-white text-lg font-medium">No seminars found.</p>
                        <p className="text-muted text-sm mt-1">
                            {filterStatus !== 'ALL' ? 'Try changing the status filter.' : 'Click "+ Add Seminar" to create one.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {seminars.map((seminar) => (
                            <SeminarCard key={seminar.id} seminar={seminar} onDelete={setDeleteTarget} />
                        ))}
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="glass-card-strong p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-white mb-2">Delete Seminar</h3>
                        <p className="text-secondary mb-6">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-white">&ldquo;{deleteTarget.title}&rdquo;</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleteLoading}
                                className="btn-outline px-4 py-2 text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {deleteLoading ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
