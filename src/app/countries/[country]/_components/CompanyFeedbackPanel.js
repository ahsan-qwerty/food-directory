'use client';

import { useState, useEffect, useCallback } from 'react';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(dateValue) {
    // dateValue may be ISO string or Date
    const d = new Date(dateValue);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/* ─── CompanyFeedbackPanel ────────────────────────────────────────────────── */
export default function CompanyFeedbackPanel({ companyId, companyName }) {
    const [open, setOpen] = useState(false);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    // Form state
    const [formOpen, setFormOpen] = useState(false);
    const [date, setDate] = useState(todayString);
    const [text, setText] = useState('');
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Delete state
    const [deletingId, setDeletingId] = useState(null);
    const [deleteCode, setDeleteCode] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/companies/${companyId}/daily-feedback`);
            const data = await res.json();
            setEntries(data.entries || []);
        } catch {
            setEntries([]);
        } finally {
            setLoading(false);
            setFetched(true);
        }
    }, [companyId]);

    function handleToggleOpen() {
        const next = !open;
        setOpen(next);
        if (next && !fetched) fetchEntries();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/companies/${companyId}/daily-feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationCode: code, date, text }),
            });
            const data = await res.json();
            if (res.ok) {
                setEntries(prev => {
                    const next = [data.entry, ...prev];
                    // keep sorted by date desc
                    next.sort((a, b) => new Date(b.date) - new Date(a.date));
                    return next;
                });
                setFormSuccess('Feedback recorded successfully.');
                setText('');
                setCode('');
                setDate(todayString());
                setFormOpen(false);
            } else {
                setFormError(data.error || 'Failed to save feedback.');
            }
        } catch {
            setFormError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(entryId) {
        if (!deleteCode.trim()) {
            setDeleteError('Enter your registration code to confirm deletion.');
            return;
        }
        setDeleteError('');
        try {
            const res = await fetch(`/api/companies/${companyId}/daily-feedback/${entryId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationCode: deleteCode }),
            });
            const data = await res.json();
            if (res.ok) {
                setEntries(prev => prev.filter(e => e.id !== entryId));
                setDeletingId(null);
                setDeleteCode('');
            } else {
                setDeleteError(data.error || 'Failed to delete.');
            }
        } catch {
            setDeleteError('Network error. Please try again.');
        }
    }

    return (
        <div className="mt-2 border-t border-white/10 pt-2">
            {/* Toggle button */}
            <button
                type="button"
                onClick={handleToggleOpen}
                className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-white transition-colors py-0.5"
            >
                <svg
                    className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Daily Feedback Log
                {fetched && entries.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        {entries.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="mt-3 space-y-3">
                    {/* Add new entry button */}
                    {!formOpen && (
                        <button
                            type="button"
                            onClick={() => { setFormOpen(true); setFormError(''); setFormSuccess(''); }}
                            className="flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Feedback Entry
                        </button>
                    )}

                    {/* Add form */}
                    {formOpen && (
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 space-y-2"
                        >
                            <p className="text-xs font-semibold text-sky-300 mb-1">New Feedback Entry</p>

                            {/* Date */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-muted w-16 shrink-0">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required
                                    className="glass-input px-2 py-1 text-xs flex-1"
                                />
                            </div>

                            {/* Feedback text */}
                            <div>
                                <label className="text-xs text-muted block mb-1">What happened / Activity</label>
                                <textarea
                                    rows={3}
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder={`Describe the day's activity for ${companyName}…`}
                                    required
                                    className="glass-input w-full px-2 py-1.5 text-xs"
                                />
                            </div>

                            {/* Registration code */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-muted w-16 shrink-0">Auth Code</label>
                                <input
                                    type="password"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    placeholder="Company registration code"
                                    required
                                    autoComplete="off"
                                    className="glass-input px-2 py-1 text-xs flex-1 font-mono"
                                />
                            </div>

                            {formError && <p className="text-xs text-red-400">{formError}</p>}

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-3 py-1 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? 'Saving…' : 'Save Entry'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setFormOpen(false); setFormError(''); }}
                                    className="px-3 py-1 text-xs font-medium rounded-md border border-white/20 text-muted hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {formSuccess && (
                        <p className="text-xs text-green-400">{formSuccess}</p>
                    )}

                    {/* Entries list */}
                    {loading && (
                        <p className="text-xs text-muted italic">Loading…</p>
                    )}

                    {!loading && fetched && entries.length === 0 && (
                        <p className="text-xs text-muted italic">No feedback entries yet.</p>
                    )}

                    {entries.length > 0 && (
                        <div className="space-y-2">
                            {entries.map(entry => (
                                <div
                                    key={entry.id}
                                    className="rounded-lg border border-white/10 bg-white/3 px-3 py-2.5"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-xs font-semibold text-amber-300 shrink-0">
                                            {fmtDate(entry.date)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (deletingId === entry.id) {
                                                    setDeletingId(null);
                                                    setDeleteCode('');
                                                    setDeleteError('');
                                                } else {
                                                    setDeletingId(entry.id);
                                                    setDeleteCode('');
                                                    setDeleteError('');
                                                }
                                            }}
                                            className="text-muted hover:text-red-400 transition-colors shrink-0"
                                            title="Delete entry"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-secondary mt-1 leading-relaxed whitespace-pre-wrap">{entry.text}</p>

                                    {/* Delete confirmation inline */}
                                    {deletingId === entry.id && (
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <input
                                                type="password"
                                                value={deleteCode}
                                                onChange={e => setDeleteCode(e.target.value)}
                                                placeholder="Enter code to confirm"
                                                autoComplete="off"
                                                className="glass-input px-2 py-0.5 text-xs font-mono w-44"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(entry.id)}
                                                className="px-2 py-0.5 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                                            >
                                                Confirm Delete
                                            </button>
                                            {deleteError && (
                                                <span className="text-xs text-red-400">{deleteError}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
