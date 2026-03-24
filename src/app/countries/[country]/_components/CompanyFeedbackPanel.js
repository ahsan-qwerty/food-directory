'use client';

import { useState, useCallback } from 'react';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(dateValue) {
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

function isSameDay(dateValue) {
    const d = new Date(dateValue);
    const today = new Date();
    return (
        d.getUTCFullYear() === today.getFullYear() &&
        d.getUTCMonth() === today.getMonth() &&
        d.getUTCDate() === today.getDate()
    );
}

/* ─── CompanyFeedbackPanel ────────────────────────────────────────────────── */
export default function CompanyFeedbackPanel({ companyId, companyName }) {
    const [open, setOpen] = useState(false);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    // History toggle
    const [historyOpen, setHistoryOpen] = useState(false);

    // Delete state
    const [deletingId, setDeletingId] = useState(null);
    const [deleteCode, setDeleteCode] = useState('');
    const [deleteError, setDeleteError] = useState('');

    // Send link panel
    const [sendOpen, setSendOpen] = useState(false);
    const [sendCode, setSendCode] = useState('');
    const [sendEmail, setSendEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');

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

    async function handleSendLink(e) {
        e.preventDefault();
        setSendError('');
        setSendSuccess('');
        setSending(true);
        try {
            const res = await fetch(`/api/companies/${companyId}/send-feedback-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    registrationCode: sendCode,
                    recipientEmail: sendEmail || undefined,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSendSuccess(`Email sent to ${data.sentTo}`);
                setSendCode('');
                setSendEmail('');
            } else {
                setSendError(data.error || 'Failed to send email.');
            }
        } catch {
            setSendError('Network error. Please try again.');
        } finally {
            setSending(false);
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

    // Derived: split entries into today vs history
    const todayEntry = entries.find(e => isSameDay(e.date)) || null;
    const historyEntries = entries.filter(e => !isSameDay(e.date));

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
                Daily Feedback
                {fetched && entries.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        {entries.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="mt-3 space-y-3">
                    {loading && (
                        <p className="text-xs text-muted italic">Loading…</p>
                    )}

                    {!loading && fetched && (
                        <>
                            {/* ── TODAY'S FEEDBACK ─────────────────────────────── */}
                            <div className="rounded-lg border border-white/10 bg-white/3 p-3">
                                {/* Header row */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-amber-300">
                                        Today — {fmtDate(todayString() + 'T00:00:00Z')}
                                    </span>
                                    {todayEntry && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (deletingId === todayEntry.id) {
                                                    setDeletingId(null); setDeleteCode(''); setDeleteError('');
                                                } else {
                                                    setDeletingId(todayEntry.id); setDeleteCode(''); setDeleteError('');
                                                }
                                            }}
                                            className="text-muted hover:text-red-400 transition-colors"
                                            title="Delete today's entry"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {todayEntry ? (
                                    <>
                                        <p className="text-xs text-secondary leading-relaxed whitespace-pre-wrap">
                                            {todayEntry.text}
                                        </p>
                                        {deletingId === todayEntry.id && (
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
                                                    onClick={() => handleDelete(todayEntry.id)}
                                                    className="px-2 py-0.5 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                >
                                                    Confirm Delete
                                                </button>
                                                {deleteError && <span className="text-xs text-red-400">{deleteError}</span>}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xs text-muted italic">No feedback submitted for today yet.</p>
                                )}
                            </div>

                            {/* ── SEND FEEDBACK LINK ───────────────────────────── */}
                            <div>
                                {!sendOpen ? (
                                    <button
                                        type="button"
                                        onClick={() => { setSendOpen(true); setSendError(''); setSendSuccess(''); }}
                                        className="flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Send Feedback Link to Company
                                    </button>
                                ) : (
                                    <form
                                        onSubmit={handleSendLink}
                                        className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 space-y-2"
                                    >
                                        <p className="text-xs font-semibold text-sky-300">
                                            Send feedback form link to <span className="text-white">{companyName}</span>
                                        </p>

                                        {/* Optional override email */}
                                        <div>
                                            <label className="text-xs text-muted block mb-0.5">
                                                Recipient Email <span className="opacity-60">(optional — uses company email if blank)</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={sendEmail}
                                                onChange={e => setSendEmail(e.target.value)}
                                                placeholder="override@example.com"
                                                autoComplete="off"
                                                className="glass-input w-full px-2 py-1 text-xs"
                                            />
                                        </div>

                                        {/* Auth code */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="password"
                                                value={sendCode}
                                                onChange={e => setSendCode(e.target.value)}
                                                placeholder="Your registration code"
                                                required
                                                autoComplete="off"
                                                className="glass-input flex-1 px-2 py-1 text-xs font-mono"
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending}
                                                className="px-3 py-1 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors whitespace-nowrap"
                                            >
                                                {sending ? 'Sending…' : 'Send Email'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setSendOpen(false); setSendError(''); setSendSuccess(''); }}
                                                className="px-2 py-1 text-xs text-muted hover:text-white transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {sendError && <p className="text-xs text-red-400">{sendError}</p>}
                                        {sendSuccess && <p className="text-xs text-green-400">{sendSuccess}</p>}
                                    </form>
                                )}
                            </div>

                            {/* ── HISTORY ──────────────────────────────────────── */}
                            {historyEntries.length > 0 && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setHistoryOpen(p => !p)}
                                        className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
                                    >
                                        <svg
                                            className={`w-3 h-3 transition-transform ${historyOpen ? 'rotate-90' : ''}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        History
                                        <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/10 text-[10px] font-bold">
                                            {historyEntries.length}
                                        </span>
                                    </button>

                                    {historyOpen && (
                                        <div className="mt-2 space-y-2">
                                            {historyEntries.map(entry => (
                                                <div
                                                    key={entry.id}
                                                    className="rounded-lg border border-white/10 bg-white/3 px-3 py-2.5"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="text-xs font-semibold text-amber-300/70 shrink-0">
                                                            {fmtDate(entry.date)}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (deletingId === entry.id) {
                                                                    setDeletingId(null); setDeleteCode(''); setDeleteError('');
                                                                } else {
                                                                    setDeletingId(entry.id); setDeleteCode(''); setDeleteError('');
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
                                                    <p className="text-xs text-secondary mt-1 leading-relaxed whitespace-pre-wrap">
                                                        {entry.text}
                                                    </p>
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
                                                            {deleteError && <span className="text-xs text-red-400">{deleteError}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
